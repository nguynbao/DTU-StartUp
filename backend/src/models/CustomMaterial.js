const mongoose = require('mongoose');
const { CHARM_COLORS, MATERIAL_PALETTES } = require('../config/theme');

const customMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nguyên liệu không được để trống'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã nguyên liệu không được để trống'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    materialType: {
      type: String,
      enum: ['shell', 'snail', 'charm', 'bead', 'cord'],
      required: [true, 'Nhóm nguyên liệu không hợp lệ'],
    },
    description: {
      type: String,
      default: '',
    },
    unitPrice: {
      type: Number,
      required: [true, 'Đơn giá nguyên liệu không được để trống'],
      min: [0, 'Đơn giá không được âm'],
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 100,
      min: [0, 'Số lượng tồn kho không được âm'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    colorPalette: {
      type: [String],
      default: () => MATERIAL_PALETTES.DEFAULT,
    },
    defaultColor: {
      type: String,
      default: CHARM_COLORS.PEARL_WHITE,
    },
    model3D: {
      meshPreset: {
        type: String,
        enum: [
          'scallop_shell',
          'cockle_shell',
          'cowrie_shell',
          'spiral_snail',
          'turban_snail',
          'horn_snail',
          'starfish_charm',
          'seahorse_charm',
          'turtle_charm',
          'anchor_charm',
          'pearl_bead',
          'sea_glass_bead',
          'wood_bead',
          'fishing_cord_knot',
        ],
        default: 'scallop_shell',
      },
      glbUrl: {
        type: String,
        default: '',
      },
      defaultScale: {
        type: Number,
        default: 1.0,
      },
      roughness: {
        type: Number,
        default: 0.35,
      },
      metalness: {
        type: Number,
        default: 0.15,
      },
    },
    origin: {
      type: String,
      default: 'Biển miền Trung Việt Nam (Thu gom tự nhiên trên bãi cát)',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

customMaterialSchema.index({ materialType: 1, isActive: 1 });

module.exports = mongoose.model('CustomMaterial', customMaterialSchema);
