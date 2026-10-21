'use client';

import React from 'react';
import { Truck, ShieldCheck, Headphones, CreditCard } from 'lucide-react';

export default function UspTrustBand() {
  return (
    <section className="bg-[#f0fdf0] border-t border-b border-emerald-200/60 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Pillar 1 */}
          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#edf7e1] flex items-center justify-center text-[#3b6d11] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm">Free Pan-India Delivery</h4>
              <p className="text-xs text-stone-500 mt-0.5">On retail orders above ₹1,500. Flat ₹99 below.</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#edf7e1] flex items-center justify-center text-[#3b6d11] shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm">Cash on Delivery & UPI</h4>
              <p className="text-xs text-stone-500 mt-0.5">Instant checkout via UPI, Cards, NetBanking or COD.</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#edf7e1] flex items-center justify-center text-[#3b6d11] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm">100% Lab Tested Purity</h4>
              <p className="text-xs text-stone-500 mt-0.5">Moisture ≤ 5.5% & weight classification guaranteed.</p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#edf7e1] flex items-center justify-center text-[#3b6d11] shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm">24/7 Agri Desk Support</h4>
              <p className="text-xs text-stone-500 mt-0.5">Direct hotline & WhatsApp procurement assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
