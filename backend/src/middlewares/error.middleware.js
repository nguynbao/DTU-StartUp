const AppError = require('../utils/AppError');
const { sendError } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const notFoundHandler = (req, res, next) => {
  next(
    new AppError(
      getMessage('ROUTE_NOT_FOUND', { url: req.originalUrl }, req),
      404,
      'NOT_FOUND'
    )
  );
};

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || getMessage('INTERNAL_SERVER_ERROR', {}, req);
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let details = err.details || null;

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('; ');
    details = messages;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = getMessage('INVALID_ID', { path: err.path, value: err.value }, req);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = getMessage('DUPLICATE_KEY', { field }, req);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = getMessage('INVALID_TOKEN', {}, req);
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = getMessage('TOKEN_EXPIRED', {}, req);
  }

  return sendError(res, {
    statusCode,
    message,
    errorCode,
    details,
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
