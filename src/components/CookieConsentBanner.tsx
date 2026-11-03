'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('freshroots_cookie_consent');
      if (!consent) {
        // Small delay to ensure non-blocking layout
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleConsent = (choice: 'accepted' | 'essential') => {
    try {
      localStorage.setItem('freshroots_cookie_consent', choice);
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white border border-stone-800 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold tracking-tight">
              Data Privacy &amp; Cookie Consent
            </h4>
          </div>
          <button
            type="button"
            onClick={() => handleConsent('essential')}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Dismiss cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-stone-300 leading-relaxed">
          We use essential cookies to maintain your shopping cart and anonymous analytics to monitor farm consignment logistics. Under India&apos;s DPDP Act 2023, your data is never sold or shared with unverified brokers. Read our{' '}
          <Link href="/privacy" className="text-emerald-400 underline hover:text-emerald-300">
            Privacy Policy
          </Link>.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleConsent('accepted')}
            className="flex-1 py-2 px-3 rounded-xl bg-[#3b6d11] hover:bg-[#4a8a18] text-white text-xs font-bold transition shadow-xs"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => handleConsent('essential')}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 text-xs font-semibold border border-white/20 transition"
          >
            Essential Only
          </button>
        </div>
      </div>
    </aside>
  );
}
