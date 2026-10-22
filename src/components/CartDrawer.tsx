'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  MapPin
} from 'lucide-react';
import { Order } from '@/types';

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
    deliveryFee,
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
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setConfirmedOrder(data.order);
        setStep('success');
        clearCart();

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
                    {/* Transportation Policy & Weight Notice (Modeled after coconutseller.in/transportation) */}
                    <div className="bg-lime-50/80 border border-lime-200/90 p-3 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-stone-800 font-bold">
                        <div className="flex items-center gap-1.5 text-[#3b6d11]">
                          <Truck className="w-4 h-4 text-[#3b6d11]" />
                          <span>Transportation Charged Extra</span>
                        </div>
                        <span className="font-mono text-[#1c3809] bg-white border border-lime-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          Shiprocket Engine
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Agricultural freight is charged on actual weight &amp; destination corridor. 
                        <Link
                          href="/transportation"
                          onClick={() => setIsCartOpen(false)}
                          className="text-[#3b6d11] font-bold underline ml-1 hover:text-[#254b0d]"
                        >
                          View Transportation Rates &amp; Policy &rarr;
                        </Link>
                      </p>
                    </div>

                    {/* Cart Items List */}
                    <div className="divide-y divide-stone-100">
                      {items.map((item) => (
                        <div key={item.product_id} className="py-3 flex gap-3 items-center">
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
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="p-1 hover:bg-stone-200 rounded text-stone-700 transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="p-1 hover:bg-stone-200 rounded text-stone-700 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-stone-400 hover:text-red-600 p-1.5 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
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
                    {isSubmitting ? 'Processing Payment...' : `Confirm & Pay ₹${total.toLocaleString('en-IN')}`}
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
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#3b6d11]" />
                    <span>Transportation Freight (Extra)</span>
                  </span>
                  <span className="font-mono font-medium text-stone-800">
                    {deliveryFee > 0 ? `₹${deliveryFee}` : 'Calculated at actuals'}
                  </span>
                </div>
                <div className="flex justify-between text-stone-900 text-sm font-extrabold pt-2 border-t">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-900 text-base">₹{total.toLocaleString('en-IN')}</span>
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
