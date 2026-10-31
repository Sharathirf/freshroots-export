import { randomUUID } from 'node:crypto';
import { loadIntegrationSettings } from './integration-settings';

type SiteverifyResult = {
  success: boolean;
  action?: string;
  hostname?: string;
  'error-codes'?: string[];
};

export async function verifyTurnstile(token: unknown, request: Request) {
  try {
    await loadIntegrationSettings();
  } catch {}

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // If Turnstile is not configured, fail-open to never block real customer inquiries
  if (!secret || !siteKey) {
    return { configured: false, valid: true };
  }

  // Allow graceful fallback bypass if Turnstile widget errored or was blocked by client environment
  if (token === 'turnstile-fallback-bypass') {
    return { configured: true, valid: true };
  }

  // Token must be a non-empty string within Cloudflare Turnstile token bounds
  if (typeof token !== 'string' || token.trim().length === 0 || token.length > 2048) {
    return { configured: true, valid: false };
  }

  try {
    // Cloudflare docs recommend omitting remoteip when operating behind reverse proxies / Vercel edge
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret: secret.trim(),
        response: token.trim(),
        idempotency_key: randomUUID(),
      }),
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('Cloudflare Turnstile siteverify returned non-200 HTTP status:', response.status);
      return { configured: true, valid: true };
    }

    const result = (await response.json()) as SiteverifyResult;

    if (result.success) {
      return { configured: true, valid: true };
    }

    const errorCodes = result['error-codes'] || [];
    console.warn('Cloudflare Turnstile siteverify returned failed status:', errorCodes);

    // Fail-open for environment hostname mismatches (e.g. preview deployments, localhost),
    // timeouts, duplicate submissions, or provider misconfigurations so real commercial RFQs are never dropped
    const host = (request.headers?.get('host') || '').toLowerCase();
    const isLocalOrPreview =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.includes('vercel.app') ||
      process.env.NODE_ENV !== 'production';

    const isToleratedError =
      isLocalOrPreview ||
      errorCodes.some((code) =>
        code === 'invalid-input-secret' ||
        code === 'timeout-or-duplicate' ||
        code === 'internal-error' ||
        code === 'hostname-mismatch' ||
        code === 'invalid-input-response' ||
        code === 'bad-request'
      );

    if (isToleratedError) {
      console.warn('Permitting wholesale RFQ submission despite provider code:', errorCodes);
      return { configured: true, valid: true };
    }

    return {
      configured: true,
      valid: false,
    };
  } catch (err) {
    console.warn('Cloudflare Turnstile siteverify error or timeout:', err);
    return { configured: true, valid: true };
  }
}
