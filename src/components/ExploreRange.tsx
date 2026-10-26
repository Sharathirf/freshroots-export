'use client';

import React from 'react';
import { ArrowRight, Factory, Sparkles, Utensils, Sprout, ShieldAlert, HeartPulse } from 'lucide-react';

interface RangeSolution {
  title: string;
  badge: string;
  description: string;
  icon: any;
  productCount: number;
  image: string;
  filterKey: string;
}

const SOLUTIONS: RangeSolution[] = [
  {
    title: 'Commercial Oil Expellers & Solvent Plants',
    badge: 'High Oil Yield ≥ 68%',
    description: 'Industrial Milling Copra cut and dried to ≤ 5.5% moisture, optimized for rotary and expeller oil mills without aflatoxin risk.',
    icon: Factory,
    productCount: 2,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    filterKey: 'copra'
  },
  {
    title: 'Temple Mandirs, Puja & Retail Stores',
    badge: 'Grade A Selection',
    description: 'Uniform 550g+ dehusked coconuts with fresh coconut water and intact eyes. Nil-rated 0% GST compliance.',
    icon: Sparkles,
    productCount: 2,
    image: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80',
    filterKey: 'mature_coconut'
  },
  {
    title: 'Food Processors, Masala Brands & Exporters',
    badge: 'GI Certified Color & Aroma',
    description: 'GI-tagged Byadgi stemless dry chillies and Malnad bold black pepper with verified oleoresin and natural pungency.',
    icon: Utensils,
    productCount: 2,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    filterKey: 'spices'
  },
  {
    title: 'Horticultural Nurseries & Hydroponics',
    badge: 'Low EC ≤ 0.5 mS/cm',
    description: 'Triple-washed and cured 5kg compressed coir pith blocks offering 75L moisture retention per block.',
    icon: Sprout,
    productCount: 1,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    filterKey: 'coir_commodities'
  },
  {
    title: 'Ayurvedic Formulations & Cold-Pressed Nutrition',
    badge: 'Wood-Churned Cold Press',
    description: 'Raw extra virgin coconut oil extracted from fresh sulfur-free copra under 45°C to preserve lauric acid.',
    icon: HeartPulse,
    productCount: 1,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    filterKey: 'oil_and_extracts'
  },
  {
    title: 'Pan-India Mandi & Global Container Lots',
    badge: 'Direct Digital Weighbridge',
    description: 'Full-truckload (10 MT to 25 MT) and 20ft/40ft shipping container lots with Phytosanitary clearance.',
    icon: ShieldAlert,
    productCount: 9,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    filterKey: 'all'
  }
];

export default function ExploreRange({ onSelectCategory }: { onSelectCategory: (key: string) => void }) {
  return (
    <section className="py-16 sm:py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Purpose-Driven Sourcing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-3">
            Explore Our Range
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Targeted agricultural solutions engineered for processors, millers, retail distributors, and commercial growers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SOLUTIONS.map((sol, index) => {
            const Icon = sol.icon;
            return (
              <a
                key={index}
                href="#catalog"
                onClick={() => onSelectCategory(sol.filterKey)}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                    <img
                      src={sol.image}
                      alt={sol.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 bg-[#3b6d11] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                      {sol.badge}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#3b6d11]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-stone-400">
                        {sol.productCount}+ Active Products
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-stone-900 group-hover:text-[#3b6d11] transition leading-snug">
                      {sol.title}
                    </h3>

                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                      {sol.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#3b6d11]">
                    <span>Explore Solutions</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
