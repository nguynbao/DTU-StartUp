/**
 * AWS S3 Media Synchronization Script (`npm run s3:sync`)
 * Downloads initial sample images for LandingContent, Products, and CustomMaterials,
 * uploads them to the configured AWS S3 Bucket under `landing/`, `products/`, `materials/`,
 * and updates MongoDB documents with the new S3 URLs.
 */
const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB } = require('../config/db');
const { isS3Configured, uploadMediaBuffer } = require('../services/s3.service');
const LandingContent = require('../models/LandingContent');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');

const urlCache = new Map();

const fetchAndUploadToS3 = async (sourceUrl, folder, fileNameHint) => {
  if (!sourceUrl || typeof sourceUrl !== 'string' || !sourceUrl.startsWith('http')) {
    return sourceUrl;
  }
  // Skip if already hosted on our S3 bucket
  if (sourceUrl.includes(env.AWS_S3_BUCKET_NAME)) {
    return sourceUrl;
  }

  const cacheKey = `${folder}:${sourceUrl}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey);
  }

  const res = await fetch(sourceUrl);
  if (!res.ok) {
    console.warn(`[S3 Sync] Skipping unreachable URL (${res.status}): ${sourceUrl}`);
    return sourceUrl;
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploaded = await uploadMediaBuffer({
    buffer,
    originalName: fileNameHint || 'synced-image.jpg',
    mimeType: contentType.split(';')[0].trim(),
    size: buffer.length,
    folder,
  });

  console.log(`  ✔ Uploaded [${folder}] -> ${uploaded.publicUrl}`);
  urlCache.set(cacheKey, uploaded.publicUrl);
  return uploaded.publicUrl;
};

const runS3Sync = async () => {
  console.log('====================================================================');
  console.log('🌊 DTU COASTAL CRAFT — AWS S3 MEDIA SYNCHRONIZATION TOOL');
  console.log('====================================================================');

  if (!isS3Configured()) {
    console.log('ℹ AWS S3 credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) chưa được điền trong .env.');
    console.log('  Hệ thống hiện đang hoạt động ở chế độ Smart Local Fallback (/uploads/...).');
    console.log('  Để đồng bộ toàn bộ ảnh mẫu lên AWS S3 Bucket thật:');
    console.log('  1. Điền AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME vào backend/.env');
    console.log('  2. Chạy lại lệnh: npm run s3:sync');
    return;
  }

  await connectDB();
  console.log(`[S3 Sync] Đang đồng bộ hình ảnh lên S3 Bucket: ${env.AWS_S3_BUCKET_NAME} (${env.AWS_REGION})...`);

  // 1. Sync LandingContent
  const landing = await LandingContent.findOne({ key: 'main_landing' });
  if (landing) {
    console.log('\n[1/3] Đồng bộ hình ảnh LandingContent...');
    const heroBg = await fetchAndUploadToS3(
      landing.hero?.heroImage || landing.heroBanner?.backgroundImageUrl,
      'landing',
      'hero-banner.jpg'
    );
    const heroSec = await fetchAndUploadToS3(
      landing.hero?.secondaryImageUrl || landing.heroBanner?.secondaryImageUrl,
      'landing',
      'ocean-net.jpg'
    );
    const heroTer = await fetchAndUploadToS3(
      landing.hero?.tertiaryImageUrl || landing.heroBanner?.tertiaryImageUrl,
      'landing',
      'net-product.jpg'
    );

    landing.hero.heroImage = heroBg;
    landing.hero.secondaryImageUrl = heroSec;
    landing.hero.tertiaryImageUrl = heroTer;
    landing.heroBanner.backgroundImageUrl = heroBg;
    landing.heroBanner.secondaryImageUrl = heroSec;
    landing.heroBanner.tertiaryImageUrl = heroTer;

    if (Array.isArray(landing.recyclingSteps)) {
      for (let i = 0; i < landing.recyclingSteps.length; i++) {
        landing.recyclingSteps[i].imageUrl = await fetchAndUploadToS3(
          landing.recyclingSteps[i].imageUrl,
          'landing',
          `recycling-step-${i + 1}.jpg`
        );
      }
    }

    if (Array.isArray(landing.processSteps)) {
      for (let i = 0; i < landing.processSteps.length; i++) {
        landing.processSteps[i].imageUrl = await fetchAndUploadToS3(
          landing.processSteps[i].imageUrl,
          'landing',
          `process-step-${i + 1}.jpg`
        );
      }
    }

    if (Array.isArray(landing.galleryImages)) {
      const syncedGallery = [];
      for (let i = 0; i < landing.galleryImages.length; i++) {
        syncedGallery.push(
          await fetchAndUploadToS3(landing.galleryImages[i], 'landing', `gallery-${i + 1}.jpg`)
        );
      }
      landing.galleryImages = syncedGallery;
    }

    if (landing.artisanStory) {
      landing.artisanStory.avatarUrl = await fetchAndUploadToS3(
        landing.artisanStory.avatarUrl,
        'landing',
        'artisan-lanh-avatar.jpg'
      );
      landing.artisanStory.workshopImageUrl = await fetchAndUploadToS3(
        landing.artisanStory.workshopImageUrl,
        'landing',
        'workshop-crafting.jpg'
      );
    }

    if (Array.isArray(landing.artisanStories)) {
      for (let i = 0; i < landing.artisanStories.length; i++) {
        landing.artisanStories[i].avatar = await fetchAndUploadToS3(
          landing.artisanStories[i].avatar,
          'landing',
          `artisan-avatar-${i + 1}.jpg`
        );
      }
    }

    await landing.save();
  }

  // 2. Sync Products
  const products = await Product.find();
  console.log(`\n[2/3] Đồng bộ hình ảnh cho ${products.length} Products...`);
  for (const prod of products) {
    prod.thumbnail = await fetchAndUploadToS3(prod.thumbnail, 'products', `${prod.slug}-thumb.jpg`);
    if (Array.isArray(prod.images)) {
      const newImgs = [];
      for (let i = 0; i < prod.images.length; i++) {
        newImgs.push(await fetchAndUploadToS3(prod.images[i], 'products', `${prod.slug}-${i + 1}.jpg`));
      }
      prod.images = newImgs;
    }
    await prod.save();
  }

  // 3. Sync CustomMaterials
  const materials = await CustomMaterial.find();
  console.log(`\n[3/3] Đồng bộ hình ảnh cho ${materials.length} CustomMaterials...`);
  for (const mat of materials) {
    mat.thumbnail = await fetchAndUploadToS3(mat.thumbnail, 'materials', `${mat.code.toLowerCase()}.jpg`);
    await mat.save();
  }

  console.log('\n✅ Hoàn tất đồng bộ toàn bộ hình ảnh lên AWS S3 và cập nhật MongoDB!');
};

if (require.main === module) {
  runS3Sync()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[S3 Sync Error]:', err);
      await mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = { runS3Sync };
