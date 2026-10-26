'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, LoaderCircle } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const PUSH_PREFERENCE_KEY = 'freshroots:mandi-push-preference';
const PUSH_TOKEN_KEY = 'freshroots:mandi-fcm-token';
const isConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId && vapidKey
);

type PushState = 'loading' | 'off' | 'on' | 'busy' | 'error' | 'unavailable';

async function getPushMessaging() {
  if (!(await isSupported())) throw new Error('This browser does not support web push.');
  const app = getApps().find((candidate) => candidate.name === 'freshroots-web-push') ||
    initializeApp(firebaseConfig, 'freshroots-web-push');
  return getMessaging(app);
}

async function getCurrentToken() {
  const messaging = await getPushMessaging();
  const workerUrl = '/api/push/messaging-sw.js';
  const registration = await navigator.serviceWorker.register(workerUrl, { scope: '/' });
  if (!registration.active?.scriptURL.endsWith(workerUrl)) {
    const worker = registration.installing || registration.waiting;
    if (!worker) throw new Error('The push service worker is not ready. Please retry.');
    if (worker.state !== 'activated') {
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error('Push service worker took too long to start.')), 8_000);
        const onStateChange = () => {
          if (worker.state === 'activated') {
            window.clearTimeout(timer);
            worker.removeEventListener('statechange', onStateChange);
            resolve();
          } else if (worker.state === 'redundant') {
            window.clearTimeout(timer);
            worker.removeEventListener('statechange', onStateChange);
            reject(new Error('Could not start the push service worker.'));
          }
        };
        worker.addEventListener('statechange', onStateChange);
        onStateChange();
      });
    }
  }

  const activeRegistration = await navigator.serviceWorker.ready;
  if (!activeRegistration.active?.scriptURL.endsWith(workerUrl)) {
    throw new Error('The push service worker is not active. Please reload and retry.');
  }
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: activeRegistration });
  return { messaging, token };
}

export default function PushNotificationOptIn() {
  const [state, setState] = useState<PushState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      if (!isConfigured || !('Notification' in window)) {
        setState('unavailable');
        return;
      }

      try {
        const statusResponse = await fetch('/api/push/subscribe', { cache: 'no-store' });
        const status = await statusResponse.json();
        if (!statusResponse.ok || !status.available) {
          if (active) setState('unavailable');
          return;
        }
        if (Notification.permission !== 'granted') {
          const savedToken = localStorage.getItem(PUSH_TOKEN_KEY);
          if (savedToken) {
            const response = await fetch('/api/push/subscribe', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: savedToken }),
            });
            if (!response.ok) throw new Error('Could not remove your saved alert preference.');
            localStorage.removeItem(PUSH_TOKEN_KEY);
          }
          localStorage.setItem(PUSH_PREFERENCE_KEY, 'disabled');
          if (active) setState('off');
          return;
        }
        if (localStorage.getItem(PUSH_PREFERENCE_KEY) !== 'enabled') {
          if (active) setState('off');
          return;
        }

        const { token } = await getCurrentToken();
        if (!token) throw new Error('No browser push subscription is available.');
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!response.ok) throw new Error('Could not save the alert preference.');
        localStorage.setItem(PUSH_TOKEN_KEY, token);
        if (active) setState('on');
      } catch {
        if (active) setState(localStorage.getItem(PUSH_TOKEN_KEY) ? 'on' : 'unavailable');
      }
    };

    void checkStatus();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (state !== 'on' || !('Notification' in window) || Notification.permission !== 'granted') return;
    let unsubscribe: (() => void) | undefined;
    void getPushMessaging()
      .then((messaging) => {
        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.data?.title || 'FreshRoots mandi update';
          const body = payload.data?.body || 'A mandi price report has changed.';
          return navigator.serviceWorker.ready.then((registration) =>
            registration.showNotification(title, { body, icon: '/icon.svg', tag: 'freshroots-mandi' })
          );
        });
      })
      .catch(() => undefined);
    return () => unsubscribe?.();
  }, [state]);

  if (!isConfigured || state === 'unavailable') return null;

  const enable = async () => {
    setState('busy');
    setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        localStorage.setItem(PUSH_PREFERENCE_KEY, 'disabled');
        setState('off');
        setMessage('Notifications are off. You can allow them in your browser settings.');
        return;
      }

      const { token } = await getCurrentToken();
      if (!token) throw new Error('The browser did not create a push subscription.');
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error('Could not save your alert preference. Please try again.');
      localStorage.setItem(PUSH_PREFERENCE_KEY, 'enabled');
      localStorage.setItem(PUSH_TOKEN_KEY, token);
      setState('on');
      setMessage('Mandi price alerts are enabled.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not enable alerts right now.');
    }
  };

  const disable = async () => {
    setState('busy');
    setMessage('');
    try {
      const savedToken = localStorage.getItem(PUSH_TOKEN_KEY) || '';
      let messaging: Awaited<ReturnType<typeof getPushMessaging>>;
      let token = savedToken;
      try {
        const current = await getCurrentToken();
        messaging = current.messaging;
        token = current.token || savedToken;
      } catch {
        messaging = await getPushMessaging();
      }
      if (token) {
        const response = await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!response.ok) throw new Error('Could not remove your saved alert preference.');
      }
      localStorage.setItem(PUSH_PREFERENCE_KEY, 'disabled');
      localStorage.removeItem(PUSH_TOKEN_KEY);
      await deleteToken(messaging).catch(() => false);
      setState('off');
      setMessage('Mandi price alerts are off.');
    } catch (error) {
      setState('on');
      setMessage(error instanceof Error ? error.message : 'Could not turn alerts off right now.');
    }
  };

  const isBusy = state === 'busy' || state === 'loading';

  return (
    <div className="mt-3 flex flex-col items-start gap-1.5">
      {state === 'on' ? (
        <button type="button" onClick={() => void disable()} disabled={isBusy} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-900/40 disabled:opacity-60">
          <BellOff className="h-4 w-4" /> Turn off mandi alerts
        </button>
      ) : (
        <button type="button" onClick={() => void enable()} disabled={isBusy} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-900/40 disabled:opacity-60">
          {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          {state === 'loading' ? 'Checking alerts…' : state === 'busy' ? 'Saving preference…' : 'Enable mandi price alerts'}
        </button>
      )}
      {message && <p role="status" className="max-w-xs text-[11px] text-emerald-200">{message}</p>}
    </div>
  );
}
