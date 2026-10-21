'use client';

import React from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectForRFQ: (product: Product) => void;
}

export default function ProductCard({ product, onSelectForRFQ }: ProductCardProps) {
  const { addToCart } = useCart();
  const price = Number(product.retail_price_inr);

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
    unitSubtitle = `50kg Bag • Oil ≥ 68%`;
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Product Image */}
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-stone-800 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
            {product.grade}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-medium text-emerald-700 tracking-wide">
            {unitSubtitle}
          </div>
          <h3 className="font-bold text-stone-900 text-base mt-1 line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-stone-900 font-mono">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {perUnitNote && (
              <span className="text-xs text-stone-500 font-medium">
                ({perUnitNote})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 sm:p-5 pt-0 space-y-2">
        <button
          onClick={() => addToCart(product, 1)}
          className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>

        <button
          onClick={() => onSelectForRFQ(product)}
          className="w-full text-center text-xs font-medium text-stone-500 hover:text-amber-800 py-1 transition"
        >
          Buying bulk (500+)? <span className="underline font-semibold text-amber-700">Request Quote</span>
        </button>
      </div>
    </div>
  );
}
