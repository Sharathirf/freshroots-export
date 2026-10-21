'use client';

import React from 'react';
import { X, User, Pencil, Mail, MapPin, ShoppingBag, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountModal() {
  const {
    customer,
    isAccountModalOpen,
    setIsAccountModalOpen,
    setIsEditProfileModalOpen,
    setIsSignInModalOpen,
    signOut
  } = useAuth();

  if (!isAccountModalOpen) return null;

  const handleUseDifferentNumber = () => {
    signOut();
    setIsAccountModalOpen(false);
    setIsSignInModalOpen(true);
  };

  const handleShopNow = () => {
    setIsAccountModalOpen(false);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formattedAddress = [
    customer?.address,
    customer?.city,
    customer?.state,
    customer?.pincode ? `PIN: ${customer.pincode}` : null
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setIsAccountModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Farm Header Top Strip - Matching Screenshot 2 green top motif */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-[#143d22] -z-0 flex flex-col justify-center items-center text-white px-4">
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Your Account
          </h2>
          <p className="text-xs text-emerald-200/90 font-medium">
            View your profile details and order summary
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsAccountModalOpen(false)}
          className="absolute top-4 right-4 text-emerald-100 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-20">
          {/* Main Account Card - Matches Screenshot 2 */}
          <div className="bg-stone-50/80 rounded-2xl border border-stone-200/80 p-5 sm:p-6 mb-6 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-[#daf1de] border border-[#a8e0b4] flex items-center justify-center text-[#1e824c] shrink-0">
                  <User className="w-7 h-7 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    {customer?.name || 'Guest User'}
                  </h3>
                  <div className="text-xs font-semibold text-stone-600 font-mono mt-0.5">
                    +91 {customer?.phone || '9591142548'}
                  </div>
                </div>
              </div>

              {/* Edit Button with Pencil */}
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5 text-stone-500" />
                <span>Edit</span>
              </button>
            </div>

            {/* Email & Address Details */}
            <div className="mt-5 pt-4 border-t border-stone-200/80 space-y-2.5 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <span className={customer?.email ? 'text-stone-800' : 'text-stone-400 italic'}>
                  {customer?.email || 'Not provided'}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span className={formattedAddress ? 'text-stone-800' : 'text-stone-400 italic'}>
                  {formattedAddress || 'No address saved'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Matches Screenshot 2 */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleShopNow}
                className="w-full py-3 px-4 rounded-full bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleUseDifferentNumber}
                className="w-full py-3 px-4 rounded-full border-2 border-[#1e824c] hover:bg-emerald-50 text-[#1e824c] font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Use Different Number</span>
              </button>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="w-full py-2.5 px-4 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
