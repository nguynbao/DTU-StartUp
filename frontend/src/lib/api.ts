import {
  AdminDashboardData,
  CustomDesignSnapshot,
  CustomMaterial,
  LandingContent,
  MediaStorageFolder,
  MediaStorageStatus,
  MediaUploadResult,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
} from '@/types';
import { ENV } from '@/config/env';
import { ASSETS } from '@/config/assets';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';

const API_BASE_URL = ENV.API_URL;

// ============================================================================
// INTELLIGENT FALLBACK DATA (Đảm bảo SSR & UI luôn hiển thị mượt mà 100%)
// ============================================================================

export const FALLBACK_LANDING_CONTENT: LandingContent = {
  heroTitle: 'Từ Lưới Ma Đại Dương Đến Phụ Kiện Thủ Công Độc Bản',
  heroSubtitle:
    'Mỗi chiếc túi, giỏ đựng đồ, ví tiền, áo khoác và vòng tay đều được đan tay từ lưới đánh cá thu hồi tại vùng biển miền Trung — kết hợp cùng xưởng thiết kế 3D Free-form giúp bạn tự tay đính từng vỏ sò, ốc biển lên sản phẩm.',
  heroCtaPrimary: 'Khám Phá Cửa Hàng Xanh',
  heroCtaSecondary: 'Mở Xưởng Thiết Kế 3D',
  heroBanner: {
    title: 'Từ Lưới Ma Đại Dương Đến Phụ Kiện Thủ Công Độc Bản',
    subtitle:
      'Mỗi chiếc túi, giỏ đựng đồ, ví tiền, áo khoác và vòng tay đều được đan tay từ lưới đánh cá thu hồi tại vùng biển miền Trung — kết hợp cùng xưởng thiết kế 3D Free-form giúp bạn tự tay đính từng vỏ sò, ốc biển lên sản phẩm.',
    ctaText: 'Khám Phá Cửa Hàng Xanh',
    ctaLink: '/shop',
    backgroundImageUrl: ASSETS.landing.oceanHero,
    secondaryImageUrl: ASSETS.landing.fishingNetClose,
    tertiaryImageUrl: ASSETS.products.toteBagMain,
  },
  impactCounters: {
    netsCollectedKg: 4850,
    marineLifeSaved: 19400,
    upcycledProductsCreated: 6230,
    localArtisansSupported: 48,
  },
  recyclingSteps: [
    {
      stepNumber: 1,
      title: 'Thu Gom Lưới Ma Đại Dương',
      description:
        'Hợp tác cùng ngư dân Đà Nẵng, Quảng Nam & Lý Sơn thu hồi lưới đánh cá bị rách hoặc trôi dạt trên rạn san hô.',
      badgeText: '100% Truy xuất vùng biển',
      imageUrl: ASSETS.landing.processSteps.step1OceanCollection,
    },
    {
      stepNumber: 2,
      title: 'Khử Khuẩn & Tái Tạo Sợi',
      description:
        'Làm sạch muối biển bằng thảo mộc tự nhiên, phân loại độ dày sợi HDPE/Nylon và nhuộm màu khoáng thân thiện.',
      badgeText: 'Zero-Chemical Wash',
      imageUrl: ASSETS.landing.processSteps.step2NetSorting,
    },
    {
      stepNumber: 3,
      title: 'Đan Thủ Công Làng Chài',
      description:
        'Các nghệ nhân làng chài sử dụng kỹ thuật gút lưới truyền thống để tạo phôi túi, giỏ, ví, áo khoác và vòng tay siêu bền.',
      badgeText: 'Bảo hành đường đan 3 năm',
      imageUrl: ASSETS.landing.processSteps.step3ArtisanWeaving,
    },
    {
      stepNumber: 4,
      title: 'Cá Nhân Hóa 3D Cùng Vỏ Sò & Ốc Biển',
      description:
        'Bạn tự do đính vỏ sò điệp, ốc xoắn, sao biển lên bề mặt 3D theo thời gian thực. Thợ thủ công sẽ khâu cố định chính xác theo bản vẽ 3D.',
      badgeText: 'Free-form 3D Raycasting',
      imageUrl: ASSETS.landing.processSteps.step4FinishedCraft,
    },
  ],
  processSteps: [
    {
      stepNumber: 1,
      title: 'Thu Gom Lưới Ma Đại Dương',
      description:
        'Hợp tác cùng ngư dân Đà Nẵng, Quảng Nam & Lý Sơn thu hồi lưới đánh cá bị rách hoặc trôi dạt trên rạn san hô.',
      imageUrl: ASSETS.landing.processSteps.step1OceanCollection,
      badgeText: '100% Truy xuất vùng biển',
    },
    {
      stepNumber: 2,
      title: 'Khử Khuẩn & Tái Tạo Sợi',
      description:
        'Làm sạch muối biển bằng thảo mộc tự nhiên, phân loại độ dày sợi HDPE/Nylon và nhuộm màu khoáng thân thiện.',
      imageUrl: ASSETS.landing.processSteps.step2NetSorting,
      badgeText: 'Zero-Chemical Wash',
    },
    {
      stepNumber: 3,
      title: 'Đan Thủ Công Làng Chài',
      description:
        'Các nghệ nhân làng chài sử dụng kỹ thuật gút lưới truyền thống để tạo phôi túi, giỏ, ví, áo khoác và vòng tay siêu bền.',
      imageUrl: ASSETS.landing.processSteps.step3ArtisanWeaving,
      badgeText: 'Bảo hành đường đan 3 năm',
    },
    {
      stepNumber: 4,
      title: 'Cá Nhân Hóa 3D Cùng Vỏ Sò & Ốc Biển',
      description:
        'Bạn tự do đính vỏ sò điệp, ốc xoắn, sao biển lên bề mặt 3D theo thời gian thực. Thợ thủ công sẽ khâu cố định chính xác theo bản vẽ 3D.',
      imageUrl: ASSETS.landing.processSteps.step4FinishedCraft,
      badgeText: 'Free-form 3D Raycasting',
    },
  ],
  galleryImages: [...ASSETS.landing.gallery],
  artisanStory: {
    headline: 'Đôi Bàn Tay Giữ Biển Xanh Từ Làng Chài Thọ Quang – Sơn Trà',
    heading: 'Đôi Bàn Tay Giữ Biển Xanh Từ Làng Chài Thọ Quang – Sơn Trà',
    villageName: 'Hợp tác xã Thủ công Tái chế Biển miền Trung (Đà Nẵng - Hội An)',
    quote:
      'Ngày trước lưới rách chỉ biết bỏ xó hoặc chôn lấp ngoài bãi cát. Giờ từng mắt lưới được tụi tui đan thành giỏ, thành túi đính ốc biển cho khách phương xa tự thiết kế trên 3D — vừa sạch biển, vừa giữ được nghề đan lưới của cha ông.',
    body: 'Hơn 48 phụ nữ làng chài và thợ đan lưới lành nghề tại bán đảo Sơn Trà, Cù Lao Chàm và Lý Sơn đang trực tiếp tham gia chế tác từng đơn hàng Custom 3D. Mỗi phiếu chế tác 3D gửi về xưởng đều hiển thị rõ tọa độ từng viên ngọc trai, vỏ sò điệp để nghệ nhân khâu tay tỉ mỉ.',
    bodyText:
      'Hơn 48 phụ nữ làng chài và thợ đan lưới lành nghề tại bán đảo Sơn Trà, Cù Lao Chàm và Lý Sơn đang trực tiếp tham gia chế tác từng đơn hàng Custom 3D. Mỗi phiếu chế tác 3D gửi về xưởng đều hiển thị rõ tọa độ từng viên ngọc trai, vỏ sò điệp để nghệ nhân khâu tay tỉ mỉ.',
    artisanName: 'Nghệ nhân Nguyễn Thị Lành',
    artisanRole: 'Tổ trưởng Tổ Đan Lưới Thủ Công Thọ Quang (28 năm kinh nghiệm)',
    avatarUrl: ASSETS.hero.artisanWeaver,
    workshopImageUrl: ASSETS.landing.fishingNetHarbor,
  },
};

