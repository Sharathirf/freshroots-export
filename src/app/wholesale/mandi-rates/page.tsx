import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import {
  getSiteUrl,
  getRobotsDirectives,
  generateBreadcrumbJsonLd,
  generateFAQJsonLd,
  generateItemListJsonLd,
} from '@/lib/seo';
import {
  Calendar,
  ChevronRight,
  PhoneCall,
} from 'lucide-react';
import ExportRfqButton from '@/components/ExportRfqButton';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Tiptur Copra & Karnataka Mandi Rates Today | APMC Spot Price',
  description:
    'Verified daily APMC mandi benchmark rates for Tiptur Ball Copra (Unde Kobbari), Shivamogga Arecanut (Adike), Mandya mature coconuts, and native ragi. Farm-gate spot price index & truckload supply.',
  keywords: [
    'tiptur copra mandi price today',
    'shivamogga arecanut mandi rate today',
    'ball copra wholesale price karnataka',
    'mature coconut 25 piece bag wholesale',
    'tiptur unde kobbari price per quintal',
    'arecanut mandi price karnataka',
    'wholesale ragi supplier mandya',
    'karnataka apmc commodity rates',
    'freshroots mandi desk',
  ],
  alternates: {
    canonical: `${siteUrl}/wholesale/mandi-rates`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'Tiptur Copra & Karnataka Mandi Rates Today | FreshRoots Mandi Desk',
    description:
      'Daily APMC mandi benchmark rates for Tiptur Ball Copra, Shivamogga Arecanut, and Mandya Coconuts. Direct farm-gate truckload lots with weighbridge guarantee.',
    url: `${siteUrl}/wholesale/mandi-rates`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
};

const MANDI_COMMODITIES = [
  {
    name: 'GI Tiptur Ball Copra (Unde Kobbari)',
    mandi: 'APMC Tiptur (Tumakuru)',
    grade: 'Agmark Grade 1 (Whole spherical, Moisture ≤5.5%)',
    unit: 'Per Quintal (100 kg)',
    modalPrice: '₹14,500 – ₹15,800',
    trend: '+1.8% this week',
    minWholesaleLot: '15 Quintals (1.5 MT) / Tempo Load',
    sku: 'COP-BAL-BOX-15K',
  },
  {
    name: 'Shivamogga Arecanut (Rashi / Chali Adike)',
    mandi: 'APMC Shivamogga (Shimoga)',
    grade: 'Premium Dried Red / White Betel Nut',
    unit: 'Per Quintal (100 kg)',
    modalPrice: '₹70,809',
    trend: 'Stable benchmark',
    minWholesaleLot: '10 Quintals (1.0 MT)',
    sku: 'ARE-BLK-ADK-01Q',
  },
  {
    name: 'Mandya Semi-Husked Mature Coconuts',
    mandi: 'Mandya / K.R. Pet Farm Gate',
    grade: 'Grade A Medium/Large (550g - 650g/nut)',
    unit: 'Per 25-Nut Bag (~15 kg)',
    modalPrice: '₹1,380 – ₹1,479',
    trend: 'Direct Farm Siding',
    minWholesaleLot: '100 Bags (Canter Load)',
    sku: 'COC-SEMI-25P-15K',
  },
  {
    name: 'Mandya Native Unpolished Ragi (Grains)',
    mandi: 'Mandya APMC Market',
    grade: '100% Native Pure Mandya Grains',
    unit: 'Per Quintal (100 kg)',
    modalPrice: '₹3,850 – ₹4,200',
    trend: '+0.5% harvest steady',
    minWholesaleLot: '20 Bags (50kg each, 1 Tonne)',
    sku: 'MIL-RAG-ORG-05K',
  },
  {
    name: 'Commercial Tender Coconuts (Sweet Elaneeru)',
    mandi: 'Maddur / Mandya Canal Belt',
    grade: 'Sweet Water (>400ml water volume)',
    unit: 'Per Nut (Farm Lot)',
    modalPrice: '₹38 – ₹45 (Farm Gate) / ₹95 Retail',
    trend: 'Direct Truckload Siding',
    minWholesaleLot: '1,000 Nuts (Eicher Truckload)',
    sku: 'COC-TND-BLK-LOT',
  },
  {
    name: 'Cocopeat 5kg Compressed Blocks (Low EC Washed)',
    mandi: 'Tiptur / Tumakuru Processing Plant',
    grade: 'Triple-Washed EC <0.5 mS/cm, Expansion 75L+',
    unit: 'Per 5kg Block',
    modalPrice: '₹185 – ₹220 (Bulk Lot)',
    trend: 'Export & Domestic Greenhouse',
    minWholesaleLot: '240 Blocks (1 Pallet / 1.2 Tonnes)',
    sku: 'COI-COP-05K',
  },
];

