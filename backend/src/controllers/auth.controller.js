const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  if (!fullName || !email || !password) {
    throw new AppError(getMessage('REGISTER_MISSING_FIELDS', {}, req), 400, 'MISSING_FIELDS');
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    throw new AppError(getMessage('EMAIL_EXISTS', {}, req), 409, 'EMAIL_EXISTS');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone: phone || '',
    role: 'customer',
  });

  const token = signToken(user);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('REGISTER_SUCCESS', {}, req),
    data: {
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(getMessage('LOGIN_MISSING_FIELDS', {}, req), 400, 'MISSING_CREDENTIALS');
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(getMessage('INVALID_CREDENTIALS', {}, req), 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError(getMessage('USER_LOCKED', {}, req), 403, 'USER_LOCKED');
  }

  const token = signToken(user);
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('LOGIN_SUCCESS', {}, req),
    data: {
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
      },
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_ME_SUCCESS', {}, req),
    data: req.user,
  });
});

module.exports = { register, login, getMe };
