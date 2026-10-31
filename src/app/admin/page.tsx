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
  CheckCircle2,
  Star,
  Trash2,
  Lock,
  LogOut,
  Search,
  Plus,
  QrCode,
  Smartphone,
  Key,
  ShieldCheck
} from 'lucide-react';
import AdminTotpSetupModal from '@/components/admin/AdminTotpSetupModal';
import { WholesaleQuotation, Order, InventoryBatch } from '@/types';
import B2bRfqDetailModal from '@/components/admin/B2bRfqDetailModal';
import B2bRejectionModal from '@/components/admin/B2bRejectionModal';
import B2bReopenModal from '@/components/admin/B2bReopenModal';
import B2bDiscussionModal from '@/components/admin/B2bDiscussionModal';
import B2bRevisionModal from '@/components/admin/B2bRevisionModal';
import B2bHandoverModal from '@/components/admin/B2bHandoverModal';
import B2bFulfilmentModal from '@/components/admin/B2bFulfilmentModal';
import B2bPaymentModal from '@/components/admin/B2bPaymentModal';
import B2bDeskActionsDropdown from '@/components/admin/B2bDeskActionsDropdown';
import CrmCustomersTab from '@/components/admin/CrmCustomersTab';
import CrmRepeatOrdersTab from '@/components/admin/CrmRepeatOrdersTab';
import CrmShipmentsTab from '@/components/admin/CrmShipmentsTab';
import CrmCustomerDossierModal from '@/components/admin/CrmCustomerDossierModal';
import CrmCreateOrderModal from '@/components/admin/CrmCreateOrderModal';
import CrmCreateShipmentModal from '@/components/admin/CrmCreateShipmentModal';
import CrmSupportCallModal from '@/components/admin/CrmSupportCallModal';
import CrmComplaintModal from '@/components/admin/CrmComplaintModal';
import { Customer } from '@/types';

