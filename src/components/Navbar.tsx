'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, MapPin, Phone, Sprout, Building2, Globe, Check, Search, X, ChevronRight } from 'lucide-react';
import { Product } from '@/types';

export default function Navbar({ onOpenRFQ }: { onOpenRFQ?: () => void }) {
  const { itemCount, subtotal, setIsCartOpen, pincode, setPincode, pincodeServiceable, setPincodeServiceable } = useCart();
  const [pinInput, setPinInput] = useState(pincode);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  // Live Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPinModalOpen(false);
        setIsSearchOpen(false);
      }
    };
    if (isPinModalOpen || isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinModalOpen, isSearchOpen]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Preload products for search
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.error('Navbar search catalog preload error:', err);
      }
    }
    loadCatalog();
  }, []);

  // Filter search results
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const matches = allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery, allProducts]);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length !== 6) return;

    setPinLoading(true);
    setPinMessage(null);
    try {
      const res = await fetch(`/api/pincode/check?pincode=${pinInput}`);
      const data = await res.json();
      if (data.success && data.serviceable) {
        setPincode(pinInput);
        setPincodeServiceable(true);
        setPinMessage(data.message || `Serviceable! Dispatch in ${data.delivery_lead_days} day(s).`);
      } else {
        setPincodeServiceable(false);
        setPinMessage(data.error || 'PIN code currently outside standard direct delivery network.');
      }
    } catch {
      setPinMessage('Error checking PIN code serviceability. Please try again.');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-stone-200">
      {/* 1. Mandi Live Rate & Shipping Ticker (Katyayani Header Top Bar) */}
      <div className="bg-[#1c3809] text-white text-[11px] py-2 px-4 border-b border-[#24470b]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span className="font-bold text-lime-300 uppercase tracking-wider">Tiptur APMC Benchmark:</span>
            <span className="hidden sm:inline">Grade A Dehusked: ₹22.00/nut</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">GI Ball Copra: ₹165.00/kg</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden md:inline">Milling Copra: ₹125.00/kg</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100 font-medium">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-lime-300" />
              Pan-India Delivery & Worldwide Container Freight
            </span>
            <a
              href="https://wa.me/919591142548"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition"
            >
              <Phone className="w-3 h-3 text-lime-300" />
              Desk: +91 95911 42548
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3b6d11] to-[#1c3809] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition">
            <Sprout className="w-6 h-6 text-lime-300" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-2xl tracking-tight text-stone-900">TIPTUR</span>
              <span className="font-black text-2xl tracking-tight text-[#3b6d11]">DIRECT</span>
            </div>
            <p className="text-[10px] font-bold text-stone-500 tracking-wider uppercase">
              APMC Farm-Gate Commodities
            </p>
          </div>
        </Link>

        {/* Live Search Bar with Instant Autocomplete (Katyayani search experience) */}
        <div ref={searchRef} className="flex-1 max-w-lg relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search coconuts, copra, spices, cold-pressed oils..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full border border-stone-300/90 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden z-50 animate-in fade-in max-h-96 overflow-y-auto">
              <div className="p-2.5 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 flex justify-between items-center">
                <span>Matching Produce ({searchResults.length})</span>
                <span className="text-[10px] text-[#3b6d11]">Direct APMC Stock</span>
              </div>
              <div className="divide-y divide-stone-100">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-stone-50 flex items-center justify-between gap-3 group transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900 group-hover:text-[#3b6d11] line-clamp-1">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {p.unit_of_measure} • {p.grade}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-stone-900">
                        ₹{Number(p.retail_price_inr).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-[#3b6d11] font-semibold flex items-center justify-end gap-0.5">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pin Code Location Pill */}
        <div className="hidden xl:flex items-center">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-[#3b6d11]" />
            <span>Delivery: <strong>{pincode} ({pincodeServiceable ? 'Pan-India Active' : 'Checking'})</strong></span>
            <span className={`w-1.5 h-1.5 rounded-full ${pincodeServiceable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-stone-400">Change</span>
          </button>
        </div>

        {/* Actions Strip */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Wholesale RFQ Button */}
          <button
            onClick={onOpenRFQ}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2.5 rounded-xl transition shadow-sm"
          >
            <Building2 className="w-4 h-4 text-amber-700" />
            <span>Wholesale RFQ</span>
            <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase hidden sm:inline">
              Bulk Lots
            </span>
          </button>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="hidden lg:inline-flex text-xs font-semibold text-stone-600 hover:text-[#3b6d11] bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-2.5 rounded-xl transition"
          >
            Operations / Admin
          </Link>

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-95 text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-bold shadow-sm transition group"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-lime-200 uppercase font-semibold leading-none">Cart</div>
              <div className="text-xs font-bold leading-tight font-mono">₹{subtotal.toLocaleString('en-IN')}</div>
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Category Strip / Mega-Menu (Katyayani Header Category Navigation) */}
      <div className="bg-stone-50 border-t border-stone-200/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-semibold text-stone-700 py-2.5 overflow-x-auto gap-6 scrollbar-none">
          <div className="flex items-center gap-6">
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              All Commodities
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Fresh Coconuts
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              GI Ball Copra
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Industrial Milling Copra
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Byadgi & Malnad Spices
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Cold-Pressed Oils
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Horticultural Coir Pith
            </Link>
          </div>
          <div className="flex items-center gap-4 text-[#3b6d11] font-bold shrink-0">
            <button onClick={onOpenRFQ} className="hover:underline flex items-center gap-1">
              <span>Container Export Lots</span> →
            </button>
          </div>
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
                <MapPin className="w-5 h-5 text-[#3b6d11]" />
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
              We deliver retail packs to <strong>all Indian postal PIN codes</strong>, and fulfill bulk wholesale truckloads <strong>Pan-India and Worldwide (Container Exports)</strong>.
            </p>

            <form onSubmit={handleCheckPincode} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Indian PIN"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#3b6d11] font-mono text-base font-semibold"
                />
                <button
                  type="submit"
                  disabled={pinLoading || pinInput.length !== 6}
                  className="bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-1"
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
