import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { EDUCATIONAL_GUIDES } from '@/lib/guides';
import { getSiteUrl, getRobotsDirectives, generateBreadcrumbJsonLd } from '@/lib/seo';
import {
  BookOpen,
  Clock,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agricultural Guides & Quality Standards | FreshRoots Export',
  description: 'Technical agricultural guides on GI Tiptur copra grading, coconut wholesale sourcing, wood-pressed oil purity, and nursery sapling cultivation from Karnataka, India.',
  keywords: [
    'Tiptur copra grading guide',
    'coconut sourcing India',
    'cold pressed oil purity test',
    'coconut sapling nursery Karnataka',
    'agricultural export documentation India'
  ],
  alternates: {
    canonical: `${getSiteUrl()}/guides`,
  },
  robots: getRobotsDirectives(true),
  openGraph: {
    title: 'Agricultural Guides & Sourcing Handbooks | FreshRoots Export',
    description: 'Practical guides on copra grading, farm-gate coconut procurement, oil authenticity testing, and export protocols.',
    url: `${getSiteUrl()}/guides`,
    siteName: 'FreshRoots Export',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function GuidesPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Guides & Quality Standards', url: '/guides' },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, siteUrl);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
              <span className="font-semibold text-stone-900">Guides & Quality Standards</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-white border-b border-stone-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
                <BookOpen className="w-3.5 h-3.5 text-[#3b6d11]" />
                <span>Agronomy Knowledge Base · Open Access</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                Agricultural Guides & Quality Standards
              </h1>

              <p className="text-stone-600 text-base sm:text-lg mt-4 leading-relaxed">
                Objective, laboratory-backed technical handbooks for bulk agricultural buyers, retail consumers, food processors, and international importers. Written by our origin agronomy team in Kikkeri, Mandya.
              </p>
            </div>
          </div>
        </section>

        {/* Guides List */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EDUCATIONAL_GUIDES.map((guide) => (
              <article
                key={guide.slug}
                className="bg-white border border-stone-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-emerald-600 transition group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-bold uppercase tracking-wider text-[10px] text-stone-700">
                      {guide.category.replace(/-/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {guide.readingTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-lg font-black text-stone-900 group-hover:text-emerald-800 transition line-clamp-2 leading-snug">
                    <Link href={`/guides/${guide.slug}`}>
                      {guide.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed line-clamp-3">
                    {guide.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    Updated Oct 2026
                  </span>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3b6d11] group-hover:underline"
                  >
                    Read Guide
                    <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-stone-100 border-t border-stone-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-200">
                <CheckCircle2 className="w-5 h-5 text-[#1e824c] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-stone-900 block">Verified APMC Data</span>
                  <span className="text-stone-500">Based on real Karnataka mandi yard standards</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-200">
                <ShieldCheck className="w-5 h-5 text-[#3b6d11] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-stone-900 block">FSSAI & AGMARK Aligned</span>
                  <span className="text-stone-500">Conforming to official food safety tolerances</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-200">
                <FileText className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-stone-900 block">Zero Promotional Fluff</span>
                  <span className="text-stone-500">Written for buyers and growers without sponsored bias</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
