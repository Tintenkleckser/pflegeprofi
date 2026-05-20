import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import type { Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0891b2',
};

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  applicationName: 'PflegeProfi',
  title: 'PflegeProfi - Prüfungsvorbereitung',
  description: 'Simulationssystem für Pflegekräfte zur Vorbereitung auf deutsche Anerkennungsprüfungen',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'PflegeProfi',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'PflegeProfi - Prüfungsvorbereitung',
    description: 'Simulationssystem für Pflegekräfte zur Vorbereitung auf deutsche Anerkennungsprüfungen',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
