import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import RfqSuccessContent from './RfqSuccessContent';

export const metadata: Metadata = {
  title: 'RFQ Submitted Successfully | FreshRoots Export B2B Desk',
  description:
    'Your commercial quotation request has been officially registered with the FreshRoots Export Mandi Desk. Our sourcing team is calculating lot rates and freight.',
  robots: {
    index: false, // Prevent Google from indexing the thank-you page in organic search, standard practice for conversion pages
    follow: false,
  },
};

export default function RfqSuccessPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full flex items-center justify-center">
        <Suspense
          fallback={
            <div className="p-12 text-center text-stone-500 font-medium">
              Loading quotation confirmation...
            </div>
          }
        >
          <RfqSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
