---
name: scroll-motion-animation
description: >-
  High-Performance 60fps Scroll-Driven Animations, Parallax, Staggered Text
  Reveal, Sticky Scrollytelling, and Kinetic Marquee patterns for Next.js and
  React. Enforces GPU-accelerated transforms, requestAnimationFrame throttling,
  and reduced-motion accessibility.
---

# Kỹ Thuật Chuyển Động Theo Cuộn Trang (Scroll-Driven Motion & Scrollytelling 60FPS)

## 1. Nguyên Tắc Cốt Lõi (60fps Performance & GPU Acceleration)
1. **Chỉ Animate Thuộc Tính Tổng Hợp (Composite Properties)**:
   - Chỉ sử dụng `transform: translate3d(...) scale(...) rotate(...)` và `opacity` cùng `will-change: transform, opacity`.
   - **Cấm tuyệt đối** thay đổi `top`, `left`, `width`, `height`, `margin` theo sự kiện `scroll` để tránh Layout Thrashing.
2. **RequestAnimationFrame + Passive Scroll Listeners**:
   - Mọi trình lắng nghe `window.addEventListener('scroll', ..., { passive: true })` phải được gom thông qua `requestAnimationFrame` và sử dụng nội suy tuyến tính (`lerp(current, target, 0.12)`) để tạo quán tính mượt mà (smooth inertia).
3. **Tái Sử Dụng Qua Shared Component (`frontend/src/components/common/ScrollMotion.tsx`)**:
   - Không viết lặp lại logic `IntersectionObserver` hay `window.scrollY` ở từng trang. Bắt buộc sử dụng bộ component chuẩn hóa trong `ScrollMotion.tsx`:
     - `<ScrollProgressBar />`: Thanh tiến trình cuộn trang ở đỉnh màn hình với dải màu chuyển sắc `from-coastal-kelp via-coastal-gold to-coastal-rust`.
     - `<ScrollRevealText />`: Tách chữ theo từng từ/dòng trồi lên từ mặt nạ (`overflow-hidden`) kèm hiệu ứng mờ dần (`blur -> sharp`) theo độ trễ bậc thang (`staggerMs`).
     - `<ScrollParallaxBox />`: Di chuyển vật thể theo tốc độ tương đối với cuộn trang (`speed`), hỗ trợ phóng to nhẹ (`scaleOnScroll`) và nghiêng 3D (`tiltOnHover`) khi rê chuột.
     - `<ScrollStickyShowcase />`: Trải nghiệm Scrollytelling ghim khung hình bên phải (`sticky top-24`) chuyển cảnh mượt mà từ **Đại dương xanh -> Thu gom lưới đánh cá -> Chế tác túi lưới & đính vỏ sò 3D** khi người dùng cuộn qua từng chương bên trái.
     - `<ScrollMarquee />`: Dải băng chữ và hình ảnh chạy ngang vô tận có khả năng tăng tốc theo vận tốc cuộn chuột (scroll velocity).
     - `<AnimatedCounter />`: Bộ đếm số liệu tăng dần theo đường cong `easeOutExpo` ngay khi phần tử đi vào vùng nhìn thấy (viewport).
