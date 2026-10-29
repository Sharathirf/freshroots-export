'use client';

import React from 'react';
import { ArrowRight, Phone, Sprout, Building2 } from 'lucide-react';

export default function HomeCtaBanner({ onOpenRFQ }: { onOpenRFQ: () => void }) {
  return (
    <section className="bg-gradient-to-br from-[#1c3809] via-[#24470b] to-[#122405] text-white py-14 sm:py-20 relative overflow-hidden">
      {/* Aurora glow accents */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-lime-400/15 blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" 
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full shadow-md backdrop-blur-md">
          <Sprout className="w-4 h-4 text-emerald-400" />
          <span>Direct Farm-Gate Procurement</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to Source Direct from India&apos;s Coconut Capital?
        </h2>

        <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
          Get premium quality agricultural produce directly from Tiptur farmers. Transparent moisture certification, zero broker markups, Pan-India courier delivery, and worldwide export containers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <a
            href="#catalog"
            className="w-full sm:w-auto bg-[#3b6d11] hover:bg-[#4a8a18] active:bg-[#2d5a0b] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 group"
          >
            <span>Shop Retail Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </a>

          <button
            onClick={onOpenRFQ}
            className="w-full sm:w-auto bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl backdrop-blur-md transition flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Request Bulk Quotation</span>
          </button>

          <a
            href="https://wa.me/919008462568?text=Hello%20Sharath,%20I%20would%20like%20to%20consult%20with%20you%20about%20agricultural%20commodity%20sourcing."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-stone-200 border border-white/20 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl backdrop-blur-md transition flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Talk to an Expert</span>
          </a>
        </div>
      </div>
    </section>
  );
}
