'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AdminTotpSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  setupData: {
    formattedSecret: string;
    rawSecret: string;
    account: string;
    issuer: string;
    qrDataUrl: string;
  } | null;
}

export default function AdminTotpSetupModal({ isOpen, onClose, setupData }: AdminTotpSetupModalProps) {
  const [copied, setCopied] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [testing, setTesting] = useState(false);

  if (!isOpen || !setupData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(setupData.rawSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testCode.length !== 6) return;
    setTesting(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totp: testCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult('valid');
      } else {
        setTestResult('invalid');
      }
    } catch {
      setTestResult('invalid');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Google Authenticator Setup</h2>
            <p className="text-xs text-stone-400">Time-based One-Time Password (TOTP)</p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 text-xs text-stone-300">
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700 space-y-1.5">
            <p className="font-semibold text-stone-200">
              1. Open <strong>Google Authenticator</strong> (or 1Password / Apple Passwords) on your phone.
            </p>
            <p className="text-stone-400">
              2. Tap <span className="text-lime-300 font-bold">+</span> and choose <strong>Scan a QR code</strong>.
            </p>
          </div>

          {/* QR Code Centerpiece */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
            <img
              src={setupData.qrDataUrl}
              alt="Google Authenticator QR Code"
              className="w-48 h-48 rounded-lg"
            />
            <span className="text-[10px] text-stone-500 font-mono mt-1 text-center">
              Scan with Google Authenticator
            </span>
          </div>

          {/* Manual Entry Key */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Or enter key manually if unable to scan:
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-stone-950 px-3 py-2 rounded-xl text-lime-300 font-mono text-xs border border-stone-800 tracking-wider">
                {setupData.formattedSecret}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Code Test Form */}
          <form onSubmit={handleTestVerify} className="pt-2 border-t border-stone-800 space-y-2">
            <label className="text-[11px] font-bold text-stone-300 block">
              Test your 6-digit code:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={testCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTestCode(val);
                  setTestResult('idle');
                }}
                placeholder="000 000"
                className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={testing || testCode.length !== 6}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
              >
                {testing ? 'Testing...' : 'Verify'}
              </button>
            </div>

            {testResult === 'valid' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/80">
                <CheckCircle2 className="w-4 h-4" />
                <span>Code verified successfully! You can now sign in using Google Authenticator.</span>
              </div>
            )}
            {testResult === 'invalid' && (
              <p className="text-xs text-red-400 font-medium">
                Invalid 6-digit code. Check your device time and try again.
              </p>
            )}
          </form>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