const MANDI_FAQS = [
  {
    question: 'How often are the APMC benchmark rates updated on FreshRoots?',
    answer:
      'Our field agronomy desk updates price benchmarks twice weekly following the primary trading sessions at APMC Tiptur (Copra auctions on Wednesdays and Saturdays) and APMC Shivamogga (Arecanut tender auctions). Spot rates are subject to immediate mandi arrivals and daily moisture grade variations.',
  },
  {
    question: 'How does FreshRoots direct farm-gate pricing compare to APMC commission agents?',
    answer:
      'Traditional APMC purchases incur a 1.5% to 2.5% market cess, 2.0% commission agent margin, loading/hamali cess, and transit brokerage. FreshRoots aggregates directly from contracted grower belts, delivering net pricing with zero agent commissions, standardized moisture calibration, and official computer weighbridge receipts.',
  },
  {
    question: 'What are the logistics arrangements for domestic truckloads and canters?',
    answer:
      'We arrange dedicated commercial canter truckloads (3.5T to 9T) and multi-axle freight (16T to 25T) across all major transport corridors in Karnataka, Tamil Nadu, Maharashtra, Andhra Pradesh, Gujarat, and Delhi NCR. Freight is billed strictly at actual carrier LR rates with GPS consignment tracking.',
  },
  {
    question: 'Can business buyers receive GST input tax credit (ITC) on wholesale orders?',
    answer:
      'Yes. FreshRoots issues official GST e-invoices for every transaction with compliant HSN declarations (Fresh Coconuts: HSN 080112, 0% Nil-rated; Copra: HSN 1203, 5% GST; Arecanut: HSN 080280, 5% GST; Edible Oils: HSN 1513, 5% GST).',
  },
];

