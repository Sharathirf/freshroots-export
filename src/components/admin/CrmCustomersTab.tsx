'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  User,
  Phone,
  Building,
  TrendingUp,
  Clock,
  PhoneCall,
  Plus,
  Eye,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Customer } from '@/types';
import { CUSTOMER_TYPES } from '@/lib/crm-constants';

interface CrmCustomersTabProps {
  onSelectCustomer: (customerId: string) => void;
  onOpenCreateOrder: (customer: Customer | null) => void;
  onOpenLogCall: (customer: Customer) => void;
  refreshTrigger?: number;
}

export default function CrmCustomersTab({
  onSelectCustomer,
  onOpenCreateOrder,
  onOpenLogCall,
  refreshTrigger = 0,
}: CrmCustomersTabProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('total_spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        search: search.trim(),
        type: typeFilter,
        segment: segmentFilter,
        sortBy,
        sortOrder,
        limit: '100',
      });
      const res = await fetch(`/api/admin/crm/customers?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [typeFilter, segmentFilter, sortBy, sortOrder, refreshTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm space-y-0">
      {/* Top Banner */}
      <div className="p-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-stone-900 text-lg">Centralized Customer CRM & Accounts</h3>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
              {totalCount} Profiles
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Unified retail consumers, mandi wholesale traders, and international export buyers with verified order histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCustomers()}
            disabled={loading}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Refresh CRM customer records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => onOpenCreateOrder(null)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Offline Order
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, company, or customer code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
          />
        </form>

        {/* Type & Segment Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
          >
            <option value="all">All Customer Types</option>
            {CUSTOMER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
          >
            <option value="all">All Dynamic Segments</option>
            <option value="High-Value">High-Value Accounts</option>
            <option value="Repeat">Repeat Customers</option>
            <option value="Due for Reorder">Due for Reorder</option>
            <option value="Overdue">Overdue for Reorder</option>
            <option value="First-Time">First-Time Buyers</option>
            <option value="Outstanding">Outstanding Balance</option>
            <option value="Complaint">Recent Complaints</option>
            <option value="Inactive">Inactive / Dormant</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
          >
            <option value="total_spend">Sort: Total Spend (High to Low)</option>
            <option value="order_count">Sort: Order Count</option>
            <option value="last_order">Sort: Last Purchase Date</option>
            <option value="outstanding">Sort: Outstanding Balance</option>
            <option value="name">Sort: Customer Name</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
            <tr>
              <th className="p-4">Customer & Account</th>
              <th className="p-4">Segment & Status</th>
              <th className="p-4 text-center">Orders</th>
              <th className="p-4">Confirmed Spend</th>
              <th className="p-4">Reorder Status</th>
              <th className="p-4">Next Action</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-400">
                  Loading customer database...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-400">
                  No customer profiles found matching filters.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/80 transition">
                  {/* Customer & Account */}
                  <td className="p-4">
                    <div className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                      {c.name}
                      <span className="font-mono text-[10px] font-normal text-stone-400">({c.customer_code})</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5 flex items-center gap-2">
                      <span>+91 {c.phone}</span>
                      {c.company_name && (
                        <span className="text-amber-900 font-semibold truncate max-w-xs">• {c.company_name}</span>
                      )}
                    </div>
                  </td>

                  {/* Segment & Status */}
                  <td className="p-4">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                      {c.segment}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1 max-w-xs">{c.segment_reason}</div>
                  </td>

                  {/* Orders */}
                  <td className="p-4 text-center">
                    <span className="font-mono font-bold text-stone-900 text-sm">{c.successful_orders}</span>
                    <div className="text-[10px] text-stone-400">of {c.total_orders} total</div>
                  </td>

                  {/* Confirmed Spend */}
                  <td className="p-4">
                    <div className="font-mono font-extrabold text-stone-900 text-sm">
                      ₹{Number(c.total_sales_value || 0).toLocaleString('en-IN')}
                    </div>
                    {c.outstanding_balance > 0 && (
                      <div className="text-[10px] font-mono text-rose-700 font-bold mt-0.5">
                        Due: ₹{Number(c.outstanding_balance).toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>

                  {/* Reorder Status */}
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.reorder_status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : c.reorder_status === 'due'
                          ? 'bg-amber-100 text-amber-800'
                          : c.reorder_status === 'inactive'
                          ? 'bg-stone-100 text-stone-500'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {c.reorder_status}
                    </span>
                    {c.days_since_last_order !== undefined && (
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {c.days_since_last_order}d ago
                      </div>
                    )}
                  </td>

                  {/* Next Action */}
                  <td className="p-4">
                    {c.latest_next_action ? (
                      <div>
                        <div className="font-medium text-stone-800 line-clamp-1">{c.latest_next_action}</div>
                        {c.latest_next_action_due && (
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                            Due: {new Date(c.latest_next_action_due).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-300 italic">None scheduled</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectCustomer(c.id)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold transition flex items-center gap-1"
                        title="View Complete Customer Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Dossier
                      </button>
                      <button
                        onClick={() => onOpenLogCall(c)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                        title="Log Support / Sales Call"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenCreateOrder(c)}
                        className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition"
                        title="Create Order for Customer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
