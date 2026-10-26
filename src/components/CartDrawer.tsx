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
  MapPin,
  Tag,
  Sparkles,
  Check,
  Mic,
  MessageCircle,
  PhoneCall,
  FileText,
  Sprout,
  Copy,
  AlertTriangle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Order } from '@/types';
import { AVAILABLE_COUPONS, FarmCoupon, validateCoupon } from '@/lib/coupons';
import GstInvoiceModal from '@/components/GstInvoiceModal';
import { track } from '@/lib/analytics';

export default function CartDrawer() {
  const { customer, addresses, saveAddress, lang } = useAuth();
  const isKannada = lang === 'kn';
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
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isFirstOrder, setIsFirstOrder] = useState<boolean>(true);

  // 1-Tap Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<FarmCoupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [showCustomCoupon, setShowCustomCoupon] = useState(false);

  // Detect whether current customer is placing their 1st order
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const recent = localStorage.getItem('agri_recent_orders');
        const latest = localStorage.getItem('agri_latest_order');
        if (latest || (recent && JSON.parse(recent).length > 0)) {
          setIsFirstOrder(false);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const phone = customerPhone || customer?.phone;
    const clean = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    if (clean && clean.length === 10) {
      fetch(`/api/orders/track?query=${encodeURIComponent(clean)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            setIsFirstOrder(false);
            if (appliedCoupon?.firstOrderOnly) {
              setAppliedCoupon(null);
              setCouponSuccess(null);
              setCouponError('Coupon FIRST100 is strictly for 1st-time orders.');
            }
          }
        })
        .catch(() => {});
    }
  }, [customerPhone, customer?.phone, appliedCoupon]);

  // Perishable / Nursery items check for specialized handling advisory
  const hasPerishable = items.some((it) => {
    const s = (it.sku || '').toUpperCase();
    const t = (it.title || '').toLowerCase();
    return (
      s.includes('NUR') ||
      s.includes('PLT') ||
      s.includes('TND') ||
      s.includes('SAP') ||
      t.includes('seedling') ||
      t.includes('plant') ||
      t.includes('sapling') ||
      t.includes('tender')
    );
  });

  // Dynamic Discount & Total Calculation
  const deliveryFee = 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'flat'
      ? Math.min(appliedCoupon.value, subtotal)
      : Math.round((subtotal * appliedCoupon.value) / 100)
    : 0;

  const estimatedTax = items.reduce(
    (sum, item) => sum + item.total_price_inr * (Number(item.tax_rate_percentage) || 0) / 100,
    0
  );
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee + estimatedTax);

  // Pre-filled WhatsApp voice / assistance checkout URL
  const waItemsText = items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.title} (${it.quantity} ${it.unit_of_measure}) - ₹${it.total_price_inr.toLocaleString('en-IN')}`
    )
    .join('\n');

  const waCheckoutMessage = isKannada
    ? `ನಮಸ್ಕಾರ ಶರತ್ ಅವರೇ, ನಾನು ಈ ಕೆಳಗಿನ ಫಾರ್ಮ್ ಉತ್ಪನ್ನಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ:\n\n${waItemsText}\n\n*ಒಟ್ಟು ಮೊತ್ತ:* ₹${finalTotal.toLocaleString('en-IN')}${appliedCoupon ? ` (ಕೂಪನ್: ${appliedCoupon.code})` : ''}\n\nನನಗೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ವಿಳಾಸ ಟೈಪ್ ಮಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನನ್ನ ವಿಳಾಸವನ್ನು ವಾಟ್ಸಾಪ್ ವಾಯ್ಸ್ ನೋಟ್ ಅಥವಾ ನೇರ ಫೋನ್ ಕರೆ ಮೂಲಕ ಪಡೆದು ಆರ್ಡರ್ ಕನ್ಫರ್ಮ್ ಮಾಡಿಕೊಳ್ಳಿ.`
    : `Hello Sharath, I would like to order these farm items:\n\n${waItemsText}\n\n*Cart Total:* ₹${finalTotal.toLocaleString('en-IN')}${appliedCoupon ? ` (Coupon: ${appliedCoupon.code})` : ''}\n\nI need help entering my delivery address. Please take my address over WhatsApp voice note or a quick phone call and confirm my order.`;

  const waVoiceCheckoutUrl = `https://wa.me/919591142548?text=${encodeURIComponent(waCheckoutMessage)}`;

  // Live Sapling distant transit check
  const hasSaplingInCart = items.some(
    (it) => it.sku?.includes('NUR') || it.title?.toLowerCase().includes('sapling') || it.title?.toLowerCase().includes('plant')
  );
  const isDistantStatePincode =
    Boolean(destPincode && destPincode.length >= 2 && !/^(5[0-3]|5[6-9]|6[0-4]|6[7-9])/.test(destPincode));

  // Live Direct UPI Payment Details
  const farmUpiId = '9591142548@upi';
  const upiPayLink = `upi://pay?pa=${farmUpiId}&pn=Farmer%20Sharath%20Inorahalli&am=${finalTotal}&cu=INR&tn=Agri_Order_${customerPhone || 'Direct'}`;
  const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayLink)}`;

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

    const res = validateCoupon(coupon.code, subtotal, isFirstOrder);
    if (res.valid) {
      setAppliedCoupon(coupon);
      setCouponSuccess(res.message);
      track('coupon_applied', {
        code: coupon.code,
        discount_amount: res.discountAmount,
        subtotal
      });
    } else {
      setCouponError(res.message);
    }
  };

  const handleApplyCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponCodeInput.trim()) return;

    const res = validateCoupon(couponCodeInput, subtotal, isFirstOrder);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponSuccess(res.message);
      track('coupon_applied', {
        code: res.coupon.code,
        discount_amount: res.discountAmount,
        subtotal
      });
      setCouponCodeInput('');
      setShowCustomCoupon(false);
    } else {
      setCouponError(res.message);
    }
  };

  // 15-minute reservation timer state
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds

  useEffect(() => {
    if (isCartOpen) {
      track('cart_viewed', {
        item_count: items.length,
        subtotal,
        currency: 'INR',
      });
    }

    if (isCartOpen && items.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCartOpen, items.length, subtotal]);

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

    const createOrderRecord = async (method: 'upi' | 'razorpay') => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          shipping_address: shippingAddress,
          destination_pincode: destPincode,
          payment_method: method,
          payment_reference: method === 'upi' && utrNumber.trim() ? utrNumber.trim() : undefined,
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
          items: items.map((i) => ({
            product_id: i.product_id,
            sku: i.sku,
            quantity: i.quantity,
            unit_price_inr: i.unit_price_inr,
            unit_of_measure: i.unit_of_measure,
            title: i.title,
            estimated_weight_kg: i.estimated_weight_kg,
            item_key: i.item_key
          }))
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to place order. Please try again.');
      return data.order;
    };

    const submitFinalOrder = async (method: 'upi' | 'razorpay', existingOrder?: any) => {
      try {
        const order = existingOrder || await createOrderRecord(method);
        if (order) {
          setConfirmedOrder(order);
          setStep('success');
          clearCart();
          track(order.status === 'paid' ? 'purchase' : 'order_submitted', {
            value: Number(order.total_amount_inr || order.grand_total_inr || total),
            currency: 'INR',
            item_count: items.length,
            payment_method: method,
          });

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
              order_number: order.order_number,
              date: order.created_at || new Date().toISOString(),
              total: order.total_amount_inr || order.grand_total_inr || total,
              status: order.status || 'pending_payment',
              items_count: items.length,
              first_item_title: items[0]?.title || 'Farm Produce',
              image_url: resolveImg(items[0]?.sku),
              items: orderItemsList,
              payment_method: method,
              customer_phone: customerPhone,
              tracking_reference: order.tracking_reference || ''
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
        }
      } catch (error) {
        setOrderError(error instanceof Error ? error.message : 'Network error while placing order.');
      } finally {
        setIsSubmitting(false);
      }
    };

    // If Razorpay (Card / NetBanking / Online), launch Razorpay Checkout modal
    if (paymentMethod === 'card') {
      try {
        const order = await createOrderRecord('razorpay');
        const rzpRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_number: order.order_number })
        });

        const rzpData = await rzpRes.json();
        if (!rzpData.success) {
          setOrderError(rzpData.error || 'Failed to initialize Razorpay checkout. Please try again or switch to UPI.');
          setIsSubmitting(false);
          return;
        }

        if (typeof (window as any).Razorpay === 'undefined') {
          setOrderError('Razorpay checkout script is still loading. Please retry in a few seconds or switch to UPI / QR Code.');
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency || 'INR',
          name: 'FreshRoots Export',
          description: `Order for ${items.length} Farm Item${items.length > 1 ? 's' : ''}`,
          image: '/products/tiptur-ball-copra.jpg',
          order_id: rzpData.orderId,
          handler: async function (response: any) {
            let verifiedOrder: any;
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyData.success || !verifyData.verified) {
                setOrderError(
                  `Payment verification failed: ${verifyData.error || 'Invalid signature'}. If your account was debited, contact WhatsApp support (+91 95911 42548) with Payment ID ${response.razorpay_payment_id}.`
                );
                setIsSubmitting(false);
                return;
              }
              verifiedOrder = verifyData.order;
            } catch (verifyErr) {
              console.warn('Razorpay signature verify warning:', verifyErr);
              setOrderError('Payment verification check could not reach server. Please contact support.');
              setIsSubmitting(false);
              return;
            }
            await submitFinalOrder('razorpay', verifiedOrder);
          },
          prefill: {
            name: customerName,
            email: customerEmail || '',
            contact: customerPhone
          },
          theme: {
            color: '#3b6d11'
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setOrderError(
                'Payment Cancelled: You closed the Razorpay payment window before completing payment. Your cart items are preserved. You can retry with Razorpay or switch to UPI / QR code.'
              );
            }
          }
        };

        const rzpInstance = new (window as any).Razorpay(options);

        rzpInstance.on('payment.failed', function (resp: any) {
          const reason = resp.error?.description || resp.error?.reason || 'Transaction declined or failed at bank/UPI.';
          console.warn('Razorpay payment failed:', resp.error);
          setIsSubmitting(false);
          setOrderError(
            `Payment Failed: ${reason}. Your produce items remain safely in your cart. You can retry or choose Direct UPI.`
          );
        });

        track('payment_initiated', { payment_method: 'razorpay', value: finalTotal, currency: 'INR' });
        rzpInstance.open();
        return;
      } catch (rzpInitErr: any) {
        console.warn('Razorpay checkout init failed, falling back:', rzpInitErr);
        setOrderError('Payment gateway could not be reached. Please check your internet or switch to UPI.');
        setIsSubmitting(false);
        return;
      }
    }

    // Direct UPI or Fallback
    track('payment_initiated', { payment_method: 'direct_upi', value: finalTotal, currency: 'INR' });
    await submitFinalOrder('upi');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
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
              type="button"
              aria-label="Close cart"
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

                    {/* 1-Tap Farm Savings & Coupons - Shown only for 1st order */}
                    {isFirstOrder && (
                      <div className="pt-3 border-t border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                            <Tag className="w-3.5 h-3.5 text-emerald-700" />
                            <span>1st Order Welcome Gift (₹100 OFF)</span>
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
                              placeholder="Enter promo code (e.g. FIRST100)"
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
                    )}
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* 1-Tap "Need Help? Order via WhatsApp Voice" Banner */}
                <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-stone-50 border border-emerald-300 rounded-2xl p-3.5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-stone-900 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Mic className="w-5 h-5 text-stone-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                          {isKannada ? 'ಸಹಾಯ ಬೇಕೇ? ವಾಟ್ಸಾಪ್ ವಾಯ್ಸ್ ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ' : 'Need Help? Order via WhatsApp Voice'}
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-950 font-black text-[9px] uppercase rounded-full tracking-wide">
                          1-Tap Fast
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        {isKannada
                          ? 'ವಿಳಾಸ ಟೈಪ್ ಮಾಡಲು ಕಷ್ಟವೇ ಅಥವಾ ಗೊಂದಲವಿದೆಯೇ? 1-ಟ್ಯಾಪ್ ಮೂಲಕ ನಿಮ್ಮ ಕಾರ್ಟ್ ಅನ್ನು ಶರತ್ ಅವರಿಗೆ ಕಳುಹಿಸಿ. ನಾವು ಫೋನ್ ಅಥವಾ ಆಡಿಯೋ ಮೂಲಕ ನಿಮ್ಮ ವಿಳಾಸ ಪಡೆಯುತ್ತೇವೆ.'
                          : "Confused or don't want to type your address? 1 tap opens WhatsApp with your cart items pre-filled so Sharath's desk can take your address over phone or voice."}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <a
                          href={waVoiceCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-stone-900 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition transform active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4 fill-stone-900" />
                          <span>
                            {isKannada
                              ? `ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಆರ್ಡರ್ (${items.length} ಉತ್ಪನ್ನಗಳು)`
                              : `Order via WhatsApp Voice (${items.length} ${items.length === 1 ? 'item' : 'items'})`}
                          </span>
                        </a>
                        <a
                          href="tel:919591142548"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-emerald-800 px-2 py-1 rounded-lg hover:bg-stone-100 transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                          <span>9591142548</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200/90 p-2.5 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Quality Guarantee: Broken or cracked nuts replaced at zero cost.</span>
                </div>

                {hasPerishable && (
                  <div className="bg-emerald-50/90 border border-emerald-300 p-3 rounded-xl text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{isKannada ? 'ಲೈವ್ ಸಸಿಗಳು & ಎಳನೀರು ಸಾಗಾಟ ಮಾಹಿತಿ' : 'Live Nursery & Perishable Dispatch Notice'}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {isKannada
                        ? 'ನಿಮ್ಮ ಕಾರ್ಟ್‌ನಲ್ಲಿ ಜೀವಂತ ತೆಂಗಿನ ಸಸಿಗಳು ಅಥವಾ ಎಳನೀರು ಇವೆ. ವಾರಾಂತ್ಯದಲ್ಲಿ ಕೊರಿಯರ್ ವಿಳಂಬವಾಗದಂತೆ ಸೋಮವಾರ ಹಾಗೂ ಬುಧವಾರ ಮಾತ್ರ ನೇರ ಫಾರ್ಮ್‌ನಿಂದ ಪ್ಯಾಕ್ ಮಾಡಿ ಕಳುಹಿಸಲಾಗುತ್ತದೆ. 100% ಸುರಕ್ಷಿತ ತಲುಪುವ ಖಾತರಿ.'
                        : 'Your cart contains live saplings or fresh tender coconuts. Dispatched Mondays & Wednesdays in moisture-locked packaging to avoid weekend courier delays. 100% live arrival guarantee.'}
                    </p>
                  </div>
                )}

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

                {/* Live Sapling Shipping Radius Warning */}
                {hasSaplingInCart && isDistantStatePincode && (
                  <div className="p-3 bg-amber-50/95 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Live Sapling Transit Notice (PIN: {destPincode})</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {isKannada
                        ? 'ಲೈವ್ ಸಸಿಗಳು ಕರ್ನಾಟಕ ಮತ್ತು ದಕ್ಷಿಣ ಭಾರತಕ್ಕೆ (48-72 ಗಂಟೆ) ಸುರಕ್ಷಿತವಾಗಿ ತಲುಪುತ್ತವೆ. ದೂರದ ರಾಜ್ಯಗಳಿಗೆ ಸಸಿಗಳ ಬೇರು ಬದುಕುಳಿಯುವ ಖಾತರಿ ಸೀಮಿತವಾಗಿದೆ. ದಯವಿಟ್ಟು ಆರ್ಡರ್ ಮಾಡುವ ಮೊದಲು ಶರತ್ ಅವರೊಂದಿಗೆ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ.'
                        : 'Root-ball saplings require moist nutrient soil balls that withstand transit best within Karnataka & South India (48–72h). For distant states, express crate packaging is required. Please coordinate with Sharath on WhatsApp (9591142548) to ensure zero root mortality.'}
                    </p>
                  </div>
                )}

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
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                    <span>Select Payment Mode</span>
                    <span className="text-[10px] text-emerald-700 font-extrabold uppercase">100% Prepaid Secure</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'upi'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-600'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-emerald-700" />
                      <span className="text-xs font-bold">UPI / QR Code</span>
                      <span className="text-[10px] text-stone-500">Google Pay, PhonePe, Paytm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 relative ${
                        paymentMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-600'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-700" />
                      <span className="text-xs font-bold">Razorpay Gateway</span>
                      <span className="text-[10px] text-stone-500">Cards, NetBanking, UPI</span>
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-emerald-700 text-white text-[9px] font-black rounded-full uppercase tracking-wider">
                        Razorpay
                      </span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800">Razorpay Secured Checkout</span>
                        <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                          {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'Live API Key' : 'Test API Key'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Clicking <strong>Confirm &amp; Pay</strong> launches the official Razorpay Checkout popup supporting <strong>Credit/Debit Cards, NetBanking, UPI, and Wallets</strong>.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 font-medium">Farm Direct UPI VPA:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                            {farmUpiId}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(farmUpiId);
                              setUpiCopied(true);
                              setTimeout(() => setUpiCopied(false), 2000);
                            }}
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 transition"
                            title="Copy UPI ID"
                          >
                            {upiCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <a
                        href={upiPayLink}
                        className="inline-flex w-full items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold py-2 rounded-lg text-xs transition shadow-xs active:scale-98"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Tap to Launch UPI App (GPay / PhonePe / Paytm)</span>
                      </a>

                      {/* Dynamic Scannable QR Code */}
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-stone-200">
                        <img
                          src={upiQrCodeUrl}
                          alt="Scan to Pay via UPI"
                          className="w-20 h-20 object-contain rounded-lg border border-stone-100 shrink-0"
                        />
                        <div className="text-[11px] text-stone-600 leading-snug">
                          Scan with any phone camera or banking app (<strong>GPay, PhonePe, Paytm, BHIM</strong>) for direct farm account settlement.
                        </div>
                      </div>

                      {/* Optional UTR / Reference ID */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1 flex justify-between">
                          <span>UPI Reference / UTR Number (Optional)</span>
                          <span className="text-[10px] text-stone-400 font-normal">12-digit bank ref</span>
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                          placeholder="e.g. 429381928472"
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                  {/* Visual Trust Seal under UPI Payment */}
                  <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-amber-50/70 border border-emerald-300/90 text-xs shadow-2xs space-y-1.5">
                    <div className="flex items-start gap-2 text-emerald-950 font-extrabold">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="text-[11px] sm:text-xs leading-tight">
                        100% Money-Back &amp; Spoilage Guarantee • FreshRoots Export
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 leading-normal pl-6">
                      {isKannada
                        ? 'ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ ನೇರ ಫಾರ್ಮ್ ಆರ್ಡರ್: ತಾಜಾ ಕಾಯಿ ಹಾಳಾಗುವುದನ್ನು ತಪ್ಪಿಸಲು COD ಇರಿಸಿಲ್ಲ. ಸಾಗಾಟದಲ್ಲಿ ಯಾವುದೇ ಕಾಯಿ ಒಡೆದಿದ್ದರೆ ಅಥವಾ ಹಾನಿಯಾಗಿದ್ದರೆ, ತಕ್ಷಣ ಪೂರ್ಣ ಮರುಪಾವತಿ (100% Refund) ಅಥವಾ ಉಚಿತ ಬದಲಿ ಕಾಯಿ ಕಳುಹಿಸುತ್ತೇವೆ.'
                        : 'Zero risk direct farm harvest: COD is disabled to prevent fresh nuts sitting in courier hubs. If any coconut arrives cracked, broken, or spoiled during transit, get an instant 100% money-back refund or free replacement on WhatsApp.'}
                    </p>
                    <div className="pl-6 flex items-center gap-3 pt-0.5 text-[10px] font-bold text-emerald-900">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Direct Farm Gate Dispatched
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        100% Instant Resolution
                      </span>
                    </div>
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
                  <div className="p-3.5 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs space-y-2.5 shadow-xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium leading-relaxed">{orderError}</div>
                    </div>

                    {(orderError.includes('Payment Cancelled') ||
                      orderError.includes('Payment Failed') ||
                      orderError.includes('Payment verification') ||
                      orderError.includes('gateway')) && (
                      <div className="pt-2 border-t border-red-200/80 space-y-2">
                        <div className="text-[11px] text-stone-700 font-semibold flex items-center justify-between">
                          <span>What would you like to do next?</span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            Cart Items Saved
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod('upi');
                              setOrderError(null);
                            }}
                            className="px-2.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Switch to UPI QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderError(null)}
                            className="px-2.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Payment</span>
                          </button>
                        </div>
                        <a
                          href={`https://wa.me/919591142548?text=${encodeURIComponent(
                            `Hi Sharath, I faced a payment issue during checkout for ₹${finalTotal}. Please assist me with manual order booking.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>WhatsApp Farm Desk (+91 9591142548)</span>
                        </a>
                      </div>
                    )}

                    {orderError.includes('no longer available') && (
                      <div className="pt-1.5 border-t border-red-200/80 flex items-center justify-between">
                        <span className="text-[11px] text-stone-600">Cart contains an older catalog batch item.</span>
                        <button
                          type="button"
                          onClick={() => {
                            clearCart();
                            setOrderError(null);
                            setStep('cart');
                          }}
                          className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-[10px] transition"
                        >
                          Refresh Cart
                        </button>
                      </div>
                    )}
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
                  <h3 className="text-lg font-extrabold text-stone-900">
                    {confirmedOrder.status === 'paid' ? 'Payment Confirmed!' : 'Order Received — Payment Pending'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Order Reference: <strong className="font-mono text-emerald-800">{confirmedOrder.order_number}</strong>
                  </p>
                  {confirmedOrder.status !== 'paid' && (
                    <p className="text-xs text-amber-800 mt-2">
                      We will confirm your order after verifying the UPI payment. Please keep the reference number handy.
                    </p>
                  )}
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-stone-500">{confirmedOrder.status === 'paid' ? 'Amount Paid:' : 'Order Total:'}</span>
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
                    {confirmedOrder.status === 'paid'
                      ? 'Payment is confirmed. We will send delivery updates to '
                      : 'Your order is saved, but it will not be dispatched until payment is verified. Contact the farm desk at '}
                    <strong>{confirmedOrder.customer_phone}</strong>.
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <a
                    href={
                      confirmedOrder.whatsapp_alert_url ||
                      `https://wa.me/919591142548?text=${encodeURIComponent(
                        `Hi Sharath, I have placed order #${confirmedOrder.order_number} for ₹${confirmedOrder.total_amount_inr}. Please confirm dispatch.`
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-stone-900 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xs active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-stone-900" />
                    <span>📲 Confirm &amp; Track on WhatsApp Desk</span>
                  </a>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsInvoiceModalOpen(true)}
                      className="flex-1 py-2.5 bg-[#3b6d11] hover:bg-[#2d5a0b] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View GST Invoice</span>
                    </button>
                    <button
                      onClick={() => {
                        setStep('cart');
                        setIsCartOpen(false);
                      }}
                      className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                    >
                      Continue Shopping
                    </button>
                  </div>
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
                {estimatedTax > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Estimated tax</span>
                    <span className="font-mono">₹{Math.round(estimatedTax).toLocaleString('en-IN')}</span>
                  </div>
                )}
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
                onClick={() => {
                  track('begin_checkout', { value: subtotal, currency: 'INR', item_count: items.length });
                  setStep('checkout');
                }}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Delivery & Payment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          )}
        </div>
      </div>

      <GstInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={confirmedOrder}
      />
    </div>
  );
}
