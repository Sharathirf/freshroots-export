'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 text-stone-900">
      <section className="max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black">We hit a problem</h1>
        <p className="mt-3 text-sm text-stone-600">Your basket and account are safe. Try loading this page again.</p>
        <button type="button" onClick={() => reset()} className="mt-6 rounded-xl bg-[#3b6d11] px-5 py-3 text-sm font-bold text-white">
          Try again
        </button>
      </section>
    </main>
  );
}
