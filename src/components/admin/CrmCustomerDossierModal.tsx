'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  PhoneCall,
  Star,
  Truck,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Customer, CustomerPurchaseSummary, Order, CustomerCall, CustomerFeedback, CustomerComplaint, Shipment } from '@/types';

interface CrmCustomerDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  summary: CustomerPurchaseSummary | null;
  orders: Order[];
  quotes: any[];
  calls: CustomerCall[];
  feedback: CustomerFeedback[];
  complaints: CustomerComplaint[];
  shipments: Shipment[];
  onOpenCreateOrder: (customer: Customer) => void;
  onOpenLogCall: (customer: Customer) => void;
  onOpenLogComplaint: (customer: Customer) => void;
  onRefreshDossier: () => void;
}

export default function CrmCustomerDossierModal({
  isOpen,
  onClose,
  customer,
  summary,
  orders,
  quotes,
  calls,
  feedback,
  complaints,
  shipments,
  onOpenCreateOrder,
  onOpenLogCall,
  onOpenLogComplaint,
  onRefreshDossier,
}: CrmCustomerDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'calls' | 'feedback' | 'complaints' | 'shipments'>('overview');
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !customer) return null;

  const handleResolveComplaint = async (complaintId: string) => {
    if (!resolutionText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/crm/customers/${customer.id}/complaints`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint_id: complaintId,
          status: 'resolved',
          resolution_notes: resolutionText.trim(),
        }),
      });
      if (res.ok) {
        setResolvingComplaintId(null);
        setResolutionText('');
        onRefreshDossier();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xl shrink-0">
              {customer.name ? customer.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-black tracking-tight">{customer.name}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  {customer.customer_code}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  customer.customer_type === 'wholesale'
                    ? 'bg-amber-400 text-stone-950 font-black'
                    : customer.customer_type === 'export'
                    ? 'bg-blue-400 text-stone-950 font-black'
                    : 'bg-emerald-400 text-stone-950 font-black'
                }`}>
                  {customer.customer_type}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-300 mt-2 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  +91 {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    {customer.email}
                  </span>
                )}
                {customer.company_name && (
                  <span className="flex items-center gap-1 font-semibold text-stone-200">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    {customer.company_name}
                  </span>
                )}
                <span className="flex items-center gap-1 text-stone-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Since {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCreateOrder(customer)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Order
            </button>
            <button
              onClick={() => onOpenLogCall(customer)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-stone-700"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Log Call
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Segmentation & Next Action Banner */}
        {summary && (
          <div className="bg-stone-100 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-300 shadow-2xs">
                Segment: {summary.segment}
              </span>
              <span className="text-stone-600 italic">{summary.segment_reason}</span>
            </div>

            {summary.reorder_status !== 'ok' && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  summary.reorder_status === 'overdue'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : summary.reorder_status === 'due'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  Reorder: {summary.reorder_status}
                </span>
                <span className="text-stone-500">
                  Last purchase: {summary.days_since_last_order ?? 'N/A'} days ago
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 bg-stone-50/80 flex gap-6 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview & Metrics' },
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'calls', label: `Support Calls (${calls.length})` },
            { id: 'feedback', label: `Feedback (${feedback.length})` },
            { id: 'complaints', label: `Complaints (${complaints.length})` },
            { id: 'shipments', label: `Shipments (${shipments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 border-b-2 transition uppercase tracking-wider text-[11px] ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-900 font-black'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && summary && (
            <div className="space-y-6">
              {/* Financial & Order Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Delivered Sales Value</div>
                  <div className="text-xl font-extrabold text-stone-900 font-mono mt-1">
                    ₹{summary.total_sales_value.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Across {summary.successful_orders} orders</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Collected Revenue</div>
                  <div className="text-xl font-extrabold text-emerald-800 font-mono mt-1">
                    ₹{summary.collected_revenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Reconciled in bank/UPI</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Outstanding Balance</div>
                  <div className={`text-xl font-extrabold font-mono mt-1 ${
                    summary.outstanding_balance > 0 ? 'text-amber-800' : 'text-stone-900'
                  }`}>
                    ₹{summary.outstanding_balance.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Pending collection</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Average Order Value</div>
                  <div className="text-xl font-extrabold text-stone-900 font-mono mt-1">
                    ₹{summary.average_order_value.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Repeat freq: {summary.repeat_purchase_frequency_days ? `${summary.repeat_purchase_frequency_days}d` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Addresses & Communication Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-stone-200 bg-white">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Delivery & Billing Addresses
                  </h4>
                  <div className="space-y-3 text-xs text-stone-700">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-stone-400">Shipping Address</div>
                      <div className="mt-0.5 font-medium">{customer.shipping_address || 'None recorded'}</div>
                      {customer.pincode && <div className="text-stone-500 font-mono">PIN: {customer.pincode}</div>}
                    </div>
                    {customer.billing_address && (
                      <div className="pt-2 border-t border-stone-100">
                        <div className="text-[10px] font-bold uppercase text-stone-400">Billing Address</div>
                        <div className="mt-0.5">{customer.billing_address}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-stone-200 bg-white">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Most Frequently Ordered Products
                  </h4>
                  {summary.frequent_products.length > 0 ? (
                    <div className="space-y-2">
                      {summary.frequent_products.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="font-bold text-stone-800">{p.title}</span>
                          <span className="font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                            {p.total_qty} units ({p.count} orders)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic">No purchase pattern recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                  All Consignments & Orders
                </h4>
                <button
                  onClick={() => onOpenCreateOrder(customer)}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Order
                </button>
              </div>

              {orders.length > 0 ? (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white text-xs">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-stone-50 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">{o.order_number}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                            {(o as any).order_source || 'website'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1">
                          {new Date(o.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {(o as any).created_by_admin_name && ` • Placed by ${(o as any).created_by_admin_name}`}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-extrabold text-stone-900 text-sm">
                          ₹{Number(o.total_amount_inr).toLocaleString('en-IN')}
                        </div>
                        {o.tracking_reference && (
                          <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
                            AWB: {o.tracking_reference}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  No orders placed yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                  Support Calls & Telephone Interaction History
                </h4>
                <button
                  onClick={() => onOpenLogCall(customer)}
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Log New Call
                </button>
              </div>

              {calls.length > 0 ? (
                <div className="space-y-3">
                  {calls.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl border border-stone-200 bg-white text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 capitalize">{c.call_type.replace('_', ' ')}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                            {c.call_outcome.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(c.call_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">{c.summary}</p>
                      <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1">
                        <span>Handled by: <strong>{c.rep_name}</strong></span>
                        {c.next_action && (
                          <span className="text-emerald-800 font-semibold">
                            Next: {c.next_action} {c.next_action_due && `(Due: ${new Date(c.next_action_due).toLocaleDateString('en-IN')})`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  No support calls recorded yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                Customer Ratings & Feedback
              </h4>

              {feedback.length > 0 ? (
                <div className="space-y-3">
                  {feedback.map((f) => (
                    <div key={f.id} className="p-4 rounded-2xl border border-stone-200 bg-white text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: f.overall_rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(f.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      {f.feedback_text && (
                        <p className="text-stone-700 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          &ldquo;{f.feedback_text}&rdquo;
                        </p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-stone-600">
                        {f.product_quality_rating && <div>Quality: <strong>{f.product_quality_rating}/5</strong></div>}
                        {f.packaging_rating && <div>Packaging: <strong>{f.packaging_rating}/5</strong></div>}
                        {f.delivery_rating && <div>Delivery: <strong>{f.delivery_rating}/5</strong></div>}
                        {f.pricing_satisfaction_rating && <div>Pricing: <strong>{f.pricing_satisfaction_rating}/5</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  No customer feedback recorded.
                </div>
              )}
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                  Customer Issues & Escalations
                </h4>
                <button
                  onClick={() => onOpenLogComplaint(customer)}
                  className="px-3 py-1.5 bg-rose-700 text-white rounded-xl text-xs font-bold hover:bg-rose-800 transition flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Log Issue / Complaint
                </button>
              </div>

              {complaints.length > 0 ? (
                <div className="space-y-3">
                  {complaints.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl border border-stone-200 bg-white text-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">{c.complaint_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 font-extrabold'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status} • {c.severity}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>

                      <p className="text-stone-800 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        {c.description}
                      </p>

                      {c.resolution_notes ? (
                        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-emerald-900">
                          <strong>Resolution:</strong> {c.resolution_notes}
                        </div>
                      ) : (
                        <div>
                          {resolvingComplaintId === c.id ? (
                            <div className="space-y-2 mt-2">
                              <textarea
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                placeholder="Enter resolution notes, replacement consignment details or credit note..."
                                rows={2}
                                className="w-full p-2.5 border rounded-xl text-xs bg-stone-50"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setResolvingComplaintId(null)}
                                  className="px-3 py-1 bg-stone-200 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleResolveComplaint(c.id)}
                                  disabled={isSubmitting || !resolutionText.trim()}
                                  className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                                >
                                  Mark Resolved
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setResolvingComplaintId(c.id);
                                setResolutionText('');
                              }}
                              className="text-xs text-emerald-800 font-bold hover:underline"
                            >
                              + Resolve Complaint
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  No complaints filed for this customer.
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                Linked Logistics Shipments & Transporters
              </h4>

              {shipments.length > 0 ? (
                <div className="space-y-3">
                  {shipments.map((s) => (
                    <div key={s.id} className="p-4 rounded-2xl border border-stone-200 bg-white text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">{s.shipment_number}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                            {s.delivery_partner}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {s.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(s.dispatch_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="text-stone-700 font-mono">
                        Tracking Number: <strong>{s.tracking_number}</strong>
                        {s.lr_number && <span className="ml-2">LR: {s.lr_number}</span>}
                        {s.vehicle_number && <span className="ml-2">Vehicle: {s.vehicle_number}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  No shipments linked to this customer yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
