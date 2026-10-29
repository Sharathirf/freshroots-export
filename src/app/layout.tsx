import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import WatchlistDrawer from '@/components/WatchlistDrawer';
import SignInModal from '@/components/SignInModal';
import AccountModal from '@/components/AccountModal';
import EditProfileModal from '@/components/EditProfileModal';
import ManageAddressesModal from '@/components/ManageAddressesModal';
import OrderHistoryModal from '@/components/OrderHistoryModal';
import HelpModal from '@/components/HelpModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import PostHogPageView from '@/components/PostHogPageView';
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
    default: 'FreshRoots Export | Farm-Gate Agricultural Commodities from Karnataka',
    template: '%s | FreshRoots Export',
  },
  description: 'Direct-from-origin agricultural commerce platform selling hand-graded mature coconuts, GI Tiptur ball copra, spices, and pure cold-pressed oils to households and bulk commercial buyers.',
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
    canonical: '/',
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
              <WatchlistDrawer />
              <SignInModal />
              <AccountModal />
              <EditProfileModal />
              <ManageAddressesModal />
              <OrderHistoryModal />
              <HelpModal />
              <MobileBottomNav />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
        <PostHogPageView />
        <PwaInstallPrompt />
        <Analytics />
        {/* Razorpay Standard Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
