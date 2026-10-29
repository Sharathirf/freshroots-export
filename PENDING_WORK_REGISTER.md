# FreshRoots Export — Pending Work Register & Comprehensive Action Log

**Last Updated**: October 29, 2026  
**Status Key**:
- `DONE AND VERIFIED`: Feature fully coded, tested via automated test suites or production build.
- `WAITING FOR OWNER INPUT`: Code ready, awaiting business credentials, bank accounts, or real documents from owner.
- `WAITING FOR EXTERNAL ACCESS`: Code ready, awaiting 3rd-party vendor approval (Meta WhatsApp API, Razorpay live key).
- `WAITING FOR REAL-WORLD VALIDATION`: Deployed logic awaiting live transactions and APMC Mandi spot deals.
- `PENDING DEVELOPMENT`: Future enhancements post-launch.

---

## Master Task & Action Register

| ID | Area | Task Description | Status | Evidence / Codebase Location | Business Impact | Priority | Dependency | Responsible | Effort | Acceptance Criteria | Next Action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **PWR-01** | E | Indian GST Compliance Engine | `DONE AND VERIFIED` | `src/lib/pricing.ts`, Test Suite 1 | Legal tax calculation on invoice | **P0** | None | Claude | 2h | 0% Fresh Coconut, 5% Copra, 12% Ghee | Maintain rate tables |
| **PWR-02** | I | Mobile Phone OTP Verification Engine | `DONE AND VERIFIED` | `src/app/api/auth/otp/route.ts` | Eliminates fake orders & invalid cash-on-delivery | **P0** | Database | Claude | 4h | Validates 6-digit OTP, verifies Indian 10-digit mobile | Connect Fast2SMS / Twilio in prod |
| **PWR-03** | M | Dynamic UPI QR Code Pre-allocation | `DONE AND VERIFIED` | `src/components/CartDrawer.tsx`, `src/app/api/orders/route.ts` | Matches payments to orders without UTR via `tn` & `tr` | **P0** | Merchant VPA | Claude | 3h | Pre-allocates order intent, encodes order ID in UPI link | Owner to supply live UPI VPA |
| **PWR-04** | I | Auth-Gated Cart & Watchlist with Auto-Resume | `DONE AND VERIFIED` | `src/context/AuthContext.tsx`, `CartContext.tsx`, `WishlistContext.tsx` | Captures user identity early; seamless UX | **P0** | Auth Context | Claude | 3h | Prompts unauthenticated users on Add-to-Cart; resumes action on OTP verify | Verified in browser & unit tests |
| **PWR-05** | G | Programmatic Technical SEO & Schema Markup | `DONE AND VERIFIED` | `src/lib/seo-utils.ts`, `src/app/sitemap.ts`, `robots.ts` | Drives zero-budget organic Google search traffic | **P0** | Catalog | Claude | 4h | All 11 products have valid JSON-LD Product & BreadcrumbList | Submit sitemap to Google Search Console |
| **PWR-06** | J | Wholesale B2B RFQ Pipeline & Storage | `DONE AND VERIFIED` | `src/app/api/rfq/route.ts`, `src/components/WholesaleModal.tsx` | Ingests multi-ton bulk buyer leads | **P0** | DB Table | Claude | 3h | Stores quote requests in PostgreSQL with volume & contact | Route to WhatsApp notification |
| **PWR-07** | L | Protected Admin Dashboard & CRM | `DONE AND VERIFIED` | `src/app/admin/page.tsx`, `src/app/api/admin/rfqs/route.ts` | Operational command center for orders & RFQs | **P0** | Admin Auth | Claude | 5h | Admin can view/edit order lifecycle and RFQ statuses | Configure secure `ADMIN_TOKEN` |
| **PWR-08** | N | First-Order Discount Voucher (`FIRST100`) | `DONE AND VERIFIED` | `src/app/api/coupons/validate/route.ts`, Test Suite 7 | Boosts first-time visitor conversion rate | **P1** | Order History | Claude | 2h | Grants ₹100 discount on cart ≥ ₹400 for 1st order only | Monitor coupon usage in Admin |
| **PWR-09** | M | Self-Service Order Tracking Portal | `DONE AND VERIFIED` | `src/app/track-order/page.tsx`, `src/app/api/orders/track/route.ts` | Reduces "Where Is My Order" support calls | **P1** | Order Schema | Claude | 3h | Tracks status via order number, phone, or tracking ID | Sync with logistics tracking API |
| **PWR-10** | D | Batch Inventory Deduction & Spoilage Guards | `DONE AND VERIFIED` | `src/lib/inventory-service.ts`, Test Suite 4 | Prevents overselling agricultural perishables | **P0** | Database | Claude | 3h | Atomic stock deduction; damage write-off tracking | Audit physical stock weekly |
| **PWR-11** | H | Programmatic Agricultural Buying Guides | `DONE AND VERIFIED` | `src/app/guides/[slug]/page.tsx` (5 guides) | Establishes domain authority & captures B2B search | **P1** | Static build | Claude | 4h | 5 comprehensive guides compiled into SSG routes | Monitor ranking keywords |
| **PWR-12** | B | APMC Mandi Spot Benchmark Feeds | `DONE AND VERIFIED` | `src/components/MandiTicker.tsx`, `/api/mandi/*` | Builds buyer trust with transparent farm-gate rates | **P1** | Mandi Service | Claude | 3h | Ticker shows live Tiptur & Shimoga Mandi rates | Update daily APMC rates in DB |
| **PWR-13** | F | Business Legal Documents & Statutory Registrations | `WAITING FOR OWNER INPUT` | `src/lib/constants.ts`, `.env.example` | Statutory legal protection & payment gateway KYC | **P0** | Government | Owner | 1-2 days | Actual GSTIN, FSSAI, IEC, Udyam registered | Owner to enter verified numbers in `.env.local` |
| **PWR-14** | E | Production Merchant UPI VPA & Bank Setup | `WAITING FOR OWNER INPUT` | `.env.local` (`NEXT_PUBLIC_UPI_VPA`) | Enables instant 0-fee UPI collections | **P0** | Bank Account | Owner | 1h | Live current account VPA (e.g. freshroots@icici) | Update `.env.local` with real VPA |
| **PWR-15** | P | Google Analytics 4 & Search Console Verification | `WAITING FOR OWNER INPUT` | `src/app/layout.tsx` (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) | Attribution tracking and organic indexation | **P0** | Google Account | Owner | 2h | HTML verification meta tag in DNS / GA4 ID populated | Add `G-XXXXXXXX` in `.env.local` |
| **PWR-16** | M | WhatsApp Business Cloud API or Webhook Desk | `WAITING FOR EXTERNAL ACCESS` | `src/lib/whatsapp.ts`, `src/app/api/orders/route.ts` | Instant order updates and direct buyer communication | **P1** | Meta Business | Owner | 1 day | Meta approved business account & WhatsApp phone | Fallback to click-to-chat active |
| **PWR-17** | M | Production 3rd-Party Logistics Carrier Integration | `WAITING FOR EXTERNAL ACCESS` | `src/lib/shipping.ts`, Shiprocket / Delhivery API | Automated AWB generation and courier dispatch | **P1** | Courier Account | Owner | 2 days | Real API keys for Shiprocket / Delhivery | Manual tracking number input currently works |
| **PWR-18** | E | Production Razorpay Gateway Activation | `WAITING FOR EXTERNAL ACCESS` | `src/app/api/razorpay/*` | Credit card / Netbanking payment acceptance | **P1** | Razorpay KYC | Owner | 2-3 days | Live Key ID & Secret configured in `.env.local` | Sandbox mode operational; live awaiting KYC |
| **PWR-19** | K | Outbound B2B Direct Outreach Execution | `WAITING FOR REAL-WORLD VALIDATION` | `generate_buyers_excel.py`, `docs/OUTBOUND_B2B_PLAYBOOK.md` | Generates export orders from GCC & domestic bulk buyers | **P1** | Sales Team | Owner | Ongoing | First 50 qualified trade inquiries dispatched | Owner to initiate email & WhatsApp campaigns |
| **PWR-20** | O | Kikkeri & Mandya Farmers' Network Procurement SOP | `WAITING FOR REAL-WORLD VALIDATION` | `docs/MANDI_PRICE_STRATEGY.md` | Secures continuous high-grade coconut & copra supply | **P0** | Farm Network | Owner | Ongoing | Supply contracts with 5 local copra dryers & growers | Formalize farm-gate procurement agreements |

---
**Summary**:
- **Total Registered Tasks**: 20
- **Completed & Verified by Claude**: 12 (100% of codebase, engineering, and architecture tasks)
- **Waiting for Owner Input / Credentials**: 3 (Legal certificates, Bank VPA, GA4 ID)
- **Waiting for External Vendor Access / KYC**: 3 (WhatsApp Cloud API, Courier API, Razorpay Live KYC)
- **Waiting for Real-World Field Validation**: 2 (Outbound sales outreach, Local farm supplier contracts)
