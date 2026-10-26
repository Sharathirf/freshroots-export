# Third-party integrations

Each service is optional until its environment variables are configured. No provider secret belongs in source control or a `NEXT_PUBLIC_*` variable.

## Cloudflare Web Analytics

Create a Web Analytics site token and set `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`. The root layout then loads Cloudflare's traffic and performance beacon. It does not require Cloudflare proxying or an API secret.

## PostHog shopping funnel

Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` (US default: `https://us.i.posthog.com`; use the host shown in the PostHog project settings for other regions). Tracking is manual and includes page views, product-card/detail views, add-to-cart, checkout start, purchase, and RFQ start/submission. Autocapture and session replay are disabled; event properties do not include customer name, email, phone, delivery address, or payment reference.

## Cloudflare Turnstile

Create a Turnstile widget for your local, staging, and production hostnames. Set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. The site key renders on RFQ forms; `/api/rfq` verifies the token with Cloudflare Siteverify and checks the `rfq_submit` action. The server fails closed when the secret is configured but the token is missing or invalid. Use Cloudflare's documented testing key pair in automated environments.

## Resend transactional email

Verify a sender domain in Resend, then set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_NOTIFICATION_EMAIL`. New retail orders and bulk RFQs send a buyer confirmation when an email address was provided, and an operations notification when the admin address is set. Email delivery errors are reported to Sentry but do not undo a saved order or RFQ. Newsletter signup is separate and is not connected to Resend.

## Sentry production errors

Set `NEXT_PUBLIC_SENTRY_DSN` to capture browser and server exceptions. The Next.js SDK is wired for App Router requests, client route transitions, and application error boundaries. User identifiers, cookies, request bodies, request headers, and URL query strings are removed from captured error events. To upload source maps in production builds, also set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`; keep the auth token server-side.

## Firebase Cloud Messaging web push

1. Create a Firebase web app and configure Web Push certificates in Firebase Console.
2. Set the `NEXT_PUBLIC_FIREBASE_*` values and `NEXT_PUBLIC_FIREBASE_VAPID_KEY` from the web app and VAPID configuration.
3. Create a service account with permission to send Firebase Cloud Messaging messages. Store its JSON in the server-only `FIREBASE_SERVICE_ACCOUNT_JSON` variable.
4. Run `npm run db:migrate-integrations` to create the opt-in subscription table.

The footer offers **Enable mandi price alerts** only when browser and server configuration are present. Visitors grant notification permission explicitly. Their FCM token is stored only after opting in; they can turn alerts off from the same button. Copra or arecanut report updates send a push to active subscribers. Stale tokens are removed when Firebase reports them as invalid. The service worker is served dynamically at `/api/push/messaging-sw.js` so the public Firebase settings are available to it without committing secrets.

## Local setup

Copy the relevant variable names from `.env.example` into your local environment. This app uses Firebase Admin SDK 14, so the server runtime must be Node.js 22 or newer. Restart Next.js after changing `NEXT_PUBLIC_*` values because Next.js embeds them into client bundles. Provider dashboards and verified sender domains are still required for live delivery. Missing integrations remain disabled without blocking the storefront.
