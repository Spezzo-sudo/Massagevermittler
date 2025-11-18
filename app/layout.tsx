import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ProfileBootstrapper } from '@/components/auth/ProfileBootstrapper';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL('https://massagevermittlung.local'),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: 'https://massagevermittlung.local',
    siteName: siteConfig.name,
    type: 'website'
  }
};

type RootLayoutProps = {
  children: React.ReactNode;
};

/** Global application layout that injects the header/footer skeleton. */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans">
        <ProfileBootstrapper />
        <Header />
        <main className="min-h-screen bg-white">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
