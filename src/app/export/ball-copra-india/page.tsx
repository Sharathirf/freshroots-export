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
} from '@/lib/seo';
import {
  Ship,
  FileCheck2,
  Award,
  ChevronRight,
  Anchor,
} from 'lucide-react';
import ExportRfqButton from '@/components/ExportRfqButton';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'GI Tiptur Ball Copra Exporter India | 15kg Box Container FCL',
  description:
    'Leading Indian exporter of GI-certified Tiptur Ball Copra (Whole Unde Kobbari, HS 1203.00.00). Moisture ≤5.5%, oil content 65-68%, FFA <1.5%. 20ft & 40ft FCL container loads from JNPT & Mangalore ports. Request FOB/CIF quote.',
  keywords: [
    'ball copra exporter india',
    'tiptur ball copra wholesale supplier',
    'buy ball copra in container loads',
    'indian copra supplier hs code 1203',
    'whole unde kobbari export',
    'tiptur copra exporter karnataka',
    'fcl copra container jnpt',
    'phytosanitary certificate copra india',
    'edible dry coconut exporter',
  ],
  alternates: {
    canonical: `${siteUrl}/export/ball-copra-india`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'GI Tiptur Ball Copra Exporter India | FreshRoots Export',
    description:
      'Direct farm-origin GI Tiptur Ball Copra container export from Karnataka, India. Calibrated moisture ≤5.5%, oil content 65-68%. FOB/CIF shipping to UAE, Vietnam, Nepal, Bangladesh, and worldwide.',
    url: `${siteUrl}/export/ball-copra-india`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/products/ball-copra-4k.jpg`,
        width: 3840,
        height: 2560,
        alt: 'GI Tiptur Ball Copra Export Grade',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GI Tiptur Ball Copra Exporter India | FreshRoots Export',
    description:
      'Direct farm-origin GI Tiptur Ball Copra container export from Karnataka. Moisture ≤5.5%, oil 65-68%. FOB/CIF JNPT.',
    images: [`${siteUrl}/products/ball-copra-4k.jpg`],
  },
};

const BALL_COPRA_SPECS = [
  { parameter: 'Botanical Name', standard: 'Cocos nucifera (Whole dried kernel)', method: 'Species Verification' },
  { parameter: 'Harmonized System (HS) Code', standard: '1203.00.00 (Copra) / 0801.12.10 (Edible Copra)', method: 'WCO Customs Standard' },
  { parameter: 'Geographical Indication (GI)', standard: 'Registered GI: Tiptur Ball Copra (Karnataka, India)', method: 'GI Registry Certification' },
  { parameter: 'Moisture Content', standard: 'Max 5.0% to 5.5% (Strictly Calibrated)', method: 'ISO 665 / Digital Probe' },
  { parameter: 'Oil Content (Dry Basis)', standard: '65.0% to 68.5% (High Recovery Yield)', method: 'Soxhlet Solvent Extraction' },
  { parameter: 'Free Fatty Acids (FFA)', standard: 'Less than 1.0% to 1.5% (Zero Rancidity)', method: 'Titrimetric Analysis as Lauric' },
  { parameter: 'Kernel Color & Exterior', standard: 'Smooth, unbroken spherical sphere, light to rich golden amber', method: 'Visual Optical Sorting' },
  { parameter: 'Aflatoxin & Fungal Contamination', standard: 'Negative / Below Detectable Limits (<4 ppb)', method: 'HPLC Test Protocol' },
  { parameter: 'Packaging Format', standard: '15 kg 5-ply Corrugated Master Cartons / 25 kg PP Mesh Sacks', method: 'Export Ventilated Liner' },
  { parameter: '20ft FCL Container Capacity', standard: '11.0 to 11.5 Metric Tonnes (~733 master cartons)', method: 'Floor-loaded / Slip-sheet' },
  { parameter: '40ft HC FCL Container Capacity', standard: '23.5 to 24.0 Metric Tonnes (~1,566 master cartons)', method: 'High-cube ocean stuffing' },
  { parameter: 'Export Departure Sea Ports', standard: 'JNPT / Nhava Sheva (Mumbai) & NMPT (Mangalore)', method: 'Indian Customs Siding' },
  { parameter: 'Statutory Documentation', standard: 'Phytosanitary Cert, Certificate of Origin, CDB RCMC, FSSAI', method: 'Government of India' },
];

const BALL_COPRA_FAQS = [
  {
    question: 'What makes GI Tiptur Ball Copra superior to ordinary milling copra?',
    answer:
      'Tiptur Ball Copra is a natural sun-cured, slow-matured whole coconut kernel, harvested only from mature Karnataka tall palms. Unlike fire-dried milling copra, it is dried inside the intact shell for 9 to 11 months without direct flame or sulphur chemical bleaching, resulting in an exceptionally clean white meat, sweetness, high oil content (65-68%), and low moisture (≤5.5%).',
  },
  {
    question: 'What is the container loading capacity for a 20ft and 40ft container?',
    answer:
      'A standard 20ft general ocean container accommodates approximately 11.0 to 11.5 Metric Tonnes (approx. 730 to 750 master cartons of 15 kg each). A 40ft High Cube (HC) container accommodates 23.5 to 24.0 Metric Tonnes (approx. 1,560 to 1,600 master cartons).',
  },
  {
    question: 'How do you prevent mold and moisture damage during tropical ocean transit?',
    answer:
      'We pack whole copra in heavy-duty 5-ply export-grade corrugated carton boxes with ventilation ports and desiccated silica pouches, lined with moisture-barrier kraft paper. Consignments are packed within 48 hours of lot moisture testing at our Tiptur grading siding and sealed in dry container liners.',
  },
  {
    question: 'What are the accepted international payment terms and Incoterms?',
    answer:
      'We quote FOB JNPT (Mumbai), FOB NMPT (Mangalore), CFR, and CIF to major destination ports (Jebel Ali, Cat Lai, Chittagong, Dammam, Birgunj). Payment is accepted via 100% Irrevocable Letter of Credit (L/C at sight) from prime international banks or advance telegraphic transfer (T/T).',
  },
  {
    question: 'What export certificates accompany every FreshRoots consignment?',
    answer:
      'Every shipment includes: 1) Official Phytosanitary Certificate from the Directorate of Plant Protection, Quarantine & Storage, 2) Certificate of Origin issued by the Chamber of Commerce, 3) Commercial Invoice & Detailed Packing List, 4) Certified APMC Weighbridge Slip, 5) Coconut Development Board (CDB) RCMC, and 6) Bill of Lading (B/L).',
  },
];

export default function BallCopraExportPillarPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    [
      { name: 'Home', url: '/' },
      { name: 'Export Desk', url: '/export' },
      { name: 'GI Tiptur Ball Copra (HS 1203)', url: '/export/ball-copra-india' },
    ],
    siteUrl
  );

  const faqJsonLd = generateFAQJsonLd(BALL_COPRA_FAQS);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/export/ball-copra-india#product`,
    name: 'GI Tiptur Ball Copra (Whole Unde Kobbari) Export Lot',
    image: [`${siteUrl}/products/ball-copra-4k.jpg`, `${siteUrl}/products/tiptur-ball-copra.jpg`],
    description:
      'Export-grade GI Tiptur Whole Ball Copra. Moisture ≤5.5%, oil content 65-68%, FFA <1.5%. Available in 15kg master corrugated cartons or 25kg PP mesh bags for FCL container dispatch from JNPT/NMPT.',
    sku: 'COP-BAL-BOX-15K',
    mpn: 'COP-BAL-BOX-15K',
    gtin: '0008011210',
    category: 'Agricultural Commodities > Copra',
    brand: {
      '@type': 'Brand',
      name: 'FreshRoots Export',
      url: siteUrl,
    },
    countryOfOrigin: {
      '@type': 'Country',
      name: 'India',
    },
    additionalProperty: BALL_COPRA_SPECS.map((s) => ({
      '@type': 'PropertyValue',
      name: s.parameter,
      value: s.standard,
    })),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/export/ball-copra-india`,
      priceCurrency: 'INR',
      price: '5508',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@id': `${siteUrl}/#organization`,
      },
    },
  };

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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="flex-1 space-y-12 sm:space-y-16 pb-16">
        {/* Breadcrumb Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-emerald-700 transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link href="/export" className="hover:text-emerald-700 transition">Global Export Desk</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-medium">GI Tiptur Ball Copra (HS 1203)</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-stone-800 shadow-xl overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Geographical Indication (GI) Certified • Karnataka Origin</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  GI Tiptur Ball Copra Exporter from Karnataka, India
                </h1>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  Direct farm-gate aggregator and licensed exporter of premium whole Ball Copra (Unde Kobbari, HS Code 1203.00.00). Sourced from certified grower groves in Tiptur and Tumakuru, rigorously calibrated to ≤5.5% moisture and 65–68% oil content for 20ft/40ft ocean container loads.
                </p>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Moisture</span>
                    <strong className="text-emerald-400 text-base font-mono">≤ 5.5% Max</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Oil Content</span>
                    <strong className="text-lime-400 text-base font-mono">65% – 68%</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">20ft FCL</span>
                    <strong className="text-amber-400 text-base font-mono">11.0 MT</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Dispatch Port</span>
                    <strong className="text-white text-base font-mono">JNPT / NMPT</strong>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-3">
                  <ExportRfqButton
                    label="Request FOB / CIF Container Quote"
                    defaultProduct="Ball Copra"
                    className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2"
                  />
                  <a
                    href="https://wa.me/919008462568?text=Hello%20FreshRoots%20Export,%20I%20am%20interested%20in%20importing%20Tiptur%20Ball%20Copra%20container%20lots."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition flex items-center gap-2"
                  >
                    <span>WhatsApp Commercial Desk</span>
                    <span className="text-emerald-400">→</span>
                  </a>
                </div>
              </div>

              {/* Product Visual */}
              <div className="lg:col-span-5 relative">
                <div className="aspect-4/3 rounded-2xl overflow-hidden border border-white/10 bg-stone-800 shadow-2xl relative">
                  <img
                    src="/products/ball-copra-4k.jpg"
                    alt="Authentic GI Tiptur Ball Copra Whole Unde Kobbari Export Lot"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-stone-900/85 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-stone-300 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-mono text-xs">Standard Export Pack</strong>
                      <span>15 kg Master Corrugated Carton</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                      Agmark Grade 1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specification Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 font-mono">
              Laboratory &amp; Trade Parameters
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Physical &amp; Chemical Laboratory Specifications (AEO / GEO Sheet)
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Standardized parameters for food processing, direct retail consumption, and cold expeller oil extraction.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Specification Parameter</th>
                  <th className="p-4">Guaranteed Export Standard</th>
                  <th className="p-4">Test Protocol / Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {BALL_COPRA_SPECS.map((spec, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'}>
                    <td className="p-4 font-bold text-stone-900">{spec.parameter}</td>
                    <td className="p-4 font-mono font-medium text-emerald-900">{spec.standard}</td>
                    <td className="p-4 text-stone-500">{spec.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Container Loading & Logistics Siding */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <Ship className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                20ft &amp; 40ft FCL Container Stuffing
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                20ft FCL holds ~11.0 Metric Tonnes (733 boxes of 15 kg). 40ft High Cube FCL holds ~23.5 Metric Tonnes (1,566 boxes). Palletized on request with corner boards and sea-worthy stretch wrapping.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Anchor className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                Port Routing &amp; Transit Timelines
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Direct road transport from Tiptur APMC siding to JNPT (Mumbai, 24h road transit) or NMPT (Mangalore, 8h road transit). Average sea transit: Jebel Ali (4-6d), Cat Lai (10-12d), Chittagong (4-5d).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                100% Export Documentation Docket
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Complete compliance pack: Phytosanitary Certificate, Non-Preferential COO, FSSAI Export License, APMC Weighbridge Slip, Bill of Lading, and Coconut Development Board (CDB) registration.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Frequently Asked Sourcing &amp; Export Questions
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Everything international trade buyers need to know regarding contracts, quality assurance, and incoterms.
            </p>
          </div>

          <div className="space-y-4">
            {BALL_COPRA_FAQS.map((faq, idx) => (
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

        {/* Commercial Callout Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-850 via-emerald-800 to-emerald-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready to Initiate Container Procurement?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                Contact our commercial export desk for current FOB JNPT and CIF discharge port quotes with confirmed harvest moisture logs.
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap gap-3">
              <ExportRfqButton
                label="Submit Commercial RFQ"
                defaultProduct="Ball Copra"
                className="px-6 py-3.5 rounded-xl bg-white text-emerald-900 font-black text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition"
              />
              <Link
                href="/wholesale/mandi-rates"
                className="px-6 py-3.5 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-white font-bold text-xs sm:text-sm hover:bg-emerald-950/60 transition"
              >
                Track Live Mandi Rates
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
