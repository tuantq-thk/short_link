import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Link Gọn — Rút gọn đường dẫn nhanh',
  description: 'Tạo link ngắn miễn phí, nhanh chóng và tiện lợi.',
  applicationName: 'Link Gọn',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f7fb',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
