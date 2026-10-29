# FreshRoots Export: UAT Test Execution Report

**Date**: October 29, 2026
**Scope**: Customer CRM, Repeat Sales, Admin Orders, Shipments & Customer Notifications
**Total Automated Tests Passed**: 112 / 112
**Next.js Production Build**: PASSED (61/61 static/SSG pages generated, 0 compile errors)

---

## 1. Automated Test Suites Summary

| Test Suite | File | Cases | Status |
|---|---|---|---|
| Agricultural Pricing & Tax Compliance | `src/tests/run-tests.ts` | 32 | ✅ 32 Passed |
| Technical SEO, JSON-LD & Metadata | `src/tests/test-seo-foundation.ts` | 11 | ✅ 11 Passed |
| B2B RFQ, Quotations & Operations Lifecycle | `src/tests/test-b2b-operations-workflow.ts` | 23 | ✅ 23 Passed |
| Customer CRM, Repeat Orders, Admin Orders & Shipments | `src/tests/test-crm-shipments-workflow.ts` | 46 | ✅ 46 Passed |
| **Total** | | **112** | **✅ 100% Passed** |

---

## 2. UAT Verification Checklist for Staff

### Customer CRM & Accounts
- [x] Centralized customer database accessible at `/admin` (Tab: *Customer CRM & Accounts*).
- [x] Search by name, 10-digit phone, customer code, or company name.
- [x] Filter by Customer Type: Retail, Wholesale, Export, Business.
- [x] Filter by Dynamic Segment: High-Value, Repeat, Due for Reorder, Overdue, Outstanding Balance, Recent Complaint.
- [x] Customer Dossier modal opens with purchase metrics, order history, support calls, ratings, and complaints.
- [x] Duplicate detection by phone number with merge review workflow.

### Repeat Sales & Retention
- [x] Dedicated workspace at `/admin` (Tab: *Repeat Sales & Retention*).
- [x] Live counters for Due for Reorder, Overdue for Reorder, High-Value Inactive, and Scheduled Callbacks.
- [x] Restock interval calculates from actual order delivery dates (copra 30d, arecanut 45d, wholesale 21d).
- [x] Reorder outreach is halted if customer has an unresolved complaint.
- [x] Quick-action button: *Create Repeat Order Draft* pre-fills customer and historical items.

### Admin-Created Orders (Phone & WhatsApp)
- [x] *+ Create Order (Phone / WhatsApp)* modal accessible from orders tab and customer dossier.
- [x] Search and select existing customer or auto-create new customer.
- [x] Official 11 catalog products with accurate farm-gate prices and taxes (0% GST for coconuts, 5% for copra).
- [x] Mandatory customer consent source input prevents accidental or unauthorized orders.
- [x] Generates unique order number `AGR-YYYYMMDD-XXXX` and links to customer profile.

### Shipment Tracking & Logistics
- [x] Dedicated workspace at `/admin` (Tab: *Shipments & Logistics*).
- [x] Record dispatch against order with partner (Shiprocket, Delhivery, VRL, TCI, Direct Fleet).
- [x] Support courier tracking numbers and bulk road freight (vehicle number, driver name/phone, LR number).
- [x] Multi-shipment support (multiple consignments per order).
- [x] Customer tracking view at `/track-order` displays verified transporter, tracking link, and milestone history.

### Customer Notifications
- [x] Order confirmed, dispatched, milestone updated, and delivered notification templates.
- [x] Idempotency keys prevent duplicate message dispatch.
- [x] Customer privacy strictly maintained (internal notes and staff observations never sent to buyer).
