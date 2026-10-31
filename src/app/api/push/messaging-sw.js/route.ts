import { loadIntegrationSettings } from '@/lib/integration-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  await loadIntegrationSettings();
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
  const configured = Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId);
  const firebaseSetup = configured
    ? `
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || 'FreshRoots mandi update';
  const options = {
    body: payload.data?.body || 'A subscribed mandi price report has been updated.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: payload.data?.tag || 'freshroots-mandi',
    data: { url: payload.data?.url || '/' },
  };
  return self.registration.showNotification(title, options);
});
`
    : '';

  const script = `${firebaseSetup}
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    for (const client of windows) {
      if ('focus' in client) {
        client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});`;

  return new Response(script, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'service-worker-allowed': '/',
    },
  });
}
