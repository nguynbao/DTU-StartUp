const { getMessage } = require('../i18n/messages');

const sendSuccess = (res, { statusCode = 200, message = getMessage('SUCCESS'), data = null, meta = undefined }) => {
  const payload = {
    success: true,
    message,
    data,
  };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

const sendError = (res, { statusCode = 400, message = getMessage('ERROR_DEFAULT'), errorCode = 'ERROR', details = null }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details,
    },
  });
};

module.exports = { sendSuccess, sendError };
