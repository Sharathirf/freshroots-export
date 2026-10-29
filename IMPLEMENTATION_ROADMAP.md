# FreshRoots Export — 7-Stage Implementation Roadmap

**Application**: FreshRoots Export Agricultural Platform  
**Target Market**: Domestic India (Primary) & International Export Corridors (Secondary)  
**Architecture**: Next.js 15, PostgreSQL, TypeScript, Tailwind CSS  

---

## Roadmap Overview

```mermaid
flowchart LR
    S1["Stage 1: Foundation & Data Integrity"] --> S2["Stage 2: Auth & Session Continuity"]
    S2 --> S3["Stage 3: Checkout & Dynamic UPI"]
    S3 --> S4["Stage 4: Wholesale B2B RFQ & CRM"]
    S4 --> S5["Stage 5: SEO & Organic Marketing"]
    S5 --> S6["Stage 6: Integrations & Hosting"]
    S6 --> S7["Stage 7: Commercial Scale"]
```

---

## Stage-by-Stage Breakdown

### Stage 1: Foundation, Data Integrity & Architectural Hardening
* **Objective**: Build the core database models, product schemas, inventory batch deduction logic, and statutory tax rules.
* **Key Deliverables**:
  - PostgreSQL database schema with tables for `products`, `orders`, `inventory_batches`, `wholesale_quotations`, `users`, and `reviews`.
  - Agricultural tax calculation engine adhering strictly to Indian GST codes (`src/lib/pricing.ts`).
  - Strict FIFO inventory deduction preventing negative stock or overselling (`src/lib/inventory-service.ts`).
* **Dependencies**: PostgreSQL instance.
* **Responsible Party**: Claude (Software Architect).
* **Acceptance Criteria**: Automated test suite (Test Suites 1 & 4) passes 100% with zero regressions.
* **Status**: `COMPLETED & VERIFIED`

---

### Stage 2: Authentication, Security & Session Continuity
* **Objective**: Implement secure customer onboarding via 10-digit Indian mobile number verification and auth-gate sensitive actions with seamless resumption.
* **Key Deliverables**:
  - Native OTP verification API (`/api/auth/otp`) generating and verifying cryptographic 6-digit one-time passwords.
  - Seamless auth-gate wrappers in `AuthContext`, `CartContext`, and `WishlistContext`.
  - Sign-in modal displaying contextual messaging (e.g. *"Sign in to add fresh coconuts to your cart"*).
  - Post-verification auto-execution of the user's intended action without duplicate button clicks.
* **Dependencies**: React context and session storage.
* **Responsible Party**: Claude (Full-Stack Engineer).
* **Acceptance Criteria**: Guest user attempting to add product to cart or view watchlist is prompted to sign in; upon verification, item is automatically added.
* **Status**: `COMPLETED & VERIFIED`

---

### Stage 3: Checkout, Dynamic UPI Reconciliation & Order Processing
* **Objective**: Streamline high-conversion checkout while solving UPI transaction reconciliation without manual UTR lookup.
* **Key Deliverables**:
  - Slide-over checkout drawer (`src/components/CartDrawer.tsx`) requiring verified mobile number.
  - Pre-allocated order intent generation in database with status `pending_payment`.
  - Dynamic UPI QR generator embedding `order_number` directly into UPI transaction note (`tn`) and transaction reference (`tr`).
  - Real-time UTR submission and reconciliation API (`/api/orders`).
  - First-order ₹100 discount coupon engine (`FIRST100`) validated against historical customer orders.
* **Dependencies**: Stage 2 authentication.
* **Responsible Party**: Claude (Full-Stack Engineer).
* **Acceptance Criteria**: UPI QR URL contains valid `upi://pay?pa=...&tn=Order_FR-XXXXX`; order is trackable immediately.
* **Status**: `COMPLETED & VERIFIED`

---

### Stage 4: Wholesale B2B RFQ Pipeline, CRM & Price Secrecy
* **Objective**: Capture and process institutional bulk inquiries (temple trusts, supermarkets, exporters) with full pricing privacy.
* **Key Deliverables**:
  - Tonnage-based wholesale inquiry modal (`src/components/WholesaleModal.tsx`).
  - Dual-mode submission (minimal phone/email or detailed GSTIN/port specification).
  - Protected administrative dashboard (`/admin`) with RFQ lifecycle management (`new` -> `contacted` -> `quoted` -> `won`).
  - Strict wholesale pricing privacy: wholesale benchmarks stripped from public client endpoints.
* **Dependencies**: PostgreSQL `wholesale_quotations` table.
* **Responsible Party**: Claude (Backend & CRM Engineer).
* **Acceptance Criteria**: Test Suite 5 passes; RFQs submitted via website appear immediately in `/admin` with full contact details and volume.
* **Status**: `COMPLETED & VERIFIED`

---

### Stage 5: Zero-Budget Technical SEO, Content Marketing & Organic Discovery
* **Objective**: Maximize organic Google search traffic for high-intent commercial agricultural terms at ₹0 marketing cost.
* **Key Deliverables**:
  - Schema.org JSON-LD generation for `Product`, `Offer`, `BreadcrumbList`, `Organization`, `Article`, `FAQPage`, and `ItemList`.
  - Dynamic XML sitemap (`/sitemap.xml`) indexing all 11 commodities, 7 categories, and educational guides.
  - 5 comprehensive programmatic agricultural buying and grading guides (`src/app/guides/[slug]`).
  - APMC Mandi spot price ticker displaying live market benchmarks.
* **Dependencies**: Static page generation in Next.js 15.
* **Responsible Party**: Claude (Technical SEO Specialist).
* **Acceptance Criteria**: 11/11 automated SEO tests pass; all 61 static routes compile successfully in Next.js production build.
* **Status**: `COMPLETED & VERIFIED`

---

### Stage 6: External Integrations, Production Deployment & Legal Hardening
* **Objective**: Transition application from staging environment to public live commercial production.
* **Key Deliverables**:
  - Production database setup on managed cloud PostgreSQL (Supabase / RDS).
  - Deployment of Next.js production build to Vercel or cloud VPS with custom domain (`freshrootsexport.com`).
  - Configuration of production environment variables (`DATABASE_URL`, `NEXT_PUBLIC_UPI_VPA`, `ADMIN_TOKEN`, `CRON_SECRET`).
  - Integration of transactional SMS gateway (Fast2SMS/Twilio) and WhatsApp Business API.
  - Setup of Google Search Console and GA4 properties.
* **Dependencies**: Owner action and vendor account verifications.
* **Responsible Party**: Business Owner (assisted by Claude architectural documentation).
* **Acceptance Criteria**: Live HTTPS website loads under 1.5 seconds; payments reach owner bank account; emails and SMS fire.
* **Status**: `READY FOR OWNER EXECUTION`

---

### Stage 7: Commercial Scale, Outbound B2B Outreach & Supply Optimization
* **Objective**: Generate recurring agricultural revenue through proactive sales campaigns and farmer network partnerships.
* **Key Deliverables**:
  - Execution of GCC & domestic wholesale outreach using compiled buyer database (`generate_buyers_excel.py`).
  - Dispatch of commercial sample boxes to institutional procurement heads.
  - Formalization of direct farm-gate procurement contracts across Kikkeri, K.R. Pet, and Tiptur belts.
  - Implementation of weekly inventory audits and bulk freight logistics contracts.
* **Dependencies**: Stages 1 through 6.
* **Responsible Party**: Business Owner & Sales Team.
* **Acceptance Criteria**: First 5 commercial B2B wholesale orders closed and fulfilled; positive cash flow established.
* **Status**: `SCHEDULED POST-LAUNCH`
