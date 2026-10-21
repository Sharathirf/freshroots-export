'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export default function ExitIntentModal() {
  const { items, itemCount, subtotal } = useCart();
  const { wishlist, wishlistCount } = useWishlist();
  const { isLoggedIn, signIn } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Only engage if not logged in and has items in cart or watchlist
    if (isLoggedIn) return;
    if (itemCount === 0 && wishlistCount === 0) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('tiptur_exit_intent_dismissed');
    if (dismissed === 'true') return;

    const handleMouseLeave = (e: MouseEvent) => {
      // User moves mouse up towards browser tabs / close button
      if (e.clientY <= 10 && !sessionStorage.getItem('tiptur_exit_intent_dismissed')) {
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isLoggedIn, itemCount, wishlistCount]);

  if (!isOpen || isLoggedIn || (itemCount === 0 && wishlistCount === 0)) {
    return null;
  }

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('tiptur_exit_intent_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp phone number');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const customerName = name.trim() || `Valued Buyer ${cleanPhone.slice(-4)}`;

    try {
      // 1. Sign in locally
      signIn(cleanPhone.slice(-10), customerName);

      // 2. Persist profile in backend
      await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone.slice(-10),
          full_name: customerName
        })
      });

      // 3. Sync cart and mark as exit-ready
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone.slice(-10),
          name: customerName,
          cart_items: items,
          watchlist_items: wishlist,
          subtotal: subtotal,
          is_exit: true
        })
      });

      setIsSubmitted(true);
      sessionStorage.setItem('tiptur_exit_intent_dismissed', 'true');

      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to lock rate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={handleDismiss}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-300 relative animate-in zoom-in-95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Farm Ribbon Decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-[#3b6d11]" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">
              Farm Lot Reserved!
            </h3>
            <p className="text-stone-600 mt-2 text-sm leading-relaxed max-w-md mx-auto">
              Your Kikkeri farm lot and prices are locked in. A direct WhatsApp order link has been prepared for <span className="font-bold text-stone-800">+91 {phone.replace(/\D/g, '').slice(-10)}</span>.
            </p>
            <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Price lock active for 24 hours against APMC market fluctuations.</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Before You Leave
            </div>

            <h3 className="text-2xl font-black text-stone-900 tracking-tight leading-snug">
              Lock in Today&apos;s Mandya Farm-Gate Price
            </h3>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed">
              You have <span className="font-bold text-stone-900">{itemCount} item(s)</span> in your cart totaling <span className="font-bold text-emerald-800">₹{subtotal.toLocaleString('en-IN')}</span>. APMC auction prices fluctuate daily. Leave your WhatsApp number to hold your batch and receive an instant recovery link.
            </p>

            {/* Price Guarantee Card */}
            <div className="my-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-stone-900">Direct From Kikkeri, Mandya</div>
                  <div className="text-stone-500">Zero middlemen · 100% genuine farm lot</div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                  Rate Held 24h
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharath or Ramesh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b6d11]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp Number <span className="text-emerald-700">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-sm font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="95911 42548"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b6d11]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#3b6d11] hover:bg-[#2f570d] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Reserving Lot...</span>
                ) : (
                  <>
                    <span>Hold Farm-Gate Rate & Send WhatsApp Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-stone-400 hover:text-stone-600 text-xs font-medium underline underline-offset-2"
              >
                No thanks, I will risk APMC price changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
