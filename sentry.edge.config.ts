import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
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
