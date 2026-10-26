'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import {
  Package,
  Truck,
  MapPin,
  AlertCircle,
  Phone,
  Sprout,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Order } from '@/types';
import GstInvoiceModal from '@/components/GstInvoiceModal';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || searchParams.get('phone') || '';
  const { reorderItems } = useCart();

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reordered, setReordered] = useState(false);

  const fetchTracking = async (q: string) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.success) {
        if (data.orders.length > 0) {
          setOrders(data.orders);
          setSelectedOrder(data.orders[0]);
        } else {
          setOrders([]);
          setSelectedOrder(null);
          setErrorMsg(data.message || `No orders found matching "${q}".`);
        }
      } else {
        setErrorMsg(data.error || 'Failed to search tracking.');
      }
    } catch {
      setErrorMsg('Network error while checking tracking status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQueryInput(initialQuery);
      fetchTracking(initialQuery);
    } else {
      // Auto-load latest placed order without forcing user to type!
      try {
        const stored = localStorage.getItem('agri_latest_order');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.order_number) {
            setQueryInput(parsed.order_number);
            fetchTracking(parsed.order_number);
          }
        }
      } catch (e) {
        console.warn('Auto-track lookup error:', e);
      }
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(queryInput);
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    reorderItems(order.items);
    setReordered(true);
    setTimeout(() => setReordered(false), 2000);
  };

  // Helper to determine step status
  const getStepProgress = (status: string) => {
    const sequence = ['paid', 'allocated', 'packed', 'dispatched', 'delivered'];
    const idx = sequence.indexOf(status);
    return idx === -1 ? 0 : idx + 1;
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Quick Exit / Return to Shop Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#3b6d11] bg-white hover:bg-stone-100 border border-stone-200 px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Exit to Shop</span>
            </Link>
            <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
              Track live courier movement
            </span>
          </div>

          {/* Header Banner (Matches Katyayani Screenshot 1) */}
          <div className="text-center space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-[#edf7e1] px-4 py-1.5 rounded-full border border-emerald-200">
              Shiprocket & VRL Surface Courier Tracker
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
              Track Your Farm-Gate Shipment
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
              Enter your Order ID (e.g. <strong>AGR-20261021-2117</strong>) or 10-digit mobile number to track dispatch status in real time.
            </p>

            {/* Tracker Input Box */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-6 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Package className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Enter Order ID or 10-digit Phone"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-300 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b6d11] shadow-inner bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !queryInput.trim()}
                className="bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? 'Searching...' : 'Track Shipment'}
              </button>
            </form>
          </div>

          {/* Results Area */}
          {errorMsg && (
            <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Order Not Found:</strong> {errorMsg}
                <div className="text-[11px] text-amber-700 mt-1">
                  Need help? Contact our desk directly at <strong>+91 95911 42548</strong>.
                </div>
              </div>
            </div>
          )}

          {/* Multiple Orders Selector (if searched by phone) */}
          {orders.length > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Found {orders.length} Orders for this Mobile Number:
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                      selectedOrder?.id === ord.id
                        ? 'bg-[#3b6d11] text-white border-[#3b6d11]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{ord.order_number}</span> • <span className="uppercase text-[10px]">{ord.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Order Tracking Card */}
          {selectedOrder && (
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg overflow-hidden animate-in fade-in">
              {/* Order Status Header */}
              <div className="bg-stone-900 text-white p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                      Order Reference
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-xs text-stone-300">
                      {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-mono mt-0.5">
                    {selectedOrder.order_number}
                  </h2>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                      selectedOrder.status === 'delivered'
                        ? 'bg-emerald-500 text-stone-950'
                        : selectedOrder.status === 'dispatched'
                        ? 'bg-blue-400 text-stone-950'
                        : selectedOrder.status === 'packed'
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-stone-700 text-stone-200'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                  {selectedOrder.tracking_reference && (
                    <div className="text-xs text-stone-300 font-mono mt-1">
                      Carrier Ref: <strong>{selectedOrder.tracking_reference}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* 5-Step Visual Stepper */}
              <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
                <div className="grid grid-cols-5 gap-2 text-center relative">
                  {[
                    { label: 'Confirmed', sub: 'Payment Verified' },
                    { label: 'Allocated', sub: 'Quality Graded' },
                    { label: 'Packed', sub: 'Mesh / 5-Ply' },
                    { label: 'Dispatched', sub: 'Surface Freight' },
                    { label: 'Delivered', sub: 'Destination' }
                  ].map((step, idx) => {
                    const currentProgress = getStepProgress(selectedOrder.status);
                    const isCompleted = currentProgress >= idx + 1;
                    const isCurrent = currentProgress === idx + 1;

                    return (
                      <div key={idx} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm mb-2 transition shadow-sm ${
                            isCompleted
                              ? 'bg-[#3b6d11] text-white'
                              : isCurrent
                              ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-100'
                              : 'bg-stone-200 text-stone-400'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-stone-800 line-clamp-1">
                          {step.label}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-stone-400 line-clamp-1 hidden sm:block">
                          {step.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipment Consignment & Delivery Info */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Consignee & Shipping Destination */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Delivery Destination
                  </h4>

                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                    <div className="font-bold text-stone-900 text-sm">
                      {selectedOrder.customer_name}
                    </div>
                    <div className="text-stone-600 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{selectedOrder.shipping_address} (PIN: {selectedOrder.destination_pincode})</span>
                    </div>
                    <div className="text-stone-600 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>+91 {selectedOrder.customer_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Summary */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Consignment Commodities
                  </h4>

                  <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl p-4 bg-stone-50">
                    {Array.isArray(selectedOrder.items) &&
                      selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-stone-900">{item.title}</div>
                            <div className="text-[11px] text-stone-500">
                              {item.quantity} × ₹{Number(item.unit_price_inr).toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="font-mono font-bold text-stone-900">
                            ₹{Number(item.total_price_inr).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}

                    <div className="pt-3 mt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
                      <span>Total Consignment Value:</span>
                      <span className="font-mono text-emerald-800 text-base">
                        ₹{Number(selectedOrder.total_amount_inr).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Quick Actions: Reorder, Help, Exit */}
              <div className="bg-stone-50 border-t border-stone-200/90 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/919591142548?text=${encodeURIComponent(
                      `Hi Sharath, I have a query about my order ${selectedOrder.order_number}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Help on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsInvoiceOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-lime-400" />
                    <span>Official GST Invoice</span>
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition"
                  >
                    <span>Exit to Shop</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => handleReorder(selectedOrder)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b6d11] hover:bg-[#2d5a0b] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <RotateCcw className="w-4 h-4 text-lime-300" />
                  <span>{reordered ? 'Added to Cart!' : 'Reorder These Items'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <GstInvoiceModal
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                order={selectedOrder}
              />
            </div>
          )}

          {/* Trust Banner Bar (Matching Screenshot 1) */}
          <div className="mt-16 bg-[#111c08] text-white rounded-3xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-400 flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">Direct from Farmer</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">Zero distributor markup. Factory prices direct to farm.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">Farm Lab Tested</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">100% moisture verified & weight graded.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">Pan-India Surface Freight</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">Fast delivery with road & air courier transport.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-lime-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">Agri Desk Support</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">WhatsApp consultation Mon–Sat (+91 95911 42548).</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
