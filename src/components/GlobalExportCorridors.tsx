'use client';

import React, { useState } from 'react';
import { Globe, Ship, FileCheck, ArrowRight, CheckCircle2, ShieldCheck, Anchor, ExternalLink } from 'lucide-react';
import { EXPORT_COUNTRIES, ExportCountry } from '@/lib/export-countries';

interface GlobalExportCorridorsProps {
  onOpenRFQ?: (countryName?: string) => void;
}

export default function GlobalExportCorridors({ onOpenRFQ }: GlobalExportCorridorsProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = [
    { id: 'all', label: 'All 12 Countries' },
    { id: 'Middle East', label: 'Middle East & GCC' },
    { id: 'Southeast Asia', label: 'Southeast Asia' },
    { id: 'South Asia', label: 'South Asia' },
    { id: 'Western', label: 'USA & UK' }
  ];

  const filteredCountries = EXPORT_COUNTRIES.filter((c) => {
    if (selectedRegion === 'all') return true;
    if (selectedRegion === 'Middle East') return c.region.includes('Middle East');
    if (selectedRegion === 'Southeast Asia') return c.region === 'Southeast Asia';
    if (selectedRegion === 'South Asia') return c.region === 'South Asia';
    if (selectedRegion === 'Western') return c.code === 'US' || c.code === 'GB';
    return true;
  });

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#111c08] via-[#16270b] to-[#111c08] text-white relative overflow-hidden border-t border-[#1c3809]">
      {/* Background ambient lighting */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-10 right-0 w-[30rem] h-[30rem] bg-lime-400/10 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>International Container Freight &amp; Trade</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Exporting Agricultural Commodities to 12+ Countries
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              We supply 20ft &amp; 40ft ocean container lots (FCL) of premium Karnataka copra, coconuts, spices, and cold-pressed oils with full export documentation via JNPT Mumbai, Chennai, and Mangalore ports.
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <button
              onClick={() => onOpenRFQ?.('International Export')}
              className="bg-[#3b6d11] hover:bg-[#4a8a18] active:bg-[#2d5a0b] text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 group"
            >
              <Ship className="w-4 h-4 text-lime-300" />
              <span>Request Global Container Quote</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                selectedRegion === reg.id
                  ? 'bg-lime-400 text-stone-950 shadow-md scale-105'
                  : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* 12 Export Countries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredCountries.map((c: ExportCountry) => (
            <div
              key={c.code}
              className="bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-5 hover:bg-white/10 transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-3">
                {/* Header: Flag, Name, Region */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl leading-none" role="img" aria-label={c.name}>
                      {c.flag}
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => onOpenRFQ ? onOpenRFQ(c.name) : (window.location.href = `/contact?destination=${encodeURIComponent(c.name)}#rfq`)}
                        className="font-extrabold text-white text-base leading-snug hover:text-lime-300 transition text-left"
                        title={`Open container quote for ${c.name}`}
                      >
                        {c.name}
                      </button>
                      <span className="text-[11px] text-emerald-400 font-semibold block">
                        {c.region}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Port of Discharge */}
                <div className="bg-stone-900/60 border border-white/5 rounded-xl p-2.5 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-bold tracking-wider">
                    <Anchor className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    <span>Discharge Ports</span>
                  </div>
                  <div className="font-mono text-stone-200 text-xs font-semibold truncate">
                    {c.majorPort}
                  </div>
                </div>

                {/* Popular Commodities */}
                <div className="text-xs text-stone-300">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Primary Cargo:
                  </span>
                  <span className="font-medium text-stone-200">
                    {c.popularCommodities}
                  </span>
                </div>
              </div>

              {/* Card Footer: Quick Quote Trigger */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-lime-400/90 font-medium">
                  20ft &amp; 40ft FCL
                </span>
                <button
                  onClick={() => onOpenRFQ?.(c.name)}
                  className="text-xs font-bold text-white hover:text-lime-300 inline-flex items-center gap-1 transition"
                >
                  <span>Quote {c.code}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Export Guarantees & Credentials Strip */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-300 flex items-center justify-center shrink-0">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">20ft / 40ft FCL Lots</h4>
              <p className="text-xs text-stone-400 mt-0.5">Full container loads with optimal palletized cargo stuffing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-300 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Phytosanitary &amp; COO</h4>
              <p className="text-xs text-stone-400 mt-0.5">Official quarantine clearance, Certificate of Origin &amp; lab reports.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Methyl Bromide Fumigation</h4>
              <p className="text-xs text-stone-400 mt-0.5">ISPM-15 compliant wooden pallets &amp; container fumigation slips.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Direct Port Dispatch</h4>
              <p className="text-xs text-stone-400 mt-0.5">Smooth haulage to JNPT Mumbai, Chennai, and New Mangalore ports.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
