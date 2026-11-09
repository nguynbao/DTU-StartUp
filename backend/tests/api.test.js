const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const { seedDatabase } = require('../src/seeds/seed');

let server;
let baseUrl;
let adminToken;
let staffToken;
let customerToken;
let sampleProduct;
let sampleMaterials = [];

const requestJson = async (method, path, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, body: data };
};

test.before(async () => {
  await connectDB();
  await seedDatabase({ force: true });
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;

  // Pre-authenticate Admin, Staff (Artisan), and Customer tokens for RBAC & CMS tests
  const [adminLogin, staffLogin, customerLogin] = await Promise.all([
    requestJson('POST', '/api/auth/login', {
      email: 'admin@dtu-upcycled.vn',
      password: 'Password123!',
    }),
    requestJson('POST', '/api/auth/login', {
      email: 'artisan@dtu-upcycled.vn',
      password: 'Password123!',
    }),
    requestJson('POST', '/api/auth/login', {
      email: 'customer@dtu-upcycled.vn',
      password: 'Password123!',
    }),
  ]);

  assert.equal(adminLogin.status, 200);
  assert.equal(staffLogin.status, 200);
  assert.equal(customerLogin.status, 200);

  adminToken = adminLogin.body.data.token;
  staffToken = staffLogin.body.data.token;
  customerToken = customerLogin.body.data.token;
});

test.after(async () => {
  await seedDatabase({ force: true });
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  const mongoose = require('mongoose');
  await mongoose.disconnect();
});

