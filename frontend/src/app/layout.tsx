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
  title: {
    default: 'NetLoop Coastal Craft | Thủ Công Lưới Đánh Cá Tái Chế & Xưởng Chế Tác Vỏ Sò 3D',
    template: '%s | NetLoop Coastal Craft',
  },
  description:
    'Thương hiệu thủ công bền vững chế tác từ lưới đánh cá thu hồi tại vùng biển miền Trung (Giỏ đựng đồ, Túi xách, Ví tiền, Áo khoác, Vòng tay nối chuỗi) tích hợp xưởng thiết kế 3D cá nhân hóa.',
  keywords: [
    'lưới đánh cá tái chế',
    'upcycled fishing net',
    'túi lưới đại dương',
    'vòng tay vỏ sò 3D',
    'custom 3D túi xách',
    'thủ công làng chài Đà Nẵng',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'NetLoop 3D Coastal Craft',
    title: 'Từ Lưới Ma Đại Dương Đến Phụ Kiện Thủ Công Độc Bản',
    description:
      'Tự tay đính vỏ sò điệp, ốc xoắn, sao biển lên giỏ, túi xách, ví, áo quần và kết chuỗi vòng tay lưới đánh cá tái chế trên không gian 3D 360 độ.',
  },
};

export default function RootLayout({
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
