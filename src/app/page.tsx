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
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { getAllCatalogProducts } from '@/lib/catalog';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';

function isBulkOnly(product: Product): boolean {
  return Boolean(
    product.sku.includes('BLK') ||
    product.sku.includes('TND') ||
    product.sku.includes('GIN') ||
    product.sku.includes('SHL') ||
    product.category === 'arecanut' ||
    product.slug.includes('tender') ||
    product.slug.includes('ginger') ||
    product.slug.includes('shell') ||
    product.slug.includes('arecanut')
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(() => getAllCatalogProducts());
  const [loading, setLoading] = useState(false);
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [selectedProductForRFQ, setSelectedProductForRFQ] = useState<Product | null>(null);
  const [rfqCountry, setRfqCountry] = useState<string>('India');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const { lang } = useAuth();

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

  const handleOpenRFQ = (product?: Product | null, country?: string) => {
    setSelectedProductForRFQ(product || null);
    setRfqCountry(country || 'India');
    setIsRFQOpen(true);
  };

  const displayedProducts = [...products].sort((a, b) => {
    const aBulk = isBulkOnly(a);
    const bBulk = isBulkOnly(b);
    if (aBulk === bBulk) return 0;
    return aBulk ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenRFQ={() => handleOpenRFQ()}
        onOpenEnquiry={() => setIsEnquiryOpen(true)}
      />
      <CartDrawer />

      <main className="flex-1">
        {/* 1. BigHaat-Style Active Order Toast Strip & Recently Ordered Shelf */}
        <ActiveOrderBanner />

        {/* 2. Clean Catalog Section ("Select produce & order") */}
        <section id="catalog" className="pt-3 sm:pt-4 pb-12 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {lang === 'kn' ? 'ನಿಮ್ಮ ಫಾರ್ಮ್ ಉತ್ಪನ್ನಗಳನ್ನು ಆರಿಸಿ' : 'Select Your Produce'}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              {lang === 'kn'
                ? 'ಕರ್ನಾಟಕದ ತೋಟಗಳಿಂದ ನೇರ ರವಾನೆ • 100% ಉಚಿತ ಮನೆ ಬಾಗಿಲು ಡೆಲಿವರಿ.'
                : 'Authentic, lab-graded lots with direct farm dispatch in 24 hours.'}
            </p>
          </div>

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

      {/* 6. Minimalist Legal & Contact Footer */}
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
