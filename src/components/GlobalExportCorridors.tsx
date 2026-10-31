'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Ship,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Anchor,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EXPORT_COUNTRIES, ExportCountry, getCountrySlug } from '@/lib/export-countries';

interface GlobalExportCorridorsProps {
  onOpenRFQ?: (countryName?: string) => void;
  defaultExpanded?: boolean;
}

export default function GlobalExportCorridors({
  onOpenRFQ,
  defaultExpanded = false
}: GlobalExportCorridorsProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('all');

  // Automatically expand if URL hash points to export corridors anchor
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#export' || hash === '#export-corridors' || hash === '#corridors') {
        setIsExpanded(true);
      }
    }
  }, []);

  const regions = [
    { id: 'all', label: 'All 12 Countries' },
    { id: 'Middle East', label: 'Middle East & GCC' },
    { id: 'Southeast Asia', label: 'Southeast Asia' },
    { id: 'South Asia', label: 'South Asia' },
    { id: 'Western', label: 'USA & UK' }
  ];

  const filteredCountries = EXPORT_COUNTRIES.filter((c) => {
    if (selectedCountryCode !== 'all') {
      return c.code === selectedCountryCode;
    }
    if (selectedRegion === 'all') return true;
    if (selectedRegion === 'Middle East') return c.region.includes('Middle East');
    if (selectedRegion === 'Southeast Asia') return c.region === 'Southeast Asia';
    if (selectedRegion === 'South Asia') return c.region === 'South Asia';
    if (selectedRegion === 'Western') return c.code === 'US' || c.code === 'GB';
    return true;
  });

  const activeCountryObj = selectedCountryCode !== 'all' 
    ? EXPORT_COUNTRIES.find((c) => c.code === selectedCountryCode) 
    : null;

  return (
    <section
      id="export-corridors"
      className="py-12 sm:py-20 bg-gradient-to-b from-[#111c08] via-[#16270b] to-[#111c08] text-white relative overflow-hidden border-t border-[#1c3809] transition-all duration-300"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 right-0 w-[30rem] h-[30rem] bg-lime-400/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Section Header & Expand/Collapse Trigger */}
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

          {/* Action & Dropdown Controls */}
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              aria-controls="export-corridors-tray"
              className="bg-lime-400 hover:bg-lime-300 active:bg-lime-500 text-stone-950 font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 group cursor-pointer"
            >
              <span>{isExpanded ? 'Collapse 12+ Countries' : 'Expand 12+ Countries & Corridors'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => onOpenRFQ?.('International Export')}
              className="bg-white/10 hover:bg-white/20 active:bg-white/5 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-white/20 shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Ship className="w-4 h-4 text-lime-300" />
              <span>Request Container Quote</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Quick Corridor Flags & Country Dropdown Selector Bar */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[11px] sm:text-xs font-bold text-lime-300 uppercase tracking-wider shrink-0">
              12 Active Corridors:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EXPORT_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountryCode(c.code);
                    setSelectedRegion('all');
                    setIsExpanded(true);
                  }}
                  title={`View ${c.name} (${c.majorPort})`}
                  className={`text-xl sm:text-2xl p-1 rounded-lg transition-all hover:scale-125 hover:bg-white/10 cursor-pointer ${
                    selectedCountryCode === c.code && isExpanded
                      ? 'bg-lime-400/20 ring-2 ring-lime-400 scale-110'
                      : ''
                  }`}
                >
                  {c.flag}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Dropdown Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="corridor-country-dropdown" className="text-xs text-stone-300 font-medium hidden sm:inline">
              Country:
            </label>
            <div className="relative w-full sm:w-auto">
              <select
                id="corridor-country-dropdown"
                value={selectedCountryCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCountryCode(val);
                  setSelectedRegion('all');
                  if (val !== 'all') {
                    setIsExpanded(true);
                  }
                }}
                className="w-full sm:w-auto appearance-none bg-stone-900/90 border border-white/20 hover:border-lime-400 text-stone-200 text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 shadow-inner focus:outline-hidden focus:ring-2 focus:ring-lime-400 cursor-pointer"
              >
                <option value="all">Dropdown: Select Country / Port (12 Options)...</option>
                {EXPORT_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} — {c.majorPort.split('/')[0].trim()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* EXPANDABLE SECTION TRAY */}
        {isExpanded && (
          <div
            id="export-corridors-tray"
            className="space-y-10 pt-4 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            {/* Filter Pills and Reset Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(reg.id);
                      setSelectedCountryCode('all');
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      selectedRegion === reg.id && selectedCountryCode === 'all'
                        ? 'bg-lime-400 text-stone-950 shadow-md scale-105'
                        : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>

              {selectedCountryCode !== 'all' && activeCountryObj && (
                <div className="flex items-center gap-2 bg-lime-950/80 border border-lime-500/40 text-lime-300 text-xs px-3 py-1.5 rounded-xl font-bold">
                  <span>Filtered: {activeCountryObj.flag} {activeCountryObj.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCountryCode('all')}
                    className="hover:text-white underline ml-1 cursor-pointer"
                  >
                    Show All
                  </button>
                </div>
              )}
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
                          <Link
                            href={`/export/corridors/${getCountrySlug(c.name)}`}
                            className="font-extrabold text-white text-base leading-snug hover:text-lime-300 transition block"
                            title={`View export specifications for ${c.name}`}
                          >
                            {c.name}
                          </Link>
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

                  {/* Card Footer: Quick Quote Trigger & Specs */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href={`/export/corridors/${getCountrySlug(c.name)}`}
                      className="text-[11px] text-lime-400/90 font-medium hover:underline"
                    >
                      Specs &amp; Transit →
                    </Link>
                    <button
                      type="button"
                      onClick={() => onOpenRFQ?.(c.name)}
                      className="text-xs font-bold text-white hover:text-lime-300 inline-flex items-center gap-1 transition cursor-pointer"
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
                  <h3 className="font-bold text-white text-sm">20ft / 40ft FCL Lots</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Full container loads with optimal palletized cargo stuffing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-300 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Phytosanitary &amp; COO</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Official quarantine clearance, Certificate of Origin &amp; lab reports.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Methyl Bromide Fumigation</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    ISPM-15 compliant wooden pallets &amp; container fumigation slips.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Direct Port Dispatch</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Smooth haulage to JNPT Mumbai, Chennai, and New Mangalore ports.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Collapse Bar */}
            <div className="pt-4 border-t border-white/10 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  const el = document.getElementById('export-corridors');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/15 text-stone-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                <span>Collapse 12+ Countries Section</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
