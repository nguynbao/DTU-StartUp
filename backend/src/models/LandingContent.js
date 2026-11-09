const mongoose = require('mongoose');
const { LANDING_ASSETS, PRODUCT_ASSETS } = require('../config/assets');

const landingContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main_landing',
      unique: true,
    },
    hero: {
      badgeText: {
        type: String,
        default: 'Sáng Kiến Đại Dương Xanh DTU • Upcycled Fishing Nets & Ocean Craft',
      },
      title: {
        type: String,
        default: 'Từ Lưới Ma Đại Dương Đến Phụ Kiện Thủ Công Độc Bản',
      },
      subtitle: {
        type: String,
        default:
          'Mỗi chiếc túi lưới, giỏ đựng đồ, ví tiền hay vòng tay đều được tái sinh từ những tấm lưới đánh cá thu hồi tại vùng biển miền Trung Việt Nam — kết hợp nghệ thuật đính vỏ sò, ốc biển cá nhân hóa 3D theo phong cách riêng của bạn.',
      },
      primaryCtaText: {
        type: String,
        default: 'Tự Thiết Kế 3D Ngay',
      },
      primaryCtaLink: {
        type: String,
        default: '/customizer',
      },
      secondaryCtaText: {
        type: String,
        default: 'Khám Phá Cửa Hàng',
      },
      secondaryCtaLink: {
        type: String,
        default: '/shop',
      },
      heroImage: {
        type: String,
        default: () => LANDING_ASSETS.HERO_BANNER,
      },
      secondaryImageUrl: {
        type: String,
        default: () => LANDING_ASSETS.OCEAN_NET_RECOVERY,
      },
      tertiaryImageUrl: {
        type: String,
        default: () => PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN,
      },
    },
    heroBanner: {
      backgroundImageUrl: {
        type: String,
        default: () => LANDING_ASSETS.HERO_BANNER,
      },
      secondaryImageUrl: {
        type: String,
        default: () => LANDING_ASSETS.OCEAN_NET_RECOVERY,
      },
      tertiaryImageUrl: {
        type: String,
        default: () => PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN,
      },
    },
    impactStats: {
      ghostNetsCollectedKg: {
        type: Number,
        default: 3480,
      },
      marineLifeProtected: {
        type: Number,
        default: 15200,
      },
      upcycledProductsCreated: {
        type: Number,
        default: 6850,
      },
      localArtisansSupported: {
        type: Number,
        default: 42,
      },
    },
    recyclingSteps: {
      type: [
        {
          stepNumber: Number,
          title: String,
          description: String,
          iconName: String,
          metricLabel: String,
          imageUrl: String,
        },
      ],
      default: () => [
        {
          stepNumber: 1,
          title: 'Thu Gom Lưới Ma Đại Dương',
          description:
            'Phối hợp cùng ngư dân Đà Nẵng, Hội An và Cù Lao Chàm thu hồi các tấm lưới đánh cá bị rách hoặc trôi dạt đe dọa rạn san hô.',
          iconName: 'Anchor',
          metricLabel: '100% Lưới biển thu hồi có truy xuất nguồn gốc',
          imageUrl: LANDING_ASSETS.OCEAN_NET_RECOVERY,
        },
        {
          stepNumber: 2,
          title: 'Khử Muối & Xử Lý Sợi Sinh Học',
          description:
            'Lưới được ngâm rửa bằng dung dịch thảo mộc tự nhiên, phơi nắng biển khử khuẩn và phân loại theo độ dày sợi HDPE/Nylon.',
          iconName: 'Sparkles',
          metricLabel: 'Tiết kiệm 78% lượng nước so với sản xuất sợi mới',
          imageUrl: LANDING_ASSETS.TURQUOISE_SEA_WAVE,
        },
        {
          stepNumber: 3,
          title: 'Đan Thủ Công Bởi Nghệ Nhân Làng Chài',
          description:
            'Đôi bàn tay khéo léo của các cô, các chị làng chài đan từng mắt lưới thành giỏ đựng đồ, túi xách, ví tiền, áo lưới và vòng tay bền chắc.',
          iconName: 'HeartHandshake',
          metricLabel: 'Tạo sinh kế bền vững cho 42 phụ nữ ven biển',
          imageUrl: PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN,
        },
        {
          stepNumber: 4,
          title: 'Cá Nhân Hóa 3D Với Vỏ Sò & Ốc Biển',
          description:
            'Bạn tự tay gắn vỏ sò điệp, ốc xoắn, sao biển hay ngọc trai lên bất kỳ vị trí nào trên mô hình 3D trước khi xưởng khâu hoàn thiện độc bản.',
          iconName: 'Box',
          metricLabel: 'Xoay 360° & Đặt vị trí Free-form theo ý thích',
          imageUrl: PRODUCT_ASSETS.BRACELET_MY_KHE,
        },
      ],
    },
    processSteps: {
      type: [
        {
          stepNumber: Number,
          title: String,
          description: String,
          iconName: String,
          metricLabel: String,
          imageUrl: String,
        },
      ],
      default: () => [
        {
          stepNumber: 1,
          title: 'Thu Gom Lưới Ma Đại Dương',
          description:
            'Phối hợp cùng ngư dân Đà Nẵng, Hội An và Cù Lao Chàm thu hồi các tấm lưới đánh cá bị rách hoặc trôi dạt đe dọa rạn san hô.',
          iconName: 'Anchor',
          metricLabel: '100% Lưới biển thu hồi có truy xuất nguồn gốc',
          imageUrl: LANDING_ASSETS.OCEAN_NET_RECOVERY,
        },
        {
          stepNumber: 2,
          title: 'Khử Muối & Xử Lý Sợi Sinh Học',
          description:
            'Lưới được ngâm rửa bằng dung dịch thảo mộc tự nhiên, phơi nắng biển khử khuẩn và phân loại theo độ dày sợi HDPE/Nylon.',
          iconName: 'Sparkles',
          metricLabel: 'Tiết kiệm 78% lượng nước so với sản xuất sợi mới',
          imageUrl: LANDING_ASSETS.TURQUOISE_SEA_WAVE,
        },
        {
          stepNumber: 3,
          title: 'Đan Thủ Công Bởi Nghệ Nhân Làng Chài',
          description:
            'Đôi bàn tay khéo léo của các cô, các chị làng chài đan từng mắt lưới thành giỏ đựng đồ, túi xách, ví tiền, áo lưới và vòng tay bền chắc.',
          iconName: 'HeartHandshake',
          metricLabel: 'Tạo sinh kế bền vững cho 42 phụ nữ ven biển',
          imageUrl: PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN,
        },
        {
          stepNumber: 4,
          title: 'Cá Nhân Hóa 3D Với Vỏ Sò & Ốc Biển',
          description:
            'Bạn tự tay gắn vỏ sò điệp, ốc xoắn, sao biển hay ngọc trai lên bất kỳ vị trí nào trên mô hình 3D trước khi xưởng khâu hoàn thiện độc bản.',
          iconName: 'Box',
          metricLabel: 'Xoay 360° & Đặt vị trí Free-form theo ý thích',
          imageUrl: PRODUCT_ASSETS.BRACELET_MY_KHE,
        },
      ],
    },
    galleryImages: {
      type: [String],
      default: () => [
        LANDING_ASSETS.HERO_BANNER,
        LANDING_ASSETS.OCEAN_NET_RECOVERY,
        PRODUCT_ASSETS.TOTE_BAG_SON_TRA_MAIN,
        PRODUCT_ASSETS.BASKET_CU_LAO_CHAM,
        PRODUCT_ASSETS.WALLET_THANH_KHE,
        PRODUCT_ASSETS.BRACELET_MY_KHE,
      ],
    },
    studioHighlight: {
      headline: {
        type: String,
        default: 'Phòng Thiết Kế 3D Free-form Đầu Tiên Cho Đồ Tái Chế Đại Dương',
      },
      description: {
        type: String,
        default:
          'Không còn giới hạn ở những mẫu có sẵn. Chỉ cần chạm lên bề mặt túi xách, giỏ lưới, ví, áo quần hay vòng tay 3D để đính từng vỏ sò, con ốc đúng vị trí bạn muốn. Hệ thống tự động căn góc bám sát mặt cong và tính giá BOM minh bạch từng linh kiện.',
      },
      features: {
        type: [String],
        default: [
          'Click đính vỏ sò, ốc biển tự do lên mọi điểm trên bề mặt 3D (Raycasting)',
          'Xoay 360°, thu phóng từ 0.4x đến 2.5x và đổi màu sợi lưới trực quan',
          'Bảng bóc tách giá BOM thời gian thực: Phôi + Phụ kiện + Phí chế tác',
          'Nghệ nhân làng chài nhận trực tiếp mô hình 3D của bạn để khâu chính xác 100%',
        ],
      },
    },
    artisanStory: {
      name: {
        type: String,
        default: 'Cô Nguyễn Thị Lành',
      },
      role: {
        type: String,
        default: 'Nghệ nhân Đan Lưới Trưởng',
      },
      village: {
        type: String,
        default: 'Làng chài Thanh Khê, Đà Nẵng',
      },
      quote: {
        type: String,
        default:
          'Hơn 30 năm vá lưới cho tàu xa bờ, tôi không ngờ những tấm lưới cũ kỹ lại có thể hóa thành chiếc túi thời trang được các bạn trẻ tự gắn vỏ sò trên 3D đẹp đến vậy.',
      },
      avatarUrl: {
        type: String,
        default: () => LANDING_ASSETS.ARTISAN_LANH_AVATAR,
      },
      workshopImageUrl: {
        type: String,
        default: () => LANDING_ASSETS.WORKSHOP_CRAFTING,
      },
    },
    artisanStories: {
      type: [
        {
          name: String,
          role: String,
          village: String,
          quote: String,
          avatar: String,
          yearsOfCraft: Number,
        },
      ],
      default: () => [
        {
          name: 'Cô Nguyễn Thị Lành',
          role: 'Nghệ nhân Đan Lưới Trưởng',
          village: 'Làng chài Thanh Khê, Đà Nẵng',
          quote:
            'Hơn 30 năm vá lưới cho tàu xa bờ, tôi không ngờ những tấm lưới cũ kỹ lại có thể hóa thành chiếc túi thời trang được các bạn trẻ tự gắn vỏ sò trên 3D đẹp đến vậy.',
          avatar: LANDING_ASSETS.ARTISAN_LANH_AVATAR,
          yearsOfCraft: 32,
        },
        {
          name: 'Chị Trần Thị Hải Yến',
          role: 'Nghệ nhân Chế Tác Vỏ Sò & Ốc Biển',
          village: 'Đảo Cù Lao Chàm, Quảng Nam',
          quote:
            'Mỗi vỏ sò điệp, ốc xoắn nhặt trên bãi cát sau mùa biển động đều được chúng tôi mài nhẵn, khoan lỗ thủ công và khâu chắc chắn theo đúng bản vẽ 3D của khách hàng.',
          avatar: LANDING_ASSETS.ARTISAN_YEN_AVATAR,
          yearsOfCraft: 14,
        },
      ],
    },
    seo: {
      metaTitle: {
        type: String,
        default: 'Nét Biển Tái Sinh | Túi Lưới Đánh Cá Tái Chế & Thiết Kế 3D Vỏ Sò Độc Bản',
      },
      metaDescription: {
        type: String,
        default:
          'Thương hiệu thời trang & phụ kiện bền vững từ lưới đánh cá tái chế: Giỏ đựng đồ, túi xách, ví tiền, áo quần, vòng tay. Tự do gắn vỏ sò, ốc biển trên 3D Studio.',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LandingContent', landingContentSchema);
