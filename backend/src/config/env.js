const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = parseInt(process.env.PORT || '5000', 10);

const env = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BACKEND_PUBLIC_URL: (process.env.BACKEND_PUBLIC_URL || `http://localhost:${port}`).replace(/\/+$/, ''),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dtu_upcycled_3d',
  JWT_SECRET: process.env.JWT_SECRET || 'dtu-ocean-upcycled-3d-super-secret-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    'http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3002',
  VIETQR_BANK_ID: process.env.VIETQR_BANK_ID || 'MB',
  VIETQR_BANK_NAME: process.env.VIETQR_BANK_NAME || 'MB - Ngân hàng Quân Đội (MB Bank)',
  VIETQR_ACCOUNT_NO: process.env.VIETQR_ACCOUNT_NO || '0905123456',
  VIETQR_TEMPLATE: process.env.VIETQR_TEMPLATE || 'compact2',
  VIETQR_ACCOUNT_NAME: process.env.VIETQR_ACCOUNT_NAME || 'CONG TY TAI CHE LUOI BIEN DTU',
  VIETQR_BASE_URL: process.env.VIETQR_BASE_URL || 'https://img.vietqr.io/image',
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@dtu-upcycled.vn',
  SEED_STAFF_EMAIL: process.env.SEED_STAFF_EMAIL || 'artisan@dtu-upcycled.vn',
  SEED_CUSTOMER_EMAIL: process.env.SEED_CUSTOMER_EMAIL || 'customer@dtu-upcycled.vn',
  SEED_DEFAULT_PASSWORD: process.env.SEED_DEFAULT_PASSWORD || 'Password123!',

  // AWS S3 & Hybrid Media Upload Config
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',
  AWS_ACCESS_KEY_ID: (process.env.AWS_ACCESS_KEY_ID || '').trim(),
  AWS_SECRET_ACCESS_KEY: (process.env.AWS_SECRET_ACCESS_KEY || '').trim(),
  AWS_S3_BUCKET_NAME: (process.env.AWS_S3_BUCKET_NAME || 'dtu-startup-coastal-media').trim(),
  AWS_S3_PUBLIC_BASE_URL: (process.env.AWS_S3_PUBLIC_BASE_URL || process.env.AWS_CLOUDFRONT_URL || '').trim().replace(/\/+$/, ''),
  AWS_S3_PRESIGNED_EXPIRES_IN: parseInt(process.env.AWS_S3_PRESIGNED_EXPIRES_IN || '300', 10),
  UPLOAD_MAX_FILE_SIZE_MB: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || '5', 10),

  // Render Anti-Sleep / Keep-Alive Heartbeat (Default: every 8 minutes)
  KEEP_ALIVE_ENABLED: String(process.env.KEEP_ALIVE_ENABLED || 'true').toLowerCase() !== 'false',
  KEEP_ALIVE_INTERVAL_MINUTES: parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES || '8', 10),
  KEEP_ALIVE_PING_URL: (
    process.env.KEEP_ALIVE_PING_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.BACKEND_PUBLIC_URL ||
    `http://localhost:${port}`
  ).replace(/\/+$/, ''),
};

env.uploadMaxFileSizeMb = env.UPLOAD_MAX_FILE_SIZE_MB;
env.keepAliveEnabled = env.KEEP_ALIVE_ENABLED;
env.keepAliveIntervalMinutes = env.KEEP_ALIVE_INTERVAL_MINUTES;
env.keepAlivePingUrl = env.KEEP_ALIVE_PING_URL;

module.exports = env;
