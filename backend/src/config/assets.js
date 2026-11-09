/**
 * Centralized Media, Images, S3 Folders & QR URL Registry for Backend
 * Youthful Ocean Aqua, Fresh Leaf Emerald & Pure White Theme
 * Complies with Zero-Hardcoding Governance (.agents/skills/nodejs-express-mongoose-architecture/SKILL.md)
 */
const env = require('./env');

const S3_FOLDERS = ['landing', 'products', 'materials', 'custom-previews'];

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const resolveS3PublicBaseUrl = () => {
  if (env.AWS_S3_PUBLIC_BASE_URL) {
    if (env.AWS_S3_PUBLIC_BASE_URL.startsWith('http://') || env.AWS_S3_PUBLIC_BASE_URL.startsWith('https://')) {
      return env.AWS_S3_PUBLIC_BASE_URL;
    }
    return `https://${env.AWS_S3_PUBLIC_BASE_URL}.s3.${env.AWS_REGION}.amazonaws.com`;
  }
  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com`;
};

const resolveS3Url = (key) => {
  const cleanKey = String(key || '').replace(/^\/+/, '');
  return `${resolveS3PublicBaseUrl()}/${cleanKey}`;
};

const LANDING_ASSETS = {
  HERO_BANNER: resolveS3Url('landing/1794196747773-8f48dbf8-hero-banner.jpg'),
  OCEAN_NET_RECOVERY: resolveS3Url('landing/1794196749896-4f82463d-ocean-net.jpg'),
  TURQUOISE_SEA_WAVE: resolveS3Url('landing/1794196752400-49373941-recycling-step-2.jpg'),
  CORAL_REEF_LIFE: resolveS3Url('materials/1794196761363-36da91bb-shl-cowrie-03.jpg'),
  ARTISAN_LANH_AVATAR: resolveS3Url('landing/1794196754885-c2af6f99-artisan-lanh-avatar.jpg'),
  ARTISAN_YEN_AVATAR: resolveS3Url('landing/1794196756459-83ea5bec-artisan-avatar-2.jpg'),
  WORKSHOP_CRAFTING: resolveS3Url('landing/1794196755297-f322ade6-workshop-crafting.jpg'),
};

const PRODUCT_ASSETS = {
  TOTE_BAG_SON_TRA_MAIN: resolveS3Url('products/1794196756807-6bc1252c-tui-xach-luoi-dai-duong-son-tra-thumb.jpg'),
  TOTE_BAG_SON_TRA_ALT: resolveS3Url('products/1794196757209-9cf5fa65-tui-xach-luoi-dai-duong-son-tra-2.jpg'),
  BASKET_CU_LAO_CHAM: resolveS3Url('products/1794196757534-14829cfe-gio-dung-do-luoi-bien-cu-lao-cham-thumb.jpg'),
  BASKET_CU_LAO_ALT: resolveS3Url('products/1794196757857-83712507-gio-dung-do-luoi-bien-cu-lao-cham-2.jpg'),
  WALLET_THANH_KHE: resolveS3Url('products/1794196758186-4f750e12-vi-tien-khoa-keo-soi-luoi-thanh-khe-thumb.jpg'),
  VEST_HAI_VAN: resolveS3Url('products/1794196758517-aae9e898-ao-khoac-gile-luoi-tai-che-hai-van-thumb.jpg'),
  BRACELET_MY_KHE: resolveS3Url('products/1794196758849-f7e98149-vong-tay-day-luoi-tet-thu-cong-my-khe-thumb.jpg'),
  SHELL_CHARM_SET: resolveS3Url('products/1794196759170-3dc5da58-bo-phu-kien-charm-vo-so-oc-bien-tu-nhien-thumb.jpg'),
  CROSSBODY_HOI_AN: resolveS3Url('products/1794196759566-d7cdf222-tui-deo-cheo-luoi-bien-hoi-an-vintage-thumb.jpg'),
  BRACELET_HAI_LUU: resolveS3Url('products/1794196759891-3fe67342-vong-tay-doi-hai-luu-xanh-ngoc-thumb.jpg'),
};

const MATERIAL_ASSETS = {
  SHELL_CLOSEUP: resolveS3Url('materials/1794196760274-2acd6510-shl-scallop-01.jpg'),
  BEACH_WAVE: resolveS3Url('materials/1794196760593-6f275285-shl-cockle-02.jpg'),
  OCEAN_CORAL: resolveS3Url('materials/1794196761363-36da91bb-shl-cowrie-03.jpg'),
  PEARL_CRAFT: resolveS3Url('materials/1794196761741-1c18332a-bed-pearl-01.jpg'),
  NET_CORD: resolveS3Url('materials/1794196762117-a0b31a5b-crd-knot-01.jpg'),
};

/**
 * Generates dynamic VietQR image URL using centralized env config
 */
const buildVietQrImageUrl = ({
  bankId = env.VIETQR_BANK_ID,
  accountNo = env.VIETQR_ACCOUNT_NO,
  template = env.VIETQR_TEMPLATE,
  amount = 0,
  transferContent = '',
  accountName = env.VIETQR_ACCOUNT_NAME,
}) => {
  const encodedName = encodeURIComponent(accountName);
  const encodedContent = encodeURIComponent(transferContent);
  return `${env.VIETQR_BASE_URL}/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedName}`;
};

module.exports = {
  S3_FOLDERS,
  ALLOWED_IMAGE_MIME_TYPES,
  resolveS3PublicBaseUrl,
  resolveS3Url,
  LANDING_ASSETS,
  PRODUCT_ASSETS,
  MATERIAL_ASSETS,
  buildVietQrImageUrl,
};
