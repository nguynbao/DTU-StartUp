# Hệ Sinh Thái Thương Mại Điện Tử & 3D Customizer — Sản Phẩm Tái Chế Lưới Đánh Cá & Phụ Kiện Biển — Software Requirements Specification (SRS)
- **Phiên bản:** 1.0 (Official Release)
- **Người lập:** `ba-analyst` (Lead Business Analyst)
- **Trạng thái:** Approved (Đã được Product Owner phê duyệt)
- **Tech Stack mục tiêu:**
  - **Frontend (`frontend/`):** Next.js (App Router, React, TypeScript/JavaScript, TailwindCSS, Three.js / `@react-three/fiber` / `@react-three/drei`)
  - **Backend (`backend/`):** Node.js + Express + MongoDB (Mongoose ODM)

---

## 1. Mục tiêu & Phạm vi (Objectives & Scope)

### 1.1. Mục tiêu kinh doanh (Business Objectives)
- Xây dựng thương hiệu thời trang & phụ kiện bền vững từ **lưới đánh cá tái chế (Upcycled Fishing Nets)** và **phụ kiện biển (vỏ sò, ốc, charm)**.
- Cung cấp trải nghiệm mua sắm kép:
  1. **Mua sẵn (Ready-to-Wear):** Giỏ đựng đồ, túi xách lưới, ví tiền, áo quần tái chế, vòng tay, phụ kiện vỏ sò/ốc.
  2. **Cá nhân hóa 3D tự do (Free-form 3D Customizer — Killer Feature):** Khách hàng tự thiết kế vòng tay hoặc gắn vỏ sò, ốc, charm lên bất kỳ vị trí nào trên bề mặt 3D của túi xách, giỏ, ví, áo quần, vòng tay thông qua cơ chế **3D Raycasting**, xoay 360 độ xem trước, tính giá tức thời theo linh kiện và đặt xưởng chế tác thủ công.
- Cung cấp hệ thống **CMS Quản trị toàn diện** cho Admin & Thợ thủ công (Artisan) để quản lý sản phẩm gốc, kho nguyên liệu lẻ (BOM), xem lại mô hình 3D của từng đơn hàng để gia công chính xác, và cập nhật nội dung câu chuyện tái chế trên LandingPage.

### 1.2. Trong phạm vi (In-Scope)
1. **Phân hệ 1 — Web LandingPage (`/`)**:
   - Hero Banner kể chuyện tái chế lưới đánh cá đại dương + nút CTA dẫn tới Store & 3D Studio.
   - Bộ đếm tác động môi trường (Environmental Impact Counter: Số kg lưới đánh cá thu hồi, Số sinh vật biển được bảo vệ, Số sản phẩm tái sinh, Số nghệ nhân địa phương).
   - Quy trình 4 bước tái chế (Thu gom lưới ma -> Làm sạch & Xử lý sợi -> Đan thủ công -> Cá nhân hóa 3D cùng Vỏ sò/Ốc).
   - Danh mục sản phẩm nổi bật & Khu vực giới thiệu tính năng **3D Customizer Studio**.
   - Câu chuyện nghệ nhân / Bài viết bền vững & Footer chuẩn SEO.
