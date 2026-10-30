'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import WholesaleRFQModal from '@/components/WholesaleRFQModal';
import EnquiryModal from '@/components/EnquiryModal';
import Footer from '@/components/Footer';
import ActiveOrderBanner from '@/components/ActiveOrderBanner';
import GlobalExportCorridors from '@/components/GlobalExportCorridors';
import SiteVisitorCounter from '@/components/SiteVisitorCounter';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { getAllCatalogProducts } from '@/lib/catalog';
import { searchMatchesProduct } from '@/lib/search-matcher';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Search,
  X
} from 'lucide-react';

function isBulkOnly(product: Product): boolean {
  return Boolean(
    product.sku.includes('BLK') ||
    product.sku.includes('TND') ||
    product.sku.includes('GIN') ||
    product.sku.includes('SHL') ||
    product.sku.includes('CHR') ||
    product.category === 'arecanut' ||
    product.slug.includes('tender') ||
    product.slug.includes('ginger') ||
    product.slug.includes('shell') ||
    product.slug.includes('charcoal') ||
    product.slug.includes('arecanut')
  );
}

type CatalogTab = 'all' | 'retail' | 'bulk' | 'nursery';

function isNursery(product: Product): boolean {
  return Boolean(
    product.sku.startsWith('NUR') ||
    product.slug.includes('sapling') ||
    product.category === 'value_added'
  );
}

function isWholesaleBulk(product: Product): boolean {
  if (isNursery(product)) return false;
  return Boolean(
    isBulkOnly(product) ||
    product.sku.includes('BOX') ||
    product.category === 'arecanut'
  );
}

