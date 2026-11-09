import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { I18nProvider } from '@/i18n/I18nContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NetLoop CMS | Hệ Thống Quản Trị Xưởng Thủ Công & Máy Trạm 3D Inspector (Port 3002)',
  description:
    'Ứng dụng Web CMS độc lập dành riêng cho quản trị viên và nghệ nhân đan lưới: Quản lý đơn hàng, Phiếu chế tác 3D Inspector, Kho vỏ sò BOM và Sản phẩm.',
};

export default function CmsRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakarta.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-coastal-bg text-coastal-ink antialiased selection:bg-coastal-kelp selection:text-coastal-card">
        <I18nProvider>
          <CartProvider>{children}</CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
