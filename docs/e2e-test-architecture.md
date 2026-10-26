# E2E test architecture

## Goal

Exercise the buyer-facing catalog and inquiry journey in a real browser, including the daily ACROP price cache and the bulk-only arecanut rules. The suite avoids paid checkout and removes the one test RFQ it submits.

## Layers

1. **Browser journey runner** — Playwright drives a fresh browser context for each use case so cart, modal, and viewport state do not leak between cases.
2. **Application boundary** — The browser uses the same Next.js pages and `/api/*` routes as a customer. The mandi endpoints read PostgreSQL first and refresh ACROP only when the stored `checked_on` date is not today in India.
3. **Persistence** — The migration creates the `mandi_prices` cache and the bulk-only arecanut product. Mandi requests use a PostgreSQL advisory lock so simultaneous page loads cannot trigger duplicate daily source requests.
4. **Evidence** — Each case saves a full-page PNG in `playwright-screenshots/arecanut-e2e/`; `results.json` records pass/fail and the matching image filename.

## Ten user journeys

| ID | Use case | Main assurance |
| --- | --- | --- |
| 01 | Open the home catalog | Catalog and document shell render |
| 02 | Read copra and arecanut mandi rates | API returns per-quintal values from the daily DB cache; ticker links to ACROP |
| 03 | Filter the catalog to Arecanut | New category returns the arecanut lot |
| 04 | Review the product card | Bulk-only, 100 kg minimum, dated mandi maximum, and no cart CTA |
| 05 | Start a wholesale quotation | RFQ is prefilled with the selected lot and quintal volume choices |
| 06 | Open product details | Bulk inquiry is available, retail purchase controls are absent |
| 07 | Request less than the minimum | 50 kg is rejected in the form before any request is sent |
| 08 | Submit a valid one-quintal enquiry | The buyer receives a confirmation; test RFQ and audit row are cleaned up |
| 09 | Attempt a retail order through the API | Server rejects the bulk-only SKU before creating an order |
| 10 | Use the category on a mobile viewport | Quote CTA stays visible and page has no horizontal overflow |

## Run locally

1. Apply the idempotent catalog and cache migration with `npm run db:migrate-arecanut`.
2. Start the app with `npm run dev`.
3. In another terminal, run `npm run test:e2e:mandi`.

Set `E2E_BASE_URL` to point the runner at a different local test server. The successful RFQ case uses a unique `example.test` address and removes only rows carrying that exact address after the journey completes. Do not point this suite at a production database.

## Mandi cache contract

- Cache rows are keyed by commodity (`copra`, `arecanut`) and contain the market, maximum price per quintal, ACROP report date, last check date, source URL, and refresh status.
- Browser requests read the cache row. Only the first request after the India calendar date changes holds the commodity advisory lock and checks ACROP.
- A failed source request marks that day as checked and serves the last stored report, preventing repeated outbound requests during an outage.
- `reported_at` is the market's report date; `checked_on` is the date the app last checked the source. The UI shows the former so an older ACROP report is never presented as a same-day market quote.
