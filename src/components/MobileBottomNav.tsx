'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Grid, Heart, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface MobileBottomNavProps {
  onOpenRFQ?: () => void;
}

export default function MobileBottomNav({}: MobileBottomNavProps = {}) {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWatchlistOpen } = useWishlist();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
      {/* 1. Home */}
      <Link
        href="/"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-[#3b6d11] transition"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">Home</span>
      </Link>

      {/* 2. Catalog */}
      <Link
        href="/#catalog"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-stone-600 hover:text-[#3b6d11] transition"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Catalog</span>
      </Link>

      {/* 3. Watchlist */}
      <button
        type="button"
        onClick={() => setIsWatchlistOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2.5 text-stone-600 hover:text-red-600 transition relative"
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold mt-0.5">Watchlist</span>
      </button>

      {/* 4. Track Order */}
      <Link
        href="/track-order"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-stone-600 hover:text-[#3b6d11] transition"
      >
        <Truck className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Track</span>
      </Link>

      {/* 5. Cart Drawer Trigger */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2.5 text-stone-600 hover:text-[#3b6d11] transition relative"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold mt-0.5">Cart</span>
      </button>
    </nav>
  );
}
