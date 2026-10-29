'use client';

import React, { useState } from 'react';
import { X, UserCheck, AlertTriangle } from 'lucide-react';

interface B2bHandoverModalProps {
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
    destination_city: string;
    destination_pincode: string;
    operations_owner_name?: string;
  } | null;
  existingHandover?: any;
  onConfirmHandover: (data: any) => Promise<void>;
}

export default function B2bHandoverModal({
  isOpen,
  onClose,
  rfq,
  existingHandover,
  onConfirmHandover
}: B2bHandoverModalProps) {
  const isAcknowledgeMode = existingHandover && existingHandover.handover_status === 'pending_acknowledgement';

  const [opsOwner, setOpsOwner] = useState(rfq?.operations_owner_name || 'Ramesh (Mandya Mandi Yard)');
  const [packaging, setPackaging] = useState('Standard agricultural Grade A mesh bags with lot grading tag');
  const [deliveryCommitment, setDeliveryCommitment] = useState(`Direct dedicated surface freight to ${rfq?.destination_city || 'buyer yard'}`);
  const [qualityReqs, setQualityReqs] = useState('Grade A inspection: Moisture ≤ 5.50%, cracked nuts write-off');
  const [opsActions, setOpsActions] = useState('Procure consignment from Tiptur Mandi, conduct QC moisture test, assign transporter');
  const [ackComments, setAckComments] = useState('Handover verified against yard capacity. Consignment accepted into intake queue.');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAcknowledgeMode && !opsOwner.trim()) {
      setErrorMsg('An Operations Owner must be assigned for handover.');
      return;
    }

    setSubmitting(true);
    try {
      if (isAcknowledgeMode) {
        await onConfirmHandover({
          action: 'acknowledge',
          acknowledged_by: opsOwner.trim(),
          acknowledgement_comments: ackComments.trim()
        });
      } else {
        await onConfirmHandover({
          action: 'initiate',
          operations_owner: opsOwner.trim(),
          packaging_requirements: packaging.trim(),
          delivery_commitments: deliveryCommitment.trim(),
          quality_requirements: qualityReqs.trim(),
          required_ops_actions: opsActions.trim()
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process handover.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {isAcknowledgeMode ? 'Acknowledge Operations Handover' : 'Sales-to-Operations Handover'}
              </h3>
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

          <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-1">
            <div className="font-bold text-purple-950">
              Consignment: {rfq.requested_quantity} {rfq.unit} of {rfq.product_title}
            </div>
            <div className="text-[11px] text-purple-800">
              Destination: {rfq.destination_city} ({rfq.destination_pincode})
            </div>
          </div>

          {!isAcknowledgeMode ? (
            <>
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Assign Operations Owner <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={opsOwner}
                  onChange={(e) => setOpsOwner(e.target.value)}
                  placeholder="e.g. Ramesh (Mandya Mandi Yard Lead)"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Packaging Requirements</label>
                <input
                  type="text"
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Quality Inspection Requirements</label>
                <input
                  type="text"
                  value={qualityReqs}
                  onChange={(e) => setQualityReqs(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Delivery Commitments</label>
                <input
                  type="text"
                  value={deliveryCommitment}
                  onChange={(e) => setDeliveryCommitment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Required Operations Actions</label>
                <textarea
                  rows={2}
                  value={opsActions}
                  onChange={(e) => setOpsActions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Acknowledgement Comments <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                value={ackComments}
                onChange={(e) => setAckComments(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-purple-700"
              />
            </div>
          )}

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
              disabled={submitting}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              {submitting
                ? 'Processing...'
                : isAcknowledgeMode
                ? 'Acknowledge & Accept Consignment'
                : 'Initiate Operations Handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
