'use client';

import React, { useState } from 'react';
import { X, Truck, ShieldCheck, Package, CheckCircle2, AlertTriangle } from 'lucide-react';

interface B2bFulfilmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: {
    id: string;
    quote_number: string;
    product_title: string;
    requested_quantity: number;
    unit: string;
    destination_city: string;
    destination_pincode: string;
    contact_person: string;
  } | null;
  currentFulfilment?: any;
  initialTab?: 'procurement' | 'quality' | 'dispatch' | 'delivery';
  onSaveFulfilment: (data: any) => Promise<void>;
}

export default function B2bFulfilmentModal({
  isOpen,
  onClose,
  rfq,
  currentFulfilment,
  initialTab = 'procurement',
  onSaveFulfilment
}: B2bFulfilmentModalProps) {
  const [activeTab, setActiveTab] = useState<'procurement' | 'quality' | 'dispatch' | 'delivery'>(initialTab);

  // Procurement state
  const [procurementStatus, setProcurementStatus] = useState(currentFulfilment?.procurement_status || 'in_progress');
  const [procurementSource, setProcurementSource] = useState(currentFulfilment?.procurement_source || 'Tiptur Mandi Yard Gate 2');
  const [readinessDate, setReadinessDate] = useState(currentFulfilment?.procurement_expected_readiness || '');
  const [procurementNotes, setProcurementNotes] = useState(currentFulfilment?.procurement_notes || '');

  // Quality state
  const [qualityStatus, setQualityStatus] = useState(currentFulfilment?.quality_status || 'passed');
  const [qualityInspector, setQualityInspector] = useState(currentFulfilment?.quality_inspector || 'Venkatesh (QC Inspector)');
  const [inspectedQty, setInspectedQty] = useState(currentFulfilment?.quality_inspected_quantity || rfq?.requested_quantity || 1);
  const [qualityObservations, setQualityObservations] = useState(
    currentFulfilment?.quality_observations || 'Moisture verified at 5.20% (strictly ≤ 5.50% threshold). Grade A weight verified.'
  );

  // Dispatch state
  const [transporter, setTransporter] = useState(currentFulfilment?.transporter_name || 'VRL Logistics Surface Freight');
  const [vehicleNo, setVehicleNo] = useState(currentFulfilment?.vehicle_number || 'KA-04-E-8821');
  const [driverName, setDriverName] = useState(currentFulfilment?.driver_name || 'Manjunath Gowda');
  const [driverPhone, setDriverPhone] = useState(currentFulfilment?.driver_phone || '+91 98451 22345');
  const [lrNo, setLrNo] = useState(currentFulfilment?.lr_number || `LR-BLR-${Date.now().toString().slice(-5)}`);
  const [trackingRef, setTrackingRef] = useState(currentFulfilment?.tracking_reference || `VRL-B2B-${Date.now().toString().slice(-6)}`);
  const [dispatchedQty, setDispatchedQty] = useState(currentFulfilment?.dispatched_quantity || rfq?.requested_quantity || 1);
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Delivery state
  const [deliveryStatus, setDeliveryStatus] = useState(currentFulfilment?.delivery_status || 'delivered');
  const [deliveredQty, setDeliveredQty] = useState(currentFulfilment?.delivered_quantity || rfq?.requested_quantity || 1);
  const [recipient, setRecipient] = useState(currentFulfilment?.recipient_name || rfq?.contact_person || '');
  const [deliveryRemarks, setDeliveryRemarks] = useState(
    currentFulfilment?.delivery_remarks || 'Consignment received in intact seal, offloaded at buyer warehouse.'
  );
  const [exceptionNotes, setExceptionNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (activeTab === 'procurement') {
        await onSaveFulfilment({
          action_type: 'procurement',
          procurement_status: procurementStatus,
          procurement_source: procurementSource,
          procurement_expected_readiness: readinessDate || null,
          procurement_notes: procurementNotes || null
        });
      } else if (activeTab === 'quality') {
        await onSaveFulfilment({
          action_type: 'quality_inspection',
          quality_status: qualityStatus,
          quality_inspector: qualityInspector,
          quality_inspected_quantity: Number(inspectedQty),
          quality_observations: qualityObservations
        });
      } else if (activeTab === 'dispatch') {
        if (!vehicleNo.trim() || !transporter.trim()) {
          setErrorMsg('Vehicle number and transporter name are required.');
          setSubmitting(false);
          return;
        }
        await onSaveFulfilment({
          action_type: 'dispatch',
          transporter_name: transporter.trim(),
          vehicle_number: vehicleNo.trim(),
          driver_name: driverName.trim() || null,
          driver_phone: driverPhone.trim() || null,
          lr_number: lrNo.trim() || null,
          tracking_reference: trackingRef.trim() || null,
          dispatched_quantity: Number(dispatchedQty),
          dispatch_notes: dispatchNotes.trim() || null
        });
      } else if (activeTab === 'delivery') {
        await onSaveFulfilment({
          action_type: 'delivery',
          delivery_status: deliveryStatus,
          delivered_quantity: Number(deliveredQty),
          recipient_name: recipient.trim() || rfq.contact_person,
          delivery_remarks: deliveryRemarks.trim() || null,
          delivery_exception_notes: exceptionNotes.trim() || null
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update fulfilment record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Fulfilment & Logistics Operations</h3>
              <p className="text-xs text-stone-400 font-mono">{rfq.quote_number} • {rfq.product_title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          {[
            { id: 'procurement', label: '1. Sourcing & Procurement', icon: Package },
            { id: 'quality', label: '2. Quality Inspection', icon: ShieldCheck },
            { id: 'dispatch', label: '3. Vehicle Dispatch & LR', icon: Truck },
            { id: 'delivery', label: '4. Delivery & Confirmation', icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PROCUREMENT */}
          {activeTab === 'procurement' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Procurement Status</label>
                <select
                  value={procurementStatus}
                  onChange={(e) => setProcurementStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="in_progress">Procurement In Progress</option>
                  <option value="sourced">Consignment Sourced & Ready at Yard</option>
                  <option value="delayed">Procurement Delayed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Sourcing Origin / Yard</label>
                <input
                  type="text"
                  value={procurementSource}
                  onChange={(e) => setProcurementSource(e.target.value)}
                  placeholder="e.g. Tiptur APMC Yard Gate 2"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Target Readiness Date</label>
                <input
                  type="date"
                  value={readinessDate}
                  onChange={(e) => setReadinessDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Procurement Notes</label>
                <textarea
                  rows={2}
                  value={procurementNotes}
                  onChange={(e) => setProcurementNotes(e.target.value)}
                  placeholder="Batch specifics, lot grades, weighing yard remarks..."
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: QUALITY */}
          {activeTab === 'quality' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Quality Inspection Result</label>
                <select
                  value={qualityStatus}
                  onChange={(e) => setQualityStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="passed">Passed (Grade A Verified)</option>
                  <option value="conditional_pass">Conditional Pass (Requires Re-bagging)</option>
                  <option value="failed">Failed (Moisture / Spoilage Exceeded)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Inspector Name</label>
                  <input
                    type="text"
                    value={qualityInspector}
                    onChange={(e) => setQualityInspector(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quantity Inspected ({rfq.unit})</label>
                  <input
                    type="number"
                    value={inspectedQty}
                    onChange={(e) => setInspectedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Inspection Observations & Moisture Test</label>
                <textarea
                  rows={3}
                  value={qualityObservations}
                  onChange={(e) => setQualityObservations(e.target.value)}
                  placeholder="Record moisture percentage (≤5.5% copra), nut weight, cracking check..."
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH */}
          {activeTab === 'dispatch' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Transporter / 3PL Carrier *</label>
                  <input
                    type="text"
                    value={transporter}
                    onChange={(e) => setTransporter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="e.g. KA-04-E-8821"
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Dispatched Qty ({rfq.unit})</label>
                  <input
                    type="number"
                    value={dispatchedQty}
                    onChange={(e) => setDispatchedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">LR / Consignment Note</label>
                  <input
                    type="text"
                    value={lrNo}
                    onChange={(e) => setLrNo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tracking Reference</label>
                  <input
                    type="text"
                    value={trackingRef}
                    onChange={(e) => setTrackingRef(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Dispatch Remarks</label>
                <input
                  type="text"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="Gate pass number, seal verification..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY */}
          {activeTab === 'delivery' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Delivery Status</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="delivered">Delivered (Confirmed by Recipient)</option>
                  <option value="out_for_delivery">Out For Delivery (Last Mile)</option>
                  <option value="delivery_exception">Delivery Exception (Transporter Delay / Refusal)</option>
                  <option value="returned">Returned to Mandi Yard</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Delivered Qty ({rfq.unit})</label>
                  <input
                    type="number"
                    value={deliveredQty}
                    onChange={(e) => setDeliveredQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {deliveryStatus === 'delivery_exception' ? (
                <div>
                  <label className="block font-bold text-red-700 mb-1">Delivery Exception Notes *</label>
                  <textarea
                    rows={2}
                    value={exceptionNotes}
                    onChange={(e) => setExceptionNotes(e.target.value)}
                    placeholder="Roadblock, receiver unavailable, rain delay..."
                    className="w-full px-3 py-2 border border-red-300 rounded-xl resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Delivery Proof / Remarks</label>
                  <textarea
                    rows={2}
                    value={deliveryRemarks}
                    onChange={(e) => setDeliveryRemarks(e.target.value)}
                    placeholder="Proof of delivery, unloading dock verified..."
                    className="w-full px-3 py-2 border rounded-xl resize-none"
                  />
                </div>
              )}
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
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              {submitting ? 'Saving...' : `Save ${activeTab.toUpperCase()} Record`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
