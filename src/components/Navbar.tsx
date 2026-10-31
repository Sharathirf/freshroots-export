'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { getAllCatalogProducts } from '@/lib/catalog';
import { searchMatchesProduct } from '@/lib/search-matcher';

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
  onOpenEnquiry: _onOpenEnquiry,
  searchQueryValue,
  onSearchChange
}: {
  onOpenRFQ?: () => void;
  onOpenEnquiry?: () => void;
  searchQueryValue?: string;
  onSearchChange?: (query: string) => void;
}) {
  const router = useRouter();
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
  const [searchQuery, setSearchQuery] = useState(searchQueryValue || '');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(() => getAllCatalogProducts());
  const [copraMandiRate, setCopraMandiRate] = useState(FALLBACK_COPRA_RATE);
  const [arecanutMandiRate, setArecanutMandiRate] = useState(FALLBACK_ARECANUT_RATE);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Sync external search query updates (e.g. from Home page clear filter)
  useEffect(() => {
    if (searchQueryValue !== undefined) {
      setSearchQuery(searchQueryValue);
    }
  }, [searchQueryValue]);

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

  // Click outside to close search dropdown (supporting both desktop and mobile containers)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        (searchRef.current && searchRef.current.contains(target)) ||
        (mobileSearchRef.current && mobileSearchRef.current.contains(target))
      ) {
        return;
      }
      setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Preload live products for search
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.error('Navbar search catalog preload error:', err);
      }
    }
    loadCatalog();
  }, []);

  // Filter search results using intelligent multi-term & Kannada transliteration matcher
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const matches = allProducts.filter((p) => searchMatchesProduct(p, q));
    setSearchResults(matches);
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearchOpen(false);
    if (onSearchChange) {
      onSearchChange(q);
    }

    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      const el = document.getElementById('catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (searchResults.length > 0) {
      router.push(`/products/${searchResults[0].slug}`);
    } else {
      router.push(`/?search=${encodeURIComponent(q)}#catalog`);
    }
  };

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
              <Link
                href="/wholesale/mandi-rates"
                className="hover:text-white font-semibold text-lime-100"
                title="View full Karnataka APMC mandi benchmark rates & live truckload pricing"
              >
                Copra max: ₹{copraMandiRate.pricePerQuintal.toLocaleString('en-IN')}/qtl · Arecanut: ₹{arecanutMandiRate.pricePerQuintal.toLocaleString('en-IN')}/qtl
              </Link>
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4 text-emerald-100 font-medium shrink-0 text-[10px] sm:text-[11px]">
            <Link
              href="/export"
              className="hover:text-white flex items-center gap-1 transition text-lime-200 hover:text-white font-semibold hidden md:flex"
            >
              <span>Export Desk</span>
            </Link>
            <span className="text-emerald-300/60 hidden md:inline">•</span>
            <Link
              href="/export/ball-copra-india"
              className="hover:text-white flex items-center gap-1 transition text-lime-200 hover:text-white font-semibold hidden lg:flex"
            >
              <span>Ball Copra (FCL)</span>
            </Link>
            <span className="text-emerald-300/60 hidden lg:inline">•</span>
            <Link
              href="/wholesale/mandi-rates"
              className="hover:text-white flex items-center gap-1 transition text-lime-200 hover:text-white font-semibold hidden sm:flex"
            >
              <span>Mandi Rates</span>
            </Link>
            <span className="text-emerald-300/60 hidden sm:inline">•</span>
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
              href="https://wa.me/919008462568"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition hidden sm:flex"
            >
              <Phone className="w-3 h-3 text-lime-300" />
              90084 62568
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
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <button
              type="submit"
              aria-label="Search produce"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#3b6d11] transition"
            >
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search coconuts, copra, coconut oil, spices, flours..."
              className="w-full pl-12 pr-10 py-3 rounded-full border border-stone-300/90 text-sm bg-stone-50/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] focus:border-transparent transition shadow-inner placeholder:text-stone-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 animate-in fade-in max-h-[440px] overflow-y-auto w-full">
              {searchResults.length > 0 ? (
                <>
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
                          if (onSearchChange) onSearchChange('');
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
                </>
              ) : (
                <div className="p-4 sm:p-5 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-stone-700">
                    No produce matching &ldquo;{searchQuery}&rdquo; found
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Try searching for:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
                    {['Coconut Oil', 'Tiptur Copra', 'Cow Ghee', 'Ragi Flour', 'Rice Flour', 'Tender Coconuts', 'Groundnut Oil'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          if (onSearchChange) onSearchChange(tag);
                        }}
                        className="text-[11px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2.5 py-1 rounded-full transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Customer Sign In / Account Dropdown (Desktop & Mobile Header) */}
          <div className="flex items-center shrink-0">
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsSignInModalOpen(true)}
                className="h-9 sm:h-10 flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-stone-700 hover:text-[#3b6d11] px-2 sm:px-3 border border-stone-200 rounded-xl hover:bg-stone-50 whitespace-nowrap transition shrink-0"
                title="Customer Sign In & Sign Up"
              >
                <User className="w-4 h-4 text-stone-600 shrink-0" />
                <span className="whitespace-nowrap">Sign In / Up</span>
              </button>
            ) : (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="h-9 sm:h-10 flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-[#1c3809] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 sm:px-3 rounded-xl whitespace-nowrap transition shadow-xs shrink-0"
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
      <div ref={mobileSearchRef} className="lg:hidden px-3 pb-2 pt-0.5 bg-white border-t border-stone-100 relative">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <button
            type="submit"
            aria-label="Search produce"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#3b6d11] transition"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={lang === 'kn' ? 'ತೆಂಗಿನಕಾಯಿ, ಕೊಬ್ಬರಿ, ತೆಂಗಿನ ಎಣ್ಣೆ, ಹಿಟ್ಟು ಹುಡುಕಿ...' : 'Search coconuts, copra, coconut oil, flours...'}
            className="w-full pl-9 pr-8 py-2 rounded-full border border-stone-300 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] transition shadow-inner placeholder:text-stone-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (onSearchChange) onSearchChange('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 max-h-[360px] overflow-y-auto">
            {searchResults.length > 0 ? (
              <>
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
                        if (onSearchChange) onSearchChange('');
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
              </>
            ) : (
              <div className="p-3.5 text-center">
                <p className="text-xs font-semibold text-stone-700">
                  No produce matching &ldquo;{searchQuery}&rdquo; found
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  {['Coconut Oil', 'Copra', 'Cow Ghee', 'Ragi Flour', 'Rice Flour'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        if (onSearchChange) onSearchChange(tag);
                      }}
                      className="text-[10px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2 py-0.5 rounded-full transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            <Link href="/category/mature-coconut" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Fresh Coconuts
            </Link>
            <Link href="/category/copra" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              GI Ball Copra
            </Link>
            <Link href="/category/arecanut" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Arecanut Bulk Lots
            </Link>
            <Link href="/category/oil-and-extracts" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Wood-Pressed Oils & Ghee
            </Link>
            <Link href="/category/spices" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Millets & Flours
            </Link>
            <Link href="/category/nursery-plants" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Nursery Plants (Coconut & Areca)
            </Link>
            <Link href="/category/coir-commodities" className="hover:text-[#3b6d11] whitespace-nowrap transition">
              Biomass & Shells
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
