'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Package,
  RotateCcw,
  Truck,
  MessageCircle,
  Clock,
  ArrowRight,
  ShoppingBag,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Order } from '@/types';

export default function OrderHistoryModal() {
  const { customer, isOrderHistoryOpen, setIsOrderHistoryOpen } = useAuth();
  const { reorderItems } = useCart();

  const [phoneInput, setPhoneInput] = useState(customer?.phone || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reorderSuccessId, setReorderSuccessId] = useState<string | null>(null);

  const fetchOrders = async (phone: string) => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (data.orders.length === 0) {
          setErrorMsg(`No prior orders found for mobile +91 ${clean}.`);
        }
      } else {
        setErrorMsg(data.error || 'Failed to retrieve orders.');
        setOrders([]);
      }
    } catch {
      setErrorMsg('Network error while checking order history.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if modal opens and customer is logged in
  useEffect(() => {
    if (isOrderHistoryOpen) {
      const targetPhone = customer?.phone || phoneInput;
      if (targetPhone && targetPhone.length >= 10) {
        setPhoneInput(targetPhone);
        fetchOrders(targetPhone);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOrderHistoryOpen, customer?.phone]);

  if (!isOrderHistoryOpen) return null;

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    reorderItems(order.items);
    setReorderSuccessId(order.id);
    setTimeout(() => {
      setIsOrderHistoryOpen(false);
      setReorderSuccessId(null);
    }, 400);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'packed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'allocated':
      case 'paid':
        return 'bg-stone-100 text-stone-800 border-stone-300';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={() => setIsOrderHistoryOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 relative animate-in zoom-in-95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1c3809] text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-300 bg-lime-900/50 px-2.5 py-0.5 rounded-full border border-lime-400/30">
                1-Tap Repeat Procurement
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Your Order History &amp; Reorder
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Review past farm orders, check live courier progress, or reorder items in one click.
            </p>
          </div>

          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="text-emerald-100 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search by phone strip (if not logged in or wanting to switch number) */}
        <div className="p-4 bg-stone-50 border-b border-stone-200/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders(phoneInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b6d11] bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading || phoneInput.length < 10}
              className="px-4 py-2.5 rounded-xl bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Finding...' : 'View Orders'}</span>
            </button>
          </form>
        </div>

        {/* Orders List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> {errorMsg}
              </div>
            </div>
          )}

          {orders.length > 0 ? (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/50 p-4 sm:p-5 shadow-sm transition space-y-3"
              >
                {/* Order Top Line */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {ord.order_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>
                        {new Date(ord.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-stone-400 font-medium">Total Paid</div>
                    <div className="text-base font-black font-mono text-stone-900">
                      ₹{Number(ord.total_amount_inr).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Commodity Items List */}
                <div className="space-y-1.5">
                  {Array.isArray(ord.items) &&
                    ord.items.map((it: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1 text-stone-700 bg-stone-50/70 px-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-semibold text-stone-900 truncate">
                            {it.title}
                          </span>
                          <span className="text-[11px] text-stone-400 shrink-0">
                            × {it.quantity}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-stone-800 shrink-0">
                          ₹{Number(it.total_price_inr || it.unit_price_inr * it.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Action Buttons: Reorder, Track, Help */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    {/* Track Button */}
                    <Link
                      href={`/track-order?query=${encodeURIComponent(ord.order_number)}`}
                      onClick={() => setIsOrderHistoryOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
                    >
                      <Truck className="w-3.5 h-3.5 text-stone-600" />
                      <span>Track</span>
                    </Link>

                    {/* WhatsApp Help Button */}
                    <a
                      href={`https://wa.me/919591142548?text=${encodeURIComponent(
                        `Hi Sharath, I have a query about my order ${ord.order_number}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-emerald-700 text-xs font-semibold transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Order Help</span>
                    </a>
                  </div>

                  {/* 1-Tap Reorder Button */}
                  <button
                    type="button"
                    onClick={() => handleReorder(ord)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-95 text-white text-xs font-bold shadow-sm transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-lime-300" />
                    <span>{reorderSuccessId === ord.id ? 'Added to Cart!' : 'Reorder This'}</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            !loading &&
            hasSearched && (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-stone-800 text-sm">No Previous Orders Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Ready to place your first farm-gate produce order? Explore our 10 fresh APMC commodities!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOrderHistoryOpen(false);
                    const catalog = document.getElementById('catalog');
                    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b6d11] text-white text-xs font-bold shadow-sm hover:bg-[#2d5a0b] transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
                </button>
              </div>
            )
          )}

          {!hasSearched && (
            <div className="text-center py-8 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-800 text-sm">Looking for Past Orders?</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Enter your mobile number above to review past consignments and reorder in one touch.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500 shrink-0 px-4">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct Farm APMC Orders • Fast 24-48h Delivery</span>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="text-stone-600 hover:text-stone-900 font-bold px-3 py-1 rounded-lg hover:bg-stone-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
