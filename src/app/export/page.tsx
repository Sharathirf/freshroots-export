import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { EXPORT_COUNTRIES } from '@/lib/export-countries';
import {
  getSiteUrl,
  getRobotsDirectives,
  generateBreadcrumbJsonLd,
  generateFAQJsonLd
} from '@/lib/seo';
import {
  Globe2,
  Anchor,
  FileCheck2,
  ShieldCheck,
  MessageCircle,
  ChevronRight,
  Building2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Indian Agricultural Commodities Export | Coconuts, Copra, Arecanut & Oils | FreshRoots',
  description: 'Direct farm-origin agricultural exports from Karnataka, India. FCL & LCL consignments of fresh mature coconuts, GI ball copra (0801.12.10), raw copra (1203.00.00), arecanut (0802.80.10), and refined copra oil (1513.19.00). FOB/CIF via JNPT & Mangalore ports.',
  keywords: [
    'coconut export from India',
    'buy ball copra bulk export',
    'raw copra 1203.00.00 export',
    'arecanut export 0802.80.10',
    'refined copra oil 1513.19.00',
    'Tiptur copra exporter Karnataka',
    'Indian agricultural commodities supplier',
    'FOB JNPT fresh coconuts',
    'phytosanitary certificate coconut India',
    'FCL reefer container coconuts'
  ],
  alternates: {
    canonical: `${getSiteUrl()}/export`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'Indian Agricultural Commodities Export | FreshRoots',
    description: 'Farm-direct export consignments from Karnataka, India. FCL/LCL delivery of fresh coconuts, GI copra, and cold-pressed oils.',
    url: `${getSiteUrl()}/export`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
};

const EXPORT_FAQS = [
  {
    question: 'What are the primary shipping ports for FreshRoots export consignments?',
    answer: 'We route sea-freight consignments primarily through New Mangalore Port (NMPT) for Middle East/GCC destinations (4-6 day transit) and JNPT / Nhava Sheva (Mumbai) or Chennai Port for European, US, and East Asian liner connections.'
  },
  {
    question: 'What export documentation accompanies every shipment?',
    answer: 'Consignments include Commercial Invoice, Packing List, Certificate of Origin (COO), Phytosanitary Certificate issued by the Ministry of Agriculture, Fumigation Certificate, and Bill of Lading (BL). Pre-shipment SGS or Bureau Veritas lab inspection reports are available upon request.'
  },
  {
    question: 'What is the container loading capacity for fresh semi-husked coconuts?',
    answer: 'A standard 40-foot High Cube (40HC) container holds approximately 45,000 to 52,000 coconuts packed in 25-nut or 50-nut ventilated polypropylene mesh bags (approx. 24 to 26 metric tons).'
  },
  {
    question: 'What international commercial terms (Incoterms) do you support?',
    answer: 'We support FOB (Free On Board) at Indian gateway ports and CIF (Cost, Insurance & Freight) or CFR (Cost and Freight) to destination ports worldwide.'
  }
];

export default function ExportPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'International Export', url: '/export' },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, siteUrl);
  const faqJsonLd = generateFAQJsonLd(EXPORT_FAQS);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="bg-stone-100 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500">
              <Link href="/" className="hover:text-stone-900 transition">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-semibold text-stone-900">International Agri-Export</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-stone-900 text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-bold mb-6">
                <Globe2 className="w-4 h-4" />
                <span>Global Agricultural Trade Desk · Origin: Mandya & Tiptur</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Farm-Direct Agricultural Exports from India
              </h1>

              <p className="text-stone-300 text-base sm:text-xl mt-6 leading-relaxed">
                Direct procurement from verified grower clusters in Karnataka. Supplying institutional food processors, supermarket chains, and wholesale importers across 12+ countries with full container-load (FCL) reliability.
              </p>

              {/* Quick Key Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-stone-800">
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
                  <div className="text-xs text-stone-400 mt-0.5">Farm Traceability</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">FOB / CIF</div>
                  <div className="text-xs text-stone-400 mt-0.5">Standard Incoterms</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">NMPT / JNPT</div>
                  <div className="text-xs text-stone-400 mt-0.5">Gateway Ports</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">40ft FCL</div>
                  <div className="text-xs text-stone-400 mt-0.5">Bulk Container Loads</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Export Commodities */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Export-Grade Commodity Portfolios
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              Every lot is optically graded, moisture-verified, and packed according to international maritime phytosanitary requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Fresh Semi-Husked Coconuts */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-5">
                🥥
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Fresh Semi-Husked Coconuts
              </h3>
              <p className="text-xs text-emerald-800 font-semibold mt-1">
                HS Code: 0801.19.10
              </p>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                Grade A mature dehusked coconuts with protective fibrous eye collars. Weight range: 550g - 650g. High water volume and thick endosperm suitable for overseas retail and processing.
              </p>
              <ul className="text-xs text-stone-500 mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                <li>• Packaging: 25-nut / 50-nut PP ventilated mesh bags</li>
                <li>• Container: 40HC Reefer (45,000 - 52,000 nuts)</li>
                <li>• Temperature: Maintained at 10°C - 12°C in transit</li>
              </ul>
            </div>

            {/* 2. GI Tiptur Ball Copra */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-5">
                ✨
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Ball Copra (GI Tiptur Unde Kobbari)
              </h3>
              <p className="text-xs text-amber-800 font-semibold mt-1">
                HS Code: 0801.12.10
              </p>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                Geographical Indication (GI) certified edible whole copra. Attic sun-cured over 11 months with zero sulfur chemicals. Crispy texture, sweet aroma, and 65%+ oil content.
              </p>
              <ul className="text-xs text-stone-500 mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                <li>• Moisture: Equilibrium content &lt; 5.5%</li>
                <li>• Packaging: 15kg / 25kg moisture-barrier corrugated cartons</li>
                <li>• Container: 20ft / 40ft dry container with desiccants</li>
              </ul>
            </div>

            {/* 3. Raw Copra (Milling Grade) */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-5">
                🥥
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Raw Copra (Milling Grade)
              </h3>
              <p className="text-xs text-amber-800 font-semibold mt-1">
                HS Code: 1203.00.00
              </p>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                High-grade sun-dried raw milling copra cups from Tiptur and Mandya drying yards. High oil content (minimum 64%) and low free fatty acid levels, ideal for large-scale industrial vegetable oil expellers and bio-refineries.
              </p>
              <ul className="text-xs text-stone-500 mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                <li>• Oil Yield: 64% - 68% high recovery rate</li>
                <li>• Moisture: Strict industrial threshold &lt; 6.0%</li>
                <li>• Packaging: 50 kg breathable PP gunny bags / 20T bulk FCL</li>
              </ul>
            </div>

            {/* 4. Commercial Arecanut */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl mb-5">
                🪴
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Commercial Arecanut (Adike / Betel Nut)
              </h3>
              <p className="text-xs text-orange-800 font-semibold mt-1">
                HS Code: 0802.80.10
              </p>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                Whole and split Arecanut (Areca catechu) lots sourced directly from Shivamogga, Sagar, and Malnad APMC corridors. Optical sortation available across Rashi, Bette, Gorabal, and Chali grades.
              </p>
              <ul className="text-xs text-stone-500 mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                <li>• Moisture: Strictly verified &lt; 10.0%</li>
                <li>• Packaging: 50 kg / 70 kg double-stitched jute sacks</li>
                <li>• Container: 20ft (18-20 MT) dry maritime containers</li>
              </ul>
            </div>

            {/* 5. Cold-Pressed & Wood-Pressed Oils */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center text-2xl mb-5">
                🌿
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Cold-Pressed Virgin Oils
              </h3>
              <p className="text-xs text-lime-800 font-semibold mt-1">
                HS Code: 1513.11.00
              </p>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                Artisan wood-pressed virgin coconut and groundnut oils extracted below 45°C. Unrefined, unbleached, and naturally settled without chemical filtering agents. High lauric acid and natural tocopherols.
              </p>
              <ul className="text-xs text-stone-500 mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                <li>• Free Fatty Acids (FFA): &lt; 0.5% (cold pressed)</li>
                <li>• Packaging: 1L bottles / 200L steel drums / IBC totes</li>
                <li>• Testing: FSSAI export-compliant fatty acid profile</li>
              </ul>
            </div>

            {/* 6. Refined Copra Oil (RBD) */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl mb-5">
                🫗
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Refined Copra Oil (RBD)
              </h3>
              <p className="text-xs text-yellow-800 font-semibold mt-1">
                HS Code: 1513.19.00
              </p>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                Refined, Bleached & Deodorized (RBD) industrial and culinary copra oil. Conforms to CODEX STAN 210-1999 international standards. Clear, odor-free with high thermal stability for commercial food manufacturing and cosmetics.
              </p>
              <ul className="text-xs text-stone-500 mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                <li>• Free Fatty Acids (FFA): &lt; 0.10% (as lauric acid)</li>
                <li>• Packaging: 200L epoxy-lined steel drums / 21T Flexitanks</li>
                <li>• Quality: Non-hydrogenated, zero trans-fat guarantee</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Global Destination Coverage */}
        <section className="bg-white border-y border-stone-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Active International Trade Corridors
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-2">
                We facilitate export documentation, customs clearance, and port logistics across key consuming markets.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {EXPORT_COUNTRIES.map((country) => (
                <div
                  key={country.code}
                  className="bg-stone-50 border border-stone-200 rounded-2xl p-4 hover:border-emerald-600 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{country.flag}</span>
                    <a
                      href={country.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-xs text-stone-900 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 transition"
                      title={`Learn more about ${country.name} on Wikipedia`}
                    >
                      <span>{country.name}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400 hover:text-emerald-700" />
                    </a>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-700">Port:</span> {country.majorPort}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                    <span className="font-semibold text-stone-700">Demand:</span> {country.popularCommodities}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Assurance & Compliance Dossier */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Export Compliance & Phytosanitary Assurance
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              Every export consignment is backed by verified government-issued certifications and international biosafety documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">Phytosanitary Certificate</h4>
              <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                Issued by Plant Quarantine of India verifying freedom from agricultural pests and fungi before container sealing.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">Fumigation Certificate</h4>
              <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                Standard Methyl Bromide or Phosphine container fumigation conforming to destination country biosafety protocols.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center text-lime-800 mb-4">
                <Anchor className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">Port Logistics Management</h4>
              <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                Direct refrigerated and dry container haulage to New Mangalore Port (NMPT) and JNPT Mumbai.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">Certificate of Origin</h4>
              <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                Legalized COO issued by authorized Indian Chambers of Commerce enabling preferential import tariff clearance.
              </p>
            </div>
          </div>
        </section>

        {/* Export RFQ & Inquiry Section */}
        <section className="bg-stone-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Request an International B2B Export Quotation
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
              Our trade desk provides firm FOB / CIF proforma quotations with laboratory specifications and vessel departure schedules within 24 business hours.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/919008462568?text=Hello%20FreshRoots%20Export%20Desk,%20I%20am%20an%20international%20buyer%20interested%20in%20an%20FCL%20export%20quotation."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-stone-950 font-black text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Export Desk on WhatsApp
              </a>

              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
              >
                Submit Written RFQ Form
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-stone-400 text-xs mt-5">
              Direct Desk: +91 90084 62568 · Email: sales@freshrootsexport.com · Kikkeri, Mandya, Karnataka, India
            </p>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight text-center mb-10">
            Frequently Asked Questions by International Importers
          </h2>

          <div className="space-y-4">
            {EXPORT_FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-5">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  {faq.question}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
