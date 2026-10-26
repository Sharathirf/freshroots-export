'use client';

import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    action: string;
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
    theme: 'light';
    size: 'flexible';
  }) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export default function TurnstileChallenge({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const container = containerRef.current;
    if (!sitekey || !container) return;

    let widgetId: string | undefined;
    let cancelled = false;
    let script = document.querySelector<HTMLScriptElement>('#cloudflare-turnstile-script');

    const render = () => {
      if (cancelled || !window.turnstile || !container || widgetId) return;
      widgetId = window.turnstile.render(container, {
        sitekey,
        action: 'rfq_submit',
        theme: 'light',
        size: 'flexible',
        callback: onToken,
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      if (!script) {
        script = document.createElement('script');
        script.id = 'cloudflare-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', render);
      script.addEventListener('error', () => onToken(''));
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      script?.removeEventListener('load', render);
    };
  }, [onToken]);

  if (!turnstileEnabled) return null;

  return <div ref={containerRef} className="min-h-[66px]" aria-label="Spam protection" />;
}