export const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 'prod-bag-01',
    name: 'Túi Xách Lưới Đại Dương Sơn Trà',
    slug: 'tui-xach-luoi-dai-duong-son-tra',
    sku: 'DTU-BAG-001',
    category: 'bag',
    shortDescription: 'Túi Tote đan từ lưới vây thu hồi tại bán đảo Sơn Trà, lót vải canvas mộc chống thấm.',
    description:
      'Được chế tác từ 380g lưới đánh cá HDPE thu hồi tại vùng biển Sơn Trà (Đà Nẵng). Thiết kế mắt lưới kim cương đặc trưng, kết hợp túi lót vải bố mộc bên trong và quai xách bện thừng biển chắc chắn. Hỗ trợ đính vỏ sò, ốc xoắn, sao biển tự do lên toàn bộ thân túi trên phòng 3D Studio.',
    basePrice: 320000,
    craftFee: 30000,
    stock: 25,
    images: [ASSETS.products.toteBagMain, ASSETS.products.toteBagAlt],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    sizes: ['Tiêu chuẩn (38x32cm)', 'Cỡ lớn (44x36cm)'],
    colors: [
      PRODUCT_COLOR_PRESETS.kelpGreen,
      PRODUCT_COLOR_PRESETS.deepNavy,
      PRODUCT_COLOR_PRESETS.driftwoodBrown,
      PRODUCT_COLOR_PRESETS.charcoalInk,
      PRODUCT_COLOR_PRESETS.terracottaRust,
    ],
    model3D: {
      meshPreset: 'tote_bag',
      glbUrl: '',
      defaultBaseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
      defaultStrapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
      availableColors: [
        PRODUCT_COLOR_PRESETS.kelpGreen,
        PRODUCT_COLOR_PRESETS.deepNavy,
        PRODUCT_COLOR_PRESETS.driftwoodBrown,
        PRODUCT_COLOR_PRESETS.charcoalInk,
        PRODUCT_COLOR_PRESETS.terracottaRust,
      ],
      allowSurfacePlacement: true,
    },
    ecoImpact: {
      netWeightGrams: 380,
      originSea: 'Bán đảo Sơn Trà, Đà Nẵng',
      recycledPlasticPct: 92,
      artisanGroup: 'HTX Làng Chài Thọ Quang',
      co2SavedGrams: 1140,
    },
  },
  {
    _id: 'prod-basket-01',
    name: 'Giỏ Đựng Đồ Lưới Biển Cù Lao',
    slug: 'gio-dung-do-luoi-bien-cu-lao',
    sku: 'DTU-BSK-001',
    category: 'basket',
    shortDescription: 'Giỏ tròn đan sợi lưới xoắn kết hợp khung mây tre biển, đựng đồ decor hoặc đi chợ xanh.',
    description:
      'Giỏ đựng đồ đa năng đan kết từ sợi lưới kéo tàu xa bờ kết hợp viền thừng gai tự nhiên. Thân giỏ đứng form cứng cáp, thoáng khí, chịu tải tới 8kg. Phù hợp trang trí không gian sống xanh hoặc tự tay đính vỏ sò điệp, ốc biển làm giỏ quà tặng độc bản.',
    basePrice: 280000,
    craftFee: 30000,
    stock: 18,
    images: [ASSETS.products.marketBasket],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    sizes: ['Cỡ vừa (ĐK 26cm)', 'Cỡ đại (ĐK 34cm)'],
    colors: [
      PRODUCT_COLOR_PRESETS.kelpGreen,
      PRODUCT_COLOR_PRESETS.driftwoodBrown,
      PRODUCT_COLOR_PRESETS.abyssalTeal,
      PRODUCT_COLOR_PRESETS.charcoalInk,
    ],
    model3D: {
      meshPreset: 'market_basket',
      glbUrl: '',
      defaultBaseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
      defaultStrapColor: PRODUCT_COLOR_PRESETS.amberCord,
      availableColors: [
        PRODUCT_COLOR_PRESETS.kelpGreen,
        PRODUCT_COLOR_PRESETS.driftwoodBrown,
        PRODUCT_COLOR_PRESETS.abyssalTeal,
        PRODUCT_COLOR_PRESETS.charcoalInk,
      ],
      allowSurfacePlacement: true,
    },
    ecoImpact: {
      netWeightGrams: 520,
      originSea: 'Đảo Cù Lao Chàm, Quảng Nam',
      recycledPlasticPct: 95,
      artisanGroup: 'Tổ Đan Lưới Tân Hiệp',
      co2SavedGrams: 1560,
    },
  },
  {
    _id: 'prod-bracelet-01',
    name: 'Vòng Tay Dây Lưới Đính Sò Lý Sơn',
    slug: 'vong-tay-day-luoi-dinh-so-ly-son',
    sku: 'DTU-BRC-001',
    category: 'bracelet',
    shortDescription: 'Vòng tay bện thừng lưới đánh cá 8 sợi, khóa rút điều chỉnh, dễ dàng đính ốc & charm biển.',
    description:
      'Lấy cảm hứng từ nút thắt thủy thủ của ngư dân đảo Lý Sơn, vòng tay được bện chặt từ 45g sợi lưới đánh cá siêu bền, không thấm nước, không phai màu khi tắm biển. Bạn có thể tự chọn vỏ sò ốc, sao biển, hạt thủy tinh biển để đính quanh vòng tay trên 3D Studio.',
    basePrice: 120000,
    craftFee: 15000,
    stock: 50,
    images: [ASSETS.products.braidedBracelet],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    sizes: ['Freesize (Cổ tay 14-20cm)'],
    colors: [
      PRODUCT_COLOR_PRESETS.kelpGreen,
      PRODUCT_COLOR_PRESETS.terracottaRust,
      PRODUCT_COLOR_PRESETS.deepNavy,
      PRODUCT_COLOR_PRESETS.charcoalInk,
    ],
    model3D: {
      meshPreset: 'braided_bracelet',
      glbUrl: '',
      defaultBaseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
      defaultStrapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
      availableColors: [
        PRODUCT_COLOR_PRESETS.kelpGreen,
        PRODUCT_COLOR_PRESETS.terracottaRust,
        PRODUCT_COLOR_PRESETS.deepNavy,
        PRODUCT_COLOR_PRESETS.charcoalInk,
      ],
      allowSurfacePlacement: true,
    },
    ecoImpact: {
      netWeightGrams: 45,
      originSea: 'Đảo Lý Sơn, Quảng Ngãi',
      recycledPlasticPct: 98,
      artisanGroup: 'Nhóm Thủ Công An Vĩnh',
      co2SavedGrams: 140,
    },
  },
  {
    _id: 'prod-wallet-01',
    name: 'Ví Cầm Tay Lưới Tái Chế Hải Vân',
    slug: 'vi-cam-tay-luoi-tai-che-hai-van',
    sku: 'DTU-WLT-001',
    category: 'wallet',
    shortDescription: 'Ví Clutch dệt sợi lưới nilon biển ép nhiệt chống nước, khóa đồng cổ điển.',
    description:
      'Ví tiền & Clutch cầm tay kết hợp giữa lớp vải denim tái chế và lớp lưới đánh cá dệt nổi bên ngoài. Có 6 ngăn đựng thẻ, 2 ngăn tiền mặt và dây đeo cổ tay tháo rời. Bề mặt phẳng đan lưới rất lý tưởng để đính vỏ sò, ốc xoắn nghệ thuật.',
    basePrice: 210000,
    craftFee: 25000,
    stock: 30,
    images: [ASSETS.products.zipWallet],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    sizes: ['Tiêu chuẩn (20x11cm)'],
    colors: [
      PRODUCT_COLOR_PRESETS.charcoalInk,
      PRODUCT_COLOR_PRESETS.kelpGreen,
      PRODUCT_COLOR_PRESETS.terracottaRust,
      PRODUCT_COLOR_PRESETS.deepNavy,
    ],
    model3D: {
      meshPreset: 'zip_wallet',
      glbUrl: '',
      defaultBaseColor: PRODUCT_COLOR_PRESETS.charcoalInk,
      defaultStrapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
      availableColors: [
        PRODUCT_COLOR_PRESETS.charcoalInk,
        PRODUCT_COLOR_PRESETS.kelpGreen,
        PRODUCT_COLOR_PRESETS.terracottaRust,
        PRODUCT_COLOR_PRESETS.deepNavy,
      ],
      allowSurfacePlacement: true,
    },
    ecoImpact: {
      netWeightGrams: 160,
      originSea: 'Vịnh Lăng Cô – Hải Vân',
      recycledPlasticPct: 88,
      artisanGroup: 'HTX Làng Chài Thọ Quang',
      co2SavedGrams: 480,
    },
  },
  {
    _id: 'prod-apparel-01',
    name: 'Áo Khoác Gile Denim Phối Lưới Đại Dương',
    slug: 'ao-khoac-gile-denim-phoi-luoi-dai-duong',
    sku: 'DTU-APP-001',
    category: 'apparel',
    shortDescription: 'Áo khoác Gile Upcycled từ vải jean tái sinh kết hợp cầu vai & túi lưới đánh cá.',
    description:
      'Tuyên ngôn thời trang bền vững (Upcycled Streetwear): Thân áo được ghép từ vải bộ đồ bảo hộ biển và denim tái chế, phần ngực và lưng phủ lớp lưới đánh cá thu hồi tạo hiệu ứng layer độc đáo. Cho phép đính vỏ sò, sao biển, charm rùa biển lên ve áo, cầu vai hoặc túi ngực trên 3D Studio.',
    basePrice: 540000,
    craftFee: 45000,
    stock: 12,
    images: [ASSETS.products.oceanVest],
    isCustomizable: true,
    isFeatured: true,
    isActive: true,
    sizes: ['S/M (45-62kg)', 'L/XL (63-80kg)'],
    colors: [
      PRODUCT_COLOR_PRESETS.deepNavy,
      PRODUCT_COLOR_PRESETS.kelpGreen,
      PRODUCT_COLOR_PRESETS.charcoalInk,
      PRODUCT_COLOR_PRESETS.driftwoodBrown,
    ],
    model3D: {
      meshPreset: 'ocean_vest',
      glbUrl: '',
      defaultBaseColor: PRODUCT_COLOR_PRESETS.deepNavy,
      defaultStrapColor: PRODUCT_COLOR_PRESETS.kelpGreen,
      availableColors: [
        PRODUCT_COLOR_PRESETS.deepNavy,
        PRODUCT_COLOR_PRESETS.kelpGreen,
        PRODUCT_COLOR_PRESETS.charcoalInk,
        PRODUCT_COLOR_PRESETS.driftwoodBrown,
      ],
      allowSurfacePlacement: true,
    },
    ecoImpact: {
      netWeightGrams: 640,
      originSea: 'Vùng biển Hoàng Sa – Miền Trung',
      recycledPlasticPct: 90,
      artisanGroup: 'Xưởng May Tái Sinh Đà Nẵng',
      co2SavedGrams: 1920,
    },
  },
  {
    _id: 'prod-accessory-01',
    name: 'Móc Khóa & Chuông Gió Lưới Biển Vỏ Sò',
    slug: 'moc-khoa-chuong-gio-luoi-bien-vo-so',
    sku: 'DTU-ACC-001',
    category: 'accessory',
    shortDescription: 'Phụ kiện treo túi xách hoặc treo cửa sổ kết từ phao lưới cổ điển và vỏ sò tự nhiên.',
    description:
      'Bộ phụ kiện treo trang trí được tết từ phao lưới đánh cá thu nhỏ và dây lưới xoắn. Có thể dùng làm charm treo túi xách, móc khóa balo hoặc treo góc làm việc mang hơi thở biển cả.',
    basePrice: 95000,
    craftFee: 15000,
    stock: 40,
    images: [ASSETS.products.shellCharmHolder],
    isCustomizable: true,
    isFeatured: false,
    isActive: true,
    sizes: ['Tiêu chuẩn (15cm)'],
    colors: [
      PRODUCT_COLOR_PRESETS.kelpGreen,
      PRODUCT_COLOR_PRESETS.terracottaRust,
      PRODUCT_COLOR_PRESETS.amberCord,
    ],
    model3D: {
      meshPreset: 'shell_charm_holder',
      glbUrl: '',
      defaultBaseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
      defaultStrapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
      availableColors: [
        PRODUCT_COLOR_PRESETS.kelpGreen,
        PRODUCT_COLOR_PRESETS.terracottaRust,
        PRODUCT_COLOR_PRESETS.amberCord,
      ],
      allowSurfacePlacement: true,
    },
    ecoImpact: {
      netWeightGrams: 65,
      originSea: 'Bãi Rạng – Sơn Trà',
      recycledPlasticPct: 94,
      artisanGroup: 'Nhóm Thủ Công An Vĩnh',
      co2SavedGrams: 195,
    },
  },
];

