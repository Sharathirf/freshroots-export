'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  UserCheck,
  Plus,
  Send,
  FileEdit
} from 'lucide-react';
import { ActivityVisibility } from '@/types';

interface B2bRfqDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqId: string | null;
  onRefreshParent: () => void;
  onOpenRevisionModal: (rfq: any) => void;
  onOpenDiscussionModal: (rfq: any) => void;
  onOpenHandoverModal: (rfq: any) => void;
  onOpenFulfilmentModal: (rfq: any, tab?: any) => void;
  onOpenPaymentModal: (rfq: any) => void;
  onOpenRejectModal?: (rfq: any) => void;
  onOpenReopenModal?: (rfq: any) => void;
}

export default function B2bRfqDetailModal({
  isOpen,
  onClose,
  rfqId,
  onRefreshParent,
  onOpenRevisionModal,
  onOpenDiscussionModal,
  onOpenHandoverModal,
  onOpenFulfilmentModal,
  onOpenPaymentModal,
  onOpenRejectModal,
  onOpenReopenModal
}: B2bRfqDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'commercial' | 'timeline' | 'discussions' | 'fulfilment' | 'payments' | 'followups'>('commercial');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick internal note state
  const [quickNote, setQuickNote] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<ActivityVisibility>('internal_note');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Timeline visibility filter
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'internal_note' | 'ops_update' | 'buyer_visible'>('all');

  const fetchDetail = async (id: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/rfqs/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setErrorMsg(json.error || 'Failed to load RFQ details.');
      }
    } catch {
      setErrorMsg('Network error while retrieving operational data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && rfqId) {
      fetchDetail(rfqId);
    }
  }, [isOpen, rfqId]);

  if (!isOpen || !rfqId) return null;

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setSubmittingNote(true);

    try {
      const res = await fetch('/api/admin/rfqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rfqId,
          internal_notes: quickNote.trim(),
          actor_name: 'Commercial Desk Staff',
          actor_role: 'sales',
          visibility: noteVisibility
        })
      });
      const json = await res.json();
      if (json.success) {
        setQuickNote('');
        fetchDetail(rfqId);
        onRefreshParent();
      }
    } catch (err) {
      console.error('Failed to post note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCompleteFollowup = async (followupId: string) => {
    try {
      const res = await fetch(`/api/admin/rfqs/${rfqId}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          followup_id: followupId,
          assigned_by: 'Commercial Desk',
          completion_notes: 'Completed task and updated RFQ notes.'
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchDetail(rfqId);
        onRefreshParent();
      }
    } catch (err) {
      console.error('Failed to complete followup:', err);
    }
  };

  const handleReconcilePayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/rfqs/${rfqId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reconcile',
          payment_id: paymentId,
          reconciled_by: 'Accounts Manager'
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchDetail(rfqId);
        onRefreshParent();
      }
    } catch (err) {
      console.error('Failed to reconcile payment:', err);
    }
  };

  const rfq = data?.rfq;
  const comm = data?.commercialSummary;
  const opsState = data?.operationalState;
  const summary = data?.operationalSummary;

  const filteredActivities = (data?.activities || []).filter((a: any) => {
    if (timelineFilter === 'all') return true;
    return a.visibility === timelineFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-stone-200 shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                B2B Operational Dossier
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-xs text-stone-300">
                Created: {rfq?.created_at ? new Date(rfq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
              </span>
              {rfq?.valid_until && (
                <>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs text-amber-400 font-medium">
                    Valid till: {new Date(rfq.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {rfq?.quote_number || 'Loading...'}
              </h2>
              {rfq && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {rfq.status.replace(/_/g, ' ')}
                </span>
              )}
              {rfq?.revision_number && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Rev {rfq.revision_number}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rfq && (
              <>
                <button
                  onClick={() => onOpenRevisionModal(rfq)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Revise Quote</span>
                </button>
                <button
                  onClick={() => onOpenDiscussionModal(rfq)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Log Discussion</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-stone-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Retrieving B2B Operations Dossier...</span>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-red-600 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <p className="font-bold text-sm">{errorMsg}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Operational Handover Summary Box (Section 11) */}
            {summary && (
              <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Operational Handover Summary (Live State)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <span className="font-bold text-stone-400 text-[10px] uppercase block">Current Situation</span>
                    <p className="font-semibold text-stone-900 mt-0.5 leading-snug">{summary.currentSituation}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <span className="font-bold text-stone-400 text-[10px] uppercase block">Latest Discussion</span>
                    <p className="text-stone-700 mt-0.5 leading-snug line-clamp-3">{summary.latestDiscussion}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <span className="font-bold text-stone-400 text-[10px] uppercase block">Outstanding Issues / Blockers</span>
                    <p className={`mt-0.5 leading-snug font-medium ${summary.outstandingIssues !== 'None recorded' ? 'text-amber-800' : 'text-stone-500'}`}>
                      {summary.outstandingIssues}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Next Action</span>
                      <span className="font-bold text-emerald-900">{summary.nextAction}</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Owner & Due Date</span>
                      <span className="font-semibold text-stone-800">
                        {summary.responsiblePerson} • <span className="font-mono text-emerald-800">{summary.dueDate}</span>
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Risk / Blocker Status</span>
                      <span className={`font-bold ${summary.riskOrDelay.includes('Overdue') ? 'text-red-600' : 'text-emerald-700'}`}>
                        {summary.riskOrDelay}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Multi-Dimensional State Chips */}
                {opsState && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-stone-200 text-[10px] font-bold uppercase">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-800">
                      RFQ: {opsState.rfqStatus}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg ${
                      opsState.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-900' : opsState.paymentStatus === 'partially_paid' ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-700'
                    }`}>
                      Payment: {opsState.paymentStatus}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg ${
                      opsState.procurementStatus === 'sourced' ? 'bg-emerald-100 text-emerald-900' : opsState.procurementStatus === 'in_progress' ? 'bg-blue-100 text-blue-900' : 'bg-stone-200 text-stone-700'
                    }`}>
                      Procurement: {opsState.procurementStatus}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg ${
                      opsState.qualityStatus === 'passed' ? 'bg-emerald-100 text-emerald-900' : opsState.qualityStatus === 'failed' ? 'bg-red-100 text-red-900' : 'bg-stone-200 text-stone-700'
                    }`}>
                      Quality: {opsState.qualityStatus}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg ${
                      opsState.dispatchStatus === 'dispatched' ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-700'
                    }`}>
                      Dispatch: {opsState.dispatchStatus}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg ${
                      opsState.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-900' : opsState.deliveryStatus === 'delivery_exception' ? 'bg-red-100 text-red-900' : 'bg-stone-200 text-stone-700'
                    }`}>
                      Delivery: {opsState.deliveryStatus}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tabs Bar */}
            <div className="flex border-b border-stone-200 px-6 pt-2 bg-white gap-3 sm:gap-6 text-xs font-bold overflow-x-auto shrink-0">
              {[
                { id: 'commercial', label: 'Commercial & Revisions', count: data?.revisions?.length || null },
                { id: 'timeline', label: 'Activity Timeline', count: data?.activities?.length || 0 },
                { id: 'discussions', label: 'Discussions & Negotiation', count: data?.discussions?.length || 0 },
                { id: 'fulfilment', label: 'Ops Handover & Fulfilment', count: null },
                { id: 'payments', label: 'Payments & Settlement', count: data?.payments?.length || 0 },
                { id: 'followups', label: 'Follow-ups & Tasks', count: data?.followups?.filter((f: any) => f.status === 'pending').length || null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 pb-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="p-5 sm:p-8 space-y-6">
              {/* TAB 1: COMMERCIAL SUMMARY */}
              {activeTab === 'commercial' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Buyer & Commodity Card */}
                    <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span>Buyer Specifications</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Company Name:</span>
                          <span className="font-bold text-stone-900">{rfq.company_name || 'Individual Buyer'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Contact Person:</span>
                          <span className="font-semibold text-stone-800">{rfq.contact_person}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Phone / WhatsApp:</span>
                          <span className="font-mono text-stone-800">{rfq.contact_phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Email:</span>
                          <span className="text-stone-800">{rfq.contact_email || 'Not provided'}</span>
                        </div>
                        {rfq.gstin && (
                          <div className="flex justify-between py-1 border-b border-stone-200">
                            <span className="text-stone-500">GSTIN:</span>
                            <span className="font-mono text-emerald-800 font-bold">{rfq.gstin}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Destination:</span>
                          <span className="text-stone-800">{rfq.destination_city} ({rfq.destination_pincode})</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-stone-500">Assigned Sales Owner:</span>
                          <span className="font-bold text-stone-900">{rfq.sales_owner_name || 'Commercial Desk'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Valuation Card */}
                    <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-700" />
                        <span>Commercial Valuation & Quotation</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Commodity SKU:</span>
                          <span className="font-bold text-stone-900">{rfq.product_title}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Requested Volume:</span>
                          <span className="font-mono font-bold text-stone-900">{rfq.requested_quantity} {rfq.unit}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Quoted Unit Price:</span>
                          <span className="font-mono text-stone-900">₹{Number(rfq.proposed_unit_price_inr || 0).toFixed(2)} / {rfq.unit}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Vehicle Freight Charges:</span>
                          <span className="font-mono text-stone-900">₹{Number(rfq.freight_charges_inr || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-stone-300 font-bold text-stone-900 text-sm">
                          <span>Quoted Total (Rev {rfq.revision_number || 1}):</span>
                          <span className="font-mono text-emerald-900">₹{Number(rfq.total_quote_inr || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-200">
                          <span className="text-stone-500">Total Paid to Date:</span>
                          <span className="font-mono font-bold text-emerald-700">₹{comm?.totalPaidInr?.toLocaleString('en-IN') || '0.00'}</span>
                        </div>
                        <div className="flex justify-between py-1 font-bold">
                          <span className="text-stone-600">Balance Due:</span>
                          <span className="font-mono text-amber-900">₹{comm?.balanceDueInr?.toLocaleString('en-IN') || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revisions History Table */}
                  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                      <h4 className="font-extrabold text-stone-900 text-sm">Quotation Version History & Revisions</h4>
                      <button
                        onClick={() => onOpenRevisionModal(rfq)}
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>New Revision</span>
                      </button>
                    </div>
                    {(!data?.revisions || data.revisions.length === 0) ? (
                      <div className="p-6 text-center text-stone-400">
                        Current quotation is Revision 1 (Original). No subsequent revisions have been created.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b text-stone-500 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Rev #</th>
                            <th className="p-3">Unit Price</th>
                            <th className="p-3">Freight</th>
                            <th className="p-3">Quoted Total</th>
                            <th className="p-3">Change Reason</th>
                            <th className="p-3">Created By & Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {data.revisions.map((rev: any) => (
                            <tr key={rev.id} className="hover:bg-stone-50">
                              <td className="p-3 font-mono font-bold text-blue-900">Rev {rev.revision_number}</td>
                              <td className="p-3 font-mono">₹{Number(rev.proposed_unit_price_inr).toFixed(2)}</td>
                              <td className="p-3 font-mono">₹{Number(rev.freight_charges_inr).toFixed(2)}</td>
                              <td className="p-3 font-mono font-bold text-stone-900">₹{Number(rev.total_quote_inr).toLocaleString('en-IN')}</td>
                              <td className="p-3 text-stone-700 max-w-xs">{rev.change_reason}</td>
                              <td className="p-3 text-stone-500">
                                <div>{rev.created_by}</div>
                                <div className="text-[10px] text-stone-400">{new Date(rev.created_at).toLocaleDateString('en-IN')}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-6 text-xs">
                  {/* Quick Add Note Form */}
                  <form onSubmit={handleAddInternalNote} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">Add Activity Event or Internal Note</span>
                      <select
                        value={noteVisibility}
                        onChange={(e) => setNoteVisibility(e.target.value as any)}
                        className="px-2.5 py-1 text-[11px] font-semibold border rounded-lg bg-white"
                      >
                        <option value="internal_note">🔒 Internal Note (Desk Only)</option>
                        <option value="ops_update">🚜 Operations Update (Yard & Logistics)</option>
                        <option value="buyer_visible">🌐 Buyer Visible</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        placeholder="Log internal update, supplier check, or commercial remark..."
                        className="flex-1 px-3 py-2 border rounded-xl"
                      />
                      <button
                        type="submit"
                        disabled={submittingNote || !quickNote.trim()}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log Event</span>
                      </button>
                    </div>
                  </form>

                  {/* Filter Pills */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                      Chronological History ({filteredActivities.length} Events)
                    </span>
                    <div className="flex gap-1.5 text-[11px]">
                      {[
                        { id: 'all', label: 'All Events' },
                        { id: 'internal_note', label: '🔒 Internal' },
                        { id: 'ops_update', label: '🚜 Operations' },
                        { id: 'buyer_visible', label: '🌐 Buyer Visible' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setTimelineFilter(f.id as any)}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                            timelineFilter === f.id
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Stream */}
                  <div className="relative border-l-2 border-stone-200 ml-4 pl-6 space-y-6">
                    {filteredActivities.length === 0 ? (
                      <div className="text-stone-400 py-4">No events match the selected visibility filter.</div>
                    ) : (
                      filteredActivities.map((act: any) => (
                        <div key={act.id} className="relative group">
                          {/* Bullet marker */}
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                            act.activity_type.includes('rejected') ? 'bg-red-500' :
                            act.activity_type.includes('accepted') ? 'bg-emerald-600' :
                            act.activity_type.includes('quotation') ? 'bg-blue-600' :
                            act.activity_type.includes('discussion') ? 'bg-purple-600' :
                            'bg-stone-600'
                          }`} />

                          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-extrabold text-stone-900">{act.activity_title}</span>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                  act.visibility === 'buyer_visible' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                  act.visibility === 'ops_update' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                                  'bg-stone-100 text-stone-700'
                                }`}>
                                  {act.visibility.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {new Date(act.created_at).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>

                            {act.description && (
                              <p className="text-stone-700 text-xs">{act.description}</p>
                            )}

                            {act.reason && (
                              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mt-1">
                                <strong>Reason:</strong> {act.reason}
                              </div>
                            )}

                            {act.comments && act.comments !== act.reason && (
                              <div className="text-[11px] text-stone-500 italic mt-1">
                                Notes: &ldquo;{act.comments}&rdquo;
                              </div>
                            )}

                            <div className="pt-1 text-[10px] text-stone-400">
                              By <strong>{act.acting_user}</strong> ({act.actor_role})
                              {act.previous_status && act.new_status && (
                                <span> • State: <span className="font-mono text-stone-600">{act.previous_status} ➔ {act.new_status}</span></span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DISCUSSIONS */}
              {activeTab === 'discussions' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-stone-900 text-sm">Recorded Buyer Discussions & Negotiations</h4>
                    <button
                      onClick={() => onOpenDiscussionModal(rfq)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Discussion</span>
                    </button>
                  </div>

                  {(!data?.discussions || data.discussions.length === 0) ? (
                    <div className="p-8 text-center text-stone-400 border border-dashed rounded-2xl">
                      No discussions recorded for this enquiry yet. Click &quot;Record Discussion&quot; to log phone calls, WhatsApp conversations, or in-person meetings.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.discussions.map((d: any) => (
                        <div key={d.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                                {d.communication_channel}
                              </span>
                              <span className="font-bold text-stone-900">Spoke with: {d.buyer_contact_person}</span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {new Date(d.discussion_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <p className="text-stone-800 leading-relaxed font-medium">&ldquo;{d.discussion_summary}&rdquo;</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                            {d.buyer_concerns && (
                              <div className="text-amber-800">
                                <strong>Buyer Concerns:</strong> {d.buyer_concerns}
                              </div>
                            )}
                            {d.price_changes_requested && (
                              <div className="text-blue-800">
                                <strong>Price/Qty Request:</strong> {d.price_changes_requested}
                              </div>
                            )}
                            {d.commercial_commitments && (
                              <div className="text-emerald-800">
                                <strong>Commitment Made:</strong> {d.commercial_commitments}
                              </div>
                            )}
                            {d.next_action && (
                              <div className="text-stone-700">
                                <strong>Next Action:</strong> {d.next_action}
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-200/60 flex justify-between items-center">
                            <span>Logged by: <strong>{d.employee_name}</strong></span>
                            {d.followup_due_date && (
                              <span className="text-amber-800 font-semibold">
                                Follow-up: {new Date(d.followup_due_date).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HANDOVER & FULFILMENT */}
              {activeTab === 'fulfilment' && (
                <div className="space-y-6 text-xs">
                  {/* Handover Card */}
                  <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-700" />
                        <h4 className="font-extrabold text-purple-950 text-sm">Sales-to-Operations Handover</h4>
                      </div>
                      {data?.handover ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          data.handover.handover_status === 'acknowledged'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {data.handover.handover_status.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenHandoverModal(rfq)}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition"
                        >
                          Initiate Handover
                        </button>
                      )}
                    </div>

                    {data?.handover ? (
                      <div className="space-y-2 text-[11px] text-purple-900">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div><strong>Assigned Ops Owner:</strong> {data.handover.operations_owner}</div>
                          <div><strong>Initiated By:</strong> {data.handover.initiated_by}</div>
                          <div><strong>Packaging:</strong> {data.handover.packaging_requirements}</div>
                          <div><strong>Quality Specs:</strong> {data.handover.quality_requirements}</div>
                        </div>
                        {data.handover.handover_status === 'pending_acknowledgement' && (
                          <div className="pt-2">
                            <button
                              onClick={() => onOpenHandoverModal(rfq)}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Acknowledge & Accept Handover</span>
                            </button>
                          </div>
                        )}
                        {data.handover.acknowledged_by && (
                          <div className="text-[10px] text-purple-700 pt-1 border-t border-purple-200">
                            Acknowledged by {data.handover.acknowledged_by} on {new Date(data.handover.acknowledged_at).toLocaleDateString('en-IN')}: &ldquo;{data.handover.acknowledgement_comments}&rdquo;
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-purple-800 text-[11px]">
                        No formal handover has been initiated yet. When the buyer accepts this quote, initiate handover to assign a yard operations owner.
                      </p>
                    )}
                  </div>

                  {/* Procurement, QC, Dispatch Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Procurement */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-stone-900">1. Procurement</span>
                        <button
                          onClick={() => onOpenFulfilmentModal(rfq, 'procurement')}
                          className="text-blue-700 hover:underline font-bold text-[10px]"
                        >
                          Update
                        </button>
                      </div>
                      <div className="space-y-1 text-stone-600">
                        <div>Status: <strong className="text-stone-900 uppercase">{data?.fulfilment?.procurement_status || 'not_started'}</strong></div>
                        <div>Source Yard: {data?.fulfilment?.procurement_source || 'Standard Mandi Yard'}</div>
                        {data?.fulfilment?.procurement_expected_readiness && (
                          <div>Target: {data.fulfilment.procurement_expected_readiness}</div>
                        )}
                      </div>
                    </div>

                    {/* Quality */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-stone-900">2. Quality Check</span>
                        <button
                          onClick={() => onOpenFulfilmentModal(rfq, 'quality')}
                          className="text-blue-700 hover:underline font-bold text-[10px]"
                        >
                          Update
                        </button>
                      </div>
                      <div className="space-y-1 text-stone-600">
                        <div>Result: <strong className={`uppercase ${data?.fulfilment?.quality_status === 'passed' ? 'text-emerald-700' : 'text-stone-900'}`}>{data?.fulfilment?.quality_status || 'pending'}</strong></div>
                        <div>Inspector: {data?.fulfilment?.quality_inspector || 'Assigned QC'}</div>
                        <div>Obs: {data?.fulfilment?.quality_observations || 'Moisture test required'}</div>
                      </div>
                    </div>

                    {/* Dispatch & Delivery */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-stone-900">3. Dispatch & Delivery</span>
                        <button
                          onClick={() => onOpenFulfilmentModal(rfq, 'dispatch')}
                          className="text-blue-700 hover:underline font-bold text-[10px]"
                        >
                          Update
                        </button>
                      </div>
                      <div className="space-y-1 text-stone-600">
                        <div>Vehicle: <strong className="font-mono text-stone-900">{data?.fulfilment?.vehicle_number || 'Pending vehicle'}</strong></div>
                        <div>Transporter: {data?.fulfilment?.transporter_name || 'VRL Logistics'}</div>
                        <div>LR No: {data?.fulfilment?.lr_number || 'Consignment note pending'}</div>
                        <div>Delivery: <strong className="uppercase">{data?.fulfilment?.delivery_status || 'pending'}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">B2B Payment Reconciliation & Ledger</h4>
                      <p className="text-[11px] text-stone-500">
                        Total Confirmed: ₹{Number(rfq.total_quote_inr || 0).toLocaleString('en-IN')} • Paid: ₹{comm?.totalPaidInr?.toLocaleString('en-IN') || '0.00'} • Balance Due: ₹{comm?.balanceDueInr?.toLocaleString('en-IN') || '0.00'}
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenPaymentModal(rfq)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </div>

                  {(!data?.payments || data.payments.length === 0) ? (
                    <div className="p-8 text-center text-stone-400 border border-dashed rounded-2xl">
                      No payment transactions recorded yet. Click &quot;Record Payment&quot; to log bank NEFT, RTGS, or UPI receipts.
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b text-stone-500 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Payment Date</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Transaction UTR / Ref</th>
                            <th className="p-3">Reconciliation Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {data.payments.map((p: any) => (
                            <tr key={p.id} className="hover:bg-stone-50">
                              <td className="p-3 text-stone-700 font-mono">{p.payment_date}</td>
                              <td className="p-3 font-mono font-bold text-emerald-900">₹{Number(p.amount_paid_inr).toLocaleString('en-IN')}</td>
                              <td className="p-3 uppercase text-stone-600 font-semibold">{p.payment_method.replace(/_/g, ' ')}</td>
                              <td className="p-3 font-mono text-stone-900 font-bold">{p.transaction_reference}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  p.reconciliation_status === 'reconciled'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {p.reconciliation_status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {p.reconciliation_status !== 'reconciled' && (
                                  <button
                                    onClick={() => handleReconcilePayment(p.id)}
                                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-bold transition"
                                  >
                                    Reconcile
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: FOLLOWUPS */}
              {activeTab === 'followups' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-extrabold text-stone-900 text-sm">Scheduled Follow-Ups & Tasks</h4>
                  {(!data?.followups || data.followups.length === 0) ? (
                    <div className="p-8 text-center text-stone-400 border border-dashed rounded-2xl">
                      No follow-ups currently scheduled. When recording a discussion, choose a follow-up date to automatically schedule tasks.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.followups.map((fol: any) => (
                        <div key={fol.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900">{fol.notes || fol.followup_type}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                fol.status === 'completed' ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {fol.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              Assigned to: <strong>{fol.responsible_employee}</strong> • Due: <span className="font-mono text-stone-800">{new Date(fol.due_date).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          {fol.status === 'pending' && (
                            <button
                              onClick={() => handleCompleteFollowup(fol.id)}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition whitespace-nowrap"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
