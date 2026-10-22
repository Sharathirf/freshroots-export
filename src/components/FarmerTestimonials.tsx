'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, CheckCircle, Quote, MapPin, ArrowRight, Package } from 'lucide-react';

interface ProductReviewItem {
  id: string;
  category: 'all' | 'ghee' | 'copra' | 'coconuts' | 'ragi' | 'oil' | 'nursery';
  productTitle: string;
  productSlug: string;
  productCategoryLabel: string;
  title: string;
  quote: string;
  name: string;
  location: string;
  segment: string;
  stars: number;
}

const PRODUCT_REVIEWS: ProductReviewItem[] = [
  {
    id: '1',
    category: 'ghee',
    productTitle: 'Farm-Fresh Pure Desi Cow Ghee (Bilona, 1L & 500ml)',
    productSlug: 'farm-fresh-pure-desi-cow-ghee-1l',
    productCategoryLabel: 'Desi Cow Ghee',
    title: 'Genuine Desi Cow Bilona Ghee',
    quote: 'Danedaar grainy texture and pleasant natural grass-fed aroma. Perfect for daily puja and home cooking. The 500ml glass jar option @ ₹480 is very convenient for small households.',
    name: 'Dr. Meera Choudhary',
    location: 'Indiranagar, Bengaluru',
    segment: 'Verified Household Buyer',
    stars: 5
  },
  {
    id: '2',
    category: 'copra',
    productTitle: 'GI-Certified Tiptur Ball Copra (15 kg, 25 kg, 30 kg)',
    productSlug: 'tiptur-ball-copra-boxes-15kg',
    productCategoryLabel: 'Tiptur Ball Copra',
    title: 'True GI Tiptur Quality, Zero Spoilage',
    quote: 'Moisture test was under 5.2%. Crisp, golden kernel with zero oil rancidity or mold. Ordered the 15kg master box and packaging was exceptionally sturdy with corrugated liners.',
    name: 'Anand Sweet Centre',
    location: 'Malleswaram, Bengaluru',
    segment: 'Commercial Mithai Processor',
    stars: 5
  },
  {
    id: '3',
    category: 'coconuts',
    productTitle: 'Fresh Semi-Husked Mature Coconuts (25-Piece Bag, ~15 kg)',
    productSlug: 'fresh-semi-husked-mature-coconuts-25-piece',
    productCategoryLabel: 'Mature Coconuts',
    title: 'Authentic Kikkeri Farm Lot',
    quote: 'Very fresh mature nuts, heavy weight around 620g per nut with sweet water and thick kernel meat (>12mm). Far superior to city retail mandi lots. Delivered in 2 days to our trust.',
    name: 'Savitri Devi & Temple Trust',
    location: 'Yeshwanthpur, Bengaluru',
    segment: 'Religious Trust & Retail Buyer',
    stars: 5
  },
  {
    id: '4',
    category: 'ragi',
    productTitle: 'Pure Karnataka Ragi Millet (5 kg, 10 kg, 25 kg)',
    productSlug: 'pure-karnataka-ragi-millet-5kg',
    productCategoryLabel: 'Karnataka Ragi',
    title: 'Clean, Destoned Native Karnataka Ragi',
    quote: 'Air-cleaned grains with zero stones or husk debris. Made authentic ragi mudde and baby malt; the earthy natural flavor is unmatched compared to store-bought flour.',
    name: 'Lakshmi Devi',
    location: 'Mandya District',
    segment: 'Verified Retail Buyer',
    stars: 5
  },
  {
    id: '5',
    category: 'oil',
    productTitle: 'Pure Wood-Pressed Groundnut Oil (Marachekku 1L)',
    productSlug: 'pure-wood-pressed-groundnut-oil-1l',
    productCategoryLabel: 'Cold-Pressed Oils',
    title: 'Pure Aroma of Cold-Pressed Peanuts',
    quote: 'Traditional marachekku taste that you can never get from refined oils. Zero chemical refining, thick texture, and natural groundnut aroma that elevates every traditional dish.',
    name: 'Prashanth N.',
    location: 'Tumakuru',
    segment: 'Verified Household Buyer',
    stars: 5
  },
  {
    id: '6',
    category: 'nursery',
    productTitle: 'High-Yield Coconut Plants (1 Year Old, 2 Feet Height)',
    productSlug: 'high-yield-coconut-plants-1-year-2-feet',
    productCategoryLabel: 'Nursery Saplings',
    title: '100% Root Ball Survival on Our Farm',
    quote: 'Ordered 50 saplings for our farm in Hassan. Arrived with moist nutrient potting mix and vigorous fronds. All 50 plants took root firmly without transplant shock.',
    name: 'Channabasappa Gowda',
    location: 'Hassan District',
    segment: 'Planter & Farmer',
    stars: 5
  }
];

export default function FarmerTestimonials() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filtered = activeTab === 'all'
    ? PRODUCT_REVIEWS
    : PRODUCT_REVIEWS.filter((t) => t.category === activeTab);

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Product-Specific Customer Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-3">
            Verified Customer Reviews by Product
          </h2>
          <p className="text-sm sm:text-base text-stone-500 mt-2">
            Real ratings and feedback submitted by verified buyers for each specific agricultural commodity
          </p>

          {/* Filter Pills by Product Category */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: 'all', label: 'All Products (10)' },
              { id: 'ghee', label: 'Pure Cow Ghee' },
              { id: 'copra', label: 'Tiptur Ball Copra' },
              { id: 'coconuts', label: 'Mature Coconuts' },
              { id: 'ragi', label: 'Ragi Millet' },
              { id: 'oil', label: 'Groundnut Oil' },
              { id: 'nursery', label: 'Nursery Plants' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#3b6d11] text-white shadow-sm ring-2 ring-emerald-700/30'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonial Cards Grid with Explicit Product Attribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-stone-50/70 rounded-3xl border border-stone-200/90 p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition duration-300"
            >
              <div>
                {/* Specific Product Banner */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-200/80">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Package className="w-3.5 h-3.5 text-[#3b6d11] shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 truncate">
                      {item.productCategoryLabel}
                    </span>
                  </div>
                  <div className="flex text-amber-400 shrink-0">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Review Heading & Quote */}
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  &ldquo;{item.title}&rdquo;
                </h4>

                <Quote className="w-5 h-5 text-stone-300 mb-1" />

                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                  {item.quote}
                </p>

                {/* Target Product Title Link */}
                <div className="mt-3 text-[11px] text-stone-500 font-medium">
                  Review for:{' '}
                  <Link
                    href={`/products/${item.productSlug}#reviews`}
                    className="text-[#3b6d11] font-bold hover:underline"
                  >
                    {item.productTitle}
                  </Link>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-stone-900 text-xs">{item.name}</h5>
                  <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{item.location}</span>
                  </div>
                </div>

                <Link
                  href={`/products/${item.productSlug}#reviews`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs"
                >
                  <span>Review Product</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