export default function MandiRatesPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    [
      { name: 'Home', url: '/' },
      { name: 'Wholesale Desk', url: '/wholesale/mandi-rates' },
      { name: 'Karnataka APMC Mandi Rates', url: '/wholesale/mandi-rates' },
    ],
    siteUrl
  );

  const itemListJsonLd = generateItemListJsonLd(
    'Karnataka Agricultural Mandi Spot Rate Index',
    MANDI_COMMODITIES.map((c) => ({
      name: `${c.name} - ${c.mandi}`,
      url: `${siteUrl}/wholesale/mandi-rates#${c.sku.toLowerCase()}`,
    })),
    siteUrl
  );

  const faqJsonLd = generateFAQJsonLd(MANDI_FAQS);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      {/* JSON-LD Schemas */}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <main className="flex-1 space-y-10 sm:space-y-14 pb-16">
        {/* Breadcrumb Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-emerald-700 transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-medium">Karnataka APMC Mandi Benchmark Rates</span>
          </nav>
        </div>

        {/* Hero Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Karnataka APMC Live Trade Benchmark &amp; Farm Siding Index</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                  Tiptur Copra, Shivamogga Arecanut &amp; Mandya Produce Mandi Rates Today
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Real-time market price discovery for wholesale commodity buyers, institutional food processors, and oil millers. Sourced straight from grower sidings in Tumakuru, Mandya, and Shivamogga APMC trading belts with verified weighbridge slips.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <ExportRfqButton
                  label="Request Wholesale Mandi Lot Quote"
                  className="px-6 py-3.5 rounded-2xl bg-[#3b6d11] hover:bg-[#2e550d] text-white font-extrabold text-xs sm:text-sm shadow-sm transition text-center"
                />
                <a
                  href="https://wa.me/919008462568?text=Hello%20FreshRoots%20Mandi%20Desk,%20I%20would%20like%20to%20inquire%20about%20today's%20commodity%20rates."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-sm transition text-center flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Call / WhatsApp Mandi Desk</span>
                </a>
              </div>
            </div>

            {/* Live Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-stone-100 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Tiptur Ball Copra</span>
                <strong className="text-stone-900 font-mono text-sm block">₹14,500 – ₹15,800/Qtl</strong>
                <span className="text-[10px] text-emerald-700 font-bold">Stable seasonal supply</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Shivamogga Arecanut</span>
                <strong className="text-stone-900 font-mono text-sm block">₹70,809/Qtl</strong>
                <span className="text-[10px] text-blue-700 font-bold">Rashi/Chali lot certified</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Mandya Coconuts (Bag)</span>
                <strong className="text-stone-900 font-mono text-sm block">₹1,479 / 25-Nut Bag</strong>
                <span className="text-[10px] text-emerald-700 font-bold">~15kg, Free Delivery</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Mandya Ragi Grains</span>
                <strong className="text-stone-900 font-mono text-sm block">₹3,850 – ₹4,200/Qtl</strong>
                <span className="text-[10px] text-amber-700 font-bold">Unpolished native grains</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Mandi Benchmark Rates Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 font-mono">
                Commercial Lot Index
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Karnataka Mandi Spot Benchmark Price Sheet
              </h2>
            </div>
            <div className="text-xs text-stone-500 font-mono flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>Verified APMC Trading Session Feeds</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Commodity Lot</th>
                  <th className="p-4">APMC Market / Siding</th>
                  <th className="p-4">Quality &amp; Moisture Grade</th>
                  <th className="p-4">Benchmarked Unit</th>
                  <th className="p-4">Spot Modal Price</th>
                  <th className="p-4">Min. Wholesale Order</th>
                  <th className="p-4 text-right">Inquiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {MANDI_COMMODITIES.map((c, idx) => (
                  <tr key={idx} id={c.sku.toLowerCase()} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'}>
                    <td className="p-4">
                      <strong className="text-stone-900 block text-sm">{c.name}</strong>
                      <span className="text-[10px] font-mono text-stone-400">SKU: {c.sku}</span>
                    </td>
                    <td className="p-4 font-medium text-stone-800">{c.mandi}</td>
                    <td className="p-4 text-stone-600 max-w-xs">{c.grade}</td>
                    <td className="p-4 font-mono">{c.unit}</td>
                    <td className="p-4">
                      <strong className="text-emerald-900 font-mono text-sm block">{c.modalPrice}</strong>
                      <span className="text-[10px] text-emerald-700 font-medium">{c.trend}</span>
                    </td>
                    <td className="p-4 text-stone-600 font-mono text-[11px]">{c.minWholesaleLot}</td>
                    <td className="p-4 text-right">
                      <ExportRfqButton
                        defaultProduct={c.name}
                        label="Get Quote"
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition inline-block"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Direct Farm-Gate Sourcing */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 border border-stone-800 shadow-xl space-y-8">
            <div className="max-w-3xl space-y-2">
              <div className="text-emerald-400 font-mono uppercase text-xs font-bold tracking-wider">
                Procurement Advantage
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Why Commercial Millers &amp; Wholesalers Procure via FreshRoots
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm">
                Eliminating the multi-tiered commission agent friction of conventional APMC physical auction halls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-300">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <strong className="text-white text-sm block">Zero Broker Cess &amp; Middleman Markup</strong>
                <p className="text-stone-400 leading-relaxed">
                  Conventional APMC yards add 2.0% agent commission + 1.5% APMC market cess + hamali loading fees. FreshRoots contracts directly with grower belts, billing direct transparent producer pricing.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <strong className="text-white text-sm block">Calibrated Moisture &amp; Weight Certification</strong>
                <p className="text-stone-400 leading-relaxed">
                  Every lot is pre-tested with calibrated electronic moisture meters (copra ≤5.5%, arecanut dried) and weighed on certified digital electronic weighbridges before consignment dispatch.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <strong className="text-white text-sm block">Pan-India FTL &amp; Canter Dispatch</strong>
                <p className="text-stone-400 leading-relaxed">
                  Dedicated road freight network connecting Mandya and Tiptur directly to Bengaluru, Hyderabad, Chennai, Mumbai, Pune, Ahmedabad, and Delhi NCR with verified commercial truckload LRs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Frequently Asked Mandi &amp; Wholesale Questions
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Operational details regarding lot allocation, billing terms, and dispatch schedules.
            </p>
          </div>

          <div className="space-y-4">
            {MANDI_FAQS.map((faq, idx) => (
              <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-start gap-2.5">
                  <span className="text-emerald-700 font-mono">Q{idx + 1}.</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Callout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-emerald-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Need a Custom Spot Truckload or Siding Quote?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                Call our Mandi Operations Officer directly at +91 90084 62568 for live lot availability, moisture readings, and dispatch booking.
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap gap-3">
              <ExportRfqButton
                label="Submit Wholesale RFQ"
                className="px-6 py-3.5 rounded-xl bg-white text-emerald-900 font-black text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition"
              />
              <Link
                href="/export/ball-copra-india"
                className="px-6 py-3.5 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-white font-bold text-xs sm:text-sm hover:bg-emerald-950/60 transition"
              >
                View Export Container Lot
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
