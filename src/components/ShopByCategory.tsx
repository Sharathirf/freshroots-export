'use client';

import React from 'react';
import { ArrowRight, Sprout } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  count: number;
  iconBg: string;
  image: string;
  filterKey: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'coconuts',
    name: 'Fresh Mature Coconuts',
    description: 'Grade A & B dehusked for retail stores, temples & households',
    count: 2,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=300&q=80',
    filterKey: 'mature_coconut'
  },
  {
    id: 'ball-copra',
    name: 'GI-Tagged Tiptur Ball Copra',
    description: 'Whole spherical dry copra with gold sweetness & pure kernel',
    count: 1,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
    filterKey: 'copra'
  },
  {
    id: 'milling-copra',
    name: 'Industrial Milling Copra',
    description: 'High oil yield cut copra for expeller mills & solvent plants',
    count: 1,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80',
    filterKey: 'copra'
  },
  {
    id: 'spices',
    name: 'Malnad & Byadgi Spices',
    description: 'GI stemless wrinkle chillies & garbled extra-bold black pepper',
    count: 2,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80',
    filterKey: 'spices'
  },
  {
    id: 'oils',
    name: 'Cold-Pressed Raw Oils',
    description: 'Extra virgin coconut oil wood-churned below 45°C',
    count: 1,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
    filterKey: 'oil_and_extracts'
  },
  {
    id: 'coir',
    name: 'Horticultural Coir Pith',
    description: 'Low-EC washed 5kg compressed blocks for hydroponics & soil',
    count: 1,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=300&q=80',
    filterKey: 'coir_commodities'
  },
  {
    id: 'areca',
    name: 'Tumakuru Areca Nut',
    description: 'Whole red Rashi Supari naturally sun-cured from local gardens',
    count: 1,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=300&q=80',
    filterKey: 'value_added'
  },
  {
    id: 'bulk',
    name: 'Wholesale Container Freight',
    description: 'Multi-tonne container lots for institutional & export buyers',
    count: 9,
    iconBg: '#edf7e1',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
    filterKey: 'all'
  }
];

interface ShopByCategoryProps {
  activeCategory: string;
  onSelectCategory: (categoryKey: string) => void;
}

export default function ShopByCategory({ activeCategory, onSelectCategory }: ShopByCategoryProps) {
  return (
    <section className="py-14 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3b6d11] mb-1.5">
              <Sprout className="w-4 h-4" />
              <span>APMC Certified Commodities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-xl">
              Explore our range of laboratory-tested, farmer-sourced agricultural commodities direct from Karnataka
            </p>
          </div>
          <a
            href="#catalog"
            onClick={() => onSelectCategory('all')}
            className="text-xs sm:text-sm font-bold text-[#3b6d11] hover:text-[#2d5a0b] inline-flex items-center gap-1 transition group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </a>
        </div>

        {/* Category Cards Grid (Katyayani mc-section styling) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.filterKey;
            return (
              <a
                key={cat.id}
                href="#catalog"
                onClick={() => onSelectCategory(cat.filterKey)}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md group cursor-pointer ${
                  isSelected
                    ? 'border-[#3b6d11] ring-2 ring-[#3b6d11]/20 shadow-sm'
                    : 'border-stone-200/80 hover:border-[#3b6d11]/50'
                }`}
              >
                <div>
                  {/* Icon & Thumbnail */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-2 mb-3.5 mx-auto overflow-hidden transition group-hover:scale-105"
                    style={{ backgroundColor: cat.iconBg }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#3b6d11] transition line-clamp-1 text-center">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-1 line-clamp-2 text-center leading-relaxed font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-400 font-medium text-[11px]">
                    {cat.count}+ {cat.count === 1 ? 'variety' : 'varieties'}
                  </span>
                  <span className="text-[#3b6d11] group-hover:translate-x-0.5 transition inline-flex items-center gap-0.5">
                    Explore →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
