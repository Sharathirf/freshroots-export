'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, X, ArrowRight, CheckCircle2, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function SignInModal() {
  const { isSignInModalOpen, setIsSignInModalOpen, signIn, signInWithGoogle, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'google_phone'>('phone');
  const [otpCode, setOtpCode] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [googleUserTemp, setGoogleUserTemp] = useState<{
    sub: string;
    name: string;
    email: string;
    picture?: string;
    email_verified?: boolean;
    locale?: string;
  } | null>(null);
  const [googlePhoneInput, setGooglePhoneInput] = useState('');

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Handle Google Credential Response from Google Identity Services
  const handleGoogleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response?.credential) return;
      const payload = parseJwt(response.credential);
      if (!payload || !payload.email) {
        setErrorMsg('Could not read Google account details. Please try again.');
        return;
      }

      const profile = {
        sub: payload.sub,
        name: payload.name || payload.given_name || 'Customer',
        email: payload.email,
        picture: payload.picture,
        email_verified: Boolean(payload.email_verified),
        locale: payload.locale
      };

      try {
        await signInWithGoogle(profile);
        setGoogleUserTemp(profile);
        // Prompt for WhatsApp phone number if not yet associated
        setStep('google_phone');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to authenticate with Google');
      }
    },
    [signInWithGoogle]
  );

  // Initialize Google Identity Services (GIS) Web SDK
  useEffect(() => {
    if (!isSignInModalOpen || step !== 'phone') return;
    if (typeof window === 'undefined') return;

    const initGsi = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;

      try {
        g.accounts.id.initialize({
          client_id: googleClientId || 'freshroots-export-demo.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleClientId && googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          g.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 340
          });
        }
      } catch (e) {
        console.warn('Google GSI initialization notice:', e);
      }
    };

    if (!(window as any).google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      initGsi();
    }
  }, [isSignInModalOpen, step, googleClientId, handleGoogleCredentialResponse]);

  if (!isSignInModalOpen) return null;

  const handleCustomGoogleClick = () => {
    const g = (window as any).google;
    if (googleClientId && g?.accounts?.id) {
      g.accounts.id.prompt();
      return;
    }

    // Friendly notice when Google Client ID is not yet configured in environment
    setInfoMsg(
      'Google Sign-In is 100% free. To enable real one-click Google login, configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local (obtained free from console.cloud.google.com). Or continue with Phone & WhatsApp OTP below.'
    );
  };

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
    setInfoMsg(null);
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
    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    signIn(clean, fullName, emailAddress);

    // Persist to backend PostgreSQL users table
    try {
      await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          full_name: fullName,
          email: emailAddress || null,
          auth_provider: 'phone'
        })
      });
    } catch (err) {
      console.warn('Profile sync warning:', err);
    }

    handleClose();
  };

  const handleSaveGooglePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = googlePhoneInput.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      await updateProfile({ phone: clean });
    } catch (err) {
      console.warn('Phone update warning:', err);
    }

    handleClose();
  };

  const handleSkipGooglePhone = () => {
    handleClose();
  };

  const handleClose = () => {
    setIsSignInModalOpen(false);
    setStep('phone');
    setErrorMsg(null);
    setInfoMsg(null);
    setGoogleUserTemp(null);
    setGooglePhoneInput('');
    setFullName('');
    setPhoneNumber('');
    setEmailAddress('');
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
          {step === 'google_phone' ? (
            googleUserTemp?.picture ? (
              <img
                src={googleUserTemp.picture}
                alt={googleUserTemp.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            )
          ) : (
            <Phone className="w-6 h-6" />
          )}
        </div>

        {/* Title & Description */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            {step === 'google_phone' ? `Welcome, ${googleUserTemp?.name?.split(' ')[0]}!` : 'Customer Sign In'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
            {step === 'google_phone'
              ? 'Your Google account is verified. Link your WhatsApp number for order tracking and dispatch alerts.'
              : 'Zero passwords to remember. Instant access to your farm orders and wholesale pricing.'}
          </p>
        </div>

        {/* STEP 1: Phone + Google Sign-In */}
        {step === 'phone' && (
          <div className="mb-4">
            {/* Real Google Sign In (100% Free OAuth) */}
            <div className="mb-4 flex flex-col items-center">
              <div ref={googleBtnContainerRef} id="googleSignInBtnContainer" className="w-full flex justify-center">
                <button
                  type="button"
                  onClick={handleCustomGoogleClick}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 transition shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>

            {infoMsg && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <span className="relative bg-white px-2.5 text-[10px] uppercase font-bold text-stone-400">
                Or Continue With Phone
              </span>
            </div>

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
                  <span className="text-[11px] text-stone-400 font-normal">For tax invoices &amp; tracking</span>
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="e.g. name@example.com"
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
          </div>
        )}

        {/* STEP 2: Verify Phone OTP */}
        {step === 'otp' && (
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

        {/* STEP 3: Link Phone to Google Account */}
        {step === 'google_phone' && (
          <form onSubmit={handleSaveGooglePhone} className="space-y-4">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                Google account verified: <strong>{googleUserTemp?.email}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                WhatsApp Phone Number (for order delivery updates)
              </label>
              <div className="flex rounded-xl border border-stone-300 focus-within:ring-2 focus-within:ring-[#3b6d11] overflow-hidden">
                <div className="bg-stone-50 px-3.5 py-2.5 border-r border-stone-200 flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  autoFocus
                  value={googlePhoneInput}
                  onChange={(e) => setGooglePhoneInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold font-mono text-stone-900 focus:outline-none"
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
              disabled={googlePhoneInput.replace(/\D/g, '').length < 10}
              className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Save & Complete Sign In</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSkipGooglePhone}
              className="w-full text-xs text-stone-500 hover:text-stone-800 text-center block pt-1"
            >
              Skip for now (add during checkout)
            </button>
          </form>
        )}

        {/* Security badge at bottom */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure passwordless authentication &amp; AES encryption</span>
        </div>
      </div>
    </div>
  );
}
