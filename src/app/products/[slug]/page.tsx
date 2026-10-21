'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductImageZoom from '@/components/ProductImageZoom';
import BulkInquiryForm from '@/components/BulkInquiryForm';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Zap,
  Building2,
  Sparkles,
  HelpCircle,
  FileText,
  Package,
  Award,
  AlertCircle,
  Heart
} from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Purchasing mode toggle: 'retail' | 'bulk'
  const [purchasingMode, setPurchasingMode] = useState<'retail' | 'bulk'>('retail');

  // Retail quantity state
  const [retailQty, setRetailQty] = useState(1);

  // Active detail tab below the fold
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'quality' | 'delivery' | 'faq'>('overview');

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, listRes] = await Promise.all([
          fetch(`/api/products/${slug}`),
          fetch('/api/products')
        ]);

        const prodData = await prodRes.json();
        const listData = await listRes.json();

        if (prodData.success) {
          const p = prodData.product;
          setProduct(p);
          if (p.bulk_min_quantity && p.bulk_min_quantity > 1) {
            setRetailQty(p.bulk_min_quantity);
          }
          if (p.sku.includes('BLK')) {
            setPurchasingMode('bulk');
          }
        } else {
          setError(prodData.error || 'Product not found');
        }

        if (listData.success) {
          setAllProducts(listData.products);
        }
      } catch {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 w-full animate-pulse space-y-8">
          <div className="h-6 bg-stone-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-square bg-stone-200 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-stone-200 rounded w-3/4"></div>
              <div className="h-4 bg-stone-200 rounded w-1/2"></div>
              <div className="h-24 bg-stone-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Product Not Found</h2>
          <p className="text-stone-600 text-sm">{error || 'The requested agricultural SKU is unavailable.'}</p>
          <Link
            href="/#catalog"
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Browse Other Commodities
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(product.retail_price_inr);
  const retailSubtotal = price * retailQty;
  const freeShippingThreshold = 1500;
  const deliveryFee = retailSubtotal >= freeShippingThreshold ? 0 : 99;
  const taxRate = Number(product.tax_rate_percentage || 0);
  const estimatedTax = (retailSubtotal * taxRate) / 100;
  const retailGrandTotal = retailSubtotal + deliveryFee + estimatedTax;

  // Clean unit breakdown note
  let unitSubtitle = product.unit_of_measure;
  let perUnitNote = '';
  if (product.sku.includes('COC-SEMI')) {
    perUnitNote = '₹90 / kg';
    unitSubtitle = '25-Piece Bag (~15 kg)';
  } else if (product.sku.includes('COP-BAL')) {
    perUnitNote = '₹350 / kg';
    unitSubtitle = '15 kg Master Box (also 25kg, 30kg)';
  } else if (product.sku.includes('NUR-COC')) {
    perUnitNote = '₹250 / plant';
    unitSubtitle = '1 Year Old • 2 Feet • Min 50 Units';
  } else if (product.sku.includes('OIL-GND')) {
    perUnitNote = '₹600 / Litre';
    unitSubtitle = '1 Litre Food-Grade Bottle';
  } else if (product.sku.includes('MIL-RAG')) {
    perUnitNote = '₹120 / kg';
    unitSubtitle = '5 kg Machine-Cleaned Pack (also 10kg, 25kg)';
  } else if (product.sku.includes('DAI-GHE')) {
    perUnitNote = '₹900 / Litre';
    unitSubtitle = '1 Litre Glass Jar';
  } else if (product.sku.includes('COC-TND')) {
    perUnitNote = '₹80 / piece';
    unitSubtitle = 'Bulk Consignments Only';
  } else if (product.sku.includes('SPI-GIN')) {
    perUnitNote = '₹10,000 / 50 kg';
    unitSubtitle = '50 kg Bag • Bulk Orders Only';
  } else if (product.sku.includes('COI-SHL')) {
    perUnitNote = '₹35,000 / Ton';
    unitSubtitle = 'Metric Tonne • Industrial Grade';
  } else if (product.sku.includes('NUR-ARE')) {
    perUnitNote = '₹60 / plant';
    unitSubtitle = '1 - 1.5 Feet • Min 200 Units';
  } else if (product.estimated_weight_kg) {
    perUnitNote = `₹${(price / Number(product.estimated_weight_kg)).toFixed(0)} / kg`;
  }

  const handleBuyNow = () => {
    addToCart(product, retailQty);
    setIsCartOpen(true);
  };

  const otherProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/#catalog" className="hover:text-emerald-700 transition capitalize">
            {product.category.replace(/_/g, ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Top Product Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image with Zoom */}
          <div className="lg:col-span-6 space-y-4">
            <ProductImageZoom
              src={product.image_url}
              alt={product.title}
              gradeBadge={product.grade}
            />

            {/* Quick Trust Highlights below image */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-stone-600 bg-white p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-stone-900">Direct Farm Gate</span>
                <span className="text-[10px] text-stone-500">{product.origin.split(',')[0]}</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-stone-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-stone-900">Quality Graded</span>
                <span className="text-[10px] text-stone-500">Standardized Weight</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-stone-900">Pan-India Freight</span>
                <span className="text-[10px] text-stone-500">Express Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Dual Purchasing Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category & Origin Pill */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {product.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-stone-500">
                  Origin: <strong>{product.origin}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              <div className="mt-2 text-xs text-stone-500">
                Packaging Unit: <strong className="text-stone-800">{unitSubtitle}</strong>
                {product.moisture_percentage && (
                  <> • Moisture: <strong className="text-stone-800">&le; {product.moisture_percentage}%</strong></>
                )}
                {product.oil_percentage && (
                  <> • Oil Content: <strong className="text-stone-800">&ge; {product.oil_percentage}%</strong></>
                )}
              </div>
            </div>

            {/* Purchasing Mode Segmented Switcher */}
            <div className="bg-stone-200/80 p-1 rounded-2xl flex text-xs font-bold">
              <button
                type="button"
                onClick={() => setPurchasingMode('retail')}
                className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  purchasingMode === 'retail'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <span>Retail Household Pack</span>
              </button>

              <button
                type="button"
                onClick={() => setPurchasingMode('bulk')}
                className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  purchasingMode === 'bulk'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Wholesale & Bulk Inquiry</span>
              </button>
            </div>

            {/* MODE A: RETAIL PURCHASING */}
            {purchasingMode === 'retail' && (
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                {/* Price Display */}
                <div className="flex items-baseline justify-between border-b pb-4">
                  <div>
                    <span className="text-xs text-stone-500 block">Retail Price per {product.unit_of_measure.split(' ')[0]}:</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-stone-900 font-mono">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {perUnitNote && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {perUnitNote}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block">Availability</span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock for Dispatch
                    </span>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    Select Quantity ({product.unit_of_measure}):
                    {product.bulk_min_quantity && product.bulk_min_quantity > 1 && (
                      <span className="ml-2 text-amber-700 font-normal">
                        (Minimum order: {product.bulk_min_quantity} units)
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                      <button
                        type="button"
                        onClick={() => {
                          const min = product.bulk_min_quantity || 1;
                          const step = min > 1 ? min : 1;
                          setRetailQty(Math.max(min, retailQty - step));
                        }}
                        className="px-3 py-2 text-stone-700 hover:bg-stone-200 font-bold transition"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-mono font-bold text-sm bg-white min-w-[50px] text-center">
                        {retailQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const min = product.bulk_min_quantity || 1;
                          const step = min > 1 ? min : 1;
                          setRetailQty(retailQty + step);
                        }}
                        className="px-3 py-2 text-stone-700 hover:bg-stone-200 font-bold transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex gap-1.5 text-xs">
                      {((product.bulk_min_quantity && product.bulk_min_quantity > 1)
                        ? [product.bulk_min_quantity, product.bulk_min_quantity * 2, product.bulk_min_quantity * 5]
                        : [1, 2, 5]
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRetailQty(preset)}
                          className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                            retailQty === preset
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                              : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          {preset} Units
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time Order Summary Before Checkout */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs space-y-1.5 text-stone-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal ({retailQty} {retailQty === 1 ? 'unit' : 'units'}):</span>
                    <span className="font-mono font-semibold text-stone-900">₹{retailSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery (Pan-India):</span>
                    <span className="font-mono font-semibold">
                      {deliveryFee === 0 ? <strong className="text-emerald-700 font-bold">FREE (&ge; ₹1,500)</strong> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable GST ({taxRate}%):</span>
                    <span className="font-mono font-semibold">
                      {taxRate === 0 ? <span className="text-emerald-700">0% (Nil-Rated Fresh Produce)</span> : `₹${estimatedTax.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-stone-900 text-sm pt-2 border-t border-stone-200">
                    <span>Order Total:</span>
                    <span className="font-mono text-emerald-900 text-base">₹{retailGrandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => addToCart(product, retailQty)}
                    className="flex-1 bg-white hover:bg-stone-50 text-stone-900 border-2 border-stone-900 font-bold text-sm py-3 px-5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3 px-5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`py-3 px-4 rounded-xl border transition flex items-center justify-center gap-2 font-bold text-xs ${
                      isInWishlist(product.id)
                        ? 'bg-red-50 text-red-600 border-red-300'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                    title={isInWishlist(product.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current text-red-600' : ''}`} />
                    <span>{isInWishlist(product.id) ? 'Saved' : 'Watchlist'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODE B: BULK & WHOLESALE INQUIRY (NO PRICES SHOWN) */}
            {purchasingMode === 'bulk' && (
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <BulkInquiryForm product={product} />
              </div>
            )}
          </div>
        </div>

        {/* KATYAYANI-STYLE TABBED DETAILS SECTION BELOW THE FOLD */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-50/80">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'specifications', label: 'Specifications', icon: Award },
              { id: 'quality', label: 'Quality & Grading', icon: ShieldCheck },
              { id: 'delivery', label: 'Packaging & Delivery', icon: Package },
              { id: 'faq', label: 'FAQs', icon: HelpCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-700 text-emerald-800 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-stone-900">About {product.title}</h3>
              <p className="text-stone-700 text-sm leading-relaxed">{product.description}</p>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs text-stone-600 space-y-1">
                <strong>Origin & Sourcing Corridor:</strong> {product.origin}. Sourced directly through registered farmer producer networks and APMC auction corridors in Karnataka with zero intermediary hoarding.
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specifications' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-stone-900">Technical Specifications</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                  <tbody className="divide-y divide-stone-200">
                    <tr className="bg-stone-50">
                      <td className="p-3 font-bold text-stone-600 w-1/3">Standard SKU</td>
                      <td className="p-3 font-mono font-semibold text-stone-900">{product.sku}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-stone-600">Product Grade</td>
                      <td className="p-3 text-stone-900 font-semibold">{product.grade}</td>
                    </tr>
                    <tr className="bg-stone-50">
                      <td className="p-3 font-bold text-stone-600">HSN Code & Tax</td>
                      <td className="p-3 text-stone-900 font-mono">
                        HSN {product.hsn_code} ({taxRate === 0 ? '0% GST Nil-Rated Fresh Agriculture' : `${taxRate}% GST`})
                      </td>
                    </tr>
                    {product.estimated_weight_kg && (
                      <tr>
                        <td className="p-3 font-bold text-stone-600">Estimated Gross Weight</td>
                        <td className="p-3 text-stone-900">~{product.estimated_weight_kg} kg per package unit</td>
                      </tr>
                    )}
                    {product.moisture_percentage && (
                      <tr className="bg-stone-50">
                        <td className="p-3 font-bold text-stone-600">Moisture Content</td>
                        <td className="p-3 text-stone-900 font-semibold">&le; {product.moisture_percentage}% (Pin-meter tested)</td>
                      </tr>
                    )}
                    {product.oil_percentage && (
                      <tr>
                        <td className="p-3 font-bold text-stone-600">Oil Yield Recovery</td>
                        <td className="p-3 text-stone-900 font-semibold">&ge; {product.oil_percentage}% (Cold expeller tested)</td>
                      </tr>
                    )}
                    {product.specifications &&
                      Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-stone-50' : ''}>
                          <td className="p-3 font-bold text-stone-600 capitalize">{key.replace(/_/g, ' ')}</td>
                          <td className="p-3 text-stone-900">{val}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Quality & Grading */}
          {activeTab === 'quality' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-stone-900">Quality Assurance & Agricultural Variations</h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                As a 100% natural agricultural commodity, our products are physical-weight calibrated and sorted to ensure grade consistency.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <strong className="block text-emerald-950 font-bold">Standardized Grading Protocol</strong>
                  Every consignment undergoes manual acoustic tap testing for sweet water presence, kernel density inspection, and electronic weight sorting.
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <strong className="block text-amber-950 font-bold">Natural Agricultural Variations</strong>
                  Minor natural variances in outer shell coloration, husk fiber density, and size (&plusmn;5%) occur across harvest flushes and do not affect meat or oil quality.
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Packaging & Delivery */}
          {activeTab === 'delivery' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-stone-900">Packaging, Logistics & Returns</h3>
              <div className="space-y-3 text-xs text-stone-700">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <strong className="text-stone-900 block mb-1">Protective Packaging:</strong>
                  Retail units are packed in high-density breathable HDPE mesh bags or moisture-barrier master cartons to prevent transit sweating and mold formation.
                </div>
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <strong className="text-stone-900 block mb-1">Pan-India & Worldwide Freight:</strong>
                  Retail orders are dispatched within 24 hours. Wholesale truckloads (Canter / 10-wheeler) and export shipping containers (FCL/LCL) are handled with digital weighbridge slips.
                </div>
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <strong className="text-stone-900 block mb-1">Zero Cracked Guarantee:</strong>
                  Any coconut received cracked or spoiled in transit is replaced free of charge or refunded upon photo verification over WhatsApp.
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: FAQ */}
          {activeTab === 'faq' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-stone-900">Frequently Asked Questions</h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-1">
                  <strong className="text-stone-900 text-sm block">How does wholesale quote pricing work?</strong>
                  <p className="text-stone-600 leading-relaxed">
                    Wholesale commodity prices fluctuate with daily APMC Mandi arrivals. When you submit a quote request, our desk locks a guaranteed 48-hour landed price including freight for your exact destination.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-1">
                  <strong className="text-stone-900 text-sm block">Can I order retail quantities outside Karnataka?</strong>
                  <p className="text-stone-600 leading-relaxed">
                    Yes! We ship retail packs to all 19,000+ Indian postal PIN codes via express courier partners. Free shipping applies automatically for orders &ge; ₹1,500.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-1">
                  <strong className="text-stone-900 text-sm block">How should I store mature coconuts and copra?</strong>
                  <p className="text-stone-600 leading-relaxed">
                    Store in a dry, well-ventilated area away from direct moisture. Keep mesh bags elevated on wooden pallets or slatted crates. Consumed within 45 days of harvest date.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RELATED / OTHER COMMODITIES SECTION */}
        {otherProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Other Agricultural Commodities
                </h3>
                <p className="text-stone-500 text-xs mt-1">Explore our farm-direct spices, copra, and coir products.</p>
              </div>
              <Link href="/#catalog" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {otherProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 mb-3">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {p.category.replace(/_/g, ' ')}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-1 line-clamp-1 group-hover:text-emerald-800 transition">
                      {p.title}
                    </h4>
                    <div className="mt-2 text-base font-extrabold text-stone-900 font-mono">
                      ₹{Number(p.retail_price_inr).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span>View Specifications</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
