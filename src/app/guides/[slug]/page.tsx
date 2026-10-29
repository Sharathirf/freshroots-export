import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { EDUCATIONAL_GUIDES, getGuideBySlug } from '@/lib/guides';
import {
  getSiteUrl,
  getRobotsDirectives,
  generateBreadcrumbJsonLd,
  generateArticleJsonLd,
  generateFAQJsonLd
} from '@/lib/seo';
import {
  Clock,
  Calendar,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return EDUCATIONAL_GUIDES.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: 'Agricultural Guide | FreshRoots Export',
      description: 'Educational handbooks and agricultural standards from Karnataka, India.',
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/guides/${guide.slug}`;

  return {
    title: `${guide.seoTitle} | FreshRoots Export`,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: getRobotsDirectives(true),
    openGraph: {
      title: guide.seoTitle,
      description: guide.metaDescription,
      url: canonicalUrl,
      siteName: 'FreshRoots Export',
      locale: 'en_IN',
      type: 'article',
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      authors: ['FreshRoots Export Agronomy Desk'],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle,
      description: guide.metaDescription,
    },
  };
}

export default async function GuideArticlePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const siteUrl = getSiteUrl();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Guides & Standards', url: '/guides' },
    { name: guide.title, url: `/guides/${guide.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, siteUrl);

  const articleJsonLd = generateArticleJsonLd(
    {
      title: guide.title,
      description: guide.metaDescription,
      slug: guide.slug,
      publishedAt: guide.publishedAt,
      updatedAt: guide.updatedAt,
      authorName: 'FreshRoots Agronomy Research Desk',
    },
    siteUrl
  );

  const faqJsonLd = guide.faq && guide.faq.length > 0 ? generateFAQJsonLd(guide.faq) : null;

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-stone-900 font-sans flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Navbar />
      <CartDrawer />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="bg-stone-100 border-b border-stone-200 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-stone-600">
            <Link href="/" className="hover:text-emerald-800 transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link href="/guides" className="hover:text-emerald-800 transition">Guides &amp; Standards</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-semibold truncate max-w-xs sm:max-w-md">{guide.title}</span>
          </div>
        </nav>

        {/* Article Header */}
        <header className="bg-white border-b border-stone-200 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3b6d11] bg-lime-50 border border-lime-200 px-3 py-1 rounded-full">
                {guide.category.replace(/-/g, ' ')}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{guide.readingTimeMinutes} min read</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated {new Date(guide.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              {guide.title}
            </h1>

            <div className="p-4 sm:p-5 bg-lime-50/70 border border-lime-200 rounded-2xl text-stone-700 text-sm sm:text-base leading-relaxed">
              <strong className="text-stone-900 font-bold block mb-1">Executive Summary:</strong>
              {guide.summary}
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <div className="space-y-8">
            {guide.content.map((sec, idx) => (
              <section key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight border-b border-stone-100 pb-3">
                  {sec.heading}
                </h2>
                <div className="space-y-3 text-stone-700 text-sm sm:text-base leading-relaxed">
                  {sec.body.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Frequently Asked Questions (FAQ) Section with Schema */}
          {guide.faq && guide.faq.length > 0 && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3b6d11] uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Expert Answers for Commercial Buyers
                </h2>
              </div>

              <div className="space-y-4">
                {guide.faq.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-2">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                      {item.question}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Product Procurement Links */}
          <section className="bg-gradient-to-br from-[#1c3809] to-[#254b0d] text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
            <div className="space-y-2">
              <span className="text-lime-300 text-xs font-bold uppercase tracking-wider">
                Direct Farm Sourcing
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Procure Certified Commodities Directly from the Source
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
                Ready to secure consignments? Connect directly with our Mandya farm-gate desk for verified lab reports, weighbridge slips, and 100% Free Doorstep Delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/919008462568?text=Hello%20Sharath,%20I%20read%20your%20guide%20on%20${encodeURIComponent(guide.title)}%20and%20want%20to%20inquire%20about%20a%20consignment.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-lime-400 hover:bg-lime-300 text-stone-950 font-black text-xs px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discuss with Dispatch Desk</span>
              </a>

              <Link
                href="/export"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center gap-1.5"
              >
                <span>Export Consignments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/guides"
                className="text-stone-300 hover:text-white text-xs font-semibold px-3 py-3 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to all guides</span>
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
