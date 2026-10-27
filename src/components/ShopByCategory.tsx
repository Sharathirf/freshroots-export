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
    name: 'Fresh Mature & Tender Coconuts',
    description: '25-piece semi-husked mature bags (15kg) and sweet water tender coconuts',
    count: 2,
    iconBg: '#edf7e1',
    image: '/products/mature-coconuts-4k.jpg',
    filterKey: 'mature_coconut'
  },
  {
    id: 'copra',
    name: 'GI-Certified Tiptur Ball Copra',
    description: '15kg, 25kg, and 30kg master boxes naturally attic-cured without sulphur',
    count: 1,
    iconBg: '#edf7e1',
    image: '/products/ball-copra-4k.jpg',
    filterKey: 'copra'
  },
  {
    id: 'oils-ghee',
    name: 'Wood-Pressed Oils & Pure Ghee',
    description: 'Traditional Marachekku groundnut oil & farm-fresh cultured bilona cow ghee',
    count: 2,
    iconBg: '#edf7e1',
    image: '/products/groundnut-oil-4k.jpg',
    filterKey: 'oil_and_extracts'
  },
  {
    id: 'millets-ginger',
    name: 'Karnataka Ragi & Fresh Ginger',
    description: 'Whole brown finger millet in 5/10/25kg bags & 50kg farm-fresh ginger',
    count: 2,
    iconBg: '#edf7e1',
    image: '/products/ragi-millet-4k.jpg',
    filterKey: 'spices'
  },
  {
    id: 'nursery',
    name: 'Coconut & Arecanut Plants',
    description: '1-Year 2ft coconut plants & 1-1.5ft arecanut saplings from certified nurseries',
    count: 2,
    iconBg: '#edf7e1',
    image: '/products/coconut-saplings-4k.jpg',
    filterKey: 'value_added'
  },
  {
    id: 'shells',
    name: 'Raw Coconut Shells (Bulk)',
    description: 'High-calorific dry broken shells for industrial activated carbon & charcoal',
    count: 1,
    iconBg: '#edf7e1',
    image: '/products/coconut-shells-4k.jpg',
    filterKey: 'coir_commodities'
  },
  {
    id: 'bulk',
    name: 'Direct Farm-Gate Bulk Lots',
    description: 'Wholesale truckload freight and institutional supply from Mandya',
    count: 10,
    iconBg: '#edf7e1',
    image: '/products/arecanut-adike-4k.jpg',
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
              <span>Certified Commodities</span>
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