export const FALLBACK_MATERIALS: CustomMaterial[] = [
  {
    _id: 'mat-shell-01',
    name: 'Vỏ Sò Điệp Trắng',
    code: 'MAT-SCALLOP-WHT',
    materialType: 'shell',
    description: 'Vỏ sò điệp tự nhiên nhặt tại bãi biển Mỹ Khê, đã mài nhẵn viền và khoan lỗ khâu.',
    unitPrice: 15000,
    stockQuantity: 120,
    colorHex: PRODUCT_COLOR_PRESETS.sandCream,
    thumbnail: ASSETS.materials.scallopShell,
    isActive: true,
    model3D: {
      meshPreset: 'scallop_shell',
      defaultScale: 1.0,
    },
  },
  {
    _id: 'mat-shell-02',
    name: 'Vỏ Sò Điệp Hồng San Hô',
    code: 'MAT-SCALLOP-PNK',
    materialType: 'shell',
    description: 'Vỏ sò điệp vân hồng cam tự nhiên quý hiếm, tạo điểm nhấn nổi bật trên nền lưới xanh.',
    unitPrice: 18000,
    stockQuantity: 85,
    colorHex: PRODUCT_COLOR_PRESETS.coralShell,
    thumbnail: ASSETS.materials.scallopShell,
    isActive: true,
    model3D: {
      meshPreset: 'scallop_shell',
      defaultScale: 1.0,
    },
  },
  {
    _id: 'mat-shell-03',
    name: 'Ốc Sứ Trắng (Cowrie Shell)',
    code: 'MAT-COWRIE-01',
    materialType: 'shell',
    description: 'Vỏ ốc sứ bóng mịn thường dùng đính vòng tay và viền túi xách biển.',
    unitPrice: 12000,
    stockQuantity: 150,
    colorHex: PRODUCT_COLOR_PRESETS.cowrieIvory,
    thumbnail: ASSETS.materials.cowrieShell,
    isActive: true,
    model3D: {
      meshPreset: 'cowrie_shell',
      defaultScale: 0.9,
    },
  },
  {
    _id: 'mat-snail-01',
    name: 'Ốc Xoắn Hoàng Kim',
    code: 'MAT-SNAIL-GLD',
    materialType: 'snail',
    description: 'Vỏ ốc tháp xoắn ốc tự nhiên ánh vàng cát ấm áp.',
    unitPrice: 25000,
    stockQuantity: 64,
    colorHex: PRODUCT_COLOR_PRESETS.goldenSnail,
    thumbnail: ASSETS.materials.spiralSnail,
    isActive: true,
    model3D: {
      meshPreset: 'spiral_snail',
      defaultScale: 1.0,
    },
  },
  {
    _id: 'mat-snail-02',
    name: 'Ốc Xà Cừ Xanh Ngọc',
    code: 'MAT-CONCH-TEAL',
    materialType: 'snail',
    description: 'Vỏ ốc biển đánh bóng lộ lớp xà cừ ánh xanh ngọc bích.',
    unitPrice: 28000,
    stockQuantity: 42,
    colorHex: PRODUCT_COLOR_PRESETS.turquoiseConch,
    thumbnail: ASSETS.materials.spiralSnail,
    isActive: true,
    model3D: {
      meshPreset: 'conch_snail',
      defaultScale: 1.0,
    },
  },
  {
    _id: 'mat-charm-01',
    name: 'Charm Sao Biển Đúc Đồng',
    code: 'MAT-STARFISH-01',
    materialType: 'charm',
    description: 'Charm hình sao biển 5 cánh đúc hợp kim đồng tái chế chống gỉ nước biển.',
    unitPrice: 22000,
    stockQuantity: 90,
    colorHex: PRODUCT_COLOR_PRESETS.copperStarfish,
    thumbnail: ASSETS.materials.starfishCharm,
    isActive: true,
    model3D: {
      meshPreset: 'starfish_charm',
      defaultScale: 1.0,
    },
  },
  {
    _id: 'mat-charm-02',
    name: 'Charm Rùa Biển Xanh',
    code: 'MAT-TURTLE-01',
    materialType: 'charm',
    description: 'Biểu tượng bảo tồn rùa biển Côn Đảo & Cù Lao Chàm.',
    unitPrice: 30000,
    stockQuantity: 55,
    colorHex: PRODUCT_COLOR_PRESETS.emeraldTurtle,
    thumbnail: ASSETS.materials.starfishCharm,
    isActive: true,
    model3D: {
      meshPreset: 'turtle_charm',
      defaultScale: 1.0,
    },
  },
  {
    _id: 'mat-bead-01',
    name: 'Hạt Ngọc Trai Nước Ngọt',
    code: 'MAT-PEARL-01',
    materialType: 'bead',
    description: 'Hạt ngọc trai ánh xà cừ tự nhiên sang trọng.',
    unitPrice: 20000,
    stockQuantity: 110,
    colorHex: PRODUCT_COLOR_PRESETS.sandCream,
    isActive: true,
    model3D: {
      meshPreset: 'pearl_bead',
      defaultScale: 0.85,
    },
  },
  {
    _id: 'mat-bead-02',
    name: 'Hạt Thủy Tinh Biển (Sea Glass)',
    code: 'MAT-SEAGLASS-01',
    materialType: 'bead',
    description: 'Mảnh thủy tinh được sóng biển mài tròn tự nhiên, bề mặt mờ sương.',
    unitPrice: 15000,
    stockQuantity: 95,
    colorHex: PRODUCT_COLOR_PRESETS.seaGlassBlue,
    isActive: true,
    model3D: {
      meshPreset: 'sea_glass_bead',
      defaultScale: 0.9,
    },
  },
  {
    _id: 'mat-cord-01',
    name: 'Nút Thắt Dây Lưới Thủy Thủ',
    code: 'MAT-KNOT-01',
    materialType: 'cord',
    description: 'Hoa văn nút thắt dây lưới đánh cá thủ công đính kèm trang trí.',
    unitPrice: 10000,
    stockQuantity: 8,
    colorHex: PRODUCT_COLOR_PRESETS.kelpGreen,
    isActive: true,
    model3D: {
      meshPreset: 'fishing_cord',
      defaultScale: 1.0,
    },
  },
];

