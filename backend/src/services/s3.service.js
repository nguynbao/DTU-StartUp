const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const env = require('../config/env');
const {
  S3_FOLDERS,
  ALLOWED_IMAGE_MIME_TYPES,
  resolveS3PublicBaseUrl,
  resolveS3Url,
} = require('../config/assets');
const { getMessage } = require('../i18n/messages');
const AppError = require('../utils/AppError');

const LOCAL_UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');

// Ensure local upload subdirectories exist for Smart Local Fallback
for (const folder of S3_FOLDERS) {
  const dirPath = path.join(LOCAL_UPLOAD_ROOT, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const isS3Configured = () => {
  return Boolean(
    env.AWS_ACCESS_KEY_ID &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_S3_BUCKET_NAME &&
      env.AWS_ACCESS_KEY_ID !== 'your-aws-access-key-id'
  );
};

let s3ClientInstance = null;
const getS3Client = () => {
  if (!isS3Configured()) return null;
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
};

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const validateFolderAndMime = ({ folder = 'products', mimeType = 'image/jpeg', lang = 'vi' }) => {
  const cleanFolder = String(folder || 'products').trim().toLowerCase();
  if (!S3_FOLDERS.includes(cleanFolder)) {
    throw new AppError(
      getMessage('MEDIA_INVALID_FOLDER', { folder: cleanFolder, allowed: S3_FOLDERS.join(', ') }, lang),
      400,
      'INVALID_MEDIA_FOLDER'
    );
  }

  const cleanMime = String(mimeType || '').trim().toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(cleanMime)) {
    throw new AppError(
      getMessage('MEDIA_INVALID_MIME', { mimeType: cleanMime || 'unknown' }, lang),
      400,
      'INVALID_MEDIA_MIME_TYPE'
    );
  }

  return { cleanFolder, cleanMime };
};

const buildObjectKey = (folder, originalName = 'image.jpg', mimeType = 'image/jpeg') => {
  const extFromMime = MIME_TO_EXT[mimeType] || '.jpg';
  const baseName = path
    .basename(String(originalName || 'image'), path.extname(String(originalName || '')))
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48) || 'media';

  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  return `${folder}/${uniqueSuffix}-${baseName}${extFromMime}`;
};

const getStorageStatus = () => {
  const s3Active = isS3Configured();
  return {
    storageMode: s3Active ? 's3' : 'local-fallback',
    isS3Configured: s3Active,
    bucket: env.AWS_S3_BUCKET_NAME,
    region: env.AWS_REGION,
    publicBaseUrl: s3Active ? resolveS3PublicBaseUrl() : `${env.BACKEND_PUBLIC_URL}/uploads`,
    folders: S3_FOLDERS,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    maxFileSizeMb: env.UPLOAD_MAX_FILE_SIZE_MB,
    presignedExpiresIn: env.AWS_S3_PRESIGNED_EXPIRES_IN,
  };
};

/**
 * Generate Presigned PUT URL (or fallback local upload endpoint metadata if AWS credentials are not yet set)
 */
const createPresignedUploadUrl = async ({
  folder = 'products',
  fileName = 'upload.jpg',
  mimeType = 'image/jpeg',
  lang = 'vi',
}) => {
  const { cleanFolder, cleanMime } = validateFolderAndMime({ folder, mimeType, lang });
  const key = buildObjectKey(cleanFolder, fileName, cleanMime);

  if (isS3Configured()) {
    try {
      const client = getS3Client();
      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key,
        ContentType: cleanMime,
      });

      const uploadUrl = await getSignedUrl(client, command, {
        expiresIn: env.AWS_S3_PRESIGNED_EXPIRES_IN,
      });

      return {
        storageMode: 's3',
        uploadMethod: 'PUT',
        uploadUrl,
        publicUrl: resolveS3Url(key),
        key,
        folder: cleanFolder,
        contentType: cleanMime,
        expiresIn: env.AWS_S3_PRESIGNED_EXPIRES_IN,
      };
    } catch (s3Err) {
      console.warn(`[S3 Presign Warning] Falling back to local upload (${s3Err.name}: ${s3Err.message})`);
    }
  }

  // Smart Local Fallback when AWS keys are empty or presign fails
  return {
    storageMode: 'local-fallback',
    uploadMethod: 'POST_MULTIPART',
    uploadUrl: `${env.BACKEND_PUBLIC_URL}/api/media/upload`,
    publicUrl: `${env.BACKEND_PUBLIC_URL}/uploads/${key}`,
    key,
    folder: cleanFolder,
    contentType: cleanMime,
    expiresIn: env.AWS_S3_PRESIGNED_EXPIRES_IN,
  };
};

/**
 * Save buffer to local fallback directory
 */
