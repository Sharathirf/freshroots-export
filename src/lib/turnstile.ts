import { randomUUID } from 'node:crypto';

type SiteverifyResult = {
  success: boolean;
  action?: string;
  hostname?: string;
};

export async function verifyTurnstile(token: unknown, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const production = process.env.NODE_ENV === 'production';
  if (!secret || !siteKey) return { configured: false, valid: !production };
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return { configured: true, valid: false };
  }

  try {
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const remoteIp = request.headers.get('cf-connecting-ip') || forwardedFor;
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        idempotency_key: randomUUID(),
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });
    if (!response.ok) return { configured: true, valid: false };
    const result = (await response.json()) as SiteverifyResult;
    const requestHost = (request.headers.get('host') || new URL(request.url).host)
      .replace(/:\d+$/, '')
      .toLowerCase();
    const providerHost = result.hostname?.toLowerCase();
    const hostMatches = production
      ? Boolean(providerHost && providerHost === requestHost)
      : !providerHost || providerHost === 'dummy' || providerHost === 'example.com' || providerHost === 'localhost' || requestHost === 'localhost' || providerHost === requestHost;
    const actionMatches = production
      ? result.action === 'rfq_submit'
      : !result.action || result.action === 'rfq_submit';

    return {
      configured: true,
      valid: Boolean(result.success && actionMatches && hostMatches),
    };
  } catch {
    return { configured: true, valid: false };
  }
}
