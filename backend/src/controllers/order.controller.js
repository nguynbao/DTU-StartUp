const Order = require('../models/Order');
const {
  createOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  lookupOrderByCode,
} = require('../services/order.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const placeOrder = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const order = await createOrder(req.body, req.user, lang);

  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('PLACE_ORDER_SUCCESS', {}, req),
    data: order,
  });
});

const lookupOrder = asyncHandler(async (req, res) => {
  const { orderCode } = req.params;
  const { phone } = req.query;
  const lang = resolveLang(req);
  const order = await lookupOrderByCode(orderCode, phone, lang);

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('LOOKUP_ORDER_SUCCESS', {}, req),
    data: order,
  });
});

const cancelOrderByCustomer = asyncHandler(async (req, res) => {
  const { orderCode } = req.params;
  const { reason, phone } = req.body;
  const lang = resolveLang(req);

  const updated = await updateOrderStatus({
    orderIdOrCode: orderCode,
    nextStatus: 'cancelled',
    note: reason || 'Khách hàng chủ động hủy đơn hàng',
    actorName: req.user ? req.user.fullName : 'Khách hàng',
    isCustomerCancel: true,
    phone: phone || '',
    lang,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('CANCEL_ORDER_SUCCESS', {}, req),
    data: updated,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const { status, isCustom, search, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (status && status !== 'all') {
    filter.status = String(status);
  }

  if (isCustom === 'true') {
    filter['items.isCustom'] = true;
  }

  if (search && String(search).trim() !== '') {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [
      { orderCode: regex },
      { 'customerInfo.fullName': regex },
      { 'customerInfo.phone': regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Order.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_ORDERS_SUCCESS', {}, req),
    data: orders,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isObjectId ? { $or: [{ _id: id }, { orderCode: id.toUpperCase() }] } : { orderCode: id.toUpperCase() };

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw new AppError(getMessage('ORDER_NOT_FOUND', {}, req), 404, 'ORDER_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_ORDER_DETAIL_SUCCESS', {}, req),
    data: order,
  });
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const lang = resolveLang(req);

  if (!status) {
    throw new AppError(getMessage('MISSING_STATUS', {}, req), 400, 'MISSING_STATUS');
  }

  const updated = await updateOrderStatus({
    orderIdOrCode: id,
    nextStatus: status,
    note,
    actorName: req.user ? `${req.user.fullName} (${req.user.role})` : 'Admin/Artisan',
    isCustomerCancel: false,
    lang,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_ORDER_STATUS_SUCCESS', { status }, req),
    data: updated,
  });
});

const changeOrderPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, note } = req.body;
  const lang = resolveLang(req);

  const updated = await updateOrderPaymentStatus({
    orderId: id,
    paymentStatus,
    note,
    actorName: req.user ? `${req.user.fullName} (${req.user.role})` : 'Admin',
    lang,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_ORDER_PAYMENT_SUCCESS', { paymentStatus }, req),
    data: updated,
  });
});

module.exports = {
  placeOrder,
  lookupOrder,
  cancelOrderByCustomer,
  getOrders,
  getOrderById,
  changeOrderStatus,
  changeOrderPayment,
};
