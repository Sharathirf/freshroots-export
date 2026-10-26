import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { 
  Truck, ShieldCheck, Phone, ArrowRight, 
  Package, AlertTriangle, FileText, Scale 
} from 'lucide-react';
import ShippingRateCalculator from '@/components/ShippingRateCalculator';
import GlobalExportCorridors from '@/components/GlobalExportCorridors';
import { getSiteUrl, getRobotsDirectives } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Agricultural Freight Rates & Pan-India Transportation | FreshRoots Export',
  description: 'Direct farm-gate dispatch from Mandya & Tiptur corridors. Dedicated 10T, 25T, 30T multi-axle truckloads, export ocean container stuffing, and free retail doorstep shipping across India.',
  alternates: {
    canonical: `${getSiteUrl()}/transportation`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'Agricultural Freight Rates & Pan-India Transportation | FreshRoots Export',
    description: 'Farm-direct agricultural dispatch: 10T, 25T, 30T multi-axle lorries, ocean containers to 12 export destinations, and transparent weighbridge verification.',
    url: `${getSiteUrl()}/transportation`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agricultural Freight & Consignment Logistics | FreshRoots Export',
    description: 'Dedicated 10T to 30T multi-axle agricultural freight across India and international container corridors.',
  },
};

export default function TransportationPage() {
  const siteUrl = getSiteUrl();

  const transportationServiceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/transportation#service`,
    name: 'Pan-India Agricultural Freight and Consignment Dispatch',
    provider: {
      '@type': 'Organization',
      name: 'FreshRoots Export',
      url: siteUrl,
    },
    serviceType: 'Agricultural Logistics and Heavy Cargo Transport',
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'Vietnam' },
      { '@type': 'Country', name: 'Bangladesh' },
      { '@type': 'Country', name: 'United Arab Emirates' },
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
    ],
    description: 'Direct farm-gate transportation offering dedicated 10-tonne, 25-tonne, and 30-tonne FTL truckloads, computer weighbridge slips, GPS dispatch tracking, and international export container stuffing.',
  };

  const truckloadSpecs = [
    {
      capacity: '10 Tonne (6-Wheeler)',
      model: 'Eicher Pro / Tata 1109 Heavy Cargo',
      payload: '10,000 kg Payload',
      coconuts: '15,000 Mature Coconuts or 7,000 Tender Coconuts',
      copra: '650 Cartons (15 kg boxes)',
      plants: '2,500 Coconut / Arecanut Saplings',
      corridors: 'Karnataka, Tamil Nadu, Kerala, Andhra Pradesh & Telangana',
      transit: '1 - 2 Business Days'
    },
    {
      capacity: '25 Tonne (10-Wheeler)',
      model: 'Ashok Leyland / Tata Taurus Heavy Hauler',
      payload: '25,000 kg Payload',
      coconuts: '35,000 Mature Coconuts or 16,000 Tender Coconuts',
      copra: '1,600 Cartons (15 kg boxes)',
      plants: '6,000 Seedlings with Soil Bags',
      corridors: 'Maharashtra (Mumbai/Pune), Gujarat, Madhya Pradesh & Goa',
      transit: '2 - 3 Business Days'
    },
    {
      capacity: '30 Tonne (12-14 Wheeler)',
      model: 'BharatBenz / Tata Multi-Axle Long Haul',
      payload: '30,000 kg Payload',
      coconuts: '45,000 Mature Coconuts or 22,000 Tender Coconuts',
      copra: '2,000 Cartons (15 kg boxes)',
      plants: '8,000+ Hardy Nursery Seedlings',
      corridors: 'Delhi NCR, Punjab, Haryana, Rajasthan, Uttar Pradesh & East India',
      transit: '3 - 5 Business Days'
    }
  ];

  return (
    <div className="bg-[#fcfbf7] min-h-screen text-stone-900 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(transportationServiceJsonLd) }}
      />
      <Navbar />
      <CartDrawer />

      <main className="flex-1 pb-16">
        {/* 1. Header / Hero Banner */}
        <section className="bg-gradient-to-b from-[#1c3809] to-[#254b0d] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2d5a0b]">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-lime-400/20 border border-lime-400/40 text-lime-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Truck className="w-4 h-4 text-lime-400" />
              <span>Pan-India Agricultural Logistics & Freight Hub</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Transportation &amp; Freight Rates
              </h1>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Direct dispatch from certified farm-gate plantations. From express retail parcels via Shiprocket to dedicated 30-tonne multi-axle lorries across North and Central India.
              </p>
            </div>

            {/* Core Industry Policy Alert & Threshold Free Shipping Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-stone-200 flex items-start gap-3.5 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-white block font-bold">
                    Agricultural Freight Transparency Policy (Transportation Charged Extra):
                  </strong>
                  <p className="text-stone-300 leading-relaxed text-xs">
                    In strict adherence to agricultural mandi standards (such as <em>coconutseller.in/transportation</em>), <strong>transportation is charged extra at 100% actuals</strong>. Heavy agricultural produce is never marked up with hidden shipping margins; buyers pay only genuine transporter freight rates.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/60 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-emerald-100 flex items-start gap-3.5 shadow-lg">
                <ShieldCheck className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-lime-300 block font-bold">
                    100% Free Doorstep Delivery on ALL Orders:
                  </strong>
                  <p className="text-emerald-200/90 leading-relaxed text-xs">
                    Enjoy <strong>100% FREE Farm-Gate Delivery</strong> across all 19,000+ Indian postal PIN codes! There is <strong>no minimum quantity</strong> requirement. All shipping and logistics expenses are absorbed directly into our competitive, farm-direct selling prices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Shiprocket Shipping Rate Calculator */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <ShippingRateCalculator compact={false} />
        </section>

        {/* 3. Full Truckload (FTL) Fleet Specifications (10T, 25T, 30T) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[#3b6d11] font-bold text-xs uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Heavy Commercial Freight (Full Truckloads)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Fleet Capacities &amp; Direct Mandi Corridors
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm max-w-2xl">
              For wholesale consignments, industrial copra shipments, and tender coconut consignments across India, we arrange certified commercial transport from farm loading yards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {truckloadSpecs.map((truck, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3b6d11] uppercase tracking-wider bg-lime-50 border border-lime-200 px-3 py-1 rounded-full">
                      {truck.payload}
                    </span>
                    <Truck className="w-5 h-5 text-stone-400" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-stone-900">{truck.capacity}</h3>
                    <div className="text-xs text-stone-500 font-medium mt-0.5">{truck.model}</div>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-700 pt-2 border-t border-stone-100">
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 font-bold">🥥 Coconuts:</span>
                      <span className="font-semibold text-stone-900">{truck.coconuts}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 font-bold">📦 Ball Copra:</span>
                      <span className="font-semibold text-stone-900">{truck.copra}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 font-bold">🌱 Nursery Saplings:</span>
                      <span className="font-semibold text-stone-900">{truck.plants}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 font-bold">🛣️ Corridors:</span>
                      <span className="font-medium text-stone-800">{truck.corridors}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 font-bold">⏱️ Transit Time:</span>
                      <span className="font-bold text-[#3b6d11]">{truck.transit}</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://wa.me/919591142548?text=Hello%20Sharath,%20I%20need%20a%20full%20truckload%20transport%20quote%20for%20my%20consignment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 text-center bg-stone-100 hover:bg-[#3b6d11] hover:text-white text-stone-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>Book Dedicated Truckload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Booking Procedure & Weighbridge Standard */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="bg-gradient-to-br from-stone-900 to-[#15250a] text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-xl">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Standard Operating Procedure</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Dispatch Verification &amp; Safety Standards
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm">
                We eliminate consignment disputes and transit loss through strict digital weighbridge protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Computer Weighbridge Slip</h4>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Gross and tare vehicle weight verified at licensed computer weighbridges before departure.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Lorry Receipt (LR) &amp; e-Way Bill</h4>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Official transporter Bilty/LR issued along with valid GST e-Way bills compliant with inter-state transport rules.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Direct Driver Contact &amp; GPS</h4>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Driver name, mobile number, vehicle number, and live tracking location sent directly to the buyer via WhatsApp.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Transit Damage Protection</h4>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Ventilated export bags, heavy corrugated master boxes for copra, and wet root-ball potting for living nursery plants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Global Ocean Container Export Corridors */}
        <GlobalExportCorridors />

        {/* 6. Contact & WhatsApp Logistics Desk */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="bg-lime-50/70 border border-lime-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-[#3b6d11] uppercase tracking-wider">
                Need Custom Logistics Planning?
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                Speak to our Dispatch Manager
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm">
                Get route feasibility, backhaul truck discounts, or container stuffing estimates for export ports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919591142548?text=Hello%20Sharath,%20I%20have%20a%20transportation%20query%20for%20my%20agricultural%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#3b6d11] hover:bg-[#2d5a0b] text-white px-5 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4 text-lime-300" />
                <span>WhatsApp Logistics: +91 95911 42548</span>
              </a>
              <Link
                href="/#catalog"
                className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 px-5 py-3 rounded-2xl text-xs font-bold transition"
              >
                View Catalog
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
