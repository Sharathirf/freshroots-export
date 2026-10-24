'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import WholesaleRFQModal from '@/components/WholesaleRFQModal';
import EnquiryModal from '@/components/EnquiryModal';
import Footer from '@/components/Footer';
import ActiveOrderBanner from '@/components/ActiveOrderBanner';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import {
  Sparkles,
  Truck,
  RotateCcw,
  User,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [selectedProductForRFQ, setSelectedProductForRFQ] = useState<Product | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const {
    customer,
    isLoggedIn,
    setIsAccountModalOpen,
    setIsSignInModalOpen,
    setIsOrderHistoryOpen,
    setIsHelpOpen,
    lang
  } = useAuth();

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

  const displayedProducts =
    filteredCategory === 'all'
      ? products
      : products.filter((p) => p.category === filteredCategory);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-[#3b6d11]/20 selection:text-[#1c3809]">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenRFQ={() => handleOpenRFQ()}
        onOpenEnquiry={() => setIsEnquiryOpen(true)}
      />
      <CartDrawer />

      <main className="flex-1">
        {/* 1. Persistent Active Order Banner (Appears immediately after placing order - No typing required!) */}
        <ActiveOrderBanner />

        {/* 2. Fast Utility Hero Banner with 4 Direct Action Hubs */}
        <section className="bg-gradient-to-b from-stone-100/90 to-stone-50 border-b border-stone-200/80 pt-6 pb-8 sm:pt-10 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left Title & Tag */}
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3b6d11] bg-emerald-100/70 border border-emerald-300 px-3 py-0.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'kn'
                      ? 'ಮಂಡ್ಯ ಎ.ಪಿ.ಎಂ.ಸಿ ಮಾರುಕಟ್ಟೆಯಿಂದ ನೇರ ಖರೀದಿ • ರೈತರ ಬೆಳೆ'
                      : 'Direct APMC Mandi Sourcing • Hand-Graded Lots'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                  {lang === 'kn' ? (
                    <>ಬನ್ನಿ. ಆರಿಸಿ. ಆರ್ಡರ್ ಮಾಡಿ.<br className="hidden sm:inline" /> ಮನೆ ಬಾಗಿಲಿಗೆ ತಾಜಾ ಡೆಲಿವರಿ.</>
                  ) : (
                    <>Come. Select. Order.<br className="hidden sm:inline" /> Fast Farm Delivery.</>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                  {lang === 'kn'
                    ? 'ಯಾವುದೇ ದಲ್ಲಾಳಿಗಳಿಲ್ಲ. ಶುದ್ಧ ಹಳ್ಳಿಯ ಹಸುವಿನ ತುಪ್ಪ, ತಿಪಟೂರು ಉಂಡೆ ಕೊಬ್ಬರಿ, ಮಂಡ್ಯ ನಾಟಿ ರಾಗಿ ಮತ್ತು ಮಟ್ಟೆ ಸುಲಿದ ತೆಂಗಿನಕಾಯಿಗಳನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ ತಲುಪಿಸುತ್ತೇವೆ. ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳಿಗೂ 100% ಉಚಿತ ಡೆಲಿವರಿ.'
                    : 'No middlemen markup. Order pure Desi Cow Ghee, GI Tiptur Ball Copra, Karnataka Ragi, and fresh mature coconuts direct to your doorstep. 100% Free Doorstep Delivery on ALL orders.'}
                </p>
              </div>

              {/* Right: 4 Direct Quick-Action Utility Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
                {/* 1. Track Order & Exit */}
                <Link
                  href="/track-order"
                  className="bg-white hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-300 p-3 rounded-2xl flex flex-col items-center text-center transition shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-lime-100 text-[#1c3809] flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                    <Truck className="w-4 h-4 text-[#3b6d11]" />
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {lang === 'kn' ? 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Order'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {lang === 'kn' ? 'ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್' : 'Live courier map'}
                  </span>
                </Link>

                {/* 2. Order History & Reorder */}
                <button
                  type="button"
                  onClick={() => setIsOrderHistoryOpen(true)}
                  className="bg-white hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-300 p-3 rounded-2xl flex flex-col items-center text-center transition shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                    <RotateCcw className="w-4 h-4 text-[#1e824c]" />
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {lang === 'kn' ? 'ಹಿಂದಿನ ಆರ್ಡರ್' : 'Past Orders'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {lang === 'kn' ? '1-ಟ್ಯಾಪ್ ಮರು ಆರ್ಡರ್' : '1-Tap Reorder'}
                  </span>
                </button>

                {/* 3. Customer Profile */}
                <button
                  type="button"
                  onClick={() => {
                    if (isLoggedIn) {
                      setIsAccountModalOpen(true);
                    } else {
                      setIsSignInModalOpen(true);
                    }
                  }}
                  className="bg-white hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-300 p-3 rounded-2xl flex flex-col items-center text-center transition shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                    <User className="w-4 h-4 text-stone-700" />
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {lang === 'kn'
                      ? 'ನಿಮ್ಮ ಖಾತೆ'
                      : isLoggedIn && customer?.name
                      ? customer.name.split(' ')[0]
                      : 'Your Profile'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {lang === 'kn' ? 'ವಿಳಾಸ & ವಿವರ' : isLoggedIn ? 'Saved address' : 'Sign in fast'}
                  </span>
                </button>

                {/* 4. Help Desk */}
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="bg-white hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-300 p-3 rounded-2xl flex flex-col items-center text-center transition shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {lang === 'kn' ? 'ರೈತ ಸಹಾಯ' : 'Agri Help'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {lang === 'kn' ? 'ವಾಟ್ಸಾಪ್ / ಕರೆ' : 'WhatsApp & Call'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Clean Catalog Section ("Select produce & order") */}
        <section id="catalog" className="pt-6 sm:pt-8 pb-14 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {lang === 'kn' ? 'ನಿಮ್ಮ ಫಾರ್ಮ್ ಉತ್ಪನ್ನಗಳನ್ನು ಆರಿಸಿ' : 'Select Your Produce'}
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
                {lang === 'kn'
                  ? 'ಮಂಡ್ಯ ಎ.ಪಿ.ಎಂ.ಸಿ ಯಿಂದ ನೇರ ರವಾನೆ • 100% ಉಚಿತ ಮನೆ ಬಾಗಿಲು ಡೆಲಿವರಿ.'
                  : 'Authentic, lab-graded lots with direct farm dispatch in 24 hours.'}
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-stone-200/80 p-1.5 rounded-2xl w-fit">
              {[
                { id: 'all', label: lang === 'kn' ? 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು (10)' : 'All Produce (10)' },
                { id: 'mature_coconut', label: lang === 'kn' ? 'ತಾಜಾ ತೆಂಗಿನಕಾಯಿ' : 'Fresh Coconuts' },
                { id: 'copra', label: lang === 'kn' ? 'ಉಂಡೆ ಕೊಬ್ಬರಿ' : 'GI Ball Copra' },
                { id: 'oil_and_extracts', label: lang === 'kn' ? 'ತುಪ್ಪ & ಗಾಣದ ಎಣ್ಣೆ' : 'Ghee & Cold-Pressed Oils' },
                { id: 'spices', label: lang === 'kn' ? 'ರಾಗಿ & ಶುಂಠಿ' : 'Ragi & Spices' },
                { id: 'value_added', label: lang === 'kn' ? 'ತೋಟದ ಸಸಿಗಳು' : 'Nursery Plants' },
                { id: 'coir_commodities', label: lang === 'kn' ? 'ತೆಂಗಿನ ಚಿಪ್ಪು' : 'Coconut Shells' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilteredCategory(tab.id)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
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

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl h-96 animate-pulse border border-stone-200"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
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

        {/* 4. Minimal, Reassuring Trust Strip */}
        <section className="bg-stone-100/80 border-y border-stone-200 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#1e824c]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Direct APMC Origin</div>
                  <div className="text-[11px] text-stone-500">Zero broker commissions</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-100 text-[#1c3809] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#3b6d11]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">100% Free Doorstep Delivery</div>
                  <div className="text-[11px] text-stone-500">All orders • No minimum quantity</div>
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
                  <div className="text-[11px] text-stone-500">+91 95911 42548 (7am–9pm)</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Minimalist Legal & Contact Footer */}
      <Footer />

      {/* 6. On-demand Wholesale RFQ Modal */}
      <WholesaleRFQModal
        isOpen={isRFQOpen}
        onClose={() => setIsRFQOpen(false)}
        products={products}
        selectedProduct={selectedProductForRFQ}
      />

      {/* 7. On-demand Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
}
