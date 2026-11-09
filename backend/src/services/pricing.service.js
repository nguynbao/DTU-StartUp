const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const CustomDesign = require('../models/CustomDesign');
const AppError = require('../utils/AppError');
const { BASE_COLORS, CHARM_COLORS } = require('../config/theme');
const { getMessage } = require('../i18n/messages');

const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '3D-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate 3D surface placement coordinates, normal vector, rotation, and scale (BR-02 & BR-03)
 */
const validatePlacementsInput = (placements = [], lang = 'vi') => {
  if (!Array.isArray(placements)) {
    throw new AppError(getMessage('INVALID_PLACEMENTS_ARRAY', {}, lang), 400, 'INVALID_PLACEMENTS');
  }

  // BR-02: Maximum 50 accessories per design
  if (placements.length > 50) {
    throw new AppError(
      getMessage('MAX_PLACEMENTS_EXCEEDED', { count: placements.length }, lang),
      400,
      'MAX_PLACEMENTS_EXCEEDED'
    );
  }

  return placements.map((item, idx) => {
    if (!item.materialId) {
      throw new AppError(getMessage('PLACEMENT_MISSING_MATERIAL', { index: idx + 1 }, lang), 400, 'MISSING_MATERIAL_ID');
    }

    const pos = Array.isArray(item.position) ? item.position.map(Number) : [0, 0, 0];
    if (pos.length !== 3 || pos.some((v) => !Number.isFinite(v))) {
      throw new AppError(getMessage('INVALID_POSITION', { index: idx + 1 }, lang), 400, 'INVALID_POSITION');
    }

    const norm = Array.isArray(item.normal) ? item.normal.map(Number) : [0, 0, 1];
    if (norm.length !== 3 || norm.some((v) => !Number.isFinite(v))) {
      throw new AppError(getMessage('INVALID_NORMAL', { index: idx + 1 }, lang), 400, 'INVALID_NORMAL');
    }
    const normLen = Math.hypot(norm[0], norm[1], norm[2]);
    const normalizedNormal = normLen > 0.0001 ? [norm[0] / normLen, norm[1] / normLen, norm[2] / normLen] : [0, 0, 1];

    const scale = item.scale !== undefined ? Number(item.scale) : 1.0;
    if (!Number.isFinite(scale) || scale < 0.4 || scale > 2.5) {
      throw new AppError(
        getMessage('INVALID_SCALE', { index: idx + 1, scale: item.scale }, lang),
        400,
        'INVALID_SCALE'
      );
    }

    const rotation = item.rotation !== undefined ? Number(item.rotation) : 0;
    const slotIndex =
      item.slotIndex !== undefined && item.slotIndex !== null && Number.isFinite(Number(item.slotIndex))
        ? Number(item.slotIndex)
        : null;
    const isDanglingCharm = Boolean(item.isDanglingCharm);

    return {
      placementId: item.placementId || `pl_${Date.now()}_${idx}`,
      materialId: String(item.materialId),
      position: [
        Number(pos[0].toFixed(4)),
        Number(pos[1].toFixed(4)),
        Number(pos[2].toFixed(4)),
      ],
      normal: [
        Number(normalizedNormal[0].toFixed(4)),
        Number(normalizedNormal[1].toFixed(4)),
        Number(normalizedNormal[2].toFixed(4)),
      ],
      rotation: Number.isFinite(rotation) ? rotation : 0,
      scale: Number(scale.toFixed(2)),
      color: item.color || '',
      slotIndex,
      isDanglingCharm,
    };
  });
};

/**
 * BR-01: Dynamic BOM Pricing calculated 100% from Database
 * UnitPrice_custom = Product.basePrice + Product.craftFee + sum(Material_i.unitPrice)
 */