2. **Phân hệ 2 — Web Store (`/shop`, `/product/[slug]`, `/customizer`, `/cart`, `/checkout`, `/orders`)**:
   - Danh sách sản phẩm (`/shop`): Tìm kiếm, lọc theo danh mục (`basket` - Giỏ đựng đồ, `bag` - Túi xách, `wallet` - Ví tiền, `apparel` - Áo quần tái chế, `bracelet` - Vòng tay, `accessory` - Vỏ sò/Ốc), lọc theo khoảng giá, lọc sản phẩm hỗ trợ Custom 3D, sắp xếp.
   - Chi tiết sản phẩm (`/product/[slug]`): Xem ảnh + **3D Preview xoay 360°**, thông số tác động môi trường (`netWeightGrams`, vùng biển thu gom), chọn màu sắc/kích cỡ, thêm vào giỏ hoặc nhấn **"Tự Custom 3D ngay"** (chuyển sang `/customizer?product=[slug]`).
   - **Phòng 3D Customizer Studio (`/customizer`)**:
     - Chọn phôi sản phẩm gốc (Vòng tay, Túi xách lưới, Giỏ đựng đồ, Ví tiền, Áo quần tái chế).
     - Đổi màu sắc chất liệu lưới/vải gốc (`baseColor`), màu dây đeo (`strapColor`).
     - Chọn nguyên liệu đính kèm từ Kho phụ kiện (Vỏ sò, Ốc xoắn, Sao biển, Ngọc trai, Charm biển, Hạt gỗ/đá).
     - **Free-form 3D Surface Placement (Raycasting):** Click/chạm trực tiếp lên bất kỳ vị trí nào trên bề mặt mô hình 3D để gắn phụ kiện; tự động lấy tọa độ điểm chạm `position: [x, y, z]` và vector pháp tuyến bề mặt `normal: [nx, ny, nz]` để phụ kiện nghiêng bám sát bề mặt cong của sản phẩm.
     - Chỉnh sửa phụ kiện đã gắn: Chọn lại phụ kiện trên 3D để di chuyển vị trí, xoay góc (`rotation`), phóng to/thu nhỏ (`scale`), đổi màu phụ kiện (`color`), nhân bản hoặc xóa.
     - Xem bảng bóc tách giá thời gian thực (Real-time BOM Price Breakdown: Giá phôi + từng phụ kiện + phí chế tác).
     - Lưu thiết kế 3D (`CustomDesign`) và thêm thẳng vào Giỏ hàng.
   - Giỏ hàng (`/cart`) & Thanh toán (`/checkout`): Hỗ trợ cùng lúc sản phẩm thường và sản phẩm Custom 3D; chọn phương thức thanh toán **COD** hoặc **Chuyển khoản VietQR** (hiển thị mã QR động & thông tin chuyển khoản).
   - Tra cứu & Theo dõi đơn hàng (`/orders` & `/orders/[orderCode]`): Xem trạng thái chế tác 6 bước và xem lại mô hình 3D đã đặt.
3. **Phân hệ 3 — Web CMS (`/admin`)**:
   - Dashboard tổng quan: Doanh thu, tổng số đơn hàng, số đơn Custom đang chế tác, cảnh báo nguyên liệu vỏ sò/ốc sắp hết kho, tổng khối lượng lưới tái chế.
   - Quản lý Sản phẩm gốc (`Products CRUD`): Thêm/sửa/xóa sản phẩm, cấu hình `model3D` (chọn `meshPreset` dựng sẵn hoặc nhập `glbUrl`), cấu hình giá, tồn kho, chỉ số môi trường.
   - Quản lý Kho Nguyên liệu Custom (`CustomMaterials CRUD`): Thêm/sửa/xóa các loại Vỏ sò, Ốc, Charm, Dây lưới, cập nhật đơn giá (`unitPrice`), tồn kho (`stockQuantity`), kiểu 3D (`meshPreset` / `glbUrl`).
   - Quản lý Đơn hàng & Phiếu Chế tác 3D (`Orders & Crafting Tickets`): Cập nhật trạng thái đơn hàng theo State Machine, mở **3D Inspector** để xoay xem chính xác vị trí các vỏ sò/ốc khách đã gắn trên mô hình 3D cùng bảng kê nguyên liệu (BOM Checklist) cho thợ thủ công.
   - Quản lý Nội dung LandingPage (`Landing Content CMS`): Chỉnh sửa số liệu Impact Counter, Banner, Câu chuyện tái chế.
4. **Phân hệ 4 — Server Backend (`backend/`)**:
   - Hệ thống RESTful API chuẩn kiến trúc phân tầng (`routes` -> `controllers` -> `services` -> `models` -> `middlewares`), dữ liệu khởi tạo mẫu (Database Seeder) đầy đủ cho toàn bộ sản phẩm, nguyên liệu vỏ sò/ốc và nội dung LandingPage.

---

## 2. Tác nhân & Ma trận Phân quyền (Actors & RBAC Matrix)

