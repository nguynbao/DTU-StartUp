const Order = require('../models/Order');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const CustomDesign = require('../models/CustomDesign');
const LandingContent = require('../models/LandingContent');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    orders,
    totalProducts,
    totalMaterials,
    lowStockMaterials,
    lowStockProducts,
    totalCustomDesigns,
    landingContent,
  ] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).lean(),
    Product.countDocuments({ isActive: true }),
    CustomMaterial.countDocuments({ isActive: true }),
    CustomMaterial.find({ stockQuantity: { $lte: 15 }, isActive: true })
      .sort({ stockQuantity: 1 })
      .lean(),
    Product.find({ stock: { $lte: 5 }, isActive: true })
      .sort({ stock: 1 })
      .lean(),
    CustomDesign.countDocuments(),
    LandingContent.findOne({ key: 'main_landing' }).lean(),
  ]);

  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalNetWeightGrams = activeOrders.reduce((sum, o) => sum + (o.totalNetWeightGrams || 0), 0);

  const statusBreakdown = {
    pending: 0,
    confirmed: 0,
    in_crafting: 0,
    quality_check: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  };

  let customCraftingOrdersCount = 0;

  for (const o of orders) {
    if (statusBreakdown[o.status] !== undefined) {
      statusBreakdown[o.status] += 1;
    }
    const hasCustomItem = Array.isArray(o.items) && o.items.some((it) => it.isCustom);
    if (hasCustomItem && ['pending', 'confirmed', 'in_crafting', 'quality_check'].includes(o.status)) {
      customCraftingOrdersCount += 1;
    }
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_DASHBOARD_SUCCESS', {}, req),
    data: {
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        activeOrdersCount: activeOrders.length,
        customCraftingOrdersCount,
        totalProducts,
        totalMaterials,
        totalCustomDesigns,
        totalNetWeightGrams,
        ghostNetsCollectedKg: landingContent?.impactStats?.ghostNetsCollectedKg || 3480,
      },
      statusBreakdown,
      lowStockMaterials,
      lowStockProducts,
      recentOrders: orders.slice(0, 8),
    },
  });
});

module.exports = { getDashboardStats };
