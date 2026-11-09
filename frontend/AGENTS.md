# Quy Chuẩn Phòng Dev Frontend & Designer (`frontend/`, `web-landing/`, `web-cms/` — ReactJS & NextJS)

## 1. Quy tắc Bắt buộc trước khi viết bất kỳ dòng code UI nào
1. **KIỂM TRA KHO COMPONENT TRƯỚC KHI LÀM**:
   - Đọc `frontend/src/components/REGISTRY.md` và kiểm tra các thư mục `src/components/ui/`, `src/components/common/`, `src/components/layout/`, `src/components/three/`.
   - **CẤM TUYỆT ĐỐI** việc tạo thừa code giao diện hoặc copy-paste JSX lặp lại giữa các trang.
2. **QUY TẮC CẤM HARDCODE 5 THÀNH PHẦN (ZERO-HARDCODING GOVERNANCE — BẮT BUỘC 100%)**:
   - **Không Hardcode Key / URL / Port**: Mọi biến cấu hình (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STORE_URL`, `NEXT_PUBLIC_LANDING_URL`, `NEXT_PUBLIC_CMS_URL`) phải để trong `.env.local` và đọc qua `src/config/env.ts`.
   - **Không Hardcode Màu Sắc**: Cấm dùng class Hex trực tiếp như `bg-[#...]`, `text-[#...]`, `border-[#...]` trong JSX/TSX. Bắt buộc dùng class ngữ nghĩa từ `tailwind.config.ts` / `globals.css` (ví dụ: `bg-coastal-bg`, `bg-coastal-mist`, `bg-coastal-card`, `text-coastal-ink`, `text-coastal-muted`, `border-coastal-line`, `bg-coastal-kelp`, `text-coastal-kelp`, `bg-coastal-rust`, `text-coastal-rust`) và dùng `src/config/theme.ts` cho vật liệu 3D WebGL.
   - **Không Hardcode Text (Bắt buộc hỗ trợ Đa ngôn ngữ i18n `vi` / `en`)**: Toàn bộ văn bản hiển thị phải đặt trong `src/i18n/locales/vi.ts` và `src/i18n/locales/en.ts`, gọi qua hook `useI18n()` (`t('...')`).
   - **Không Hardcode Hình Ảnh**: Toàn bộ đường dẫn ảnh và media phải đặt trong `src/config/assets.ts` (`ASSETS`).
   - **Không Hardcode Icon**: Toàn bộ icon phải đăng ký trong `src/config/icons.ts` và hiển thị qua `<AppIcon name="..." />` (`src/components/ui/AppIcon.tsx`).
3. **CHUẨN SEO & HIỆU NĂNG (VERCEL REACT BEST PRACTICES)**:
   - Áp dụng triệt để `.agents/skills/vercel-react-best-practices/SKILL.md` và `.agents/skills/frontend-component-governance/SKILL.md`.
   - Đảm bảo Semantic HTML (`header`, `main`, `section`, `article`, `nav`, `footer`) và duy nhất 1 thẻ `<h1>` trên mỗi route.
