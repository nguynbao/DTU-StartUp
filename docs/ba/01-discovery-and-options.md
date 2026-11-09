# Phân Tích Nghiệp Vụ & Đề Xuất Phương Án (Discovery & Options)
**Dự án:** Hệ sinh thái E-Commerce & 3D Customizer — Sản phẩm Tái chế Lưới đánh cá & Phụ kiện Biển  
**Người lập:** `ba-analyst` (Lead Business Analyst)  
**Trạng thái:** Pending User Clarification (Chặng 1)

---

## 1. Phân Rã Bài Toán & Phạm Vi 4 Phân Hệ (Requirement Deconstruction)

### 1.1. Mục tiêu kinh doanh (Business Goal)
Xây dựng nền tảng thương mại điện tử D2C kết hợp kể chuyện thương hiệu bền vững (Upcycled Fishing Nets & Ocean Accessories), lấy trải nghiệm **Cá nhân hóa sản phẩm trên không gian 3D (3D Product Customizer)** làm lợi thế cạnh tranh cốt lõi (Killer Feature), giúp khách hàng tự tay thiết kế vòng tay, gắn charm vỏ sò/ốc lên giỏ, túi xách, ví tiền, áo quần tái chế và xem trước trực quan 360 độ trước khi đặt làm thủ công.

### 1.2. Cấu trúc 4 Phân hệ (4 Core Workstreams)
| STT | Phân hệ | Mục tiêu & Chức năng chính | Đối tượng sử dụng |
| :-: | :--- | :--- | :--- |
| **1** | **Web LandingPage** | Trang giới thiệu thương hiệu, câu chuyện thu gom & tái chế lưới đánh cá, quy trình thủ công, số liệu tác động môi trường (Impact Counter: kg lưới thu gom, số sản phẩm tái sinh), CTA dẫn sang Store và 3D Studio. Chuẩn SEO & Core Web Vitals. | Khách truy cập (`Guest`) |
| **2** | **Web Store (E-Commerce & 3D Customizer)** | - Mua hàng có sẵn (Ready-to-wear): Giỏ, túi xách, ví tiền, quần áo tái chế, vòng tay, phụ kiện vỏ sò/ốc.<br>- **3D Customizer Studio**: Tự thiết kế vòng tay từ dây lưới + hạt vỏ sò/ốc; hoặc chọn sản phẩm gốc (túi, giỏ, ví, áo quần) để gắn charm/vỏ sò/ốc, xem mô hình 3D xoay 360 độ thời gian thực.<br>- Giỏ hàng (hỗ trợ cả hàng thường & hàng custom), Đặt hàng, Thanh toán, Theo dõi tiến độ chế tác. | `Guest`, `Customer` |
| **3** | **Web CMS (Admin & Artisan Portal)** | - Quản trị danh mục & Sản phẩm gốc (Base Products).<br>- Quản trị **Kho Nguyên liệu Custom (Materials/Charms/Shells)** & cấu hình **3D Asset** (file `.glb/.gltf`, vùng gắn kết/anchor points).<br>- Quản lý Đơn hàng & **Phiếu chế tác thủ công (Custom Production Ticket)** kèm ảnh chụp/cấu hình 3D của khách.<br>- Quản trị nội dung bài viết câu chuyện tái chế (Blog/Landing CMS) & Thống kê doanh thu. | `Admin`, `Staff / Artisan` (Thợ thủ công) |
| **4** | **Server (Backend API)** | Hệ thống RESTful API (NodeJS + Express + MongoDB/Mongoose): Xác thực & Phân quyền (RBAC), Quản lý Catalog, Engine tính giá & kiểm tra tồn kho nguyên liệu (BOM Inventory), Lưu trữ cấu hình 3D JSON (`CustomDesign`), Xử lý đơn hàng (ACID Transaction), Upload 3D/Media. | Toàn bộ 3 Web Apps |

---

## 2. Phân Tích Chuyên Sâu & Đề Xuất Phương Án (Strategic & Technical Options)

### 🔹 Vấn đề 1: Kiến trúc triển khai 3 Web Apps (`LandingPage` + `Store` + `CMS`) trên `frontend/`
- **Phương án 1A — Unified Next.js App với Route Groups tách biệt (Khuyên dùng):**
  - Chung 1 codebase `frontend/` sử dụng Next.js App Router chia thành 3 phân khu độc lập:
    - `(landing)/`: Trang chủ câu chuyện thương hiệu, `/about`, `/impact`, `/story` (SSR/SSG tối ưu SEO tuyệt đối).
    - `(store)/`: `/shop`, `/product/[slug]`, `/customizer`, `/cart`, `/checkout`, `/orders` (Cửa hàng & 3D Studio).
    - `(cms)/`: `/admin/*` (Dashboard quản trị, kho nguyên liệu, đơn hàng, quản lý asset 3D — bảo vệ bằng Middleware RBAC).
  - *Ưu điểm:* Tái sử dụng 100% Shared UI Components (`frontend/src/components/`), chia sẻ chung bộ 3D Canvas Viewer giữa Store và CMS, chỉ cần chạy 1 server FE duy nhất.