const saveToLocalFallback = ({ buffer, key, cleanFolder, cleanMime }) => {
  const targetFilePath = path.join(LOCAL_UPLOAD_ROOT, key);
  fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
  fs.writeFileSync(targetFilePath, buffer);

  const publicUrl = `${env.BACKEND_PUBLIC_URL}/uploads/${key}`;
  return {
    storageMode: 'local-fallback',
    bucket: env.AWS_S3_BUCKET_NAME,
    region: env.AWS_REGION,
    key,
    folder: cleanFolder,
    mimeType: cleanMime,
    size: buffer.length,
    url: publicUrl,
    publicUrl,
  };
};

/**
 * Upload file Buffer directly to AWS S3 (if configured) with automatic Smart Local Fallback
 * if S3 PutObject fails due to bucket/ACL/network errors.
 */
const uploadMediaBuffer = async ({
  buffer,
  originalName = 'upload.jpg',
  mimeType = 'image/jpeg',
  size = 0,
  folder = 'products',
  customKey = '',
  lang = 'vi',
}) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new AppError(getMessage('MEDIA_MISSING_FILE', {}, lang), 400, 'MISSING_FILE');
  }

  const maxBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;
  if (buffer.length > maxBytes || size > maxBytes) {
    throw new AppError(
      getMessage('MEDIA_FILE_TOO_LARGE', { maxSizeMb: env.UPLOAD_MAX_FILE_SIZE_MB }, lang),
      400,
      'FILE_TOO_LARGE'
    );
  }

  const { cleanFolder, cleanMime } = validateFolderAndMime({ folder, mimeType, lang });
  const key = customKey
    ? `${cleanFolder}/${path.basename(customKey)}`
    : buildObjectKey(cleanFolder, originalName, cleanMime);

  if (isS3Configured()) {
    try {
      const client = getS3Client();
      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: cleanMime,
      });
      await client.send(command);

      const publicUrl = resolveS3Url(key);
      return {
        storageMode: 's3',
        bucket: env.AWS_S3_BUCKET_NAME,
        region: env.AWS_REGION,
        key,
        folder: cleanFolder,
        mimeType: cleanMime,
        size: buffer.length,
        url: publicUrl,
        publicUrl,
      };
    } catch (s3Err) {
      console.warn(
        `[S3 PutObject Warning] Could not upload to S3 bucket "${env.AWS_S3_BUCKET_NAME}" (${s3Err.name}: ${s3Err.message}). Falling back to local /uploads/${key}.`
      );
      return saveToLocalFallback({ buffer, key, cleanFolder, cleanMime });
    }
  }

  return saveToLocalFallback({ buffer, key, cleanFolder, cleanMime });
};

/**
 * Delete object from AWS S3 or Smart Local Fallback
 */
const deleteMediaObject = async ({ key = '', url = '', lang = 'vi' }) => {
  let resolvedKey = String(key || '').trim();

  if (!resolvedKey && url) {
    const cleanUrl = String(url).trim();
    const uploadsMatch = cleanUrl.match(/\/uploads\/((?:landing|products|materials|custom-previews)\/[^?#]+)/);
    const s3Match = cleanUrl.match(/amazonaws\.com\/((?:landing|products|materials|custom-previews)\/[^?#]+)/);
    if (uploadsMatch) resolvedKey = uploadsMatch[1];
    else if (s3Match) resolvedKey = s3Match[1];
  }

  resolvedKey = resolvedKey.replace(/^\/+/, '');
  if (!resolvedKey) {
    throw new AppError(getMessage('MEDIA_MISSING_KEY', {}, lang), 400, 'MISSING_MEDIA_KEY');
  }

  const folderPrefix = resolvedKey.split('/')[0];
  if (!S3_FOLDERS.includes(folderPrefix)) {
    throw new AppError(
      getMessage('MEDIA_INVALID_FOLDER', { folder: folderPrefix, allowed: S3_FOLDERS.join(', ') }, lang),
      400,
      'INVALID_MEDIA_FOLDER'
    );
  }

  if (isS3Configured()) {
    try {
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Key: resolvedKey,
        })
      );
    } catch (s3Err) {
      console.warn(
        `[S3 DeleteObject Warning] Could not delete "${resolvedKey}" from S3 (${s3Err.name}: ${s3Err.message}).`
      );
    }
  }

  // Also remove local fallback file if present
  const localPath = path.join(LOCAL_UPLOAD_ROOT, resolvedKey);
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }

  return {
    deleted: true,
    key: resolvedKey,
    storageMode: isS3Configured() ? 's3' : 'local-fallback',
  };
};

module.exports = {
  LOCAL_UPLOAD_ROOT,
  isS3Configured,
  getStorageStatus,
  createPresignedUploadUrl,
  uploadMediaBuffer,
   uploadBuffer: uploadMediaBuffer,
  deleteMediaObject,
};
