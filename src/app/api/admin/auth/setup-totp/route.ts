import { NextRequest, NextResponse } from 'next/server';
import { isAdminSessionValid, verifyAdminPassword } from '@/lib/admin-auth';
import { getAdminTotpSetupData } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const isAuthed = isAdminSessionValid(request);
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  const pwdParam = request.nextUrl.searchParams.get('pwd') || '';

  if (!isAuthed && !verifyAdminPassword(authHeader) && !verifyAdminPassword(pwdParam)) {
    return NextResponse.json({ error: 'Unauthorized. Sign in to view Authenticator configuration.' }, { status: 401 });
  }

  try {
    const data = await getAdminTotpSetupData();
    return NextResponse.json({
      success: true,
      issuer: data.issuer,
      account: data.account,
      formattedSecret: data.formattedSecret,
      rawSecret: data.secret,
      otpauthUrl: data.otpauthUrl,
      qrDataUrl: data.qrDataUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate QR' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const isAuthed = isAdminSessionValid(request);
  const password = body.password || '';

  if (!isAuthed && !verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid password. Cannot reveal 2FA setup.' }, { status: 401 });
  }

  try {
    const data = await getAdminTotpSetupData();
    return NextResponse.json({
      success: true,
      issuer: data.issuer,
      account: data.account,
      formattedSecret: data.formattedSecret,
      rawSecret: data.secret,
      otpauthUrl: data.otpauthUrl,
      qrDataUrl: data.qrDataUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate QR' }, { status: 500 });
  }
}
