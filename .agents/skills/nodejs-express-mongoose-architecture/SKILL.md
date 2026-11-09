---
name: nodejs-express-mongoose-architecture
description: >-
  Enterprise Backend Architecture, Security, Zero-Hardcoding, and Performance
  Best Practices for NodeJS, Express, and MongoDB (Mongoose). Enforces strict
  separation of concerns, .env configuration management, i18n message catalogs,
  centralized asset registries, and security hardening.
---

# Kiến trúc Chuẩn Backend & Quy tắc Chống Hardcode: NodeJS + Express + MongoDB (Mongoose)

## 1. Cấu trúc Thư mục Chuẩn (`backend/`)

```text
backend/
├── .env                # Chứa toàn bộ Keys, Secrets, Ports, DB URI, CORS Origins, VietQR Config
├── src/
│   ├── config/
│   │   ├── env.js      # Đọc và validate toàn bộ biến môi trường từ .env
│   │   ├── db.js       # Kết nối MongoDB
│   │   ├── assets.js   # Quản lý tập trung toàn bộ URL hình ảnh, media, QR template
│   │   └── theme.js    # Bảng mã màu chuẩn của sản phẩm/nguyên liệu dùng cho Seeder/Validation
│   ├── i18n/
│   │   └── messages.js # Từ điển thông báo API đa ngôn ngữ (vi / en)
│   ├── models/         # Mongoose Schemas, Indexes
│   ├── services/       # Tầng chứa 100% Business Logic & Atomic Inventory
│   ├── controllers/    # Nhận HTTP request, gọi Service, trả HTTP response chuẩn hóa
│   ├── middlewares/    # Auth (JWT/RBAC), Error Handler, Rate Limiter, Sanitizer
│   ├── routes/         # Định nghĩa RESTful API endpoints
│   ├── seeds/          # Database Seeder (đọc ảnh từ config/assets.js, màu từ config/theme.js)
│   └── utils/          # AppError, asyncHandler, apiResponse
└── tests/              # Bộ kiểm thử tự động
```

---

## 2. QUY TẮC CẤM HARDCODE TRONG BACKEND (ZERO-HARDCODING RULES)

1. **Cấm Hardcode Key, Secret, Port, URL, Thông tin Ngân hàng (`env.js`)**:
   - Mọi khóa bí mật (`JWT_SECRET`), cổng (`PORT`), chuỗi kết nối (`MONGODB_URI`), danh sách `CORS_ORIGINS`, thông tin `VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME`, mật khẩu tài khoản seed (`SEED_DEFAULT_PASSWORD`) **BẮT BUỘC** phải khai báo trong `.env` và đọc qua `src/config/env.js`.
2. **Cấm Hardcode Text Thông báo Lỗi / Phản hồi (`i18n/messages.js`)**:
   - Hỗ trợ đa ngôn ngữ (`vi` / `en`) thông qua header `Accept-Language` hoặc query `?lang=vi|en`.
   - Các thông báo trả về từ Controller/Service nên tham chiếu qua bộ từ điển `src/i18n/messages.js`.
3. **Cấm Hardcode Link Hình ảnh & Mã màu Rải rác (`config/assets.js` & `config/theme.js`)**:
   - Toàn bộ URL hình ảnh sản phẩm, nguyên liệu, ảnh banner và mẫu VietQR phải được quản lý tập trung tại `src/config/assets.js`.
   - Toàn bộ mã màu mặc định của phôi sản phẩm và nguyên liệu phải được quản lý tại `src/config/theme.js`.

---

## 3. Tiêu chuẩn Bảo mật & Hiệu năng Mongoose
- Sử dụng `helmet()`, `cors()` đọc từ `env.CORS_ORIGINS`, `express-rate-limit`, `mongoSanitizeMiddleware` chống NoSQL Injection.
- Luôn tính toán lại giá BOM ở phía Server (`pricing.service.js`), kiểm tra và trừ tồn kho kép Atomic (`order.service.js`).
