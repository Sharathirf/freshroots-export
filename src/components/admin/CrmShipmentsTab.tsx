'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  ExternalLink,
  X,
} from 'lucide-react';
import { SHIPMENT_PARTNERS, SHIPMENT_STATUSES } from '@/lib/crm-constants';

interface CrmShipmentsTabProps {
  onOpenCreateShipment?: (order: any) => void;
}

export default function CrmShipmentsTab({ onOpenCreateShipment }: CrmShipmentsTabProps) {
  const [shipments, setShipments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');

  const [activeShipmentForEvent, setActiveShipmentForEvent] = useState<any | null>(null);
  const [eventStatus, setEventStatus] = useState('in_transit');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        search: search.trim(),
        status: statusFilter,
        partner: partnerFilter,
        limit: '100',
      });
      const res = await fetch(`/api/admin/crm/shipments?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setShipments(data.shipments || []);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, partnerFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipmentForEvent || !eventDesc.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/crm/shipments/${activeShipmentForEvent.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: eventStatus,
          description: eventDesc.trim(),
          location: eventLocation.trim() || undefined,
        }),
      });

      if (res.ok) {
        setActiveShipmentForEvent(null);
        setEventDesc('');
        setEventLocation('');
        fetchShipments();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm space-y-0">
      {/* Top Banner */}
      <div className="p-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-700" />
            Consignment Logistics & Multi-Shipment Tracking
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time courier integrations (Shiprocket, Delhivery) and dedicated bulk road freight tracking (VRL, TCI, Direct Farm Gate Fleet).
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold">
          {totalCount} Shipments Dispatched
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking number, order ID, vehicle number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
          >
            <option value="all">All Delivery States</option>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
          >
            <option value="all">All Transporters</option>
            {SHIPMENT_PARTNERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
            <tr>
              <th className="p-4">Shipment & Order</th>
              <th className="p-4">Delivery Partner</th>
              <th className="p-4">Tracking / LR</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Est. Delivery</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-400">
                  Loading shipments...
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-400">
                  No shipments found matching filters.
                </td>
              </tr>
            ) : (
              shipments.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/80 transition">
                  <td className="p-4">
                    <div className="font-mono font-bold text-stone-900">{s.shipment_number}</div>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                      Order: {s.order_number} ({s.customer_name})
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-stone-900">{s.delivery_partner}</div>
                    <div className="text-[10px] text-stone-400 capitalize">{s.shipment_type}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-mono font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{s.tracking_number}</span>
                      {s.tracking_url && (
                        <a
                          href={s.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-900"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {s.lr_number && <div className="text-[10px] font-mono text-stone-500">LR: {s.lr_number}</div>}
                    {s.vehicle_number && <div className="text-[10px] font-mono text-stone-500">Veh: {s.vehicle_number}</div>}
                  </td>

                  <td className="p-4 max-w-xs truncate text-stone-700">
                    {s.destination || 'Karnataka Regional'}
                  </td>

                  <td className="p-4 font-mono">
                    {s.estimated_delivery_date ? (
                      <span className="font-bold text-stone-900">
                        {new Date(s.estimated_delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    ) : (
                      <span className="text-stone-300">N/A</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'delayed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setActiveShipmentForEvent(s);
                        setEventStatus(s.status === 'delivered' ? 'delivered' : 'in_transit');
                      }}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold transition text-xs"
                    >
                      Update Milestone
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Milestone Modal */}
      {activeShipmentForEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-stone-900">
                Update Tracking Milestone: {activeShipmentForEvent.tracking_number}
              </h3>
              <button onClick={() => setActiveShipmentForEvent(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Status Milestone</label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                >
                  {SHIPMENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Current Facility / Location</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Yeshwanthpur Hub, Bengaluru"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Event Description *</label>
                <input
                  type="text"
                  required
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="e.g. Out for delivery with delivery agent"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveShipmentForEvent(null)}
                  className="px-3 py-1.5 border rounded-lg text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !eventDesc.trim()}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Post Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
