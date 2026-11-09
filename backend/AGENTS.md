# Quy Chuẩn Phòng Dev Backend (`backend/` — NodeJS + Express + MongoDB/Mongoose)

## 1. Nguyên tắc Kiến trúc & Chống Hardcode (`Zero-Hardcoding Governance`)
1. **Cấm Hardcode Key, Secret, Port, URL, Thông tin Ngân hàng**:
   - Toàn bộ cấu hình (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS`, `VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME`, `SEED_DEFAULT_PASSWORD`) phải đặt trong `backend/.env` và chỉ được đọc qua `backend/src/config/env.js`.
2. **Cấm Hardcode Text Thông báo (Hỗ trợ Đa ngôn ngữ `vi` / `en`)**:
   - Toàn bộ chuỗi thông báo phản hồi / lỗi API phải được quản lý tập trung tại `backend/src/i18n/messages.js` hỗ trợ cả Tiếng Việt (`vi`) và Tiếng Anh (`en`).
3. **Cấm Hardcode Hình ảnh & Bảng màu trong Code / Seeder**:
   - Toàn bộ đường dẫn ảnh sản phẩm, nguyên liệu, QR template phải quản lý tại `backend/src/config/assets.js`.
   - Toàn bộ mã màu chuẩn của sản phẩm và nguyên liệu phải quản lý tại `backend/src/config/theme.js`.
4. **Tuân thủ cấu trúc phân lớp (`backend/src/`)**:
   - `routes/` -> `middlewares/` -> `controllers/` -> `services/` -> `models/`.
   - Không đặt logic nghiệp vụ hoặc truy vấn Mongoose phức tạp trực tiếp trong `controllers/` hay `routes/`.
