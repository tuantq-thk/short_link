import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TeamKit — Internal tools cho team',
  description: 'Bộ công cụ nội bộ cho link, template và report.',
  applicationName: 'TeamKit',
  keywords: ['TeamKit', 'internal tools', 'link shortener', 'template report'],
  robots: { index: false, follow: false },
  openGraph: {
    title: 'TeamKit — Internal tools cho team',
    description: 'Bộ công cụ nội bộ cho link, template và report.',
    type: 'website',
    siteName: 'TeamKit',
    locale: 'vi_VN',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f7fb',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