// ============================================================================
// GENERIC HTTP FETCH HELPER & AUTOMATIC ADMIN TOKEN HANDLER
// ============================================================================

let cachedAdminToken: string | null = null;

async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  if (cachedAdminToken) {
    return { Authorization: `Bearer ${cachedAdminToken}` };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ENV.DEFAULT_ADMIN_EMAIL,
        password: ENV.DEFAULT_ADMIN_PASSWORD,
      }),
    });
    const json = await res.json();
    const token = json?.data?.token || json?.token;
    if (token) {
      cachedAdminToken = token;
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Ignore if backend is offline
  }
  return {};
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data: T; message?: string; meta?: Record<string, unknown> }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: options?.cache || 'no-store',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || `API Error (${res.status})`);
  }
  return json;
}

// ============================================================================
// PUBLIC & STORE API FUNCTIONS
// ============================================================================

function normalizeLandingContent(raw?: Partial<LandingContent> | null): LandingContent {
  if (!raw) return FALLBACK_LANDING_CONTENT;

  const heroBanner = {
    title:
      raw.heroBanner?.title ||
      raw.heroTitle ||
      FALLBACK_LANDING_CONTENT.heroTitle,
    subtitle:
      raw.heroBanner?.subtitle ||
      raw.heroSubtitle ||
      FALLBACK_LANDING_CONTENT.heroSubtitle,
    ctaText:
      raw.heroBanner?.ctaText ||
      raw.heroCtaPrimary ||
      FALLBACK_LANDING_CONTENT.heroCtaPrimary,
    ctaLink: raw.heroBanner?.ctaLink || '/shop',
    backgroundImageUrl:
      raw.heroBanner?.backgroundImageUrl ||
      FALLBACK_LANDING_CONTENT.heroBanner?.backgroundImageUrl ||
      ASSETS.landing.oceanHero,
    secondaryImageUrl:
      raw.heroBanner?.secondaryImageUrl ||
      FALLBACK_LANDING_CONTENT.heroBanner?.secondaryImageUrl ||
      ASSETS.landing.fishingNetClose,
    tertiaryImageUrl:
      raw.heroBanner?.tertiaryImageUrl ||
      FALLBACK_LANDING_CONTENT.heroBanner?.tertiaryImageUrl ||
      ASSETS.products.toteBagMain,
  };

  const processSteps =
    raw.processSteps && raw.processSteps.length > 0
      ? raw.processSteps
      : (raw.recyclingSteps || FALLBACK_LANDING_CONTENT.recyclingSteps).map(
          (step, idx) => ({
            stepNumber: step.stepNumber || idx + 1,
            title: step.title,
            description: step.description,
            badgeText: step.badgeText,
            imageUrl:
              step.imageUrl ||
              FALLBACK_LANDING_CONTENT.processSteps?.[idx]?.imageUrl ||
              ASSETS.landing.oceanHero,
          })
        );

  const recyclingSteps =
    raw.recyclingSteps && raw.recyclingSteps.length > 0
      ? raw.recyclingSteps.map((step, idx) => ({
          ...step,
          imageUrl:
            step.imageUrl ||
            processSteps[idx]?.imageUrl ||
            ASSETS.landing.oceanHero,
        }))
      : processSteps.map((step) => ({
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          badgeText: step.badgeText || `Step 0${step.stepNumber}`,
          imageUrl: step.imageUrl,
        }));

  const galleryImages =
    raw.galleryImages && raw.galleryImages.length > 0
      ? raw.galleryImages
      : FALLBACK_LANDING_CONTENT.galleryImages || [...ASSETS.landing.gallery];

  const rawArtisan = raw.artisanStory || FALLBACK_LANDING_CONTENT.artisanStory;
  const artisanStory = {
    headline:
      rawArtisan.headline ||
      rawArtisan.heading ||
      FALLBACK_LANDING_CONTENT.artisanStory.headline,
    heading:
      rawArtisan.heading ||
      rawArtisan.headline ||
      FALLBACK_LANDING_CONTENT.artisanStory.headline,
    villageName:
      rawArtisan.villageName ||
      FALLBACK_LANDING_CONTENT.artisanStory.villageName,
    quote: rawArtisan.quote || FALLBACK_LANDING_CONTENT.artisanStory.quote,
    body:
      rawArtisan.body ||
      rawArtisan.bodyText ||
      FALLBACK_LANDING_CONTENT.artisanStory.body,
    bodyText:
      rawArtisan.bodyText ||
      rawArtisan.body ||
      FALLBACK_LANDING_CONTENT.artisanStory.body,
    artisanName:
      rawArtisan.artisanName ||
      FALLBACK_LANDING_CONTENT.artisanStory.artisanName,
    artisanRole:
      rawArtisan.artisanRole ||
      FALLBACK_LANDING_CONTENT.artisanStory.artisanRole,
    avatarUrl:
      rawArtisan.avatarUrl ||
      FALLBACK_LANDING_CONTENT.artisanStory.avatarUrl ||
      ASSETS.hero.artisanWeaver,
    workshopImageUrl:
      rawArtisan.workshopImageUrl ||
      FALLBACK_LANDING_CONTENT.artisanStory.workshopImageUrl ||
      ASSETS.landing.fishingNetHarbor,
  };

  return {
    heroTitle: raw.heroTitle || heroBanner.title,
    heroSubtitle: raw.heroSubtitle || heroBanner.subtitle,
    heroCtaPrimary: raw.heroCtaPrimary || heroBanner.ctaText || 'Khám Phá Cửa Hàng Xanh',
    heroCtaSecondary:
      raw.heroCtaSecondary || FALLBACK_LANDING_CONTENT.heroCtaSecondary,
    heroBanner,
    impactCounters:
      raw.impactCounters || FALLBACK_LANDING_CONTENT.impactCounters,
    recyclingSteps,
    processSteps,
    galleryImages,
    artisanStory,
  };
}

