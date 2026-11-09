const mongoose = require('mongoose');
const { BASE_COLORS, CHARM_COLORS } = require('../config/theme');

const placementSchema = new mongoose.Schema(
  {
    placementId: {
      type: String,
      required: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomMaterial',
      required: true,
    },
    materialName: {
      type: String,
      default: '',
    },
    materialCode: {
      type: String,
      default: '',
    },
    materialType: {
      type: String,
      default: 'shell',
    },
    meshPreset: {
      type: String,
      default: 'scallop_shell',
    },
    glbUrl: {
      type: String,
      default: '',
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    position: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 3 && arr.every((n) => Number.isFinite(n)),
        message: 'Tọa độ position phải gồm [x, y, z]',
      },
    },
    normal: {
      type: [Number],
      required: true,
      default: [0, 0, 1],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 3 && arr.every((n) => Number.isFinite(n)),
        message: 'Vector pháp tuyến normal phải gồm [nx, ny, nz]',
      },
    },
    rotation: {
      type: Number,
      default: 0,
    },
    scale: {
      type: Number,
      default: 1.0,
      min: [0.4, 'Scale tối thiểu là 0.4'],
      max: [2.5, 'Scale tối đa là 2.5'],
    },
    color: {
      type: String,
      default: CHARM_COLORS.PEARL_WHITE,
    },
    slotIndex: {
      type: Number,
      default: null,
    },
    isDanglingCharm: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const customDesignSchema = new mongoose.Schema(
  {
    shareCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: 'Thiết kế Cá nhân hóa 3D',
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    baseColor: {
      type: String,
      default: BASE_COLORS.OCEAN_TEAL,
    },
    strapColor: {
      type: String,
      default: BASE_COLORS.ROPE_NATURAL,
    },
    size: {
      type: String,
      default: 'Tiêu chuẩn',
    },
    note: {
      type: String,
      default: '',
    },
    braceletConfig: {
      wristSizeCm: { type: Number, default: 16, min: 12, max: 25 },
      slotCount: { type: Number, default: 12, min: 4, max: 30 },
      cordMaterial: { type: String, default: 'recycled_net_cord' },
    },
    placements: {
      type: [placementSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: 'Mỗi bản thiết kế chỉ được gắn tối đa 50 phụ kiện (BR-02)',
      },
    },
    pricingBreakdown: {
      basePrice: { type: Number, required: true },
      craftFee: { type: Number, required: true },
      materialsTotal: { type: Number, required: true },
      estimatedPrice: { type: Number, required: true },
    },
    bomSummary: {
      type: [
        {
          materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomMaterial' },
          code: String,
          name: String,
          materialType: String,
          meshPreset: String,
          unitPrice: Number,
          quantity: Number,
          subtotal: Number,
        },
      ],
      default: [],
    },
    previewThumbnail: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

customDesignSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model('CustomDesign', customDesignSchema);
