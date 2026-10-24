import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import WatchlistDrawer from '@/components/WatchlistDrawer';
import SignInModal from '@/components/SignInModal';
import ExitIntentModal from '@/components/ExitIntentModal';
import AccountModal from '@/components/AccountModal';
import EditProfileModal from '@/components/EditProfileModal';
import ManageAddressesModal from '@/components/ManageAddressesModal';
import OrderHistoryModal from '@/components/OrderHistoryModal';
import HelpModal from '@/components/HelpModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import VoiceOrderFloatingBtn from '@/components/VoiceOrderFloatingBtn';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#3b6d11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};

export const metadata: Metadata = {
  title: 'Sharath Inorahalli | Farm-Gate Agricultural Commodities from Karnataka',
  description: 'Direct-from-origin agricultural commerce platform selling hand-graded mature coconuts, GI Tiptur ball copra, spices, and pure cold-pressed oils to households and bulk commercial buyers.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sharath Agri'
  },
  keywords: [
    'Sharath Inorahalli',
    'buy coconuts online Bangalore',
    'Tiptur ball copra wholesale',
    'coconut suppliers Karnataka',
    'mature dehusked coconuts wholesale',
    'copra price per quintal',
    'agricultural commodities India'
  ],
  openGraph: {
    title: 'Sharath Inorahalli | Karnataka Agricultural Commerce',
    description: 'Zero commission agents. Standardized weight grading. Direct farm-gate procurement from Karnataka agricultural corridors.',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-50 text-stone-900`}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <WatchlistDrawer />
              <SignInModal />
              <ExitIntentModal />
              <AccountModal />
              <EditProfileModal />
              <ManageAddressesModal />
              <OrderHistoryModal />
              <HelpModal />
              <MobileBottomNav />
              <VoiceOrderFloatingBtn />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
