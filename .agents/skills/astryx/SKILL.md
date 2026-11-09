---
name: astryx
description: >-
  Meta Astryx Design System Skill (https://github.com/meta/astryx.git) — Hệ thống
  Design Tokens, Surface & Elevation Hierarchy, Concentric Shape Relationships,
  Spatial & Typography Hierarchy, Motion Tokens và Component Primitives của Meta Astryx,
  kết hợp với bảng màu Trẻ Trung Xanh Nước (Ocean Aqua) + Xanh Lá (Fresh Leaf Emerald) + Trắng (Crisp White)
  và các quy tắc bắt buộc của dự án DTU-Startup.
---

# Meta Astryx Design System Skill (`astryx`)

> **Nguồn chuẩn**: Tích hợp từ repository chính thức **[`meta/astryx`](https://github.com/meta/astryx.git)** (hệ thống thiết kế mã nguồn mở của Meta phục vụ hơn 13.000 ứng dụng với 150+ components).
> Tài liệu tham chiếu gốc được lưu tại:
> - `.agents/skills/astryx/references/design/` (`shape-relationships.md`, `spatial-hierarchy.md`, `color-emphasis.md`, `elevation-hierarchy.md`, `typography-hierarchy.md`, `motion.md`, `control-rhythm.md`, `system-states.md`)
> - `.agents/skills/astryx/references/architecture/tokens.stylex.ts` & `theme-tokens.md`
> - `.agents/skills/astryx/references/docs/` (`principles.doc.mjs`, `color.doc.mjs`, `shape.doc.mjs`, `elevation.doc.mjs`, `motion.doc.mjs`, `is-my-code-good.doc.mjs`)

---

## 1. Triết lý Cốt lõi của Meta Astryx (Core Design Philosophy)

1. **Components over Primitives**:
   - Mọi phần tử giao diện hoặc mẫu tương tác lặp lại phải đi qua hệ thống **Shared Components** (`frontend/src/components/REGISTRY.md`) thay vì tự dựng thẻ HTML thô rời rạc.
   - Layout quyết định từ khung tổng thể trước (**Frame-First Layout**): Xác định Shell (`AppHeader`, `Main`, `AppFooter`), vùng Bento / Section trước khi đặt nội dung chi tiết.
2. **Layered Surface Hierarchy (`body → surface → card → popover`)**:
   - Phân tầng bề mặt rõ ràng bằng độ sáng và viền mảnh 1px (`--border-width: 1px`) thay vì lạm dụng bóng đổ dày:
     - `body` (`--coastal-bg` / `--color-background-body`): Nền trang tổng thể trắng ánh xanh nước cực nhẹ (`#F6FBFF`).
     - `surface` (`--coastal-mist` / `--color-background-surface`): Bề mặt phân khu / Bento container (`#ECF8FF` hoặc `#EBFDF5`).
     - `card` (`--coastal-card` / `--color-background-card`): Bề mặt thẻ nội dung trắng tinh khiết (`#FFFFFF`).
     - `popover` / `floating` (`.astryx-glass`): Bề mặt nổi có kính mờ `backdrop-blur-xl` + `bg-coastal-card/85`.
3. **Concentric Shape Relationships (`inner → element → container → page → full`)**:
   - Bán kính bo góc tuân thủ ngữ nghĩa đồng tâm (`outer radius - padding = inner radius`):
     - `--radius-inner`: `6px` (`rounded-md`) — phần tử con nằm sâu bên trong control.
     - `--radius-element`: `10px` (`rounded-lg` / `rounded-xl`) — nút bấm chuẩn, ô input, select, segmented item.
     - `--radius-container`: `16px–20px` (`rounded-2xl`) — Card, Modal, Bento Box, Media Frame.
     - `--radius-page`: `28px` (`rounded-3xl` / `rounded-[28px]`) — Hero Showcase, Sticky Scrollytelling Stage, Floating Banner lớn.
     - `--radius-full`: `9999px` (`rounded-full`) — Pill Navigation, Status Badge, Filter Chip, Floating Action Button.
4. **Quiet Elevation (`none → low → med → high`) & Inset State Rings**:
   - **DR3 — One edge language leads**: Bề mặt trong luồng trang sử dụng viền mảnh 1px sắc nét (`border-coastal-line`) kết hợp bóng đổ rất nhẹ (`shadow-coastal` / `--shadow-low`).
   - Chỉ nâng lên `--shadow-med` cho thanh điều hướng nổi (`AppHeader`), Popover, Floating Bar và `--shadow-high` cho Modal Dialog.
   - Trạng thái Focus / Selected của ô nhập liệu và thẻ chọn dùng **Inset Ring** (`--shadow-inset-selected`) hoặc `ring-2` đồng tâm, không làm nhảy layout.
5. **Typography Scale & Control Rhythm**:
   - Phân cấp rõ ràng giữa **Display** (`--text-display-1..3`), **Heading** (`--text-heading-1..6`), **Body** (`14px-16px`), **Label** (`font-medium` / `font-semibold`), **Supporting Text** (`12px`, `text-coastal-muted`) và **Code / Data / Price** (`font-mono tabular-nums`).
   - Chiều cao control chuẩn hóa theo nhịp Astryx: `sm` (`28px-32px`), `md` (`36px-40px`), `lg` (`44px-48px`).
6. **Astryx Motion Tokens (`--duration-fast`, `--duration-medium`, `--ease-standard`)**:
   - Micro-interactions (hover, chip, segmented switch): `--duration-fast` (`175ms`) với `cubic-bezier(0.24, 1, 0.4, 1)` để phản hồi tức thì, không gây trễ con trỏ.
   - Entrance / Layout transitions: `--duration-medium` (`410ms`) với `--ease-entrance` (`cubic-bezier(0.24, 1, 0.4, 1)`).

---

## 2. Bảng Màu Chủ Đạo & Lưu Ý Bắt Buộc Của User (User Mandates)

Khi áp dụng Meta Astryx cho dự án **Lưới Biển Việt (Upcycled Coastal Craft & 3D Studio)**, BẮT BUỘC giữ nguyên 100% các yêu cầu cốt lõi của User:

### 2.1. Bảng Màu Trẻ Trung: Xanh "Nước" (Ocean Aqua) + Xanh "Lá" (Fresh Leaf Emerald) + Trắng (Crisp White)
Kết hợp hệ thống token `--color-*` của Meta Astryx với bộ biến ngữ nghĩa `--coastal-*`:
- **Nền (Surfaces)**:
  - `--coastal-bg`: `#F6FBFF` (`--color-background-body` — Trắng ánh xanh nước biển trong trẻo)
  - `--coastal-mist`: `#ECF8FF` (`--color-background-surface` — Aqua Mist dịu mắt)
  - `--coastal-card`: `#FFFFFF` (`--color-background-card` — Trắng tinh khôi Pure White)
  - `--coastal-sand`: `#E0F2FE` (Soft Sky Aqua Tint)
  - `--coastal-stone`: `#D1FAE5` (Soft Fresh Leaf Mint Tint)
  - `--coastal-deep`: `#064E3B` (Deep Emerald Ocean cho khối tương phản cao)
  - `--coastal-forest`: `#0369A1` (Deep Ocean Blue)
- **Chữ (Typography)**:
  - `--coastal-ink`: `#0A1317` (`--color-text-primary` — Astryx Ink Navy sắc nét)
  - `--coastal-slate`: `#334155` (`--color-text-secondary`)
  - `--coastal-muted`: `#4E606F`
  - `--coastal-sub`: `#64748B`
- **Viền (Hairline Borders)**:
  - `--coastal-line`: `#BAE6FD` (Viền xanh nước mảnh 1px)
  - `--coastal-border`: `#A7F3D0` (Viền xanh lá non mảnh 1px)
- **Màu Nhấn Thương Hiệu (Primary Accents — Xanh Nước & Xanh Lá)**:
  - `--coastal-kelp`: `#0284C7` (`--color-accent` — Ocean Aqua Blue trẻ trung)
  - `--coastal-kelp-hover`: `#0369A1`
  - `--coastal-kelp-light`: `#0EA5E9`
  - `--coastal-rust`: `#10B981` (`--color-success` — Fresh Leaf Emerald Green tươi mát)
  - `--coastal-rust-hover`: `#059669`
  - `--coastal-gold`: `#06B6D4` (Cyan Turquoise)
  - `--coastal-gold-light`: `#34D399` (Fresh Mint Leaf)

### 2.2. Landing Page: Scroll-Driven Animation 60fps & Hình Ảnh Biển / Lưới Đánh Cá
- Tập trung vào trải nghiệm **Animation (Hình ảnh & Chữ) mượt mà theo Scroll trang** sử dụng `ScrollMotion.tsx` (`ScrollProgressBar`, `ScrollRevealText`, `ScrollParallaxBox`, `ScrollStickyShowcase`, `ScrollMarquee`, `AnimatedCounter`).
- Chỉ sử dụng bộ hình ảnh chất lượng cao đã xác thực HTTP 200 trong `frontend/src/config/assets.ts` về **biển xanh đại dương, lưới đánh cá, làng chài và các sản phẩm túi lưới / giỏ lưới / vòng tay vỏ sò**.

### 2.3. Bảo Mật Điều Hướng: Ẩn Hoàn Toàn Nút CMS Trên Store & Landing Page
- Tuyệt đối **KHÔNG** hiển thị bất kỳ nút bấm hay đường dẫn nào vào trang CMS (`ENV.CMS_URL` hoặc `/admin`) trên `AppHeader`, `AppFooter`, hay nội dung của **Store** và **Landing Page**.
- Chỉ khi đang ở ứng dụng `web-cms` (`variant === 'cms'`) mới hiển thị badge quản trị và nút mở sang xem Store / Landing Page.

### 2.4. Phòng 3D Customizer Studio & Vòng Tay Kết Chuỗi
- Giữ nguyên toàn bộ hình học 3D tham số hữu cơ (túi lưới đan sóng, giỏ cói rỗng lòng, ví zip, áo lưới, vỏ sò điệp rãnh quạt, ốc tiền, ốc xoắn, sao biển) và cơ chế **Vòng Tay Kết Chuỗi Tuần Tự (`braided_bracelet`)** chọn chu vi cổ tay (`14-20cm`), số lượng hạt (`6-20`), đính kèm charm và đổi vị trí hạt.

### 2.5. Zero-Hardcoding Governance & Zero-Emoji Policy
- Không hardcode URL/Key (`src/config/env.ts`), không hardcode mã màu Hex trong class Tailwind (`bg-[#...]`), không hardcode chuỗi văn bản (`useI18n()` hỗ trợ `VI | EN`), không hardcode URL ảnh (`src/config/assets.ts`), không import trực tiếp icon (`<AppIcon />`), và tuyệt đối không dùng emoji.