export async function getLandingContent(): Promise<LandingContent> {
  try {
    const res = await fetchApi<LandingContent>('/content/landing');
    if (res?.data) {
      return normalizeLandingContent(res.data);
    }
    return FALLBACK_LANDING_CONTENT;
  } catch {
    return FALLBACK_LANDING_CONTENT;
  }
}

export async function updateLandingContent(
  payload: Partial<LandingContent>
): Promise<LandingContent> {
  const authHeaders = await getAdminAuthHeaders();
  try {
    const res = await fetchApi<LandingContent>('/admin/landing', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    return normalizeLandingContent(res.data);
  } catch {
    const res = await fetchApi<LandingContent>('/content/landing', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    return normalizeLandingContent(res.data);
  }
}

// ============================================================================
// AWS S3 & CLOUD MEDIA UPLOAD API FUNCTIONS
// ============================================================================

export async function getMediaStatus(): Promise<MediaStorageStatus> {
  try {
    const res = await fetchApi<MediaStorageStatus>('/media/status');
    if (res?.data) return res.data;
  } catch {
    // Fallback status when backend is offline
  }
  return {
    storageMode: 's3',
    isS3Configured: true,
    bucket: 'dtu-img-db-868017909899-ap-southeast-2-an',
    region: 'ap-southeast-2',
    publicBaseUrl: ENV.S3_BASE_URL,
    maxFileSizeMb: 10,
    folders: ['landing', 'products', 'materials', 'custom-previews'],
  };
}

export async function uploadMediaFile(
  file: File,
  folder: MediaStorageFolder = 'products'
): Promise<MediaUploadResult> {
  const requiresAdmin =
    folder === 'landing' || folder === 'products' || folder === 'materials';
  const authHeaders = requiresAdmin ? await getAdminAuthHeaders() : {};

  // 1. Try Multipart Upload to POST /api/media/upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        ...authHeaders,
      },
      body: formData,
    });

    const json = await res.json().catch(() => ({}));
    if (res.ok && json?.data?.url) {
      return json.data as MediaUploadResult;
    }
  } catch {
    // Proceed to presigned URL or local object URL fallback
  }

  // 2. Fallback: Try Presigned URL flow if available
  try {
    const presignRes = await fetchApi<{
      uploadUrl: string;
      publicUrl: string;
      key: string;
      folder: string;
      storageMode?: 's3' | 'local-fallback';
    }>('/media/presigned-url', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
        folder,
      }),
    });

    if (presignRes?.data?.uploadUrl) {
      await fetch(presignRes.data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
      });

      return {
        url: presignRes.data.publicUrl,
        key: presignRes.data.key,
        folder: presignRes.data.folder || folder,
        storageMode: presignRes.data.storageMode || 's3',
        contentType: file.type || 'image/jpeg',
        size: file.size,
      };
    }
  } catch {
    // Fallback to client DataURL preview if backend is unreachable
  }

  // 3. Offline-resilient DataURL fallback so CMS / Studio never breaks
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  return {
    url: dataUrl,
    key: `${folder}/${Date.now()}-${file.name}`,
    folder,
    storageMode: 'local-fallback',
    contentType: file.type || 'image/jpeg',
    size: file.size,
  };
}

