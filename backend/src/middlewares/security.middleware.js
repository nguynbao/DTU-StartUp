const rateLimit = require('express-rate-limit');
const { getMessage } = require('../i18n/messages');

// Deeply strip keys starting with '$' or containing '.' to prevent NoSQL Injection
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeObject(value);
  }
  return clean;
};

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req) => ({
    success: false,
    message: getMessage('TOO_MANY_REQUESTS', {}, req),
    error: { code: 'TOO_MANY_REQUESTS' },
  }),
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req) => ({
    success: false,
    message: getMessage('AUTH_RATE_LIMIT', {}, req),
    error: { code: 'AUTH_RATE_LIMIT' },
  }),
});

module.exports = {
  mongoSanitizeMiddleware,
  apiRateLimiter,
  authRateLimiter,
};
