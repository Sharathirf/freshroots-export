import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import CategoryProductGrid from '@/components/CategoryProductGrid';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { getCatalogProductsByCategory } from '@/lib/catalog';
import {
  getSiteUrl,
  getRobotsDirectives,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  generateFAQJsonLd
} from '@/lib/seo';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Agricultural Category | FreshRoots Export',
      description: 'Farm-direct agricultural commodities, GI copra, coconuts, and nursery plants from Karnataka, India.',
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/category/${category.slug}`;

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    keywords: category.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: getRobotsDirectives(true),
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: canonicalUrl,
      siteName: 'FreshRoots Export',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.seoTitle,
      description: category.seoDescription,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const products = getCatalogProductsByCategory(category.id);

  // Structured Data
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/#catalog' },
    { name: category.title, url: `/category/${category.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, siteUrl);

  const itemListJsonLd = generateItemListJsonLd(
    category.title,
    products.map((p) => ({
      name: p.title,
      url: `/products/${p.slug}`,
      image: p.image_url,
      price: Number(p.retail_price_inr),
    })),
    siteUrl
  );

  const faqJsonLd = category.faqs && category.faqs.length > 0
    ? generateFAQJsonLd(category.faqs)
    : null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
              <Link href="/" className="hover:text-stone-900 transition flex items-center gap-1">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <Link href="/#catalog" className="hover:text-stone-900 transition">
                Produce Catalog
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-semibold text-stone-900">{category.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-white border-b border-stone-200 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
                  <span className="text-base">{category.bannerEmoji}</span>
                  <span>Direct APMC Origin Sourced</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                  {category.title}
                </h1>
                <p className="text-lg font-medium text-emerald-800 mt-1">
                  {category.kannadaTitle}
                </p>

                <p className="text-stone-600 text-base sm:text-lg mt-4 leading-relaxed">
                  {category.longDescription}
                </p>

                {/* Mandi & Logistics Badges */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700">
                    <TrendingUp className="w-4 h-4 text-[#3b6d11]" />
                    <span>{category.mandiBenchmarkNote}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-lime-50 border border-lime-200 text-xs font-semibold text-lime-900">
                    <Clock className="w-4 h-4 text-[#3b6d11]" />
                    <span>Dispatch: {category.dispatchLeadTime}</span>
                  </div>
                </div>
              </div>

              {/* Quick Origin Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 md:w-80 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3b6d11]" />
                  Geographic Sourcing
                </h3>
                <p className="text-xs font-bold text-stone-900">
                  {category.originRegion}
                </p>
                <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                  {category.originDetails}
                </p>
                <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className="font-bold text-emerald-800">100% Free All India</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST Rate:</span>
                    <span className="font-semibold text-stone-800">{category.gstRateText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assurance:</span>
                    <span className="font-semibold text-stone-800">Free Spoilage Replacement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                Available Lots & Grades ({products.length})
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Authentic lab-graded lots with direct farm dispatch in 24 hours.
              </p>
            </div>
            <Link
              href="/#catalog"
              className="text-xs font-bold text-[#3b6d11] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Categories
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <p className="text-stone-600 font-semibold text-sm">
                Seasonal lot preparation in progress for this category.
              </p>
              <p className="text-xs text-stone-400 mt-1">
                New farm harvests are uploaded every Monday and Thursday after APMC auctions.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-block bg-[#3b6d11] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#2d5a0b] transition"
              >
                Inquire for Advance Booking
              </Link>
            </div>
          ) : (
            <CategoryProductGrid products={products} />
          )}
        </section>

        {/* Technical Guide Cross-Linking Banner */}
        {category.relatedGuideSlug && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-lime-300 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Agronomy Standards &amp; Buyer Manual</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Commercial Sourcing &amp; Quality Specifications Guide
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Understand moisture thresholds, AGMARK/APMC grading guidelines, packing protocols, and laboratory test parameters before placing bulk consignments.
                </p>
              </div>
              <Link
                href={`/guides/${category.relatedGuideSlug}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-stone-950 font-extrabold text-xs sm:text-sm transition shadow shrink-0"
              >
                <span>Read Technical Guide</span>
                <ChevronRight className="w-4 h-4 text-stone-950" />
              </Link>
            </div>
          </section>
        )}

        {/* Category Educational FAQ Section */}
        {category.faqs && category.faqs.length > 0 && (
          <section className="bg-white border-t border-stone-200 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                  <HelpCircle className="w-3.5 h-3.5 text-[#3b6d11]" />
                  <span>Commercial &amp; Quality FAQs</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Frequently Asked Questions on {category.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Key answers regarding farm harvest, quality grading, door delivery, and tax compliance.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {category.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2 hover:border-emerald-600/40 transition"
                  >
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 flex items-start gap-2">
                      <span className="text-[#3b6d11] font-mono font-bold">Q{idx + 1}.</span>
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Navigation Strip */}
        <section className="bg-stone-100 border-t border-stone-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-500 mb-4">
              Explore Other Farm Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {CATEGORIES.filter((c) => c.slug !== category.slug).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="bg-white border border-stone-200 hover:border-emerald-600 p-3.5 rounded-xl text-center group transition shadow-sm hover:shadow"
                >
                  <span className="text-2xl block mb-1">{cat.bannerEmoji}</span>
                  <span className="text-xs font-bold text-stone-800 group-hover:text-emerald-800 line-clamp-1">
                    {cat.title}
                  </span>
                  <span className="text-[10px] text-stone-400 block line-clamp-1 mt-0.5">
                    {cat.kannadaTitle}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white border-t border-stone-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#1e824c]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Direct APMC Origin</div>
                  <div className="text-[11px] text-stone-500">Zero intermediate brokers</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#3b6d11]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">100% Free Delivery</div>
                  <div className="text-[11px] text-stone-500">Doorstep delivery across India</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Spoilage Replacement</div>
                  <div className="text-[11px] text-stone-500">100% transit damage guarantee</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#1e824c]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">24-Hr Farm Dispatch</div>
                  <div className="text-[11px] text-stone-500">Packed fresh upon order</div>
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
