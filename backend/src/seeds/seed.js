const User = require('../models/User');
const Product = require('../models/Product');
const CustomMaterial = require('../models/CustomMaterial');
const CustomDesign = require('../models/CustomDesign');
const Order = require('../models/Order');
const LandingContent = require('../models/LandingContent');
const env = require('../config/env');
const { PRODUCT_ASSETS, MATERIAL_ASSETS, buildVietQrImageUrl } = require('../config/assets');
const { BASE_COLORS, CHARM_COLORS, MATERIAL_PALETTES } = require('../config/theme');
const { connectDB } = require('../config/db');

const initialUsers = [
  {
    fullName: 'Quản Trị Viên Nét Biển DTU',
    email: env.SEED_ADMIN_EMAIL,
    phone: '0905111222',
    password: env.SEED_DEFAULT_PASSWORD,
    role: 'admin',
    address: {
      street: '254 Nguyễn Văn Linh',
      ward: 'Thạc Gián',
      district: 'Thanh Khê',
      city: 'Đà Nẵng',
    },
  },
  {
    fullName: 'Nghệ Nhân Nguyễn Thị Lành',
    email: env.SEED_STAFF_EMAIL,
    phone: '0905333444',
    password: env.SEED_DEFAULT_PASSWORD,
    role: 'staff',
    address: {
      street: 'Làng chài Thanh Khê',
      ward: 'Thanh Khê Đông',
      district: 'Thanh Khê',
      city: 'Đà Nẵng',
    },
  },
  {
    fullName: 'Lê Minh Hải (Khách hàng)',
    email: env.SEED_CUSTOMER_EMAIL,
    phone: '0905888999',
    password: env.SEED_DEFAULT_PASSWORD,
    role: 'customer',
    address: {
      street: '12 Bạch Đằng',
      ward: 'Thạch Thang',
      district: 'Hải Châu',
      city: 'Đà Nẵng',
    },
  },
];

