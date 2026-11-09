---
name: frontend-component-governance
description: >-
  Component-Driven Design, SEO, Zero-Duplication, and Zero-Hardcoding Governance
  for Designer (designer-lead, designer-ui) and Frontend Developers (fe-lead,
  fe-developer) working with ReactJS and NextJS. Enforces pre-design layout
  analysis, shared component extraction, strict component registry checks, and
  strict prohibition of hardcoded keys, colors, text (must use i18n), images,
  and icons.
---

# Quy chuẩn Thiết kế, Component & Chống Hardcode Frontend (ReactJS / NextJS)

## 1. Nguyên tắc Sống còn (Golden Rules)
1. **PHÂN TÍCH LAYOUT TRƯỚC KHI THIẾT KẾ (`designer-lead`, `designer-ui`)**:
   - Không bao giờ thiết kế rời rạc từng trang mà chưa phân tích bố cục tổng thể.
   - Mọi phần tử xuất hiện từ **2 lần trở lên** BẮT BUỘC phải được tách thành **Shared Component** ngay từ bản thiết kế.
2. **KIỂM TRA COMPONENT TRƯỚC KHI CODE — TUYỆT ĐỐI KHÔNG TẠO CODE GIAO DIỆN DƯ THỪA (`fe-lead`, `fe-developer`)**:
   - Trước khi tạo bất kỳ file `.tsx`/`.jsx` mới hoặc viết khối UI trong Page, Dev Frontend **BẮT BUỘC** phải đọc `frontend/src/components/REGISTRY.md` và quét `frontend/src/components/`.
   - Nếu đã có Component tương tự: **Bắt buộc tái sử dụng** hoặc mở rộng bằng `props` / `variants`.

---

## 2. QUY TẮC CẤM HARDCODE TUYỆT ĐỐI (ZERO-HARDCODING GOVERNANCE)

Dev Frontend (`fe-lead`, `fe-developer`) **TUYỆT ĐỐI KHÔNG ĐƯỢC HARDCODE** 5 thành phần sau trực tiếp vào Component hoặc Page:

### 2.1. Không Hardcode Key, Port, URL (`ENV`)
- **Cấm:** Viết trực tiếp `'http://localhost:5000'`, `'http://localhost:3000'`, API keys, secret keys vào các file `.ts`/`.tsx`.
- **Bắt buộc:** Đặt toàn bộ vào `.env` / `.env.local` và đọc thông qua file cấu hình tập trung `frontend/src/config/env.ts` (`ENV.API_URL`, `ENV.STORE_URL`, `ENV.LANDING_URL`, `ENV.CMS_URL`).

### 2.2. Không Hardcode Mã Màu (`Colors -> Semantic CSS Classes & Theme Tokens`)
- **Cấm:** Viết mã màu Hex trực tiếp trong class Tailwind như `bg-[#F6F3EC]`, `text-[#1C1B18]`, `border-[#D8D0C5]` hoặc rải rác mã màu trong JSX.
- **Bắt buộc:**
  - Khai báo biến CSS trong `src/app/globals.css` và ánh xạ thành **Semantic Classes** trong `tailwind.config.ts` (ví dụ: `bg-canvas`, `bg-linen`, `bg-surface`, `text-ink`, `text-muted`, `border-hairline`, `bg-kelp`, `text-kelp`, `bg-terracotta`, `text-terracotta`).
  - Đối với màu chất liệu trong WebGL / Three.js Canvas, phải đọc từ bảng hằng số `THEME_COLORS` tại `frontend/src/config/theme.ts`.

### 2.3. Không Hardcode Text Giao Diện (`Text -> Multi-language i18n`)
- **Cấm:** Viết cứng chuỗi văn bản tiếng Việt/tiếng Anh trực tiếp trong JSX của Component và Page.
- **Bắt buộc:**
  - Quản lý toàn bộ chuỗi văn bản trong từ điển đa ngôn ngữ `frontend/src/i18n/locales/vi.ts` và `frontend/src/i18n/locales/en.ts`.
  - Sử dụng hook `const { t, locale, setLocale } = useI18n()` từ `frontend/src/i18n/I18nContext.tsx` để hiển thị văn bản (`{t('nav.shop')}`, `{t('customizer.wristSize')}`) và hỗ trợ chuyển đổi ngôn ngữ (`VI` / `EN`) tức thời.

### 2.4. Không Hardcode Đường Dẫn Hình Ảnh (`Images -> Centralized Asset Registry`)
- **Cấm:** Rải rác các link ảnh `https://images.unsplash.com/...` hoặc đường dẫn `/images/...` trực tiếp trong các trang và component.
- **Bắt buộc:** Tập trung 100% đường dẫn hình ảnh, placeholder, ảnh sản phẩm mặc định vào `frontend/src/config/assets.ts` (`ASSETS.hero.main`, `ASSETS.products.toteBag`, `ASSETS.placeholders.product`) để dễ dàng kiểm soát và thay đổi tại một nơi duy nhất.

### 2.5. Không Hardcode Icon (`Icons -> Centralized Icon Registry`)
- **Cấm:** Import rời rạc hàng chục icon từ `lucide-react` hoặc nhúng thẻ `<svg>` thủ công ở khắp các trang.
- **Bắt buộc:** Quản lý toàn bộ danh mục icon tại `frontend/src/config/icons.ts` và render thông qua Shared Component `<AppIcon name="bag" className="..." />` (`frontend/src/components/ui/AppIcon.tsx`).

---

## 3. Phân cấp Thư mục Chuẩn (`frontend/src/`)

```text
frontend/src/
├── app/                        # Next.js App Router
├── config/
│   ├── env.ts                  # Quản lý biến môi trường từ .env.local
│   ├── theme.ts                # Quản lý Design Tokens & Màu sắc 3D
│   ├── assets.ts               # Quản lý tập trung toàn bộ Hình ảnh & Media URLs
│   └── icons.ts                # Bản đồ ánh xạ toàn bộ Icon của hệ thống
├── i18n/
│   ├── locales/
│   │   ├── vi.ts               # Từ điển Tiếng Việt
│   │   └── en.ts               # Từ điển Tiếng Anh
│   └── I18nContext.tsx         # Provider & Hook useI18n() đa ngôn ngữ
├── components/
│   ├── REGISTRY.md             # Danh mục bắt buộc tra cứu & cập nhật Component
│   ├── ui/                     # AppIcon, StatusBadge, PriceTag, ModalConfirm, DataTable
│   ├── common/                 # BomPriceBreakdownCard, EcoImpactBadge, OrderStatusStepper, ProductCard, FilterToolbar...
│   ├── layout/                 # AppHeader (kèm chuyển ngôn ngữ VI/EN), AppFooter
│   └── three/                  # ThreeCanvasViewer
├── context/                    # CartContext
├── lib/                        # API client
└── types/                      # TypeScript interfaces
```
