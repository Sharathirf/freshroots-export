'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Building2, Scale, Droplet, Sparkles, Info } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectForRFQ: (product: Product) => void;
}

export default function ProductCard({ product, onSelectForRFQ }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  const price = Number(product.retail_price_inr);
  const wholesaleBenchmark = Number(product.wholesale_benchmark_price_inr || price * 0.7);

  // Compute per-nut or per-kg equivalent
  let perUnitNote = '';
  if (product.sku.includes('GRA') || product.sku.includes('GRB')) {
    perUnitNote = `₹${(price / 50).toFixed(1)} / nut`;
  } else if (product.sku.includes('TIP-25K')) {
    perUnitNote = `₹${(price / 25).toFixed(0)} / kg`;
  } else if (product.sku.includes('50K')) {
    perUnitNote = `₹${(price / 50).toFixed(0)} / kg`;
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Product Image & Badges */}
      <div className="relative h-60 w-full overflow-hidden bg-stone-100">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Origin Pill */}
        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{product.origin.split(',')[0]}</span>
        </div>

        {/* Grade Badge */}
        <div className="absolute top-3 right-3 bg-emerald-800 text-emerald-100 text-[11px] font-extrabold px-3 py-1 rounded-full shadow">
          {product.grade}
        </div>

        {/* Stock Status Indicator */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>In Stock: {product.available_stock || 150} {product.unit_of_measure.split(' ')[0]}s</span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-stone-900 text-lg leading-tight group-hover:text-emerald-800 transition">
            {product.title}
          </h3>

          <p className="text-stone-600 text-xs mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Quick Technical Specs Bar */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-stone-500" />
              <span>Est. Wt: <strong>{product.estimated_weight_kg} kg</strong></span>
            </div>
            {product.moisture_percentage && (
              <div className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-600" />
                <span>Moisture: <strong>&le; {product.moisture_percentage}%</strong></span>
              </div>
            )}
          </div>

          {/* Tiered Pricing Mini-Table */}
          <div className="mt-3.5 text-xs text-stone-500 space-y-1">
            <div className="flex justify-between items-center text-stone-900 font-bold">
              <span>Retail Price ({product.unit_of_measure}):</span>
              <span className="font-mono text-base text-emerald-900">
                ₹{price.toLocaleString('en-IN')}{' '}
                <span className="text-[11px] font-normal text-stone-500">({perUnitNote})</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-amber-900 bg-amber-50/80 px-2 py-1 rounded-md">
              <span>Bulk 10+ Lots:</span>
              <span className="font-bold">Save ~25% (Benchmark: ₹{wholesaleBenchmark}/unit)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
          {/* Quantity Selector & Add to Cart */}
          <div className="flex gap-2">
            <select
              value={selectedQty}
              onChange={(e) => setSelectedQty(parseInt(e.target.value, 10))}
              className="w-20 px-2 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {[1, 2, 3, 4, 5, 8, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Lot' : 'Lots'}
                </option>
              ))}
            </select>

            <button
              onClick={() => addToCart(product, selectedQty)}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Retail Cart</span>
            </button>
          </div>

          {/* Wholesale RFQ & Specs Row */}
          <div className="flex gap-2">
            <button
              onClick={() => onSelectForRFQ(product)}
              className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Wholesale Bulk Quote</span>
            </button>

            <button
              onClick={() => setIsSpecsOpen(true)}
              className="p-2 border border-stone-200 hover:bg-stone-100 rounded-xl text-stone-600 transition"
              title="View Lab Specifications"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Modal */}
      {isSpecsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Lab Certificate
                </span>
                <h4 className="font-extrabold text-stone-900 text-base mt-1">{product.title}</h4>
              </div>
              <button
                onClick={() => setIsSpecsOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-stone-500">Standard SKU:</span>
                <span className="font-mono font-semibold">{product.sku}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-stone-500">Mandi Origin:</span>
                <span className="font-semibold text-stone-800">{product.origin}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-stone-500">HSN Classification:</span>
                <span className="font-mono font-semibold">{product.hsn_code} ({product.tax_rate_percentage}% GST)</span>
              </div>
              {product.specifications &&
                Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1.5 border-b">
                    <span className="text-stone-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-semibold text-stone-800 text-right max-w-[200px]">{val}</span>
                  </div>
                ))}
            </div>

            <div className="mt-5 pt-3">
              <button
                onClick={() => setIsSpecsOpen(false)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
              >
                Close Specifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
