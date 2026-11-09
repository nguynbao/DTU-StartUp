const {
  getStorageStatus,
  createPresignedUploadUrl,
  uploadMediaBuffer,
  deleteMediaObject,
} = require('../services/s3.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage, resolveLang } = require('../i18n/messages');

const getMediaStatus = asyncHandler(async (req, res) => {
  const status = getStorageStatus();
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('MEDIA_STATUS_SUCCESS', {}, req),
    data: status,
  });
});

const generatePresignedUrl = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const { folder = 'products', fileName = 'upload.jpg', mimeType = 'image/jpeg', contentType } = req.body;

  const result = await createPresignedUploadUrl({
    folder,
    fileName,
    mimeType: mimeType || contentType || 'image/jpeg',
    lang,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('MEDIA_PRESIGNED_SUCCESS', {}, req),
    data: result,
  });
});

const uploadMedia = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const folder = req.body?.folder || req.query?.folder || 'products';

  // Support both multipart/form-data (req.file via multer) and base64 JSON payload for flexible testing/client usage
  let buffer = req.file?.buffer;
  let originalName = req.file?.originalname || req.body?.fileName || 'upload.png';
  let mimeType = req.file?.mimetype || req.body?.mimeType || 'image/png';
  let size = req.file?.size || 0;

  if (!buffer && req.body?.base64Data) {
    const rawBase64 = String(req.body.base64Data).replace(/^data:[^;]+;base64,/, '');
    buffer = Buffer.from(rawBase64, 'base64');
    size = buffer.length;
  }

  if (!buffer) {
    throw new AppError(getMessage('MEDIA_MISSING_FILE', {}, req), 400, 'MISSING_FILE');
  }

  const uploaded = await uploadMediaBuffer({
    buffer,
    originalName,
    mimeType,
    size,
    folder,
    lang,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('MEDIA_UPLOAD_SUCCESS', {}, req),
    data: uploaded,
  });
});

const deleteMedia = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const key = req.body?.key || req.query?.key || '';
  const url = req.body?.url || req.query?.url || '';

  const result = await deleteMediaObject({ key, url, lang });
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('MEDIA_DELETE_SUCCESS', {}, req),
    data: result,
  });
});

module.exports = {
  getMediaStatus,
  generatePresignedUrl,
  uploadMedia,
  deleteMedia,
};
