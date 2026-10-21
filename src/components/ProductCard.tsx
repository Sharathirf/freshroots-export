'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectForRFQ: (product: Product) => void;
}

function formatStockLabel(stock: number, product: Product): string {
  if (product.category === 'mature_coconut') {
    return `${stock} Bags in stock`;
  }
  if (product.sku.includes('TIP-25K')) {
    return `${stock} Boxes in stock`;
  }
  if (product.sku.includes('50K')) {
    return `${stock} Bags in stock`;
  }
  if (product.category === 'spices') {
    return `${stock} Packs in stock`;
  }
  if (product.category === 'oil_and_extracts') {
    return `${stock} Tins in stock`;
  }
  if (product.category === 'coir_commodities') {
    return `${stock} Pallets in stock`;
  }
  return `${stock} Units in stock`;
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
    unitSubtitle = `50kg Bag • Moisture ≤ 5.5% • Oil ≥ 68%`;
  } else if (product.estimated_weight_kg) {
    perUnitNote = `₹${(price / Number(product.estimated_weight_kg)).toFixed(0)}/kg`;
  }

  const stockText = formatStockLabel(product.available_stock || 220, product);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
      {/* Product Image & Link to PDP */}
      <div>
        <Link href={`/products/${product.slug}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-stone-800 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
            {product.grade}
          </span>
          <span className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-sm text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm">
            ✓ {stockText}
          </span>
        </Link>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-medium text-emerald-700 tracking-wide">
            {unitSubtitle}
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-stone-900 text-base mt-1 line-clamp-1 group-hover:text-emerald-800 transition">
              {product.title}
            </h3>
          </Link>
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
          Buying bulk? <span className="underline font-semibold text-amber-700">Request Quote</span>
        </button>
      </div>
    </div>
  );
}
