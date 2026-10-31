'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  Eye,
  EyeOff,
  Globe,
  TrendingUp,
  Mail,
  ShieldAlert,
  Bell,
  ShieldCheck,
} from 'lucide-react';

interface IntegrationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onSaved: () => void;
}

interface ServiceMeta {
  id: string;
  name: string;
  tagline: string;
  portalUrl: string;
  portalName: string;
  icon: any;
  steps: Array<{ title: string; detail: string }>;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'password' | 'textarea';
    help: string;
  }>;
}

const SERVICE_CATALOG: Record<string, ServiceMeta> = {
  'cloudflare-analytics': {
    id: 'cloudflare-analytics',
    name: 'Cloudflare Web Analytics',
    tagline: 'Cookieless, privacy-preserving website traffic and Core Web Vitals directly from Cloudflare’s global edge.',
    portalUrl: 'https://dash.cloudflare.com',
    portalName: 'Cloudflare Dashboard',
    icon: Globe,
    steps: [
      {
        title: 'Open Cloudflare Web Analytics',
        detail: 'Log into dash.cloudflare.com. In the left sidebar, navigate to Analytics & Logs > Web Analytics.',
      },
      {
        title: 'Add freshrootsexport.com',
        detail: 'Click "Add a site", enter your domain freshrootsexport.com, and click Next.',
      },
      {
        title: 'Copy the JS Snippet Token',
        detail: 'Cloudflare will output a JS snippet. Locate `token: "..."` and copy the 32-character hexadecimal token into the field below.',
      },
    ],
    fields: [
      {
        key: 'NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN',
        label: 'Cloudflare Web Analytics Token',
        placeholder: 'e.g. c1a2b3d4e5f6a7b8c9d0e1f2a3b4c5d6',
        type: 'text',
        help: '32-character hex token from the Cloudflare Web Analytics JS beacon.',
      },
    ],
  },
  posthog: {
    id: 'posthog',
    name: 'PostHog Shopping Funnel',
    tagline: 'Product-led e-commerce conversion analytics: product view ➔ add to cart ➔ RFQ intake ➔ order completed.',
    portalUrl: 'https://us.i.posthog.com',
    portalName: 'PostHog Console',
    icon: TrendingUp,
    steps: [
      {
        title: 'Create or Open PostHog Project',
        detail: 'Sign up or log in at us.i.posthog.com (free 1M events/month). Create a project named "FreshRoots Export".',
      },
      {
        title: 'Copy Project API Key',
        detail: 'Navigate to Project Settings (gear icon) > Project API Key. The key starts with "phc_".',
      },
      {
        title: 'Paste and Test Connection',
        detail: 'Paste your Project API Key below. Click "Test Connection" to emit a test diagnostic ping.',
      },
    ],
    fields: [
      {
        key: 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN',
        label: 'PostHog Project API Key',
        placeholder: 'phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'text',
        help: 'Client-side public project key starting with phc_',
      },
      {
        key: 'NEXT_PUBLIC_POSTHOG_HOST',
        label: 'PostHog Ingestion Host',
        placeholder: 'https://us.i.posthog.com',
        type: 'text',
        help: 'Defaults to https://us.i.posthog.com (or https://eu.i.posthog.com if hosted in EU)',
      },
    ],
  },
  turnstile: {
    id: 'turnstile',
    name: 'Cloudflare Turnstile',
    tagline: 'Smart bot mitigation for written RFQ submissions, enquiry forms, and commercial quote requests.',
    portalUrl: 'https://dash.cloudflare.com',
    portalName: 'Cloudflare Turnstile Dashboard',
    icon: ShieldCheck,
    steps: [
      {
        title: 'Create Turnstile Widget',
        detail: 'Log into dash.cloudflare.com > Turnstile. Click "Add widget" and name it "FreshRoots RFQ".',
      },
      {
        title: 'Add Allowed Hostnames',
        detail: 'Add freshrootsexport.com, www.freshrootsexport.com, and freshroots-export.vercel.app.',
      },
      {
        title: 'Copy Site Key and Secret Key',
        detail: 'Select "Managed" mode. Copy the public Site Key (starts with 0x4...) and the server-side Secret Key below.',
      },
    ],
    fields: [
      {
        key: 'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
        label: 'Turnstile Public Site Key',
        placeholder: '0x4AAAAAA...',
        type: 'text',
        help: 'Public client key passed to TurnstileChallenge component.',
      },
      {
        key: 'TURNSTILE_SECRET_KEY',
        label: 'Turnstile Secret Key',
        placeholder: '0x4AAAAAA...',
        type: 'password',
        help: 'Server-side private secret used on /api/rfq to verify challenge responses.',
      },
    ],
  },
  resend: {
    id: 'resend',
    name: 'Resend Transactional Email',
    tagline: 'High-inbox delivery for customer order invoices, delivery dispatch notices, and wholesale RFQ revisions.',
    portalUrl: 'https://resend.com/api-keys',
    portalName: 'Resend Dashboard',
    icon: Mail,
    steps: [
      {
        title: 'Create an API Key',
        detail: 'Log in at resend.com. Go to API Keys > Create API Key with "Full access". Key begins with "re_".',
      },
      {
        title: 'Verify Sender Domain',
        detail: 'In Resend Domains, add freshrootsexport.com and configure the 3 DNS records (DKIM/SPF) in Cloudflare DNS.',
      },
      {
        title: 'Configure From & Admin Addresses',
        detail: 'Use a sender like "FreshRoots Export <orders@freshrootsexport.com>" (or "onboarding@resend.dev" for testing).',
      },
    ],
    fields: [
      {
        key: 'RESEND_API_KEY',
        label: 'Resend API Key',
        placeholder: 're_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        help: 'Private API key starting with re_',
      },
      {
        key: 'RESEND_FROM_EMAIL',
        label: 'Verified Sender Email Address',
        placeholder: 'FreshRoots Export <orders@freshrootsexport.com>',
        type: 'text',
        help: 'The display name and verified domain address shown in buyers’ inbox.',
      },
      {
        key: 'ADMIN_NOTIFICATION_EMAIL',
        label: 'Operations Notification Inbox',
        placeholder: 'sales@freshrootsexport.com',
        type: 'text',
        help: 'Where order alerts and wholesale inquiry notices are copied.',
      },
    ],
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry Error Monitoring',
    tagline: 'Production exception tracking and performance diagnostics across client, edge, and node runtimes with automatic PII scrubbing.',
    portalUrl: 'https://sentry.io',
    portalName: 'Sentry Dashboard',
    icon: ShieldAlert,
    steps: [
      {
        title: 'Create Next.js Project in Sentry',
        detail: 'Log in to sentry.io. Click "Create Project", select "Next.js", and name it "freshroots-export".',
      },
      {
        title: 'Copy Project DSN',
        detail: 'Go to Settings > Projects > freshroots-export > Client Keys (DSN). Copy the DSN URL.',
      },
      {
        title: 'Save and Test',
        detail: 'Paste your DSN below. Both client and server errors will immediately route to your Sentry issue tracker.',
      },
    ],
    fields: [
      {
        key: 'NEXT_PUBLIC_SENTRY_DSN',
        label: 'Sentry Client & Server DSN',
        placeholder: 'https://xxxx@o000000.ingest.sentry.io/0000000',
        type: 'text',
        help: 'Full ingest URL with public key and project ID.',
      },
      {
        key: 'SENTRY_AUTH_TOKEN',
        label: 'Sentry Auth Token (Optional)',
        placeholder: 'sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        help: 'Optional: used to upload source maps during Next.js production builds.',
      },
    ],
  },
  firebase: {
    id: 'firebase',
    name: 'Firebase Cloud Messaging (FCM)',
    tagline: 'Web push notifications to buyers and traders for Mandi price shifts, dispatch updates, and out-of-stock restocks.',
    portalUrl: 'https://console.firebase.google.com',
    portalName: 'Firebase Console',
    icon: Bell,
    steps: [
      {
        title: 'Create Firebase Project & Web App',
        detail: 'In console.firebase.google.com, create project "FreshRoots Export". Add a Web App and copy the config.',
      },
      {
        title: 'Generate Web Push VAPID Key',
        detail: 'In Project Settings > Cloud Messaging > Web Push certificates, click "Generate key pair".',
      },
      {
        title: 'Download Service Account JSON',
        detail: 'In Project Settings > Service Accounts, click "Generate new private key". Paste the entire JSON file contents below.',
      },
    ],
    fields: [
      {
        key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
        label: 'Firebase Web API Key',
        placeholder: 'AIzaSy...',
        type: 'text',
        help: 'From Web App config apiKey',
      },
      {
        key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        label: 'Firebase Project ID',
        placeholder: 'freshroots-export',
        type: 'text',
        help: 'From Web App config projectId',
      },
      {
        key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        label: 'Messaging Sender ID',
        placeholder: '123456789012',
        type: 'text',
        help: 'From Web App config messagingSenderId',
      },
      {
        key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
        label: 'Firebase Web App ID',
        placeholder: '1:123456789012:web:abcdef...',
        type: 'text',
        help: 'From Web App config appId',
      },
      {
        key: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
        label: 'Web Push VAPID Certificate Key',
        placeholder: 'BKag8...',
        type: 'text',
        help: 'From Cloud Messaging > Web Push certificates key pair',
      },
      {
        key: 'FIREBASE_SERVICE_ACCOUNT_JSON',
        label: 'Private Service Account JSON',
        placeholder: '{"type":"service_account","project_id":"...","private_key":"..."}',
        type: 'textarea',
        help: 'Server-side credentials for dispatching web push via Firebase Admin.',
      },
    ],
  },
};

