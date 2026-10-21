'use client';

import React from 'react';
import { Award, Droplet, Scale, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function GradingGuide() {
  return (
    <section className="py-16 bg-stone-50 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Award className="w-4 h-4 text-emerald-700" />
            Agricultural Quality & Testing Standards
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            How We Standardize Agricultural Commodities
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Eliminating broker ambiguity with laboratory-tested moisture thresholds, physical weight classification, and strict rejection of cracked nuts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Coconut Sizing */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-lg">Physical Weight & Meat Grading</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Every coconut harvested in Tiptur is calibrated over electronic grading conveyors:
            </p>
            <ul className="mt-4 space-y-2 text-xs text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Grade A Jumbo (550g - 650g+)</strong>: 11-12 month maturity, &gt;12mm solid white meat kernel, sweet water resonance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Grade B Medium (400g - 500g)</strong>: Uniform size for catering, darshinis, and commercial grating.</span>
              </li>
              <li className="flex items-start gap-2 text-red-700">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span><strong>Zero Cracked Policy</strong>: Hairline cracks lead to immediate rejection during manual tap testing.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Ball Copra */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-lg">GI-Tagged Tiptur Ball Copra</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Geographical Indication (GI) tagged copra, dried using traditional 100-year-old curing science:
            </p>
            <ul className="mt-4 space-y-2 text-xs text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>9 to 11 Months Attic Curing</strong>: Naturally cured inside the intact coconut shell in wooden attics.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>100% Sulphur-Free</strong>: No toxic fumigation or chemical bleaching. Pure edible golden kernel.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Edible Grade Rajapur / Gooti</strong>: Distinct natural sweetness, whole unbroken spherical cups.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Moisture & Oil */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-lg">Moisture & Oil Recovery Protocols</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Eliminating transit mold and maximizing oil recovery for commercial expellers:
            </p>
            <ul className="mt-4 space-y-2 text-xs text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Moisture &le; 5.5%</strong>: Verified with calibrated digital pin meters to prevent fungal rancidity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>High Oil Yield (&ge; 68%)</strong>: Lab-tested expeller recovery rate for high commercial margin.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Free Fatty Acid (FFA &lt; 1%)</strong>: Freshly crushed without rancidity or unpleasant acidity.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
