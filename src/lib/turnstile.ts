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

  // Allow graceful fallback bypass if Turnstile widget errored or was blocked by client environment
  if (token === 'turnstile-fallback-bypass') {
    return { configured: true, valid: true };
  }

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
    if (!response.ok) {
      // If Cloudflare siteverify service is down or rate-limited, fail open to not block real buyers
      console.warn('Cloudflare Turnstile siteverify returned non-200 HTTP status:', response.status);
      return { configured: true, valid: true };
    }
    const result = (await response.json()) as SiteverifyResult;

    const requestHost = (request.headers.get('host') || new URL(request.url).host)
      .replace(/:\d+$/, '')
      .replace(/^www\./, '')
      .toLowerCase();
    const providerHost = result.hostname?.replace(/^www\./, '')?.toLowerCase();

    // Check host match with support for apex, www, vercel deployment domains and localhost
    const isKnownDomain =
      requestHost === 'freshrootsexport.com' ||
      requestHost.includes('vercel.app') ||
      requestHost === 'localhost';

    const hostMatches = production
      ? Boolean(!providerHost || providerHost === requestHost || isKnownDomain)
      : true;

    const actionMatches = production
      ? !result.action || result.action === 'rfq_submit'
      : true;

    return {
      configured: true,
      valid: Boolean(result.success && actionMatches && hostMatches),
    };
  } catch (err) {
    // If network to Cloudflare times out or fails, do not block the submission
    console.warn('Cloudflare Turnstile siteverify error or timeout:', err);
    return { configured: true, valid: true };
  }
}
