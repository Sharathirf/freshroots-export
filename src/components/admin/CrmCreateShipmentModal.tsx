'use client';

import React, { useState } from 'react';
import { X, Truck, Calendar, MapPin, CheckCircle, Package } from 'lucide-react';
import { Order } from '@/types';
import { SHIPMENT_PARTNERS } from '@/lib/crm-constants';

interface CrmCreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onShipmentCreated: (shipment: any) => void;
}

export default function CrmCreateShipmentModal({
  isOpen,
  onClose,
  order,
  onShipmentCreated,
}: CrmCreateShipmentModalProps) {
  const [deliveryPartner, setDeliveryPartner] = useState('Shiprocket');
  const [shipmentType, setShipmentType] = useState<'courier' | 'truckload' | 'part_truckload' | 'air_cargo'>('courier');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [origin, setOrigin] = useState('Tiptur Mandi Hub, Karnataka');
  const [destination, setDestination] = useState(order?.shipping_address || '');
  const [packageCount, setPackageCount] = useState(1);
  const [dispatchedQtyKg, setDispatchedQtyKg] = useState<number | ''>('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [createdByName, setCreatedByName] = useState('Logistics Officer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!trackingNumber.trim()) {
      setErrorMsg('Tracking Number / AWB / Consignment Reference is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        order_id: order.id,
        delivery_partner: deliveryPartner,
        shipment_type: shipmentType,
        tracking_number: trackingNumber.trim(),
        tracking_url: trackingUrl.trim() || undefined,
        origin: origin.trim(),
        destination: destination.trim() || order.shipping_address,
        package_count: packageCount,
        dispatched_quantity_kg: dispatchedQtyKg !== '' ? Number(dispatchedQtyKg) : undefined,
        vehicle_number: vehicleNumber.trim() || undefined,
        driver_name: driverName.trim() || undefined,
        driver_phone: driverPhone.trim() || undefined,
        lr_number: lrNumber.trim() || undefined,
        estimated_delivery_date: estimatedDeliveryDate || undefined,
        created_by_name: createdByName.trim() || 'Logistics Officer',
      };

      const res = await fetch('/api/admin/crm/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onShipmentCreated(data.shipment);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to record shipment.');
      }
    } catch {
      setErrorMsg('Network error while creating shipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Record Dispatch & Shipment</h2>
              <p className="text-xs text-stone-400">Order: {order.order_number} ({order.customer_name})</p>
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
              <label className="font-bold text-stone-700 block mb-1">Delivery Partner / Carrier *</label>
              <select
                value={deliveryPartner}
                onChange={(e) => setDeliveryPartner(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
              >
                {SHIPMENT_PARTNERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Shipment Type</label>
              <select
                value={shipmentType}
                onChange={(e) => setShipmentType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
              >
                <option value="courier">Courier Parcel (Retail)</option>
                <option value="truckload">Dedicated Full Truckload (FTL)</option>
                <option value="part_truckload">Part Truckload (PTL)</option>
                <option value="air_cargo">Air Cargo Export</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Tracking Number / AWB *</label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. SR9827361524"
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-stone-700 block mb-1">Live Tracking URL (Optional)</label>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://track.carrier.com/..."
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          {/* Truckload / Bulk specific fields */}
          {(shipmentType === 'truckload' || shipmentType === 'part_truckload') && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                Bulk Road Freight Details (Transporter & Vehicle)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-600 block mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. KA-06-B-1234"
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 block mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-stone-600 block mb-1">LR / Consignment Note</label>
                  <input
                    type="text"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    placeholder="e.g. LR-998811"
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-stone-700 block mb-1">Package / Bag Count</label>
              <input
                type="number"
                min={1}
                value={packageCount}
                onChange={(e) => setPackageCount(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
              />
            </div>
            <div>
              <label className="text-stone-700 block mb-1">Total Weight (kg)</label>
              <input
                type="number"
                min={0}
                value={dispatchedQtyKg}
                onChange={(e) => setDispatchedQtyKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 300"
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
              />
            </div>
            <div>
              <label className="text-stone-700 block mb-1">Estimated Delivery Date</label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
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
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold hover:bg-emerald-800 transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Recording Dispatch...' : 'Record Dispatch & Notify Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