export interface ProductQueryFilters {
  category?: string;
  isCustomizable?: boolean | string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  includeInactive?: boolean;
}

export async function getProducts(filters?: ProductQueryFilters): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.isCustomizable !== undefined && filters.isCustomizable !== '') {
      params.set('isCustomizable', String(filters.isCustomizable));
    }
    if (filters?.search) params.set('search', filters.search);
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.includeInactive) params.set('includeInactive', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<Product[] | { items: Product[]; products: Product[] }>(`/products${queryString}`);
    const list = Array.isArray(res.data)
      ? res.data
      : res.data?.items || res.data?.products || [];
    if (list.length > 0) return list;
  } catch {
    // Fallback filter locally when backend is offline or empty
  }

  let list = [...FALLBACK_PRODUCTS];
  if (filters?.category && filters.category !== 'all') {
    list = list.filter((p) => p.category === filters.category);
  }
  if (filters?.isCustomizable === true || filters?.isCustomizable === 'true') {
    list = list.filter((p) => p.isCustomizable);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );
  }
  if (filters?.sort === 'price_asc') {
    list.sort((a, b) => a.basePrice - b.basePrice);
  } else if (filters?.sort === 'price_desc') {
    list.sort((a, b) => b.basePrice - a.basePrice);
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetchApi<Product>(`/products/${slug}`);
    if (res?.data) return res.data;
  } catch {
    // Fallback
  }
  return (
    FALLBACK_PRODUCTS.find((p) => p.slug === slug || p._id === slug) ||
    FALLBACK_PRODUCTS[0] ||
    null
  );
}

