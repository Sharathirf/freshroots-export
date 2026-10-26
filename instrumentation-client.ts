import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend(event) {
      if (event.user) delete event.user;
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.headers;
        if (event.request.url) {
          try {
            const url = new URL(event.request.url);
            event.request.url = `${url.origin}${url.pathname}`;
          } catch {
            event.request.url = undefined;
          }
        }
      }
      return event;
    },
  });
}

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (posthogToken) {
  posthog.init(posthogToken, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-08-30',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    respect_dnt: true,
    person_profiles: 'identified_only',
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
