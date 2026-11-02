import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import MobileBottomNav from '@/components/MobileBottomNav';
import ClientModals from '@/components/ClientModals';
import PostHogPageView from '@/components/PostHogPageView';
import VisitorTracker from '@/components/VisitorTracker';
import { Analytics } from '@vercel/analytics/react';
import { getSiteUrl, getRobotsDirectives, generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo';

export const viewport: Viewport = {
  themeColor: '#3b6d11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Buy Coconuts & Tiptur Ball Copra Online | FreshRoots Export',
    template: '%s | FreshRoots Export',
  },
  description: 'Direct farm-gate supply of mature coconuts, GI Tiptur ball copra, and cold-pressed oils from Karnataka. Buy retail or wholesale with free express delivery.',
  manifest: '/manifest.webmanifest',
  icons: {
    apple: '/apple-touch-icon.png'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FreshRoots Export'
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: getRobotsDirectives(true),
  keywords: [
    'FreshRoots Export',
    'buy coconuts online Bangalore',
    'Tiptur ball copra wholesale',
    'coconut suppliers Karnataka',
    'mature dehusked coconuts wholesale',
    'copra price per quintal',
    'agricultural commodities India'
  ],
  openGraph: {
    title: 'FreshRoots Export | Karnataka Agricultural Commerce',
    description: 'Zero commission agents. Standardized weight grading. Direct farm-gate procurement from Karnataka agricultural corridors.',
    url: siteUrl,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreshRoots Export | Farm-Gate Produce from Karnataka',
    description: 'Direct-from-origin agricultural commerce platform supplying hand-graded coconuts, copra, and cold-pressed oils.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = generateOrganizationJsonLd(siteUrl);
  const websiteJsonLd = generateWebSiteJsonLd(siteUrl);

  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden max-w-full">
      <head>
        {/* Google tag (gtag.js) - Google Ads Conversion Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18547973125"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18547973125');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-stone-50 text-stone-900 overflow-x-hidden min-h-screen w-full max-w-full">
        <Script src="/pwa-install-bridge.js" strategy="beforeInteractive" />
        {process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({
              token: process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN,
              spa: true,
            })}
          />
        )}
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <ClientModals />
              <MobileBottomNav />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
        <PostHogPageView />
        <VisitorTracker />
        <Analytics />
      </body>
    </html>
  );
}
