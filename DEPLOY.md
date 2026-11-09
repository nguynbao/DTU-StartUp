# 🚀 Hướng Dẫn Triển Khai (Deployment Guide) — Render & Vercel

Tài liệu này hướng dẫn chi tiết từng bước để triển khai hệ sinh thái **DTU Upcycled Fishing Net & 3D Ocean Craft** lên môi trường Production:
1. **Backend API Server (`backend/`)** ➔ Triển khai trên **Render**
2. **Web Store & 3D Customizer Studio (`frontend/`)** ➔ Triển khai trên **Vercel**
3. **Web CMS & Xưởng Chế Tác 3D (`web-cms/`)** ➔ Triển khai trên **Vercel**

---

## 1. Triển khai Backend API lên Render (`backend/`)

Dự án đã tích hợp sẵn file IaC [`render.yaml`](./render.yaml) ở thư mục gốc. Bạn có thể chọn **1 trong 2 cách** dưới đây:

### Cách A: Tự động qua Render Blueprint (`render.yaml`) — Khuyên dùng
1. Đẩy toàn bộ source code lên GitHub / GitLab.
2. Đăng nhập [Render Dashboard](https://dashboard.render.com/) ➔ Chọn **New +** ➔ **Blueprint**.
3. Kết nối tới repository GitHub của dự án. Render sẽ tự động nhận diện file `render.yaml` và cấu hình dịch vụ `dtu-startup-backend-api`.
4. Điền các biến môi trường bảo mật (`sync: false`):
   - `MONGODB_URI`: Chuỗi kết nối MongoDB Atlas của bạn (ví dụ: `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/dtu_upcycled_3d?retryWrites=true&w=majority`).
   - `AWS_ACCESS_KEY_ID`: Access Key của AWS S3.
   - `AWS_SECRET_ACCESS_KEY`: Secret Key của AWS S3.
   - `BACKEND_PUBLIC_URL`: URL dịch vụ Render của bạn (ví dụ: `https://dtu-startup-backend-api.onrender.com`).
   - `CORS_ORIGIN`: Danh sách domain Vercel của Web Store và Web CMS cách nhau bằng dấu phẩy (mặc định Backend đã tự động hỗ trợ mọi domain `*.vercel.app` và `*.onrender.com`).
5. Nhấn **Apply** để Render tự động cài đặt, khởi chạy và kiểm tra health check tại `/api/health`.

### Cách B: Tạo Web Service thủ công trên Render
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

---

## 2. Triển khai Web Store & 3D Studio lên Vercel (`frontend/`)

Dự án đã cấu hình sẵn [`frontend/vercel.json`](./frontend/vercel.json).

1. Đăng nhập [Vercel Dashboard](https://vercel.com/dashboard) ➔ **Add New...** ➔ **Project**.
2. Import repository GitHub của dự án.
3. Tại mục **Configure Project**:
   - **Project Name**: `dtu-ocean-store` (hoặc tên tùy chọn)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Nhấn **Edit** và chọn **`frontend`**
4. Tại mục **Environment Variables**, thêm các biến sau:
   ```env
   NEXT_PUBLIC_API_URL=https://<ten-service-backend-cua-ban>.onrender.com/api
   NEXT_PUBLIC_STORE_URL=https://<ten-store-cua-ban>.vercel.app
   NEXT_PUBLIC_CMS_URL=https://<ten-cms-cua-ban>.vercel.app
   NEXT_PUBLIC_S3_BASE_URL=https://dtu-img-db-868017909899-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com
   ```
5. Nhấn **Deploy**.

---

## 3. Triển khai Web CMS & Xưởng 3D lên Vercel (`web-cms/`)

Dự án đã cấu hình sẵn [`web-cms/vercel.json`](./web-cms/vercel.json) và hỗ trợ theo dõi symlinks dùng chung từ `frontend/`.

1. Trên [Vercel Dashboard](https://vercel.com/dashboard) ➔ **Add New...** ➔ **Project**.
2. Import cùng repository GitHub của dự án.
3. Tại mục **Configure Project**:
   - **Project Name**: `dtu-ocean-cms`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Nhấn **Edit** và chọn **`web-cms`**
4. Tại mục **Environment Variables**, thêm các biến sau:
   ```env
   NEXT_PUBLIC_API_URL=https://<ten-service-backend-cua-ban>.onrender.com/api
   NEXT_PUBLIC_STORE_URL=https://<ten-store-cua-ban>.vercel.app
   NEXT_PUBLIC_CMS_URL=https://<ten-cms-cua-ban>.vercel.app
   NEXT_PUBLIC_S3_BASE_URL=https://dtu-img-db-868017909899-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com
   ```
5. Nhấn **Deploy**.

---

## 4. Kiểm tra sau khi Deploy (Post-Deployment Checklist)

- **Kiểm tra Health Check Backend**: Truy cập `https://<backend>.onrender.com/api/health` ➔ trả về `{ "success": true, "data": { "status": "ok" } }`.
- **Kiểm tra trạng thái AWS S3**: Truy cập `https://<backend>.onrender.com/api/media/status` ➔ trả về `"storageMode": "s3"` và `"bucket": "dtu-img-db-868017909899-ap-southeast-2-an"`.
- **Tài khoản đăng nhập mặc định trên Web CMS & Web Store**:
  - **Admin**: `admin@dtu-upcycled.vn` / `Password123!`
  - **Artisan/Staff**: `artisan@dtu-upcycled.vn` / `Password123!`
  - **Customer**: `customer@dtu-upcycled.vn` / `Password123!`
