'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Truck, RotateCcw, HelpCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const { itemCount, setIsCartOpen } = useCart();
  const { setIsOrderHistoryOpen, setIsHelpOpen } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
      {/* 1. Shop (Come & Select) */}
      <Link
        href="/"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-[#3b6d11] hover:text-[#2d5a0b] transition"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">Shop</span>
      </Link>

      {/* 2. Track Order (Track & Exit) */}
      <Link
        href="/track-order"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-stone-600 hover:text-[#3b6d11] transition"
      >
        <Truck className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Track</span>
      </Link>

      {/* 3. Orders & Reorder */}
      <button
        type="button"
        onClick={() => setIsOrderHistoryOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2.5 text-stone-600 hover:text-[#3b6d11] transition"
      >
        <RotateCcw className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Orders</span>
      </button>

      {/* 4. Help (Direct Desk) */}
      <button
        type="button"
        onClick={() => setIsHelpOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2.5 text-stone-600 hover:text-[#3b6d11] transition"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Help</span>
      </button>

      {/* 5. Cart (Order & Leave) */}
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