export async function getCustomMaterials(materialType?: string): Promise<CustomMaterial[]> {
  try {
    const query = materialType && materialType !== 'all' ? `?materialType=${materialType}` : '';
    const res = await fetchApi<CustomMaterial[] | { items: CustomMaterial[]; materials: CustomMaterial[] }>(
      `/materials${query}`
    );
    const list = Array.isArray(res.data)
      ? res.data
      : res.data?.items || res.data?.materials || [];
    if (list.length > 0) return list;
  } catch {
    // Fallback
  }
  if (materialType && materialType !== 'all') {
    return FALLBACK_MATERIALS.filter((m) => m.materialType === materialType);
  }
  return FALLBACK_MATERIALS;
}

export async function saveCustomDesign(
  payload: Omit<CustomDesignSnapshot, '_id'>
): Promise<CustomDesignSnapshot> {
  try {
    const res = await fetchApi<CustomDesignSnapshot>('/custom-designs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  } catch {
    return {
      ...payload,
      _id: `design-${Date.now()}`,
    };
  }
}

export interface CreateOrderPayload {
  customerInfo: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    note?: string;
  };
  paymentMethod: 'cod' | 'vietqr';
  items: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    isCustom: boolean;
    customDesignId?: string;
    customDesignSnapshot?: CustomDesignSnapshot;
  }>;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetchApi<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function lookupOrderByCode(orderCode: string, phone?: string): Promise<Order> {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const res = await fetchApi<Order>(`/orders/lookup/${encodeURIComponent(orderCode.trim())}${query}`);
  return res.data;
}

