# Đặc Tả Chi Tiết Giao Diện, Tương Tác 3D & Trạng Thái UI/UX (UI/UX Visual & Interaction Specification)
- **Mã tài liệu:** `DES-UI-SPEC-V1.0` (`DES-03` & `DES-04`)
- **Người lập:** `designer-ui` (UI/UX Visual & Interaction Designer)
- **Tài liệu tham chiếu:**
  - [srs-upcycled-ecommerce-3d.md](file:///Users/nguynbao/workspace/DTU-Startup/docs/ba/srs-upcycled-ecommerce-3d.md)
  - [sprint-backlog-and-tasks.md](file:///Users/nguynbao/workspace/DTU-Startup/docs/pm/sprint-backlog-and-tasks.md)
- **Chủ đề thẩm mỹ (Aesthetic Direction):** **Ocean Upcycled Craft** — Sự giao thoa giữa chất liệu thô mộc của sợi lưới đánh cá thu hồi từ đại dương, bề mặt cát vỏ sò ấm áp và độ chính xác của xưởng chế tác 3D hiện đại.

---

## 1. Hệ Thống Design Tokens & Aesthetic Direction (`DES-03`)

### 1.1. Bảng màu chuẩn (Color Palette & Tailwind Mapping)

| Token Name | Biến CSS (`globals.css`) | Mã Hex | Tailwind Class Gợi Ý | Vai trò & Ngữ cảnh sử dụng |
| :--- | :--- | :---: | :--- | :--- |
| **Deep Ocean Net (Primary)** | `--color-ocean-primary` | `#0F766E` | `teal-700` | Màu thương hiệu chính, Primary Button, Active Tab, Điểm nhấn lưới tái chế, Giá tiền chính. |
| **Abyssal Teal (Primary Hover)** | `--color-ocean-hover` | `#115E59` | `teal-800` | Trạng thái `:hover` / `:active` của nút chính và liên kết điều hướng. |
| **Lagoon Mist (Primary Soft)** | `--color-ocean-soft` | `#CCFBF1` | `teal-100` | Nền của `EcoImpactBadge`, điểm đánh dấu bước đang thực hiện trên Stepper. |
| **Seashell Sand (Bg Canvas)** | `--color-sand-canvas` | `#FAF8F5` | `bg-[#FAF8F5]` | Màu nền tổng thể của trang Public (`LandingPage`, `Store`, `Checkout`). |
| **Mother of Pearl (Surface)** | `--color-pearl-surface` | `#F1F5F9` | `slate-100` | Nền khung 3D Viewport, Card phụ, khu vực thông số kỹ thuật BOM, Table Header. |
| **Pure Shell White (Card)** | `--color-card-white` | `#FFFFFF` | `bg-white` | Nền thẻ sản phẩm (`ProductCard`), HUD nổi trong 3D Studio, Modal, Drawer. |
| **Coral Reef (Accent CTA)** | `--color-coral-accent` | `#EA580C` | `orange-600` | Nút hành động chuyển đổi cao ("Tự Custom 3D ngay", "Đặt chế tác", Điểm Raycast 3D). |
| **Coral Glow (Accent Soft)** | `--color-coral-soft` | `#FFEDD5` | `orange-100` | Nền cảnh báo tồn kho nguyên liệu sắp cạn, nhãn "Hỗ trợ Custom 3D". |
| **Sea Slate (Text Primary)** | `--color-slate-ink` | `#0F172A` | `slate-900` | Tiêu đề `H1`–`H3`, nội dung chính, tên sản phẩm, số liệu thống kê. |
| **Driftwood Gray (Text Muted)**| `--color-slate-muted` | `#475569` | `slate-600` | Mô tả phụ, thông số gram lưới thu hồi, nhãn trường dữ liệu. |

---

## 2. Thiết Kế Chi Tiết Từng Màn Hình & 5 Trạng Thái Tương Tác (`DES-04`)

### MÀN HÌNH 1: Web LandingPage (`/`)
- **Bố cục**: Hero Story (Split 7:5 kèm 3D Interactive Showcase) -> 4x Environmental Impact Counter (`EcoImpactBadge`) -> Quy trình 4 bước tái chế lưới đánh cá -> Sản phẩm nổi bật hỗ trợ Custom 3D (`ProductCard`) -> Câu chuyện nghệ nhân làng chài.
- **5 Trạng thái**: Default, Loading Skeleton, Empty Fallback, Error Retry, Active Hover/CTA.

### MÀN HÌNH 2: Danh Mục Cửa Hàng (`/shop`) & Chi Tiết Sản Phẩm 3D (`/product/[slug]`)
- **`/shop`**: `FilterToolbar` (Tìm kiếm, lọc danh mục `basket`/`bag`/`wallet`/`apparel`/`bracelet`/`accessory`, lọc `isCustomizable`, sắp xếp) + Grid 4 cột `ProductCard`.
- **`/product/[slug]`**: Cột trái nhúng `ThreeCanvasViewer` (`mode="preview"`) xoay 360° + Gallery ảnh; Cột phải hiển thị `<h1>`, `EcoImpactBadge`, chọn màu sắc/kích cỡ, nút **"Thêm vào giỏ"** và **"✨ Tự Đính Vỏ Sò & Custom 3D Ngay"**.

### MÀN HÌNH 3: Phòng 3D Customizer Studio (`/customizer`)
- **Cột Trái (`320px`)**: Chọn Phôi sản phẩm 3D (Giỏ đựng đồ, Túi xách, Ví tiền, Áo quần, Vòng tay), đổi màu thân lưới (`baseColor`) & màu dây (`strapColor`), Kho phụ kiện biển (`shell`, `snail`, `charm`, `bead`, `cord`) kèm đơn giá và tồn kho.
- **Cột Giữa (`flex-1`)**: `ThreeCanvasViewer` (`mode="studio"`) hỗ trợ **Free-form 3D Surface Raycasting** (`position: [x,y,z]`, `normal: [nx,ny,nz]`) + Thanh công cụ chỉnh phụ kiện đang chọn (`Scale: 0.4x - 2.5x`, `Rotation: 0° - 360°`, `Color`, `Nhân bản`, `Xóa`, giới hạn `<= 50` phụ kiện).
- **Cột Phải (`340px`)**: `BomPriceBreakdownCard` (`variant="studio_live"`) tính giá cộng dồn thời gian thực (`BR-01`) + Ghi chú cho nghệ nhân + Nút **"Lưu & Thêm Vào Giỏ Hàng"**.

### MÀN HÌNH 4: Giỏ Hàng (`/cart`), Thanh Toán VietQR/COD (`/checkout`) & Tra Cứu Đơn Hàng (`/orders`)
- Hỗ trợ giỏ hàng hỗn hợp (Hàng thường + Hàng Custom 3D kèm bảng kê BOM).
- Thanh toán **COD** hoặc **VietQR** (hiển thị mã QR động với nội dung chuyển khoản là mã đơn `DTU-YYYYMMDD-XXXX`).
- Tra cứu đơn hàng hiển thị `OrderStatusStepper` 6 bước chế tác, xem lại mô hình 3D đã đặt và nút Hủy đơn (chỉ mở khi ở `pending` hoặc `confirmed` theo `BR-05`).

### MÀN HÌNH 5: Hệ Thống Quản Trị Web CMS (`/admin`) & 3D Crafting Inspector
- **5 Tab Quản trị**: Dashboard thống kê & cảnh báo tồn kho thấp (`<= 10`), Quản lý Đơn hàng & Phiếu Chế Tác 3D, Quản lý Sản phẩm gốc (`Product` CRUD), Quản lý Kho Nguyên liệu Vỏ Sò/Ốc (`CustomMaterial` CRUD), Quản lý Nội dung LandingPage.
- **Modal 3D Crafting Inspector**: Hiển thị `ThreeCanvasViewer` (`mode="inspector"`) tái dựng mô hình từ `customDesignSnapshot` (`BR-07`) kèm đánh số thứ tự phụ kiện `#1, #2...` và bảng `BomPriceBreakdownCard` (`variant="crafting_checklist"`) cho thợ thủ công kiểm đếm.
