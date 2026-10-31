'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Smartphone, Key, ArrowLeft, Lock } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [loginMethod, setLoginMethod] = useState<'totp' | 'password'>('totp');
  const [pinInput, setPinInput] = useState('');
  const [totpInput, setTotpInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(redirectPath);
        }
      })
      .catch(() => {});
  }, [redirectPath, router]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setPinError(false);
    setErrorMsg('');

    try {
      const payload = loginMethod === 'totp'
        ? { totp: totpInput.trim() }
        : { password: pinInput.trim() };

      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Sign-in failed. Please verify credentials.');
      }

      // Hard navigation to ensure all admin state and cookies initialize cleanly
      window.location.href = redirectPath;
    } catch (err: any) {
      setPinError(true);
      setErrorMsg(err.message || 'Invalid administrator password or Google Authenticator code');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
        <ShieldCheck className="w-7 h-7 text-lime-400" />
      </div>

      <div>
        <h1 className="text-xl font-black text-white">Operations Desk Login</h1>
        <p className="text-xs text-stone-400 mt-1">FreshRoots Export Administration</p>
      </div>

      {/* Login Method Toggle */}
      <div className="grid grid-cols-2 gap-1.5 bg-stone-900 p-1 rounded-2xl border border-stone-700/80">
        <button
          type="button"
          onClick={() => {
            setLoginMethod('totp');
            setPinError(false);
            setErrorMsg('');
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
            setErrorMsg('');
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

      <form onSubmit={handlePinSubmit} className="space-y-4">
        {loginMethod === 'totp' ? (
          <div>
            <label className="block text-[11px] font-semibold text-stone-300 text-left mb-1.5">
              Enter 6-Digit Google Authenticator Code:
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              required
              value={totpInput}
              onChange={(e) => {
                setTotpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                setPinError(false);
                setErrorMsg('');
              }}
              placeholder="000 000"
              className={`w-full px-4 py-3 rounded-xl bg-stone-900 border text-center text-xl font-mono tracking-[0.35em] text-white focus:outline-none transition ${
                pinError
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/50'
                  : 'border-stone-700 focus:ring-2 focus:ring-emerald-500/50'
              }`}
            />
            <p className="text-[11px] text-stone-500 text-left mt-1.5">
              Open Google Authenticator on your phone and enter the active 6-digit code for FreshRoots.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-semibold text-stone-300 text-left mb-1.5">
              Master Admin Password:
            </label>
            <input
              type="password"
              autoFocus
              required
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
                setErrorMsg('');
              }}
              placeholder="Enter operations desk password"
              className={`w-full px-4 py-3 rounded-xl bg-stone-900 border text-sm text-white focus:outline-none transition ${
                pinError
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/50'
                  : 'border-stone-700 focus:ring-2 focus:ring-emerald-500/50'
              }`}
            />
          </div>
        )}

        {pinError && (
          <p className="text-xs text-red-400 font-medium bg-red-950/40 p-2.5 rounded-xl border border-red-900/50">
            {errorMsg || 'Access denied. Please check your credentials.'}
          </p>
        )}

        <button
          type="submit"
          disabled={isSigningIn || (loginMethod === 'totp' ? totpInput.length < 6 : !pinInput.trim())}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm py-3 rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>{isSigningIn ? 'Verifying Credentials…' : 'Access Operations Desk'}</span>
        </button>
      </form>

      <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between text-xs text-stone-400">
        <Link href="/" className="hover:text-emerald-400 flex items-center gap-1 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </Link>
        <span className="text-[10px] text-stone-500 font-mono">Protected by 2FA TOTP</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-3xl p-8 text-center text-stone-300 text-sm">
            Loading Operations Desk Login…
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
