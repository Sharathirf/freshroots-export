import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import {
  EXPORT_COUNTRIES,
  getCountrySlug,
  findCountryBySlug,
} from '@/lib/export-countries';
import {
  getSiteUrl,
  getRobotsDirectives,
  generateBreadcrumbJsonLd,
  generateExportCorridorJsonLd,
  generateFAQJsonLd,
} from '@/lib/seo';
import { ChevronRight } from 'lucide-react';
import ExportRfqButton from '@/components/ExportRfqButton';

const siteUrl = getSiteUrl();

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  const slugs: string[] = [];
  for (const c of EXPORT_COUNTRIES) {
    slugs.push(getCountrySlug(c.name));
    if (c.code === 'AE') slugs.push('uae');
    if (c.code === 'US') slugs.push('usa');
    if (c.code === 'GB') slugs.push('uk');
  }
  return slugs.map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const country = findCountryBySlug(resolvedParams.country);
  if (!country) return {};

  const title = `Export Agricultural Commodities to ${country.name} | Coconuts & Copra`;
  const description = `Direct farm-origin ocean container exports (FCL/LCL) from Karnataka, India to ${country.name} (${country.majorPort}). Supplying ${country.popularCommodities} with complete Phytosanitary, COO, and CDB compliance.`;
  const canonicalUrl = `${siteUrl}/export/corridors/${resolvedParams.country}`;

  return {
    title,
    description,
    keywords: [
      `agricultural export to ${country.name.toLowerCase()}`,
      `coconut exporter to ${country.majorPort.toLowerCase()}`,
      `ball copra container shipping ${country.name.toLowerCase()}`,
      `indian commodity supplier ${country.code}`,
      `fob jnpt to ${country.majorPort.split('/')[0].trim().toLowerCase()}`,
      `coconuts ${country.name.toLowerCase()}`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: getRobotsDirectives(true),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'FreshRoots Export',
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function ExportCorridorPage({ params }: Props) {
  const resolvedParams = await params;
  const country = findCountryBySlug(resolvedParams.country);
  if (!country) notFound();

  const corridorUrl = `${siteUrl}/export/corridors/${resolvedParams.country}`;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    [
      { name: 'Home', url: '/' },
      { name: 'Export Desk', url: '/export' },
      { name: `${country.name} Trade Corridor`, url: corridorUrl },
    ],
    siteUrl
  );

  const corridorServiceJsonLd = generateExportCorridorJsonLd(
    country.name,
    country.majorPort,
    country.popularCommodities,
    siteUrl
  );

  const corridorFaqs = [
    {
      question: `What are the average maritime transit times to ${country.majorPort}?`,
      answer: `Shipments departing from JNPT (Mumbai) or NMPT (Mangalore) reach ${country.majorPort} with an average ocean transit of 4 to 12 business days depending on liner schedule and transshipment hubs.`,
    },
    {
      question: `Which agricultural commodities does FreshRoots Export supply to ${country.name}?`,
      answer: `Our primary trade lines to ${country.name} include ${country.popularCommodities}, available in 20ft Full Container Loads (FCL), 40ft High Cube containers, and palletized lots.`,
    },
    {
      question: `What customs documentation accompanies consignments entering ${country.name}?`,
      answer: `All consignments include a full legal documentation pack: Official Phytosanitary Certificate from the Ministry of Agriculture (India), Non-Preferential Certificate of Origin (COO), Commercial Tax Invoice, Packing List with weighbridge certificate, and Bill of Lading (B/L).`,
    },
    {
      question: `What Incoterms and payment terms are supported for ${country.name} buyers?`,
      answer: `We support FOB JNPT, FOB NMPT, CFR, and CIF to ${country.majorPort}. Standard payment terms are 100% Irrevocable Letter of Credit (L/C at sight) or advance Telegraphic Transfer (T/T).`,
    },
  ];

  const faqJsonLd = generateFAQJsonLd(corridorFaqs);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corridorServiceJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <main className="flex-1 space-y-12 sm:space-y-16 pb-16">
        {/* Breadcrumb Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-emerald-700 transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link href="/export" className="hover:text-emerald-700 transition">Global Export Desk</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-medium">{country.name} Corridor</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-stone-800 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <span className="text-lg leading-none">{country.flag}</span>
                  <span>{country.region} Trade Corridor</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  Exporting Agricultural Commodities to {country.name}
                </h1>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  Direct ocean container freight from Karnataka grower corridors (Tiptur, Mandya, Shivamogga) to <strong className="text-white">{country.majorPort}</strong>. Supplying certified consignments of {country.popularCommodities} with complete bilateral import documentation.
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Arrival Port</span>
                    <strong className="text-white text-xs sm:text-sm font-mono block truncate">{country.majorPort}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Incoterms</span>
                    <strong className="text-emerald-400 text-xs sm:text-sm font-mono block">FOB / CFR / CIF</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Min Container</span>
                    <strong className="text-lime-400 text-xs sm:text-sm font-mono block">1x 20ft FCL</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Documentation</span>
                    <strong className="text-amber-400 text-xs sm:text-sm font-mono block">Phyto + COO + CDB</strong>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="shrink-0 flex flex-col gap-3">
                <ExportRfqButton
                  label={`Request CIF ${country.name} Quote`}
                  defaultCountry={country.name}
                  className="px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition text-center"
                />
                <a
                  href={`https://wa.me/919008462568?text=Hello%20FreshRoots%20Export,%20I%20am%20inquirying%20about%20container%20shipments%20to%20${encodeURIComponent(country.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition text-center"
                >
                  WhatsApp International Desk
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trade Specifications */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Commodities in Demand for {country.name}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Standardized packaging, container stuffing capacities, and moisture-controlled preparation for ocean transit to {country.majorPort}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg">
                🥥
              </div>
              <h3 className="text-base font-bold text-stone-900">
                GI Tiptur Ball Copra (HS 1203)
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Standardized edible dried whole coconut with ≤5.5% moisture and 65-68% oil content. Packed in 15kg master cartons for direct container stuffing (11 MT in 20ft FCL / 23.5 MT in 40ft HC).
              </p>
              <Link
                href="/export/ball-copra-india"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition pt-1"
              >
                <span>Full Copra Lab Specs</span>
                <span className="font-mono">→</span>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg">
                🌴
              </div>
              <h3 className="text-base font-bold text-stone-900">
                Fresh Mature Dehusked Coconuts
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Grade A semi-husked mature coconuts (550g–650g/nut) packed in 25-piece ventilated polypropylene mesh bags (~15 kg/bag). Dispatched in reefer containers at 8–10°C to ensure 45+ days shelf stability.
              </p>
              <Link
                href="/products/fresh-semi-husked-mature-coconuts-25-piece"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition pt-1"
              >
                <span>View Product Details</span>
                <span className="font-mono">→</span>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-800 flex items-center justify-center font-bold text-lg">
                🌱
              </div>
              <h3 className="text-base font-bold text-stone-900">
                Low EC Washed Cocopeat 5kg Blocks
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Horticultural coir pith substrate washed to EC &lt;0.5 mS/cm, expanded yield 75L+ per block. Palletized container stuffing for commercial greenhouse nurseries and agricultural projects.
              </p>
              <Link
                href="/products/cocopeat-5kg-blocks-low-ec-high-ec"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition pt-1"
              >
                <span>View Cocopeat Specs</span>
                <span className="font-mono">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Trade &amp; Logistics FAQs for {country.name}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Common bilateral trade, inspection, and delivery questions for {country.majorPort}.
            </p>
          </div>

          <div className="space-y-4">
            {corridorFaqs.map((faq, idx) => (
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
          <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-stone-800">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Initiate a Commercial Export Contract to {country.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Submit your volume specifications and discharge port requirements to receive an official proforma invoice with guaranteed moisture logs and transit schedules.
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap gap-3">
              <ExportRfqButton
                label={`Submit RFQ for ${country.name}`}
                defaultCountry={country.name}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition"
              />
              <Link
                href="/export"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition"
              >
                View All 12 Corridors
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