const calculateDesignBOM = async ({ productId, placements = [], lang = 'vi' }) => {
  if (!productId) {
    throw new AppError(getMessage('MISSING_PRODUCT_ID', {}, lang), 400, 'MISSING_PRODUCT_ID');
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new AppError(getMessage('PRODUCT_NOT_FOUND', {}, lang), 404, 'PRODUCT_NOT_FOUND');
  }

  const validatedPlacements = validatePlacementsInput(placements, lang);

  // Fetch all referenced materials from DB
  const uniqueMaterialIds = [...new Set(validatedPlacements.map((p) => p.materialId))];
  const materials = uniqueMaterialIds.length
    ? await CustomMaterial.find({ _id: { $in: uniqueMaterialIds } }).lean()
    : [];

  const materialMap = new Map(materials.map((m) => [String(m._id), m]));

  let materialsTotal = 0;
  const enrichedPlacements = [];
  const bomCounterMap = new Map();

  for (const pl of validatedPlacements) {
    const mat = materialMap.get(pl.materialId);
    if (!mat) {
      throw new AppError(getMessage('MATERIAL_NOT_FOUND', {}, lang), 400, 'MATERIAL_NOT_FOUND');
    }
    if (!mat.isActive) {
      throw new AppError(getMessage('MATERIAL_INACTIVE', { name: mat.name }, lang), 400, 'MATERIAL_INACTIVE');
    }

    materialsTotal += mat.unitPrice;

    enrichedPlacements.push({
      placementId: pl.placementId,
      materialId: mat._id,
      materialName: mat.name,
      materialCode: mat.code,
      materialType: mat.materialType,
      meshPreset: mat.model3D?.meshPreset || 'scallop_shell',
      glbUrl: mat.model3D?.glbUrl || '',
      unitPrice: mat.unitPrice,
      position: pl.position,
      normal: pl.normal,
      rotation: pl.rotation,
      scale: pl.scale,
      color: pl.color || mat.defaultColor || CHARM_COLORS.PEARL_WHITE,
      slotIndex: pl.slotIndex,
      isDanglingCharm: pl.isDanglingCharm,
    });

    const key = String(mat._id);
    if (!bomCounterMap.has(key)) {
      bomCounterMap.set(key, {
        materialId: mat._id,
        code: mat.code,
        name: mat.name,
        materialType: mat.materialType,
        meshPreset: mat.model3D?.meshPreset || 'scallop_shell',
        unitPrice: mat.unitPrice,
        quantity: 0,
        subtotal: 0,
        availableStock: mat.stockQuantity,
      });
    }
    const entry = bomCounterMap.get(key);
    entry.quantity += 1;
    entry.subtotal = entry.quantity * entry.unitPrice;
  }

  const basePrice = product.basePrice;
  const craftFee = product.craftFee;
  const estimatedPrice = basePrice + craftFee + materialsTotal;

  return {
    product,
    enrichedPlacements,
    bomSummary: Array.from(bomCounterMap.values()),
    pricingBreakdown: {
      basePrice,
      craftFee,
      materialsTotal,
      estimatedPrice,
    },
  };
};

const normalizeBraceletConfig = (config) => {
  if (!config || typeof config !== 'object') {
    return {
      wristSizeCm: 16,
      slotCount: 12,
      cordMaterial: 'recycled_net_cord',
    };
  }
  const wristSizeCm = Math.min(25, Math.max(12, Number(config.wristSizeCm) || 16));
  const slotCount = Math.min(30, Math.max(4, Math.round(Number(config.slotCount) || 12)));
  const cordMaterial = String(config.cordMaterial || 'recycled_net_cord');
  return { wristSizeCm, slotCount, cordMaterial };
};

const createCustomDesign = async (payload, user = null, lang = 'vi') => {
  const { productId, name, baseColor, strapColor, size, note, braceletConfig, placements = [], previewThumbnail } = payload;

  const { product, enrichedPlacements, bomSummary, pricingBreakdown } = await calculateDesignBOM({
    productId,
    placements,
    lang,
  });

  if (!product.isCustomizable) {
    throw new AppError(
      getMessage('PRODUCT_NOT_CUSTOMIZABLE', { name: product.name }, lang),
      400,
      'NOT_CUSTOMIZABLE'
    );
  }

  let shareCode = generateShareCode();
  // Ensure unique shareCode
  while (await CustomDesign.exists({ shareCode })) {
    shareCode = generateShareCode();
  }

  const customDesign = await CustomDesign.create({
    shareCode,
    name: name || `Custom ${product.name}`,
    productId: product._id,
    userId: user ? user._id : null,
    baseColor: baseColor || product.model3D?.defaultBaseColor || BASE_COLORS.OCEAN_TEAL,
    strapColor: strapColor || product.model3D?.defaultStrapColor || BASE_COLORS.ROPE_NATURAL,
    size: size || product.availableSizes?.[0] || 'Tiêu chuẩn',
    note: note || '',
    braceletConfig: normalizeBraceletConfig(braceletConfig),
    placements: enrichedPlacements,
    pricingBreakdown,
    bomSummary: bomSummary.map(({ availableStock, ...rest }) => rest),
    previewThumbnail: previewThumbnail || product.thumbnail || '',
  });

  return CustomDesign.findById(customDesign._id)
    .populate('productId', 'name slug category basePrice craftFee thumbnail model3D ecoImpact')
    .lean();
};

const getCustomDesignByIdOrCode = async (idOrShareCode, lang = 'vi') => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrShareCode);
  const query = isObjectId
    ? { $or: [{ _id: idOrShareCode }, { shareCode: idOrShareCode.toUpperCase() }] }
    : { shareCode: idOrShareCode.toUpperCase() };

  const design = await CustomDesign.findOne(query)
    .populate('productId', 'name slug category basePrice craftFee stock thumbnail images model3D ecoImpact availableColors availableStrapColors')
    .lean();

  if (!design) {
    throw new AppError(getMessage('DESIGN_NOT_FOUND', {}, lang), 404, 'DESIGN_NOT_FOUND');
  }

  return design;
};

module.exports = {
  validatePlacementsInput,
  calculateDesignBOM,
  createCustomDesign,
  getCustomDesignByIdOrCode,
};
