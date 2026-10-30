import { createHmac } from 'node:crypto';
import QRCode from 'qrcode';

export const DEFAULT_ADMIN_TOTP_SECRET = 'MXY6A64HCPTYLNZJ3DWKYE5DMKL5HNHZ';

export function getAdminTotpSecret(): string {
  return (process.env.ADMIN_TOTP_SECRET || DEFAULT_ADMIN_TOTP_SECRET).replace(/\s+/g, '').toUpperCase();
}

function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) throw new Error(`Invalid base32 char: ${clean[i]}`);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTOTP(secretBase32: string = getAdminTotpSecret(), timeStepSeconds = 30, digits = 6, timeOffset = 0): string {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStepSeconds) + timeOffset;
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    10 ** digits;
  return code.toString().padStart(digits, '0');
}

export function verifyTOTP(token: string, secretBase32: string = getAdminTotpSecret()): boolean {
  const cleanToken = String(token || '').trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanToken)) return false;
  // Check offset 0, -1, 1 for slight time drift
  for (const offset of [0, -1, 1]) {
    try {
      if (generateTOTP(secretBase32, 30, 6, offset) === cleanToken) return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function getAdminTotpSetupData() {
  const secret = getAdminTotpSecret();
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;
  const issuer = 'FreshRoots Export';
  const account = 'admin@freshrootsexport.com';
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
    margin: 2,
    width: 256,
    color: {
      dark: '#1c3809',
      light: '#ffffff',
    },
  });

  return {
    secret,
    formattedSecret,
    account,
    issuer,
    otpauthUrl,
    qrDataUrl,
  };
}
