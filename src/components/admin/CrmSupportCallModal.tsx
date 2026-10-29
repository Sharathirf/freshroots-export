'use client';

import React, { useState } from 'react';
import { X, PhoneCall, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Customer } from '@/types';
import { CALL_TYPES, CALL_OUTCOMES } from '@/lib/crm-constants';

interface CrmSupportCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onCallLogged: (call: any) => void;
}

export default function CrmSupportCallModal({
  isOpen,
  onClose,
  customer,
  onCallLogged,
}: CrmSupportCallModalProps) {
  const [callType, setCallType] = useState('feedback');
  const [callOutcome, setCallOutcome] = useState('contacted');
  const [summary, setSummary] = useState('');
  const [repName, setRepName] = useState('Customer Care Rep');
  const [reorderInterest, setReorderInterest] = useState(false);
  const [nextAction, setNextAction] = useState('');
  const [nextActionDue, setNextActionDue] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!summary.trim()) {
      setErrorMsg('Discussion summary is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        call_type: callType,
        call_outcome: callOutcome,
        summary: summary.trim(),
        rep_name: repName.trim() || 'Customer Care Rep',
        reorder_interest: reorderInterest,
        next_action: nextAction.trim() || undefined,
        next_action_due: nextActionDue || undefined,
        internal_notes: internalNotes.trim() || undefined,
      };

      const res = await fetch(`/api/admin/crm/customers/${customer.id}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onCallLogged(data.call);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to record call.');
      }
    } catch {
      setErrorMsg('Network error while logging call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Log Customer Support / Sales Call</h2>
              <p className="text-xs text-stone-400">{customer.name} (+91 {customer.phone})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Call Purpose / Type</label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
              >
                {CALL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Call Outcome</label>
              <select
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
              >
                {CALL_OUTCOMES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Discussion Summary *</label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Customer satisfied with coconut moisture. Requested 30 more bags on Friday. Quote communicated at ₹1,479/bag."
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <span className="font-bold text-stone-800">Customer Expressed Reorder Interest?</span>
            <input
              type="checkbox"
              checked={reorderInterest}
              onChange={(e) => setReorderInterest(e.target.checked)}
              className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-700 block mb-1">Next Action Required</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Call back with Mandi spot quote"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>

            <div>
              <label className="text-stone-700 block mb-1">Follow-up Due Date</label>
              <input
                type="date"
                value={nextActionDue}
                onChange={(e) => setNextActionDue(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-700 block mb-1">Responsible Employee</label>
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>

            <div>
              <label className="text-stone-700 block mb-1">Internal Notes (Private)</label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Private observation for sales desk"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>
          </div>

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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-extrabold hover:bg-stone-800 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Logging...' : 'Save Call Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
