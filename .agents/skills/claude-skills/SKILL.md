---
name: claude-skills
description: >-
  Comprehensive QA, Testing, Code Review, Convention Audit, Zero-Hardcoding
  Verification, and Security Suite powered by alirezarezvani/claude-skills. Use
  this skill for Tester subagents (qa-lead, qa-engineer) to verify project
  structure, UI component reuse, zero-hardcoding compliance (.env keys, CSS
  color classes, i18n text, centralized images & icons), and 100% test coverage.
---

# Bộ Kỹ Năng Kiểm Thử, Kiểm Toán Convention & Chống Hardcode Toàn Diện (QA & Tester Suite)

## 1. Các Module Kỹ Năng Chuyên Sâu Đã Tích Hợp
- **Kiểm thử tổng thể & Chiến lược QA**: [../senior-qa/SKILL.md](../senior-qa/SKILL.md)
- **Review Code, Cấu trúc & Convention**: [../code-reviewer/SKILL.md](../code-reviewer/SKILL.md)
- **Kiểm thử Phản biện**: [../adversarial-reviewer/SKILL.md](../adversarial-reviewer/SKILL.md)
- **Xây dựng Bộ Test API**: [../api-test-suite-builder/SKILL.md](../api-test-suite-builder/SKILL.md)
- **Hướng dẫn TDD & Độ phủ Test**: [../tdd-guide/SKILL.md](../tdd-guide/SKILL.md)
- **Kiểm thử Bảo mật & Pen-Testing**: [../security-pen-testing/SKILL.md](../security-pen-testing/SKILL.md)
- **Review E2E Playwright**: [../pw-review/SKILL.md](../pw-review/SKILL.md)

---

## 2. Quy Trình Kiểm Tra 5 Lớp Bắt Buộc Khi Team Dev Bàn Giao

### Lớp 1: Kiểm tra Chống Hardcode 5 Thành Phần (Zero-Hardcoding Audit — BẮT BUỘC 100%)
`qa-lead` và `qa-engineer` phải chạy lệnh quét mã nguồn để đảm bảo **KHÔNG CÒN BẤT KỲ VI PHẠM HARDCODE NÀO**:
1. **Không Hardcode Key / URL / Secret**:
   - Kiểm tra mọi key, secret, port, URL (`http://localhost:5000`, `http://localhost:3000`, JWT secret, thông tin ngân hàng) đã được đưa vào `.env` và đọc qua `config/env` chưa.
2. **Không Hardcode Màu Sắc trong JSX/TSX**:
   - Quét toàn bộ `src/components/` và `src/app/` để đảm bảo **0 lần xuất hiện** các class màu Hex cứng như `bg-[#...]`, `text-[#...]`, `border-[#...]`. Tất cả phải dùng class ngữ nghĩa từ `tailwind.config.ts` / `globals.css` (hoặc `config/theme.ts` cho WebGL 3D).
3. **Không Hardcode Text Giao Diện (Hỗ trợ Đa Ngôn Ngữ i18n `vi` / `en`)**:
   - Kiểm tra hệ thống đa ngôn ngữ `src/i18n/` (`vi.ts`, `en.ts`, `I18nContext.tsx`) và `backend/src/i18n/messages.js` hoạt động đầy đủ; các trang và component sử dụng hàm dịch `t('...')` và có bộ chuyển đổi ngôn ngữ `VI / EN`.
4. **Không Hardcode Hình Ảnh (`config/assets`)**:
   - Quét toàn bộ `src/components/`, `src/app/`, `backend/src/seeds/` để đảm bảo **0 lần xuất hiện** URL ảnh rời rạc (`https://images.unsplash.com/...`) bên ngoài file quản lý ảnh tập trung (`config/assets.ts` và `backend/src/config/assets.js`).
5. **Không Hardcode Icon (`config/icons` & `<AppIcon />`)**:
   - Kiểm tra toàn bộ icon được quản lý tập trung tại `frontend/src/config/icons.ts` và render qua `<AppIcon name="..." />` (`frontend/src/components/ui/AppIcon.tsx`), không import rời rạc từ `lucide-react` hay nhúng `<svg>` trực tiếp trong các trang/component.

### Lớp 2: Kiểm tra Cấu trúc Dự án & Chống Lặp Code UI (`REGISTRY.md`)
- Đảm bảo 3 ứng dụng Web (`frontend/`, `web-landing/`, `web-cms/`) tái sử dụng 100% Shared Components trong `frontend/src/components/REGISTRY.md`.

### Lớp 3: Kiểm tra Bảo mật & Chất lượng Code
- Kiểm tra JWT Auth, RBAC, NoSQL Injection sanitization, Server-side BOM pricing (`BR-01`), SEO Semantic HTML (`<h1>` duy nhất mỗi trang).

### Lớp 4: Ma trận Test Cases Vét Cạn (`qa-engineer`)
- Chạy tự động toàn bộ Test Cases (Happy Path, Boundary/Edge Cases, Negative Cases, Security/RBAC, i18n support) và kiểm tra `npm run build` / `npx tsc --noEmit` đạt 100% PASS.
