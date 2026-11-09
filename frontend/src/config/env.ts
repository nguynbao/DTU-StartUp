export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  STORE_URL: process.env.NEXT_PUBLIC_STORE_URL || '',
  CMS_URL: process.env.NEXT_PUBLIC_CMS_URL || '',
  S3_BASE_URL:
    process.env.NEXT_PUBLIC_S3_BASE_URL ||
    'https://dtu-img-db-868017909899-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com',
  DEFAULT_ADMIN_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || '',
  DEFAULT_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD || '',
  KEEP_ALIVE_MINUTES: Number(process.env.NEXT_PUBLIC_KEEP_ALIVE_MINUTES) || 8,
} as const;
