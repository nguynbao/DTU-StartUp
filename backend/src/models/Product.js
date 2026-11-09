const mongoose = require('mongoose');
const { BASE_COLORS, NET_COLORS, STRAP_COLORS } = require('../config/theme');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm không được để trống'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug sản phẩm không được để trống'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['basket', 'bag', 'wallet', 'apparel', 'bracelet', 'accessory'],
      required: [true, 'Danh mục sản phẩm không hợp lệ'],
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    basePrice: {
      type: Number,
      required: [true, 'Giá gốc không được để trống'],
      min: [0, 'Giá gốc không được âm'],
    },
    craftFee: {
      type: Number,
      default: 0,
      min: [0, 'Phí chế tác không được âm'],
    },
    stock: {
      type: Number,
      required: true,
      default: 20,
      min: [0, 'Tồn kho không được âm'],
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    isCustomizable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availableColors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      ],
      default: () => NET_COLORS,
    },
    availableStrapColors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      ],
      default: () => STRAP_COLORS,
    },
    availableSizes: {
      type: [String],
      default: ['Tiêu chuẩn'],
    },
    model3D: {
      meshPreset: {
        type: String,
        enum: ['tote_bag', 'storage_basket', 'zip_wallet', 'eco_shirt', 'woven_bracelet', 'shell_charm_set'],
        default: 'tote_bag',
      },
      glbUrl: {
        type: String,
        default: '',
      },
      defaultBaseColor: {
        type: String,
        default: BASE_COLORS.OCEAN_TEAL,
      },
      defaultStrapColor: {
        type: String,
        default: BASE_COLORS.ROPE_NATURAL,
      },
      roughness: {
        type: Number,
        default: 0.75,
      },
      metalness: {
        type: Number,
        default: 0.05,
      },
    },
    ecoImpact: {
      netWeightGrams: {
        type: Number,
        default: 150,
      },
      oceanOrigin: {
        type: String,
        default: 'Vịnh Đà Nẵng & Cù Lao Chàm',
      },
      artisanGroup: {
        type: String,
        default: 'Hợp tác xã Phụ nữ Làng chài Thanh Khê',
      },
      recycledPlasticRatio: {
        type: Number,
        default: 92,
      },
      co2SavedGrams: {
        type: Number,
        default: 420,
      },
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
  },
  { timestamps: true }
);

// ESR Compound Indexes
productSchema.index({ category: 1, isActive: 1, isCustomizable: 1 });
productSchema.index({ isActive: 1, basePrice: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
