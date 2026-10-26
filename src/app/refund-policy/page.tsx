import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getSiteUrl, getRobotsDirectives } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Refund & 100% Spoilage Policy | FreshRoots Export',
  description: '100% Farm-Gate Quality Pledge: Free replacement or refund for transit-damaged, cracked coconuts or spoiled copra within 48 hours.',
  alternates: {
    canonical: `${getSiteUrl()}/refund-policy`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'Refund & Spoilage Guarantee | FreshRoots Export',
    description: 'Zero-risk buyer assurance on direct farm produce. Cracked or spoiled nuts replaced at zero cost.',
    url: `${getSiteUrl()}/refund-policy`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3b6d11] bg-lime-100 border border-lime-300 px-3 py-1 rounded-full">
            Zero-Risk Buyer Assurance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Refund &amp; Replacement Policy
          </h1>
          <p className="text-stone-500 text-xs">
            100% Spoilage Guarantee: Broken, cracked, or defective nuts replaced at zero cost.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-8 text-sm text-stone-700 leading-relaxed">
          <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-emerald-950 text-base">Our 100% Farm-Gate Quality Pledge</h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Because coconuts and agricultural commodities are natural perishables, transit shocks can occasionally cause hairline cracks. If any bag or carton arrives damaged or cracked, we replace the defective units or issue a prompt refund at zero additional freight charge.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>1. Eligibility for Free Replacement / Refund</span>
            </h2>
            <p>You qualify for immediate free replacement or refund if:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Transit Cracks / Breakage:</strong> Coconut shells cracked or broken during courier transportation.</li>
              <li><strong>Moisture / Spoilage:</strong> Ball Copra arriving with moisture damage exceeding our certified &le; 5.5% standard.</li>
              <li><strong>Packaging Tampering:</strong> Tampered outer seals or master boxes compromised during transit.</li>
              <li><strong>Wrong SKU Delivered:</strong> Delivery of an item different from your registered order invoice.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-700" />
              <span>2. How to Claim (48-Hour Claim Window)</span>
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Inspect your parcel upon courier delivery.</li>
              <li>Take 2&ndash;3 clear photos or a short video showing the cracked or damaged items and outer shipping label.</li>
              <li>
                Send the photos via WhatsApp to our direct desk at{' '}
                <a href="https://wa.me/919591142548" className="font-mono font-bold text-emerald-800 hover:underline">
                  +91 95911 42548
                </a>{' '}
                or email <strong>sharathir198@gmail.com</strong> with your Order Number (e.g. <code>AGR-202610-XXXXX</code>).
              </li>
              <li>Our team will verify the claim within 4 business hours and dispatch a free replacement parcel or initiate a direct bank/UPI refund.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <span>3. Refund Processing Timeline</span>
            </h2>
            <p>
              Once approved, refunds are credited back to the original payment source (UPI account or Debit/Credit Card) within <strong>3 to 5 business days</strong> via our banking gateway partner.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
