'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Star, Building2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { getProductVariants, getDefaultVariant, ProductVariant } from '@/lib/variants';

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
  }
};

interface ProductCardProps {
  product: Product;
  onSelectForRFQ: (product: Product) => void;
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

  const meta = commodityMetadata[product.sku];
  const displayEmoji = meta?.emoji || '🌿';

  const basePrice = Number(product.retail_price_inr);
  const activePrice = selectedVariant ? selectedVariant.price : basePrice;
  const isBulkOnly = product.sku.includes('BLK');

  // Compute MRP and discount percentage for authentic presentation
  const discountPercent = 15;
  const originalMrp = Math.round(activePrice / (1 - discountPercent / 100));

  // Clean unit breakdown note
  let unitSubtitle = selectedVariant ? selectedVariant.packSize : product.unit_of_measure;
  let perUnitNote = '';
  if (product.sku.includes('COC-SEMI')) {
    perUnitNote = '₹1,450 / 25-Piece Bag • Free Delivery';
    unitSubtitle = '25-Piece Bag (~15 kg)';
  } else if (product.sku.includes('COP-BAL')) {
    perUnitNote = '₹360 / kg • 15kg, 25kg, 30kg';
    unitSubtitle = selectedVariant ? selectedVariant.packSize : '15 kg Box (also 25kg, 30kg)';
  } else if (product.sku.includes('NUR-COC')) {
    perUnitNote = '₹280 / plant • No Minimum';
    unitSubtitle = '1 Year Old • 2 Feet';
  } else if (product.sku.includes('OIL-GND')) {
    perUnitNote = '₹650 / Litre • Free Delivery';
    unitSubtitle = '1L Bottle • Wood-Pressed';
  } else if (product.sku.includes('MIL-RAG')) {
    perUnitNote = '₹130 / kg • 5kg, 10kg, 25kg';
    unitSubtitle = selectedVariant ? selectedVariant.packSize : '5 kg Pack (also 10kg, 25kg)';
  } else if (product.sku.includes('DAI-GHE')) {
    if (selectedVariant?.packSize.includes('500')) {
      perUnitNote = '500 ml @ ₹520 • Free Delivery';
      unitSubtitle = '500 ml Glass Jar';
    } else {
      perUnitNote = '1L @ ₹960 • 500ml @ ₹520';
      unitSubtitle = '1L Glass Jar • Pure Bilona';
    }
  } else if (product.sku.includes('COC-TND')) {
    perUnitNote = '₹95 / piece • No Minimum';
    unitSubtitle = 'Fresh Farm Tender Nut';
  } else if (product.sku.includes('SPI-GIN')) {
    perUnitNote = '₹10,500 / 50 kg Bag';
    unitSubtitle = '50 kg Bag • Free Delivery';
  } else if (product.sku.includes('COI-SHL')) {
    perUnitNote = '₹36,000 / Tonne';
    unitSubtitle = 'Metric Tonne • Industrial';
  } else if (product.sku.includes('NUR-ARE')) {
    perUnitNote = '₹75 / plant • No Minimum';
    unitSubtitle = '1 - 1.5 Feet Height';
  }


  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Product Image Wrap (Katyayani pcard__image-wrap) */}
        <Link href={`/products/${product.slug}`} className="block relative aspect-square w-full overflow-hidden bg-stone-50 p-4">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className="bg-[#3b6d11] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              Sale
            </span>
            {product.grade && (
              <span className="bg-white/95 backdrop-blur-sm text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-200 shadow-sm">
                {product.grade}
              </span>
            )}
          </div>

          {/* Watchlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 flex items-center justify-center shadow-md transition group/heart"
            title={isWishlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Heart
              className={`w-4 h-4 transition ${
                isWishlisted
                  ? 'fill-red-500 text-red-500 scale-110'
                  : 'text-stone-400 group-hover/heart:text-red-500'
              }`}
            />
          </button>

          {/* Visual Produce Emoji for illiterate / rapid visual recognition */}
          <div className="absolute bottom-2.5 left-2.5 text-lg sm:text-xl bg-white/95 px-2 py-0.5 rounded-xl shadow-xs border border-stone-200 pointer-events-none">
            {displayEmoji}
          </div>

          {/* Origin verification tag */}
          <div className="absolute bottom-2.5 right-2.5 bg-emerald-950/80 backdrop-blur-sm text-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm">
            ✓ Direct APMC
          </div>
        </Link>

        {/* Body (Katyayani pcard__body) */}
        <div className="p-4 sm:p-5">
          {/* Category & Unit Subtitle */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1">
            <span className="text-[#3b6d11] font-semibold uppercase tracking-wider text-[10px]">
              {product.category.replace(/_/g, ' ')}
            </span>
            <span className="text-stone-400">
              {lang === 'kn' && meta?.subtitleKn ? meta.subtitleKn : unitSubtitle}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-[#3b6d11] transition line-clamp-2 min-h-[2.6rem]">
              {lang === 'kn' && meta?.titleKn ? meta.titleKn : product.title}
            </h3>
          </Link>

          {/* Star Rating Row: clickable directly to this product's reviews */}
          <div className="flex items-center justify-between mt-2">
            <Link
              href={`/products/${product.slug}#reviews`}
              className="inline-flex items-center gap-1.5 group/stars hover:opacity-80 transition"
              title={`Read customer reviews for ${product.title}`}
            >
              <div className="flex text-amber-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-700">5.0</span>
              <span className="text-[11px] text-stone-400 group-hover/stars:text-[#3b6d11] group-hover/stars:underline">
                (Reviews)
              </span>
            </Link>

            <Link
              href={`/products/${product.slug}#reviews`}
              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition"
            >
              + Review
            </Link>
          </div>

          {/* Packaging / Variant Selection pills if available */}
          {variants && variants.length > 0 && !isBulkOnly && (
            <div className="mt-2.5 pt-2.5 border-t border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
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
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
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
          )}

          {/* Pricing Row */}
          {isBulkOnly ? (
            <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                  Bulk Orders Only
                </span>
                {perUnitNote && (
                  <span className="text-xs font-bold text-stone-700">
                    ({perUnitNote})
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-500">
                Direct farm-gate wholesale consignments
              </span>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline flex-wrap gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-stone-900 font-mono">
                ₹{activePrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-stone-400 line-through font-mono">
                ₹{originalMrp.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {discountPercent}% off
              </span>
              {perUnitNote && (
                <span className="w-full text-[11px] text-stone-500 font-medium -mt-1">
                  ({perUnitNote})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (1-Tap Add to Cart with Free Delivery + Wholesale Quote) */}
      <div className="p-4 sm:p-5 pt-0 space-y-2">
        <button
          onClick={() => addToCart(product, 1, selectedVariant || undefined)}
          className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>
            {lang === 'kn'
              ? 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ (ಉಚಿತ ಡೆಲಿವರಿ)'
              : `Add ${selectedVariant ? selectedVariant.packSize : 'to Cart (Free Delivery)'}`}
          </span>
        </button>

        <button
          onClick={() => onSelectForRFQ(product)}
          className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-700" />
          <span>{lang === 'kn' ? 'ಸಗಟು / ಲಾರಿ ಲೋಡ್ ವಿಚಾರಣೆ' : 'Wholesale / Bulk Quote'}</span>
        </button>
      </div>
    </div>
  );
}
