'use client';

import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';

interface B2bReopenModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: {
    id: string;
    quote_number: string;
    company_name?: string;
    contact_person: string;
    status: string;
  } | null;
  onConfirmReopen: (data: { id: string; reopen_reason: string }) => Promise<void>;
}

export default function B2bReopenModal({
  isOpen,
  onClose,
  rfq,
  onConfirmReopen
}: B2bReopenModalProps) {
  const [reopenReason, setReopenReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reopenReason.trim()) {
      setErrorMsg('A mandatory reason is strictly required to reopen a closed or rejected RFQ.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirmReopen({
        id: rfq.id,
        reopen_reason: reopenReason.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reopen RFQ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Reopen RFQ Enquiry</h3>
              <p className="text-xs text-stone-400 font-mono">{rfq.quote_number}</p>
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
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900">
            <strong>Governance Policy:</strong> Reopening a previously {rfq.status} inquiry resets it to <strong>Under Review</strong> and records an exceptional audit event.
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Mandatory Reopening Justification <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Buyer renegotiated volume to meet minimum MOQ; renewed interest confirmed via phone call..."
              className="w-full px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-emerald-700"
            />
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
              disabled={submitting || !reopenReason.trim()}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm"
            >
              {submitting ? 'Reopening...' : 'Confirm Reopen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
