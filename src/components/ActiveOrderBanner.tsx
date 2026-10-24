'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, CheckCircle2, Phone, X, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LatestOrderSummary {
  order_number: string;
  date: string;
  total: number;
  status: string;
  items_count: number;
  first_item_title: string;
  payment_method?: string;
  customer_phone?: string;
  tracking_reference?: string;
}

export default function ActiveOrderBanner() {
  const { lang } = useAuth();
  const [order, setOrder] = useState<LatestOrderSummary | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const loadOrder = () => {
    try {
      const stored = localStorage.getItem('agri_latest_order');
      if (stored) {
        const parsed: LatestOrderSummary = JSON.parse(stored);
        // Only show if placed within the last 7 days
        const orderDate = new Date(parsed.date).getTime();
        const now = Date.now();
        if (now - orderDate < 7 * 24 * 60 * 60 * 1000) {
          setOrder(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse latest order:', e);
    }
  };

  useEffect(() => {
    loadOrder();

    const handleNewOrder = () => {
      setDismissed(false);
      loadOrder();
    };

    window.addEventListener('agri_order_placed', handleNewOrder);
    window.addEventListener('storage', handleNewOrder);
    return () => {
      window.removeEventListener('agri_order_placed', handleNewOrder);
      window.removeEventListener('storage', handleNewOrder);
    };
  }, []);

  if (!order || dismissed) return null;

  const isKannada = lang === 'kn';

  return (
    <aside
      aria-label={isKannada ? 'ಸಕ್ರಿಯ ಆರ್ಡರ್ ಟ್ರ್ಯಾಕರ್' : 'Active Order Tracker'}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
    >
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-[#1c3809] text-white rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-emerald-500/30 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with Dismiss button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
              {isKannada ? '🚚 ನಿಮ್ಮ ಸಕ್ರಿಯ ಆರ್ಡರ್ (ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್)' : '🚚 YOUR ACTIVE ORDER (LIVE SHIPMENT)'}
            </span>
            <span className="text-xs text-stone-300 font-mono hidden sm:inline">
              #{order.order_number}
            </span>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            title={isKannada ? 'ಮುಚ್ಚಿ' : 'Dismiss'}
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Order Details */}
          <div className="lg:col-span-5 space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>{order.first_item_title}</span>
              {order.items_count > 1 && (
                <span className="text-xs bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  +{order.items_count - 1} {isKannada ? 'ಹೆಚ್ಚು' : 'more'}
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-300">
              {isKannada ? 'ಒಟ್ಟು ಮೌಲ್ಯ:' : 'Grand Total:'}{' '}
              <strong className="text-emerald-400 font-mono text-sm">
                ₹{Number(order.total).toLocaleString('en-IN')}
              </strong>{' '}
              • {isKannada ? '100% ಉಚಿತ ಮನೆ ಬಾಗಿಲು ಡೆಲಿವರಿ' : '100% Free Doorstep Delivery'}
            </p>
          </div>

          {/* 4-Step Visual Progress Bar (Illiterate / Visual Friendly) */}
          <div className="lg:col-span-4 bg-stone-900/60 rounded-2xl p-2.5 border border-stone-800">
            <div className="flex items-center justify-between text-[10px] font-bold text-stone-300 px-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                {isKannada ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Confirmed'}
              </span>
              <span className="text-stone-600">──►</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Package className="w-3 h-3" />
                {isKannada ? 'ಪ್ಯಾಕ್ ಆಗಿದೆ' : 'Packed'}
              </span>
              <span className="text-stone-600">──►</span>
              <span className="flex items-center gap-1 text-amber-300 animate-pulse">
                <Truck className="w-3 h-3" />
                {isKannada ? 'ವಾಹನದಲ್ಲಿದೆ' : 'In Transit'}
              </span>
            </div>
          </div>

          {/* Action CTAs: 1-Tap Track Live & Call */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <Link
              href={`/track-order?query=${encodeURIComponent(order.order_number)}`}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl text-center shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>{isKannada ? 'ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ನೋಡಿ' : 'Track Live'}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <a
              href="tel:+919591142548"
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-xs p-3 rounded-xl transition flex items-center justify-center"
              title={isKannada ? 'ಫೋನ್ ಕರೆ ಮಾಡಿ' : 'Call Farm Support'}
              aria-label="Call Farm Support"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
