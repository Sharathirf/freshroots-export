import { Resend } from 'resend';
import * as Sentry from '@sentry/nextjs';

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let resend: Resend | null = null;

export function emailIsConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendTransactionalEmail(message: TransactionalEmail) {
  if (!emailIsConfigured()) return { sent: false as const, reason: 'not_configured' as const };

  resend ||= new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: message.to,
    subject: message.subject,
    text: message.text,
    ...(message.html ? { html: message.html } : {}),
  });

  if (result.error) throw new Error(`Resend failed: ${result.error.message}`);
  return { sent: true as const };
}

export async function deliverTransactionalEmail(message: TransactionalEmail, area: string) {
  try {
    return await sendTransactionalEmail(message);
  } catch (error) {
    console.error(`Resend delivery failed for ${area}:`, error);
    Sentry.captureException(error, { tags: { integration: 'resend', area } });
    return { sent: false as const, reason: 'delivery_failed' as const };
  }
}
