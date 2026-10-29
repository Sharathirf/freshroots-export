'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Truck, RotateCcw, ShoppingBag, User, UserCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const {
    isLoggedIn,
    customer,
    setIsOrderHistoryOpen,
    setIsSignInModalOpen,
    setIsAccountModalOpen
  } = useAuth();

  // On individual product detail pages, yield bottom space to the high-converting PDP Buy/Cart Action Bar
  if (pathname && pathname.startsWith('/products/')) {
    return null;
  }

  const isHome = pathname === '/';
  const isTrack = pathname === '/track-order';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around">
      {/* 1. Shop (Come & Select) */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center py-1 px-1.5 transition rounded-xl ${
          isHome ? 'text-[#3b6d11] font-bold' : 'text-stone-600 hover:text-[#3b6d11]'
        }`}
      >
        <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-0.5">Shop</span>
      </Link>

      {/* 2. Track Order */}
      <Link
        href="/track-order"
        className={`flex flex-col items-center justify-center py-1 px-1.5 transition rounded-xl ${
          isTrack ? 'text-[#3b6d11] font-bold' : 'text-stone-600 hover:text-[#3b6d11]'
        }`}
      >
        <Truck className={`w-5 h-5 ${isTrack ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-0.5">Track</span>
      </Link>

      {/* 3. Cart */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-1.5 text-stone-600 hover:text-[#3b6d11] transition relative rounded-xl"
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

      {/* 4. Orders */}
      <button
        type="button"
        onClick={() => setIsOrderHistoryOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-1.5 text-stone-600 hover:text-[#3b6d11] transition rounded-xl"
      >
        <RotateCcw className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Orders</span>
      </button>

      {/* 5. Sign In / Account */}
      {!isLoggedIn ? (
        <button
          type="button"
          onClick={() => setIsSignInModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1.5 text-stone-700 hover:text-[#3b6d11] transition rounded-xl"
          title="Customer Sign In & Sign Up"
        >
          <User className="w-5 h-5 text-stone-600" />
          <span className="text-[10px] font-bold mt-0.5 text-[#3b6d11]">Sign In</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsAccountModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1.5 text-[#1c3809] hover:text-[#3b6d11] transition rounded-xl"
          title="My Account"
        >
          <div className="relative">
            <UserCheck className="w-5 h-5 text-[#3b6d11]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 truncate max-w-[48px]">
            {customer?.name ? customer.name.split(' ')[0] : 'Account'}
          </span>
        </button>
      )}
    </nav>
  );
}
