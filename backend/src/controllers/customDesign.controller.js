const {
  calculateDesignBOM,
  createCustomDesign,
  getCustomDesignByIdOrCode,
} = require('../services/pricing.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const calculatePrice = asyncHandler(async (req, res) => {
  const { productId, placements = [] } = req.body;
  const lang = resolveLang(req);
  const result = await calculateDesignBOM({ productId, placements, lang });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('CALCULATE_PRICE_SUCCESS', {}, req),
    data: {
      productId: result.product._id,
      productName: result.product.name,
      pricingBreakdown: result.pricingBreakdown,
      bomSummary: result.bomSummary,
      placementsCount: result.enrichedPlacements.length,
    },
  });
});

const saveCustomDesign = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const design = await createCustomDesign(req.body, req.user, lang);

  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('SAVE_DESIGN_SUCCESS', {}, req),
    data: design,
  });
});

const getCustomDesign = asyncHandler(async (req, res) => {
  const { idOrShareCode } = req.params;
  const lang = resolveLang(req);
  const design = await getCustomDesignByIdOrCode(idOrShareCode, lang);

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_DESIGN_SUCCESS', {}, req),
    data: design,
  });
});

module.exports = {
  calculatePrice,
  saveCustomDesign,
  getCustomDesign,
};
