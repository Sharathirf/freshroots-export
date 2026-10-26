'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Star, Building2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { getProductVariants, getDefaultVariant, ProductVariant } from '@/lib/variants';
import { track } from '@/lib/analytics';
import { getProductImageUrl } from '@/lib/product-images';

const commodityMetadata: Record<string, { emoji: string; titleKn: string; subtitleKn: string }> = {
  'COC-SEMI-25P-15K': {
    emoji: '🥥',
    titleKn: 'ಮಟ್ಟೆ ಸುಲಿದ ತೆಂಗಿನಕಾಯಿ (25 ಕಾಯಿ ಬ್ಯಾಗ್)',
    subtitleKn: '25 ಕಾಯಿಗಳ ಬ್ಯಾಗ್ (~15 ಕೆ.ಜಿ) • ಉಚಿತ ಡೆಲಿವರಿ'
  },
  'COP-BAL-BOX-15K': {
    emoji: '🥥',
    titleKn: 'ತಿಪಟೂರು ಸ್ಪೆಷಲ್ ಉಂಡೆ ಕೊಬ್ಬರಿ',
    subtitleKn: '15kg, 25kg, 30kg ಬಾಕ್ಸ್‌ಗಳು • ಉಚಿತ ಡೆಲಿವರಿ'
  },
  'NUR-COC-PLT-01Y': {
    emoji: '🌴',
    titleKn: 'ಕಿಕ್ಕೇರಿ ತಳಿಯ ತೆಂಗಿನ ಸಸಿಗಳು (1 ವರ್ಷ)',
    subtitleKn: '1 ವರ್ಷದ ಸಸಿ • 2 ಅಡಿ ಎತ್ತರ • ಕನಿಷ್ಠ ಮಿತಿ ಇಲ್ಲ'
  },
  'OIL-GND-WOD-01L': {
    emoji: '🥜',
    titleKn: 'ಮರದ ಗಾಣದ ಶುದ್ಧ ಕಡಲೆಕಾಯಿ ಎಣ್ಣೆ',
    subtitleKn: '1 ಲೀಟರ್ ಬಾಟಲಿ • ಕೋಲ್ಡ್-ಪ್ರೆಸ್ಡ್'
  },
  'MIL-RAG-ORG-05K': {
    emoji: '🌾',
    titleKn: 'ಮಂಡ್ಯದ ಪಾಲಿಶ್ ಮಾಡದ ನಾಟಿ ರಾಗಿ',
    subtitleKn: '5kg, 10kg, 25kg ಪ್ಯಾಕ್ • ಉಚಿತ ಡೆಲಿವರಿ'
  },
  'DAI-GHE-BIL-01L': {
    emoji: '🧈',
    titleKn: 'ಶುದ್ಧ ಹಳ್ಳಿಯ ಹಸುವಿನ ತುಪ್ಪ (ಬಿಲೋನಾ)',
    subtitleKn: '500ಮಿಲಿ @ ₹520 • 1ಲೀ @ ₹960'
  },
  'COC-TND-BLK-LOT': {
    emoji: '🥥',
    titleKn: 'ಮಂಡ್ಯದ ಸಿಹಿ ತಾಜಾ ಎಳನೀರು',
    subtitleKn: 'ಪ್ರತಿ ಕಾಯಿಗೆ ₹95 • ಕನಿಷ್ಠ ಮಿತಿ ಇಲ್ಲ'
  },
  'SPI-GIN-BLK-50K': {
    emoji: '🫚',
    titleKn: 'ತೋಟದ ತಾಜಾ ಹಸಿ ಶುಂಠಿ (50 ಕೆ.ಜಿ ಬ್ಯಾಗ್)',
    subtitleKn: '50 ಕೆ.ಜಿ ಗೋಣಿಚೀಲ • ನೇರ ಫಾರ್ಮ್ ರವಾನೆ'
  },
  'COI-SHL-BLK-01T': {
    emoji: '🥥',
    titleKn: 'ಒಣಗಿದ ನೈಸರ್ಗಿಕ ತೆಂಗಿನ ಚಿಪ್ಪು (1 ಟನ್)',
    subtitleKn: 'ಇಂಡಸ್ಟ್ರಿಯಲ್ ಗ್ರೇಡ್ • ಲಾರಿ ಲೋಡ್'
  },
  'NUR-ARE-PLT-01Y': {
    emoji: '🪴',
    titleKn: 'ದಕ್ಷಿಣ ಕನ್ನಡ ತಳಿಯ ಅಡಿಕೆ ಸಸಿಗಳು',
    subtitleKn: '1 ರಿಂದ 1.5 ಅಡಿ ಸಸಿ • ಕನಿಷ್ಠ ಮಿತಿ ಇಲ್ಲ'
  },
  'ARE-BLK-ADK-01Q': {
    emoji: '🥜',
    titleKn: 'ಶಿವಮೊಗ್ಗ ಅಡಿಕೆ (ಬಲ್ಕ್ ಕಮಾಡಿಟಿ)',
    subtitleKn: 'ಕನಿಷ್ಠ 100 ಕೆ.ಜಿ (1 ಕ್ವಿಂಟಾಲ್) • ಮಂಡಿ ದರ'
  }
};

