import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import {
  Sprout,
  Truck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  TreePine,
  Factory
} from 'lucide-react';
import { getSiteUrl, getRobotsDirectives, generateBreadcrumbJsonLd } from '@/lib/seo';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'About FreshRoots Export | Karnataka Farm Origin & Agro-Export Infrastructure',
  description:
    'Discover the origin, aggregation hubs, and farmers behind FreshRoots Export. Direct-from-origin sourcing of GI Tiptur Ball Copra, Mandya mature coconuts, and cold-pressed oils from Karnataka, India.',
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'About FreshRoots Export | Origin-Direct Karnataka Agricultural Commerce',
    description:
      'Learn about our Kikkeri farm hub, grower aggregation network in Tiptur and Shivamogga, and international ocean container export infrastructure.',
    url: `${siteUrl}/about`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About FreshRoots Export | Direct Agricultural Trade',
    description: 'Farm-direct coconuts, GI ball copra, and cold-pressed oils from Mandya and Tiptur, Karnataka.',
  },
};

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'About Farm Hub', url: '/about' }
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, siteUrl);

  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${siteUrl}/about#webpage`,
    url: `${siteUrl}/about`,
    name: 'About FreshRoots Export',
    description:
      'Origin-direct agricultural commerce platform connecting Karnataka coconut producers and spice farmers directly with consumers and global bulk buyers.',
    mainEntity: {
      '@type': 'Organization',
      name: 'FreshRoots Export',
      legalName: 'FreshRoots Export Agri-Commerce',
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      founder: {
        '@type': 'Person',
        name: 'Sharath Inorahalli',
        jobTitle: 'Founder & Operations Lead'
      },
      foundingLocation: {
        '@type': 'Place',
        name: 'Kikkeri, Mandya District, Karnataka, India'
      },
      hasCredential: [
        {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'Food Safety License',
          recognizedBy: {
            '@type': 'Organization',
            name: 'Food Safety and Standards Authority of India (FSSAI)'
          },
          validIn: {
            '@type': 'AdministrativeArea',
            name: 'India'
          }
        },
        {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'Importer Exporter Code (IEC)',
          recognizedBy: {
            '@type': 'Organization',
            name: 'Directorate General of Foreign Trade (DGFT)'
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <Navbar />
      <CartDrawer />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-16">
        {/* 1. Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>Farm Provenance &amp; Agro-Trade Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Direct-From-Origin Karnataka Produce for India and the World
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            FreshRoots Export was founded to bridge the gap between traditional coconut and spice growers in Karnataka and modern households, commercial food processors, and international importers. By operating direct farm-gate collection yards in <strong className="text-stone-900">Mandya, Tiptur, and Shivamogga</strong>, we eliminate intermediary commission brokers, ensuring fair remuneration for farmers and guaranteed farm-fresh quality for buyers.
          </p>
        </section>

        {/* 2. Key Pillars Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
              <TreePine className="w-6 h-6 text-emerald-700" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">1. Certified Farm Aggregation</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our aggregation yards are located directly in the heart of Karnataka&apos;s agricultural basins. We procure Kaveri canal-fed mature coconuts in Mandya, GI-certified Ball Copra from Tumakuru-Tiptur grower groves, and APMC-benchmarked arecanut from Shivamogga.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
              <Factory className="w-6 h-6 text-amber-700" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">2. Lab-Tested Quality Sorting</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every lot undergoes standardized weight grading and moisture testing. Our GI Tiptur Ball Copra is tested to ≤5.5% moisture with 65–68% natural oil content and zero chemical bleaching. Mature coconuts are calibrated to 550g–650g kernel weight with thick sweet meat.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl">
              <Truck className="w-6 h-6 text-blue-700" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">3. Express Pan-India &amp; Global FCL</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We operate a dual fulfillment network: retail home pantry orders are dispatched within 24 hours with 100% Free Doorstep Delivery across India, while commercial bulk lots are loaded into Canter trucks or 20ft/40ft ocean containers for export to 15+ destination nations.
            </p>
          </div>
        </section>

        {/* 3. Operational Hub & Farmland Coordinates */}
        <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
                Operational Base
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
                Kikkeri Farm Hub &amp; Dispatch Siding
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 text-stone-800 font-mono text-xs font-bold border border-stone-200">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>12.8344° N, 76.4022° E (Mandya District)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-stone-700">
            <div className="space-y-4 leading-relaxed">
              <p>
                Our primary dispatch facility is situated in <strong>Kikkeri, K.R. Pet Taluk, Mandya District, Karnataka – 571423</strong>. Situated adjacent to perennial irrigation canals fed by the Kaveri basin, our region produces some of India&apos;s densest mature coconuts, characterized by thick white kernels, sweet high-volume water, and extended natural shelf life.
              </p>
              <p>
                For our copra commodities, our aggregation desk connects directly with family-owned coconut groves across Tiptur, Nonavinakere, and Turuvekere in Tumakuru district, the global epicenter of Geographical Indication (GI) Ball Copra.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Key Infrastructure Highlights</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Certified Weighbridges:</strong> Accurate tare and gross calibration on every shipment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Covered Storage Yards:</strong> Ventilated warehouses protecting copra from ambient humidity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Wooden Expeller Ghani:</strong> Traditional cold-pressed Marachekku oil extraction below 45°C.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Port Proximity:</strong> Express container transit via NH-75 to JNPT (Mumbai) and Chennai Sea Port.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Statutory Export & Quality Credentials */}
        <section className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Institutional Trade Compliance
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Fully Licensed for Domestic Commerce &amp; Global Ocean Export
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              FreshRoots Export operates with complete regulatory transparency under the statutory oversight of the Government of India, the Food Safety and Standards Authority of India (FSSAI), and the Directorate General of Foreign Trade (DGFT).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                Food Safety Authority
              </span>
              <div className="text-base font-bold font-mono text-white">FSSAI: 21224195000438</div>
              <p className="text-[11px] text-stone-400">Wholesale distribution, repacking &amp; cold-pressed oils</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-lime-500/30 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-lime-400 font-bold">
                Foreign Trade Directorate
              </span>
              <div className="text-base font-bold font-mono text-white">DGFT IEC: 0724018925</div>
              <p className="text-[11px] text-stone-400">Authorized importer &amp; exporter of agricultural produce</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/30 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                Export Promotion Councils
              </span>
              <div className="text-base font-bold text-white">APEDA &amp; CDB Aligned</div>
              <p className="text-[11px] text-stone-400">Phytosanitary inspection &amp; container fumigation compliant</p>
            </div>
          </div>
        </section>

        {/* 5. Dual Action CTAs */}
        <section className="bg-stone-100 rounded-3xl border border-stone-200/80 p-8 sm:p-10 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Partner with FreshRoots Export Today
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto">
            Whether you need a 25-piece bag of fresh coconuts for your home or 50 metric tons of GI Tiptur Ball Copra in 40ft ocean containers, our direct-from-origin supply chain delivers excellence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/#catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3b6d11] hover:bg-[#2e550d] text-white text-xs sm:text-sm font-bold shadow-sm transition"
            >
              <span>Explore Retail Produce</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/rfq"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold shadow-sm transition"
            >
              <span>Request Wholesale / Export Quote</span>
              <span className="text-amber-400 font-mono">→</span>
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <span>Contact Operations Desk</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
