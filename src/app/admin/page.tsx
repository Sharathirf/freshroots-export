'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Building2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Sprout,
  DollarSign,
  Tag,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { WholesaleQuotation, Order, InventoryBatch } from '@/types';

function ProductAdminRow({
  product,
  onSave
}: {
  product: any;
  onSave: (id: string, retailPrice: number, stock: number, wholesalePrice: number, isActive: boolean) => Promise<void>;
}) {
  const [retailPrice, setRetailPrice] = useState(product.retail_price_inr);
  const [stock, setStock] = useState(product.available_stock);
  const [wholesalePrice, setWholesalePrice] = useState(product.wholesale_benchmark_price_inr || '');
  const [isActive, setIsActive] = useState(product.is_active);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isDirty =
    Number(retailPrice) !== Number(product.retail_price_inr) ||
    Number(stock) !== Number(product.available_stock) ||
    Number(wholesalePrice || 0) !== Number(product.wholesale_benchmark_price_inr || 0) ||
    isActive !== product.is_active;

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSave(product.id, Number(retailPrice), Number(stock), Number(wholesalePrice || 0), isActive);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className={`border-b hover:bg-stone-50/80 transition ${!isActive ? 'opacity-60 bg-stone-50/50' : ''}`}>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
          />
          <div>
            <div className="font-bold text-stone-900 text-sm leading-tight">{product.title}</div>
            <div className="text-[11px] text-stone-500 font-mono mt-0.5">
              {product.sku} • {product.category.replace(/_/g, ' ')}
            </div>
            <span className="inline-block mt-1 bg-stone-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-stone-200">
              {product.grade}
            </span>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-[11px] text-stone-500 mb-1">{product.unit_of_measure}</div>
        <div className="relative w-32">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">₹</span>
          <input
            type="number"
            step="0.01"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-stone-300 font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white shadow-inner"
          />
        </div>
      </td>
      <td className="p-4">
        <div className="relative w-28">
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white shadow-inner"
          />
        </div>
        <div className="text-[10px] text-stone-400 mt-1">Available Units / Bags</div>
      </td>
      <td className="p-4">
        <div className="relative w-32">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-xs">₹</span>
          <input
            type="number"
            step="0.01"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-amber-300 font-mono font-bold text-sm text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-amber-50/50 shadow-inner"
          />
        </div>
        <div className="text-[10px] text-amber-700 mt-1 font-medium">Wholesale Benchmark (Private)</div>
      </td>
      <td className="p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
          />
          <span className={`text-[11px] font-bold ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}>
            {isActive ? 'Active (Live)' : 'Hidden'}
          </span>
        </label>
      </td>
      <td className="p-4 text-right space-x-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`font-semibold text-xs px-3.5 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-sm ${
            savedSuccess
              ? 'bg-emerald-600 text-white'
              : isDirty
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white animate-pulse'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : savedSuccess ? (
            <span>Saved ✓</span>
          ) : (
            <span>Save Price & Stock</span>
          )}
        </button>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="p-2 border border-stone-200 hover:bg-stone-100 text-stone-600 rounded-xl inline-block text-[11px]"
          title="Open live customer product page"
        >
          <ExternalLink className="w-3.5 h-3.5 inline" />
        </Link>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'rfqs' | 'orders' | 'inventory' | 'pnl'>('products');
  const [metrics, setMetrics] = useState<any>(null);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<WholesaleQuotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryBatch[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState<string | null>(null);

  // Intake Form State
  const [intakeMandi, setIntakeMandi] = useState('Tiptur APMC Yard');
  const [intakeQty, setIntakeQty] = useState('250');
  const [intakeCost, setIntakeCost] = useState('1100');
  const [intakeMsg, setIntakeMsg] = useState<string | null>(null);

  // Damaged Form State
  const [damagedBatchId, setDamagedBatchId] = useState('');
  const [damagedCount, setDamagedCount] = useState('5');
  const [damagedMsg, setDamagedMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [mRes, rRes, oRes, iRes, pRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/rfq'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/inventory'),
        fetch('/api/admin/products')
      ]);

      const [mData, rData, oData, iData, pData] = await Promise.all([
        mRes.json(),
        rRes.json(),
        oRes.json(),
        iRes.json(),
        pRes.json()
      ]);

      if (mData.success) setMetrics(mData.metrics);
      if (rData.success) setRfqs(rData.quotations);
      if (oData.success) setOrders(oData.orders);
      if (pData.success) setAdminProducts(pData.products);
      if (iData.success) {
        setInventory(iData.batches);
        if (iData.batches.length > 0 && !damagedBatchId) {
          setDamagedBatchId(iData.batches[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [damagedBatchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateRFQStatus = async (id: string, status: string, unitPrice?: number, freight?: number) => {
    try {
      const res = await fetch('/api/admin/rfqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          proposed_unit_price_inr: unitPrice,
          freight_charges_inr: freight
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Error updating RFQ status');
    }
  };

  const handleUpdateOrderStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          next_status: nextStatus,
          tracking_reference: `VRL-BLR-${Math.floor(100000 + Math.random() * 900000)}`
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Error updating order status');
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeMandi || !intakeQty || !intakeCost) return;

    const prodId = inventory.length > 0 ? inventory[0].product_id : '';

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'NEW_BATCH',
          product_id: prodId,
          origin_mandi: intakeMandi,
          quantity: intakeQty,
          cost_per_unit: intakeCost
        })
      });
      const data = await res.json();
      if (data.success) {
        setIntakeMsg('New batch logged into warehouse!');
        fetchData();
      } else {
        setIntakeMsg(data.error);
      }
    } catch {
      setIntakeMsg('Failed to log batch');
    }
  };

  const handleWriteOffDamaged = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!damagedBatchId || !damagedCount) return;

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'WRITE_OFF_DAMAGED',
          batch_id: damagedBatchId,
          damaged_count: damagedCount,
          reason: 'Cracked or spoiled during hub sorting inspection'
        })
      });
      const data = await res.json();
      if (data.success) {
        setDamagedMsg('Damaged stock written off successfully.');
        fetchData();
      } else {
        setDamagedMsg(data.error);
      }
    } catch {
      setDamagedMsg('Failed to record damaged stock');
    }
  };

  const handleSaveProductPricing = async (
    id: string,
    retailPrice: number,
    stock: number,
    wholesalePrice: number,
    isActive: boolean
  ) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          retail_price_inr: retailPrice,
          wholesale_benchmark_price_inr: wholesalePrice,
          available_stock: stock,
          is_active: isActive
        })
      });
      const data = await res.json();
      if (data.success) {
        setProductSuccessMsg('Commodity pricing and stock updated successfully!');
        fetchData();
        setTimeout(() => setProductSuccessMsg(null), 3000);
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch {
      alert('Error updating product pricing or stock');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans">
      {/* Admin Top Navigation */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight">Tiptur Direct Ops</span>
                <span className="text-[10px] text-emerald-400 font-mono ml-2 uppercase bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  Operations & Commercial Desk
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Connected to PostgreSQL" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI OVERVIEW CARDS */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center text-xs text-stone-500 font-semibold uppercase">
                <span>Retail Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 mt-2 font-mono">
                ₹{Number(metrics.retail.total_retail_sales).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {metrics.retail.total_orders} Orders • AOV: ₹{metrics.retail.average_order_value}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center text-xs text-stone-500 font-semibold uppercase">
                <span>Wholesale Pipeline</span>
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900 mt-2 font-mono">
                ₹{Number(metrics.wholesale.total_pipeline_value).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {metrics.wholesale.total_rfqs} RFQs • {metrics.wholesale.pending_review} Pending Review
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center text-xs text-stone-500 font-semibold uppercase">
                <span>Warehouse Stock</span>
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 mt-2 font-mono">
                {metrics.inventory.total_available_units} <span className="text-sm font-normal text-stone-500">Units</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                Valuation: ₹{Number(metrics.inventory.total_inventory_valuation).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center text-xs text-stone-500 font-semibold uppercase">
                <span>Hub Spoilage Rate</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black text-emerald-800 mt-2 font-mono">
                {metrics.inventory.spoilage_rate_percentage}%
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {metrics.inventory.total_damaged_units} damaged/cracked write-offs (&lt;2% target)
              </div>
            </div>
          </div>
        )}

        {/* Success toast notification */}
        {productSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{productSuccessMsg}</span>
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-stone-300 gap-2 sm:gap-4 overflow-x-auto">
          {[
            { id: 'products', label: 'Commodities, Pricing & Stock', count: adminProducts.length },
            { id: 'rfqs', label: 'Wholesale RFQs & Quotations', count: rfqs.length },
            { id: 'orders', label: 'Retail Orders & Fulfillment', count: orders.length },
            { id: 'inventory', label: 'Inventory Batches & Intake', count: inventory.length },
            { id: 'pnl', label: 'Commercial Unit Economics & P&L', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="bg-stone-200 text-stone-700 text-xs px-2 py-0.5 rounded-full font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 0: COMMODITIES, PRICING & STOCK MANAGER */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Direct Catalog & Inventory Manager</span>
                </div>
                <h3 className="font-extrabold text-stone-900 text-lg">Product Pricing & Stock Quantities</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Update live retail selling prices, available quantities, wholesale benchmark rates, and catalog visibility instantly without restarting the server.
                </p>
              </div>
              <button
                onClick={fetchData}
                className="self-start sm:self-auto text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-200 transition"
              >
                ↻ Refresh Live Rates
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-4">Commodity / SKU</th>
                    <th className="p-4">Retail Price (₹)</th>
                    <th className="p-4">Available Stock</th>
                    <th className="p-4">Wholesale Benchmark (₹)</th>
                    <th className="p-4">Catalog Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProducts.map((prod) => (
                    <ProductAdminRow
                      key={prod.id}
                      product={prod}
                      onSave={handleSaveProductPricing}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 1: WHOLESALE RFQs */}
        {activeTab === 'rfqs' && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">Wholesale Quotation Requests (B2B Pipeline)</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Review buyer consignment specs, adjust Mandi unit prices, calculate vehicle freight, and issue official quotations.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-4">RFQ Number</th>
                    <th className="p-4">Company & Buyer</th>
                    <th className="p-4">Consignment</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Quoted Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rfqs.map((q) => (
                    <tr key={q.id} className="hover:bg-stone-50/80 transition">
                      <td className="p-4 font-mono font-bold text-stone-900">{q.quote_number}</td>
                      <td className="p-4">
                        <div className="font-bold text-stone-900">{q.company_name}</div>
                        <div className="text-[11px] text-stone-500">
                          {q.contact_person}
                          {q.contact_phone ? ` • ${q.contact_phone}` : ''}
                          {q.contact_email ? ` • ${q.contact_email}` : ''}
                        </div>
                        {q.gstin && <div className="text-[10px] font-mono text-emerald-800">GSTIN: {q.gstin}</div>}
                        {q.notes && <div className="text-[10px] text-stone-500 italic max-w-xs truncate mt-0.5">{q.notes}</div>}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-stone-800">{q.product_title}</div>
                        <div className="text-[11px] text-stone-500">
                          {q.requested_quantity} {q.unit} @ ₹{q.proposed_unit_price_inr}/unit
                        </div>
                      </td>
                      <td className="p-4">
                        <div>{q.destination_city}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{q.destination_pincode}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-900 text-sm">
                        ₹{Number(q.total_quote_inr || 0).toLocaleString('en-IN')}
                        <div className="text-[10px] text-stone-400 font-normal">
                          (Freight: ₹{q.freight_charges_inr || 0})
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            q.status === 'submitted'
                              ? 'bg-amber-100 text-amber-800'
                              : q.status === 'quote_issued'
                              ? 'bg-blue-100 text-blue-800'
                              : q.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {q.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {q.status === 'submitted' && (
                          <button
                            onClick={() => handleUpdateRFQStatus(q.id, 'quote_issued')}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                          >
                            Issue Quote
                          </button>
                        )}
                        {q.status === 'quote_issued' && (
                          <button
                            onClick={() => handleUpdateRFQStatus(q.id, 'accepted')}
                            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                          >
                            Mark Accepted
                          </button>
                        )}
                        {q.contact_phone ? (
                          <a
                            href={`https://wa.me/${q.contact_phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(q.contact_person || 'Buyer')},%20regarding%20your%20quotation%20${q.quote_number}%20for%20${encodeURIComponent(q.company_name || q.product_title || 'agricultural commodities')}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-medium px-2.5 py-1.5 rounded-lg inline-block"
                          >
                            WhatsApp
                          </a>
                        ) : q.contact_email ? (
                          <a
                            href={`mailto:${q.contact_email}?subject=Quotation%20${q.quote_number}%20-%20Tiptur%20Direct&body=Hello%20${encodeURIComponent(q.contact_person || 'Buyer')},%0D%0A%0D%0ARegarding%20your%20inquiry%20for%20quote%20${q.quote_number}.`}
                            className="border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-medium px-2.5 py-1.5 rounded-lg inline-block"
                          >
                            Email
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: RETAIL ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-lg">Retail Consumer Orders (B2C)</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Execute valid order lifecycle transitions with automatic inventory allocation and delivery tracking reference logging.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer & Address</th>
                    <th className="p-4">Purchased Items</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status Lifecycle</th>
                    <th className="p-4 text-right">Transition Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => {
                    const items = Array.isArray(o.items) ? o.items : JSON.parse((o.items as any) || '[]');
                    return (
                      <tr key={o.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4">
                          <div className="font-mono font-bold text-stone-900">{o.order_number}</div>
                          <div className="text-[10px] text-stone-400">
                            {new Date(o.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-stone-900">{o.customer_name}</div>
                          <div className="text-[11px] text-stone-500">{o.customer_phone}</div>
                          <div className="text-[11px] text-stone-600 truncate max-w-xs">{o.shipping_address} ({o.destination_pincode})</div>
                        </td>
                        <td className="p-4">
                          {items.map((i: any, idx: number) => (
                            <div key={idx} className="text-[11px] text-stone-700">
                              {i.quantity} × {i.title}
                            </div>
                          ))}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-900 text-sm">
                          ₹{Number(o.total_amount_inr).toLocaleString('en-IN')}
                          <div className="text-[10px] font-normal text-stone-400 uppercase">{o.payment_method}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              o.status === 'paid'
                                ? 'bg-amber-100 text-amber-900'
                                : o.status === 'allocated'
                                ? 'bg-blue-100 text-blue-900'
                                : o.status === 'packed'
                                ? 'bg-purple-100 text-purple-900'
                                : o.status === 'dispatched'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {o.status === 'paid' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'allocated')}
                              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                            >
                              Allocate Stock
                            </button>
                          )}
                          {o.status === 'allocated' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'packed')}
                              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                            >
                              Mark Packed
                            </button>
                          )}
                          {o.status === 'packed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'dispatched')}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                            >
                              Dispatch 3PL
                            </button>
                          )}
                          {o.status === 'dispatched' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                              className="bg-stone-800 hover:bg-stone-900 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                            >
                              Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY BATCHES */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form 1: New Intake Batch */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-extrabold text-stone-900 text-base">Log New Harvest Intake Batch</h4>
                </div>
                <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Mandi Sourcing Origin</label>
                    <input
                      type="text"
                      value={intakeMandi}
                      onChange={(e) => setIntakeMandi(e.target.value)}
                      placeholder="e.g. Tiptur APMC Yard Gate 2"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Quantity (Units / Bags)</label>
                      <input
                        type="number"
                        value={intakeQty}
                        onChange={(e) => setIntakeQty(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Cost Per Unit (₹ INR)</label>
                      <input
                        type="number"
                        value={intakeCost}
                        onChange={(e) => setIntakeCost(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                    </div>
                  </div>
                  {intakeMsg && <div className="text-emerald-700 font-semibold">{intakeMsg}</div>}
                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Add Harvest Intake Batch
                  </button>
                </form>
              </div>

              {/* Form 2: Damaged / Spoilage Write-Off */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-extrabold text-stone-900 text-base">Write-Off Damaged / Cracked Nuts</h4>
                </div>
                <form onSubmit={handleWriteOffDamaged} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Select Batch</label>
                    <select
                      value={damagedBatchId}
                      onChange={(e) => setDamagedBatchId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      {inventory.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batch_number} ({b.product_title} - Avail: {b.available_quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Damaged Count to Write-Off</label>
                    <input
                      type="number"
                      value={damagedCount}
                      onChange={(e) => setDamagedCount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                  {damagedMsg && <div className="text-amber-700 font-semibold">{damagedMsg}</div>}
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Confirm Damage Write-Off
                  </button>
                </form>
              </div>
            </div>

            {/* Inventory Batches Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-stone-100">
                <h3 className="font-extrabold text-stone-900 text-lg">Active Inventory Lots & Batches</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
                    <tr>
                      <th className="p-4">Batch Number</th>
                      <th className="p-4">Agricultural SKU</th>
                      <th className="p-4">Origin Mandi</th>
                      <th className="p-4">Available</th>
                      <th className="p-4">Reserved</th>
                      <th className="p-4">Damaged</th>
                      <th className="p-4">Procurement Unit Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {inventory.map((b) => (
                      <tr key={b.id}>
                        <td className="p-4 font-mono font-bold text-stone-900">{b.batch_number}</td>
                        <td className="p-4 font-semibold text-stone-800">{b.product_title}</td>
                        <td className="p-4 text-stone-600">{b.origin_mandi}</td>
                        <td className="p-4 font-mono font-bold text-emerald-800">{b.available_quantity}</td>
                        <td className="p-4 font-mono text-amber-700">{b.reserved_quantity}</td>
                        <td className="p-4 font-mono text-red-600">{b.damaged_quantity}</td>
                        <td className="p-4 font-mono text-stone-800">₹{Number(b.cost_per_unit_inr).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMMERCIAL UNIT ECONOMICS & P&L */}
        {activeTab === 'pnl' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-stone-900">Commercial Contribution Economics (CM1 Model)</h3>
              <p className="text-xs text-stone-500 mt-1">
                Real-world Karnataka market pricing corridor breakdown separating procurement, packaging, labor, freight, and damage buffers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Retail Bag Model */}
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-stone-900 text-sm">B2C Retail: 50-Nut Grade A Mesh Bag</h4>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Contribution: 11.4%
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b font-bold text-stone-900">
                    <span>Gross Retail Revenue:</span>
                    <span className="font-mono">₹1,650.00</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Farm-gate Procurement:</span>
                    <span className="font-mono text-red-600">-₹1,100.00 (66.7%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Sorting, Grading & Packing Labor:</span>
                    <span className="font-mono text-red-600">-₹50.00 (3.0%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Breathable HDPE Mesh Bag:</span>
                    <span className="font-mono text-red-600">-₹35.00 (2.1%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Hub Freight & Last-Mile 3PL:</span>
                    <span className="font-mono text-red-600">-₹195.00 (11.8%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Payment Gateway & Transit Buffer:</span>
                    <span className="font-mono text-red-600">-₹82.50 (5.0%)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-black text-emerald-900 text-sm">
                    <span>Net Contribution (CM1):</span>
                    <span className="font-mono">₹187.50 / bag (₹3.75/nut)</span>
                  </div>
                </div>
              </div>

              {/* Wholesale Metric Ton Model */}
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-stone-900 text-sm">B2B Wholesale: 1 Metric Ton (~2,000 Nuts)</h4>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Contribution: 8.3%
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b font-bold text-stone-900">
                    <span>Gross Consignment Revenue:</span>
                    <span className="font-mono">₹44,000.00</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Bulk Farm-gate Procurement:</span>
                    <span className="font-mono text-red-600">-₹32,000.00 (72.7%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>40 Gunny Bags + Bagging Labor:</span>
                    <span className="font-mono text-red-600">-₹1,600.00 (3.6%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Dedicated Canter 14ft Freight:</span>
                    <span className="font-mono text-red-600">-₹4,200.00 (9.5%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Loading & Hamali Charges:</span>
                    <span className="font-mono text-red-600">-₹1,000.00 (2.3%)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Shrinkage & Financing Buffer:</span>
                    <span className="font-mono text-red-600">-₹1,540.00 (3.5%)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-black text-emerald-900 text-sm">
                    <span>Net Contribution (CM1):</span>
                    <span className="font-mono">₹3,660.00 / MT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