function isRetailPantry(product: Product): boolean {
  return !isNursery(product) && !isWholesaleBulk(product);
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(() => getAllCatalogProducts());
  const [activeTab, setActiveTab] = useState<CatalogTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [selectedProductForRFQ, setSelectedProductForRFQ] = useState<Product | null>(null);
  const [rfqCountry, setRfqCountry] = useState<string>('India');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const { lang } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearchQuery(q);
    }
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleOpenRFQ = (product?: Product | null, country?: string) => {
    setSelectedProductForRFQ(product || null);
    setRfqCountry(country || 'India');
    setIsRFQOpen(true);
  };

  const filteredBySearch = searchQuery.trim()
    ? products.filter((p) => searchMatchesProduct(p, searchQuery))
    : products;

  const tabCounts = {
    all: filteredBySearch.length,
    retail: filteredBySearch.filter(isRetailPantry).length,
    bulk: filteredBySearch.filter(isWholesaleBulk).length,
    nursery: filteredBySearch.filter(isNursery).length,
  };

  const displayedProducts = filteredBySearch
    .filter((product) => {
      if (activeTab === 'retail') return isRetailPantry(product);
      if (activeTab === 'bulk') return isWholesaleBulk(product);
      if (activeTab === 'nursery') return isNursery(product);
      return true;
    })
    .sort((a, b) => {
      if (activeTab === 'all') {
        const aBulk = isWholesaleBulk(a);
        const bBulk = isWholesaleBulk(b);
        if (aBulk === bBulk) return 0;
        return aBulk ? 1 : -1;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenRFQ={() => handleOpenRFQ()}
        onOpenEnquiry={() => setIsEnquiryOpen(true)}
        searchQueryValue={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
      />
      <CartDrawer />

      <main className="flex-1">
        {/* 1. BigHaat-Style Active Order Toast Strip & Recently Ordered Shelf */}
        <ActiveOrderBanner />

        {/* Above-the-Fold Value Proposition & Agro-Export Introduction Banner */}
        <section className="bg-gradient-to-b from-stone-100 to-stone-50 border-b border-stone-200/80 py-5 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Karnataka Agricultural Direct Supply &amp; Global Agro-Export</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight leading-snug">
                    Direct-From-Farm Karnataka Produce &amp; Industrial Commodities
                  </h1>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    Sourced straight from certified grower belts in <span className="font-semibold text-stone-900">Tiptur, Mandya, Shimoga &amp; Coastal Karnataka</span>. Zero commission middlemen, lab-tested grading, and transparent mandi benchmark pricing.
                  </p>

                  {/* 3 Quick Value Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1 text-xs text-stone-700">
                    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/70 rounded-xl px-3 py-2">
                      <span className="text-emerald-700 font-extrabold text-sm">✓</span>
                      <span><strong>Home Pantry:</strong> 24h Pan-India Courier</span>
                    </div>
                    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/70 rounded-xl px-3 py-2">
                      <span className="text-emerald-700 font-extrabold text-sm">✓</span>
                      <span><strong>Bulk Traders:</strong> Canter/FTL &amp; Ocean FCL</span>
                    </div>
                    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/70 rounded-xl px-3 py-2">
                      <span className="text-emerald-700 font-extrabold text-sm">✓</span>
                      <span><strong>Statutory:</strong> FSSAI • APEDA • DGFT IEC</span>
                    </div>
                  </div>
                </div>

                {/* Dual Action CTAs */}
                <div className="flex flex-row sm:flex-col lg:flex-col gap-2.5 shrink-0 justify-stretch sm:justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('retail');
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#3b6d11] hover:bg-[#2e550d] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition"
                  >
                    <span>Shop Retail Produce</span>
                    <span className="text-lime-200 font-mono">↓</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenRFQ()}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition"
                  >
                    <span>Request Bulk / Export Quote</span>
                    <span className="text-amber-400 font-mono">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Clean Catalog Section ("Select produce & order") */}
        <section id="catalog" className="pt-5 sm:pt-6 pb-12 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {lang === 'kn' ? 'ನಿಮ್ಮ ಫಾರ್ಮ್ ಉತ್ಪನ್ನಗಳನ್ನು ಆರಿಸಿ' : 'Select Your Produce'}
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
                {lang === 'kn'
                  ? 'ಕರ್ನಾಟಕದ ತೋಟಗಳಿಂದ ನೇರ ರವಾನೆ • 100% ಉಚಿತ ಮನೆ ಬಾಗಿಲು ಡೆಲಿವರಿ.'
                  : 'Authentic, lab-graded lots with direct farm dispatch in 24 hours.'}
              </p>
            </div>

            {/* Catalog Group Tabs: All | Retail | Bulk | Nursery */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Produce', icon: '🌾' },
                { id: 'retail', label: 'Home Pantry & Retail', icon: '🛒' },
                { id: 'bulk', label: 'Wholesale & Bulk', icon: '🚛' },
                { id: 'nursery', label: 'Farm Nursery', icon: '🌱' },
              ].map((tab) => {
                const count = tabCounts[tab.id as CatalogTab];
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as CatalogTab)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      isActive
                        ? 'bg-[#1c3809] text-white ring-2 ring-[#3b6d11]/40 shadow-sm'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-lime-300 text-stone-950 font-extrabold' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Query Filter Pill */}
          {searchQuery.trim() && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 sm:px-4 shadow-2xs">
              <div className="text-xs sm:text-sm text-emerald-950 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b6d11] animate-pulse"></span>
                <span>
                  Showing produce matching <span className="font-extrabold text-[#1c3809]">&ldquo;{searchQuery}&rdquo;</span> ({displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'} found)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100/50 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs transition flex items-center gap-1"
              >
                <span>Clear Filter</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Product Grid - Compact 4 columns on desktop, retail first, bulk-only last */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 py-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl h-72 animate-pulse border border-stone-200"
                />
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-stone-300 my-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                No agricultural produce found for &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try searching for coconuts, copra, coconut oil, groundnut oil, ragi, or ghee.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#3b6d11] hover:bg-[#2e550d] text-white text-xs font-bold rounded-xl shadow transition"
              >
                View All 14 Commodities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectForRFQ={(p) => handleOpenRFQ(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. Global Ocean Container Export Corridors */}
        <GlobalExportCorridors onOpenRFQ={(country) => handleOpenRFQ(null, country)} />

        {/* 5. Minimal, Reassuring Trust Strip */}
        <section className="bg-stone-100/80 border-y border-stone-200 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#1e824c]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Direct Farm Origin</div>
                  <div className="text-[11px] text-stone-500">Zero broker commissions</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-100 text-[#1c3809] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#3b6d11]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Free Doorstep Courier</div>
                  <div className="text-[11px] text-stone-500">Retail parcels Pan-India • B2B freight at actuals</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">100% Spoilage Guarantee</div>
                  <div className="text-[11px] text-stone-500">Free transit replacement</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#1e824c]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Direct WhatsApp Desk</div>
                  <div className="text-[11px] text-stone-500">+91 90084 62568 (7am–9pm)</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Live App Traffic & Public Site Visitor Counter */}
      <SiteVisitorCounter />

      {/* 7. Minimalist Legal & Contact Footer */}
      <Footer />

      {/* 7. On-demand Wholesale RFQ Modal */}
      <WholesaleRFQModal
        isOpen={isRFQOpen}
        onClose={() => setIsRFQOpen(false)}
        products={products}
        selectedProduct={selectedProductForRFQ}
        initialCountry={rfqCountry}
      />

      {/* 7. On-demand Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
}
