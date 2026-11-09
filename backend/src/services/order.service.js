const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const CustomDesign = require('../models/CustomDesign');
const Order = require('../models/Order');
const LandingContent = require('../models/LandingContent');
const env = require('../config/env');
const { buildVietQrImageUrl } = require('../config/assets');
const { BASE_COLORS } = require('../config/theme');
const { getMessage } = require('../i18n/messages');
const AppError = require('../utils/AppError');
const { calculateDesignBOM } = require('./pricing.service');

// BR-05: Allowed State Machine Transitions
const ALLOWED_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'in_crafting', 'cancelled'],
  confirmed: ['in_crafting', 'cancelled'],
  in_crafting: ['quality_check'],
  quality_check: ['shipping', 'in_crafting'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: [],
};

// Statuses where cancellation is strictly forbidden (BR-05)
const NON_CANCELLABLE_STATUSES = ['in_crafting', 'quality_check', 'shipping', 'delivered'];

/**
 * BR-10: Generate unique order code DTU-YYYYMMDD-XXXX
 */
const generateOrderCode = async () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let attempt = 0; attempt < 10; attempt++) {
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `DTU-${yyyy}${mm}${dd}-${suffix}`;
    const exists = await Order.exists({ orderCode: code });
    if (!exists) return code;
  }
  return `DTU-${yyyy}${mm}${dd}-${Date.now().toString().slice(-4)}`;
};

/**
 * Build VietQR info (BR-10) using centralized env & assets config
 */
const buildVietQrInfo = (orderCode, totalAmount) => {
  const qrImageUrl = buildVietQrImageUrl({
    bankId: env.VIETQR_BANK_ID,
    accountNo: env.VIETQR_ACCOUNT_NO,
    template: env.VIETQR_TEMPLATE,
    amount: totalAmount,
    transferContent: orderCode,
    accountName: env.VIETQR_ACCOUNT_NAME,
  });

  return {
    bankId: env.VIETQR_BANK_ID,
    bankName: env.VIETQR_BANK_NAME,
    accountNo: env.VIETQR_ACCOUNT_NO,
    accountName: env.VIETQR_ACCOUNT_NAME,
    amount: totalAmount,
    transferContent: orderCode,
    qrImageUrl,
  };
};

/**
 * BR-04 & BR-07: Create Order with Atomic Dual-Inventory Validation & Deduction
 * + Immutable 3D Snapshot & BOM Summary
 */
