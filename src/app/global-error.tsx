'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900">
        <main className="flex min-h-screen items-center justify-center px-4">
          <section className="max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black">FreshRoots is having a moment</h1>
            <p className="mt-3 text-sm text-stone-600">Please try loading the page again.</p>
            <button type="button" onClick={() => reset()} className="mt-6 rounded-xl bg-[#3b6d11] px-5 py-3 text-sm font-bold text-white">
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
