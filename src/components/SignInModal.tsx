'use client';

import React, { useState } from 'react';
import { Phone, X, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignInModal() {
  const { isSignInModalOpen, setIsSignInModalOpen, signIn } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isSignInModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 4) {
      setErrorMsg('Please enter the 4-digit verification code');
      return;
    }
    signIn(phoneNumber.replace(/\D/g, ''));
    setStep('phone');
    setPhoneNumber('');
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
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95"
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

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Mobile Phone Number
              </label>
              <div className="flex rounded-xl border border-stone-300 focus-within:ring-2 focus-within:ring-[#3b6d11] focus-within:border-transparent overflow-hidden">
                <div className="bg-stone-50 px-3.5 py-3 border-r border-stone-200 flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  autoFocus
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-3 text-sm font-semibold font-mono text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || phoneNumber.length < 10}
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
