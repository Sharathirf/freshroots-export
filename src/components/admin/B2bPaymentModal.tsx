'use client';

import React, { useState } from 'react';
import { X, CreditCard, AlertTriangle } from 'lucide-react';

interface B2bPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: {
    id: string;
    quote_number: string;
    total_quote_inr?: number;
    company_name?: string;
    contact_person: string;
  } | null;
  totalPaid?: number;
  onRecordPayment: (data: any) => Promise<void>;
}

export default function B2bPaymentModal({
  isOpen,
  onClose,
  rfq,
  totalPaid = 0,
  onRecordPayment
}: B2bPaymentModalProps) {
  const quoteTotal = Number(rfq?.total_quote_inr || 0);
  const remainingBalance = Math.max(0, quoteTotal - totalPaid);

  const [amount, setAmount] = useState<number>(remainingBalance > 0 ? remainingBalance : 10000);
  const [method, setMethod] = useState('bank_neft_rtgs');
  const [reference, setReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [recordedBy, setRecordedBy] = useState('Accounts & Finance Desk');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (Number(amount) <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }
    if (!reference.trim()) {
      setErrorMsg('Transaction reference (Bank UTR / Cheque No / UPI Ref) is mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      await onRecordPayment({
        action: 'record_payment',
        amount_paid_inr: Number(amount),
        payment_method: method,
        transaction_reference: reference.trim(),
        payment_date: paymentDate,
        recorded_by: recordedBy.trim(),
        payment_notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Record B2B Commercial Payment</h3>
              <p className="text-xs text-stone-400 font-mono">{rfq.quote_number} • {rfq.company_name || rfq.contact_person}</p>
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

          {/* Balance card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Total Confirmed Value</div>
              <div className="font-mono font-bold text-stone-900 text-base mt-0.5">₹{quoteTotal.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-stone-400">Current Balance Due</div>
              <div className="font-mono font-extrabold text-amber-900 text-base mt-0.5">₹{remainingBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Amount Paid (₹ INR) *</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Payment Method *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              >
                <option value="bank_neft_rtgs">Bank NEFT / RTGS</option>
                <option value="upi">Direct Merchant UPI</option>
                <option value="cheque">Bank Cheque</option>
                <option value="cash">Cash Settlement (At Mandi Yard)</option>
                <option value="other">Other Direct Commercial Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Transaction UTR / Reference *</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. AXISN0123456789"
                className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Recorded By</label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Payment Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Advance deposit, milestone settlement..."
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
              disabled={submitting || Number(amount) <= 0 || !reference.trim()}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm"
            >
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