const createOrder = async (payload, user = null, lang = 'vi') => {
  const { customerInfo, items, paymentMethod = 'cod' } = payload;

  if (!customerInfo || !customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
    throw new AppError(getMessage('INVALID_CUSTOMER_INFO', {}, lang), 400, 'INVALID_CUSTOMER_INFO');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(getMessage('EMPTY_ORDER_ITEMS', {}, lang), 400, 'EMPTY_ORDER_ITEMS');
  }

  // Aggregate total required stock per Product and per CustomMaterial across the entire order (BR-04)
  const productDemandMap = new Map(); // productId -> { product, totalQty }
  const materialDemandMap = new Map(); // materialId -> { name, code, totalQty }
  const preparedOrderItems = [];

  let subtotal = 0;
  let totalNetWeightGrams = 0;

  for (let i = 0; i < items.length; i++) {
    const rawItem = items[i];
    const quantity = parseInt(rawItem.quantity || 1, 10);
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new AppError(getMessage('INVALID_QUANTITY', { index: i + 1 }, lang), 400, 'INVALID_QUANTITY');
    }

    let productId = rawItem.productId;
    let savedDesign = null;

    if (rawItem.customDesignId) {
      savedDesign = await CustomDesign.findById(rawItem.customDesignId).lean();
      if (!savedDesign) {
        throw new AppError(getMessage('DESIGN_NOT_FOUND', {}, lang), 404, 'DESIGN_NOT_FOUND');
      }
      if (!productId) {
        productId = savedDesign.productId;
      }
    }

    if (!productId) {
      throw new AppError(getMessage('MISSING_PRODUCT_ID', {}, lang), 400, 'MISSING_PRODUCT_ID');
    }

    const product = await Product.findById(productId).lean();
    if (!product || !product.isActive) {
      throw new AppError(
        getMessage('PRODUCT_UNAVAILABLE', { name: product ? product.name : productId }, lang),
        400,
        'PRODUCT_UNAVAILABLE'
      );
    }

    // Accumulate Product stock demand
    const prodKey = String(product._id);
    const prevProdDemand = productDemandMap.get(prodKey)?.totalQty || 0;
    productDemandMap.set(prodKey, {
      product,
      totalQty: prevProdDemand + quantity,
    });

    // Determine whether this order item is a Custom 3D item
    const hasCustomInline =
      rawItem.isCustom === true ||
      Boolean(rawItem.customDesignId) ||
      Boolean(rawItem.customDesign) ||
      Boolean(rawItem.customDesignSnapshot) ||
      (Array.isArray(rawItem.placements) && rawItem.placements.length > 0);

    if (hasCustomInline) {
      const inlineConfig = rawItem.customDesign || rawItem.customDesignSnapshot || {};
      const placementsInput =
        rawItem.placements ||
        inlineConfig.placements ||
        (savedDesign ? savedDesign.placements : []);

      // Recalculate BOM from DB (BR-01)
      const bomCalc = await calculateDesignBOM({
        productId: product._id,
        placements: placementsInput,
        lang,
      });

      const baseColor =
        rawItem.selectedColor ||
        inlineConfig.baseColor ||
        (savedDesign ? savedDesign.baseColor : product.model3D?.defaultBaseColor || BASE_COLORS.OCEAN_TEAL);

      const strapColor =
        rawItem.selectedStrapColor ||
        inlineConfig.strapColor ||
        (savedDesign ? savedDesign.strapColor : product.model3D?.defaultStrapColor || BASE_COLORS.ROPE_NATURAL);

      const selectedSize =
        rawItem.selectedSize ||
        inlineConfig.size ||
        (savedDesign ? savedDesign.size : product.availableSizes?.[0] || 'Tiêu chuẩn');

      // Accumulate Material stock demand multiplied by orderItem.quantity (BR-04)
      const orderItemBomSummary = bomCalc.bomSummary.map((bomItem) => {
        const matKey = String(bomItem.materialId);
        const requiredForThisLine = bomItem.quantity * quantity;
        const prevMatDemand = materialDemandMap.get(matKey)?.totalQty || 0;

        materialDemandMap.set(matKey, {
          materialId: bomItem.materialId,
          name: bomItem.name,
          code: bomItem.code,
          totalQty: prevMatDemand + requiredForThisLine,
          availableStock: bomItem.availableStock,
        });

        return {
          materialId: bomItem.materialId,
          code: bomItem.code,
          name: bomItem.name,
          materialType: bomItem.materialType,
          meshPreset: bomItem.meshPreset,
          unitPrice: bomItem.unitPrice,
          quantityPerItem: bomItem.quantity,
          totalQuantity: requiredForThisLine,
          subtotal: bomItem.unitPrice * requiredForThisLine,
        };
      });

      const unitPrice = bomCalc.pricingBreakdown.estimatedPrice;
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      const itemEcoGrams = (product.ecoImpact?.netWeightGrams || 150) * quantity;
      totalNetWeightGrams += itemEcoGrams;

      // BR-07: Immutable customDesignSnapshot
      preparedOrderItems.push({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        category: product.category,
        thumbnail: product.thumbnail,
        model3D: {
          meshPreset: product.model3D?.meshPreset || 'tote_bag',
          glbUrl: product.model3D?.glbUrl || '',
        },
        quantity,
        selectedColor: baseColor,
        selectedStrapColor: strapColor,
        selectedSize,
        isCustom: true,
        customDesignId: savedDesign ? savedDesign._id : null,
        customDesignSnapshot: {
          shareCode: savedDesign ? savedDesign.shareCode : inlineConfig.shareCode || 'CUSTOM-DIRECT',
          name: savedDesign ? savedDesign.name : inlineConfig.name || `Custom ${product.name}`,
          baseColor,
          strapColor,
          size: selectedSize,
          note: inlineConfig.note || inlineConfig.artisanNote || (savedDesign ? savedDesign.note : '') || '',
          artisanNote: inlineConfig.artisanNote || inlineConfig.note || (savedDesign ? savedDesign.note : '') || '',
          meshPreset: product.model3D?.meshPreset || 'tote_bag',
          glbUrl: product.model3D?.glbUrl || '',
          basePrice: bomCalc.pricingBreakdown.basePrice,
          craftFee: bomCalc.pricingBreakdown.craftFee,
          materialsTotal: bomCalc.pricingBreakdown.materialsTotal,
          estimatedPrice: unitPrice,
          braceletConfig:
            rawItem.braceletConfig ||
            inlineConfig.braceletConfig ||
            (savedDesign && savedDesign.braceletConfig) || {
              wristSizeCm: 16,
              slotCount: 12,
              cordMaterial: 'recycled_net_cord',
            },
          placements: bomCalc.enrichedPlacements,
        },
        bomSummary: orderItemBomSummary,
        unitPrice,
        subtotal: lineTotal,
        pricingBreakdown: {
          basePrice: bomCalc.pricingBreakdown.basePrice,
          craftFee: bomCalc.pricingBreakdown.craftFee,
          materialsTotal: bomCalc.pricingBreakdown.materialsTotal,
          unitPrice,
          lineTotal,
        },
        ecoImpactGrams: itemEcoGrams,
      });
    } else {
      // Standard Ready-to-Wear item
      const unitPrice = product.basePrice;
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      const itemEcoGrams = (product.ecoImpact?.netWeightGrams || 150) * quantity;
      totalNetWeightGrams += itemEcoGrams;

      preparedOrderItems.push({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        category: product.category,
        thumbnail: product.thumbnail,
        model3D: {
          meshPreset: product.model3D?.meshPreset || 'tote_bag',
          glbUrl: product.model3D?.glbUrl || '',
        },
        quantity,
        selectedColor: rawItem.selectedColor || product.model3D?.defaultBaseColor || BASE_COLORS.OCEAN_TEAL,
        selectedStrapColor: rawItem.selectedStrapColor || product.model3D?.defaultStrapColor || BASE_COLORS.ROPE_NATURAL,
        selectedSize: rawItem.selectedSize || product.availableSizes?.[0] || 'Tiêu chuẩn',
        isCustom: false,
        customDesignId: null,
        customDesignSnapshot: null,
        bomSummary: [],
        unitPrice,
        subtotal: lineTotal,
        pricingBreakdown: {
          basePrice: unitPrice,
          craftFee: 0,
          materialsTotal: 0,
          unitPrice,
          lineTotal,
        },
        ecoImpactGrams: itemEcoGrams,
      });
    }
  }

  // BR-04 Step 1: Validate all Product stocks before touching the database
  for (const [, { product, totalQty }] of productDemandMap.entries()) {
    if (product.stock < totalQty) {
      throw new AppError(
        getMessage(
          'INSUFFICIENT_PRODUCT_STOCK',
          { name: product.name, required: totalQty, available: product.stock },
          lang
        ),
        400,
        'INSUFFICIENT_PRODUCT_STOCK',
        { productId: product._id, productName: product.name, required: totalQty, available: product.stock }
      );
    }
  }

  // BR-04 Step 2: Validate all CustomMaterial stocks before touching the database
  for (const [, matDemand] of materialDemandMap.entries()) {
    const freshMat = await CustomMaterial.findById(matDemand.materialId).lean();
    if (!freshMat || !freshMat.isActive) {
      throw new AppError(
        getMessage('MATERIAL_UNAVAILABLE', { name: matDemand.name }, lang),
        400,
        'MATERIAL_UNAVAILABLE'
      );
    }
    if (freshMat.stockQuantity < matDemand.totalQty) {
      throw new AppError(
        getMessage(
          'INSUFFICIENT_MATERIAL_STOCK',
          {
            name: freshMat.name,
            code: freshMat.code,
            required: matDemand.totalQty,
            available: freshMat.stockQuantity,
          },
          lang
        ),
        400,
        'INSUFFICIENT_MATERIAL_STOCK',
        {
          materialId: freshMat._id,
          materialName: freshMat.name,
          materialCode: freshMat.code,
          required: matDemand.totalQty,
          available: freshMat.stockQuantity,
        }
      );
    }
  }

  // BR-04 Step 3: Atomic conditional deduction with rollback safety if concurrent modification occurs
  const deductedProducts = [];
  const deductedMaterials = [];

  try {
    for (const [prodId, { product, totalQty }] of productDemandMap.entries()) {
      const updatedProd = await Product.findOneAndUpdate(
        { _id: prodId, stock: { $gte: totalQty } },
        { $inc: { stock: -totalQty, soldCount: totalQty } },
        { new: true }
      );
      if (!updatedProd) {
        throw new AppError(
          getMessage('CONCURRENT_PRODUCT_OUT_OF_STOCK', { name: product.name, required: totalQty }, lang),
          400,
          'CONCURRENT_PRODUCT_OUT_OF_STOCK'
        );
      }
      deductedProducts.push({ productId: prodId, qty: totalQty });
    }

    for (const [matId, matDemand] of materialDemandMap.entries()) {
      const updatedMat = await CustomMaterial.findOneAndUpdate(
        { _id: matId, stockQuantity: { $gte: matDemand.totalQty } },
        { $inc: { stockQuantity: -matDemand.totalQty } },
        { new: true }
      );
      if (!updatedMat) {
        throw new AppError(
          getMessage('CONCURRENT_MATERIAL_OUT_OF_STOCK', { name: matDemand.name, required: matDemand.totalQty }, lang),
          400,
          'CONCURRENT_MATERIAL_OUT_OF_STOCK'
        );
      }
      deductedMaterials.push({ materialId: matId, qty: matDemand.totalQty });
    }
  } catch (deductErr) {
    // Rollback any already-deducted items to guarantee 100% atomicity
    for (const p of deductedProducts) {
      await Product.findByIdAndUpdate(p.productId, { $inc: { stock: p.qty, soldCount: -p.qty } });
    }
    for (const m of deductedMaterials) {
      await CustomMaterial.findByIdAndUpdate(m.materialId, { $inc: { stockQuantity: m.qty } });
    }
    throw deductErr;
  }

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const totalAmount = subtotal + shippingFee;
  const orderCode = await generateOrderCode();
  const normalizedMethod = paymentMethod === 'vietqr' ? 'vietqr' : 'cod';

  const order = await Order.create({
    orderCode,
    userId: user ? user._id : null,
    customerInfo: {
      fullName: customerInfo.fullName,
      phone: customerInfo.phone,
      email: customerInfo.email || (user ? user.email : ''),
      address: customerInfo.address,
      city: customerInfo.city || 'Đà Nẵng',
      note: customerInfo.note || '',
    },
    items: preparedOrderItems,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        note: 'Đơn hàng được khởi tạo thành công và đã giữ nguyên liệu chế tác',
        updatedBy: user ? user.fullName : customerInfo.fullName,
        updatedAt: new Date(),
      },
    ],
    paymentMethod: normalizedMethod,
    paymentStatus: 'unpaid',
    vietqrInfo: buildVietQrInfo(orderCode, totalAmount),
    subtotal,
    shippingFee,
    totalAmount,
    finalAmount: totalAmount,
    totalNetWeightGrams,
    inventoryDeducted: true,
  });

  // BR-08: Increment eco-impact counter on LandingContent
  await LandingContent.findOneAndUpdate(
    { key: 'main_landing' },
    {
      $inc: {
        'impactStats.upcycledProductsCreated': preparedOrderItems.reduce((acc, it) => acc + it.quantity, 0),
      },
    }
  );

  return order.toObject();
};