export default function IntegrationSetupModal({
  isOpen,
  onClose,
  serviceId,
  onSaved,
}: IntegrationSetupModalProps) {
  const [selectedService, setSelectedService] = useState<string>(serviceId || 'cloudflare-analytics');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (serviceId && SERVICE_CATALOG[serviceId]) {
      setSelectedService(serviceId);
    }
  }, [serviceId]);

  // Fetch current values when modal opens or service changes
  useEffect(() => {
    if (!isOpen) return;
    setSaveSuccessMsg(null);
    setTestResult(null);

    fetch('/api/admin/integrations', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const item = data.integrations?.find((i: any) => i.id === selectedService);
        if (item && item.keys) {
          setFormValues(item.keys);
        }
      })
      .catch(() => {});
  }, [isOpen, selectedService]);

  if (!isOpen) return null;

  const currentMeta = SERVICE_CATALOG[selectedService] || SERVICE_CATALOG['cloudflare-analytics'];
  const IconComponent = currentMeta.icon;

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setSaveSuccessMsg(null);
    setTestResult(null);
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          action: 'save',
          keys: formValues,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      setSaveSuccessMsg(data.message || 'Settings saved successfully');
      onSaved();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          action: 'test',
          keys: formValues,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestResult({ success: false, message: data.error || 'Verification failed' });
      } else {
        setTestResult({ success: true, message: data.message || 'Connection verified successfully!' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Network error testing connection' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-start justify-between gap-4 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5 text-[#3b6d11]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-stone-900">{currentMeta.name}</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 sm:line-clamp-none">{currentMeta.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={currentMeta.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-xs transition"
            >
              <span>{currentMeta.portalName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Service Switcher Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {Object.values(SERVICE_CATALOG).map((svc) => (
            <button
              key={svc.id}
              onClick={() => setSelectedService(svc.id)}
              className={`py-2.5 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedService === svc.id
                  ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{svc.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Mobile Direct Link */}
          <div className="sm:hidden">
            <a
              href={currentMeta.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl"
            >
              <span>Open {currentMeta.portalName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step-by-Step Setup Guide */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>Step-by-Step Setup Guide</span>
            </div>
            <div className="grid gap-2.5 text-xs sm:grid-cols-3">
              {currentMeta.steps.map((step, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-3">
              {currentMeta.fields.map((f) => {
                const isSecret = f.type === 'password' && !showSecrets[f.key];
                return (
                  <div key={f.key} className="space-y-1 text-left">
                    <label className="block text-xs font-bold text-stone-800">
                      {f.label}
                    </label>
                    <div className="relative">
                      {f.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={formValues[f.key] || ''}
                          onChange={(e) => handleInputChange(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-stone-50 focus:bg-white transition"
                        />
                      ) : (
                        <div className="flex items-center">
                          <input
                            type={isSecret ? 'password' : 'text'}
                            value={formValues[f.key] || ''}
                            onChange={(e) => handleInputChange(f.key, e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-stone-50 focus:bg-white transition pr-10"
                          />
                          {f.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => toggleShowSecret(f.key)}
                              className="absolute right-3 p-1 text-stone-400 hover:text-stone-700"
                              title="Toggle visibility"
                            >
                              {showSecrets[f.key] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">{f.help}</p>
                  </div>
                );
              })}
            </div>

            {/* Test & Save Status Banners */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-start gap-2 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">
                  <span className="font-bold">{testResult.success ? 'Success: ' : 'Check Failed: '}</span>
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isSaving}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-stone-300 disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing Connection...' : 'Test Connection / Verify'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isTesting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving Settings...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