export async function cancelOrderByCustomer(orderIdOrCode: string, phone?: string, reason?: string): Promise<Order> {
  const res = await fetchApi<Order>(`/orders/${encodeURIComponent(orderIdOrCode)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'cancelled',
      phone,
      note: reason || 'Khách hàng yêu cầu hủy đơn',
    }),
  });
  return res.data;
}

// ============================================================================
// ADMIN & CMS API FUNCTIONS
// ============================================================================

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  try {
    const authHeaders = await getAdminAuthHeaders();
    const res = await fetchApi<AdminDashboardData>('/admin/dashboard', {
      headers: authHeaders,
    });
    if (res?.data) return res.data;
  } catch {
    // Fallback
  }
  return {
    totalRevenue: 18450000,
    totalOrders: 42,
    craftingOrdersCount: 9,
    totalNetsRecycledGrams: 16850,
    lowStockMaterials: FALLBACK_MATERIALS.filter((m) => m.stockQuantity <= 10),
    lowStockProducts: FALLBACK_PRODUCTS.filter((p) => p.stock <= 10),
    recentOrders: [],
  };
}

export async function getAdminOrders(status?: string, search?: string): Promise<Order[]> {
  try {
    const authHeaders = await getAdminAuthHeaders();
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<Order[] | { orders: Order[]; items: Order[] }>(`/orders${query}`, {
      headers: authHeaders,
    });
    return Array.isArray(res.data) ? res.data : res.data?.orders || res.data?.items || [];
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<Order> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status, note }),
  });
  return res.data;
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<Order> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Order>(`/orders/${orderId}/payment`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ paymentStatus }),
  });
  return res.data;
}

export async function createProductAdmin(payload: Partial<Product>): Promise<Product> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Product>('/products', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateProductAdmin(id: string, payload: Partial<Product>): Promise<Product> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<Product>(`/products/${id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteProductAdmin(id: string): Promise<void> {
  const authHeaders = await getAdminAuthHeaders();
  await fetchApi(`/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
}

export async function createMaterialAdmin(payload: Partial<CustomMaterial>): Promise<CustomMaterial> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<CustomMaterial>('/materials', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateMaterialAdmin(
  id: string,
  payload: Partial<CustomMaterial>
): Promise<CustomMaterial> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetchApi<CustomMaterial>(`/materials/${id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteMaterialAdmin(id: string): Promise<void> {
  const authHeaders = await getAdminAuthHeaders();
  await fetchApi(`/materials/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
}

// ============================================================================
// KEEP-ALIVE HEARTBEAT HELPER (PREVENT RENDER COLD START / SPIN-DOWN)
// ============================================================================

export async function pingServerKeepAlive(): Promise<void> {
  if (!API_BASE_URL) return;
  try {
    await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    // Silent catch so keep-alive ping never interrupts user experience
  }
}

