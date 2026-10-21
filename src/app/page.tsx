'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import WholesaleRFQModal from '@/components/WholesaleRFQModal';
import GradingGuide from '@/components/GradingGuide';
import { Product } from '@/types';
import { Sprout, Building2, ShoppingBag, Truck, ShieldCheck, Award, ArrowRight, CheckCircle2, Phone, Star } from 'lucide-react';

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
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <Navbar onOpenRFQ={() => handleOpenRFQ()} />
      <CartDrawer />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Vision & Pitch */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>Direct Farm-Gate Procurement • Tiptur & Tumakuru Belt</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  Karnataka&apos;s Finest Coconuts & Copra,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-100">
                    Direct from Origin.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                  No commission agents. No hidden weight deductions. Buy laboratory-graded mature coconuts and GI-tagged Tiptur ball copra with guaranteed weight classifications and swift dispatch.
                </p>

                {/* Dual Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  <a
                    href="#catalog"
                    className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-sm sm:text-base px-7 py-4 rounded-2xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 group"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Shop Retail Bags (Home & Puja)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </a>

                  <button
                    onClick={() => handleOpenRFQ()}
                    className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm sm:text-base px-7 py-4 rounded-2xl backdrop-blur-sm transition flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-5 h-5 text-amber-300" />
                    <span>Request Wholesale Quote (500+)</span>
                  </button>
                </div>

                {/* Trust Signals */}
                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-emerald-800/60 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero Cracked Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>GI-Tagged Ball Copra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>24h Hub Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>0% GST on Fresh Produce</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Featured Lot Card */}
              <div className="lg:col-span-5">
                <div className="bg-stone-900/90 border border-stone-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                      Live Harvest Lot #TIP-2026-A
                    </span>
                    <span className="text-xs text-stone-400">Tiptur APMC Yard</span>
                  </div>

                  <div className="relative h-52 w-full rounded-2xl overflow-hidden mb-5">
                    <img
                      src="https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=800&q=80"
                      alt="Grade A Coconuts"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-stone-950/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      11-12 Month Maturity
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white">Grade A Dehusked Jumbo Coconuts</h3>
                  <p className="text-xs text-stone-400 mt-1">
                    550g - 650g heavy nuts • High meat density (&gt;12mm) • Pure sweet acoustic water
                  </p>

                  <div className="mt-4 pt-4 border-t border-stone-800 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-stone-400 block">Retail 50-Nut Mesh Bag</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">₹1,650</span>
                      <span className="text-xs text-stone-400 ml-1.5">(₹33/nut)</span>
                    </div>

                    <a
                      href="#catalog"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <span>Order Lot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATALOG SECTION (Milestone 3) */}
        <section id="catalog" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                Certified Agricultural Catalog
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Current Agricultural Lots Available for Dispatch
              </h2>
              <p className="text-stone-600 text-sm mt-1 max-w-xl">
                Every lot inspected at our Tiptur Hub. Retail units packed in breathable HDPE mesh bags; bulk lots shipped in standard gunny sacks or corrugated master cartons.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Lots' },
                { id: 'mature_coconut', label: 'Mature Coconuts' },
                { id: 'copra', label: 'Ball & Milling Copra' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilteredCategory(tab.id)}
                  className={`text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition ${
                    filteredCategory === tab.id
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-96 animate-pulse border border-stone-200 p-4" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* B2B COMMERCIAL ENTERPRISE SECTION */}
        <section className="bg-stone-900 text-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-8 sm:p-12 border border-stone-700 shadow-xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
                    <Building2 className="w-3.5 h-3.5" />
                    For Oil Expeller Mills, HoReCa & Supermarkets
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Procuring Truckloads or Tempo Lots (500 to 20,000+ Units)?
                  </h3>
                  <p className="text-stone-300 text-sm leading-relaxed max-w-2xl">
                    Get direct Mandi-linked pricing with guaranteed 48-hour price locks. We supply cold-pressed oil manufacturers, large South Indian catering firms, and supermarket chains across Karnataka and South India with full GST ITC compliance and official weighbridge certification.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-stone-300 pt-2">
                    <span>✓ Dedicated Canter / 10-Wheeler Logistics</span>
                    <span>✓ 100% Digital Weighbridge Slips</span>
                    <span>✓ Custom Moisture & FFA Testing</span>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                  <button
                    onClick={() => handleOpenRFQ()}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg transition text-center"
                  >
                    Submit Wholesale RFQ Form
                  </button>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-stone-600 hover:bg-stone-800 text-stone-200 font-semibold text-sm px-6 py-3.5 rounded-xl transition text-center flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Talk to Commercial Desk</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AGRICULTURAL STANDARDS & EDUCATIONAL GUIDE */}
        <GradingGuide />

        {/* BUYER TESTIMONIALS */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Trusted by Households & Commercial Buyers Alike
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Real feedback from urban retail customers and high-volume commercial oil mill operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex text-amber-500 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                &ldquo;Ordered a 50-nut Grade A mesh bag for our family festival in Bengaluru. Every single coconut was heavy, with zero dry or spoiled nuts. Far better than the random street vendor prices.&rdquo;
              </p>
              <div className="pt-2 border-t border-stone-100">
                <strong className="text-xs text-stone-900 block">Smt. Rajeshwari K.</strong>
                <span className="text-[11px] text-stone-400">Jayanagar, Bengaluru (Retail Consumer)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex text-amber-500 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                &ldquo;We run a cold-pressed virgin coconut oil expeller unit. Tiptur Direct gave us certified moisture testing (&lt;5.5%) and exact weighbridge slips. Our oil recovery increased by 3.8% compared to unbranded mandis.&rdquo;
              </p>
              <div className="pt-2 border-t border-stone-100">
                <strong className="text-xs text-stone-900 block">Senthil Kumar</strong>
                <span className="text-[11px] text-stone-400">Kaveri Agro Oil Expellers, Salem (B2B Bulk)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex text-amber-500 gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                &ldquo;For catering large corporate weddings, consistency is everything. Grade B medium coconuts were exactly calibrated with thick kernel meat. Saved our kitchen 2 hours in daily grating.&rdquo;
              </p>
              <div className="pt-2 border-t border-stone-100">
                <strong className="text-xs text-stone-900 block">Venkatesh Prasad</strong>
                <span className="text-[11px] text-stone-400">Annapoorna Caterers, Bengaluru (HoReCa Buyer)</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white font-bold">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="font-extrabold text-base text-white">TIPTUR DIRECT</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              India&apos;s leading farm-direct coconut and copra commerce platform. Connecting growers in the Tiptur-Tumakuru corridor directly with consumers and commercial processors.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Product Catalog</h4>
            <ul className="space-y-2">
              <li>Grade A Mature Dehusked Coconuts</li>
              <li>Grade B Commercial Coconuts</li>
              <li>GI-Certified Tiptur Ball Copra</li>
              <li>Industrial Milling Copra</li>
              <li>Desiccated Coconut Powder (Upcoming)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Compliance & Legal</h4>
            <ul className="space-y-2">
              <li>Fresh Produce: 0% GST (Nil-rated, HSN 080112)</li>
              <li>Copra Commodities: 5% GST (HSN 1203)</li>
              <li>FSSAI License: 11226999000142</li>
              <li>APMC License: KA-TIPTUR-AGR-401</li>
              <li>Return & Cracked Replacement Policy</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Hub Locations & Desk</h4>
            <p className="text-stone-400 leading-relaxed mb-2">
              <strong>Sourcing & Grading Hub:</strong><br />
              APMC Yard Road, Tiptur, Tumakuru District, Karnataka - 572201
            </p>
            <p className="text-stone-400 leading-relaxed">
              <strong>Bengaluru Forward Hub:</strong><br />
              Yeshwanthpur Industrial Suburb, Bengaluru - 560022
            </p>
            <div className="mt-3">
              <span className="text-white font-semibold">Desk Helpline:</span> +91 98765 43210
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-900 text-center text-stone-500">
          © {new Date().getFullYear()} Tiptur Direct Agri-Commerce Private Limited. All rights reserved.
        </div>
      </footer>

      {/* WHOLESALE RFQ MODAL */}
      <WholesaleRFQModal
        isOpen={isRFQOpen}
        onClose={() => setIsRFQOpen(false)}
        products={products}
        selectedProduct={selectedProductForRFQ}
      />
    </div>
  );
}
