'use client';

import React, { useState } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { Order } from '@/types';

interface AdminOrderUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: () => void;
}

export default function AdminOrderUpdateModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}: AdminOrderUpdateModalProps) {
  const [status, setStatus] = useState<string>('paid');
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [trackingRef, setTrackingRef] = useState<string>('');
  const [carrierName, setCarrierName] = useState<string>('VRL Logistics');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever order prop changes
  React.useEffect(() => {
    if (order) {
      setStatus(order.status || 'paid');
      setPaymentStatus((order as any).payment_status || (order.status === 'paid' ? 'paid' : 'pending'));
      setTrackingRef(order.tracking_reference || '');
      setCarrierName((order as any).carrier_name || 'VRL Logistics');
      setComment('');
      setErrorMsg(null);
    }
  }, [order?.id]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          next_status: status,
          payment_status: paymentStatus,
          tracking_reference: trackingRef.trim() || undefined,
          carrier_name: carrierName.trim() || undefined,
          admin_notes: comment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onOrderUpdated();
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to update order status');
      }
    } catch {
      setErrorMsg('Network error while saving order status');
    } finally {
      setSubmitting(false);
    }
  };

  const existingNotes = (order as any).admin_notes || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
              Operations Desk • Order Status Management
            </div>
            <h2 className="text-xl font-black font-mono mt-0.5">{order.order_number}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer & Total Summary */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 gap-3 text-stone-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Customer</span>
              <strong className="text-stone-900 text-sm block">{order.customer_name}</strong>
              <span className="font-mono text-stone-500">+91 {order.customer_phone}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Invoice Value</span>
              <strong className="text-emerald-900 text-sm font-mono block">
                ₹{Number(order.total_amount_inr).toLocaleString('en-IN')}
              </strong>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                {order.payment_method}
              </span>
            </div>
          </div>

          {/* Status Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Order Fulfillment Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="pending_payment">pending_payment (Awaiting UPI/NEFT)</option>
                <option value="paid">paid (Payment Done / Verified)</option>
                <option value="allocated">allocated (Lot Assigned)</option>
                <option value="packed">packed (Mesh/Box Packed)</option>
                <option value="dispatched">dispatched (Handed to Carrier)</option>
                <option value="delivered">delivered (Successfully Completed)</option>
                <option value="cancelled">cancelled (Void / Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Payment Status *</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="pending">pending (Payment Pending)</option>
                <option value="paid">paid (Payment Done / 100% Received)</option>
                <option value="unpaid">unpaid (Credit / Post-delivery)</option>
                <option value="refunded">refunded (Refund Processed)</option>
              </select>
            </div>
          </div>

          {/* Tracking & Carrier Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Carrier / Logistics Partner</label>
              <input
                type="text"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                placeholder="e.g. VRL Logistics / Shiprocket / Direct Canter"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Tracking Number / AWB / LR</label>
              <input
                type="text"
                value={trackingRef}
                onChange={(e) => setTrackingRef(e.target.value)}
                placeholder="e.g. VRL-BLR-892182 / SR-123456"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Operational Comments / Tracking History */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Add Operational Comments / Payment Notes
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. UPI payment of ₹1,479 verified with HDFC UTR 430219876543. Consignment ready for dispatch."
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Existing Order Notes History */}
          {existingNotes && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block flex items-center gap-1">
                <FileText className="w-3 h-3 text-stone-500" />
                Previous Order Notes & Updates
              </span>
              <p className="text-stone-700 whitespace-pre-wrap font-mono text-[11px] leading-relaxed break-words">
                {existingNotes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold hover:bg-emerald-800 transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Order Status & Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
