# Production readiness

## Required before accepting public orders

1. Set `ADMIN_PASSWORD` to a unique password with at least 16 characters and `ADMIN_SESSION_SECRET` to a separate random value of at least 32 bytes. The local helper `npm run setup:local-admin` creates ignored local values in `.env.local`; production values must be set in the hosting provider's secret manager.
2. Apply the idempotent schema changes with `npm run db:migrate-secure-checkout` and `npm run db:migrate-integrations` against the intended database. Do not run migrations against production until its backup and database target are confirmed.
3. Replace Razorpay test credentials with matching live key IDs and secret. The backend calculates amounts from the persisted order. Configure the webhook URL as `/api/razorpay/webhook` for `payment.captured` and `payment.failed`, and set a distinct `RAZORPAY_WEBHOOK_SECRET`. A Razorpay secret was previously embedded in source; rotate the provider key before going live.
4. Configure `CRON_SECRET` and call `/api/cron/maintenance` at least daily (recommended every 30 minutes). Send `Authorization: Bearer <CRON_SECRET>`. Schedule the daily mandi check at 00:05 India time (18:35 UTC); more frequent calls are safe because each commodity refreshes at most once per India calendar date. The same endpoint expires unpaid holds and returns stale-price state.
5. Set `NODE_ENV=production`, use Node.js 22 or newer, enforce HTTPS, and confirm the actual legal, tax, returns, shipping, and contact information before publishing.

## Integration settings

The Operations Desk's **Service Integrations** tab checks whether required settings are present without returning their values. It does not claim that provider accounts accepted the settings or delivered a test event.

| Service | Required settings | End-to-end confirmation |
| --- | --- | --- |
| Cloudflare Web Analytics | `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | Open the production storefront and confirm a visit appears in Cloudflare Web Analytics. |
| PostHog | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`; optional host defaults to US | Visit a product, add it to cart, and check the configured PostHog project for those funnel events. |
| Cloudflare Turnstile | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Submit a staging RFQ with a valid challenge; verify the server rejects a missing or invalid token. |
| Resend | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`; optional `ADMIN_NOTIFICATION_EMAIL` | Submit a staging RFQ and place a staging order with an email address; verify buyer and operations mail delivery. |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` or `SENTRY_DSN`; optional source-map upload settings | Send a deliberate staging-only test event and verify it reaches the correct Sentry project, then remove the test event/code. |
| Firebase Cloud Messaging | `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`, integration migration | Opt in from a supported HTTPS browser, send a staging mandi update, and verify delivery and opt-out. |

Provider credentials are not present in this checkout. Until they are configured, each optional integration remains disabled; the Turnstile server check fails closed in production.

## Safe checkout behavior

- Retail orders are priced from the database and reserve available stock atomically. New orders remain `pending_payment` until a verified Razorpay capture or manual UPI reconciliation in the Operations Desk.
- Never mark a UPI transfer as paid based only on a buyer-entered UTR. Verify it against the receiving account before changing order status.
- The Razorpay verify route requires a valid Checkout signature and independently fetches the payment to confirm order ID, captured status, currency, and amount. Webhooks use a separate signing secret.
- Expired unpaid orders release only their own recorded inventory reservations. An hourly or more frequent scheduler is recommended to release abandoned checkout stock promptly.

## Release acceptance

Run the existing browser journeys against a staging database after migrations. Add staging checkout cases for captured/failed/expired Razorpay payments, invalid signatures, UPI manual confirmation, duplicate webhooks, stock contention, reservation release, admin access control, and provider delivery. Do not use the production database for destructive browser tests.