| Mã chức năng | Chức năng / Hành động | Guest (Khách vãng lai) | Customer (Khách đã đăng nhập) | Staff / Artisan (Thợ thủ công) | Admin (Quản trị viên) | Ghi chú điều kiện |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `AUTH-01` | Đăng ký, Đăng nhập, Xem thông tin cá nhân | ✅ | ✅ | ✅ | ✅ | JWT Bearer / Cookie |
| `LAND-01` | Xem LandingPage, Impact Counter, Câu chuyện tái chế | ✅ | ✅ | ✅ | ✅ | Public SSR/ISR |
| `SHOP-01` | Xem danh sách, lọc, tìm kiếm & xem chi tiết sản phẩm 3D | ✅ | ✅ | ✅ | ✅ | Chỉ hiển thị `isActive = true` |
| `CUST-01` | Sử dụng **3D Customizer Studio** (gắn vỏ sò/ốc Free-form, xoay 360°) | ✅ | ✅ | ✅ | ✅ | Guest có thể thiết kế & lưu thiết kế |
| `ORDER-01` | Thêm giỏ hàng, Đặt hàng (COD / VietQR), Tra cứu mã đơn | ✅ | ✅ | ✅ | ✅ | Cho phép Guest Checkout & Customer Checkout |
| `ORDER-02` | Hủy đơn hàng khi đang ở trạng thái `pending` | ✅ (qua mã đơn + SĐT) | ✅ | ✅ | ✅ | Không được hủy khi đã sang `in_crafting` |
| `CMS-01` | Xem Dashboard thống kê & Danh sách đơn hàng / Phiếu chế tác 3D | ❌ | ❌ | ✅ | ✅ | Yêu cầu role `staff` hoặc `admin` |
| `CMS-02` | Cập nhật trạng thái chế tác đơn hàng (`confirmed` -> `in_crafting` -> `quality_check` -> `shipping` -> `delivered`) | ❌ | ❌ | ✅ | ✅ | Tuân thủ State Machine (`BR-05`) |
| `CMS-03` | Thêm / Sửa / Xóa Sản phẩm gốc (`Product`) & Nguyên liệu (`CustomMaterial`) | ❌ | ❌ | ❌ (Chỉ xem & báo hết hàng) | ✅ | Quản lý giá, tồn kho, cấu hình 3D |
| `CMS-04` | Cập nhật nội dung LandingPage & Số liệu Tác động Môi trường | ❌ | ❌ | ❌ | ✅ | Hiển thị tức thời ngoài LandingPage |

---

## 3. Quy tắc Nghiệp vụ (Business Rules)