const initialProducts = [
  {
    name: 'Túi Xách Lưới Đại Dương Sơn Trà',
    slug: 'tui-xach-luoi-dai-duong-son-tra',
    sku: 'BAG-SONTRA-01',
    category: 'bag',
    shortDescription: 'Túi Tote đan tay từ lưới đánh cá thu hồi tại bán đảo Sơn Trà, hỗ trợ đính vỏ sò & ốc biển 3D tự do.',
    description:
      'Được chế tác từ 100% sợi lưới đánh cá HDPE thu hồi tại vùng biển Sơn Trà (Đà Nẵng), xử lý khử muối sinh học và đan macrame 2 lớp chắc chắn. Bề mặt mắt lưới thông thoáng, cực kỳ lý tưởng để bạn tự tay gắn vỏ sò điệp, ốc xoắn hay sao biển trên phòng 3D Studio.',
    basePrice: 320000,
    craftFee: 30000,
    stock: 25,
    thumbnail: PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN,
    images: [PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN, PRODUCT_ASSETS.TOTE_BAG_SON_TRA_ALT],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    availableSizes: ['Tiêu chuẩn (38x42cm)', 'Cỡ lớn (45x48cm)'],
    model3D: {
      meshPreset: 'tote_bag',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.OCEAN_TEAL,
      defaultStrapColor: BASE_COLORS.ROPE_NATURAL,
      roughness: 0.72,
      metalness: 0.05,
    },
    ecoImpact: {
      netWeightGrams: 240,
      oceanOrigin: 'Bán đảo Sơn Trà, Đà Nẵng',
      artisanGroup: 'Tổ hợp tác Phụ nữ Làng chài Thọ Quang',
      recycledPlasticRatio: 94,
      co2SavedGrams: 680,
    },
    soldCount: 128,
    rating: 4.9,
  },
  {
    name: 'Giỏ Đựng Đồ Lưới Biển Cù Lao Chàm',
    slug: 'gio-dung-do-luoi-bien-cu-lao-cham',
    sku: 'BSK-CULAOC-01',
    category: 'basket',
    shortDescription: 'Giỏ đựng đồ đa năng kết hợp sợi lưới biển tái chế và khung dây thừng đay tự nhiên bền bỉ.',
    description:
      'Giỏ đựng đồ decor không gian sống xanh, được bện xoắn từ các bó lưới vây tàu cá Cù Lao Chàm kết hợp đế cói biển chống ẩm. Khung giỏ trụ tròn cứng cáp, cho phép gắn trang trí vỏ sò, ốc nhảy và charm biển xung quanh vành giỏ trên 3D Studio.',
    basePrice: 280000,
    craftFee: 25000,
    stock: 18,
    thumbnail: PRODUCT_ASSETS.BASKET_CU_LAO_CHAM,
    images: [PRODUCT_ASSETS.BASKET_CU_LAO_CHAM, PRODUCT_ASSETS.BASKET_CU_LAO_ALT],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    availableSizes: ['Cỡ vừa (Đường kính 28cm)', 'Cỡ đại (Đường kính 36cm)'],
    model3D: {
      meshPreset: 'storage_basket',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.ROPE_NATURAL,
      defaultStrapColor: BASE_COLORS.OCEAN_TEAL,
      roughness: 0.85,
      metalness: 0.02,
    },
    ecoImpact: {
      netWeightGrams: 380,
      oceanOrigin: 'Khu dự trữ sinh quyển Cù Lao Chàm',
      artisanGroup: 'Hợp tác xã Thủ công Xanh Hội An',
      recycledPlasticRatio: 90,
      co2SavedGrams: 950,
    },
    soldCount: 86,
    rating: 4.8,
  },
  {
    name: 'Ví Tiền Khóa Kéo Sợi Lưới Thanh Khê',
    slug: 'vi-tien-khoa-keo-soi-luoi-thanh-khe',
    sku: 'WAL-THANHKHE-01',
    category: 'wallet',
    shortDescription: 'Ví cầm tay gọn nhẹ dệt mật độ cao từ sợi lưới cước tái chế, chống thấm nước biển tuyệt đối.',
    description:
      'Chiếc ví tiền đa ngăn được ép nhiệt và khâu viền tỉ mỉ từ sợi lưới đánh cá thu hồi tại vịnh Đà Nẵng. Thiết kế phẳng hiện đại, dễ dàng đính điểm nhấn các hạt ngọc trai, vỏ ốc sứ trắng hoặc sao biển nhỏ xinh ở mặt trước và mặt sau.',
    basePrice: 185000,
    craftFee: 20000,
    stock: 32,
    thumbnail: PRODUCT_ASSETS.WALLET_THANH_KHE,
    images: [PRODUCT_ASSETS.WALLET_THANH_KHE],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    availableSizes: ['Mini (12x9cm)', 'Dài (19x10cm)'],
    model3D: {
      meshPreset: 'zip_wallet',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.SEA_SLATE,
      defaultStrapColor: BASE_COLORS.CORAL_AMBER,
      roughness: 0.65,
      metalness: 0.1,
    },
    ecoImpact: {
      netWeightGrams: 95,
      oceanOrigin: 'Vịnh Đà Nẵng - Làng chài Thanh Khê',
      artisanGroup: 'Nhóm Nghệ nhân Trẻ DTU Blue Ocean',
      recycledPlasticRatio: 96,
      co2SavedGrams: 290,
    },
    soldCount: 104,
    rating: 4.9,
  },
  {
    name: 'Áo Khoác Gile Lưới Tái Chế Hải Vân',
    slug: 'ao-khoac-gile-luoi-tai-che-hai-van',
    sku: 'APP-HAIVAN-01',
    category: 'apparel',
    shortDescription: 'Áo khoác thời trang bền vững dệt từ sợi Nylon tái sinh Econyl pha bông hữu cơ thoáng mát.',
    description:
      'Lấy cảm hứng từ trang phục đi biển của ngư dân đèo Hải Vân, chiếc áo khoác Gile mang phong cách Streetwear bền vững. Khách hàng có thể tự thiết kế 3D bằng cách đính các charm vỏ sò, ốc biển hoặc sao biển dọc ve áo, túi ngực và bờ vai.',
    basePrice: 460000,
    craftFee: 45000,
    stock: 15,
    thumbnail: PRODUCT_ASSETS.VEST_HAI_VAN,
    images: [PRODUCT_ASSETS.VEST_HAI_VAN],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    availableSizes: ['S', 'M', 'L', 'XL'],
    model3D: {
      meshPreset: 'eco_shirt',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.OCEAN_TEAL,
      defaultStrapColor: BASE_COLORS.SAND_BEIGE,
      roughness: 0.78,
      metalness: 0.04,
    },
    ecoImpact: {
      netWeightGrams: 310,
      oceanOrigin: 'Vùng biển Nam Ô - Chân đèo Hải Vân',
      artisanGroup: 'Xưởng Dệt Tái Sinh Miền Trung',
      recycledPlasticRatio: 88,
      co2SavedGrams: 840,
    },
    soldCount: 64,
    rating: 4.9,
  },
  {
    name: 'Vòng Tay Dây Lưới Tết Thủ Công Mỹ Khê',
    slug: 'vong-tay-day-luoi-tet-thu-cong-my-khe',
    sku: 'BRC-MYKHE-01',
    category: 'bracelet',
    shortDescription: 'Vòng tay tết macrame từ dây lưới đánh cá tái chế, thỏa sức đính vỏ sò, ốc xoắn và ngọc trai 360 độ.',
    description:
      'Sản phẩm bán chạy nhất trong phòng 3D Customizer Studio! Dây vòng được tết chặt từ 8 sợi lưới cước biển Mỹ Khê mềm mại, chịu nước biển và mồ hôi. Bạn có thể xoay tròn 360 độ để gắn từng hạt ngọc trai, vỏ ốc kim hay charm sao biển quanh cổ tay.',
    basePrice: 95000,
    craftFee: 15000,
    stock: 60,
    thumbnail: PRODUCT_ASSETS.BRACELET_MY_KHE,
    images: [PRODUCT_ASSETS.BRACELET_MY_KHE],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    availableSizes: ['Cổ tay nhỏ (14-16cm)', 'Tiêu chuẩn (16-18cm)', 'Cổ tay lớn (18-21cm)'],
    model3D: {
      meshPreset: 'woven_bracelet',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.OCEAN_TEAL,
      defaultStrapColor: BASE_COLORS.CORAL_AMBER,
      roughness: 0.6,
      metalness: 0.08,
    },
    ecoImpact: {
      netWeightGrams: 35,
      oceanOrigin: 'Biển Mỹ Khê, Đà Nẵng',
      artisanGroup: 'CLB Sinh viên Khởi nghiệp Xanh DTU',
      recycledPlasticRatio: 98,
      co2SavedGrams: 120,
    },
    soldCount: 245,
    rating: 5.0,
  },
  {
    name: 'Bộ Phụ Kiện Charm Vỏ Sò & Ốc Biển Tự Nhiên',
    slug: 'bo-phu-kien-charm-vo-so-oc-bien-tu-nhien',
    sku: 'ACC-SHELLSET-01',
    category: 'accessory',
    shortDescription: 'Set móc khóa & charm treo túi kết hợp lưới biển và vỏ sò điệp, ốc xoắn mài bóng thủ công.',
    description:
      'Bộ phụ kiện treo túi xách hoặc móc khóa độc đáo gồm các vỏ sò điệp trắng, ốc xoắn hoàng kim và hạt thủy tinh biển được kết trên dây lưới đánh cá tái chế. Có thể mua sẵn hoặc mở trong 3D Studio để phối thêm phụ kiện theo sở thích.',
    basePrice: 120000,
    craftFee: 15000,
    stock: 40,
    thumbnail: PRODUCT_ASSETS.SHELL_CHARM_SET,
    images: [PRODUCT_ASSETS.SHELL_CHARM_SET],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    availableSizes: ['Tiêu chuẩn'],
    model3D: {
      meshPreset: 'shell_charm_set',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.CORAL_AMBER,
      defaultStrapColor: BASE_COLORS.OCEAN_TEAL,
      roughness: 0.45,
      metalness: 0.15,
    },
    ecoImpact: {
      netWeightGrams: 55,
      oceanOrigin: 'Bãi Rạng & Ghềnh Bàng, Đà Nẵng',
      artisanGroup: 'Hợp tác xã Phụ nữ Làng chài Thanh Khê',
      recycledPlasticRatio: 95,
      co2SavedGrams: 180,
    },
    soldCount: 150,
    rating: 4.9,
  },
  {
    name: 'Túi Đeo Chéo Lưới Biển Hội An Vintage',
    slug: 'tui-deo-cheo-luoi-bien-hoi-an-vintage',
    sku: 'BAG-HOIAN-02',
    category: 'bag',
    shortDescription: 'Túi đeo chéo dạo phố kết hợp vải bố tái chế và lớp lưới đánh cá đan mắt cáo cổ điển.',
    description:
      'Thiết kế nhỏ gọn cho những buổi chiều dạo phố cổ Hội An hoặc đi biển. Lớp lưới ngoài cùng tạo hiệu ứng chiều sâu 3D bắt mắt, rất hợp để đính các cụm vỏ sò hồng và sao biển.',
    basePrice: 295000,
    craftFee: 30000,
    stock: 22,
    thumbnail: PRODUCT_ASSETS.CROSSBODY_HOI_AN,
    images: [PRODUCT_ASSETS.CROSSBODY_HOI_AN],
    isCustomizable: true,
    isFeatured: false,
    isActive: true,
    availableSizes: ['Tiêu chuẩn (26x22cm)'],
    model3D: {
      meshPreset: 'tote_bag',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.SAND_BEIGE,
      defaultStrapColor: BASE_COLORS.OCEAN_TEAL,
      roughness: 0.75,
      metalness: 0.05,
    },
    ecoImpact: {
      netWeightGrams: 190,
      oceanOrigin: 'Cửa Đại, Hội An',
      artisanGroup: 'Hợp tác xã Thủ công Xanh Hội An',
      recycledPlasticRatio: 91,
      co2SavedGrams: 510,
    },
    soldCount: 72,
    rating: 4.8,
  },
  {
    name: 'Vòng Tay Đôi Hải Lưu Xanh Ngọc',
    slug: 'vong-tay-doi-hai-luu-xanh-ngoc',
    sku: 'BRC-HAILUU-02',
    category: 'bracelet',
    shortDescription: 'Cặp vòng tay dây lưới mảnh đính sẵn nút thắt thủy thủ, biểu tượng gắn kết bảo vệ đại dương.',
    description:
      'Mỗi cặp vòng tay Hải Lưu Xanh Ngọc đại diện cho 50g lưới ma được thu gom khỏi rạn san hô. Bạn có thể mua ngay hoặc vào 3D Studio để đính thêm chữ cái, vỏ ốc xoắn hay hạt thủy tinh biển.',
    basePrice: 135000,
    craftFee: 20000,
    stock: 45,
    thumbnail: PRODUCT_ASSETS.BRACELET_HAI_LUU,
    images: [PRODUCT_ASSETS.BRACELET_HAI_LUU],
    isCustomizable: true,
    isFeatured: false,
    isActive: true,
    availableSizes: ['Freesize điều chỉnh (14-21cm)'],
    model3D: {
      meshPreset: 'woven_bracelet',
      glbUrl: '',
      defaultBaseColor: BASE_COLORS.DEEP_TEAL,
      defaultStrapColor: BASE_COLORS.ROPE_NATURAL,
      roughness: 0.58,
      metalness: 0.1,
    },
    ecoImpact: {
      netWeightGrams: 50,
      oceanOrigin: 'Vịnh Lăng Cô - Đà Nẵng',
      artisanGroup: 'CLB Sinh viên Khởi nghiệp Xanh DTU',
      recycledPlasticRatio: 97,
      co2SavedGrams: 160,
    },
    soldCount: 190,
    rating: 4.9,
  },
];

