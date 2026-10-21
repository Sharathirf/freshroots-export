'use client';

import React from 'react';
import { ArrowRight, Building2, ShieldCheck, CheckCircle2, TrendingDown, Clock, Scale } from 'lucide-react';

interface KatyayaniHeroProps {
  onOpenRFQ: () => void;
}

export default function KatyayaniHero({ onOpenRFQ }: KatyayaniHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1c3809] via-[#24470b] to-[#122405] text-white pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Luminous Aurora Glows (Katyayani Hero Aurora Effect) */}
      <div 
        aria-hidden="true" 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
      />
      <div 
        aria-hidden="true" 
        className="absolute top-20 -right-32 w-[30rem] h-[30rem] rounded-full bg-lime-400/15 blur-3xl pointer-events-none"
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none"
      />

      {/* Subtle organic grain overlay pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-7">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Trusted by 20 Lakh+ Farmers & Commercial Buyers Across India</span>
          </div>

          {/* Staggered Multi-line Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            <span className="block text-white">Direct from APMC.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-lime-200 to-amber-200">
              Lab-Tested Purity.
            </span>
            <span className="block text-emerald-200/90 font-light italic">
              Farm-Gate Savings.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-stone-300 text-base sm:text-lg sm:leading-relaxed max-w-2xl mx-auto font-normal">
            Source Karnataka&apos;s finest mature coconuts, GI-certified Tiptur ball copra, Malnad spices, and virgin cold-pressed oils. Laboratory-graded moisture, transparent weights, zero commission brokers.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-2">
            <a
              href="#catalog"
              className="w-full sm:w-auto bg-[#3b6d11] hover:bg-[#4a8a18] active:bg-[#2d5a0b] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg shadow-emerald-950/50 hover:shadow-xl transition flex items-center justify-center gap-2 group"
            >
              <span>Shop Retail Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>

            <button
              onClick={onOpenRFQ}
              className="w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-bold text-sm sm:text-base px-8 py-4 rounded-xl backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Request Wholesale Quote</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-stone-300 pt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Pan-India Retail Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Worldwide Container Export
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              APMC Weighbridge Verification
            </span>
          </div>
        </div>

        {/* 4-Column Hero Stats Card (Katyayani Hero Stats Standard) */}
        <div className="mt-12 sm:mt-16 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="flex items-center gap-3.5 pt-4 sm:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">50,000+ MT</div>
              <div className="text-xs text-stone-300 font-medium">Shipped Direct from farmer</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:pl-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">48-Hr Dispatch</div>
              <div className="text-xs text-stone-300 font-medium">Express Courier & FTL Freight</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:pl-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">≤ 5.5% Moisture</div>
              <div className="text-xs text-stone-300 font-medium">Lab Certified Quality Standard</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:pl-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Zero Middlemen</div>
              <div className="text-xs text-stone-300 font-medium">Direct Producer-to-Buyer Savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
