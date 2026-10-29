'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Clock,
  AlertCircle,
  TrendingUp,
  User,
  Phone,
  PhoneCall,
  Plus,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { Customer } from '@/types';

interface CrmRepeatOrdersTabProps {
  onOpenCreateOrder: (customer: Customer) => void;
  onOpenLogCall: (customer: Customer) => void;
  onSelectCustomer: (customerId: string) => void;
}

export default function CrmRepeatOrdersTab({
  onOpenCreateOrder,
  onOpenLogCall,
  onSelectCustomer,
}: CrmRepeatOrdersTabProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'due' | 'overdue' | 'inactive' | 'callbacks'>('due');

  const fetchRepeatAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/repeat-orders');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching repeat order analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepeatAnalytics();
  }, []);

  const summary = data?.summary || {
    due_count: 0,
    overdue_count: 0,
    high_value_inactive_count: 0,
    repeat_buyers_count: 0,
  };

  const currentList =
    activeSubTab === 'due'
      ? data?.due_for_reorder || []
      : activeSubTab === 'overdue'
      ? data?.overdue_for_reorder || []
      : activeSubTab === 'inactive'
      ? data?.high_value_inactive || []
      : data?.scheduled_callbacks || [];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm space-y-0">
      {/* Top Banner */}
      <div className="p-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-emerald-700" />
            Repeat Sales & Customer Retention Engine
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Identify customers due for restocking, scheduled callbacks, and high-value dormant accounts based on real purchase intervals.
          </p>
        </div>
      </div>

      {/* 4 Retention Metric Cards */}
      <div className="p-6 bg-stone-50 border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveSubTab('due')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeSubTab === 'due'
              ? 'bg-amber-100/70 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-stone-200 hover:bg-stone-100/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Due for Reorder</div>
          <div className="text-2xl font-black text-amber-950 font-mono mt-1">{summary.due_count}</div>
          <div className="text-[10px] text-amber-800 mt-0.5">Ready for restock call</div>
        </button>

        <button
          onClick={() => setActiveSubTab('overdue')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeSubTab === 'overdue'
              ? 'bg-rose-100/70 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white border-stone-200 hover:bg-stone-100/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-900">Overdue for Reorder</div>
          <div className="text-2xl font-black text-rose-950 font-mono mt-1">{summary.overdue_count}</div>
          <div className="text-[10px] text-rose-800 mt-0.5">Exceeded target restock days</div>
        </button>

        <button
          onClick={() => setActiveSubTab('inactive')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeSubTab === 'inactive'
              ? 'bg-stone-200 border-stone-400 ring-2 ring-stone-400'
              : 'bg-white border-stone-200 hover:bg-stone-100/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Dormant High-Value</div>
          <div className="text-2xl font-black text-stone-900 font-mono mt-1">{summary.high_value_inactive_count}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">&gt;60 days without order</div>
        </button>

        <button
          onClick={() => setActiveSubTab('callbacks')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeSubTab === 'callbacks'
              ? 'bg-emerald-100/70 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white border-stone-200 hover:bg-stone-100/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Scheduled Callbacks</div>
          <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
            {data?.scheduled_callbacks?.length || 0}
          </div>
          <div className="text-[10px] text-emerald-800 mt-0.5">Pending sales outreach</div>
        </button>
      </div>

      {/* Retention Opportunities Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Type & Spend</th>
              <th className="p-4">Purchase History</th>
              <th className="p-4">Days Since Delivery</th>
              <th className="p-4">Reorder Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-400">
                  Calculating reorder intervals and retention metrics...
                </td>
              </tr>
            ) : currentList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-400">
                  No customers found in this retention category.
                </td>
              </tr>
            ) : (
              currentList.map((item: any) => {
                const isCallback = activeSubTab === 'callbacks';
                const cust = isCallback
                  ? { id: item.customer_id, name: item.customer_name, phone: item.customer_phone, customer_code: item.customer_code }
                  : item;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition">
                    <td className="p-4">
                      <div className="font-extrabold text-stone-900 text-sm">{cust.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        +91 {cust.phone} • {cust.customer_code}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                        {cust.customer_type || 'retail'}
                      </span>
                      {cust.total_sales_value !== undefined && (
                        <div className="font-mono font-bold text-stone-900 mt-1">
                          ₹{Number(cust.total_sales_value).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {isCallback ? (
                        <div>
                          <div className="font-semibold text-stone-800">{item.summary}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">Rep: {item.rep_name}</div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-stone-900">{cust.successful_orders} completed orders</span>
                          <div className="text-[10px] text-stone-400 mt-0.5">{cust.segment_reason}</div>
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-stone-800">
                      {isCallback ? (
                        item.next_action_due ? (
                          <span className="text-amber-800">
                            Due: {new Date(item.next_action_due).toLocaleDateString('en-IN')}
                          </span>
                        ) : (
                          'ASAP'
                        )
                      ) : (
                        <span>{cust.days_since_last_order ?? 'N/A'} days ago</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cust.reorder_status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : cust.reorder_status === 'due'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {isCallback ? 'Callback Requested' : cust.reorder_status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCustomer(cust.id)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold transition text-xs"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => onOpenLogCall(cust)}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold transition text-xs flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Call
                        </button>
                        <button
                          onClick={() => onOpenCreateOrder(cust)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Repeat Order
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