function ProductAdminRow({
  product,
  onSave
}: {
  product: any;
  onSave: (id: string, retailPrice: number, stock: number, wholesalePrice: number, isActive: boolean, bulkMinQty: number) => Promise<void>;
}) {
  const [retailPrice, setRetailPrice] = useState(product.retail_price_inr);
  const [stock, setStock] = useState(product.available_stock);
  const [wholesalePrice, setWholesalePrice] = useState(product.wholesale_benchmark_price_inr || '');
  const [minQty, setMinQty] = useState(product.bulk_min_quantity || 1);
  const [isActive, setIsActive] = useState(product.is_active);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isDirty =
    Number(retailPrice) !== Number(product.retail_price_inr) ||
    Number(stock) !== Number(product.available_stock) ||
    Number(wholesalePrice || 0) !== Number(product.wholesale_benchmark_price_inr || 0) ||
    Number(minQty) !== Number(product.bulk_min_quantity || 1) ||
    isActive !== product.is_active;

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSave(product.id, Number(retailPrice), Number(stock), Number(wholesalePrice || 0), isActive, Number(minQty));
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
        <div className="relative w-24">
          <input
            type="number"
            min="1"
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white shadow-inner"
          />
        </div>
        <div className="text-[10px] text-stone-400 mt-1">Min Units (1 = Any Qty)</div>
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
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean | null>(null);
  const [loginMethod, setLoginMethod] = useState<'totp' | 'password'>('totp');
  const [pinInput, setPinInput] = useState('');
  const [totpInput, setTotpInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Google Authenticator Setup Modal state
  const [isTotpSetupOpen, setIsTotpSetupOpen] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState<any>(null);
  const [loadingTotpSetup, setLoadingTotpSetup] = useState(false);
  const [totpSetupError, setTotpSetupError] = useState('');

  useEffect(() => {
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setIsAdminAuthed(Boolean(data.authenticated)))
      .catch(() => setIsAdminAuthed(false));
  }, []);

  const openTotpSetup = async (passwordForSetup?: string) => {
    setLoadingTotpSetup(true);
    setTotpSetupError('');
    try {
      const res = await fetch('/api/admin/auth/setup-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordForSetup || pinInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load Authenticator setup');
      }
      setTotpSetupData(data);
      setIsTotpSetupOpen(true);
    } catch (err: any) {
      setTotpSetupError(err.message || 'Unable to open 2FA setup');
    } finally {
      setLoadingTotpSetup(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setPinError(false);
    try {
      const payload = loginMethod === 'totp'
        ? { totp: totpInput }
        : { password: pinInput };

      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Sign-in failed');
      setIsAdminAuthed(true);
      setPinInput('');
      setTotpInput('');
    } catch {
      setPinError(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } finally {
      setIsAdminAuthed(false);
      setPinInput('');
      setTotpInput('');
    }
  };

  const [activeTab, setActiveTab] = useState<
    'products' | 'rfqs' | 'orders' | 'crm' | 'repeat' | 'shipments' | 'inventory' | 'reviews' | 'pnl' | 'integrations'
  >('products');

  // CRM Modals and Actions State
  const [selectedCustomerIdForDossier, setSelectedCustomerIdForDossier] = useState<string | null>(null);
  const [customerDossierData, setCustomerDossierData] = useState<any>(null);
  const [isCustomerDossierOpen, setIsCustomerDossierOpen] = useState(false);

  const [createOrderCustomer, setCreateOrderCustomer] = useState<Customer | null>(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const [createShipmentOrder, setCreateShipmentOrder] = useState<Order | null>(null);
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);

  const [callCustomer, setCallCustomer] = useState<Customer | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const [complaintCustomer, setComplaintCustomer] = useState<Customer | null>(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  const [orderChannelFilter, setOrderChannelFilter] = useState<'all' | 'retail' | 'wholesale' | 'phone' | 'whatsapp' | 'admin'>('all');

  const openCustomerDossier = async (customerId: string) => {
    setSelectedCustomerIdForDossier(customerId);
    setIsCustomerDossierOpen(true);
    try {
      const res = await fetch(`/api/admin/crm/customers/${customerId}`);
      const json = await res.json();
      if (json.success) {
        setCustomerDossierData(json);
      }
    } catch (e) {
      console.error('Error opening customer dossier:', e);
    }
  };
  const [metrics, setMetrics] = useState<any>(null);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<WholesaleQuotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryBatch[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [isDeletingReview, setIsDeletingReview] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState<string | null>(null);
  const [integrationStatuses, setIntegrationStatuses] = useState<any[]>([]);
  const [integrationsCheckedAt, setIntegrationsCheckedAt] = useState<string | null>(null);

  // B2B RFQ Modals & Operations State
  const [selectedRfqForDetail, setSelectedRfqForDetail] = useState<string | null>(null);
  const [selectedRfqForReject, setSelectedRfqForReject] = useState<any | null>(null);
  const [selectedRfqForReopen, setSelectedRfqForReopen] = useState<any | null>(null);
  const [selectedRfqForDiscussion, setSelectedRfqForDiscussion] = useState<any | null>(null);
  const [selectedRfqForRevision, setSelectedRfqForRevision] = useState<any | null>(null);
  const [selectedRfqForHandover, setSelectedRfqForHandover] = useState<any | null>(null);
  const [selectedRfqForFulfilment, setSelectedRfqForFulfilment] = useState<{ rfq: any; tab?: string } | null>(null);
  const [selectedRfqForPayment, setSelectedRfqForPayment] = useState<any | null>(null);

  // RFQ Filtering & Search
  const [rfqSearch, setRfqSearch] = useState('');
  const [rfqStageFilter, setRfqStageFilter] = useState<'all' | 'intake' | 'quotation' | 'fulfilment' | 'closed'>('all');

  // Intake Form State
  const [intakeMandi, setIntakeMandi] = useState('Tiptur Yard');
  const [intakeQty, setIntakeQty] = useState('250');
  const [intakeCost, setIntakeCost] = useState('1100');
  const [intakeMsg, setIntakeMsg] = useState<string | null>(null);

  // Damaged Form State
  const [damagedBatchId, setDamagedBatchId] = useState('');
  const [damagedCount, setDamagedCount] = useState('5');
  const [damagedMsg, setDamagedMsg] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setAllReviews(data.reviews);
      }
    } catch (e) {
      console.warn('Failed to fetch admin reviews:', e);
    }
  };

  const handleDeleteReviewAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    setIsDeletingReview(id);
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchReviews();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete review error:', err);
    } finally {
      setIsDeletingReview(null);
    }
  };

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [mRes, rRes, oRes, iRes, pRes, revRes, integrationsRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/rfqs'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/inventory'),
        fetch('/api/admin/products'),
        fetch('/api/reviews'),
        fetch('/api/admin/integrations', { cache: 'no-store' })
      ]);

      if ([mRes, rRes, oRes, iRes, pRes, integrationsRes].some((response) => response.status === 401)) {
        setIsAdminAuthed(false);
        return;
      }

      const [mData, rData, oData, iData, pData, revData, integrationData] = await Promise.all([
        mRes.json(),
        rRes.json(),
        oRes.json(),
        iRes.json(),
        pRes.json(),
        revRes.json(),
        integrationsRes.json()
      ]);

      if (mData.success) setMetrics(mData.metrics);
      if (rData.success) setRfqs(rData.quotations);
      if (oData.success) setOrders(oData.orders);
      if (pData.success) setAdminProducts(pData.products);
      if (revData.success && Array.isArray(revData.reviews)) setAllReviews(revData.reviews);
      if (Array.isArray(integrationData.integrations)) setIntegrationStatuses(integrationData.integrations);
      if (integrationData.checkedAt) setIntegrationsCheckedAt(integrationData.checkedAt);
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
    if (isAdminAuthed) fetchData();
  }, [fetchData, isAdminAuthed]);

  const handleTransitionStatus = async (id: string, targetStatus: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/rfqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: targetStatus,
          reopen_reason: reason
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setProductSuccessMsg(`RFQ status transitioned to ${targetStatus.replace(/_/g, ' ')}`);
        setTimeout(() => setProductSuccessMsg(null), 3000);
      } else {
        alert(data.error || 'Failed to update RFQ status');
      }
    } catch {
      alert('Network error updating RFQ status');
    }
  };

  const handleConfirmReject = async (data: { id: string; rejection_category: string; rejection_reason: string; rejection_notes?: string }) => {
    const res = await fetch('/api/admin/rfqs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.id,
        status: 'rejected',
        rejection_category: data.rejection_category,
        rejection_reason: data.rejection_reason,
        rejection_notes: data.rejection_notes
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reject RFQ');
    fetchData();
    setProductSuccessMsg(`Quotation rejected: ${data.rejection_category}`);
    setTimeout(() => setProductSuccessMsg(null), 3000);
  };

  const handleConfirmReopen = async (data: { id: string; reopen_reason: string }) => {
    const res = await fetch('/api/admin/rfqs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.id,
        status: 'under_review',
        reopen_reason: data.reopen_reason
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reopen RFQ');
    fetchData();
    setProductSuccessMsg('RFQ successfully reopened into Under Review');
    setTimeout(() => setProductSuccessMsg(null), 3000);
  };

  const handleSaveDiscussion = async (data: any) => {
    const res = await fetch(`/api/admin/rfqs/${data.rfq_id}/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save discussion');
    fetchData();
    setProductSuccessMsg('Discussion recorded in activity timeline');
    setTimeout(() => setProductSuccessMsg(null), 3000);
  };

  const handleSaveRevision = async (data: any) => {
    if (!selectedRfqForRevision) return;
    const res = await fetch(`/api/admin/rfqs/${selectedRfqForRevision.id}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to issue revision');
    fetchData();
    setProductSuccessMsg(`Quotation Revision ${json.revision_number} issued`);
    setTimeout(() => setProductSuccessMsg(null), 3000);
  };

  const handleConfirmHandover = async (data: any) => {
    if (!selectedRfqForHandover) return;
    const res = await fetch(`/api/admin/rfqs/${selectedRfqForHandover.id}/handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to process handover');
    fetchData();
    setProductSuccessMsg('Sales-to-Operations handover updated');
    setTimeout(() => setProductSuccessMsg(null), 3000);
  };

  const handleSaveFulfilment = async (data: any) => {
    if (!selectedRfqForFulfilment) return;
    const res = await fetch(`/api/admin/rfqs/${selectedRfqForFulfilment.rfq.id}/fulfilment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update fulfilment');
    fetchData();
    setProductSuccessMsg('Fulfilment operations record saved');
    setTimeout(() => setProductSuccessMsg(null), 3000);
  };

  const handleRecordPayment = async (data: any) => {
    if (!selectedRfqForPayment) return;
    const res = await fetch(`/api/admin/rfqs/${selectedRfqForPayment.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to record payment');
    fetchData();
    setProductSuccessMsg(`Payment of ₹${Number(data.amount_paid_inr).toLocaleString('en-IN')} recorded`);
    setTimeout(() => setProductSuccessMsg(null), 3000);
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
    isActive: boolean,
    bulkMinQty: number
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
          is_active: isActive,
          bulk_min_quantity: bulkMinQty
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

  if (!isAdminAuthed) {
    if (isAdminAuthed === null) {
      return (
        <div className="min-h-screen bg-stone-900 flex items-center justify-center text-sm font-semibold text-stone-300">
          Checking administrator session…
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-lime-400" />
          </div>

          <div>
            <h1 className="text-xl font-black text-white">Operations Desk</h1>
            <p className="text-xs text-stone-400 mt-1">FreshRoots Export Administration</p>
          </div>

          {/* Login Method Toggle */}
          <div className="grid grid-cols-2 gap-1.5 bg-stone-900 p-1 rounded-2xl border border-stone-700/80">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('totp');
                setPinError(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
                loginMethod === 'totp'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Authenticator</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setPinError(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
                loginMethod === 'password'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Master Password</span>
            </button>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
            {loginMethod === 'totp' ? (
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={totpInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setTotpInput(val);
                    setPinError(false);
                  }}
                  autoComplete="one-time-code"
                  placeholder="000 000"
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-lime-300 text-center font-mono text-2xl tracking-[0.3em] font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-stone-400 mt-1.5 text-center">
                  Open Google Authenticator on your phone and enter the code.
                </p>
                {pinError && (
                  <p className="text-xs text-red-400 mt-1.5 text-center font-medium">
                    Invalid 6-digit code. Check your phone time and try again.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Administrator Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  autoComplete="current-password"
                  placeholder="Enter your administrator password"
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white text-center text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {pinError && (
                  <p className="text-xs text-red-400 mt-1.5 text-center font-medium">
                    Invalid administrator password. Access denied.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn || (loginMethod === 'totp' ? totpInput.length !== 6 : !pinInput)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSigningIn ? 'Verifying…' : 'Sign in securely'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-700/60">
            <Link href="/" className="inline-block text-xs text-stone-500 hover:text-stone-300 transition">
              &larr; Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans">
      {/* Admin Top Navigation */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition shrink-0"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Sprout className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs sm:text-base tracking-tight truncate">
                  <span>FreshRoots Ops</span>
                </div>
                <span className="hidden md:inline-block text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  Operations &amp; Commercial Desk
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => openTotpSetup()}
              disabled={loadingTotpSetup}
              className="flex items-center gap-1.5 text-xs bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition"
              title="Google Authenticator (2FA) QR Code & Key"
            >
              <QrCode className="w-4 h-4 text-lime-400 shrink-0" />
              <span className="hidden sm:inline">{loadingTotpSetup ? 'Loading...' : 'Authenticator (2FA)'}</span>
            </button>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition"
              title="Sync Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} shrink-0`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 text-xs bg-red-950/70 hover:bg-red-900 border border-red-800/70 text-red-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition"
              title="Lock Admin Session"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Connected to PostgreSQL" />
          </div>
        </div>
      </header>

      {/* TOTP Setup Modal when logged in */}
      <AdminTotpSetupModal
        isOpen={isTotpSetupOpen}
        onClose={() => setIsTotpSetupOpen(false)}
        setupData={totpSetupData}
      />

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
            { id: 'orders', label: 'Retail Orders & Multi-Channel', count: orders.length },
            { id: 'crm', label: 'Customer CRM & Accounts', count: null },
            { id: 'repeat', label: 'Repeat Sales & Retention', count: null },
            { id: 'shipments', label: 'Shipments & Logistics', count: null },
            { id: 'inventory', label: 'Inventory Batches & Intake', count: inventory.length },
            { id: 'reviews', label: 'Buyer Ratings & Reviews', count: allReviews.length },
            { id: 'pnl', label: 'Commercial Unit Economics & P&L', count: null },
            { id: 'integrations', label: 'Service Integrations', count: integrationStatuses.filter((item) => item.configured).length }
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

        {activeTab === 'integrations' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Third-party service readiness</h2>
              <p className="text-sm text-stone-600 mt-1">
                Settings are checked without exposing secrets. A configured status means keys exist; complete a provider-side delivery check before launch.
                {integrationsCheckedAt && ` Checked ${new Date(integrationsCheckedAt).toLocaleString()}.`}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {integrationStatuses.map((integration) => (
                <article key={integration.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-stone-900">{integration.name}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${integration.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                      {integration.configured ? 'Configured' : 'Needs setup'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-2">{integration.connectionCheck}</p>
                  <p className="text-[11px] text-stone-500 mt-3">
                    Required: {integration.required.join(', ')}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

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
                    <th className="p-4">Min Order Qty</th>
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
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm space-y-4">
            <div className="p-5 border-b border-stone-100 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">Wholesale Quotation Requests (B2B Pipeline)</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  End-to-end commercial workflow: RFQ Intake ➔ Quotation & Negotiation ➔ Operations Handover ➔ Fulfilment & Settlement.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl border border-stone-200 transition"
                >
                  ↻ Sync Pipeline
                </button>
              </div>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="px-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {[
                  { id: 'all', label: `All Enquiries (${rfqs.length})` },
                  { id: 'intake', label: 'Stage A: Intake & Review' },
                  { id: 'quotation', label: 'Stage B: Quotation Active' },
                  { id: 'fulfilment', label: 'Stage C: In Fulfilment' },
                  { id: 'closed', label: 'Closed & Declined' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setRfqStageFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      rfqStageFilter === st.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rfqSearch}
                  onChange={(e) => setRfqSearch(e.target.value)}
                  placeholder="Search RFQ, company, phone..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-4">RFQ Number & Date</th>
                    <th className="p-4">Company & Buyer</th>
                    <th className="p-4">Consignment</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Quoted Total</th>
                    <th className="p-4">Workflow State</th>
                    <th className="p-4 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rfqs
                    .filter((q: any) => {
                      if (rfqStageFilter === 'intake') {
                        if (!['submitted', 'new_rfq', 'under_review', 'needs_information', 'ready_to_quote', 'on_hold'].includes(q.status)) return false;
                      } else if (rfqStageFilter === 'quotation') {
                        if (!['quotation_draft', 'pending_approval', 'quote_issued', 'discussion_in_progress', 'revision_requested', 'revised_quotation_issued'].includes(q.status)) return false;
                      } else if (rfqStageFilter === 'fulfilment') {
                        if (q.status !== 'accepted') return false;
                      } else if (rfqStageFilter === 'closed') {
                        if (!['rejected', 'cancelled', 'expired'].includes(q.status)) return false;
                      }
                      if (rfqSearch.trim()) {
                        const needle = rfqSearch.toLowerCase();
                        const match =
                          (q.quote_number || '').toLowerCase().includes(needle) ||
                          (q.company_name || '').toLowerCase().includes(needle) ||
                          (q.contact_person || '').toLowerCase().includes(needle) ||
                          (q.contact_phone || '').toLowerCase().includes(needle) ||
                          (q.destination_city || '').toLowerCase().includes(needle) ||
                          (q.product_title || '').toLowerCase().includes(needle);
                        if (!match) return false;
                      }
                      return true;
                    })
                    .map((q: any) => (
                      <tr key={q.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedRfqForDetail(q.id)}
                            className="font-mono font-bold text-stone-900 hover:text-emerald-700 hover:underline flex items-center gap-1 text-left"
                            title="Click to open full operations dossier"
                          >
                            <span>{q.quote_number}</span>
                            {Number(q.revision_number) > 1 && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-md font-sans">
                                Rev {q.revision_number}
                              </span>
                            )}
                          </button>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {q.created_at
                              ? new Date(q.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                          </div>
                          {q.valid_until && (
                            <div className="text-[10px] text-amber-700 font-medium">
                              Valid: {new Date(q.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-stone-900">{q.company_name || 'Individual Buyer'}</div>
                          <div className="text-[11px] text-stone-500">
                            {q.contact_person}
                            {q.contact_phone ? ` • ${q.contact_phone}` : ''}
                            {q.contact_email ? ` • ${q.contact_email}` : ''}
                          </div>
                          {q.gstin && <div className="text-[10px] font-mono text-emerald-800">GSTIN: {q.gstin}</div>}
                          {q.sales_owner_name && (
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              Owner: <strong>{q.sales_owner_name}</strong>
                            </div>
                          )}
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
                          {q.payment_status && q.payment_status !== 'unpaid' && (
                            <div className="text-[10px] font-sans font-bold uppercase text-emerald-700 mt-0.5">
                              {q.payment_status}
                            </div>
                          )}
                        </td>
                        <td className="p-4 space-y-1">
                          <div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                q.status === 'submitted' || q.status === 'new_rfq'
                                  ? 'bg-amber-100 text-amber-800'
                                  : q.status === 'under_review'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : q.status === 'quote_issued' || q.status === 'revised_quotation_issued'
                                  ? 'bg-blue-100 text-blue-800'
                                  : q.status === 'discussion_in_progress'
                                  ? 'bg-purple-100 text-purple-800'
                                  : q.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : q.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {q.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {q.fulfilment_status && q.fulfilment_status !== 'not_started' && (
                            <div>
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-stone-100 text-stone-700">
                                🚜 {q.fulfilment_status.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <B2bDeskActionsDropdown
                            rfq={q}
                            onViewDetails={(target) => setSelectedRfqForDetail(target.id)}
                            onTransitionStatus={handleTransitionStatus}
                            onOpenRejectModal={(target) => setSelectedRfqForReject(target)}
                            onOpenReopenModal={(target) => setSelectedRfqForReopen(target)}
                            onOpenDiscussionModal={(target) => setSelectedRfqForDiscussion(target)}
                            onOpenRevisionModal={(target) => setSelectedRfqForRevision(target)}
                            onOpenHandoverModal={(target) => setSelectedRfqForHandover(target)}
                            onOpenFulfilmentModal={(target, tab) => setSelectedRfqForFulfilment({ rfq: target, tab })}
                            onOpenPaymentModal={(target) => setSelectedRfqForPayment(target)}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: RETAIL & MULTI-CHANNEL ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">Orders & Multi-Channel Sales (Retail & Wholesale)</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Execute order lifecycle transitions, connect courier/transporter tracking, and manage offline phone & WhatsApp sales.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCreateOrderCustomer(null);
                    setIsCreateOrderOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Create Order (Phone / WhatsApp)
                </button>
              </div>
            </div>

            {/* Channel Filters */}
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-stone-600 mr-1">Filter Channel:</span>
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'retail', label: 'Retail (B2C)' },
                { id: 'wholesale', label: 'Bulk Wholesale (B2B)' },
                { id: 'phone', label: 'Phone Orders' },
                { id: 'whatsapp', label: 'WhatsApp Orders' },
                { id: 'admin', label: 'Admin Created' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setOrderChannelFilter(pill.id as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    orderChannelFilter === pill.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-4">Order ID & Source</th>
                    <th className="p-4">Customer & Address</th>
                    <th className="p-4">Purchased Items</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status Lifecycle</th>
                    <th className="p-4 text-right">Transition Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders
                    .filter((o) => {
                      if (orderChannelFilter === 'retail') return (o as any).order_channel === 'retail' || o.order_type === 'retail';
                      if (orderChannelFilter === 'wholesale') return (o as any).order_channel === 'wholesale' || o.order_type === 'wholesale';
                      if (orderChannelFilter === 'phone') return (o as any).order_source === 'phone';
                      if (orderChannelFilter === 'whatsapp') return (o as any).order_source === 'whatsapp';
                      if (orderChannelFilter === 'admin') return (o as any).order_source === 'admin' || Boolean((o as any).created_by_admin_name);
                      return true;
                    })
                    .map((o) => {
                    const items = Array.isArray(o.items) ? o.items : JSON.parse((o.items as any) || '[]');
                    return (
                      <tr key={o.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4">
                          <div className="font-mono font-bold text-stone-900">{o.order_number}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                              {(o as any).order_source || 'website'}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {new Date(o.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {o.tracking_reference && (
                            <div className="text-[10px] font-mono text-emerald-800 font-semibold mt-1">
                              Ref: {o.tracking_reference}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-stone-900">{o.customer_name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">+91 {o.customer_phone}</div>
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
                          {(o.status === 'packed' || o.status === 'allocated') && (
                            <button
                              onClick={() => {
                                setCreateShipmentOrder(o);
                                setIsCreateShipmentOpen(true);
                              }}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                            >
                              Create Shipment / LR
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

        {/* TAB: CUSTOMER CRM */}
        {activeTab === 'crm' && (
          <CrmCustomersTab
            onSelectCustomer={openCustomerDossier}
            onOpenCreateOrder={(c) => {
              setCreateOrderCustomer(c);
              setIsCreateOrderOpen(true);
            }}
            onOpenLogCall={(c) => {
              setCallCustomer(c);
              setIsCallModalOpen(true);
            }}
          />
        )}

        {/* TAB: REPEAT SALES & RETENTION */}
        {activeTab === 'repeat' && (
          <CrmRepeatOrdersTab
            onSelectCustomer={openCustomerDossier}
            onOpenCreateOrder={(c) => {
              setCreateOrderCustomer(c);
              setIsCreateOrderOpen(true);
            }}
            onOpenLogCall={(c) => {
              setCallCustomer(c);
              setIsCallModalOpen(true);
            }}
          />
        )}

        {/* TAB: SHIPMENTS & LOGISTICS */}
        {activeTab === 'shipments' && (
          <CrmShipmentsTab
            onOpenCreateShipment={(o) => {
              setCreateShipmentOrder(o);
              setIsCreateShipmentOpen(true);
            }}
          />
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
                      placeholder="e.g. Tiptur Sourcing Yard Gate 2"
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
                      <th className="p-4">Batch & Intake Date</th>
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
                        <td className="p-4">
                          <div className="font-mono font-bold text-stone-900">{b.batch_number}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {b.intake_date
                              ? new Date(b.intake_date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Harvest lot'}
                          </div>
                        </td>
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

        {/* TAB 5: BUYER RATINGS & REVIEW MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Buyer Ratings &amp; Reviews Moderation</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Manage authentic verified farm commodity reviews, monitor buyer feedback, or delete inappropriate ratings.
                </p>
              </div>

              {/* Star Rating Filters */}
              <div className="flex items-center gap-1.5 text-xs">
                {['all', '5', '4', '3', '2', '1'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewFilter(st as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                      reviewFilter === st
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {st === 'all' ? 'All Ratings' : `${st}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews Table */}
            <div className="overflow-x-auto">
              {allReviews.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No customer reviews found in database.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b text-stone-600 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Commodity / Produce</th>
                      <th className="p-4">Customer Name &amp; Contact</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Review Title &amp; Feedback</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Delete Option</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {allReviews
                      .filter((rev) => reviewFilter === 'all' || String(rev.rating) === reviewFilter)
                      .map((rev) => (
                        <tr key={rev.id} className="hover:bg-stone-50/70 transition">
                          <td className="p-4 font-bold text-stone-900 max-w-[200px]">
                            <div>{rev.product_title || 'Farm Commodity'}</div>
                            <span className="text-[10px] text-stone-400 font-mono font-normal">
                              {rev.product_slug}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-stone-800">{rev.customer_name}</div>
                            {rev.customer_phone && (
                              <div className="text-[11px] font-mono text-stone-500">
                                +91 {rev.customer_phone}
                              </div>
                            )}
                            <span className="inline-block mt-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                              Verified Buyer
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 font-bold text-stone-900">
                              <span className="font-mono text-sm">{rev.rating}.0</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= rev.rating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-stone-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs">
                            {rev.title && (
                              <div className="font-bold text-stone-900 mb-0.5 line-clamp-1">
                                {rev.title}
                              </div>
                            )}
                            <p className="text-stone-600 line-clamp-2 leading-relaxed">
                              {rev.comment}
                            </p>
                          </td>
                          <td className="p-4 whitespace-nowrap text-stone-500">
                            {new Date(rev.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isDeletingReview === rev.id}
                              onClick={() => handleDeleteReviewAdmin(rev.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition disabled:opacity-50"
                              title="Permanently Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isDeletingReview === rev.id ? 'Deleting...' : 'Delete Rating'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* B2B OPERATIONS MODALS */}
        <B2bRfqDetailModal
          isOpen={Boolean(selectedRfqForDetail)}
          onClose={() => setSelectedRfqForDetail(null)}
          rfqId={selectedRfqForDetail}
          onRefreshParent={fetchData}
          onOpenRevisionModal={(target) => setSelectedRfqForRevision(target)}
          onOpenDiscussionModal={(target) => setSelectedRfqForDiscussion(target)}
          onOpenHandoverModal={(target) => setSelectedRfqForHandover(target)}
          onOpenFulfilmentModal={(target, tab) => setSelectedRfqForFulfilment({ rfq: target, tab })}
          onOpenPaymentModal={(target) => setSelectedRfqForPayment(target)}
          onOpenRejectModal={(target) => setSelectedRfqForReject(target)}
          onOpenReopenModal={(target) => setSelectedRfqForReopen(target)}
        />

        <B2bRejectionModal
          isOpen={Boolean(selectedRfqForReject)}
          onClose={() => setSelectedRfqForReject(null)}
          rfq={selectedRfqForReject}
          onConfirmReject={handleConfirmReject}
        />

        <B2bReopenModal
          isOpen={Boolean(selectedRfqForReopen)}
          onClose={() => setSelectedRfqForReopen(null)}
          rfq={selectedRfqForReopen}
          onConfirmReopen={handleConfirmReopen}
        />

        <B2bDiscussionModal
          isOpen={Boolean(selectedRfqForDiscussion)}
          onClose={() => setSelectedRfqForDiscussion(null)}
          rfq={selectedRfqForDiscussion}
          onSaveDiscussion={handleSaveDiscussion}
        />

        <B2bRevisionModal
          isOpen={Boolean(selectedRfqForRevision)}
          onClose={() => setSelectedRfqForRevision(null)}
          rfq={selectedRfqForRevision}
          onSaveRevision={handleSaveRevision}
        />

        <B2bHandoverModal
          isOpen={Boolean(selectedRfqForHandover)}
          onClose={() => setSelectedRfqForHandover(null)}
          rfq={selectedRfqForHandover}
          onConfirmHandover={handleConfirmHandover}
        />

        <B2bFulfilmentModal
          isOpen={Boolean(selectedRfqForFulfilment)}
          onClose={() => setSelectedRfqForFulfilment(null)}
          rfq={selectedRfqForFulfilment?.rfq || null}
          initialTab={selectedRfqForFulfilment?.tab as any}
          onSaveFulfilment={handleSaveFulfilment}
        />

        <B2bPaymentModal
          isOpen={Boolean(selectedRfqForPayment)}
          onClose={() => setSelectedRfqForPayment(null)}
          rfq={selectedRfqForPayment}
          onRecordPayment={handleRecordPayment}
        />

        {/* CUSTOMER CRM, ADMIN ORDERS & SHIPMENT MODALS */}
        <CrmCustomerDossierModal
          isOpen={isCustomerDossierOpen}
          onClose={() => {
            setIsCustomerDossierOpen(false);
            setSelectedCustomerIdForDossier(null);
            setCustomerDossierData(null);
          }}
          customer={customerDossierData?.customer || null}
          summary={customerDossierData?.summary || null}
          orders={customerDossierData?.orders || []}
          quotes={customerDossierData?.quotes || []}
          calls={customerDossierData?.calls || []}
          feedback={customerDossierData?.feedback || []}
          complaints={customerDossierData?.complaints || []}
          shipments={customerDossierData?.shipments || []}
          onOpenCreateOrder={(c) => {
            setIsCustomerDossierOpen(false);
            setCreateOrderCustomer(c);
            setIsCreateOrderOpen(true);
          }}
          onOpenLogCall={(c) => {
            setCallCustomer(c);
            setIsCallModalOpen(true);
          }}
          onOpenLogComplaint={(c) => {
            setComplaintCustomer(c);
            setIsComplaintModalOpen(true);
          }}
          onRefreshDossier={() => {
            if (selectedCustomerIdForDossier) openCustomerDossier(selectedCustomerIdForDossier);
          }}
        />

        <CrmCreateOrderModal
          isOpen={isCreateOrderOpen}
          onClose={() => {
            setIsCreateOrderOpen(false);
            setCreateOrderCustomer(null);
          }}
          selectedCustomer={createOrderCustomer}
          onOrderCreated={() => {
            fetchData();
          }}
        />

        <CrmCreateShipmentModal
          isOpen={isCreateShipmentOpen}
          onClose={() => {
            setIsCreateShipmentOpen(false);
            setCreateShipmentOrder(null);
          }}
          order={createShipmentOrder}
          onShipmentCreated={() => {
            fetchData();
          }}
        />

        <CrmSupportCallModal
          isOpen={isCallModalOpen}
          onClose={() => {
            setIsCallModalOpen(false);
            setCallCustomer(null);
          }}
          customer={callCustomer}
          onCallLogged={() => {
            if (selectedCustomerIdForDossier) openCustomerDossier(selectedCustomerIdForDossier);
          }}
        />

        <CrmComplaintModal
          isOpen={isComplaintModalOpen}
          onClose={() => {
            setIsComplaintModalOpen(false);
            setComplaintCustomer(null);
          }}
          customer={complaintCustomer}
          onComplaintLogged={() => {
            if (selectedCustomerIdForDossier) openCustomerDossier(selectedCustomerIdForDossier);
          }}
        />
      </main>
    </div>
  );
}
