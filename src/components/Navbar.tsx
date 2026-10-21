'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, MapPin, Phone, ShieldCheck, Sprout, Building2 } from 'lucide-react';

export default function Navbar({ onOpenRFQ }: { onOpenRFQ?: () => void }) {
  const { itemCount, subtotal, setIsCartOpen, pincode, setPincode, pincodeServiceable, setPincodeServiceable } = useCart();
  const [pinInput, setPinInput] = useState(pincode);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length !== 6) return;

    setPinLoading(true);
    try {
      const res = await fetch(`/api/pincode/check?pincode=${pinInput}`);
      const data = await res.json();
      if (data.success) {
        setPincode(pinInput);
        setPincodeServiceable(data.serviceable);
        setPinMessage(data.message);
      } else {
        setPinMessage(data.error || 'Invalid PIN code');
      }
    } catch {
      setPinMessage('Error verifying PIN code');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* 1. Mandi Live Rate Ticker */}
      <div className="bg-emerald-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-200 tracking-wide uppercase">Tiptur APMC Benchmark:</span>
            <span className="hidden sm:inline">Grade A Dehusked: ₹22.00/nut</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">GI Ball Copra: ₹165.00/kg</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden md:inline">Milling Copra: ₹125.00/kg</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              0% GST on Fresh Coconuts (HSN 080112)
            </span>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition"
            >
              <Phone className="w-3 h-3" />
              Desk: +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition">
            <Sprout className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-stone-900">TIPTUR</span>
              <span className="font-light text-2xl tracking-tight text-emerald-700">DIRECT</span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 tracking-wide uppercase">
              Farm-Gate Coconuts & GI Copra
            </p>
          </div>
        </Link>

        {/* Pin Code Location Pill */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-medium border border-stone-200/80 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deliver to: <strong>{pincode}</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-stone-400">Change</span>
          </button>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/#catalog"
            className="hidden md:inline-flex text-sm font-semibold text-stone-700 hover:text-emerald-700 px-3 py-2 transition"
          >
            Retail Catalog
          </Link>

          <button
            onClick={onOpenRFQ}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-lg transition"
          >
            <Building2 className="w-4 h-4 text-amber-700" />
            <span>Wholesale RFQ</span>
            <span className="bg-amber-200/80 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase hidden sm:inline">
              Bulk 500+
            </span>
          </button>

          <Link
            href="/admin"
            className="hidden lg:inline-flex text-xs font-medium text-stone-600 hover:text-emerald-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg transition"
          >
            Operations / Admin
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition group"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-emerald-200 uppercase font-semibold leading-none">Cart</div>
              <div className="text-xs font-bold leading-tight">₹{subtotal.toLocaleString('en-IN')}</div>
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pin Code Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-lg">Check Delivery Pin Code</h3>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-stone-600 text-sm mb-4">
              Enter your 6-digit Indian postal code to check retail hub delivery SLA and regional freight eligibility.
            </p>
            <form onSubmit={handleCheckPincode} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 560001 (Bengaluru)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-base font-semibold"
                />
                <button
                  type="submit"
                  disabled={pinLoading || pinInput.length !== 6}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-1"
                >
                  {pinLoading ? 'Checking...' : 'Verify'}
                </button>
              </div>
              {pinMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    pincodeServiceable
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {pinMessage}
                </div>
              )}
              <div className="pt-2 text-xs text-stone-500">
                ⭐ <strong>Active Service Areas</strong>: Bengaluru Urban, Tumakuru, Tiptur, Hassan, Mysuru, and major Karnataka industrial corridors.
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
