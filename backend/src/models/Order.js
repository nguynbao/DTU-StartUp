const mongoose = require('mongoose');
const env = require('../config/env');
const { BASE_COLORS } = require('../config/theme');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSlug: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'bag',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    model3D: {
      meshPreset: { type: String, default: 'tote_bag' },
      glbUrl: { type: String, default: '' },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedColor: {
      type: String,
      default: BASE_COLORS.OCEAN_TEAL,
    },
    selectedStrapColor: {
      type: String,
      default: BASE_COLORS.ROPE_NATURAL,
    },
    selectedSize: {
      type: String,
      default: 'Tiêu chuẩn',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    customDesignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomDesign',
      default: null,
    },
    // BR-07: Immutable snapshot of 3D Custom Design at purchase time
    customDesignSnapshot: {
      type: {
        shareCode: String,
        name: String,
        baseColor: String,
        strapColor: String,
        size: String,
        note: String,
        artisanNote: String,
        meshPreset: String,
        glbUrl: String,
        basePrice: Number,
        craftFee: Number,
        materialsTotal: Number,
        estimatedPrice: Number,
        braceletConfig: {
          wristSizeCm: { type: Number, default: 16, min: 12, max: 25 },
          slotCount: { type: Number, default: 12, min: 4, max: 30 },
          cordMaterial: { type: String, default: 'recycled_net_cord' },
        },
        placements: [
          {
            placementId: String,
            materialId: mongoose.Schema.Types.ObjectId,
            materialName: String,
            materialCode: String,
            materialType: String,
            meshPreset: String,
            glbUrl: String,
            unitPrice: Number,
            position: [Number],
            normal: [Number],
            rotation: Number,
            scale: Number,
            color: String,
            slotIndex: { type: Number, default: null },
            isDanglingCharm: { type: Boolean, default: false },
          },
        ],
      },
      default: null,
    },
    // BR-07: BOM Checklist for Artisan crafting ticket
    bomSummary: {
      type: [
        {
          materialId: mongoose.Schema.Types.ObjectId,
          code: String,
          name: String,
          materialType: String,
          meshPreset: String,
          unitPrice: Number,
          quantityPerItem: Number,
          totalQuantity: Number,
          subtotal: Number,
        },
      ],
      default: [],
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    pricingBreakdown: {
      basePrice: { type: Number, required: true },
      craftFee: { type: Number, default: 0 },
      materialsTotal: { type: Number, default: 0 },
      unitPrice: { type: Number, required: true },
      lineTotal: { type: Number, required: true },
    },
    ecoImpactGrams: {
      type: Number,
      default: 150,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerInfo: {
      fullName: { type: String, required: [true, 'Họ tên người nhận không được để trống'], trim: true },
      phone: { type: String, required: [true, 'Số điện thoại không được để trống'], trim: true },
      email: { type: String, default: '', trim: true },
      address: { type: String, required: [true, 'Địa chỉ giao hàng không được để trống'], trim: true },
      city: { type: String, default: 'Đà Nẵng' },
      note: { type: String, default: '' },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_crafting', 'quality_check', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: {
      type: [
        {
          status: String,
          note: String,
          updatedBy: String,
          updatedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'vietqr'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    vietqrInfo: {
      bankId: { type: String, default: () => env.VIETQR_BANK_ID },
      bankName: { type: String, default: () => env.VIETQR_BANK_NAME },
      accountNo: { type: String, default: () => env.VIETQR_ACCOUNT_NO },
      accountName: { type: String, default: () => env.VIETQR_ACCOUNT_NAME },
      amount: { type: Number, default: 0 },
      transferContent: { type: String, default: '' },
      qrImageUrl: { type: String, default: '' },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    totalNetWeightGrams: {
      type: Number,
      default: 0,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    inventoryDeducted: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customerInfo.phone': 1, orderCode: 1 });

module.exports = mongoose.model('Order', orderSchema);
