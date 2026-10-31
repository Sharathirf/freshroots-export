import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getMessaging, type MulticastMessage } from 'firebase-admin/messaging';
import { query } from '@/lib/db';

export function parseServiceAccountJson(raw: string): Record<string, unknown> {
  let cleaned = raw.trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  if (cleaned.includes('\\"')) {
    cleaned = cleaned.replace(/\\"/g, '"');
  }

  try {
    return JSON.parse(cleaned);
  } catch {}

  try {
    cleaned = cleaned.replace(/\r?\n/g, '\\n');
    return JSON.parse(cleaned);
  } catch {}

  return JSON.parse(raw);
}

function getAdminMessaging() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return null;

  let serviceAccount: ServiceAccount;
  try {
    const raw = parseServiceAccountJson(serviceAccountJson);
    serviceAccount = {
      projectId: String(raw.projectId || raw.project_id || ''),
      clientEmail: String(raw.clientEmail || raw.client_email || ''),
      privateKey: String(raw.privateKey || raw.private_key || ''),
    };
    if (typeof serviceAccount.privateKey === 'string') {
      serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
    }
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Missing required service account fields.');
    }
  } catch {
    console.error('Firebase service account JSON is invalid. Push delivery is disabled.');
    return null;
  }

  const app = getApps().find((candidate) => candidate.name === 'freshroots-push') ||
    initializeApp({ credential: cert(serviceAccount) }, 'freshroots-push');
  return getMessaging(app);
}

export async function sendMandiPriceUpdate(input: {
  commodity: 'copra' | 'arecanut';
  market: string;
  pricePerQuintal: number;
  reportedAt: string;
}) {
  const messaging = getAdminMessaging();
  if (!messaging) return;

  const subscriptions = await query<{ fcm_token: string }>(
    'SELECT fcm_token FROM push_subscriptions'
  );
  const tokens = subscriptions.map((row) => row.fcm_token).filter(Boolean);

  for (let index = 0; index < tokens.length; index += 500) {
    const batch = tokens.slice(index, index + 500);
    const message: MulticastMessage = {
      tokens: batch,
      data: {
        title: `${input.commodity === 'copra' ? 'Copra' : 'Arecanut'} mandi price updated`,
        body: `${input.market}: ₹${input.pricePerQuintal.toLocaleString('en-IN')} per quintal · Reported ${input.reportedAt}`,
        tag: `mandi-${input.commodity}`,
        url: '/',
      },
      webpush: {
        headers: { TTL: '86400' },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    const staleTokens = response.responses.flatMap((item, tokenIndex) => {
      const code = item.error?.code;
      return !item.success && (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token')
        ? [batch[tokenIndex]]
        : [];
    });

    if (staleTokens.length) {
      await query('DELETE FROM push_subscriptions WHERE fcm_token = ANY($1::text[])', [staleTokens]);
    }
  }
}