| Mã BR | Tên quy tắc | Mô tả chi tiết & Công thức định lượng |
| :--- | :--- | :--- |
| `BR-01` | **Công thức tính giá sản phẩm Custom (Dynamic BOM Pricing)** | $\text{UnitPrice}_{\text{custom}} = \text{Product.basePrice} + \text{Product.craftFee} + \sum_{i=1}^{k} \text{Material}_i.\text{unitPrice}$.<br>Mọi tính toán giá khi tạo `CustomDesign` và `Order` **bắt buộc được tính toán lại ở Backend** từ DB, tuyệt đối không tin tưởng giá gửi lên từ Client. |
| `BR-02` | **Giới hạn số lượng phụ kiện gắn trên 1 sản phẩm** | Mỗi bản thiết kế `CustomDesign` được gắn tối thiểu **0** và tối đa **50** phụ kiện (`placements.length <= 50`) để đảm bảo hiệu năng render 3D 60FPS và tính khả thi khi khâu thủ công. |
| `BR-03` | **Cơ chế bám dính bề mặt 3D (Free-form Raycasting Alignment)** | Khi khách click lên mô hình 3D gốc, hệ thống ghi nhận tọa độ điểm va chạm `position: [x, y, z]` trong không gian cục bộ (local space) của mô hình gốc và vector pháp tuyến `normal: [nx, ny, nz]` (độ dài chuẩn hóa $\approx 1$). Phụ kiện vỏ sò/ốc được đặt tại `position` và hướng trục Z/Y theo `normal`, sau đó áp dụng `rotation` (độ xoay quanh trục pháp tuyến, từ $0^\circ$ đến $360^\circ$) và `scale` (tỉ lệ thu phóng hợp lệ từ `0.4` đến `2.5`). |
| `BR-04` | **Kiểm tra & Trừ tồn kho kép (Atomic Dual-Inventory Deduction)** | Khi tạo đơn hàng (`POST /api/orders`):<br>1. Kiểm tra tồn kho của `Product` (`stock >= orderItem.quantity`).<br>2. Nếu `orderItem` có gắn `customDesign`, gom nhóm tất cả `materialId` trong `placements` nhân với `orderItem.quantity`. Kiểm tra từng `CustomMaterial` có `stockQuantity >= totalRequired` và `isActive === true`.<br>3. Nếu bất kỳ phôi hoặc vỏ sò/ốc nào không đủ tồn kho, từ chối toàn bộ đơn hàng (`400 Bad Request`) kèm tên nguyên liệu bị thiếu. |
| `BR-05` | **Quy tắc chuyển trạng thái đơn hàng & Chặn hủy khi đang chế tác** | Đơn hàng chỉ được chuyển trạng thái theo luồng hợp lệ: `pending` -> `confirmed` -> `in_crafting` -> `quality_check` -> `shipping` -> `delivered`.<br>Trạng thái `cancelled` chỉ được phép chuyển từ `pending` hoặc `confirmed`. Khi đơn hàng đã ở trạng thái `in_crafting`, `quality_check`, `shipping`, hoặc `delivered`, hệ thống **cấm hủy đơn** (trả lỗi `400`). |
| `BR-06` | **Hoàn trả tồn kho khi hủy đơn (Inventory Rollback on Cancel)** | Khi đơn hàng chuyển từ `pending` hoặc `confirmed` sang `cancelled`, hệ thống tự động cộng trả lại số lượng `Product.stock` và số lượng từng `CustomMaterial.stockQuantity` trong BOM của đơn hàng đó. |
| `BR-07` | **Bất biến hóa thiết kế trong Đơn hàng (Immutable Order Snapshot)** | Khi khách đặt hàng, toàn bộ cấu hình 3D (`baseColor`, `strapColor`, danh sách `placements` kèm tên, đơn giá và kiểu dáng 3D của từng vỏ sò/ốc tại thời điểm mua) phải được **nhúng trực tiếp (snapshot)** vào `Order.items` để dù sau này Admin có đổi giá hoặc xóa nguyên liệu thì phiếu chế tác của đơn hàng cũ vẫn hiển thị chính xác 100%. |
| `BR-08` | **Tự động cộng dồn Chỉ số Tác động Môi trường (Eco-Impact Aggregation)** | Mỗi sản phẩm có chỉ số `ecoImpact.netWeightGrams` (số gram lưới đánh cá tái chế). Khi đơn hàng được tạo/hoàn tất, hệ thống thống kê tổng lượng lưới đánh cá tái chế để hiển thị trên CMS và LandingPage. |
| `BR-09` | **Hỗ trợ Kép Mô hình 3D (Procedural Preset & External GLB)** | Mỗi `Product` và `CustomMaterial` đều có trường `model3D.meshPreset` VÀ trường `model3D.glbUrl` (tùy chọn). Nếu `glbUrl` có giá trị hợp lệ, trình render 3D ưu tiên tải file `.glb`; nếu để trống, trình render sử dụng mô hình 3D Procedural dựng sẵn tương ứng với `meshPreset`. |
| `BR-10` | **Mã đơn hàng & Thanh toán VietQR** | Mỗi đơn hàng sinh mã duy nhất định dạng `DTU-YYYYMMDD-XXXX`. Nếu khách chọn phương thức `vietqr`, hệ thống trả về thông tin chuyển khoản kèm nội dung thanh toán chính là mã đơn hàng `DTU-YYYYMMDD-XXXX`. |

---

## 4. Đặc tả Chức năng & Dữ liệu (Functional Requirements & Data Fields)

### FR-01: Hiển thị Web LandingPage & Câu chuyện Tái chế (`GET /api/content/landing`)
- **Mô tả:** Cung cấp toàn bộ dữ liệu động cho trang LandingPage (`/`) bao gồm Hero Story, Impact Counter, Quy trình 4 bước tái chế lưới đánh cá, Danh sách sản phẩm tiêu biểu, Bộ sưu tập phụ kiện vỏ sò/ốc, và Câu chuyện nghệ nhân.

### FR-02: Tra cứu, Lọc & Xem Sản phẩm gốc (`GET /api/products`, `GET /api/products/:slug`)
- **Bộ lọc hỗ trợ (Query Params):**
  - `category`: `'basket' | 'bag' | 'wallet' | 'apparel' | 'bracelet' | 'accessory'`
  - `isCustomizable`: `'true' | 'false'`
  - `search`: Từ khóa tìm theo tên hoặc mô tả
  - `minPrice`, `maxPrice`: Khoảng giá (VNĐ)
  - `sort`: `'newest' | 'price_asc' | 'price_desc' | 'popular'`

