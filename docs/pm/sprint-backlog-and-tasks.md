# Sprint Backlog, WBS & Handoff Checklists: Nền Tảng Thương Mại Điện Tử & 3D Customizer Sản Phẩm Tái Chế Lưới Đánh Cá & Phụ Kiện Biển
- **Mã tài liệu:** `PM-WBS-UPCYCLED-3D-V1.0`
- **Người lập:** `pm-delivery` (PM Delivery & Sprint Coordinator)
- **Tài liệu tham chiếu:** [srs-upcycled-ecommerce-3d.md](file:///Users/nguynbao/workspace/DTU-Startup/docs/ba/srs-upcycled-ecommerce-3d.md)
- **Trạng thái:** Ready for Execution (Sprint 1 Kickoff)

---

## 1. Cấu Trúc Epics & Lộ Trình Thực Thi Liên Phòng Ban (Sprint Execution Flow)

| Mã Epic | Tên Epic | Trọng tâm nghiệp vụ & Kỹ thuật | Phòng ban phụ trách | Độ ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| **EPIC-01** | **Design System, SEO Layout & Shared Component Architecture** | Thiết kế hệ thống giao diện Ocean Sustainability, quy hoạch Shared Components dùng chung giữa 3 phân hệ Web (`LandingPage`, `Store`, `CMS`) để triệt tiêu code UI trùng lặp. | `designer-lead`, `designer-ui` | P0 (Blocker) |
| **EPIC-02** | **Core Backend Architecture, Schemas & Dynamic BOM Engine** | Xây dựng Express API, 6 Mongoose Schemas, tính giá BOM ở Server (`BR-01`), trừ tồn kho kép Atomic (`BR-04`), Order State Machine (`BR-05`, `BR-06`) và Database Seeder. | `be-architect`, `be-developer` | P0 (Blocker) |
| **EPIC-03** | **Shared 3D Customizer Engine (Free-form Surface Raycasting)** | Xây dựng nhân 3D (`@react-three/fiber` + `@react-three/drei`) hỗ trợ cả Procedural Mesh và `.glb` (`BR-09`), gắn vỏ sò/ốc tự do theo tọa độ `[x,y,z]` + pháp tuyến `[nx,ny,nz]` (`BR-03`), tái sử dụng ở 3 nơi: Product Preview, 3D Studio và CMS 3D Inspector. | `fe-lead`, `fe-developer` | P0 (Core Value) |
| **EPIC-04** | **Web LandingPage & Web Store (Ready-to-Wear + Custom Checkout)** | Xây dựng trang chủ kể chuyện tái chế (`/`), cửa hàng (`/shop`), chi tiết sản phẩm (`/product/[slug]`), phòng 3D Studio (`/customizer`), giỏ hàng & thanh toán VietQR/COD (`/cart`, `/checkout`, `/orders`). | `fe-lead`, `fe-developer` | P0 |
| **EPIC-05** | **Web CMS & 3D Crafting Ticket Inspector (`/admin`)** | Xây dựng cổng quản trị cho Admin & Thợ thủ công: Dashboard thống kê, CRUD Sản phẩm & Kho Vỏ sò/Ốc, Phiếu chế tác 3D (3D Inspector + BOM Checklist), và chỉnh sửa nội dung LandingPage. | `fe-lead`, `fe-developer` | P1 |
| **EPIC-06** | **End-to-End Quality Assurance, Convention Audit & Zero-Duplication Gate** | Kiểm toán kiến trúc, kiểm tra `REGISTRY.md` chống lặp UI, kiểm thử bảo mật RBAC và chạy 100% Test Cases (Unit, API Integration, E2E Gherkin). | `qa-lead`, `qa-engineer` | P0 (Release Gate) |

---

## 2. Danh Sách User Stories & Tiêu Chí Chấp Nhận (User Stories Summary)

### US-01 (LandingPage): Trải nghiệm câu chuyện tái chế lưới đánh cá & tác động môi trường
- **Vai trò:** Khách vãng lai (`Guest`) muốn tìm hiểu nguồn gốc sản phẩm bền vững trước khi mua.
- **Mục tiêu:** Xem được số kg lưới ma đã thu hồi, quy trình 4 bước tái chế, bộ sưu tập sản phẩm và truy cập nhanh vào 3D Customizer Studio.
- **Acceptance Criteria:**
  - Tải dữ liệu động từ `GET /api/content/landing` và `GET /api/products?isCustomizable=true`.
  - Đạt chuẩn Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`), chỉ có duy nhất 1 thẻ `<h1>`, LCP < 2.5s.

### US-02 (Store Catalog & 3D Product Preview): Tìm kiếm, lọc sản phẩm & xoay xem trước 3D 360°
- **Vai trò:** Khách mua sắm (`Guest` / `Customer`) tìm mua giỏ lưới, túi xách, ví, áo quần tái chế, vòng tay hoặc phụ kiện biển.
- **Mục tiêu:** Lọc nhanh theo danh mục/giá/khả năng Custom 3D và xoay xem mô hình 3D 360 độ ngay tại trang chi tiết sản phẩm.
- **Acceptance Criteria:**
  - Bộ lọc đồng bộ với URL Search Params (`category`, `isCustomizable`, `search`, `minPrice`, `maxPrice`, `sort`).
  - Trang `/product/[slug]` hiển thị chỉ số môi trường (`netWeightGrams`, vùng biển thu gom), chuyển đổi mượt giữa Gallery ảnh và `ThreeCanvasViewer` (chế độ `preview`), có nút CTA dẫn sang `/customizer?product=[slug]`.

### US-03 (3D Customizer Studio): Gắn vỏ sò, ốc, charm tự do lên bề mặt 3D & bóc tách giá BOM tức thời
- **Vai trò:** Khách hàng yêu thích cá nhân hóa muốn tự thiết kế sản phẩm độc bản.
- **Mục tiêu:** Đổi màu lưới gốc, click trực tiếp lên bề mặt 3D của túi/giỏ/ví/áo/vòng tay để đính vỏ sò, ốc, charm bám sát độ cong bề mặt và biết ngay tổng giá tiền.
- **Acceptance Criteria:**
  - Click lên mesh sản phẩm thực hiện Raycasting lấy `position: [x, y, z]` và `normal: [nx, ny, nz]`, định hướng phụ kiện vuông góc với pháp tuyến bề mặt (`BR-03`).
  - Cho phép chọn lại phụ kiện đã gắn để xoay (`0° - 360°`), thu phóng (`0.4 - 2.5`), đổi màu, nhân bản hoặc xóa; chặn gắn quá 50 phụ kiện (`BR-02`).
  - Hiển thị bảng giá BOM thời gian thực (`basePrice + craftFee + sum(materials)`) và lưu thiết kế qua `POST /api/custom-designs` (`BR-01`).

### US-04 (Cart, VietQR Checkout & Order Lookup): Đặt hàng hỗn hợp & theo dõi tiến độ chế tác 6 bước
- **Vai trò:** Khách mua hàng (`Guest` hoặc `Customer`).
- **Mục tiêu:** Thanh toán giỏ hàng chứa cả hàng mua sẵn và hàng Custom 3D bằng COD hoặc VietQR, sau đó tra cứu tiến độ xưởng đan thủ công.
- **Acceptance Criteria:**
  - Giỏ hàng hiển thị rõ cấu hình Custom (màu sắc, danh sách vỏ sò/ốc đính kèm, đơn giá BOM).
  - Tạo đơn qua `POST /api/orders` sinh mã `DTU-YYYYMMDD-XXXX`; nếu chọn `vietqr` thì hiển thị mã QR chuyển khoản kèm nội dung thanh toán đúng mã đơn (`BR-10`).
  - Tra cứu đơn tại `/orders` bằng mã đơn + SĐT; cho phép hủy đơn khi ở trạng thái `pending` hoặc `confirmed` (`BR-05`).

### US-05 (CMS & 3D Crafting Inspector): Quản trị kho BOM, sản phẩm & gia công theo mô hình 3D của khách
- **Vai trò:** Thợ thủ công (`staff`) và Quản trị viên (`admin`).
- **Mục tiêu:** Xem chính xác vị trí từng con ốc/vỏ sò khách đã gắn trên mô hình 3D để đan/khâu thủ công không sai lệch, đồng thời quản lý tồn kho phôi và nguyên liệu lẻ.
- **Acceptance Criteria:**
  - Trang chi tiết đơn hàng trong `/admin/orders` tích hợp `ThreeCanvasViewer` (chế độ `inspector`) tái dựng 100% thiết kế từ `customDesignSnapshot` (`BR-07`) kèm bảng kiểm đếm nguyên liệu (`bomSummary`).
  - Quản lý CRUD `Product`, `CustomMaterial` (cấu hình được cả `meshPreset` lẫn `glbUrl` theo `BR-09`), và cập nhật nội dung LandingPage (`CMS-04`).

---

## 3. Bóc Tách Công Việc Chi Tiết Theo Từng Phòng Ban (Department Task Breakdown)

### 3.1. Phòng UI/UX Designer (`designer-lead`, `designer-ui`)
**Đầu ra bắt buộc:** Lưu tài liệu đặc tả tại `/Users/nguynbao/workspace/DTU-Startup/docs/design/design-spec-upcycled-3d.md`.

| Mã Task | Phụ trách | Nội dung công việc chi tiết | Tiêu chuẩn đầu ra (Deliverables) |
| :--- | :---: | :--- | :--- |
| `DES-01` | `designer-lead` | **Phân tích Layout tổng thể & Cấu trúc SEO Semantic HTML** cho 3 phân hệ (`LandingPage`, `Store`, `CMS`). | Sơ đồ App Shell (Public Shell vs Studio Fullscreen Shell vs Admin Sidebar Shell), cấu trúc Heading `H1 -> H3`, Metadata & JSON-LD Product Schema. |
| `DES-02` | `designer-lead` | **Quy hoạch Hệ thống Shared Components chống trùng lặp UI** giữa 3 phân hệ Web. | Đặc tả danh sách Shared Components bắt buộc dùng chung:<br>1. `ThreeCanvasViewer` (dùng chung cho Product 3D Preview, 3D Customizer Studio, CMS 3D Order Inspector).<br>2. `BomPriceBreakdownCard` (dùng chung ở 3D Studio, Cart Drawer/Page, Checkout, CMS Order Detail).<br>3. `EcoImpactBadge` (dùng chung ở Landing Counter, Product Card, Product Detail, CMS Dashboard).<br>4. `OrderStatusStepper` (dùng chung ở Order Lookup của khách & Order Detail trong CMS).<br>5. `StatusBadge`, `PriceTag`, `DataTable`, `ModalConfirm`, `EmptyState`, `FilterToolbar`. |
| `DES-03` | `designer-ui` | **Thiết kế Bảng màu, Typography & Aesthetic Direction** theo chủ đề *Ocean Upcycled Craft* (Xanh đại dương sâu `#0F766E`, Cát vỏ sò `#F5F5F0`, San hô điểm nhấn `#D97706`, Đá biển `#0F172A`). | Bảng Design Tokens (Colors, Typography, Spacing, Shadows, Border Radius) tương thích TailwindCSS. |
| `DES-04` | `designer-ui` | **Thiết kế chi tiết từng màn hình & Trạng thái UI/UX (Loading, Empty, Error, WebGL Context Lost)** cùng bảng Props TypeScript cho FE. | Đặc tả chi tiết màn hình `/`, `/shop`, `/product/[slug]`, `/customizer`, `/cart`, `/checkout`, `/orders`, và `/admin/*`. |

---

### 3.2. Phòng Dev Backend (`be-architect`, `be-developer`)
**Đầu ra bắt buộc:** Mã nguồn hoàn chỉnh trong `/Users/nguynbao/workspace/DTU-Startup/backend/` và tài liệu API/Architecture.

| Mã Task | Phụ trách | Nội dung công việc chi tiết | Quy tắc nghiệp vụ & Kỹ thuật áp dụng |
| :--- | :---: | :--- | :--- |
| `BE-01` | `be-architect` | **Thiết kế cấu trúc thư mục `backend/` & 6 Mongoose Schemas + Indexes**: `User`, `Product`, `CustomMaterial`, `CustomDesign`, `Order`, `LandingContent`. | Đảm bảo khai báo đầy đủ các trường trong SRS Mục 4, đánh Index cho `slug`, `category + isActive + isCustomizable`, `materialType + isActive`, `orderCode`, `status + createdAt`. Hỗ trợ kép `meshPreset` và `glbUrl` (`BR-09`). |
| `BE-02` | `be-architect` | **Thiết kế Security, Auth & Validation Middlewares**: Helmet, CORS, Rate Limiting, Mongo Sanitize, JWT Auth (`verifyToken`, `optionalAuth`), RBAC (`requireRole('staff', 'admin')`), Centralized Error Handler. | Phản hồi JSON đồng nhất `{ success, message, data, meta }`; bảo vệ nghiêm ngặt các route `/api/admin/*`. |
| `BE-03` | `be-developer` | **Xây dựng Pricing & CustomDesign Service (`POST /api/custom-designs`, `GET /api/custom-designs/:id`)**. | Tính lại `estimatedPrice = basePrice + craftFee + sum(materials.unitPrice)` hoàn toàn từ DB (`BR-01`). Validate số lượng `placements <= 50` (`BR-02`), `scale` trong `[0.4, 2.5]`, vector pháp tuyến `normal` hợp lệ (`BR-03`). |
| `BE-04` | `be-developer` | **Xây dựng Order Service, Atomic Dual-Inventory Deduction & State Machine (`POST /api/orders`, `GET /api/orders/lookup/:orderCode`, `PATCH /api/orders/:id/status`)**. | 1. Kiểm tra và trừ tồn kho đồng thời cả `Product.stock` lẫn từng `CustomMaterial.stockQuantity` nhân với số lượng đặt (`BR-04`).<br>2. Nhúng bất biến `customDesignSnapshot` và `bomSummary` vào `Order.items` (`BR-07`).<br>3. Thực thi State Machine: chặn hủy đơn khi đã ở `in_crafting`, `quality_check`, `shipping`, `delivered` (`BR-05`); hoàn kho tự động khi hủy đơn từ `pending`/`confirmed` (`BR-06`).<br>4. Sinh mã đơn `DTU-YYYYMMDD-XXXX` và thông tin thanh toán VietQR (`BR-10`). |
| `BE-05` | `be-developer` | **Xây dựng API Catalog, Materials, Landing Content & Admin Dashboard**: `GET/POST/PUT/DELETE /api/products`, `/api/materials`, `GET/PUT /api/content/landing`, `GET /api/admin/dashboard`. | Hỗ trợ đầy đủ query params lọc sản phẩm (`category`, `isCustomizable`, `search`, `minPrice`, `maxPrice`, `sort`); thống kê doanh thu, đơn đang chế tác, cảnh báo nguyên liệu sắp hết kho (`stockQuantity <= 10`) và tổng khối lượng lưới tái chế (`BR-08`). |
| `BE-06` | `be-developer` | **Xây dựng Database Seeder (`backend/src/seeds/seed.js`)**. | Tạo sẵn tài khoản Admin/Staff/Customer mẫu, nội dung LandingPage chuẩn câu chuyện tái chế lưới đánh cá, tối thiểu 8 sản phẩm gốc thuộc đủ 6 danh mục và 12+ nguyên liệu Vỏ sò, Ốc xoắn, Sao biển, Ngọc trai, Charm biển, Dây lưới. |

---

### 3.3. Phòng Dev Frontend (`fe-lead`, `fe-developer`)
**Đầu ra bắt buộc:** Mã nguồn trong `/Users/nguynbao/workspace/DTU-Startup/frontend/` và sổ đăng ký `/Users/nguynbao/workspace/DTU-Startup/frontend/src/components/REGISTRY.md`.

| Mã Task | Phụ trách | Nội dung công việc chi tiết | Quy tắc chống trùng lặp & Kỹ thuật áp dụng |
| :--- | :---: | :--- | :--- |
| `FE-01` | `fe-lead` | **Kiểm tra & Thiết lập Kiến trúc `frontend/`, API Client, Cart/Customizer Store & `REGISTRY.md`**. | Kiểm tra `frontend/src/components/REGISTRY.md` trước khi viết code. Khởi tạo danh mục Shared Components (`ui/`, `shared/`, `three/`) và đăng ký đầy đủ vào `REGISTRY.md`. |
| `FE-02` | `fe-lead` | **Xây dựng Shared 3D Customizer Engine (`ThreeCanvasViewer` + Procedural/GLB Meshes + Free-form Surface Raycasting)**. | 1. Hỗ trợ 3 chế độ truyền qua prop `mode`: `'preview'` (trang Product Detail), `'studio'` (trang `/customizer`), `'inspector'` (trang CMS Order Detail).<br>2. Hỗ trợ kép: nếu có `glbUrl` thì tải GLTF/GLB, nếu không thì dựng Procedural 3D Mesh chân thực cho giỏ, túi, ví, áo, vòng tay và các phụ kiện vỏ sò, ốc, sao biển, ngọc trai (`BR-09`).<br>3. Khi click lên bề mặt phôi 3D ở chế độ `'studio'`, dùng Raycaster lấy `point` và `face.normal`, dùng `Quaternion.setFromUnitVectors` để hướng phụ kiện bám sát mặt cong của sản phẩm (`BR-03`). |
| `FE-03` | `fe-developer` | **Xây dựng bộ Shared Components dùng chung cho cả 3 Web (`Landing`, `Store`, `CMS`)**. | Code các component dùng chung đã đăng ký trong `REGISTRY.md`: `BomPriceBreakdownCard`, `EcoImpactBadge`, `OrderStatusStepper`, `ProductCard`, `FilterToolbar`, `StatusBadge`, `ModalConfirm`. |
| `FE-04` | `fe-developer` | **Ghép trang & Tích hợp API cho Phân hệ 1 (LandingPage `/`) & Phân hệ 2 (Store `/shop`, `/product/[slug]`, `/customizer`, `/cart`, `/checkout`, `/orders`)**. | Kết nối API thật từ Backend; đảm bảo luồng chọn sản phẩm -> `/customizer` -> gắn vỏ sò/ốc Free-form -> lưu `CustomDesign` -> thêm vào Giỏ hàng -> Checkout VietQR/COD -> Tra cứu đơn hàng. |
| `FE-05` | `fe-developer` | **Ghép trang & Tích hợp API cho Phân hệ 3 (Web CMS `/admin`)**. | Xây dựng giao diện quản trị gồm Dashboard, Quản lý Sản phẩm gốc, Quản lý Kho Nguyên liệu Vỏ sò/Ốc, Quản lý Đơn hàng & **Phiếu Chế tác 3D (mở `ThreeCanvasViewer` mode `'inspector'` + BOM Checklist)**, Quản lý Nội dung LandingPage. |

---

### 3.4. Phòng Tester / QA (`qa-lead`, `qa-engineer`)
**Đầu ra bắt buộc:** Bộ test tự động và Báo cáo Nghiệm thu tại `/Users/nguynbao/workspace/DTU-Startup/docs/qa/qa-acceptance-report.md`.
