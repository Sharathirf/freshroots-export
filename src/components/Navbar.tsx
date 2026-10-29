'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  ShoppingBag,
  Phone,
  Sprout,
  Building2,
  Search,
  X,
  ChevronRight,
  Heart,
  User,
  Truck,
  LogOut,
  Pencil,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import { Product } from '@/types';

type CopraMandiRate = {
  pricePerQuintal: number;
  pricePerKg: number;
  reportedAt: string;
  isFallback: boolean;
  source: string;
};

type ArecanutMandiRate = CopraMandiRate;

const FALLBACK_COPRA_RATE: CopraMandiRate = {
  pricePerQuintal: 33_100,
  pricePerKg: 331.00,
  reportedAt: '29 Oct 2026',
  isFallback: false,
  source: 'https://acrop.app/mandi/karnataka/tumakuru/tiptur/copra',
};

const FALLBACK_ARECANUT_RATE: ArecanutMandiRate = {
  pricePerQuintal: 70_809,
  pricePerKg: 708.09,
  reportedAt: '29 Oct 2026',
  isFallback: false,
  source: 'https://acrop.app/mandi/karnataka/shivamogga/shimoga/arecanut',
};

export default function Navbar({
  onOpenRFQ,
  onOpenEnquiry: _onOpenEnquiry
}: {
  onOpenRFQ?: () => void;
  onOpenEnquiry?: () => void;
}) {
  const { itemCount, subtotal, setIsCartOpen } = useCart();
  const {
    customer,
    isLoggedIn,
    setIsSignInModalOpen,
    setIsAccountModalOpen,
    setIsEditProfileModalOpen,
    setIsOrderHistoryOpen,
    setIsHelpOpen,
    lang,
    setLang,
    signOut
  } = useAuth();
  const { wishlistCount, setIsWatchlistOpen } = useWishlist();

  // Live Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [copraMandiRate, setCopraMandiRate] = useState(FALLBACK_COPRA_RATE);
  const [arecanutMandiRate, setArecanutMandiRate] = useState(FALLBACK_ARECANUT_RATE);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCopraMandiRate() {
      try {
        const response = await fetch('/api/mandi/copra', { cache: 'no-store' });
        if (!response.ok) return;

        const rate = (await response.json()) as CopraMandiRate;
        if (
          !cancelled &&
          Number.isFinite(rate.pricePerKg) &&
          Number.isFinite(rate.pricePerQuintal) &&
          typeof rate.reportedAt === 'string'
        ) {
          setCopraMandiRate(rate);
        }
      } catch {
        // Keep the dated source value when ACROP or the local endpoint is unavailable.
      }
    }

    void loadCopraMandiRate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadArecanutMandiRate() {
      try {
        const response = await fetch('/api/mandi/arecanut', { cache: 'no-store' });
        if (!response.ok) return;

        const rate = (await response.json()) as ArecanutMandiRate;
        if (
          !cancelled &&
          Number.isFinite(rate.pricePerKg) &&
          Number.isFinite(rate.pricePerQuintal) &&
          typeof rate.reportedAt === 'string'
        ) {
          setArecanutMandiRate(rate);
        }
      } catch {
        // Keep the dated source value when ACROP or the local endpoint is unavailable.
      }
    }

    void loadArecanutMandiRate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

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

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-stone-200 w-full max-w-full overflow-hidden">
      {/* 1. Mandi Live Rate & Shipping Ticker (Katyayani Header Top Bar) */}
      <div className="bg-[#1c3809] text-white text-[10px] sm:text-[11px] py-1.5 sm:py-2 px-3 sm:px-4 border-b border-[#24470b] overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse shrink-0"></span>
            <span className="font-bold text-lime-300 uppercase tracking-wider shrink-0">
              Mandi:
            </span>
            <span className="truncate text-lime-100">
              Coconuts: ₹90/kg •{' '}
              <a
                href="https://acrop.app/mandi/karnataka/tumakuru/tiptur/copra"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Tiptur Mandi copra maximum: ₹${copraMandiRate.pricePerQuintal.toLocaleString('en-IN')} per quintal, equivalent to ₹${copraMandiRate.pricePerKg.toFixed(2)} per kg, reported ${copraMandiRate.reportedAt}. Source: ACROP.`}
                title={`${copraMandiRate.isFallback ? 'Last available ACROP report' : 'ACROP report'}: Tiptur Mandi maximum ₹${copraMandiRate.pricePerQuintal.toLocaleString('en-IN')}/quintal (₹${copraMandiRate.pricePerKg.toFixed(2)}/kg), reported ${copraMandiRate.reportedAt}`}
                className="underline decoration-dotted underline-offset-2 hover:text-white"
              >
                Copra max: ₹{copraMandiRate.pricePerQuintal.toLocaleString('en-IN')}/quintal
                <span className="hidden sm:inline"> · {copraMandiRate.reportedAt}</span>
              </a>
              {' '}•{' '}
              <a
                href="https://acrop.app/mandi/karnataka/shivamogga/shimoga/arecanut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Shimoga Mandi arecanut maximum: ₹${arecanutMandiRate.pricePerQuintal.toLocaleString('en-IN')} per quintal, equivalent to ₹${arecanutMandiRate.pricePerKg.toFixed(2)} per kg, reported ${arecanutMandiRate.reportedAt}. Source: ACROP.`}
                title={`${arecanutMandiRate.isFallback ? 'Last available ACROP report' : 'ACROP report'}: Shimoga Mandi arecanut maximum ₹${arecanutMandiRate.pricePerQuintal.toLocaleString('en-IN')}/quintal (₹${arecanutMandiRate.pricePerKg.toFixed(2)}/kg), reported ${arecanutMandiRate.reportedAt}`}
                className="underline decoration-dotted underline-offset-2 hover:text-white"
              >
                Arecanut max: ₹{arecanutMandiRate.pricePerQuintal.toLocaleString('en-IN')}/quintal
                <span className="hidden sm:inline"> · {arecanutMandiRate.reportedAt}</span>
              </a>
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4 text-emerald-100 font-medium shrink-0 text-[10px] sm:text-[11px]">
            <Link
              href="/track-order"
              className="hover:text-white flex items-center gap-1 transition text-lime-200 hover:text-white font-semibold"
            >
              <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-lime-300" />
              <span>{lang === 'kn' ? 'ಟ್ರ್ಯಾಕ್' : 'Track'}</span>
            </Link>
            <span className="text-emerald-300/60 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => setIsOrderHistoryOpen(true)}
              className="hover:text-white flex items-center gap-1 transition text-lime-200 hover:text-white font-semibold hidden sm:flex"
            >
              <RotateCcw className="w-3.5 h-3.5 text-lime-300" />
              <span>{lang === 'kn' ? 'ಮರು ಆರ್ಡರ್' : 'Orders'}</span>
            </button>
            <span className="text-emerald-300/60">•</span>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-white flex items-center gap-1 transition text-lime-200 hover:text-white font-semibold"
            >
              <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-lime-300" />
              <span>{lang === 'kn' ? 'ಸಹಾಯ' : 'Help'}</span>
            </button>
            <span className="hidden md:inline text-emerald-300/60">•</span>
            <a
              href="https://wa.me/919591142548"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition hidden sm:flex"
            >
              <Phone className="w-3 h-3 text-lime-300" />
              95911 42548
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-1.5 sm:gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-3 shrink-0 group">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#3b6d11] to-[#1c3809] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition">
            <Sprout className="w-4 h-4 sm:w-6 sm:h-6 text-lime-300" />
          </div>
          <div>
            <div className="flex items-center gap-0.5 sm:gap-1.5">
              <span className="font-extrabold text-sm sm:text-xl md:text-2xl tracking-tight text-stone-900">FreshRoots</span>
              <span className="font-black text-sm sm:text-xl md:text-2xl tracking-tight text-[#3b6d11]">Export</span>
            </div>
          </div>
        </Link>

        {/* Large Expanded Live Search Bar with Instant Autocomplete (Desktop / Tablet) */}
        <div ref={searchRef} className="hidden lg:block flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl relative mx-3 sm:mx-6 min-w-[200px]">
          <div className="relative w-full">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search coconuts, copra, spices, cold-pressed oils..."
              className="w-full pl-12 pr-10 py-3 rounded-full border border-stone-300/90 text-sm bg-stone-50/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] focus:border-transparent transition shadow-inner placeholder:text-stone-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 animate-in fade-in max-h-[440px] overflow-y-auto w-full">
              <div className="p-3 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-100 flex justify-between items-center">
                <span>Matching Produce ({searchResults.length})</span>
                <span className="text-[10px] text-[#3b6d11] font-extrabold">Direct Farm Stock</span>
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
                    className="p-3.5 hover:bg-stone-50/90 flex items-center justify-between gap-4 group transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-stone-900 group-hover:text-[#3b6d11] truncate transition">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-stone-600">{p.unit_of_measure}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{p.grade}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-bold text-stone-900">
                        ₹{Number(p.retail_price_inr).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-[#3b6d11] font-bold flex items-center justify-end gap-0.5 mt-0.5">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Strip */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Switcher Pill (Bilingual Kannada / English) */}
          <button
            type="button"
            onClick={() => setLang(lang === 'kn' ? 'en' : 'kn')}
            className="h-10 flex items-center gap-0.5 text-xs font-black bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 px-2.5 rounded-xl whitespace-nowrap transition shadow-xs shrink-0"
            title={lang === 'kn' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ'}
            aria-label="Toggle Language"
          >
            <span className={lang === 'kn' ? 'text-emerald-700 font-extrabold' : 'text-stone-400 font-normal'}>ಕನ್ನಡ</span>
            <span className="text-stone-300 font-normal">/</span>
            <span className={lang === 'en' ? 'text-emerald-700 font-extrabold' : 'text-stone-400 font-normal'}>EN</span>
          </button>

          {/* Export & Guides Direct Links - Desktop */}
          <Link
            href="/export"
            className="hidden xl:flex items-center h-10 text-xs font-bold text-stone-700 hover:text-[#3b6d11] px-2.5 rounded-xl hover:bg-stone-100 whitespace-nowrap transition shrink-0"
          >
            <span>Export</span>
          </Link>

          <Link
            href="/guides"
            className="hidden xl:flex items-center h-10 text-xs font-bold text-stone-700 hover:text-[#3b6d11] px-2.5 rounded-xl hover:bg-stone-100 whitespace-nowrap transition shrink-0"
          >
            <span>Guides</span>
          </Link>

          {/* Wholesale RFQ Primary B2B Action Button */}
          <button
            type="button"
            onClick={onOpenRFQ}
            aria-label="Request a wholesale quote"
            className="hidden md:inline-flex items-center gap-1.5 h-10 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs shrink-0"
          >
            <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Wholesale RFQ</span>
            <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
              Bulk
            </span>
          </button>

          {/* Watchlist Trigger */}
          <button
            type="button"
            onClick={() => setIsWatchlistOpen(true)}
            className="relative h-10 w-10 flex items-center justify-center text-stone-700 hover:text-red-600 hover:bg-red-50 border border-stone-200 rounded-xl transition group shrink-0"
            title="My Watchlist"
            aria-label="View Watchlist"
          >
            <Heart className="w-4 h-4 group-hover:scale-110 transition shrink-0" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Customer Sign In / Account Dropdown (Desktop) */}
          <div className="hidden md:flex items-center shrink-0">
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsSignInModalOpen(true)}
                className="h-10 flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-[#3b6d11] px-3 border border-stone-200 rounded-xl hover:bg-stone-50 whitespace-nowrap transition shrink-0"
                title="Customer Sign In"
              >
                <User className="w-4 h-4 text-stone-600 shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>
            ) : (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="h-10 flex items-center gap-1.5 text-xs font-bold text-[#1c3809] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 rounded-xl whitespace-nowrap transition shadow-xs shrink-0"
                  title="View Your Account"
                >
                  {customer?.avatar_url ? (
                    <img
                      src={customer.avatar_url}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#3b6d11] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                      ✓
                    </div>
                  )}
                  <span className="whitespace-nowrap">
                    {customer?.name ? customer.name.split(' ')[0] : customer?.phone ? `+91 ${customer.phone}` : 'Account'}
                  </span>
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 hidden group-hover:block z-50 animate-in fade-in">
                  <div className="px-3.5 py-2.5 border-b border-stone-100 bg-stone-50/70 rounded-t-xl">
                    <div className="text-[10px] uppercase font-bold text-[#3b6d11]">Verified Customer</div>
                    <div className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                      {customer?.name || 'Customer'}
                    </div>
                    {customer?.phone ? (
                      <div className="text-[11px] font-mono text-stone-600 font-semibold">
                        +91 {customer.phone}
                      </div>
                    ) : customer?.email ? (
                      <div className="text-[11px] text-stone-500 truncate">
                        {customer.email}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(true)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#3b6d11] transition text-left"
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    <span>Your Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#3b6d11] transition text-left"
                  >
                    <Pencil className="w-4 h-4 text-stone-500" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOrderHistoryOpen(true)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#3b6d11] transition text-left"
                  >
                    <RotateCcw className="w-4 h-4 text-stone-500" />
                    <span>Orders &amp; Reorder</span>
                  </button>
                  <Link
                    href={`/track-order?query=${customer?.phone}`}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#3b6d11] transition"
                  >
                    <Truck className="w-4 h-4 text-stone-500" />
                    <span>Track Shipments</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#3b6d11] transition text-left"
                  >
                    <HelpCircle className="w-4 h-4 text-stone-500" />
                    <span>Help &amp; Support</span>
                  </button>
                  <div className="border-t border-stone-100 my-1"></div>
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}, total ₹${subtotal.toLocaleString('en-IN')}`}
            className="relative h-10 flex items-center gap-1.5 sm:gap-2 bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-95 text-white px-2.5 sm:px-3.5 rounded-xl font-bold shadow-sm whitespace-nowrap transition group shrink-0"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-105 transition shrink-0" />
            <div className="text-left hidden sm:flex flex-col justify-center leading-none">
              <div className="text-[9px] text-lime-200 uppercase font-semibold leading-tight">Cart</div>
              <div className="text-xs font-bold font-mono leading-tight">₹{subtotal.toLocaleString('en-IN')}</div>
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2b. Mobile Full-Width Search Bar */}
        <div className="lg:hidden px-3 pb-2 pt-0.5 bg-white border-t border-stone-100 relative">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={lang === 'kn' ? 'ತೆಂಗಿನಕಾಯಿ, ಕೊಬ್ಬರಿ, ತುಪ್ಪ ಹುಡುಕಿ...' : 'Search coconuts, copra, oils, spices...'}
            className="w-full pl-9 pr-8 py-2 rounded-full border border-stone-300 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] transition shadow-inner placeholder:text-stone-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 max-h-[360px] overflow-y-auto">
            <div className="p-2.5 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-100 flex justify-between items-center">
              <span>Matching ({searchResults.length})</span>
              <span className="text-[#3b6d11]">Direct Farm</span>
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
                  className="p-2.5 hover:bg-stone-50 flex items-center justify-between gap-3 group transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-[#3b6d11] truncate transition">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate mt-0.5">
                        {p.unit_of_measure} • <span className="text-emerald-700 font-semibold">{p.grade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-stone-900">
                      ₹{Number(p.retail_price_inr).toLocaleString('en-IN')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Strip / Mega-Menu (Katyayani Header Category Navigation) */}
      <div className="bg-stone-50 border-t border-stone-200/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-semibold text-stone-700 py-2.5 overflow-x-auto gap-6 scrollbar-none">
          <div className="flex items-center gap-6">
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              All Commodities ({allProducts.length || 11})
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Fresh Coconuts
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              GI Ball Copra
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Arecanut Bulk Lots
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Wood-Pressed Oils & Ghee
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Ragi Millet & Ginger
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Nursery Plants (Coconut & Areca)
            </Link>
            <Link href="/#catalog" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Raw Coconut Shells
            </Link>
          </div>
          <div className="flex items-center gap-4 text-[#3b6d11] font-bold shrink-0">
            <button onClick={onOpenRFQ} className="hover:underline flex items-center gap-1">
              <span>Container Export Lots</span> →
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
