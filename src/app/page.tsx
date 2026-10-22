'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import WholesaleRFQModal from '@/components/WholesaleRFQModal';
import EnquiryModal from '@/components/EnquiryModal';
import KatyayaniHero from '@/components/KatyayaniHero';
import ShopByCategory from '@/components/ShopByCategory';
import ExploreRange from '@/components/ExploreRange';
import FarmerTestimonials from '@/components/FarmerTestimonials';
import RealResultsTransparency from '@/components/RealResultsTransparency';
import UspTrustBand from '@/components/UspTrustBand';
import CommercialInquiryFaq from '@/components/CommercialInquiryFaq';
import HomeCtaBanner from '@/components/HomeCtaBanner';
import Footer from '@/components/Footer';
import GradingGuide from '@/components/GradingGuide';
import { Product } from '@/types';
import { Sparkles, Truck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [selectedProductForRFQ, setSelectedProductForRFQ] = useState<Product | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
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

  const handleOpenRFQ = (product?: Product) => {
    if (product) {
      setSelectedProductForRFQ(product);
    } else {
      setSelectedProductForRFQ(null);
    }
    setIsRFQOpen(true);
  };

  const displayedProducts = filteredCategory === 'all'
    ? products
    : products.filter((p) => p.category === filteredCategory);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-[#3b6d11]/20 selection:text-[#1c3809]">
      {/* 1. Global Header with Live Search, Pincode Pill & Ticker */}
      <Navbar
        onOpenRFQ={() => handleOpenRFQ()}
        onOpenEnquiry={() => setIsEnquiryOpen(true)}
      />
      <CartDrawer />

      <main className="flex-1">
        {/* 1. Bestsellers Showcase & Direct Catalog (Target Sales First - Top of Page) */}
        <section id="catalog" className="pt-6 sm:pt-8 pb-14 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Certified Farm-Gate Lots</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
                Our Bestsellers
              </h1>
              <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xl">
                Lab-tested, buyer-trusted agricultural commodities for food processors, oil millers, temples &amp; households
              </p>
            </div>

            {/* Category Filter Tabs (Katyayani Tab Pills) */}
            <div className="flex flex-wrap gap-1.5 bg-stone-200/80 p-1.5 rounded-2xl w-fit">
              {[
                { id: 'all', label: 'All Commodities (10)' },
                { id: 'mature_coconut', label: 'Fresh Coconuts' },
                { id: 'copra', label: 'GI Ball Copra' },
                { id: 'oil_and_extracts', label: 'Wood-Pressed Oils & Ghee' },
                { id: 'spices', label: 'Ragi & Ginger' },
                { id: 'value_added', label: 'Nursery Plants' },
                { id: 'coir_commodities', label: 'Coconut Shells' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilteredCategory(tab.id)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                    filteredCategory === tab.id
                      ? 'bg-[#3b6d11] text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid (Katyayani pcard-grid) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-96 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
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

        {/* 2. Shop by Category (Katyayani mc-section) */}
        <ShopByCategory
          activeCategory={filteredCategory}
          onSelectCategory={(cat) => {
            setFilteredCategory(cat);
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Transportation & Shiprocket Rate Calculator Banner (coconutseller.in Standard) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 mb-8">
          <div className="bg-gradient-to-r from-[#1c3809] to-[#254b0d] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-[#2d5a0b]">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-lime-400/20 text-lime-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4 text-lime-300" />
                <span>Pan-India Agricultural Logistics (coconutseller.in Standard)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Transportation Charged Extra — Genuine Freight at Actuals
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
                Check instant courier rates via our Shiprocket-powered engine or book dedicated 10T, 25T, and 30T multi-axle lorries direct from Mandya APMC.
              </p>
            </div>

            <Link
              href="/transportation"
              className="bg-lime-400 hover:bg-lime-300 active:scale-95 text-[#1c3809] font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition shadow-lg flex items-center gap-2 shrink-0 group"
            >
              <span>Calculate Freight Rates</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </section>

        {/* 4. Katyayani Organics Hero & Sourcing Credibility */}
        <KatyayaniHero onOpenRFQ={() => handleOpenRFQ()} />

        {/* 5. Purpose-Driven Sourcing & Industry Solutions (Katyayani shopby) */}
        <ExploreRange
          onSelectCategory={(cat) => {
            setFilteredCategory(cat);
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 6. USP Trust Band (Katyayani app-band) */}
        <UspTrustBand />

        {/* 7. Verified Customer Proof & Farmer Testimonials (Katyayani trustproof) */}
        <FarmerTestimonials />

        {/* 8. Farm-Gate Transparency & Lab Testing (Katyayani tv-section) */}
        <RealResultsTransparency />

        {/* 9. APMC Grading Standards & Guide */}
        <GradingGuide />

        {/* 10. Commercial Sourcing Form & Accordion FAQ (Katyayani home-form-faq) */}
        <CommercialInquiryFaq />

        {/* 11. Final Conversion CTA Banner (Katyayani home-cta) */}
        <HomeCtaBanner onOpenRFQ={() => handleOpenRFQ()} />
      </main>

      {/* 12. Rich Agricultural Footer with Payment Badges & Newsletter */}
      <Footer />

      {/* 14. Wholesale RFQ Modal */}
      <WholesaleRFQModal
        isOpen={isRFQOpen}
        onClose={() => setIsRFQOpen(false)}
        products={products}
        selectedProduct={selectedProductForRFQ}
      />

      {/* 15. Enquire Farm Modal (Verified Once via OTP, Editable Anytime) */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
}