const initialMaterials = [
  {
    name: 'Vỏ Sò Điệp Trắng Sơn Trà',
    code: 'SHL-SCALLOP-01',
    materialType: 'shell',
    description: 'Vỏ sò điệp tự nhiên nhặt trên bãi cát Sơn Trà, đường vân rẻ quạt sắc nét, đã khoan lỗ khâu.',
    unitPrice: 15000,
    stockQuantity: 120,
    lowStockThreshold: 15,
    thumbnail: MATERIAL_ASSETS.SHELL_CLOSEUP,
    colorPalette: MATERIAL_PALETTES.SCALLOP_SHELL,
    defaultColor: CHARM_COLORS.PEARL_WHITE,
    model3D: {
      meshPreset: 'scallop_shell',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.35,
      metalness: 0.1,
    },
  },
  {
    name: 'Vỏ Sò Huyết Vân Hồng Cù Lao',
    code: 'SHL-COCKLE-02',
    materialType: 'shell',
    description: 'Vỏ sò huyết rãnh sâu khỏe khoắn với sắc hồng cam ấm áp của vùng biển đảo Cù Lao Chàm.',
    unitPrice: 18000,
    stockQuantity: 85,
    lowStockThreshold: 15,
    thumbnail: MATERIAL_ASSETS.BEACH_WAVE,
    colorPalette: MATERIAL_PALETTES.COCKLE_SHELL,
    defaultColor: CHARM_COLORS.CORAL_PINK,
    model3D: {
      meshPreset: 'cockle_shell',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.4,
      metalness: 0.08,
    },
  },
  {
    name: 'Vỏ Ốc Sứ Trắng Bóng (Cowrie)',
    code: 'SHL-COWRIE-03',
    materialType: 'shell',
    description: 'Vỏ ốc sứ trắng mịn như men gốm, biểu tượng may mắn và bình an của người đi biển.',
    unitPrice: 20000,
    stockQuantity: 95,
    lowStockThreshold: 15,
    thumbnail: MATERIAL_ASSETS.OCEAN_CORAL,
    colorPalette: MATERIAL_PALETTES.COWRIE_SHELL,
    defaultColor: CHARM_COLORS.PEARL_WHITE,
    model3D: {
      meshPreset: 'cowrie_shell',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.2,
      metalness: 0.15,
    },
  },
  {
    name: 'Ốc Xoắn Hoàng Kim',
    code: 'SNL-SPIRAL-01',
    materialType: 'snail',
    description: 'Vỏ ốc xoắn tháp nhọn ánh vàng hổ phách tự nhiên, tạo điểm nhấn 3D nổi bật trên túi và vòng tay.',
    unitPrice: 25000,
    stockQuantity: 70,
    lowStockThreshold: 15,
    thumbnail: MATERIAL_ASSETS.SHELL_CLOSEUP,
    colorPalette: MATERIAL_PALETTES.SPIRAL_SNAIL,
    defaultColor: CHARM_COLORS.AMBER_GOLD,
    model3D: {
      meshPreset: 'spiral_snail',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.3,
      metalness: 0.2,
    },
  },
  {
    name: 'Ốc Nhảy Xà Cừ Quý Hiếm',
    code: 'SNL-TURBAN-02',
    materialType: 'snail',
    description: 'Vỏ ốc tròn ánh xà cừ ngũ sắc được đánh bóng thủ công, số lượng giới hạn theo mùa.',
    unitPrice: 35000,
    stockQuantity: 9, // Low stock to demonstrate CMS alert & edge case testing!
    lowStockThreshold: 12,
    thumbnail: MATERIAL_ASSETS.BEACH_WAVE,
    colorPalette: MATERIAL_PALETTES.TURBAN_SNAIL,
    defaultColor: CHARM_COLORS.NACRE_MINT,
    model3D: {
      meshPreset: 'turban_snail',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.18,
      metalness: 0.35,
    },
  },
  {
    name: 'Ốc Gai Biển Sâu',
    code: 'SNL-HORN-03',
    materialType: 'snail',
    description: 'Vỏ ốc gai cá tính dành cho phong cách phóng khoáng, mạnh mẽ.',
    unitPrice: 28000,
    stockQuantity: 55,
    lowStockThreshold: 10,
    thumbnail: MATERIAL_ASSETS.OCEAN_CORAL,
    colorPalette: MATERIAL_PALETTES.HORN_SNAIL,
    defaultColor: BASE_COLORS.SAND_BEIGE,
    model3D: {
      meshPreset: 'horn_snail',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.45,
      metalness: 0.1,
    },
  },
  {
    name: 'Charm Sao Biển San Hô',
    code: 'CHM-STAR-01',
    materialType: 'charm',
    description: 'Charm hình sao biển 5 cánh đúc từ nhựa lưới đánh cá tái chế pha bột vỏ sò tự nhiên.',
    unitPrice: 22000,
    stockQuantity: 90,
    lowStockThreshold: 15,
    thumbnail: MATERIAL_ASSETS.SHELL_CLOSEUP,
    colorPalette: MATERIAL_PALETTES.STARFISH_CHARM,
    defaultColor: CHARM_COLORS.STARFISH_ORANGE,
    model3D: {
      meshPreset: 'starfish_charm',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.4,
      metalness: 0.12,
    },
  },
  {
    name: 'Charm Rùa Biển Xanh',
    code: 'CHM-TURTLE-02',
    materialType: 'charm',
    description: 'Biểu tượng bảo tồn rùa biển Cù Lao Chàm, chế tác tinh xảo từ hạt nhựa biển tái sinh.',
    unitPrice: 30000,
    stockQuantity: 65,
    lowStockThreshold: 12,
    thumbnail: MATERIAL_ASSETS.OCEAN_CORAL,
    colorPalette: MATERIAL_PALETTES.TURTLE_CHARM,
    defaultColor: CHARM_COLORS.TURTLE_TEAL,
    model3D: {
      meshPreset: 'turtle_charm',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.35,
      metalness: 0.2,
    },
  },
  {
    name: 'Charm Mỏ Neo Đồng Cổ',
    code: 'CHM-ANCHOR-03',
    materialType: 'charm',
    description: 'Charm mỏ neo kim loại tái chế chống gỉ sét, điểm nhấn chuẩn phong cách hàng hải.',
    unitPrice: 26000,
    stockQuantity: 80,
    lowStockThreshold: 10,
    thumbnail: MATERIAL_ASSETS.BEACH_WAVE,
    colorPalette: MATERIAL_PALETTES.ANCHOR_CHARM,
    defaultColor: BASE_COLORS.CORAL_AMBER,
    model3D: {
      meshPreset: 'anchor_charm',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.25,
      metalness: 0.75,
    },
  },
  {
    name: 'Hạt Ngọc Trai Nước Ngọt Ánh Hồng',
    code: 'BED-PEARL-01',
    materialType: 'bead',
    description: 'Hạt ngọc trai nuôi tự nhiên ánh xà cừ sang trọng, thích hợp đính viền ví, túi và vòng tay.',
    unitPrice: 12000,
    stockQuantity: 200,
    lowStockThreshold: 25,
    thumbnail: MATERIAL_ASSETS.PEARL_CRAFT,
    colorPalette: MATERIAL_PALETTES.PEARL_BEAD,
    defaultColor: CHARM_COLORS.PEARL_WHITE,
    model3D: {
      meshPreset: 'pearl_bead',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.12,
      metalness: 0.3,
    },
  },
  {
    name: 'Hạt Thủy Tinh Biển Mài Sóng (Sea Glass)',
    code: 'BED-SEAGLASS-02',
    materialType: 'bead',
    description: 'Mảnh thủy tinh được sóng biển mài tròn tự nhiên qua nhiều năm, mang sắc xanh ngọc bích trong trẻo.',
    unitPrice: 14000,
    stockQuantity: 150,
    lowStockThreshold: 20,
    thumbnail: MATERIAL_ASSETS.SHELL_CLOSEUP,
    colorPalette: MATERIAL_PALETTES.SEA_GLASS_BEAD,
    defaultColor: CHARM_COLORS.AQUA_TURQUOISE,
    model3D: {
      meshPreset: 'sea_glass_bead',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.25,
      metalness: 0.05,
    },
  },
  {
    name: 'Nút Thắt Dây Lưới Thủy Thủ',
    code: 'CRD-KNOT-01',
    materialType: 'cord',
    description: 'Nút thắt Celtic đan từ sợi lưới đánh cá thu hồi, dùng làm khóa gài hoặc charm trang trí.',
    unitPrice: 10000,
    stockQuantity: 180,
    lowStockThreshold: 20,
    thumbnail: MATERIAL_ASSETS.NET_CORD,
    colorPalette: MATERIAL_PALETTES.FISHING_CORD_KNOT,
    defaultColor: BASE_COLORS.OCEAN_TEAL,
    model3D: {
      meshPreset: 'fishing_cord_knot',
      glbUrl: '',
      defaultScale: 1.0,
      roughness: 0.8,
      metalness: 0.02,
    },
  },
];