type ArecanutMandiRate = {
  pricePerQuintal: number;
  pricePerKg: number;
  reportedAt: string;
  isFallback: boolean;
  source: string;
};

const FALLBACK_ARECANUT_RATE: ArecanutMandiRate = {
  pricePerQuintal: 70_809,
  pricePerKg: 708.09,
  reportedAt: '22 Oct 2026',
  isFallback: true,
  source: 'https://acrop.app/mandi/karnataka/shivamogga/shimoga/arecanut',
};

interface ProductCardProps {
  product: Product;
  onSelectForRFQ?: (product: Product) => void;
}

export default function ProductCard({ product, onSelectForRFQ }: ProductCardProps) {
  const { addToCart } = useCart();
  const { lang } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const variants = getProductVariants(product.sku);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    getDefaultVariant(product.sku)
  );
  const [arecanutMandiRate, setArecanutMandiRate] = useState(FALLBACK_ARECANUT_RATE);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      track('product_card_viewed', {
        product_id: product.id,
        sku: product.sku,
        category: product.category,
      });
      observer.disconnect();
    }, { threshold: 0.4 });

    observer.observe(card);
    return () => observer.disconnect();
  }, [product.category, product.id, product.sku]);

  useEffect(() => {
    if (product.category !== 'arecanut') return;

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
        // Keep the dated report value if the mandi endpoint is unavailable.
      }
    }

    void loadArecanutMandiRate();
    return () => {
      cancelled = true;
    };
  }, [product.category]);

  const meta = commodityMetadata[product.sku];
  const displayEmoji = meta?.emoji || '🌿';

  const rawActivePrice = selectedVariant ? selectedVariant.price : Number(product.retail_price_inr);
  const displayPrice = product.sku === 'COC-TND-BLK-LOT' ? 95 : rawActivePrice;
  const originalMrp = Math.round(displayPrice / 0.85);

  const isBulkOnly = Boolean(
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

  const unitSubtitle = selectedVariant ? selectedVariant.packSize : product.unit_of_measure;
  const priceUnit = selectedVariant?.unitOfMeasure || product.unit_of_measure;
  const reviewCount = Number(product.review_count || 0);
  const averageRating = Number(product.average_rating || 0);
  const displayImageUrl = getProductImageUrl(product.sku, product.image_url);

  let supportingInfo = 'No Minimum • Free Doorstep Delivery';
  if (product.sku === 'NUR-ARE-PLT-01Y') {
    supportingInfo = '(₹75 / plant • No Minimum)';
  } else if (product.sku === 'NUR-COC-PLT-01Y') {
    supportingInfo = 'No Minimum • Field-Ready 1-Year Saplings';
  } else if (product.sku === 'OIL-GND-WOD-01L') {
    supportingInfo = 'Cold-Pressed • Traditional Marachekku';
  } else if (product.category === 'arecanut' || product.sku === 'ARE-BLK-ADK-01Q') {
    supportingInfo = 'Minimum bulk lot: 100 kg';
  } else if (isBulkOnly) {
    supportingInfo = `Minimum bulk lot: ${product.bulk_min_quantity || 1} ${product.bulk_min_quantity === 1 ? 'unit' : 'units'}`;
  }

  return (
    <article
      ref={cardRef}
      className="h-full bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group select-text"
    >
      <div className="flex flex-col flex-1">
        {/* 1. Sale/Grade Badge & Wishlist Action, 2. Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-stone-50/70 p-4 flex items-center justify-center select-none">
          <Link href={`/products/${product.slug}`} className="block relative w-full h-full flex items-center justify-center">
            <img
              src={displayImageUrl}
              alt={product.title}
              className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />

            {/* Sale / Grade badge */}
            {!isBulkOnly ? (
              <div className="absolute top-3 left-3 z-10 bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm select-none">
                Sale • 15% OFF
              </div>
            ) : product.grade ? (
              <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-200 shadow-sm select-none">
                {product.grade}
              </div>
            ) : null}

            <div className="absolute bottom-2.5 left-2.5 text-lg sm:text-xl bg-white/95 px-2 py-0.5 rounded-xl shadow-xs border border-stone-200 pointer-events-none select-none">
              {displayEmoji}
            </div>

            <div className="absolute bottom-2.5 right-2.5 bg-emerald-950/90 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-sm select-none">
              ✓ Farm Direct
            </div>
          </Link>

          {/* Wishlist action button */}
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 flex items-center justify-center shadow-md transition group/heart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b6d11] select-none"
            title={isWishlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          >
            <Heart
              className={`w-4 h-4 transition ${
                isWishlisted
                  ? 'fill-red-500 text-red-500 scale-110'
                  : 'text-stone-400 group-hover/heart:text-red-500'
              }`}
            />
          </button>
        </div>

        {/* 3. Category & Supporting Metadata, 4. Title, 5. Ratings, 6. Pricing */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Category & Unit Subtitle */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-medium min-h-[1.25rem]">
            <span className="text-[#3b6d11] font-semibold uppercase tracking-wider text-[10px] select-none bg-transparent">
              {product.category.replace(/_/g, ' ')}
            </span>
            <span className="text-stone-500 text-right leading-snug truncate max-w-[55%] bg-transparent">
              {lang === 'kn' && meta?.subtitleKn ? meta.subtitleKn : unitSubtitle}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="mt-1 block">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-[#3b6d11] transition line-clamp-2 min-h-[2.8rem] bg-transparent">
              {lang === 'kn' && meta?.titleKn ? meta.titleKn : product.title}
            </h3>
          </Link>

          {/* Star Rating Row */}
          <div className="flex items-center justify-between min-h-[1.75rem] mt-1">
            <Link
              href={`/products/${product.slug}#reviews`}
              className="inline-flex items-center gap-1.5 group/stars hover:opacity-80 transition select-none"
              title={reviewCount ? `Read ${reviewCount} customer reviews for ${product.title}` : `Read reviews for ${product.title}`}
            >
              <div className="flex text-amber-400 text-xs" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(averageRating || 5) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-700 font-mono bg-transparent">{(averageRating || 4.8).toFixed(1)}</span>
              <span className="text-[11px] text-stone-400 group-hover/stars:text-[#3b6d11] bg-transparent">
                ({reviewCount || 12} {reviewCount === 1 ? 'Review' : 'Reviews'})
              </span>
            </Link>

            <Link
              href={`/products/${product.slug}#reviews`}
              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition select-none"
            >
              + Review
            </Link>
          </div>

          {/* Packaging / Variant Selection pills if available */}
          {variants && variants.length > 0 && !isBulkOnly ? (
            <div className="mt-2.5 pt-2 border-t border-stone-100 min-h-[3rem]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1 select-none">
                Select Packaging Size:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.packSize === v.packSize;
                  return (
                    <button
                      key={v.packSize}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariant(v);
                      }}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition select-none ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-600 ring-1 ring-emerald-600 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="min-h-[0.5rem]" />
          )}

          {/* Pricing Section (Price, original price, discount, and supporting information) */}
          <div className="mt-3 pt-3 border-t border-stone-100 min-h-[4.25rem] flex flex-col justify-center">
            {product.category === 'arecanut' && isBulkOnly ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-extrabold text-stone-900 font-mono tracking-tight bg-transparent">
                    Mandi maximum: ₹{arecanutMandiRate.pricePerQuintal.toLocaleString('en-IN')} / quintal
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-md select-none">
                    Bulk Orders Only
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 truncate bg-transparent">
                  <span>Minimum bulk lot: 100 kg</span>
                  <span>•</span>
                  <span>₹{arecanutMandiRate.pricePerKg.toFixed(2)} / kg</span>
                  <span>•</span>
                  <span>Reported {arecanutMandiRate.reportedAt}</span>
                </div>
              </div>
            ) : isBulkOnly ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono tracking-tight bg-transparent">
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal bg-transparent">/ {priceUnit}</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md select-none">
                    Bulk Orders Only
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 truncate bg-transparent">
                  {supportingInfo}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono tracking-tight bg-transparent">
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-stone-400 line-through font-mono bg-transparent">
                    ₹{originalMrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 select-none">
                    15% off
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal bg-transparent">
                    / {priceUnit}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 truncate bg-transparent">
                  {supportingInfo}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. Primary Purchase Action & 9. Secondary Wholesale Action */}
      <div className="p-4 sm:p-5 pt-0 mt-auto min-h-[5.75rem] flex flex-col justify-end space-y-2">
        {isBulkOnly ? (
          <button
            type="button"
            onClick={() => onSelectForRFQ ? onSelectForRFQ(product) : (window.location.href = `/products/${product.slug}`)}
            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 select-none"
          >
            <Building2 className="w-4 h-4 text-white" />
            <span>{lang === 'kn' ? 'ಸಗಟು ವಿಚಾರಣೆ (ಬಲ್ಕ್ ಮಾತ್ರ)' : 'Request Wholesale / Bulk Quote'}</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => addToCart(product, 1, selectedVariant || undefined)}
              className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 group/btn select-none"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {lang === 'kn'
                  ? 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ (ಉಚಿತ ಡೆಲಿವರಿ)'
                  : 'Add to Cart (Free Delivery)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectForRFQ ? onSelectForRFQ(product) : (window.location.href = `/products/${product.slug}`)}
              className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 select-none"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'kn' ? 'ಸಗಟು / ಲಾರಿ ಲೋಡ್ ವಿಚಾರಣೆ' : 'Wholesale / Bulk Quote'}</span>
            </button>
          </>
        )}
      </div>
    </article>
  );
}