test('TC-01: LandingPage API & RBAC Content Management (FR-01, CMS-04, BR-08)', async () => {
  // 1. Health Check
  const health = await requestJson('GET', '/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.success, true);

  // 2. Public GET /api/content/landing (Happy Path)
  const landing = await requestJson('GET', '/api/content/landing');
  assert.equal(landing.status, 200);
  assert.equal(landing.body.success, true);
  assert.ok(landing.body.data.hero.title.includes('Lưới Ma Đại Dương'));
  assert.equal(landing.body.data.recyclingSteps.length, 4);
  assert.ok(landing.body.data.featuredProducts.length >= 6);
  assert.ok(landing.body.data.featuredMaterials.length >= 12);
  assert.ok(typeof landing.body.data.impactStats.ghostNetsCollectedKg === 'number');

  // 3. Security/RBAC: Guest without token calling PUT /api/content/landing -> 401 Unauthorized
  const guestPut = await requestJson('PUT', '/api/content/landing', {
    impactStats: { ghostNetsCollectedKg: 9999 },
  });
  assert.equal(guestPut.status, 401);
  assert.equal(guestPut.body.success, false);

  // 4. Security/RBAC: Customer role calling PUT /api/content/landing -> 403 Forbidden
  const customerPut = await requestJson(
    'PUT',
    '/api/content/landing',
    {
      impactStats: { ghostNetsCollectedKg: 9999 },
    },
    customerToken
  );
  assert.equal(customerPut.status, 403);
  assert.equal(customerPut.body.success, false);

  // 5. Admin role calling PUT /api/content/landing -> 200 OK & persists changes
  const adminPut = await requestJson(
    'PUT',
    '/api/content/landing',
    {
      impactStats: {
        ghostNetsCollectedKg: 3520,
        localArtisansSupported: 45,
      },
    },
    adminToken
  );
  assert.equal(adminPut.status, 200);
  assert.equal(adminPut.body.success, true);
  assert.equal(adminPut.body.data.impactStats.ghostNetsCollectedKg, 3520);
  assert.equal(adminPut.body.data.impactStats.localArtisansSupported, 45);
});

test('TC-02: Store Catalog, 6-Category Filtering, Price/Keyword Filter & 3D Metadata (FR-02, BR-09)', async () => {
  // 1. Fetch all active products
  const prodRes = await requestJson('GET', '/api/products');
  assert.equal(prodRes.status, 200);
  assert.ok(prodRes.body.data.length >= 8);

  // 2. Verify all 6 required categories exist and filter accurately
  const requiredCategories = ['basket', 'bag', 'wallet', 'apparel', 'bracelet', 'accessory'];
  for (const cat of requiredCategories) {
    const catRes = await requestJson('GET', `/api/products?category=${cat}`);
    assert.equal(catRes.status, 200, `Category ${cat} filter should return 200`);
    assert.ok(catRes.body.data.length >= 1, `Category ${cat} should have at least 1 product`);
    assert.ok(
      catRes.body.data.every((p) => p.category === cat),
      `All products returned for category=${cat} must match category`
    );
  }

  // 3. Filter by isCustomizable=true
  const customRes = await requestJson('GET', '/api/products?isCustomizable=true');
  assert.equal(customRes.status, 200);
  assert.ok(customRes.body.data.length >= 6);
  assert.ok(customRes.body.data.every((p) => p.isCustomizable === true));

  // 4. Filter by price range (minPrice=100000 & maxPrice=300000) and sort=price_asc
  const priceRes = await requestJson('GET', '/api/products?minPrice=100000&maxPrice=300000&sort=price_asc');
  assert.equal(priceRes.status, 200);
  assert.ok(priceRes.body.data.length >= 2);
  for (let i = 0; i < priceRes.body.data.length; i++) {
    const p = priceRes.body.data[i];
    assert.ok(p.basePrice >= 100000 && p.basePrice <= 300000, `Product price ${p.basePrice} out of range`);
    if (i > 0) {
      assert.ok(p.basePrice >= priceRes.body.data[i - 1].basePrice, 'Products should be sorted ascending by price');
    }
  }

  // 5. Keyword search
  const searchRes = await requestJson('GET', `/api/products?search=${encodeURIComponent('Sơn Trà')}`);
  assert.equal(searchRes.status, 200);
  assert.ok(searchRes.body.data.some((p) => p.slug === 'tui-xach-luoi-dai-duong-son-tra'));

  // 6. Product Detail by slug with model3D (BR-09) & ecoImpact (BR-08)
  const detailRes = await requestJson('GET', '/api/products/tui-xach-luoi-dai-duong-son-tra');
  assert.equal(detailRes.status, 200);
  sampleProduct = detailRes.body.data;
  assert.equal(sampleProduct.basePrice, 320000);
  assert.equal(sampleProduct.craftFee, 30000);
  assert.equal(sampleProduct.model3D.meshPreset, 'tote_bag');
  assert.equal(typeof sampleProduct.model3D.glbUrl, 'string');
  assert.ok(sampleProduct.ecoImpact.netWeightGrams > 0);
  assert.ok(sampleProduct.ecoImpact.oceanOrigin.includes('Sơn Trà'));

  // 7. Negative Case: Non-existent product slug -> 404 Not Found
  const notFoundRes = await requestJson('GET', '/api/products/san-pham-khong-ton-tai-999');
  assert.equal(notFoundRes.status, 404);
  assert.equal(notFoundRes.body.error.code, 'PRODUCT_NOT_FOUND');
});

test('TC-03: Materials & 3D Customizer Studio — Dynamic BOM Pricing & Boundary Validation (FR-03, FR-04, BR-01, BR-02, BR-03)', async () => {
  // 1. Fetch all active 3D Custom Materials (shells, snails, charms, beads, cords)
  const matRes = await requestJson('GET', '/api/materials');
  assert.equal(matRes.status, 200);
  assert.ok(matRes.body.data.length >= 12);
  sampleMaterials = matRes.body.data;

  const scallop = sampleMaterials.find((m) => m.code === 'SHL-SCALLOP-01'); // 15,000d
  const spiralSnail = sampleMaterials.find((m) => m.code === 'SNL-SPIRAL-01'); // 25,000d
  assert.ok(scallop && spiralSnail);

  // 2. Happy Path: 3D Free-form placements with client price tampering attempt (BR-01)
  const placements = [
    {
      materialId: scallop._id,
      position: [-0.2, 0.1, 0.4],
      normal: [0, 0, 1],
      rotation: 10,
      scale: 0.4, // Lower boundary valid scale (BR-03)
      color: '#FFFDF9',
      unitPrice: 1, // Client tampering attempt: tries to spoof price as 1 VND
    },
    {
      materialId: scallop._id,
      position: [0.0, 0.1, 0.4],
      normal: [0, 0.2, 0.98],
      rotation: 0,
      scale: 1.1,
      color: '#FFFDF9',
    },
    {
      materialId: scallop._id,
      position: [0.2, 0.1, 0.4],
      normal: [0, 0, 1],
      rotation: 360,
      scale: 2.5, // Upper boundary valid scale (BR-03)
      color: '#FFFDF9',
    },
    {
      materialId: spiralSnail._id,
      position: [0.0, 0.25, 0.4],
      normal: [0, 0, 1],
      rotation: 45,
      scale: 1.2,
      color: '#F59E0B',
      unitPrice: 0, // Client tampering attempt
    },
  ];

  // Calculate price endpoint must ignore client unitPrice and recalculate from DB:
  // 320,000 (basePrice) + 30,000 (craftFee) + (3 * 15,000) + (1 * 25,000) = 420,000 VND
  const calcRes = await requestJson('POST', '/api/custom-designs/calculate-price', {
    productId: sampleProduct._id,
    basePrice: 1000, // Client tampering attempt
    estimatedPrice: 1000, // Client tampering attempt
    placements,
  });
  assert.equal(calcRes.status, 200);
  assert.equal(calcRes.body.data.pricingBreakdown.basePrice, 320000);
  assert.equal(calcRes.body.data.pricingBreakdown.craftFee, 30000);
  assert.equal(calcRes.body.data.pricingBreakdown.materialsTotal, 70000);
  assert.equal(calcRes.body.data.pricingBreakdown.estimatedPrice, 420000);

  // Save custom design & retrieve by shareCode (including Spec v2.0 braceletConfig, slotIndex & isDanglingCharm)
  const saveRes = await requestJson('POST', '/api/custom-designs', {
    productId: sampleProduct._id,
    name: 'Túi Lưới Custom Test TC-03',
    baseColor: '#0F766E',
    strapColor: '#C2B280',
    braceletConfig: {
      wristSizeCm: 17,
      slotCount: 14,
      cordMaterial: 'recycled_net_cord',
    },
    placements: placements.map((p, idx) => ({
      ...p,
      slotIndex: idx,
      isDanglingCharm: idx === 3,
    })),
  });
  assert.equal(saveRes.status, 201);
  assert.equal(saveRes.body.data.pricingBreakdown.estimatedPrice, 420000);
  assert.equal(saveRes.body.data.braceletConfig.wristSizeCm, 17);
  assert.equal(saveRes.body.data.braceletConfig.slotCount, 14);
  assert.equal(saveRes.body.data.placements[0].slotIndex, 0);
  assert.equal(saveRes.body.data.placements[3].isDanglingCharm, true);
  assert.ok(saveRes.body.data.shareCode.startsWith('3D-'));

  const getDesignRes = await requestJson('GET', `/api/custom-designs/${saveRes.body.data.shareCode}`);
  assert.equal(getDesignRes.status, 200);
  assert.equal(getDesignRes.body.data.placements.length, 4);

  // 3. Boundary Case (BR-02): Exactly 50 accessories -> Allowed (200 OK)
  const fiftyPlacements = Array.from({ length: 50 }, (_, idx) => ({
    materialId: scallop._id,
    position: [0.01 * idx, 0.1, 0.4],
    normal: [0, 0, 1],
    rotation: 0,
    scale: 1.0,
  }));
  const fiftyRes = await requestJson('POST', '/api/custom-designs/calculate-price', {
    productId: sampleProduct._id,
    placements: fiftyPlacements,
  });
  assert.equal(fiftyRes.status, 200);
  assert.equal(fiftyRes.body.data.placementsCount, 50);

  // 4. Boundary/Negative Case (BR-02): 51 accessories -> Rejected with 400 Bad Request
  const fiftyOnePlacements = [
    ...fiftyPlacements,
    { materialId: scallop._id, position: [0, 0, 0.4], normal: [0, 0, 1], scale: 1.0 },
  ];
  const exceedMaxRes = await requestJson('POST', '/api/custom-designs', {
    productId: sampleProduct._id,
    placements: fiftyOnePlacements,
  });
  assert.equal(exceedMaxRes.status, 400);
  assert.equal(exceedMaxRes.body.error.code, 'MAX_PLACEMENTS_EXCEEDED');

  // 5. Boundary/Negative Case (BR-03): scale = 0.1 (< 0.4) -> Rejected with 400 Bad Request
  const tooSmallScaleRes = await requestJson('POST', '/api/custom-designs', {
    productId: sampleProduct._id,
    placements: [{ materialId: scallop._id, position: [0, 0, 0], normal: [0, 0, 1], scale: 0.1 }],
  });
  assert.equal(tooSmallScaleRes.status, 400);
  assert.equal(tooSmallScaleRes.body.error.code, 'INVALID_SCALE');

  // 6. Boundary/Negative Case (BR-03): scale = 5.0 (> 2.5) -> Rejected with 400 Bad Request
  const tooLargeScaleRes = await requestJson('POST', '/api/custom-designs', {
    productId: sampleProduct._id,
    placements: [{ materialId: scallop._id, position: [0, 0, 0], normal: [0, 0, 1], scale: 5.0 }],
  });
  assert.equal(tooLargeScaleRes.status, 400);
  assert.equal(tooLargeScaleRes.body.error.code, 'INVALID_SCALE');

  // 7. Negative Case (BR-03): Invalid 3D coordinate vector position -> 400 Bad Request
  const badPosRes = await requestJson('POST', '/api/custom-designs', {
    productId: sampleProduct._id,
    placements: [{ materialId: scallop._id, position: [0, 0], normal: [0, 0, 1], scale: 1.0 }],
  });
  assert.equal(badPosRes.status, 400);
  assert.equal(badPosRes.body.error.code, 'INVALID_POSITION');
});

test('TC-04: Order Creation, Atomic Dual-Inventory BOM, Immutable 3D Snapshot & VietQR (FR-05, BR-04, BR-07, BR-10)', async () => {
  const basket = (await requestJson('GET', '/api/products/gio-dung-do-luoi-bien-cu-lao-cham')).body.data;
  const starfish = sampleMaterials.find((m) => m.code === 'CHM-STAR-01');
  const rareSnail = sampleMaterials.find((m) => m.code === 'SNL-TURBAN-02'); // stockQuantity = 9

  const initialBasketStock = basket.stock;
  const initialStarfishStock = starfish.stockQuantity;
  const initialRareSnailStock = rareSnail.stockQuantity;

  // 1. Happy Path: Order 2 custom baskets, each with 3 starfish charms -> deducts 2 baskets and 6 starfish charms
  const orderRes = await requestJson('POST', '/api/orders', {
    customerInfo: {
      fullName: 'Nguyễn Văn Nghiệm Thu',
      phone: '0905777888',
      email: 'qa@dtu.edu.vn',
      address: '03 Quang Trung, Hải Châu',
      city: 'Đà Nẵng',
    },
    paymentMethod: 'vietqr',
    items: [
      {
        productId: basket._id,
        quantity: 2,
        isCustom: true,
        placements: [
          { materialId: starfish._id, position: [0.1, 0.2, 0.3], normal: [0, 0, 1], scale: 1.0 },
          { materialId: starfish._id, position: [0.2, 0.2, 0.3], normal: [0, 0, 1], scale: 1.0 },
          { materialId: starfish._id, position: [0.3, 0.2, 0.3], normal: [0, 0, 1], scale: 1.0 },
        ],
      },
    ],
  });

  assert.equal(orderRes.status, 201);
  const createdOrder = orderRes.body.data;

  // BR-10: Order code format DTU-YYYYMMDD-XXXX & VietQR info
  assert.match(createdOrder.orderCode, /^DTU-\d{8}-[A-Z0-9]{4}$/);
  assert.equal(createdOrder.vietqrInfo.transferContent, createdOrder.orderCode);
  assert.ok(createdOrder.vietqrInfo.qrImageUrl.includes(createdOrder.orderCode));

  // BR-07: Immutable customDesignSnapshot & bomSummary embedded in order item
  const orderItem = createdOrder.items[0];
  assert.equal(orderItem.isCustom, true);
  assert.ok(orderItem.customDesignSnapshot);
  assert.equal(orderItem.customDesignSnapshot.placements.length, 3);
  assert.equal(orderItem.bomSummary.length, 1);
  assert.equal(orderItem.bomSummary[0].code, 'CHM-STAR-01');
  assert.equal(orderItem.bomSummary[0].quantityPerItem, 3);
  assert.equal(orderItem.bomSummary[0].totalQuantity, 6);

  // BR-04: Verify Dual-Inventory Deduction in Database
  const basketAfter = (await requestJson('GET', '/api/products/gio-dung-do-luoi-bien-cu-lao-cham')).body.data;
  const matsAfter = (await requestJson('GET', '/api/materials')).body.data;
  const starfishAfter = matsAfter.find((m) => m.code === 'CHM-STAR-01');

  assert.equal(basketAfter.stock, initialBasketStock - 2);
  assert.equal(starfishAfter.stockQuantity, initialStarfishStock - 6);

  // 2. Edge/Negative Case (BR-04): Order requiring 12 rare snails (3 baskets * 4 snails) when only 9 are in stock
  // Also includes starfish in the same design to prove ZERO partial deduction occurs across ANY product or material
  const failOrderRes = await requestJson('POST', '/api/orders', {
    customerInfo: {
      fullName: 'Khách Test Lỗi Tồn Kho',
      phone: '0905000111',
      address: 'Đà Nẵng',
    },
    items: [
      {
        productId: basket._id,
        quantity: 3,
        isCustom: true,
        placements: [
          { materialId: starfish._id, position: [-0.1, 0, 0], normal: [0, 0, 1], scale: 1.0 },
          { materialId: rareSnail._id, position: [0, 0, 0], normal: [0, 0, 1], scale: 1.0 },
          { materialId: rareSnail._id, position: [0.1, 0, 0], normal: [0, 0, 1], scale: 1.0 },
          { materialId: rareSnail._id, position: [0.2, 0, 0], normal: [0, 0, 1], scale: 1.0 },
          { materialId: rareSnail._id, position: [0.3, 0, 0], normal: [0, 0, 1], scale: 1.0 },
        ],
      },
    ],
  });
  assert.equal(failOrderRes.status, 400);
  assert.equal(failOrderRes.body.error.code, 'INSUFFICIENT_MATERIAL_STOCK');

  // Verify neither basket, starfish, nor rareSnail stock decreased after failed order
  const basketAfterFail = (await requestJson('GET', '/api/products/gio-dung-do-luoi-bien-cu-lao-cham')).body.data;
  const matsAfterFail = (await requestJson('GET', '/api/materials')).body.data;
  const starfishAfterFail = matsAfterFail.find((m) => m.code === 'CHM-STAR-01');
  const rareSnailAfterFail = matsAfterFail.find((m) => m.code === 'SNL-TURBAN-02');

  assert.equal(basketAfterFail.stock, basketAfter.stock);
  assert.equal(starfishAfterFail.stockQuantity, starfishAfter.stockQuantity);
  assert.equal(rareSnailAfterFail.stockQuantity, initialRareSnailStock);
});

test('TC-05: Order State Machine & Cancel Rollback Rules (BR-05, BR-06)', async () => {
  // 1. Create a fresh custom order to test cancellation & full inventory rollback (BR-06)
  const wallet = (await requestJson('GET', '/api/products/vi-tien-khoa-keo-soi-luoi-thanh-khe')).body.data;
  const matsBefore = (await requestJson('GET', '/api/materials')).body.data;
  const pearlBefore = matsBefore.find((m) => m.code === 'BED-PEARL-01');

  const stockBeforeOrder = wallet.stock;
  const pearlStockBeforeOrder = pearlBefore.stockQuantity;

  const newOrderRes = await requestJson('POST', '/api/orders', {
    customerInfo: {
      fullName: 'Trần Thị Hoàn Kho',
      phone: '0905999000',
      address: '15 Nguyễn Văn Linh, Đà Nẵng',
    },
    items: [
      {
        productId: wallet._id,
        quantity: 2,
        isCustom: true,
        placements: [
          { materialId: pearlBefore._id, position: [0, 0, 0.1], normal: [0, 0, 1], scale: 1.0 },
          { materialId: pearlBefore._id, position: [0.1, 0, 0.1], normal: [0, 0, 1], scale: 1.0 },
        ],
      },
    ],
  });
  assert.equal(newOrderRes.status, 201);
  const cancelTargetCode = newOrderRes.body.data.orderCode;

  // Verify stock was deducted (-2 wallets, -4 pearls)
  const walletMid = (await requestJson('GET', '/api/products/vi-tien-khoa-keo-soi-luoi-thanh-khe')).body.data;
  const pearlMid = (await requestJson('GET', '/api/materials')).body.data.find((m) => m.code === 'BED-PEARL-01');
  assert.equal(walletMid.stock, stockBeforeOrder - 2);
  assert.equal(pearlMid.stockQuantity, pearlStockBeforeOrder - 4);

  // Cancel the `pending` order -> Must succeed (200) and restore both Product.stock and CustomMaterial.stockQuantity (BR-06)
  const cancelRes = await requestJson('POST', `/api/orders/${cancelTargetCode}/cancel`, {
    phone: '0905999000',
    reason: 'Đổi ý muốn chọn mẫu túi lớn hơn',
  });
  assert.equal(cancelRes.status, 200);
  assert.equal(cancelRes.body.data.status, 'cancelled');
  assert.equal(cancelRes.body.data.inventoryDeducted, false);

  const walletRestored = (await requestJson('GET', '/api/products/vi-tien-khoa-keo-soi-luoi-thanh-khe')).body.data;
  const pearlRestored = (await requestJson('GET', '/api/materials')).body.data.find((m) => m.code === 'BED-PEARL-01');
  assert.equal(walletRestored.stock, stockBeforeOrder);
  assert.equal(pearlRestored.stockQuantity, pearlStockBeforeOrder);

  // 2. State Machine transition `pending` -> `confirmed` -> `in_crafting`, then attempt cancel -> Blocked 400 (BR-05)
  const order2Res = await requestJson('POST', '/api/orders', {
    customerInfo: {
      fullName: 'Lê Văn Chế Tác',
      phone: '0905123123',
      address: '20 Bạch Đằng, Đà Nẵng',
    },
    items: [{ productId: wallet._id, quantity: 1, isCustom: false }],
  });
  assert.equal(order2Res.status, 201);
  const craftOrderCode = order2Res.body.data.orderCode;

  // Transition pending -> confirmed (by Staff/Artisan)
  const toConfirmed = await requestJson(
    'PATCH',
    `/api/orders/${craftOrderCode}/status`,
    { status: 'confirmed', note: 'Xưởng xác nhận đơn' },
    staffToken
  );
  assert.equal(toConfirmed.status, 200);
  assert.equal(toConfirmed.body.data.status, 'confirmed');

  // Transition confirmed -> in_crafting (by Staff/Artisan)
  const toInCrafting = await requestJson(
    'PATCH',
    `/api/orders/${craftOrderCode}/status`,
    { status: 'in_crafting', note: 'Nghệ nhân bắt đầu đan lưới & khâu phụ kiện' },
    staffToken
  );
  assert.equal(toInCrafting.status, 200);
  assert.equal(toInCrafting.body.data.status, 'in_crafting');

  // Customer tries to cancel when in_crafting -> Must return 400 CANNOT_CANCEL_IN_CRAFTING (BR-05)
  const customerCancelInCrafting = await requestJson('POST', `/api/orders/${craftOrderCode}/cancel`, {
    phone: '0905123123',
    reason: 'Muốn hủy khi đang làm',
  });
  assert.equal(customerCancelInCrafting.status, 400);
  assert.equal(customerCancelInCrafting.body.error.code, 'CANNOT_CANCEL_IN_CRAFTING');

  // Admin tries to cancel when in_crafting -> Must also return 400 CANNOT_CANCEL_IN_CRAFTING (BR-05)
  const adminCancelInCrafting = await requestJson(
    'PATCH',
    `/api/orders/${craftOrderCode}/status`,
    { status: 'cancelled', note: 'Admin thử hủy đơn đang chế tác' },
    adminToken
  );
  assert.equal(adminCancelInCrafting.status, 400);
  assert.equal(adminCancelInCrafting.body.error.code, 'CANNOT_CANCEL_IN_CRAFTING');
});

test('TC-06: Admin CMS Dashboard & CRUD for Products and CustomMaterials (FR-06, CMS-01..CMS-04)', async () => {
  // 1. Security/RBAC: Customer cannot access /api/admin/dashboard -> 403 Forbidden
  const customerDash = await requestJson('GET', '/api/admin/dashboard', null, customerToken);
  assert.equal(customerDash.status, 403);

  // 2. Admin & Staff can access /api/admin/dashboard -> 200 OK (CMS-01)
  const dashRes = await requestJson('GET', '/api/admin/dashboard', null, adminToken);
  assert.equal(dashRes.status, 200);
  assert.ok(dashRes.body.data.summary.totalProducts >= 8);
  assert.ok(dashRes.body.data.summary.totalMaterials >= 12);
  assert.ok(Array.isArray(dashRes.body.data.lowStockMaterials));
  assert.ok(dashRes.body.data.lowStockMaterials.some((m) => m.code === 'SNL-TURBAN-02'));

  // 3. Products CRUD (CMS-03): Staff blocked (403), Admin allowed (201 & 200)
  const staffCreateProd = await requestJson(
    'POST',
    '/api/products',
    { name: 'Sản phẩm Staff Tạo Trái Phép', category: 'bag', basePrice: 200000 },
    staffToken
  );
  assert.equal(staffCreateProd.status, 403);

  const adminCreateProd = await requestJson(
    'POST',
    '/api/products',
    {
      name: 'Túi Lưới Đại Dương Phiên Bản Giới Hạn QA',
      category: 'bag',
      basePrice: 390000,
      craftFee: 35000,
      stock: 15,
      isCustomizable: true,
      model3D: {
        meshPreset: 'tote_bag',
        glbUrl: 'https://cdn.dtu-upcycled.vn/models/limited-tote.glb',
        defaultBaseColor: '#0F766E',
        defaultStrapColor: '#D97706',
      },
      ecoImpact: {
        netWeightGrams: 260,
        oceanOrigin: 'Bán đảo Sơn Trà',
      },
    },
    adminToken
  );
  assert.equal(adminCreateProd.status, 201);
  const createdProdId = adminCreateProd.body.data._id;
  assert.equal(adminCreateProd.body.data.model3D.glbUrl, 'https://cdn.dtu-upcycled.vn/models/limited-tote.glb');

  const adminUpdateProd = await requestJson(
    'PUT',
    `/api/products/${createdProdId}`,
    { basePrice: 410000, stock: 22 },
    adminToken
  );
  assert.equal(adminUpdateProd.status, 200);
  assert.equal(adminUpdateProd.body.data.basePrice, 410000);
  assert.equal(adminUpdateProd.body.data.stock, 22);

  // 4. CustomMaterials CRUD (CMS-03): Create & Update new seashell/snail material
  const adminCreateMat = await requestJson(
    'POST',
    '/api/materials',
    {
      name: 'Ốc Hoàng Đế Cù Lao Chàm (QA Test)',
      code: 'SNL-EMPEROR-QA',
      materialType: 'snail',
      unitPrice: 40000,
      stockQuantity: 30,
      model3D: {
        meshPreset: 'spiral_snail',
        glbUrl: '',
        defaultScale: 1.1,
      },
    },
    adminToken
  );
  assert.equal(adminCreateMat.status, 201);
  const createdMatId = adminCreateMat.body.data._id;

  const adminUpdateMat = await requestJson(
    'PUT',
    `/api/materials/${createdMatId}`,
    { unitPrice: 45000, stockQuantity: 45 },
    adminToken
  );
  assert.equal(adminUpdateMat.status, 200);
  assert.equal(adminUpdateMat.body.data.unitPrice, 45000);
  assert.equal(adminUpdateMat.body.data.stockQuantity, 45);
});

test('TC-07: Multi-language i18n (?lang=vi vs ?lang=en & Accept-Language) & Zero-Hardcoding Config Audit', async () => {
  // 1. Health check in Vietnamese (default) vs English (?lang=en)
  const healthVi = await requestJson('GET', '/api/health?lang=vi');
  assert.equal(healthVi.status, 200);
  assert.ok(healthVi.body.message.includes('đang hoạt động ổn định'));

  const healthEn = await requestJson('GET', '/api/health?lang=en');
  assert.equal(healthEn.status, 200);
  assert.equal(healthEn.body.message, 'DTU Upcycled Fishing Net & 3D Ocean Craft API is healthy');

  // 2. Catalog & Materials endpoints in English (?lang=en)
  const prodEn = await requestJson('GET', '/api/products?lang=en');
  assert.equal(prodEn.status, 200);
  assert.equal(prodEn.body.message, 'Fetched product list successfully');

  const matEn = await requestJson('GET', '/api/materials?lang=en');
  assert.equal(matEn.status, 200);
  assert.equal(matEn.body.message, 'Fetched custom materials successfully');

  // 3. Error messages localized in English (?lang=en)
  const notFoundEn = await requestJson('GET', '/api/products/non-existent-item-999?lang=en');
  assert.equal(notFoundEn.status, 404);
  assert.equal(notFoundEn.body.message, 'Product not found');
  assert.equal(notFoundEn.body.error.code, 'PRODUCT_NOT_FOUND');

  const scallop = sampleMaterials.find((m) => m.code === 'SHL-SCALLOP-01');
  const badScaleEn = await requestJson('POST', '/api/custom-designs?lang=en', {
    productId: sampleProduct._id,
    placements: [{ materialId: scallop._id, position: [0, 0, 0], normal: [0, 0, 1], scale: 5.0 }],
  });
  assert.equal(badScaleEn.status, 400);
  assert.equal(badScaleEn.body.error.code, 'INVALID_SCALE');
  assert.ok(badScaleEn.body.message.includes('outside allowed range [0.4 - 2.5]'));

  // 4. Accept-Language header resolution (en-US)
  const resHeaderEn = await fetch(`${baseUrl}/api/content/landing`, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });
  const bodyHeaderEn = await resHeaderEn.json();
  assert.equal(resHeaderEn.status, 200);
  assert.equal(bodyHeaderEn.message, 'Fetched LandingPage content successfully');

  // 5. Verify centralized Zero-Hardcoding registries (env, theme, assets, i18n)
  const envConfig = require('../src/config/env');
  const themeConfig = require('../src/config/theme');
  const assetsConfig = require('../src/config/assets');
  const i18nMessages = require('../src/i18n/messages');

  assert.ok(envConfig.PORT && envConfig.JWT_SECRET && envConfig.VIETQR_BASE_URL);
  assert.ok(themeConfig.BASE_COLORS.OCEAN_TEAL && themeConfig.MATERIAL_PALETTES.SCALLOP_SHELL.length > 0);
  assert.ok(assetsConfig.PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN.startsWith('https://'));
  assert.ok(i18nMessages.MESSAGES.vi && i18nMessages.MESSAGES.en);
});