### FR-03: Danh sách Nguyên liệu Vỏ sò / Ốc / Charm cho 3D Studio (`GET /api/materials`)
- **Mô tả:** Lấy danh sách nguyên liệu đính kèm đang mở bán (`isActive = true`) phân loại theo nhóm: `shell` (Vỏ sò), `snail` (Ốc biển), `charm` (Charm biển), `bead` (Ngọc trai/hạt thủy tinh biển), `cord` (Dây lưới).

### FR-04: Phòng 3D Customizer Free-form & Lưu Bản Thiết Kế (`POST /api/custom-designs`, `GET /api/custom-designs/:id`)
- **Mô tả:** Khách hàng chọn phôi 3D, gắn/xóa/xoay/phóng to các vỏ sò, ốc, charm lên bề mặt 3D bằng Raycasting và lưu lại bản thiết kế.

### FR-05: Đặt hàng & Kiểm tra tồn kho BOM (`POST /api/orders`, `GET /api/orders/lookup/:orderCode`)
- **Mô tả:** Tạo đơn hàng mới từ giỏ hàng (gồm sản phẩm thường và/hoặc sản phẩm gắn kèm `customDesignId` hoặc cấu hình `customDesign` inline).

### FR-06: Quản trị CMS — Dashboard, Sản phẩm, Kho Nguyên liệu, Đơn hàng & Nội dung LandingPage
- `GET /api/admin/dashboard`
- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- `POST /api/materials`, `PUT /api/materials/:id`, `DELETE /api/materials/:id`
- `GET /api/orders`, `PATCH /api/orders/:id/status`, `PATCH /api/orders/:id/payment`
- `PUT /api/content/landing`

---

## 5. Tiêu chí Nghiệm thu (Acceptance Criteria — Chuẩn Gherkin)

### Kịch bản 1: Khách hàng tự Custom 3D Free-form (Túi lưới / Vòng tay / Áo quần) và Tính giá Thời gian thực (Happy Path)
- **Given:** Khách hàng đang ở trang **3D Customizer Studio** (`/customizer`) và chọn phôi `"Túi Xách Lưới Đại Dương"` có `basePrice = 320.000đ`, `craftFee = 30.000đ`.
- **When:** Khách đổi màu lưới sang `"#0F766E"`, gắn 3 `"Vỏ Sò Điệp Trắng"` (`15.000đ`/cái) và 1 `"Ốc Xoắn Hoàng Kim"` (`25.000đ`/cái) lên bề mặt 3D.
- **Then:** Mô hình 3D hiển thị đúng 4 phụ kiện bám sát bề mặt theo tọa độ `position` và `normal`, xoay 360 độ mượt mà; Tổng giá cập nhật thành `420.000đ`; Lưu thiết kế trả về `201 Created`.

### Kịch bản 2: Đặt hàng Custom thành công & Tự động trừ Tồn kho BOM (Happy Path)
- **Given:** Sản phẩm `"Giỏ Đựng Đồ Lưới Biển"` có `stock = 10`, Nguyên liệu `"Charm Sao Biển"` có `stockQuantity = 20`. Khách đặt `2` chiếc Giỏ Custom, mỗi chiếc gắn `3` Charm Sao Biển.
- **When:** Khách gửi `POST /api/orders`.
- **Then:** Trả về `201 Created` kèm mã đơn `DTU-YYYYMMDD-XXXX`; tồn kho Giỏ giảm còn `8`, tồn kho Charm Sao Biển giảm còn `14`; đơn hàng lưu đầy đủ `customDesignSnapshot` và `bomSummary`.

### Kịch bản 3: Đặt hàng thất bại do vượt quá Tồn kho Nguyên liệu lẻ (Edge / Negative Case)
- **Given:** Nguyên liệu `"Ốc Xoắn Quý Hiếm"` chỉ còn `stockQuantity = 2`, nhưng khách đặt bản thiết kế cần `4` con ốc này.
- **When:** Khách nhấn Đặt hàng (`POST /api/orders`).
- **Then:** Trả về `400 Bad Request` thông báo rõ nguyên liệu nào không đủ tồn kho; không trừ kho bất kỳ mặt hàng nào.

### Kịch bản 4: Quản lý Phiếu Chế tác 3D trên CMS & Quy tắc Chặn hủy đơn đang sản xuất (State Machine & Security)
- **Given:** Đơn hàng đang ở trạng thái `in_crafting`.
- **When:** Gọi API chuyển trạng thái sang `cancelled`.
- **Then:** Bị chặn với mã lỗi `400 Bad Request` theo `BR-05`.
