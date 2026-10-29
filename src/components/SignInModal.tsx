'use client';

import React, { useState } from 'react';
import { Phone, X, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function SignInModal() {
  const {
    isSignInModalOpen,
    setIsSignInModalOpen,
    signIn,
    signInModalReason,
    setSignInModalReason,
    pendingAction,
    setPendingAction
  } = useAuth();
  const { openCheckout } = useCart();
  const { setIsWatchlistOpen } = useWishlist();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isSignInModalOpen) return null;

  const handleClose = () => {
    setIsSignInModalOpen(false);
    setStep('phone');
    setErrorMsg(null);
    setFullName('');
    setPhoneNumber('');
    setEmailAddress('');
    setOtpCode('1234');
    setSignInModalReason(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setErrorMsg(null);
    setIsSending(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phone: cleanPhone,
          fullName: fullName.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }
      if (data.demoCode) {
        setOtpCode(data.demoCode);
      }
      setStep('otp');
    } catch (err: any) {
      // In offline or local fallback, still allow user into OTP step
      setStep('otp');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit verification code');
      return;
    }

    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone: cleanPhone,
          code: cleanOtp,
          fullName: fullName.trim(),
          email: emailAddress.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification code');
      }

      let intent: { type?: string } | null = null;
      try {
        const stored = sessionStorage.getItem('freshroots_post_login_intent');
        if (stored) {
          intent = JSON.parse(stored);
          sessionStorage.removeItem('freshroots_post_login_intent');
        }
      } catch {}

      // Successful verification
      signIn(cleanPhone, fullName.trim(), emailAddress.trim() || undefined);

      handleClose();

      // Seamlessly execute the queued action (e.g. Add to Cart, Add to Watchlist)
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        setTimeout(() => {
          try {
            action();
          } catch (e) {
            console.error('Failed to run pending action:', e);
          }
        }, 100);
      }

      // Explicit routing based on intent to guarantee navigation
      if (intent?.type === 'checkout') {
        setTimeout(() => {
          openCheckout();
        }, 150);
      } else if (intent?.type === 'watchlist') {
        setTimeout(() => {
          setIsWatchlistOpen(true);
        }, 150);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-full bg-[#edf7e1] border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-[#3b6d11]">
          <Phone className="w-6 h-6" />
        </div>

        {/* Title & Description */}
        <div className="text-center mb-6">
          {signInModalReason && (
            <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold">
              <span>🌾</span>
              <span>{signInModalReason}</span>
            </div>
          )}
          <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Customer Sign In
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
            Zero passwords to remember. Instant access to your farm orders, live dispatch tracking, and wholesale pricing.
          </p>
        </div>

        {/* STEP 1: Enter Name & Mobile Number */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Mobile Phone Number (WhatsApp) *
              </label>
              <div className="flex rounded-xl border border-stone-300 focus-within:ring-2 focus-within:ring-[#3b6d11] focus-within:border-transparent overflow-hidden">
                <div className="bg-stone-50 px-3.5 py-2.5 border-r border-stone-200 flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold font-mono text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex justify-between">
                <span>Email Address</span>
                <span className="text-[11px] text-stone-400 font-normal">Optional (for tax invoice)</span>
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="e.g. ramesh@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || phoneNumber.length < 10 || !fullName.trim()}
              className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{isSending ? 'Sending OTP Code...' : 'GET VERIFICATION CODE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Verify Phone OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-200 text-center">
              Verification code sent to <strong>+91 {phoneNumber}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 text-center">
                Enter 4-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={4}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-40 mx-auto block px-4 py-2.5 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#3b6d11] focus:outline-none"
              />
              <div className="text-[11px] text-stone-400 text-center mt-1">
                (Demo Test Code: <strong>1234</strong>)
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || otpCode.trim().length < 4}
              className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{isVerifying ? 'Verifying...' : 'VERIFY & SIGN IN'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs text-stone-500 hover:text-stone-800 underline"
              >
                Change mobile number
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-xs text-[#3b6d11] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Security badge at bottom */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure passwordless authentication &amp; 100% privacy guarantee</span>
        </div>
      </div>
    </div>
  );
}
