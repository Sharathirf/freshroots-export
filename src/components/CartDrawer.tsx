'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  Smartphone,
  ArrowRight,
  Printer,
  MapPin,
  Tag,
  Sparkles,
  Check
} from 'lucide-react';
import { Order } from '@/types';
import { AVAILABLE_COUPONS, FarmCoupon, validateCoupon } from '@/lib/coupons';

export default function CartDrawer() {
  const { customer, addresses, saveAddress } = useAuth();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    total,
    pincode
  } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(customer?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [destPincode, setDestPincode] = useState(pincode);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isEnteringCustomAddress, setIsEnteringCustomAddress] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [newAddressTag, setNewAddressTag] = useState('Home');

  useEffect(() => {
    if (customer) {
      if (customer.name) setCustomerName(customer.name);
      if (customer.phone) setCustomerPhone(customer.phone);
      if (customer.email) setCustomerEmail(customer.email);
    }
  }, [customer]);

  // Auto-select default or first address if available
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId && !isEnteringCustomAddress) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(def.id);
      setShippingAddress(def.street_address);
      setDestPincode(def.pincode);
      if (def.recipient_name) setCustomerName(def.recipient_name);
      if (def.phone) setCustomerPhone(def.phone);
    }
  }, [addresses, selectedAddressId, isEnteringCustomAddress]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // 1-Tap Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<FarmCoupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [showCustomCoupon, setShowCustomCoupon] = useState(false);

  // Dynamic Discount & Total Calculation
  const deliveryFee = 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'flat'
      ? Math.min(appliedCoupon.value, subtotal)
      : Math.round((subtotal * appliedCoupon.value) / 100)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Re-verify coupon eligibility if cart subtotal changes
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minOrderAmount) {
      setAppliedCoupon(null);
      setCouponSuccess(null);
      setCouponError(`Cart value dropped below ₹${appliedCoupon.minOrderAmount}. ${appliedCoupon.code} removed.`);
    }
  }, [subtotal, appliedCoupon]);

  const handleToggleCoupon = (coupon: FarmCoupon) => {
    setCouponError(null);
    if (appliedCoupon?.code === coupon.code) {
      setAppliedCoupon(null);
      setCouponSuccess(null);
      return;
    }

    if (subtotal < coupon.minOrderAmount) {
      setCouponError(`Add items worth ₹${coupon.minOrderAmount - subtotal} more to unlock ${coupon.code}!`);
      return;
    }

    const res = validateCoupon(coupon.code, subtotal);
    if (res.valid) {
      setAppliedCoupon(coupon);
      setCouponSuccess(res.message);
    } else {
      setCouponError(res.message);
    }
  };

  const handleApplyCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponCodeInput.trim()) return;

    const res = validateCoupon(couponCodeInput, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponSuccess(res.message);
      setCouponCodeInput('');
      setShowCustomCoupon(false);
    } else {
      setCouponError(res.message);
    }
  };

  // 15-minute reservation timer state
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds

  useEffect(() => {
    if (isCartOpen && items.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCartOpen, items.length]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress || !destPincode) {
      setOrderError('Please fill in all mandatory shipping fields.');
      return;
    }

    if (customerPhone.replace(/\D/g, '').length < 10) {
      setOrderError('Please provide a valid 10-digit Indian phone number.');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          shipping_address: shippingAddress,
          destination_pincode: destPincode,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            unit_price_inr: i.unit_price_inr,
            unit_of_measure: i.unit_of_measure,
            title: i.title,
            estimated_weight_kg: i.estimated_weight_kg,
            item_key: i.item_key
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setConfirmedOrder(data.order);
        setStep('success');
        clearCart();

        // Persist latest order & recent orders in localStorage for instant 1-tap tracking on Homepage
        try {
          const resolveImg = (sku?: string) => {
            if (!sku) return 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('ARE')) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('COC-SEMI') || sku.includes('COC-MAT')) return 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('COP') || sku.includes('BAL')) return '/products/tiptur-ball-copra.jpg';
            if (sku.includes('NUR-COC')) return '/products/coconut-plants-saplings.jpg';
            if (sku.includes('OIL') || sku.includes('GNT')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('MIL') || sku.includes('RAG')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('GHE') || sku.includes('COW') || sku.includes('DAI')) return 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('TND')) return 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('GIN')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80';
            if (sku.includes('SHL')) return '/products/coconut-shells-pile.jpg';
            return 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=400&q=80';
          };

          const orderItemsList = items.map((it) => ({
            product_id: it.product_id,
            sku: it.sku,
            title: it.title,
            unit_of_measure: it.unit_of_measure,
            quantity: it.quantity,
            unit_price_inr: it.unit_price_inr,
            image_url: resolveImg(it.sku)
          }));

          const latestOrderInfo = {
            order_number: data.order.order_number,
            date: data.order.created_at || new Date().toISOString(),
            total: data.order.grand_total_inr || total,
            status: data.order.status || 'paid',
            items_count: items.length,
            first_item_title: items[0]?.title || 'Farm Produce',
            image_url: resolveImg(items[0]?.sku),
            items: orderItemsList,
            payment_method: paymentMethod,
            customer_phone: customerPhone,
            tracking_reference: data.order.tracking_reference || ''
          };

          localStorage.setItem('agri_latest_order', JSON.stringify(latestOrderInfo));

          const recentRaw = localStorage.getItem('agri_recent_orders');
          const existingRecent = recentRaw ? JSON.parse(recentRaw) : [];
          const updatedRecent = [
            latestOrderInfo,
            ...existingRecent.filter((o: any) => o.order_number !== latestOrderInfo.order_number)
          ].slice(0, 10);
          localStorage.setItem('agri_recent_orders', JSON.stringify(updatedRecent));

          window.dispatchEvent(new Event('agri_order_placed'));
        } catch (e) {
          console.warn('Failed to save latest order to localStorage', e);
        }

        // Save newly entered address to customer's multiple addresses if opted in
        if (saveNewAddress && customerPhone && (isEnteringCustomAddress || addresses.length === 0)) {
          saveAddress({
            recipient_name: customerName,
            phone: customerPhone,
            tag: newAddressTag || 'Home',
            street_address: shippingAddress,
            city: 'Mandya',
            pincode: destPincode,
            is_default: addresses.length === 0
          }).catch(console.warn);
        }
      } else {
        setOrderError(data.error || 'Failed to process order. Please try again.');
      }
    } catch {
      setOrderError('Network error while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {step === 'cart' && 'Your Shopping Cart'}
                {step === 'checkout' && 'Fast Checkout'}
                {step === 'success' && 'Order Confirmed!'}
              </h2>
              {step !== 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-800 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Harvest inventory reserved for: <strong>{formatTimer(timeLeft)}</strong></span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {step === 'cart' && (
              <>
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                      <Truck className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-stone-900 text-base">Your cart is empty</h3>
                    <p className="text-stone-500 text-xs mt-1 max-w-xs mx-auto">
                      Explore our hand-graded mature coconuts and GI-certified Tiptur ball copra to place an order.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
                    >
                      Browse Agricultural SKUs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 100% Free Doorstep Delivery Banner */}
                    <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs space-y-1 text-emerald-950 shadow-xs">
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>100% FREE Doorstep Delivery Unlocked!</span>
                        </div>
                        <span className="font-mono text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          FREE
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Free doorstep delivery on all orders across India. No minimum order quantity required.
                      </p>
                    </div>

                    {/* Cart Items List */}
                    <div className="divide-y divide-stone-100">
                      {items.map((item) => {
                        const itemKey = item.item_key || item.product_id;
                        return (
                          <div key={itemKey} className="py-3 flex gap-3 items-center">
                            <div className="flex-1">
                              <h4 className="font-bold text-stone-900 text-sm leading-tight">{item.title}</h4>
                              <div className="text-xs text-stone-500 mt-0.5">
                                {item.unit_of_measure} • ₹{item.unit_price_inr.toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs font-bold text-emerald-800 mt-1">
                                ₹{item.total_price_inr.toLocaleString('en-IN')}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-lg">
                              <button
                                onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                                className="p-1 hover:bg-stone-200 rounded text-stone-700 transition"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                                className="p-1 hover:bg-stone-200 rounded text-stone-700 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(itemKey)}
                              className="text-stone-400 hover:text-red-600 p-1.5 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* 1-Tap Farm Savings & Coupons */}
                    <div className="pt-3 border-t border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                          <Tag className="w-3.5 h-3.5 text-emerald-700" />
                          <span>1-Tap Farm Coupons</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCustomCoupon(!showCustomCoupon)}
                          className="text-[11px] font-bold text-emerald-800 hover:underline"
                        >
                          {showCustomCoupon ? 'Hide Code Box' : '+ Enter Code'}
                        </button>
                      </div>

                      {/* Clickable 1-tap coupon chips */}
                      <div className="space-y-2">
                        {AVAILABLE_COUPONS.map((coupon) => {
                          const isApplied = appliedCoupon?.code === coupon.code;
                          const isEligible = subtotal >= coupon.minOrderAmount;
                          const deficit = coupon.minOrderAmount - subtotal;

                          return (
                            <div
                              key={coupon.code}
                              onClick={() => handleToggleCoupon(coupon)}
                              role="button"
                              tabIndex={0}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                                isApplied
                                  ? 'bg-emerald-50/90 border-emerald-600 ring-1 ring-emerald-600 shadow-xs'
                                  : isEligible
                                  ? 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-stone-50'
                                  : 'bg-stone-50/70 border-dashed border-stone-300 opacity-75'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-black text-xs text-stone-900 px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200">
                                    {coupon.code}
                                  </span>
                                  <span className="font-bold text-stone-800 text-[11px]">{coupon.title}</span>
                                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                                    {coupon.badge}
                                  </span>
                                </div>
                                <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                                  {coupon.description}
                                </div>
                                {!isEligible && (
                                  <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                                    Add ₹{deficit.toLocaleString('en-IN')} more to unlock
                                  </div>
                                )}
                              </div>

                              <div className="shrink-0">
                                {isApplied ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] uppercase shadow-xs">
                                    <Check className="w-3 h-3" />
                                    Applied
                                  </span>
                                ) : isEligible ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold text-[10px] uppercase transition">
                                    <Sparkles className="w-3 h-3 text-emerald-700" />
                                    1-Tap Apply
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-stone-400 uppercase">
                                    Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Manual Promo Code input field */}
                      {showCustomCoupon && (
                        <form onSubmit={handleApplyCustomCode} className="mt-2.5 flex gap-2">
                          <input
                            type="text"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                            placeholder="Enter promo code (e.g. FARM50)"
                            className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition"
                          >
                            Apply
                          </button>
                        </form>
                      )}

                      {/* Feedback Alerts */}
                      {couponSuccess && (
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                          <span className="font-semibold">{couponSuccess}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponSuccess(null);
                            }}
                            className="text-[11px] font-bold text-red-600 hover:underline ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900">
                          {couponError}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Quality Guarantee: Broken or cracked nuts replaced at zero cost.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Smt. Rajeshwari"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Mobile (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9845012345"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Postal PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={destPincode}
                      onChange={(e) => setDestPincode(e.target.value)}
                      placeholder="560001"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex justify-between">
                    <span>Email Address</span>
                    <span className="text-[11px] text-stone-400 font-normal">For GST invoice &amp; tracking</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Saved Multiple Addresses Selector */}
                {addresses && addresses.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Select Delivery Address</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isEnteringCustomAddress;
                          setIsEnteringCustomAddress(nextState);
                          if (nextState) {
                            setSelectedAddressId(null);
                            setShippingAddress('');
                          } else {
                            const def = addresses.find((a) => a.is_default) || addresses[0];
                            setSelectedAddressId(def.id);
                            setShippingAddress(def.street_address);
                            setDestPincode(def.pincode);
                          }
                        }}
                        className="text-[11px] text-emerald-800 font-bold hover:underline"
                      >
                        {isEnteringCustomAddress ? '← Use Saved Address' : '+ New Address'}
                      </button>
                    </div>

                    {!isEnteringCustomAddress && (
                      <div className="space-y-2 mb-3">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setShippingAddress(addr.street_address);
                              setDestPincode(addr.pincode);
                              if (addr.recipient_name) setCustomerName(addr.recipient_name);
                              if (addr.phone) setCustomerPhone(addr.phone);
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              selectedAddressId === addr.id
                                ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                                : 'border-stone-200 bg-white hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-stone-100 border border-stone-200 text-stone-700">
                                  {addr.tag}
                                </span>
                                <span>{addr.recipient_name || customerName}</span>
                                {addr.is_default && (
                                  <span className="text-[9px] text-emerald-700 font-extrabold uppercase">
                                    (Default)
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-stone-500 font-semibold">{addr.pincode}</span>
                            </div>
                            <div className="text-[11px] text-stone-600 mt-1 line-clamp-1">
                              {addr.street_address}, {addr.city}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Address Input (when no saved addresses or user chose + New Address) */}
                {(isEnteringCustomAddress || !addresses || addresses.length === 0) && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Delivery Address &amp; Landmark *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="House/Apartment number, street, cross, near landmark"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />

                    {customerPhone && (
                      <div className="mt-2 flex items-center justify-between text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={saveNewAddress}
                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                            className="rounded text-emerald-700 focus:ring-emerald-700"
                          />
                          <span>Save this address to my account</span>
                        </label>
                        <select
                          value={newAddressTag}
                          onChange={(e) => setNewAddressTag(e.target.value)}
                          className="text-[11px] bg-white border border-stone-300 rounded px-1.5 py-0.5 font-bold"
                        >
                          <option value="Home">Home</option>
                          <option value="Warehouse">Warehouse</option>
                          <option value="Oil Mill">Oil Mill</option>
                          <option value="Temple">Temple</option>
                          <option value="Office">Office</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Select Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        paymentMethod === 'upi'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span className="text-[11px]">UPI (GPay)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        paymentMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span className="text-[11px]">Card / NetBank</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span className="text-[11px]">Pay on Delivery</span>
                    </button>
                  </div>
                </div>

                {appliedCoupon && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex items-center justify-between text-emerald-950">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Coupon Applied: {appliedCoupon.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800">-₹{discountAmount}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponSuccess(null);
                        }}
                        className="text-[10px] text-red-600 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {orderError && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs">
                    {orderError}
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-1/3 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Processing Payment...' : `Confirm & Pay ₹${finalTotal.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && confirmedOrder && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900">Order Placed Successfully!</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Order Reference: <strong className="font-mono text-emerald-800">{confirmedOrder.order_number}</strong>
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-stone-500">Amount Paid:</span>
                    <strong className="text-stone-900 font-mono">₹{confirmedOrder.total_amount_inr}</strong>
                  </div>
                  {confirmedOrder.discount_inr && Number(confirmedOrder.discount_inr) > 0 ? (
                    <div className="flex justify-between border-b pb-2 text-emerald-800">
                      <span className="font-semibold">Coupon Savings ({confirmedOrder.coupon_code || 'COUPON'}):</span>
                      <strong className="font-mono">-₹{confirmedOrder.discount_inr}</strong>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-stone-500">Delivery To:</span>
                    <span className="text-stone-800 font-medium">{confirmedOrder.customer_name} ({confirmedOrder.destination_pincode})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Estimated Dispatch:</span>
                    <span className="text-emerald-700 font-bold">Within 24 Hours</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 text-left flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    A confirmation invoice has been registered and WhatsApp delivery tracking link sent to{' '}
                    <strong>{confirmedOrder.customer_phone}</strong>.
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => {
                      setStep('cart');
                      setIsCartOpen(false);
                    }}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Subtotal (for cart step) */}
          {step === 'cart' && items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                    </span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#3b6d11]" />
                    <span>Doorstep Delivery</span>
                  </span>
                  <span className="font-mono font-medium text-stone-800">
                    <span className="text-emerald-700 font-bold bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                      FREE (All Orders)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-stone-900 text-sm font-extrabold pt-2 border-t">
                  <span>Grand Total</span>
                  <div className="text-right">
                    {discountAmount > 0 && (
                      <span className="text-xs text-stone-400 line-through mr-1.5 font-normal">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="font-mono text-emerald-900 text-base">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Delivery & Payment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
