'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingCart, User, Phone, MapPin, ShieldCheck, CheckCircle } from 'lucide-react';
import { CATALOG_PRODUCTS } from '@/lib/catalog';
import { Customer } from '@/types';
import { ORDER_SOURCES, ORDER_CHANNELS } from '@/lib/crm-constants';

interface CrmCreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: Customer | null;
  onOrderCreated: (order: any) => void;
}

interface OrderItemForm {
  product_id: string;
  sku: string;
  title: string;
  unit_price_inr: number;
  quantity: number;
  unit_of_measure: string;
  tax_rate_percentage: number;
  estimated_weight_kg: number;
}

export default function CrmCreateOrderModal({
  isOpen,
  onClose,
  selectedCustomer,
  onOrderCreated,
}: CrmCreateOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [destinationPincode, setDestinationPincode] = useState('');

  const [orderSource, setOrderSource] = useState<'phone' | 'whatsapp' | 'email' | 'in_person' | 'admin'>('phone');
  const [orderChannel, setOrderChannel] = useState<'retail' | 'wholesale' | 'export'>('retail');
  const [customerConsentSource, setCustomerConsentSource] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [items, setItems] = useState<OrderItemForm[]>([
    {
      product_id: CATALOG_PRODUCTS[0].id,
      sku: CATALOG_PRODUCTS[0].sku,
      title: CATALOG_PRODUCTS[0].title,
      unit_price_inr: CATALOG_PRODUCTS[0].retail_price_inr,
      quantity: 1,
      unit_of_measure: CATALOG_PRODUCTS[0].unit_of_measure,
      tax_rate_percentage: CATALOG_PRODUCTS[0].tax_rate_percentage,
      estimated_weight_kg: CATALOG_PRODUCTS[0].estimated_weight_kg,
    },
  ]);

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi_manual');
  const [initialStatus, setInitialStatus] = useState<'paid' | 'pending_payment' | 'draft'>('paid');
  const [adminUserName, setAdminUserName] = useState('Admin Desk Officer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name || '');
      setCustomerPhone(selectedCustomer.phone || '');
      setCustomerEmail(selectedCustomer.email || '');
      setShippingAddress(selectedCustomer.shipping_address || '');
      setDestinationPincode(selectedCustomer.pincode || '');
      setOrderChannel(
        selectedCustomer.customer_type === 'wholesale'
          ? 'wholesale'
          : selectedCustomer.customer_type === 'export'
          ? 'export'
          : 'retail'
      );
    }
  }, [selectedCustomer]);

  if (!isOpen) return null;

  // Price calculations
  const subtotal = items.reduce((acc, item) => acc + item.unit_price_inr * item.quantity, 0);
  const totalTax = items.reduce(
    (acc, item) => acc + (item.unit_price_inr * item.quantity * item.tax_rate_percentage) / 100,
    0
  );
  const totalAmount = Math.round(subtotal + totalTax + Number(deliveryFee));

  const handleAddItem = () => {
    const prod = CATALOG_PRODUCTS[0];
    setItems((prev) => [
      ...prev,
      {
        product_id: prod.id,
        sku: prod.sku,
        title: prod.title,
        unit_price_inr: prod.retail_price_inr,
        quantity: 1,
        unit_of_measure: prod.unit_of_measure,
        tax_rate_percentage: prod.tax_rate_percentage,
        estimated_weight_kg: prod.estimated_weight_kg,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, prodId: string) => {
    const prod = CATALOG_PRODUCTS.find((p) => p.id === prodId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              product_id: prod.id,
              sku: prod.sku,
              title: prod.title,
              unit_price_inr: prod.retail_price_inr,
              unit_of_measure: prod.unit_of_measure,
              tax_rate_percentage: prod.tax_rate_percentage,
              estimated_weight_kg: prod.estimated_weight_kg,
            }
          : item
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const handleUnitPriceChange = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, unit_price_inr: Math.max(0, price) } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim() || !destinationPincode.trim()) {
      setErrorMsg('Customer name, phone number, shipping address, and PIN code are required.');
      return;
    }

    if (!customerConsentSource.trim()) {
      setErrorMsg('Mandatory customer consent verification note is required before placing offline order.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: selectedCustomer?.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        shipping_address: shippingAddress.trim(),
        destination_pincode: destinationPincode.trim(),
        order_source: orderSource,
        order_channel: orderChannel,
        customer_consent_source: customerConsentSource.trim(),
        admin_notes: adminNotes.trim() || undefined,
        items: items.map((i) => ({
          product_id: i.product_id,
          sku: i.sku,
          title: i.title,
          quantity: i.quantity,
          unit_price_inr: i.unit_price_inr,
          total_price_inr: i.unit_price_inr * i.quantity,
          unit_of_measure: i.unit_of_measure,
          estimated_weight_kg: i.estimated_weight_kg,
        })),
        subtotal_inr: subtotal,
        delivery_fee_inr: Number(deliveryFee),
        tax_inr: Math.round(totalTax),
        total_amount_inr: totalAmount,
        payment_method: paymentMethod,
        payment_status: initialStatus === 'paid' ? 'paid' : 'pending',
        initial_status: initialStatus,
        admin_user_name: adminUserName.trim() || 'Admin Desk',
      };

      const res = await fetch('/api/admin/crm/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onOrderCreated(data.order);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to create order.');
      }
    } catch {
      setErrorMsg('Network error while placing admin order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Create Order on Behalf of Customer</h2>
              <p className="text-xs text-stone-400">
                Authorized offline order creation from Phone, WhatsApp, or In-Person agreement
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Source & Channel Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Order Source (Origin)</label>
              <select
                value={orderSource}
                onChange={(e) => setOrderSource(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
              >
                {ORDER_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Order Channel</label>
              <select
                value={orderChannel}
                onChange={(e) => setOrderChannel(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
              >
                {ORDER_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Initial Status</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
              >
                <option value="paid">Confirmed & Paid (Allocation Started)</option>
                <option value="pending_payment">Payment Pending (Awaiting NEFT/UPI)</option>
                <option value="draft">Draft Order (Review Only)</option>
              </select>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-stone-600 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="text-stone-600 block mb-1">Mobile Phone (10 digits) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9845012345"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-stone-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. buyer@example.com"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-stone-600 block mb-1">Shipping Street Address *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Shop No., Street, Mandi Market, Town"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="text-stone-600 block mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={destinationPincode}
                  onChange={(e) => setDestinationPincode(e.target.value)}
                  placeholder="e.g. 560001"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Product Items Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-700" />
                Commodity Line Items
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
                    >
                      {CATALOG_PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.unit_of_measure}) — ₹{p.retail_price_inr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <label className="text-[10px] text-stone-500 block">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                      className="w-full p-2 rounded-xl border border-stone-300 bg-white font-mono text-center font-bold"
                    />
                  </div>

                  <div className="w-28">
                    <label className="text-[10px] text-stone-500 block">Unit Rate (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={item.unit_price_inr}
                      onChange={(e) => handleUnitPriceChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-stone-300 bg-white font-mono text-center font-bold"
                    />
                  </div>

                  <div className="w-28 text-right font-mono font-extrabold text-stone-900 text-sm">
                    ₹{(item.unit_price_inr * item.quantity).toLocaleString('en-IN')}
                    <div className="text-[10px] text-stone-400 font-normal">
                      GST: {item.tax_rate_percentage}%
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Produce Subtotal:</span>
              <span className="font-mono font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Estimated Taxes (GST):</span>
              <span className="font-mono font-bold">₹{Math.round(totalTax).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-stone-600">
              <span>Freight / Delivery Fee:</span>
              <div className="flex items-center gap-1 font-mono">
                <span>₹</span>
                <input
                  type="number"
                  min={0}
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  className="w-20 p-1 border rounded-lg bg-white text-right font-bold"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-stone-300 flex justify-between text-sm font-black text-stone-900">
              <span>Total Invoice Amount:</span>
              <span className="font-mono text-emerald-900 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Mandatory Consent Note */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
            <label className="font-bold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Customer Authorization & Consent Verification (Mandatory) *
            </label>
            <p className="text-[11px] text-amber-800">
              Record proof that the customer authorized this purchase (e.g. &ldquo;Phone discussion with buyer on 9845012345 at 10:15 AM&rdquo; or &ldquo;WhatsApp confirmation screenshot archived in CRM&rdquo;).
            </p>
            <textarea
              required
              rows={2}
              value={customerConsentSource}
              onChange={(e) => setCustomerConsentSource(e.target.value)}
              placeholder="e.g. Verbal approval on recorded phone call at 11:20 AM confirming 20 bags Semi-Husked mature coconuts at ₹1,479/bag delivered to Bangalore."
              className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs"
            />
          </div>

          {/* Admin Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-600 block mb-1">Creating Staff Officer Name</label>
              <input
                type="text"
                value={adminUserName}
                onChange={(e) => setAdminUserName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="text-stone-600 block mb-1">Internal Notes (Optional)</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional notes for packing / dispatch crew"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>
          </div>

          {/* Action Buttons & Bottom Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

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
              {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
