import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyTOTP } from './totp';

const COOKIE_NAME = 'freshroots_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

export function adminCredentialsReady() {
  return Boolean(
    process.env.ADMIN_PASSWORD && Buffer.byteLength(process.env.ADMIN_PASSWORD) >= 16 && sessionSecret()
  );
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function constantTimeEqual(left: string, right: string) {
  const leftDigest = createHmac('sha256', 'admin-compare').update(left).digest();
  const rightDigest = createHmac('sha256', 'admin-compare').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function verifyAdminTotp(candidate: string) {
  return verifyTOTP(candidate);
}

export function verifyAdminPassword(candidate: string) {
  // Allow login using Google Authenticator 6-digit code or Master Password
  if (/^\d{6}$/.test(candidate.trim()) && verifyTOTP(candidate)) {
    return true;
  }
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(
    expected && Buffer.byteLength(expected) >= 16 && Buffer.byteLength(candidate) <= 1024 && constantTimeEqual(candidate, expected)
  );
}

export function createAdminSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 bytes');
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const value = `${expiresAt}.${sign(`admin:${expiresAt}`, secret)}`;
  return { value, maxAge: SESSION_TTL_SECONDS };
}

export function isAdminSessionValid(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = sessionSecret();
  if (!token || !secret) return false;

  const [expiresAtText, signature, ...extra] = token.split('.');
  const expiresAt = Number(expiresAtText);
  if (extra.length || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  return constantTimeEqual(signature, sign(`admin:${expiresAt}`, secret));
}

export function requestHasSameOrigin(request: NextRequest) {
  const originHeader = request.headers.get('origin') || request.headers.get('referer');
  if (!originHeader) return true; // Direct/same-origin fetches without origin header are allowed if admin session is verified
  try {
    const origin = new URL(originHeader);
    const requestUrl = new URL(request.url);
    const originHost = origin.hostname.toLowerCase();

    // Check against host and forwarded-host headers
    const rawHost = request.headers.get('host') || requestUrl.host;
    const hostHeader = rawHost.split(':')[0].toLowerCase();
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim().split(':')[0].toLowerCase();

    const allowedHosts = new Set([
      'freshrootsexport.com',
      'www.freshrootsexport.com',
      'freshroots-export.vercel.app',
      'localhost',
      '127.0.0.1',
    ]);

    const isMatch =
      originHost === hostHeader ||
      (forwardedHost && originHost === forwardedHost) ||
      originHost === requestUrl.hostname.toLowerCase() ||
      allowedHosts.has(originHost) ||
      originHost.endsWith('.vercel.app');

    return Boolean(isMatch);
  } catch {
    return false;
  }
}

export function requireAdmin(request: NextRequest, mutation = false) {
  if (!isAdminSessionValid(request)) {
    return NextResponse.json({ success: false, error: 'Administrator sign-in required' }, { status: 401 });
  }

  if (mutation) {
    if (!requestHasSameOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Invalid request origin' }, { status: 403 });
    }
  }

  return null;
}

export function adminSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', { ...adminSessionCookieOptions(0), expires: new Date(0) });
  return response;
}
