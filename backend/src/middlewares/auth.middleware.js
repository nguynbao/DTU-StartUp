const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getMessage } = require('../i18n/messages');

const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const verifyToken = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new AppError(getMessage('AUTH_REQUIRED', {}, req), 401, 'UNAUTHORIZED');
  }

  const decoded = jwt.verify(token, env.JWT_SECRET);
  const user = await User.findById(decoded.id).lean();
  if (!user || !user.isActive) {
    throw new AppError(getMessage('USER_INACTIVE', {}, req), 401, 'USER_INACTIVE');
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    req.user = user && user.isActive ? user : null;
  } catch (err) {
    req.user = null;
  }
  next();
});

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(getMessage('AUTH_REQUIRED', {}, req), 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          getMessage('FORBIDDEN_ROLE', { roles: roles.join(', ') }, req),
          403,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
};

module.exports = { verifyToken, optionalAuth, requireRole };
