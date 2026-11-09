const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    isCustomizable,
    isFeatured,
    includeInactive,
    search,
    minPrice,
    maxPrice,
    sort = 'newest',
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};

  if (includeInactive !== 'true') {
    filter.isActive = true;
  }

  if (category && category !== 'all') {
    filter.category = String(category);
  }

  if (isCustomizable === 'true' || isCustomizable === 'false') {
    filter.isCustomizable = isCustomizable === 'true';
  }

  if (isFeatured === 'true') {
    filter.isFeatured = true;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.basePrice = {};
    if (minPrice !== undefined && minPrice !== '') {
      filter.basePrice.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.basePrice.$lte = Number(maxPrice);
    }
  }

  if (search && String(search).trim() !== '') {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ name: regex }, { shortDescription: regex }, { description: regex }, { slug: regex }];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { basePrice: 1 };
  else if (sort === 'price_desc') sortOption = { basePrice: -1 };
  else if (sort === 'popular') sortOption = { soldCount: -1, rating: -1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_PRODUCTS_SUCCESS', {}, req),
    data: products,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

const getProductBySlugOrId = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
  const query = isObjectId ? { $or: [{ _id: slug }, { slug }] } : { slug: String(slug).toLowerCase() };

  const product = await Product.findOne(query).lean();
  if (!product) {
    throw new AppError(getMessage('PRODUCT_NOT_FOUND', {}, req), 404, 'PRODUCT_NOT_FOUND');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .lean();

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_PRODUCT_DETAIL_SUCCESS', {}, req),
    data: {
      ...product,
      relatedProducts,
    },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.name) {
    throw new AppError(getMessage('PRODUCT_MISSING_NAME', {}, req), 400, 'MISSING_NAME');
  }
  if (!payload.slug) {
    payload.slug = `${slugify(payload.name)}-${Date.now().toString().slice(-4)}`;
  }

  const product = await Product.create(payload);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('CREATE_PRODUCT_SUCCESS', {}, req),
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!product) {
    throw new AppError(getMessage('PRODUCT_NOT_FOUND', {}, req), 404, 'PRODUCT_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_PRODUCT_SUCCESS', {}, req),
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id).lean();
  if (!product) {
    throw new AppError(getMessage('PRODUCT_NOT_FOUND', {}, req), 404, 'PRODUCT_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('DELETE_PRODUCT_SUCCESS', {}, req),
    data: { _id: id },
  });
});

module.exports = {
  getProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
};