/**
 * BR-06: Rollback Product & CustomMaterial inventory when an order is cancelled
 */
const rollbackOrderInventory = async (order) => {
  if (!order.inventoryDeducted) return;

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });

    if (item.isCustom && Array.isArray(item.bomSummary)) {
      for (const bom of item.bomSummary) {
        if (bom.materialId && bom.totalQuantity > 0) {
          await CustomMaterial.findByIdAndUpdate(bom.materialId, {
            $inc: { stockQuantity: bom.totalQuantity },
          });
        }
      }
    }
  }
};

/**
 * BR-05 & BR-06: Update Order Status (Admin/Staff or Customer Cancellation)
 */
const updateOrderStatus = async ({
  orderIdOrCode,
  nextStatus,
  note = '',
  actorName = 'System',
  isCustomerCancel = false,
  phone = '',
  lang = 'vi',
}) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderIdOrCode);
  const query = isObjectId
    ? { $or: [{ _id: orderIdOrCode }, { orderCode: orderIdOrCode.toUpperCase() }] }
    : { orderCode: orderIdOrCode.toUpperCase() };

  const order = await Order.findOne(query);
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, lang), 404, 'ORDER_NOT_FOUND');
  }

  if (isCustomerCancel && phone) {
    const cleanInputPhone = String(phone).trim();
    if (cleanInputPhone && order.customerInfo.phone !== cleanInputPhone) {
      throw new AppError(getMessage('PHONE_MISMATCH', {}, lang), 403, 'PHONE_MISMATCH');
    }
  }

  const currentStatus = order.status;

  if (currentStatus === nextStatus) {
    return order.toObject();
  }

  // BR-05: Prevent cancellation once in_crafting, quality_check, shipping, or delivered
  if (nextStatus === 'cancelled') {
    if (NON_CANCELLABLE_STATUSES.includes(currentStatus)) {
      throw new AppError(
        getMessage('CANNOT_CANCEL_IN_CRAFTING', { status: currentStatus }, lang),
        400,
        'CANNOT_CANCEL_IN_CRAFTING'
      );
    }
    if (currentStatus === 'cancelled') {
      throw new AppError(getMessage('ALREADY_CANCELLED', {}, lang), 400, 'ALREADY_CANCELLED');
    }
  } else {
    const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      throw new AppError(
        getMessage(
          'INVALID_STATUS_TRANSITION',
          {
            current: currentStatus,
            next: nextStatus,
            allowed: allowedNext.join(', ') || 'none',
          },
          lang
        ),
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }
  }

  // BR-06: If transitioning from pending/confirmed to cancelled -> rollback inventory
  if (nextStatus === 'cancelled' && (currentStatus === 'pending' || currentStatus === 'confirmed')) {
    await rollbackOrderInventory(order);
    order.inventoryDeducted = false;
    order.cancelReason = note || 'Khách hàng / Quản trị viên yêu cầu hủy đơn';
  }

  order.status = nextStatus;
  if (nextStatus === 'delivered' && order.paymentMethod === 'cod') {
    order.paymentStatus = 'paid';
  }

  order.statusHistory.push({
    status: nextStatus,
    note: note || `Cập nhật trạng thái sang ${nextStatus}`,
    updatedBy: actorName,
    updatedAt: new Date(),
  });

  await order.save();
  return order.toObject();
};

