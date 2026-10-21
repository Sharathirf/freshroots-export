'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Award } from 'lucide-react';

interface TransparencyStory {
  id: string;
  badge: string;
  title: string;
  location: string;
  metric: string;
  metricLabel: string;
  description: string;
  image: string;
  productSlug: string;
  productName: string;
  price: string;
}

const STORIES: TransparencyStory[] = [
  {
    id: '1',
    badge: 'Moisture Lab Test',
    title: 'Digital Moisture Verification at Tiptur APMC Yard',
    location: 'Tiptur Mandi, Tumakuru District',
    metric: '5.20%',
    metricLabel: 'Certified Moisture (Limit ≤ 5.5%)',
    description: 'Every copra batch is tested using calibrated electronic moisture meters before dispatch. Prevents fungal growth and maintains peak oil yield in transit.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    productSlug: 'gi-tiptur-ball-copra-25kg',
    productName: 'GI-Tagged Tiptur Ball Copra (Whole Dry)',
    price: '₹4,125'
  },
  {
    id: '2',
    badge: 'Weight Grading',
    title: 'Grade A Dehusked Coconuts Electronic Sort Line',
    location: 'Arsikere & Tiptur Farm Corridors',
    metric: '550g+',
    metricLabel: 'Minimum Nut Weight Class',
    description: 'Fresh nuts undergo optical and weight classification to separate premium Grade A household/puja units from commercial Grade B stock.',
    image: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80',
    productSlug: 'grade-a-mature-coconuts-50-bag',
    productName: 'Grade A Mature Coconuts (Bag of 50)',
    price: '₹1,650'
  },
  {
    id: '3',
    badge: 'GI Certification',
    title: 'GI-Tagged Byadgi Wrinkled Red Chilli Sourcing',
    location: 'Haveri & Byadgi APMC Mandi',
    metric: '155+',
    metricLabel: 'ASTA Certified Color Value',
    description: 'Direct procurement of handpicked, stemless Byadgi chillies known globally for deep paprika-like natural red hue with mild culinary heat.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    productSlug: 'byadgi-chilli-stemless-10kg',
    productName: 'GI-Tagged Byadgi Chilli (Stemless 10kg)',
    price: '₹4,200'
  }
];

export default function RealResultsTransparency() {
  return (
    <section className="py-16 sm:py-24 bg-stone-900 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-800">
              <Award className="w-4 h-4" />
              <span>APMC Traceability & Lab Testing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
              Real Farmers, Real Results
            </h2>
            <p className="text-sm sm:text-base text-stone-400 mt-2 max-w-xl">
              Inspect our farm-gate grading, certified electronic testing, and transparent weighing protocols across Karnataka mandis
            </p>
          </div>
          <Link
            href="/#catalog"
            className="text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition group"
          >
            <span>View All Certified Lots</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Video / Transparency Cards Grid (Katyayani tv-section styling) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="bg-stone-800/80 border border-stone-700 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-emerald-600/80 transition duration-300 group shadow-lg"
            >
              <div>
                {/* Visual wrap with play badge */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {story.badge}
                  </span>

                  <div className="absolute bottom-3 left-3 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">{story.metric}</span>
                    <span className="text-[11px] text-stone-300 font-medium">{story.metricLabel}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="text-xs text-emerald-400 font-medium mb-1">
                    {story.location}
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-2.5 leading-relaxed">
                    {story.description}
                  </p>
                </div>
              </div>

              {/* Linked Product Card Snippet */}
              <div className="p-6 pt-0">
                <Link
                  href={`/products/${story.productSlug}`}
                  className="bg-stone-900/90 hover:bg-stone-950 p-3.5 rounded-2xl border border-stone-700/80 flex items-center justify-between group/link transition"
                >
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Associated Certified SKU</div>
                    <div className="text-xs font-bold text-stone-200 group-hover/link:text-emerald-300 line-clamp-1">
                      {story.productName}
                    </div>
                  </div>
                  <div className="text-right pl-3">
                    <div className="text-xs font-mono font-bold text-emerald-400">{story.price}</div>
                    <span className="text-[10px] text-stone-400 font-medium flex items-center justify-end gap-0.5">
                      View →
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