- **Phương án 1B — 3 Ứng dụng Frontend tách rời hoàn toàn (`frontend/landing`, `frontend/store`, `frontend/cms`):**
  - *Ưu điểm:* Tách biệt hoàn toàn lúc deploy.
  - *Nhược điểm:* Tốn gấp 3 lần công sức cấu hình và dễ phát sinh code UI trùng lặp giữa các repo.

---

### 🔹 Vấn đề 2: Cơ chế 3D Customizer & Gắn Phụ Kiện (Killer Feature)
- **Phương án 2A — 3D Slot / Anchor-Point System (Gắn theo các điểm định sẵn trên mô hình 3D):**
  - Sử dụng **Three.js / React Three Fiber (`@react-three/fiber` + `@react-three/drei`)**.
  - **Với Vòng tay (Bracelet Builder):** Mô hình dây vòng tay có $N$ vị trí hạt/slot (VD: 8–12 slots xung quanh vòng cổ tay). Khách chọn màu dây lưới tái chế và click chọn từng loại vỏ sò/ốc/charm để lấp vào từng vị trí.
  - **Với Túi lưới, Giỏ, Ví, Áo quần:** Mỗi mô hình 3D gốc có các **Điểm gắn (Anchor Slots / Zones)** hợp lý (Quai túi, Nắp ví, Trung tâm giỏ, Ngực áo/Túi áo). Khách chọn vị trí Slot -> chọn loại vỏ sò/ốc/charm -> Charm 3D tự động khớp chính xác (snap) vào bề mặt mô hình.
- **Phương án 2B — Free-form 3D Raycasting (Kéo thả tự do lên mọi điểm trên bề mặt 3D):**
  - Khách click/kéo charm trượt tự do trên toàn bộ lưới tam giác (mesh surface) của túi/áo.
- **Phương án 2C — Hybrid (Kết hợp Slot cho Vòng tay/Quai túi + Di chuyển tự do trong vùng cho phép trên Thân túi/Áo quần — Khuyên dùng):**
  - Vừa đảm bảo vòng tay đều đẹp chuẩn xác, vừa cho phép khách tự do sáng tạo bố cục vỏ sò/ốc trên bề mặt túi, giỏ, ví, áo quần và xoay 3D 360 độ mượt mà.

---

### 🔹 Vấn đề 3: Nguồn Mô hình 3D (3D Assets `.glb`/`.gltf`) cho Dự án
- **Phương án 3A — Dựng sẵn bộ 3D Procedural Meshes bằng Three.js + Hỗ trợ Upload `.glb/.gltf` từ CMS (Khuyên dùng):**
  - Đội ngũ FE dựng sẵn bộ mô hình 3D tương tác trực quan cho toàn bộ sản phẩm chủ lực (Vòng tay lưới, Túi lưới, Giỏ đựng đồ, Ví, Áo, và các mẫu Vỏ sò, Ốc biển, Charm ngôi sao biển/ngọc trai) để hệ thống **chạy và xoay 3D thực tế ngay lập tức 100%**.
  - Đồng thời trên **Web CMS**, Admin có thể upload file `.glb/.gltf` thực tế để thay thế hoặc thêm mẫu mới bất cứ lúc nào.
- **Phương án 3B — Chỉ dùng file `.glb` do User tự tải lên.**

---

### 🔹 Vấn đề 4: Công thức Tính Giá & Quản lý Tồn kho Nguyên liệu lẻ (BOM Inventory)
- **Phương án 4A — Tính giá cộng dồn theo linh kiện (Component-based Dynamic Pricing) & Trừ kho kép (Khuyên dùng):**
  - $$\text{Giá Sản Phẩm Custom} = \text{Giá Phôi Gốc (Base Price)} + \sum (\text{Giá từng Vỏ sò / Ốc / Charm} \times \text{Số lượng}) + \text{Phí gia công}$$
  - Giá cập nhật thời gian thực ngay khi khách gắn/tháo từng vỏ sò trên màn hình 3D.
  - Khi đặt hàng, hệ thống kiểm tra và trừ tồn kho của cả **Phôi gốc** lẫn **từng loại Vỏ sò/Ốc/Charm** trong MongoDB Transaction.
- **Phương án 4B — Tính giá trọn gói theo Gói (Tier/Package Pricing), không quản lý tồn kho lẻ từng vỏ sò/ốc.**

---

### 🔹 Vấn đề 5: Quy trình Đặt hàng, Thanh toán & Chính sách Hàng Custom
- **Phương án 5A — Hỗ trợ COD + Chuyển khoản VietQR, tách rõ luồng trạng thái chế tác (`Pending` -> `Confirmed` -> `In Crafting` -> `Quality Check` -> `Shipping` -> `Delivered`):**
  - Đơn hàng Custom chỉ được Hủy/Sửa thiết kế khi ở trạng thái `Pending` (trước khi thợ thủ công chuyển sang `In Crafting`).
- **Phương án 5B — Yêu cầu đặt cọc/thanh toán trước qua VietQR đối với riêng các đơn hàng có sản phẩm Custom.**
