const express = require('express');
const multer = require('multer');
const env = require('../config/env');
const {
  getMediaStatus,
  generatePresignedUrl,
  uploadMedia,
  deleteMedia,
} = require('../controllers/media.controller');
const { verifyToken, optionalAuth, requireRole } = require('../middlewares/auth.middleware');
const AppError = require('../utils/AppError');
const { getMessage } = require('../i18n/messages');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

const handleMulterSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError(
            getMessage('MEDIA_FILE_TOO_LARGE', { maxSizeMb: env.UPLOAD_MAX_FILE_SIZE_MB }, req),
            400,
            'FILE_TOO_LARGE'
          )
        );
      }
      return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
    }
    next();
  });
};

/**
 * Folder-aware authorization:
 * - 'custom-previews' can be uploaded by guests/customers from 3D Studio (optionalAuth)
 * - 'landing', 'products', 'materials' require 'admin' or 'staff' role
 */
const authorizeMediaFolderAccess = (req, res, next) => {
  const folder = String(req.body?.folder || req.query?.folder || 'products')
    .trim()
    .toLowerCase();

  if (folder === 'custom-previews') {
    return optionalAuth(req, res, next);
  }

  return verifyToken(req, res, (err) => {
    if (err) return next(err);
    return requireRole('admin', 'staff')(req, res, next);
  });
};

router.get('/status', getMediaStatus);
router.post('/presigned-url', authorizeMediaFolderAccess, generatePresignedUrl);
router.post('/upload', handleMulterSingle, authorizeMediaFolderAccess, uploadMedia);
router.delete('/', verifyToken, requireRole('admin', 'staff'), deleteMedia);

module.exports = router;
