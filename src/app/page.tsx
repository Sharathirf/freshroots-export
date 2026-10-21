'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import WholesaleRFQModal from '@/components/WholesaleRFQModal';
import KatyayaniHero from '@/components/KatyayaniHero';
import ShopByCategory from '@/components/ShopByCategory';
import ExploreRange from '@/components/ExploreRange';
import FarmerTestimonials from '@/components/FarmerTestimonials';
import RealResultsTransparency from '@/components/RealResultsTransparency';
import UspTrustBand from '@/components/UspTrustBand';
import CommercialInquiryFaq from '@/components/CommercialInquiryFaq';
import HomeCtaBanner from '@/components/HomeCtaBanner';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import GradingGuide from '@/components/GradingGuide';
import { Product } from '@/types';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [selectedProductForRFQ, setSelectedProductForRFQ] = useState<Product | null>(null);

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
      <Navbar onOpenRFQ={() => handleOpenRFQ()} />
      <CartDrawer />

      <main className="flex-1">
        {/* 2. Katyayani Organics Hero Section */}
        <KatyayaniHero onOpenRFQ={() => handleOpenRFQ()} />

        {/* 3. Shop by Category (Katyayani mc-section) */}
        <ShopByCategory
          activeCategory={filteredCategory}
          onSelectCategory={(cat) => {
            setFilteredCategory(cat);
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4. Bestsellers Showcase (Katyayani section bestsellers) */}
        <section id="catalog" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Certified Farm-Gate Lots</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Our Bestsellers
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xl">
                Lab-tested, buyer-trusted agricultural commodities for food processors, oil millers, temples & households
              </p>
            </div>

            {/* Category Filter Tabs (Katyayani Tab Pills) */}
            <div className="flex flex-wrap gap-1.5 bg-stone-200/80 p-1.5 rounded-2xl w-fit">
              {[
                { id: 'all', label: 'All Commodities' },
                { id: 'mature_coconut', label: 'Coconuts' },
                { id: 'copra', label: 'Copra' },
                { id: 'spices', label: 'Spices' },
                { id: 'oil_and_extracts', label: 'Cold-Pressed Oils' },
                { id: 'coir_commodities', label: 'Coir Pith' }
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

      {/* 13. Mobile Bottom Navigation Bar (Katyayani bottom-nav) */}
      <MobileBottomNav onOpenRFQ={() => handleOpenRFQ()} />

      {/* 14. Wholesale RFQ Modal */}
      <WholesaleRFQModal
        isOpen={isRFQOpen}
        onClose={() => setIsRFQOpen(false)}
        products={products}
        selectedProduct={selectedProductForRFQ}
      />
    </div>
  );
}
