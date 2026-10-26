import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { FileCheck, AlertCircle, Scale } from 'lucide-react';
import { getSiteUrl, getRobotsDirectives } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms & Conditions | FreshRoots Export',
  description: 'Terms of sale, agricultural produce quality tolerances, statutory GST classifications, and commercial guidelines for FreshRoots Export.',
  alternates: {
    canonical: `${getSiteUrl()}/terms`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'Terms & Conditions | FreshRoots Export',
    description: 'Commercial terms and quality tolerances governing farm-direct agricultural commodity transactions.',
    url: `${getSiteUrl()}/terms`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3b6d11] bg-lime-100 border border-lime-300 px-3 py-1 rounded-full">
            Commercial Guidelines
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-stone-500 text-xs">
            Governing purchase of direct farm commodities, spot pricing, and bulk trade.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-8 text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <span>1. Agreement to Terms</span>
            </h2>
            <p>
              By accessing or purchasing from FreshRoots Export Agri-Commerce Platform, you agree to be bound by these Terms and Conditions in accordance with Indian commercial laws and applicable market guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-700" />
              <span>2. Product Nature &amp; Agricultural Tolerances</span>
            </h2>
            <p>
              All commodities offered on this platform are natural agricultural produce harvested directly from Karnataka farms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Coconuts &amp; Copra:</strong> Graded according to size, moisture, and weight standards. Minor natural variation in nut dimension or husk texture is inherent to farm produce.</li>
              <li><strong>Minimum Order Quantities (MOQs):</strong> Strictly enforced where specified (e.g. 50 plants for coconut saplings, 200 plants for arecanut saplings) to maintain nursery viability and specialized transport safety.</li>
              <li><strong>Wholesale Consignments:</strong> Tender coconuts, bulk industrial shells, and 50 kg ginger lots are offered strictly through Request for Quotation (RFQ) based on daily mandi spot rates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-700" />
              <span>3. Pricing, GST &amp; Payment</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All retail prices are shown in Indian Rupees (INR) inclusive of applicable goods classification.</li>
              <li>GST rates strictly follow Indian tax law: 0% on fresh unprocessed coconuts, unbranded ragi, and nursery saplings; 5% on copra and groundnut oil; 12% on pure cow ghee.</li>
              <li>Retail orders are confirmed upon online payment authorization (UPI, Debit/Credit Card, NetBanking).</li>
            </ul>
          </section>

          <section className="space-y-3 border-t pt-6">
            <h2 className="text-base font-bold text-stone-900">4. Jurisdiction &amp; Dispute Resolution</h2>
            <p>
              Any disputes arising from transactions on this platform shall be subject to the exclusive jurisdiction of the competent courts in Mandya District, Karnataka, India.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
