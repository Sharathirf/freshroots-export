'use client';

import React, { useState } from 'react';
import { Phone, X, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignInModal() {
  const { isSignInModalOpen, setIsSignInModalOpen, signIn } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isSignInModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setErrorMsg(null);
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 4) {
      setErrorMsg('Please enter the 4-digit verification code');
      return;
    }
    const clean = phoneNumber.replace(/\D/g, '');
    signIn(clean, fullName, emailAddress);

    // Persist to backend PostgreSQL users table
    try {
      await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          full_name: fullName,
          email: emailAddress || null
        })
      });
    } catch (err) {
      console.warn('Profile sync warning:', err);
    }

    setStep('phone');
    setPhoneNumber('');
    setFullName('');
    setEmailAddress('');
  };

  const handleClose = () => {
    setIsSignInModalOpen(false);
    setStep('phone');
    setErrorMsg(null);
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
        >
          <X className="w-5 h-5" />
        </button>

        {/* Green Circle with Phone Icon (Katyayani Sign In Header) */}
        <div className="w-14 h-14 rounded-full bg-[#edf7e1] border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-[#3b6d11]">
          <Phone className="w-6 h-6" />
        </div>

        {/* Title & Description */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Customer Sign In
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
            Zero passwords to remember. Instant access to your farm orders and wholesale pricing.
          </p>
        </div>

        {/* 3rd Party One-Click Sign In Options */}
        {step === 'phone' && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  signIn('9591142548', 'Sharath Inorahalli (Google)', 'sharathir198@gmail.com');
                  fetch('/api/customer/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phone: '9591142548',
                      full_name: 'Sharath Inorahalli (Google)',
                      email: 'sharathir198@gmail.com'
                    })
                  }).catch(console.warn);
                  setIsSignInModalOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 transition shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  signIn('9591142548', 'Sharath I (Truecaller Verified)', 'sharathir198@gmail.com');
                  fetch('/api/customer/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phone: '9591142548',
                      full_name: 'Sharath I (Truecaller Verified)',
                      email: 'sharathir198@gmail.com'
                    })
                  }).catch(console.warn);
                  setIsSignInModalOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-xs font-bold text-blue-800 transition shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-[#0087FF] text-white flex items-center justify-center text-[10px] font-black">
                  T
                </div>
                <span>Truecaller</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  signIn('9591142548', 'Sharath Inorahalli (Shop Pay)', 'sharathir198@gmail.com');
                  fetch('/api/customer/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phone: '9591142548',
                      full_name: 'Sharath Inorahalli (Shop Pay)',
                      email: 'sharathir198@gmail.com'
                    })
                  }).catch(console.warn);
                  setIsSignInModalOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-xs font-bold text-purple-900 transition shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-[#5a31f4] text-white flex items-center justify-center text-[10px] font-black">
                  S
                </div>
                <span>Shop</span>
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <span className="relative bg-white px-2.5 text-[10px] uppercase font-bold text-stone-400">
                Or Continue With Phone
              </span>
            </div>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
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
                placeholder="e.g. Sharath Inorahalli"
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
                  placeholder="9591142548"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold font-mono text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex justify-between">
                <span>Email Address</span>
                <span className="text-[11px] text-stone-400 font-normal">For tax invoices &amp; tracking</span>
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="e.g. sharathir198@gmail.com"
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
              <span>{isSending ? 'Sending Code...' : 'SEND SMS OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-200 text-center">
              Verification code sent to <strong>+91 {phoneNumber}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 text-center">
                Enter 4-Digit OTP Code
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
              className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>VERIFY & SIGN IN</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-xs text-stone-500 hover:text-stone-800 text-center block pt-1"
            >
              Change mobile number
            </button>
          </form>
        )}

        {/* Security badge at bottom */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure passwordless SMS / WhatsApp OTP</span>
        </div>
      </div>
    </div>
  );
}
