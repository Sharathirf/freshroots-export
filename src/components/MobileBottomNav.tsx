'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Grid, Building2, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface MobileBottomNavProps {
  onOpenRFQ: () => void;
}

export default function MobileBottomNav({ onOpenRFQ }: MobileBottomNavProps) {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
      {/* 1. Home */}
      <Link
        href="/"
        className="flex flex-col items-center justify-center py-1 px-3 text-[#3b6d11] transition"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">Home</span>
      </Link>

      {/* 2. Categories */}
      <a
        href="#catalog"
        className="flex flex-col items-center justify-center py-1 px-3 text-stone-600 hover:text-[#3b6d11] transition"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Catalog</span>
      </a>

      {/* 3. Bulk RFQ */}
      <button
        onClick={onOpenRFQ}
        className="flex flex-col items-center justify-center py-1 px-3 text-amber-700 hover:text-amber-800 transition"
      >
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5 text-amber-800" />
        </div>
        <span className="text-[10px] font-bold mt-0.5">Bulk RFQ</span>
      </button>

      {/* 4. Cart Drawer Trigger */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-3 text-stone-600 hover:text-[#3b6d11] transition relative"
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

      {/* 5. Agri Desk WhatsApp */}
      <a
        href="https://wa.me/919591142548"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center py-1 px-3 text-emerald-700 hover:text-emerald-800 transition"
      >
        <Phone className="w-5 h-5 text-emerald-600" />
        <span className="text-[10px] font-semibold mt-0.5">Agri Desk</span>
      </a>
    </nav>
  );
}
