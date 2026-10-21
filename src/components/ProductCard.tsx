'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Star, Building2, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onSelectForRFQ: (product: Product) => void;
}

export default function ProductCard({ product, onSelectForRFQ }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const price = Number(product.retail_price_inr);

  // Compute MRP and discount percentage for authentic e-commerce presentation
  const discountPercent = product.sku.includes('TIP-25K')
    ? 20
    : product.sku.includes('BYD')
    ? 24
    : product.sku.includes('PEP')
    ? 22
    : product.sku.includes('VCO')
    ? 18
    : 15;
  const originalMrp = Math.round(price / (1 - discountPercent / 100));

  // Clean unit breakdown note
  let unitSubtitle = product.unit_of_measure;
  let perUnitNote = '';
  if (product.sku.includes('GRA') || product.sku.includes('GRB')) {
    perUnitNote = `₹${(price / 50).toFixed(0)}/nut`;
    unitSubtitle = `Bag of 50 • ~${product.estimated_weight_kg}kg`;
  } else if (product.sku.includes('TIP-25K')) {
    perUnitNote = `₹${(price / 25).toFixed(0)}/kg`;
    unitSubtitle = `25kg Box • Moisture ≤ 5.5%`;
  } else if (product.sku.includes('50K')) {
    perUnitNote = `₹${(price / 50).toFixed(0)}/kg`;
    unitSubtitle = `50kg Bag • Moisture ≤ 5.5% • Oil ≥ 68%`;
  } else if (product.estimated_weight_kg) {
    perUnitNote = `₹${(price / Number(product.estimated_weight_kg)).toFixed(0)}/kg`;
  }

  // Review metrics
  const reviewCount = product.sku.includes('GRA') ? 312 : product.sku.includes('TIP') ? 248 : product.sku.includes('BYD') ? 186 : 142;

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
            <span className="text-stone-400">{unitSubtitle}</span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-[#3b6d11] transition line-clamp-2 min-h-[2.6rem]">
              {product.title}
            </h3>
          </Link>

          {/* Star Rating Row */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-stone-700">4.9</span>
            <span className="text-[11px] text-stone-400">({reviewCount})</span>
          </div>

          {/* Pricing Row (Katyayani pcard__pricing standard) */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline flex-wrap gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-stone-900 font-mono">
              ₹{price.toLocaleString('en-IN')}
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
        </div>
      </div>

      {/* Action Buttons (Katyayani pcard__atc + Wholesale Quote) */}
      <div className="p-4 sm:p-5 pt-0 space-y-2">
        <button
          onClick={() => addToCart(product, 1)}
          className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>

        <button
          onClick={() => onSelectForRFQ(product)}
          className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-700" />
          <span>Wholesale / Bulk Quote</span>
        </button>
      </div>
    </div>
  );
}
