'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import TurnstileChallenge, { turnstileEnabled } from '@/components/TurnstileChallenge';
import { track } from '@/lib/analytics';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProduceTitle?: string;
}

export default function EnquiryModal({ isOpen, onClose, defaultProduceTitle }: EnquiryModalProps) {
  const { customer, isLoggedIn, signIn } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState(
    defaultProduceTitle ? `Interested in direct farm lot of ${defaultProduceTitle}. Please share mandi rates and minimum dispatch timeline.` : ''
  );

  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otpCode, setOtpCode] = useState('1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  // Auto-fill details if customer is already verified/logged in
  useEffect(() => {
    if (customer && isOpen) {
      if (customer.name) setName(customer.name);
      if (customer.phone) setPhone(customer.phone);
      if (customer.email) setEmail(customer.email);
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleThirdPartySignIn = async (provider: 'google' | 'truecaller' | 'shop') => {
    setIsSubmitting(true);
    setErrorMsg(null);

    // Realistic simulation of 3rd party SDK authentication
    setTimeout(async () => {
      let mockName = 'Sharath Inorahalli';
      let mockPhone = '9008462568';
      let mockEmail = 'sales@freshrootsexport.com';

      if (provider === 'google') {
        mockEmail = 'sales@freshrootsexport.com';
        mockName = 'Sharath Inorahalli (Google)';
      } else if (provider === 'truecaller') {
        mockPhone = '9008462568';
        mockName = 'Sharath I (Truecaller Verified)';
      } else if (provider === 'shop') {
        mockName = 'Sharath Inorahalli (Shop Pay)';
        mockEmail = 'sales@freshrootsexport.com';
      }

      setName(mockName);
      setPhone(mockPhone);
      setEmail(mockEmail);

      // Save customer session and database profile
      signIn(mockPhone, mockName, mockEmail);
      try {
        await fetch('/api/customer/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: mockPhone,
            full_name: mockName,
            email: mockEmail
          })
        });
      } catch (e) {
        console.warn('3rd party profile sync warning:', e);
      }

      setIsSubmitting(false);
    }, 700);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    if (isLoggedIn && turnstileEnabled && !turnstileToken) {
      setErrorMsg('Please complete the anti-spam check before submitting.');
      return;
    }

    setErrorMsg(null);

    // If ALREADY logged in, no OTP required! Submit enquiry immediately
    if (isLoggedIn) {
      await submitEnquiryRecord(cleanPhone.slice(-10), name.trim(), email.trim(), query.trim(), turnstileToken);
      return;
    }

    // FIRST TIME: Must display and verify OTP!
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
    }, 500);
  };

  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 4) {
      setErrorMsg('Please enter the 4-digit verification code');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const customerName = name.trim();
    const customerEmail = email.trim();

    // 1. Sign in locally and save verified details
    signIn(cleanPhone, customerName, customerEmail || undefined);

    // 2. Persist customer profile in PostgreSQL
    try {
      await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          full_name: customerName,
          email: customerEmail || null
        })
      });
    } catch (e) {
      console.warn('Profile persist warning:', e);
    }

    // 3. Submit enquiry
    if (turnstileEnabled && !turnstileToken) {
      setErrorMsg('Please complete the anti-spam check before submitting.');
      return;
    }
    await submitEnquiryRecord(cleanPhone, customerName, customerEmail, query.trim(), turnstileToken);
  };

  const submitEnquiryRecord = async (
    targetPhone: string,
    targetName: string,
    targetEmail: string,
    targetQuery: string,
    challengeToken: string
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: targetName,
          contact_phone: targetPhone,
          contact_email: targetEmail || null,
          requested_quantity: '1',
          unit: 'General Enquiry',
          product_title: 'General Farm Enquiry',
          additional_requirements: targetQuery || 'General farm inquiry',
          turnstileToken: challengeToken
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit enquiry. Please try again.');
      }
      setStep('success');
      track('rfq_submitted', { source: 'general_enquiry_modal' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('form');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={handleResetAndClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Matches Screenshot 3 */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'success' ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">
              Enquiry Received!
            </h3>
            <p className="text-stone-600 mt-2 text-sm leading-relaxed max-w-md mx-auto">
              Thank you, <span className="font-bold text-stone-900">{name}</span>. Our agri desk has logged your request and will call you back on <span className="font-bold text-stone-800">+91 {phone.replace(/\D/g, '').slice(-10)}</span> within 24 hours.
            </p>
            <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              ✓ Your profile is saved. Next time you enquire, you won&apos;t need to re-verify OTP!
            </div>
            <button
              onClick={handleResetAndClose}
              className="mt-6 w-full py-3 px-6 rounded-xl bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-sm shadow-md transition"
            >
              Done
            </button>
          </div>
        ) : step === 'otp' ? (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-[#daf1de] border border-[#a8e0b4] flex items-center justify-center text-[#1e824c] mx-auto mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                Verify Your Mobile Number
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                For first-time enquiries, please verify your WhatsApp/SMS OTP to save your farm profile.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200 text-center mb-4 font-medium">
              4-digit verification code sent to <strong>+91 {phone.replace(/\D/g, '').slice(-10)}</strong>
            </div>

            {errorMsg && (
              <div className="p-3 mb-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-40 mx-auto block px-4 py-2.5 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1e824c] focus:outline-none"
                />
                <TurnstileChallenge onToken={setTurnstileToken} />
                <div className="text-[11px] text-stone-400 text-center mt-1">
                  (Test demo OTP: <strong>1234</strong>)
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 4}
                className="w-full py-3 px-6 rounded-xl bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Verifying & Saving...' : 'VERIFY & SUBMIT ENQUIRY'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full text-xs text-stone-500 hover:text-stone-800 text-center block pt-1 font-semibold"
              >
                ← Back to edit phone number
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Header - Matches Screenshot 3 */}
            <div className="text-center mb-5">
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                Enquiry Form
              </h3>
              <div className="mt-2 text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5">
                <span className="text-[#1e824c] font-black">✓</span>
                <span>Fill in your details and we will <strong className="text-stone-900">call you back within 24 hours.</strong></span>
              </div>
            </div>

            {/* 3rd Party Instant Sign In options (when not logged in) */}
            {!isLoggedIn && (
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleThirdPartySignIn('google')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-[11px] font-bold text-stone-700 transition shadow-sm"
                    title="Sign in with Google"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Truecaller */}
                  <button
                    type="button"
                    onClick={() => handleThirdPartySignIn('truecaller')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-[11px] font-bold text-blue-800 transition shadow-sm"
                    title="1-Click Verify with Truecaller"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#0087FF] text-white flex items-center justify-center text-[9px] font-black">
                      T
                    </div>
                    <span>Truecaller</span>
                  </button>

                  {/* Shop.com / Shop Pay */}
                  <button
                    type="button"
                    onClick={() => handleThirdPartySignIn('shop')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-[11px] font-bold text-purple-900 transition shadow-sm"
                    title="Sign in with Shop Pay / Shop.com"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#5a31f4] text-white flex items-center justify-center text-[9px] font-black">
                      S
                    </div>
                    <span>Shop</span>
                  </button>
                </div>

                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                  </div>
                  <span className="relative bg-white px-2 text-[10px] uppercase font-bold text-stone-400">
                    Or Enter Details Below
                  </span>
                </div>
              </div>
            )}

            {isLoggedIn && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                <span>✓ Verified Customer ({customer?.name})</span>
                <span className="text-[11px] text-emerald-700 underline cursor-pointer" onClick={() => setName('')}>
                  Edit
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Form Fields - Matches Screenshot 3 */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#1e824c] focus:outline-none transition placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#1e824c] focus:outline-none transition placeholder:text-stone-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                  <span>Email</span>
                  <span className="text-stone-400 font-normal">Optional</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#1e824c] focus:outline-none transition placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Query
                </label>
                <textarea
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tell us what you need help with..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#1e824c] focus:outline-none transition placeholder:text-stone-400 resize-none"
                />
              </div>

              {isLoggedIn && <TurnstileChallenge onToken={setTurnstileToken} />}

              {/* Submit Button - Matches Screenshot 3 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : isLoggedIn
                    ? 'Submit Enquiry'
                    : 'Submit Enquiry'}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Footer - Matches Screenshot 3 */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-stone-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#1e824c]" />
                <span>We never sell your data</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
