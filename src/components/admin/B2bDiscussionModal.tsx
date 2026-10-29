'use client';

import React, { useState } from 'react';
import { X, MessageSquare, AlertTriangle } from 'lucide-react';
import { CommunicationChannel, ActivityVisibility } from '@/types';

interface B2bDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: {
    id: string;
    quote_number: string;
    contact_person: string;
    company_name?: string;
  } | null;
  onSaveDiscussion: (data: any) => Promise<void>;
}

export default function B2bDiscussionModal({
  isOpen,
  onClose,
  rfq,
  onSaveDiscussion
}: B2bDiscussionModalProps) {
  const [channel, setChannel] = useState<CommunicationChannel>('phone');
  const [channelOtherExplanation, setChannelOtherExplanation] = useState('');
  const [buyerContact, setBuyerContact] = useState(rfq?.contact_person || '');
  const [employeeName, setEmployeeName] = useState('Sharath (Commercial Desk)');
  const [summary, setSummary] = useState('');
  const [concerns, setConcerns] = useState('');
  const [priceChanges, setPriceChanges] = useState('');
  const [commercialCommitments, setCommercialCommitments] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [visibility, setVisibility] = useState<ActivityVisibility>('internal_note');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!summary.trim()) {
      setErrorMsg('Discussion summary is mandatory.');
      return;
    }
    if (channel === 'other' && !channelOtherExplanation.trim()) {
      setErrorMsg('Explanation is required when channel is "other".');
      return;
    }

    setSubmitting(true);
    try {
      await onSaveDiscussion({
        rfq_id: rfq.id,
        communication_channel: channel,
        channel_other_explanation: channel === 'other' ? channelOtherExplanation.trim() : null,
        employee_name: employeeName.trim(),
        employee_role: 'sales',
        buyer_contact_person: buyerContact.trim() || rfq.contact_person,
        discussion_summary: summary.trim(),
        buyer_concerns: concerns.trim() || null,
        price_changes_requested: priceChanges.trim() || null,
        commercial_commitments: commercialCommitments.trim() || null,
        next_action: nextAction.trim() || null,
        followup_due_date: followupDate ? new Date(followupDate).toISOString() : null,
        responsible_employee: employeeName.trim(),
        visibility
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record discussion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Record Buyer Discussion</h3>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Communication Channel *</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              >
                <option value="phone">Phone Call</option>
                <option value="whatsapp">WhatsApp Discussion (Staff Recorded)</option>
                <option value="email">Email Thread</option>
                <option value="meeting">In-Person Meeting</option>
                <option value="web_inquiry">Website Enquiry Note</option>
                <option value="video">Video Conference</option>
                <option value="internal">Internal Strategy Review</option>
                <option value="other">Other Channel</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Buyer Contact Person</label>
              <input
                type="text"
                value={buyerContact}
                onChange={(e) => setBuyerContact(e.target.value)}
                placeholder="Name of person spoken with..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          {channel === 'other' && (
            <div>
              <label className="block font-bold text-stone-700 mb-1">Explain Other Channel *</label>
              <input
                type="text"
                value={channelOtherExplanation}
                onChange={(e) => setChannelOtherExplanation(e.target.value)}
                placeholder="e.g. Agri Expo stall conversation..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">Discussion Summary *</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key topics discussed, consignment questions, timeline expectations..."
              className="w-full px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Buyer Concerns / Objections</label>
              <input
                type="text"
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="e.g. Freight too high, moisture certificate required..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Price / Quantity Requests</label>
              <input
                type="text"
                value={priceChanges}
                onChange={(e) => setPriceChanges(e.target.value)}
                placeholder="e.g. Requested ₹5/kg discount for 10-ton order..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Commercial Commitments Made</label>
            <input
              type="text"
              value={commercialCommitments}
              onChange={(e) => setCommercialCommitments(e.target.value)}
              placeholder="e.g. Agreed to hold lot for 48h, promised test sample..."
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Next Action Required</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Send revised quotation with CIF freight..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Schedule Follow-up Date</label>
              <input
                type="datetime-local"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Desk Handler</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Visibility Level</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              >
                <option value="internal_note">Internal Note (Authorized Staff Only)</option>
                <option value="ops_update">Operations Update (Yard & Fulfilment Team)</option>
                <option value="buyer_visible">Buyer Visible Communication</option>
              </select>
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
              disabled={submitting || !summary.trim()}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm"
            >
              {submitting ? 'Recording...' : 'Save Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
