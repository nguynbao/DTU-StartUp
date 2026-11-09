const LandingContent = require('../models/LandingContent');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const getLandingContent = asyncHandler(async (req, res) => {
  let content = await LandingContent.findOne({ key: 'main_landing' }).lean();
  if (!content) {
    const created = await LandingContent.create({ key: 'main_landing' });
    content = created.toObject();
  }

  const [featuredProducts, featuredMaterials, orderEcoAgg] = await Promise.all([
    Product.find({ isActive: true })
      .sort({ isFeatured: -1, soldCount: -1, createdAt: -1 })
      .limit(6)
      .lean(),
    CustomMaterial.find({ isActive: true })
      .sort({ materialType: 1, unitPrice: 1 })
      .limit(12)
      .lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalNetWeightGrams: { $sum: '$totalNetWeightGrams' },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
  ]);

  const dynamicNetGrams = orderEcoAgg[0]?.totalNetWeightGrams || 0;

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_LANDING_SUCCESS', {}, req),
    data: {
      ...content,
      featuredProducts,
      featuredMaterials,
      liveEcoMetrics: {
        additionalNetRecycledGrams: dynamicNetGrams,
        totalOrdersPlaced: orderEcoAgg[0]?.totalOrders || 0,
      },
    },
  });
});

const updateLandingContent = asyncHandler(async (req, res) => {
  let doc = await LandingContent.findOne({ key: 'main_landing' });
  if (!doc) {
    doc = new LandingContent({ key: 'main_landing' });
  }

  const payload = req.body || {};

  // Update nested hero & heroBanner fields while keeping both in sync
  if (payload.hero && typeof payload.hero === 'object') {
    doc.hero = { ...(doc.hero?.toObject ? doc.hero.toObject() : doc.hero), ...payload.hero };
    if (payload.hero.heroImage) {
      doc.heroBanner.backgroundImageUrl = payload.hero.heroImage;
    }
    if (payload.hero.secondaryImageUrl) {
      doc.heroBanner.secondaryImageUrl = payload.hero.secondaryImageUrl;
    }
    if (payload.hero.tertiaryImageUrl) {
      doc.heroBanner.tertiaryImageUrl = payload.hero.tertiaryImageUrl;
    }
  }

  if (payload.heroBanner && typeof payload.heroBanner === 'object') {
    doc.heroBanner = {
      ...(doc.heroBanner?.toObject ? doc.heroBanner.toObject() : doc.heroBanner),
      ...payload.heroBanner,
    };
    if (payload.heroBanner.backgroundImageUrl) {
      doc.hero.heroImage = payload.heroBanner.backgroundImageUrl;
    }
    if (payload.heroBanner.secondaryImageUrl) {
      doc.hero.secondaryImageUrl = payload.heroBanner.secondaryImageUrl;
    }
    if (payload.heroBanner.tertiaryImageUrl) {
      doc.hero.tertiaryImageUrl = payload.heroBanner.tertiaryImageUrl;
    }
  }

  if (payload.impactStats && typeof payload.impactStats === 'object') {
    doc.impactStats = {
      ...(doc.impactStats?.toObject ? doc.impactStats.toObject() : doc.impactStats),
      ...payload.impactStats,
    };
  }

  if (Array.isArray(payload.processSteps)) {
    doc.processSteps = payload.processSteps;
    if (!payload.recyclingSteps) {
      doc.recyclingSteps = payload.processSteps;
    }
  }

  if (Array.isArray(payload.recyclingSteps)) {
    doc.recyclingSteps = payload.recyclingSteps;
    if (!payload.processSteps) {
      doc.processSteps = payload.recyclingSteps;
    }
  }

  if (Array.isArray(payload.galleryImages)) {
    doc.galleryImages = payload.galleryImages;
  }

  if (payload.studioHighlight && typeof payload.studioHighlight === 'object') {
    doc.studioHighlight = {
      ...(doc.studioHighlight?.toObject ? doc.studioHighlight.toObject() : doc.studioHighlight),
      ...payload.studioHighlight,
    };
  }

  if (payload.artisanStory && typeof payload.artisanStory === 'object') {
    doc.artisanStory = {
      ...(doc.artisanStory?.toObject ? doc.artisanStory.toObject() : doc.artisanStory),
      ...payload.artisanStory,
    };
  }

  if (Array.isArray(payload.artisanStories)) {
    doc.artisanStories = payload.artisanStories;
  }

  if (payload.seo && typeof payload.seo === 'object') {
    doc.seo = {
      ...(doc.seo?.toObject ? doc.seo.toObject() : doc.seo),
      ...payload.seo,
    };
  }

  await doc.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_LANDING_SUCCESS', {}, req),
    data: doc.toObject(),
  });
});

module.exports = { getLandingContent, updateLandingContent };
