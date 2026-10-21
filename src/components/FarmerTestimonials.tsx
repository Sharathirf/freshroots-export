'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, Quote, MapPin } from 'lucide-react';

interface Testimonial {
  id: string;
  category: 'all' | 'oil_mills' | 'retail_puja' | 'spices' | 'export';
  categoryLabel: string;
  quote: string;
  name: string;
  location: string;
  segment: string;
  stars: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    category: 'oil_mills',
    categoryLabel: 'Oil Expeller',
    quote: 'We procured 40 metric tonnes of Industrial Milling Copra from Tiptur Direct. The moisture testing at destination clocked exactly 5.4%, yielding 69.1% pure oil. No mold, no hidden weight loss. Truly transformed our sourcing.',
    name: 'Shree Krishna Agro Expellers',
    location: 'Kangayam, Tamil Nadu',
    segment: 'Commercial Oil Miller',
    stars: 5
  },
  {
    id: '2',
    category: 'retail_puja',
    categoryLabel: 'Temple & Retail',
    quote: 'Ordering Grade A coconuts for our monthly festive requirements has never been this smooth. Every nut had thick kernel meat, fresh sweet water, and undamaged eyes. Delivered in 2 days right to our trust complex.',
    name: 'Savitri Devi & Temple Trust',
    location: 'Malleswaram, Bengaluru',
    segment: 'Religious Trust & Retail Buyer',
    stars: 5
  },
  {
    id: '3',
    category: 'spices',
    categoryLabel: 'Spice Processing',
    quote: 'The GI-Tagged Byadgi Chilli cartons arrived with exceptional color value (ASTA 155+). Perfect deep red wrinkling with zero moisture discoloration. Sourcing directly through their APMC desk saved us nearly 18% over local market brokers.',
    name: 'Rajeshwar Food Ingredients',
    location: 'Unjha, Gujarat',
    segment: 'Masala & Oleoresin Processor',
    stars: 5
  },
  {
    id: '4',
    category: 'export',
    categoryLabel: 'International Export',
    quote: 'We booked a 20ft container of Tiptur GI Ball Copra for Dubai. The Phytosanitary documentation, fumigation certificate, and palletized 25kg boxes passed customs clearance with zero friction. The gold standard for dry copra.',
    name: 'Gulf Harvest Commodities FZE',
    location: 'Jebel Ali Free Zone, Dubai (UAE)',
    segment: 'Global Commodity Importer',
    stars: 5
  },
  {
    id: '5',
    category: 'retail_puja',
    categoryLabel: 'FMCG Consumer',
    quote: 'The cold-pressed virgin coconut oil is incredibly pure and aromatic. You can immediately smell the fresh coconut aroma without any artificial heat odor. It is now our household staple for cooking and baby massage.',
    name: 'Dr. Meera Choudhary',
    location: 'Indiranagar, Bengaluru',
    segment: 'Household Consumer',
    stars: 5
  },
  {
    id: '6',
    category: 'oil_mills',
    categoryLabel: 'Mandi Trader',
    quote: 'The dual pricing clarity and transparent RFQ quotes made it easy for our wholesale chain to procure 500 bags at once. The delivery tracking and electronic weight slip matched our receiving scale perfectly.',
    name: 'Mohanlal & Sons Wholesale',
    location: 'APMC Vashi, Navi Mumbai',
    segment: 'Wholesale Mandi Distributor',
    stars: 5
  }
];

export default function FarmerTestimonials() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filtered = activeTab === 'all'
    ? TESTIMONIALS
    : TESTIMONIALS.filter((t) => t.category === activeTab);

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Purchase Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-3">
            What Our Farmers & Buyers Say
          </h2>
          <p className="text-sm sm:text-base text-stone-500 mt-2">
            Real stories from oil millers, spice processors, commercial traders, and household buyers across India and worldwide
          </p>

          {/* Filter Pills (Katyayani trustproof tabs) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: 'all', label: 'All Segments' },
              { id: 'oil_mills', label: 'Commercial Oil Mills' },
              { id: 'retail_puja', label: 'Retail & Temples' },
              { id: 'spices', label: 'Spice Processors' },
              { id: 'export', label: 'International Export' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#3b6d11] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-stone-50/70 rounded-3xl border border-stone-200/90 p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#3b6d11] bg-white px-2.5 py-0.5 rounded-md border border-stone-200">
                    {item.categoryLabel}
                  </span>
                </div>

                <Quote className="w-6 h-6 text-stone-300 mb-2" />

                <p className="text-stone-700 text-sm leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{item.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{item.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/80 font-bold px-2 py-0.5 rounded">
                    Verified Buyer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
