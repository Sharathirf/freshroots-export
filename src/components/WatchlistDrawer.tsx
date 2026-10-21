'use client';

import React from 'react';
import Link from 'next/link';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WatchlistDrawer() {
  const { wishlist, wishlistCount, removeFromWishlist, isWatchlistOpen, setIsWatchlistOpen } = useWishlist();
  const { addToCart } = useCart();

  if (!isWatchlistOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-end animate-in fade-in"
      onClick={() => setIsWatchlistOpen(false)}
    >
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">My Watchlist</h3>
              <p className="text-[11px] text-stone-500 font-medium">
                {wishlistCount} saved {wishlistCount === 1 ? 'commodity' : 'commodities'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWatchlistOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-800 text-base">Your Watchlist is Empty</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Explore our catalog of mature coconuts, copra, spices, and cold-pressed oils. Click the heart icon on any product to save it here.
              </p>
              <button
                onClick={() => setIsWatchlistOpen(false)}
                className="mt-3 inline-flex items-center gap-1.5 bg-[#3b6d11] hover:bg-[#2d5a0b] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 hover:border-emerald-300 transition"
              >
                <div className="flex items-start gap-3">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setIsWatchlistOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-50"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setIsWatchlistOpen(false)}
                        className="font-bold text-stone-900 text-xs sm:text-sm hover:text-[#3b6d11] transition line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-stone-400 hover:text-red-500 transition p-1"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {item.unit_of_measure} • <span className="font-semibold text-emerald-800">{item.grade}</span>
                    </div>

                    <div className="mt-1 font-mono font-bold text-sm text-stone-900">
                      ₹{Number(item.retail_price_inr).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      addToCart(item, 1);
                      setIsWatchlistOpen(false);
                    }}
                    className="flex-1 bg-[#3b6d11] hover:bg-[#2d5a0b] text-white font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setIsWatchlistOpen(false)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs py-2 px-3 rounded-xl transition"
                  >
                    View PDP ↗
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Items remain saved in your browser</span>
            <button
              onClick={() => setIsWatchlistOpen(false)}
              className="text-[#3b6d11] font-bold hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
