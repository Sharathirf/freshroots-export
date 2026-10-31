import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { getAllCatalogProducts } from '@/lib/catalog';
import { getSiteUrl, generateBreadcrumbJsonLd } from '@/lib/seo';
import RfqPageClient from './RfqPageClient';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Request Wholesale Volume Quotation (RFQ) | FreshRoots Export B2B Desk',
  description:
    'Submit an official commercial B2B RFQ for farm-gate agricultural commodities: Tiptur Ball Copra, Coconuts, Arecanut, Wood-Pressed Oils, and Ragi. 90-minute turnaround with guaranteed 48-hour spot price lock.',
  keywords: [
    'wholesale rfq',
    'agricultural commodity quotation',
    'tiptur copra bulk quote',
    'b2b coconut procurement india',
    'commercial agro sourcing form'
  ],
  alternates: {
    canonical: `${siteUrl}/rfq`,
  },
};

export default function RfqPage() {
  const products = getAllCatalogProducts();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Wholesale B2B Desk', url: '/wholesale/mandi-rates' },
    { name: 'Request Quotation (RFQ)', url: '/rfq' }
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, siteUrl);

  const rfqPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'FreshRoots Export Commercial RFQ Procurement Desk',
    description: 'Direct Mandi truckloads and export container lot quotation form for institutional buyers.',
    url: `${siteUrl}/rfq`,
    mainEntity: {
      '@type': 'Service',
      name: 'B2B Agricultural Commodity Quotation Service',
      provider: {
        '@type': 'Organization',
        name: 'FreshRoots Export',
        telephone: '+919008462568',
        email: 'sales@freshrootsexport.com',
      },
    },
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rfqPageJsonLd) }}
      />

      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <Suspense
          fallback={
            <div className="p-12 text-center text-stone-500 font-medium">
              Loading Procurement Desk...
            </div>
          }
        >
          <RfqPageClient products={products} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
