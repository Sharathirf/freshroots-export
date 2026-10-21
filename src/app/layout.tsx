import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tiptur Direct | Farm-Gate Coconuts & GI-Certified Copra from Karnataka',
  description: 'Direct-from-origin agricultural commerce platform selling hand-graded mature coconuts, GI Tiptur ball copra, and milling copra to households and bulk commercial buyers.',
  keywords: [
    'buy coconuts online Bangalore',
    'Tiptur ball copra wholesale',
    'coconut suppliers Karnataka',
    'mature dehusked coconuts wholesale',
    'copra price per quintal',
    'agricultural commodities India'
  ],
  openGraph: {
    title: 'Tiptur Direct | Karnataka Agricultural Commerce',
    description: 'Zero commission agents. Standardized weight grading. Direct farm-gate procurement from Tiptur & Tumakuru APMC corridors.',
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
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
