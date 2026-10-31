'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Download, Share, X } from 'lucide-react';
import Image from 'next/image';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

declare global {
  interface Window {
    __freshRootsInstallPrompt?: InstallPromptEvent | null;
  }
}

type InstallMode = 'native' | 'ios' | 'browser' | null;

const DISMISSAL_KEY = 'freshroots:pwa-install-dismissed-at';
const DISMISSAL_DAYS = 14;

function isInstalled() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

function wasRecentlyDismissed() {
  const dismissedAt = Number(localStorage.getItem(DISMISSAL_KEY));
  const dismissedFor = Date.now() - dismissedAt;

  return Number.isFinite(dismissedAt) && dismissedAt > 0 && dismissedFor < DISMISSAL_DAYS * 24 * 60 * 60 * 1000;
}

export default function PwaInstallPrompt() {
  const pathname = usePathname();
  const [mode, setMode] = useState<InstallMode>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInstalled()) return;

    // Register a pass-through service worker so browsers can verify installability.
    // It does not cache responses, so page updates cannot get stuck behind stale assets.
    if ('serviceWorker' in navigator) {
      const workerUrl = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        ? '/api/push/messaging-sw.js'
        : '/sw.js';
      void navigator.serviceWorker.register(workerUrl, { scope: '/' }).catch(() => undefined);
    }

    if (wasRecentlyDismissed()) return;

    const userAgent = navigator.userAgent;
    const isIos =
      /iphone|ipad|ipod/i.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const onInstallPromptReady = () => {
      const promptEvent = window.__freshRootsInstallPrompt;
      if (!promptEvent) return;

      setInstallEvent(promptEvent);
      setMode('native');
    };

    const onAppInstalled = () => {
      setInstallEvent(null);
      setMode(null);
      localStorage.removeItem(DISMISSAL_KEY);
    };

    window.addEventListener('freshroots:install-prompt-ready', onInstallPromptReady);
    if (isIos && window.innerWidth < 768) {
      setMode('ios');
    }
    onInstallPromptReady();

    window.addEventListener('freshroots:app-installed', onAppInstalled);

    return () => {
      window.removeEventListener('freshroots:install-prompt-ready', onInstallPromptReady);
      window.removeEventListener('freshroots:app-installed', onAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSAL_KEY, String(Date.now()));
    setMode(null);
    setInstructionsOpen(false);
  }, []);

  const install = useCallback(async () => {
    if (!installEvent) {
      setInstructionsOpen((open) => !open);
      return;
    }

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      window.__freshRootsInstallPrompt = null;
      setInstallEvent(null);

      if (choice.outcome === 'accepted') {
        setMode(null);
        localStorage.removeItem(DISMISSAL_KEY);
      } else {
        dismiss();
      }
    } catch {
      dismiss();
    }
  }, [dismiss, installEvent]);

  // Suppress consumer storefront install prompt on internal operations desk
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  if (!mode) return null;

  return (
    <aside
      aria-label="Install FreshRoots Export app"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4 z-[60] px-2.5 sm:px-4 pointer-events-auto"
    >
      <div className="relative mx-auto max-w-[704px] rounded-[28px] border border-emerald-700 bg-[#173b0b] p-4 text-white shadow-[0_16px_55px_rgba(0,0,0,0.28)] sm:p-6">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss app install prompt"
          className="absolute right-3 top-3 rounded-full p-2 text-emerald-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:right-5 sm:top-5"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-9 sm:gap-5 sm:pr-12">
          <Image
            src="/icon.svg"
            alt=""
            width={68}
            height={68}
            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-emerald-500 bg-emerald-950 object-cover sm:h-[68px] sm:w-[68px]"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold leading-tight sm:text-[22px]">
                Install FreshRoots Export
              </h2>
              <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-stone-950 sm:text-xs">
                PWA
              </span>
            </div>
            <p className="mt-1 text-sm leading-snug text-emerald-200 sm:text-lg">
              Faster checkout and easy order tracking from Mandya farms.
            </p>
          </div>
        </div>

        {instructionsOpen && mode !== 'native' && (
          <p className="mt-4 rounded-xl border border-emerald-800 bg-emerald-950/70 px-4 py-3 text-sm text-emerald-100">
            {mode === 'ios' ? (
              <>Tap <Share className="mx-1 inline h-4 w-4" aria-hidden="true" /> Share, then choose <strong className="text-white">Add to Home Screen</strong>.</>
            ) : (
              <>In Chrome, open the <strong className="text-white">⋮</strong> menu and choose <strong className="text-white">Install FreshRoots Export</strong>. You can also use the install icon beside the address bar.</>
            )}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 sm:mt-6 sm:gap-5">
          <button
            type="button"
            onClick={install}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-emerald-950 shadow-sm transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#173b0b] sm:min-h-[58px] sm:text-xl"
          >
            {mode !== 'native' && instructionsOpen ? (
              'Got it'
            ) : (
              <>
                <Download className="h-5 w-5" aria-hidden="true" />
                Install App (Free)
              </>
            )}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-xl px-3 py-3 text-sm font-bold text-emerald-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:px-4 sm:text-lg"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