const seedDatabase = async ({ force = false } = {}) => {
  await connectDB();

  const existingProductsCount = await Product.countDocuments();
  if (existingProductsCount > 0 && !force) {
    console.log(`[Seeder] Database already contains ${existingProductsCount} products. Skipping auto-seed.`);
    return;
  }

  console.log('[Seeder] Seeding DTU Upcycled Fishing Net & 3D Ocean Craft database...');

  if (force) {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      CustomMaterial.deleteMany({}),
      CustomDesign.deleteMany({}),
      Order.deleteMany({}),
      LandingContent.deleteMany({}),
    ]);
  }

  // 1. Create Users
  const createdUsers = [];
  for (const u of initialUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      createdUsers.push(await User.create(u));
    } else {
      createdUsers.push(exists);
    }
  }
  const customerUser = createdUsers.find((u) => u.role === 'customer') || createdUsers[0];

  // 2. Create LandingContent with full S3-ready image fields (heroBanner, processSteps, galleryImages, artisanStory)
  const existingLanding = await LandingContent.findOne({ key: 'main_landing' });
  if (!existingLanding) {
    await LandingContent.create({ key: 'main_landing' });
  }

  // 3. Create Products
  const createdProducts = [];
  for (const p of initialProducts) {
    const exists = await Product.findOne({ slug: p.slug });
    if (!exists) {
      createdProducts.push(await Product.create(p));
    } else {
      createdProducts.push(exists);
    }
  }

  // 4. Create CustomMaterials
  const createdMaterials = [];
  for (const m of initialMaterials) {
    const exists = await CustomMaterial.findOne({ code: m.code });
    if (!exists) {
      createdMaterials.push(await CustomMaterial.create(m));
    } else {
      createdMaterials.push(exists);
    }
  }

  // 5. Create sample CustomDesign & sample Orders with 3D Snapshots for immediate CMS / Lookup testing
  const toteBag = createdProducts.find((p) => p.slug === 'tui-xach-luoi-dai-duong-son-tra') || createdProducts[0];
  const bracelet = createdProducts.find((p) => p.slug === 'vong-tay-day-luoi-tet-thu-cong-my-khe') || createdProducts[4];
  const scallop = createdMaterials.find((m) => m.code === 'SHL-SCALLOP-01') || createdMaterials[0];
  const spiralSnail = createdMaterials.find((m) => m.code === 'SNL-SPIRAL-01') || createdMaterials[3];
  const starfish = createdMaterials.find((m) => m.code === 'CHM-STAR-01') || createdMaterials[6];
  const pearl = createdMaterials.find((m) => m.code === 'BED-PEARL-01') || createdMaterials[9];

  const existingDesign = await CustomDesign.findOne({ shareCode: '3D-SONTRA1' });
  let sampleDesign = existingDesign;
  if (!sampleDesign && toteBag && scallop && spiralSnail) {
    const samplePlacements = [
      {
        placementId: 'pl_seed_1',
        materialId: scallop._id,
        materialName: scallop.name,
        materialCode: scallop.code,
        materialType: scallop.materialType,
        meshPreset: scallop.model3D.meshPreset,
        glbUrl: '',
        unitPrice: scallop.unitPrice,
        position: [-0.35, 0.15, 0.42],
        normal: [0, 0.08, 0.99],
        rotation: 15,
        scale: 1.1,
        color: CHARM_COLORS.PEARL_WHITE,
      },
      {
        placementId: 'pl_seed_2',
        materialId: scallop._id,
        materialName: scallop.name,
        materialCode: scallop.code,
        materialType: scallop.materialType,
        meshPreset: scallop.model3D.meshPreset,
        glbUrl: '',
        unitPrice: scallop.unitPrice,
        position: [0.35, 0.15, 0.42],
        normal: [0, 0.08, 0.99],
        rotation: -15,
        scale: 1.1,
        color: CHARM_COLORS.PEARL_WHITE,
      },
      {
        placementId: 'pl_seed_3',
        materialId: scallop._id,
        materialName: scallop.name,
        materialCode: scallop.code,
        materialType: scallop.materialType,
        meshPreset: scallop.model3D.meshPreset,
        glbUrl: '',
        unitPrice: scallop.unitPrice,
        position: [0, -0.2, 0.44],
        normal: [0, 0, 1],
        rotation: 0,
        scale: 1.25,
        color: CHARM_COLORS.SUN_GOLD,
      },
      {
        placementId: 'pl_seed_4',
        materialId: spiralSnail._id,
        materialName: spiralSnail.name,
        materialCode: spiralSnail.code,
        materialType: spiralSnail.materialType,
        meshPreset: spiralSnail.model3D.meshPreset,
        glbUrl: '',
        unitPrice: spiralSnail.unitPrice,
        position: [0, 0.22, 0.43],
        normal: [0, 0.05, 0.99],
        rotation: 30,
        scale: 1.15,
        color: CHARM_COLORS.AMBER_GOLD,
      },
    ];

    sampleDesign = await CustomDesign.create({
      shareCode: '3D-SONTRA1',
      name: 'Túi Lưới Sơn Trà Đính 3 Sò Điệp & 1 Ốc Hoàng Kim',
      productId: toteBag._id,
      userId: customerUser._id,
      baseColor: BASE_COLORS.OCEAN_TEAL,
      strapColor: BASE_COLORS.ROPE_NATURAL,
      size: 'Tiêu chuẩn (38x42cm)',
      note: 'Khâu chỉ cước trắng bền chắc giúp mình nhé xưởng!',
      placements: samplePlacements,
      pricingBreakdown: {
        basePrice: 320000,
        craftFee: 30000,
        materialsTotal: 70000,
        estimatedPrice: 420000,
      },
      bomSummary: [
        {
          materialId: scallop._id,
          code: scallop.code,
          name: scallop.name,
          materialType: scallop.materialType,
          meshPreset: scallop.model3D.meshPreset,
          unitPrice: 15000,
          quantity: 3,
          subtotal: 45000,
        },
        {
          materialId: spiralSnail._id,
          code: spiralSnail.code,
          name: spiralSnail.name,
          materialType: spiralSnail.materialType,
          meshPreset: spiralSnail.model3D.meshPreset,
          unitPrice: 25000,
          quantity: 1,
          subtotal: 25000,
        },
      ],
      previewThumbnail: toteBag.thumbnail,
    });
  }

  const existingOrderCount = await Order.countDocuments();
  if (existingOrderCount === 0 && sampleDesign && toteBag && bracelet && starfish && pearl) {
    const orderCode1 = 'DTU-20261108-OCN1';
    const orderCode2 = 'DTU-20261108-OCN2';

    await Order.create([
      {
        orderCode: orderCode1,
        userId: customerUser._id,
        customerInfo: {
          fullName: 'Lê Minh Hải',
          phone: '0905888999',
          email: env.SEED_CUSTOMER_EMAIL,
          address: '12 Bạch Đằng, Quận Hải Châu',
          city: 'Đà Nẵng',
          note: 'Giao giờ hành chính giúp mình',
        },
        items: [
          {
            productId: toteBag._id,
            productName: toteBag.name,
            productSlug: toteBag.slug,
            category: toteBag.category,
            thumbnail: toteBag.thumbnail,
            model3D: {
              meshPreset: toteBag.model3D.meshPreset,
              glbUrl: '',
            },
            quantity: 1,
            selectedColor: BASE_COLORS.OCEAN_TEAL,
            selectedStrapColor: BASE_COLORS.ROPE_NATURAL,
            selectedSize: 'Tiêu chuẩn (38x42cm)',
            isCustom: true,
            customDesignId: sampleDesign._id,
            customDesignSnapshot: {
              shareCode: sampleDesign.shareCode,
              name: sampleDesign.name,
              baseColor: sampleDesign.baseColor,
              strapColor: sampleDesign.strapColor,
              size: sampleDesign.size,
              note: sampleDesign.note,
              meshPreset: toteBag.model3D.meshPreset,
              glbUrl: '',
              placements: sampleDesign.placements,
            },
            bomSummary: [
              {
                materialId: scallop._id,
                code: scallop.code,
                name: scallop.name,
                materialType: scallop.materialType,
                meshPreset: scallop.model3D.meshPreset,
                unitPrice: 15000,
                quantityPerItem: 3,
                totalQuantity: 3,
                subtotal: 45000,
              },
              {
                materialId: spiralSnail._id,
                code: spiralSnail.code,
                name: spiralSnail.name,
                materialType: spiralSnail.materialType,
                meshPreset: spiralSnail.model3D.meshPreset,
                unitPrice: 25000,
                quantityPerItem: 1,
                totalQuantity: 1,
                subtotal: 25000,
              },
            ],
            pricingBreakdown: {
              basePrice: 320000,
              craftFee: 30000,
              materialsTotal: 70000,
              unitPrice: 420000,
              lineTotal: 420000,
            },
            ecoImpactGrams: 240,
          },
        ],
        status: 'in_crafting',
        statusHistory: [
          {
            status: 'pending',
            note: 'Khách hàng đặt đơn Custom 3D',
            updatedBy: 'Lê Minh Hải',
            updatedAt: new Date(Date.now() - 86400000 * 2),
          },
          {
            status: 'confirmed',
            note: 'Xưởng xác nhận đủ vỏ sò điệp và ốc xoắn trong kho',
            updatedBy: 'Quản Trị Viên Nét Biển DTU',
            updatedAt: new Date(Date.now() - 86400000),
          },
          {
            status: 'in_crafting',
            note: 'Nghệ nhân Nguyễn Thị Lành đang đan phôi và khâu vỏ sò theo tọa độ 3D',
            updatedBy: 'Nghệ Nhân Nguyễn Thị Lành',
            updatedAt: new Date(),
          },
        ],
        paymentMethod: 'vietqr',
        paymentStatus: 'paid',
        vietqrInfo: {
          bankId: env.VIETQR_BANK_ID,
          bankName: env.VIETQR_BANK_NAME,
          accountNo: env.VIETQR_ACCOUNT_NO,
          accountName: env.VIETQR_ACCOUNT_NAME,
          amount: 450000,
          transferContent: orderCode1,
          qrImageUrl: buildVietQrImageUrl({
            amount: 450000,
            transferContent: orderCode1,
          }),
        },
        subtotal: 420000,
        shippingFee: 30000,
        totalAmount: 450000,
        finalAmount: 450000,
        totalNetWeightGrams: 240,
        inventoryDeducted: true,
      },
      {
        orderCode: orderCode2,
        userId: null,
        customerInfo: {
          fullName: 'Trần Ngọc Bảo Trâm',
          phone: '0912345678',
          email: 'baotram.danang@gmail.com',
          address: '88 Võ Nguyên Giáp, Quận Sơn Trà',
          city: 'Đà Nẵng',
          note: 'Làm quà tặng sinh nhật bạn, gói giấy kraft giúp mình',
        },
        items: [
          {
            productId: bracelet._id,
            productName: bracelet.name,
            productSlug: bracelet.slug,
            category: bracelet.category,
            thumbnail: bracelet.thumbnail,
            model3D: {
              meshPreset: bracelet.model3D.meshPreset,
              glbUrl: '',
            },
            quantity: 2,
            selectedColor: BASE_COLORS.OCEAN_TEAL,
            selectedStrapColor: BASE_COLORS.CORAL_AMBER,
            selectedSize: 'Tiêu chuẩn (16-18cm)',
            isCustom: true,
            customDesignId: null,
            customDesignSnapshot: {
              shareCode: '3D-BRC88',
              name: 'Vòng Tay Mỹ Khê Đính Sao Biển & Ngọc Trai',
              baseColor: BASE_COLORS.OCEAN_TEAL,
              strapColor: BASE_COLORS.CORAL_AMBER,
              size: 'Tiêu chuẩn (16-18cm)',
              note: 'Đính sao biển ở chính giữa vòng',
              meshPreset: bracelet.model3D.meshPreset,
              glbUrl: '',
              braceletConfig: {
                wristSizeCm: 16,
                slotCount: 12,
                cordMaterial: 'recycled_net_cord',
              },
              placements: [
                {
                  placementId: 'pl_brc_1',
                  materialId: starfish._id,
                  materialName: starfish.name,
                  materialCode: starfish.code,
                  materialType: starfish.materialType,
                  meshPreset: starfish.model3D.meshPreset,
                  glbUrl: '',
                  unitPrice: starfish.unitPrice,
                  position: [0, 0.72, 0],
                  normal: [0, 1, 0],
                  rotation: 0,
                  scale: 1.0,
                  color: CHARM_COLORS.STARFISH_ORANGE,
                  slotIndex: 0,
                  isDanglingCharm: true,
                },
                {
                  placementId: 'pl_brc_2',
                  materialId: pearl._id,
                  materialName: pearl.name,
                  materialCode: pearl.code,
                  materialType: pearl.materialType,
                  meshPreset: pearl.model3D.meshPreset,
                  glbUrl: '',
                  unitPrice: pearl.unitPrice,
                  position: [0.51, 0.51, 0],
                  normal: [0.7, 0.7, 0],
                  rotation: 0,
                  scale: 1.0,
                  color: CHARM_COLORS.PEARL_WHITE,
                  slotIndex: 1,
                  isDanglingCharm: false,
                },
              ],
            },
            bomSummary: [
              {
                materialId: starfish._id,
                code: starfish.code,
                name: starfish.name,
                materialType: starfish.materialType,
                meshPreset: starfish.model3D.meshPreset,
                unitPrice: 22000,
                quantityPerItem: 1,
                totalQuantity: 2,
                subtotal: 44000,
              },
              {
                materialId: pearl._id,
                code: pearl.code,
                name: pearl.name,
                materialType: pearl.materialType,
                meshPreset: pearl.model3D.meshPreset,
                unitPrice: 12000,
                quantityPerItem: 1,
                totalQuantity: 2,
                subtotal: 24000,
              },
            ],
            pricingBreakdown: {
              basePrice: 95000,
              craftFee: 15000,
              materialsTotal: 34000,
              unitPrice: 144000,
              lineTotal: 288000,
            },
            ecoImpactGrams: 70,
          },
        ],
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            note: 'Đơn hàng mới tạo chờ xác nhận',
            updatedBy: 'Trần Ngọc Bảo Trâm',
            updatedAt: new Date(),
          },
        ],
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        vietqrInfo: {
          bankId: env.VIETQR_BANK_ID,
          bankName: env.VIETQR_BANK_NAME,
          accountNo: env.VIETQR_ACCOUNT_NO,
          accountName: env.VIETQR_ACCOUNT_NAME,
          amount: 318000,
          transferContent: orderCode2,
          qrImageUrl: buildVietQrImageUrl({
            amount: 318000,
            transferContent: orderCode2,
          }),
        },
        subtotal: 288000,
        shippingFee: 30000,
        totalAmount: 318000,
        finalAmount: 318000,
        totalNetWeightGrams: 70,
        inventoryDeducted: true,
      },
    ]);
  }

  console.log('[Seeder] Seed completed successfully!');
};

if (require.main === module) {
  seedDatabase({ force: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
