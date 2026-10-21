'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, MapPin, Phone, Sprout, Building2, Globe, Check } from 'lucide-react';

export default function Navbar({ onOpenRFQ }: { onOpenRFQ?: () => void }) {
  const { itemCount, subtotal, setIsCartOpen, pincode, setPincode, pincodeServiceable, setPincodeServiceable } = useCart();
  const [pinInput, setPinInput] = useState(pincode);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPinModalOpen(false);
    };
    if (isPinModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinModalOpen]);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length !== 6) return;

    setPinLoading(true);
    try {
      const res = await fetch(`/api/pincode/check?pincode=${pinInput}`);
      const data = await res.json();
      if (data.success) {
        setPincode(pinInput);
        setPincodeServiceable(true);
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
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Pan-India Delivery & Worldwide Bulk Freight
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
              Farm-Gate Coconuts, Copra & Agri Commodities
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
            <span>Delivery: <strong>{pincode} ({pincodeServiceable ? 'Pan-India Active' : 'Checking'})</strong></span>
            <span className={`w-1.5 h-1.5 rounded-full ${pincodeServiceable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-stone-400">Change</span>
          </button>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/#catalog"
            className="hidden md:inline-flex text-sm font-semibold text-stone-700 hover:text-emerald-700 px-3 py-2 transition"
          >
            Products
          </Link>

          <button
            onClick={onOpenRFQ}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-lg transition"
          >
            <Building2 className="w-4 h-4 text-amber-700" />
            <span>Wholesale RFQ</span>
            <span className="bg-amber-200/80 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase hidden sm:inline">
              Pan-India & Export
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

      {/* Pin Code Modal with Easy Backdrop Close */}
      {isPinModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsPinModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-lg">Check Delivery Coverage</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 font-bold transition"
                title="Close modal (Esc)"
              >
                ✕
              </button>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm mb-4 leading-relaxed">
              We now deliver retail packs to <strong>all Indian postal PIN codes</strong>, and fulfill bulk wholesale truckloads <strong>Pan-India and Worldwide (Container Exports)</strong>.
            </p>

            <form onSubmit={handleCheckPincode} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Indian PIN"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-base font-semibold"
                />
                <button
                  type="submit"
                  disabled={pinLoading || pinInput.length !== 6}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-1"
                >
                  {pinLoading ? 'Checking...' : 'Check'}
                </button>
              </div>

              {pinMessage && (
                <div className="p-3.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pinMessage}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span><strong>Retail Coverage</strong>: All 19,000+ PIN codes across India via Express 3PL.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Worldwide Bulk Cargo</strong>: 20ft / 40ft container shipments from Mangalore/Chennai port for export buyers.</span>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
                >
                  Done / Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