const updateOrderPaymentStatus = async ({ orderId, paymentStatus, note = '', actorName = 'Admin', lang = 'vi' }) => {
  if (!['unpaid', 'paid', 'refunded'].includes(paymentStatus)) {
    throw new AppError(getMessage('INVALID_PAYMENT_STATUS', {}, lang), 400, 'INVALID_PAYMENT_STATUS');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, lang), 404, 'ORDER_NOT_FOUND');
  }

  order.paymentStatus = paymentStatus;
  order.statusHistory.push({
    status: order.status,
    note: note || `Cập nhật trạng thái thanh toán: ${paymentStatus}`,
    updatedBy: actorName,
    updatedAt: new Date(),
  });

  await order.save();
  return order.toObject();
};

const lookupOrderByCode = async (orderCode, phone = '', lang = 'vi') => {
  const cleanCode = String(orderCode || '').trim().toUpperCase();
  const order = await Order.findOne({ orderCode: cleanCode }).lean();
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, lang), 404, 'ORDER_NOT_FOUND');
  }

  if (phone && String(phone).trim() !== '') {
    if (order.customerInfo.phone !== String(phone).trim()) {
      throw new AppError(getMessage('PHONE_MISMATCH', {}, lang), 403, 'PHONE_MISMATCH');
    }
  }

  return order;
};

module.exports = {
  ALLOWED_STATUS_TRANSITIONS,
  createOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  lookupOrderByCode,
};
