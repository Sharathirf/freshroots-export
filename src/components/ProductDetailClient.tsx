'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductImageZoom from '@/components/ProductImageZoom';
import BulkInquiryForm from '@/components/BulkInquiryForm';
import EnquiryModal from '@/components/EnquiryModal';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { getProductVariants, getDefaultVariant, ProductVariant } from '@/lib/variants';
import { track } from '@/lib/analytics';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Zap,
  Building2,
  Award,
  AlertCircle,
  Heart,
  Star
} from 'lucide-react';

interface ProductDetailClientProps {
  initialProduct?: Product | null;
  allProducts?: Product[];
  slug: string;
}

export default function ProductDetailClient({
  initialProduct,
  allProducts: initialAllProducts = [],
  slug
}: ProductDetailClientProps) {
  const { addToCart, setIsCartOpen, openCheckout } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isLoggedIn, requireAuth } = useAuth();

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [allProducts, setAllProducts] = useState<Product[]>(initialAllProducts);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  // Packaging variant selection state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (initialProduct?.sku) {
      return getDefaultVariant(initialProduct.sku);
    }
    return null;
  });

  // Purchasing mode toggle: 'retail' | 'bulk'
  const [purchasingMode, setPurchasingMode] = useState<'retail' | 'bulk'>(() => {
    if (initialProduct) {
      const isBulkProduct = Boolean(
        initialProduct.sku?.includes('BLK') ||
        initialProduct.sku?.includes('TND') ||
        initialProduct.sku?.includes('GIN') ||
        initialProduct.sku?.includes('SHL') ||
        initialProduct.category === 'arecanut' ||
        initialProduct.slug?.includes('tender') ||
        initialProduct.slug?.includes('ginger') ||
        initialProduct.slug?.includes('shell') ||
        initialProduct.slug?.includes('arecanut')
      );
      if (isBulkProduct) return 'bulk';
    }
    return 'retail';
  });

  // Retail quantity state
  const [retailQty, setRetailQty] = useState(initialProduct?.bulk_min_quantity && initialProduct.bulk_min_quantity > 1 ? initialProduct.bulk_min_quantity : 1);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  // Active detail tab below the fold
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'quality' | 'delivery' | 'reviews' | 'faq'>('overview');

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
          const defVariant = getDefaultVariant(p.sku);
          if (defVariant) {
            setSelectedVariant(defVariant);
          }
          if (p.bulk_min_quantity && p.bulk_min_quantity > 1) {
            setRetailQty(p.bulk_min_quantity);
          }
          const isBulkProduct = Boolean(
            p.sku?.includes('BLK') ||
            p.sku?.includes('TND') ||
            p.sku?.includes('GIN') ||
            p.sku?.includes('SHL') ||
            p.slug?.includes('tender') ||
            p.slug?.includes('ginger') ||
            p.slug?.includes('shell')
          );
          if (isBulkProduct) {
            setPurchasingMode('bulk');
          }
        } else if (!initialProduct) {
          setError(prodData.error || 'Product not found');
        }

        if (listData.success) {
          setAllProducts(listData.products);
        }
      } catch {
        if (!initialProduct) {
          setError('Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, initialProduct]);

  useEffect(() => {
    if (product) {
      track('product_detail_viewed', {
        product_id: product.id,
        sku: product.sku,
        category: product.category,
      });
    }
  }, [product]);

  if (loading && !product) {
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

  const isWishlisted = isInWishlist(product.id);
  const variants = getProductVariants(product.sku);

  // Active retail price based on variant selection or product base price
  const price = selectedVariant ? selectedVariant.price : Number(product.retail_price_inr);
  const originalMrp = Math.round(price / 0.85); // Authentic 15% discount
  const isOutOfStock = (product.available_stock || 0) <= 0;

  // Wholesale pricing tier calculations
  const wholesaleBenchmark = Number(product.wholesale_benchmark_price_inr || price * 0.7);
  const wholesaleSavingsPct = Math.round(((price - wholesaleBenchmark) / price) * 100);

  // Available stock display
  const stockQty = product.available_stock || 0;
  const isLowStock = stockQty > 0 && stockQty < 50;

  // Commodity Emoji for badge
  const getCommodityEmoji = (cat: string) => {
    switch (cat) {
      case 'mature_coconut': return '🥥';
      case 'copra': return '🥥';
      case 'oil_and_extracts': return '🥜';
      case 'spices': return '🌾';
      case 'value_added': return '🌴';
      case 'coir_commodities': return '🥥';
      case 'arecanut': return '🥜';
      default: return '🌿';
    }
  };

  const isBulkOnly = Boolean(
    product.sku?.includes('BLK') ||
    product.sku?.includes('TND') ||
    product.sku?.includes('GIN') ||
    product.sku?.includes('SHL') ||
    product.category === 'arecanut' ||
    product.slug?.includes('tender') ||
    product.slug?.includes('ginger') ||
    product.slug?.includes('shell') ||
    product.slug?.includes('arecanut')
  );

  const handleBuyNow = () => {
    if (!product) return;
    if (!isLoggedIn) {
      try {
        sessionStorage.setItem('freshroots_post_login_intent', JSON.stringify({ type: 'checkout' }));
      } catch {}
      requireAuth('Sign in to continue to Fast Checkout', () => {
        addToCart(product, retailQty, selectedVariant || undefined);
        openCheckout();
      });
      return;
    }
    addToCart(product, retailQty, selectedVariant || undefined);
    openCheckout();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-emerald-700 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/#catalog" className="hover:text-emerald-700 transition capitalize">
            {product.category.replace(/_/g, ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Top Product Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Interactive Image Gallery with Zoom (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-sm p-4">
              <ProductImageZoom
                src={product.image_url}
                alt={product.title}
              />

              {/* Grade Badge */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-bold px-3 py-1 rounded-lg border border-stone-200 shadow-sm flex items-center gap-1.5">
                <span>{getCommodityEmoji(product.category)}</span>
                <span>{product.grade || 'Grade A'}</span>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 flex items-center justify-center shadow-md transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b6d11]"
                title={isWishlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-stone-400 group-hover:text-red-500'
                  }`}
                />
              </button>

              {/* Verified Origin Badge */}
              <div className="absolute bottom-4 left-4 z-10 bg-emerald-950/90 text-white text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Mandya Farm Gate</span>
              </div>
            </div>

            {/* Micro USP Banner below image */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-stone-600">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <Truck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="font-semibold block text-stone-800">100% Free Delivery</span>
                <span>Direct farm dispatch</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="font-semibold block text-stone-800">Zero Commission</span>
                <span>Direct farmer rates</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <Award className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="font-semibold block text-stone-800">Govt. Mandi Graded</span>
                <span>Weight-sorted lot</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3b6d11] bg-lime-100 border border-lime-300 px-2.5 py-0.5 rounded-md">
                  {product.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  HSN: {product.hsn_code}
                </span>
                <span className="text-xs text-stone-400">&bull;</span>
                <span className="text-xs text-stone-500">
                  GST: {product.tax_rate_percentage}%
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Review & Rating summary */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(Number(product.average_rating || 5))
                          ? 'fill-current'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold text-stone-900 ml-1">
                    {Number(product.average_rating || 5.0).toFixed(1)}
                  </span>
                </div>
                <span className="text-stone-300">&bull;</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold underline decoration-dotted underline-offset-2"
                >
                  {product.review_count || 12} Verified Farm Reviews
                </button>
                <span className="text-stone-300">&bull;</span>
                <span className="text-stone-500">
                  Origin: <strong className="text-stone-800">{product.origin}</strong>
                </span>
              </div>
            </div>

            {/* Dual Mode Switch or Bulk-Only Indicator */}
            {isBulkOnly ? (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2.5 text-amber-950 text-xs sm:text-sm font-bold shadow-xs">
                <Building2 className="w-5 h-5 text-amber-700 shrink-0" />
                <span>Wholesale &amp; Commercial Bulk Consignment Only</span>
              </div>
            ) : (
              <div className="p-1 bg-stone-200/80 rounded-2xl flex items-center max-w-md">
                <button
                  type="button"
                  onClick={() => setPurchasingMode('retail')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                    purchasingMode === 'retail'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>Retail / Household</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPurchasingMode('bulk')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                    purchasingMode === 'bulk'
                      ? 'bg-emerald-950 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Commercial / Bulk Lot</span>
                </button>
              </div>
            )}

            {/* RETAIL PURCHASING FLOW */}
            {!isBulkOnly && purchasingMode === 'retail' && (
              <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-6">
                {/* Price Display */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-3xl sm:text-4xl font-black text-stone-900 font-mono tracking-tight">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-stone-400 line-through font-mono">
                    ₹{originalMrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    15% OFF
                  </span>
                  <span className="text-xs text-stone-500">
                    / {selectedVariant ? selectedVariant.packSize : product.unit_of_measure}
                  </span>
                  <div className="w-full text-xs text-stone-500 font-medium mt-1">
                    Inclusive of all taxes &bull; <strong className="text-emerald-700">100% Free Doorstep Delivery</strong> across Karnataka
                  </div>
                </div>

                {/* Packaging Size / Variant Selection pills if available */}
                {variants && variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                      Select Packaging Size / Variety:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {variants.map((v) => {
                        const isSelected = selectedVariant?.packSize === v.packSize;
                        return (
                          <button
                            key={v.packSize}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600 shadow-xs'
                                : 'bg-stone-50 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                            }`}
                          >
                            <span className="text-xs font-bold text-stone-900">{v.label}</span>
                            <span className="text-[11px] text-stone-500 mt-1">{v.packSize}</span>
                            <span className="text-sm font-extrabold text-emerald-800 font-mono mt-1">
                              ₹{v.price.toLocaleString('en-IN')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & Stock Availability */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">Quantity:</label>
                    <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
                      <button
                        type="button"
                        onClick={() => setRetailQty(Math.max(1, retailQty - 1))}
                        disabled={retailQty <= 1}
                        className="w-8 h-8 rounded-lg bg-white shadow-2xs hover:bg-stone-100 text-stone-700 font-bold flex items-center justify-center disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-mono font-bold text-sm text-stone-900">
                        {retailQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRetailQty(retailQty + 1)}
                        className="w-8 h-8 rounded-lg bg-white shadow-2xs hover:bg-stone-100 text-stone-700 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold text-stone-700 block">Inventory Status:</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <strong className="text-emerald-800 font-bold">In Stock &bull; Daily Farm Dispatch</strong>
                      {isLowStock && (
                        <span className="text-amber-800 bg-amber-100 text-[10px] font-bold px-2 py-0.5 rounded">
                          Only {stockQty} units remaining in today&apos;s lot
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: 1-Tap Add to Cart & Buy Now */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => addToCart(product, retailQty, selectedVariant || undefined)}
                    disabled={isOutOfStock}
                    className="w-full py-3.5 px-6 rounded-2xl bg-white border-2 border-[#3b6d11] text-[#3b6d11] hover:bg-[#3b6d11]/5 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 group active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#3b6d11]" />
                    <span>Add to Cart (Free Delivery)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#3b6d11] hover:bg-[#2d5a0b] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 group active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4 text-lime-300" />
                    <span>Instant Checkout &bull; ₹{(price * retailQty).toLocaleString('en-IN')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* WHOLESALE COMMERCIAL RFQ FLOW */}
            {(isBulkOnly || purchasingMode === 'bulk') && (
              <div className="p-6 rounded-3xl bg-linear-to-br from-stone-900 to-emerald-950 text-white shadow-md space-y-6 border border-emerald-800/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-lime-400 uppercase font-black">
                      Direct Farm Wholesale &bull; Truckload Quotations
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Commercial Farm Lot Procurement
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-300 block">Indicative Rate:</span>
                    <span className="text-2xl font-black font-mono text-lime-300">
                      ~₹{wholesaleBenchmark.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-300 block">
                      Save ~{wholesaleSavingsPct}% vs retail
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-300 space-y-2 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/10">
                  <p>
                    Procure commercial volume ({product.bulk_min_quantity} {product.unit_of_measure} to multi-tonne consignments) directly from our Mandya and Tiptur farm grading hubs.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>&bull; Standardized weight sorting</div>
                    <div>&bull; E-Way bill &amp; GST compliance</div>
                    <div>&bull; Full truckload (FTL) logistics</div>
                    <div>&bull; Direct bank transfer / LC support</div>
                  </div>
                </div>

                {/* Integrated Bulk RFQ Form */}
                <div className="bg-white rounded-2xl p-5 text-stone-900 shadow-md">
                  <BulkInquiryForm
                    product={product}
                    onSuccess={() => {
                      if (!isBulkOnly) setPurchasingMode('retail');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Below the Fold Tabbed Specifications & Content Engine */}
        <div className="space-y-6 pt-6">
          {/* Tab buttons */}
          <div className="border-b border-stone-200 flex gap-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview & Farm Lot' },
              { id: 'specifications', label: 'Technical Specifications' },
              { id: 'quality', label: 'Quality & Sorting' },
              { id: 'delivery', label: 'Delivery & Packaging' },
              { id: 'reviews', label: `Customer Reviews (${product.review_count || 12})` },
              { id: 'faq', label: 'Frequently Asked Questions' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#3b6d11] text-[#3b6d11]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-stone-900">About this produce lot</h3>
                <p>{product.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
                <div className="space-y-1">
                  <strong className="block text-stone-900 text-xs font-bold uppercase">Harvest Region:</strong>
                  <p className="text-xs text-stone-600">{product.origin}</p>
                </div>
                <div className="space-y-1">
                  <strong className="block text-stone-900 text-xs font-bold uppercase">Estimated Weight:</strong>
                  <p className="text-xs text-stone-600">{product.estimated_weight_kg} kg per {product.unit_of_measure}</p>
                </div>
                <div className="space-y-1">
                  <strong className="block text-stone-900 text-xs font-bold uppercase">HSN Code / GST:</strong>
                  <p className="text-xs text-stone-600">HSN {product.hsn_code} &bull; {product.tax_rate_percentage}% GST</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specifications' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-stone-900">Lab &amp; Grading Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex justify-between items-center">
                    <span className="font-semibold text-stone-600 uppercase tracking-wide text-[10px]">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-bold text-stone-900 text-right">{String(val)}</span>
                  </div>
                ))}
                {product.moisture_percentage !== null && product.moisture_percentage !== undefined && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex justify-between items-center">
                    <span className="font-semibold text-stone-600 uppercase tracking-wide text-[10px]">
                      Moisture Content:
                    </span>
                    <span className="font-bold text-stone-900">{product.moisture_percentage}%</span>
                  </div>
                )}
                {product.oil_percentage !== null && product.oil_percentage !== undefined && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex justify-between items-center">
                    <span className="font-semibold text-stone-600 uppercase tracking-wide text-[10px]">
                      Oil Percentage:
                    </span>
                    <span className="font-bold text-stone-900">{product.oil_percentage}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Quality */}
          {activeTab === 'quality' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 text-xs text-stone-700 leading-relaxed">
              <h3 className="text-lg font-bold text-stone-900">Quality Assurance &amp; Farm Sorting</h3>
              <p>
                Every lot of <strong>{product.title}</strong> is harvested and manually inspected at our farm hub in Mandya. We practice strict post-harvest protocols to ensure minimal spoilage and authentic origin characteristics.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <strong className="block text-emerald-950 font-bold">1. Zero Adulteration</strong>
                  <p className="text-[11px] text-emerald-800">100% pure native produce with no chemical preservatives, artificial polishes, or sulfur curing.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <strong className="block text-emerald-950 font-bold">2. Manual Grading</strong>
                  <p className="text-[11px] text-emerald-800">Experienced farm sorters reject cracked shells, immature nuts, damaged foliage, and foreign debris.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <strong className="block text-emerald-950 font-bold">3. Moisture Monitored</strong>
                  <p className="text-[11px] text-emerald-800">Digital moisture probe checks ensure all copra and dry grains meet safe transit limits.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Delivery */}
          {activeTab === 'delivery' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 text-xs text-stone-700 leading-relaxed">
              <h3 className="text-lg font-bold text-stone-900">Packaging &amp; Doorstep Logistics</h3>
              <p>
                We provide <strong>100% Free Doorstep Delivery</strong> across Bengaluru and Karnataka for all retail bag orders. Bulk consignments are dispatched via our dedicated fleet of regional trucks.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900 font-bold">Retail Deliveries (1 to 10 Units):</strong>
                  <p className="text-[11px] text-stone-600">Dispatched via regional express courier within 24 hours. Packed in heavy-duty HDPE breathable bags or corrugated boxes.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900 font-bold">Truckloads &amp; Wholesale Consignments:</strong>
                  <p className="text-[11px] text-stone-600">Full truckloads (Canter, 10-wheeler, 14-wheeler) coordinated with E-Way bills and GPS live tracking directly to your warehouse.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Reviews */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
              <ProductReviewsSection product={product} />
            </div>
          )}

          {/* Tab 6: FAQ */}
          {activeTab === 'faq' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 text-xs text-stone-700">
              <h3 className="text-lg font-bold text-stone-900">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900 font-bold">How do I verify the harvest freshness?</strong>
                  <p className="text-stone-600">Each bag is tagged with the harvest date from our Mandya farm hub. Our inventory turns around in 48 hours.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900 font-bold">Can I inspect the lot before placing a bulk truckload order?</strong>
                  <p className="text-stone-600">Yes! You can visit our farm grading yard in Kikkeri, Mandya, or request a sample box dispatched to your facility.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900 font-bold">Is GST invoice provided for business tax input credit?</strong>
                  <p className="text-stone-600">Yes, every order includes a tax invoice with HSN code and GST break-up. Enter your company GSTIN during checkout or RFQ.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Similar Produce Recommendations */}
        {allProducts && allProducts.length > 1 && (
          <div className="space-y-4 pt-8 border-t border-stone-200">
            <h3 className="text-xl font-black text-stone-900">
              Other Farm Commodities from Karnataka
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {allProducts.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-3">
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

      {/* Mobile Sticky Bottom Purchasing Bar */}
      {product && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] px-4 pt-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
          {isBulkOnly ? (
            <button
              type="button"
              onClick={() => setIsEnquiryOpen(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>Request Wholesale / Bulk Quote</span>
            </button>
          ) : (
            <>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-stone-900 font-mono">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {selectedVariant && (
                    <span className="text-[10px] text-stone-500 font-medium truncate max-w-[85px]">
                      /{selectedVariant.packSize}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 leading-none">
                  Free Doorstep Delivery
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => addToCart(product, retailQty, selectedVariant || undefined)}
                  className="bg-white border-2 border-stone-900 text-stone-900 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-95 text-white font-black text-xs py-2.5 px-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-lime-300" />
                  <span>Buy Now</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <Footer />

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultProduceTitle={product?.title}
      />
    </div>
  );
}
