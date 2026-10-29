'use client';

import React, { useState } from 'react';
import { X, FileEdit, AlertTriangle } from 'lucide-react';

interface B2bRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: {
    id: string;
    quote_number: string;
    product_title: string;
    requested_quantity: number;
    unit: string;
    proposed_unit_price_inr?: number;
    freight_charges_inr?: number;
    total_quote_inr?: number;
    revision_number?: number;
  } | null;
  onSaveRevision: (data: any) => Promise<void>;
}

export default function B2bRevisionModal({
  isOpen,
  onClose,
  rfq,
  onSaveRevision
}: B2bRevisionModalProps) {
  const [unitPrice, setUnitPrice] = useState<number>(Number(rfq?.proposed_unit_price_inr || 0));
  const [freight, setFreight] = useState<number>(Number(rfq?.freight_charges_inr || 0));
  const [quantity, setQuantity] = useState<number>(Number(rfq?.requested_quantity || 1));
  const [changeReason, setChangeReason] = useState('');
  const [notes, setNotes] = useState('');
  const [validHours, setValidHours] = useState(48);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  const newTotal = (Number(unitPrice) * Number(quantity)) + Number(freight);
  const prevTotal = Number(rfq.total_quote_inr || 0);
  const nextRevNumber = (rfq.revision_number || 1) + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (Number(unitPrice) <= 0) {
      setErrorMsg('Proposed unit price must be greater than zero.');
      return;
    }
    if (!changeReason.trim()) {
      setErrorMsg('A mandatory explanation for the quotation revision is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSaveRevision({
        proposed_unit_price_inr: Number(unitPrice),
        freight_charges_inr: Number(freight),
        requested_quantity: Number(quantity),
        change_reason: changeReason.trim(),
        valid_hours: Number(validHours),
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create revision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Create Quotation Revision</h3>
              <p className="text-xs text-stone-400 font-mono">
                {rfq.quote_number} • Upgrading to <strong>Rev {nextRevNumber}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pricing Comparison Bar */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase text-stone-400">Current Quote (Rev {rfq.revision_number || 1})</div>
              <div className="font-mono font-bold text-stone-700 text-sm mt-0.5">₹{prevTotal.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-stone-500">₹{rfq.proposed_unit_price_inr || 0}/{rfq.unit}</div>
            </div>
            <div className="border-l pl-4 border-stone-200">
              <div className="text-[10px] font-bold uppercase text-blue-600">New Proposed (Rev {nextRevNumber})</div>
              <div className="font-mono font-extrabold text-blue-900 text-sm mt-0.5">₹{newTotal.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-stone-500">₹{unitPrice || 0}/{rfq.unit}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Quantity ({rfq.unit})</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Unit Price (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Freight (₹ INR)</label>
              <input
                type="number"
                value={freight}
                onChange={(e) => setFreight(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Revision Reason / Negotiation Trigger <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={2}
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g. Buyer renegotiated consignment volume from 200 bags to 350 bags; adjusted Mandi spot benchmark..."
              className="w-full px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Validity Period (Hours)</label>
              <select
                value={validHours}
                onChange={(e) => setValidHours(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              >
                <option value={24}>24 Hours (Fast volatile market)</option>
                <option value={48}>48 Hours (Standard Mandi benchmark)</option>
                <option value={72}>72 Hours (Commercial commitment)</option>
                <option value={168}>7 Days (Contractual lot)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Commercial Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment milestone or transport clause..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Number(unitPrice) <= 0 || !changeReason.trim()}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm"
            >
              {submitting ? 'Creating...' : `Issue Revision ${nextRevNumber}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