test('TC-08: Hybrid AWS S3 Media Upload, Presigned URL, MIME Security & Landing Image CMS Update', async () => {
  // 1. Check Media Storage Status (GET /api/media/status)
  const statusRes = await requestJson('GET', '/api/media/status');
  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.success, true);
  assert.ok(['s3', 'local-fallback'].includes(statusRes.body.data.storageMode));
  assert.ok(statusRes.body.data.folders.includes('landing'));
  assert.ok(statusRes.body.data.folders.includes('products'));
  assert.ok(statusRes.body.data.folders.includes('materials'));
  assert.ok(statusRes.body.data.folders.includes('custom-previews'));

  // 2. Security: Guest cannot request presigned upload to 'landing' folder -> 401 Unauthorized
  const guestPresign = await requestJson('POST', '/api/media/presigned-url', {
    folder: 'landing',
    fileName: 'hero-ocean.png',
    mimeType: 'image/png',
  });
  assert.equal(guestPresign.status, 401);

  // 3. Admin requests Presigned URL for 'landing' folder -> 200 OK
  const adminPresign = await requestJson(
    'POST',
    '/api/media/presigned-url',
    {
      folder: 'landing',
      fileName: 'hero-ocean.png',
      mimeType: 'image/png',
    },
    adminToken
  );
  assert.equal(adminPresign.status, 200);
  assert.ok(adminPresign.body.data.uploadUrl);
  assert.ok(adminPresign.body.data.publicUrl);
  assert.ok(adminPresign.body.data.key.startsWith('landing/'));

  // 4. Security: Reject dangerous SVG MIME type ('image/svg+xml') to prevent XSS -> 400 Bad Request
  const badMimeRes = await requestJson(
    'POST',
    '/api/media/presigned-url',
    {
      folder: 'products',
      fileName: 'malicious.svg',
      mimeType: 'image/svg+xml',
    },
    adminToken
  );
  assert.equal(badMimeRes.status, 400);
  assert.equal(badMimeRes.body.error.code, 'INVALID_MEDIA_MIME_TYPE');

  // 5. Multipart File Upload (POST /api/media/upload) with a valid 1x1 PNG buffer
  const samplePngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(samplePngBase64, 'base64');

  const formData = new FormData();
  formData.append('folder', 'landing');
  formData.append('file', new Blob([pngBuffer], { type: 'image/png' }), 'ocean-net-banner.png');

  const uploadRes = await fetch(`${baseUrl}/api/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  assert.equal(uploadRes.status, 201);
  assert.equal(uploadData.success, true);
  assert.ok(uploadData.data.url);
  assert.ok(uploadData.data.key.startsWith('landing/'));

  const uploadedImageUrl = uploadData.data.url;

  // 6. Update LandingPage Images via PUT /api/admin/landing with the newly uploaded S3/Fallback URL
  const updateLandingRes = await requestJson(
    'PUT',
    '/api/admin/landing',
    {
      heroBanner: {
        backgroundImageUrl: uploadedImageUrl,
        secondaryImageUrl: uploadedImageUrl,
        tertiaryImageUrl: uploadedImageUrl,
      },
      galleryImages: [uploadedImageUrl],
    },
    adminToken
  );
  assert.equal(updateLandingRes.status, 200);
  assert.equal(updateLandingRes.body.data.heroBanner.backgroundImageUrl, uploadedImageUrl);
  assert.equal(updateLandingRes.body.data.hero.heroImage, uploadedImageUrl);
  assert.ok(updateLandingRes.body.data.galleryImages.includes(uploadedImageUrl));

  // 7. Delete uploaded media file (DELETE /api/media)
  const deleteRes = await requestJson(
    'DELETE',
    '/api/media',
    {
      key: uploadData.data.key,
    },
    adminToken
  );
  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.body.data.deleted, true);
});


