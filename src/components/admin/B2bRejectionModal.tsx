'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { REJECTION_CATEGORIES } from '@/lib/b2b-constants';

interface B2bRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: {
    id: string;
    quote_number: string;
    company_name?: string;
    contact_person: string;
    product_title: string;
    requested_quantity: number;
    unit: string;
  } | null;
  onConfirmReject: (data: {
    id: string;
    rejection_category: string;
    rejection_reason: string;
    rejection_notes?: string;
  }) => Promise<void>;
}

export default function B2bRejectionModal({
  isOpen,
  onClose,
  rfq,
  onConfirmReject
}: B2bRejectionModalProps) {
  const [category, setCategory] = useState<string>('Price not commercially viable');
  const [reason, setReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [otherExplanation, setOtherExplanation] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!category) {
      setErrorMsg('Please select a valid rejection reason category.');
      return;
    }

    if (category === 'Other' && !otherExplanation.trim()) {
      setErrorMsg('Please explain why "Other" was selected as the rejection reason.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Mandatory explanatory comments cannot be empty or whitespace only.');
      return;
    }

    if (!confirmed) {
      setErrorMsg('Please tick the confirmation checkbox to verify this action.');
      return;
    }

    setSubmitting(true);
    try {
      const finalReason = category === 'Other' ? `Other: ${otherExplanation.trim()} — ${reason.trim()}` : reason.trim();
      await onConfirmReject({
        id: rfq.id,
        rejection_category: category,
        rejection_reason: finalReason,
        rejection_notes: internalNotes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject quotation enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-red-950 text-white flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Reject Quotation / RFQ</h3>
              <p className="text-xs text-red-200 font-mono">{rfq.quote_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-300 hover:text-white hover:bg-red-900/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-stone-700">
            <div className="font-bold text-stone-900">{rfq.company_name || rfq.contact_person}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Enquiry: {rfq.requested_quantity} {rfq.unit} of {rfq.product_title}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Rejection Reason Category <span className="text-red-600">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-red-600"
            >
              {REJECTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {category === 'Other' && (
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Explain &quot;Other&quot; Reason <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={otherExplanation}
                onChange={(e) => setOtherExplanation(e.target.value)}
                placeholder="Specific commercial or regulatory cause..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Mandatory Explanatory Comments <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail the commercial reason for declining this enquiry. This will be preserved in the auditable activity timeline..."
              className="w-full px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Internal-Only Notes <span className="text-stone-400 font-normal">(Visible only to authorized desk staff)</span>
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private procurement notes, supplier quotes, or buyer credibility remarks..."
              className="w-full px-3 py-2 border rounded-xl resize-none"
            />
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-red-600 focus:ring-red-600"
            />
            <span className="text-stone-600 text-[11px] leading-tight">
              I confirm that this quotation inquiry should be marked as <strong>REJECTED</strong>. The record and pricing history will be permanently preserved in the audit trail.
            </span>
          </label>

          {/* Action buttons */}
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
              disabled={submitting || !confirmed || !reason.trim()}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              {submitting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
