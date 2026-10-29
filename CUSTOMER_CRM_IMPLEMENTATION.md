# FreshRoots Export: Customer CRM & Segmentation Implementation

## 1. Overview
The FreshRoots Export Customer CRM consolidates retail consumers, mandi wholesale traders, and international export buyers into a single centralized customer database. Every customer is assigned a unique `customer_code` (e.g. `CUST-1001`), and their complete interaction history—orders, quotations, telephone calls, structured feedback, and complaints—is linked to their verified phone number and profile.

## 2. Customer Profile Schema (`customers` table)
- `id` (UUID Primary Key)
- `customer_code` (Unique identifier, e.g. `CUST-1001`)
- `customer_type` (`retail`, `wholesale`, `export`, `business`)
- `name` (Individual buyer or company contact)
- `company_name` (Business entity or Mandi shop name)
- `contact_person` (Designated trade representative)
- `phone` (Indexed, normalized 10-digit Indian phone number)
- `email` (Optional verified email)
- `shipping_address` & `billing_address`
- `city`, `state`, `pincode`, `country`
- `acquisition_source` (`website`, `phone`, `whatsapp`, `email`, `in_person`, `mandi_outreach`)
- `account_status` (`active`, `dormant`, `blocked`)
- `assigned_rep` (Staff owner for account relationship)
- `communication_prefs` (JSONB: `{ email: true, whatsapp: true, sms: true, push: true }`)
- `marketing_consent` (Boolean)
- `internal_notes` (Internal-only staff notes)
- `merged_into` (UUID pointer if merged into another primary customer profile)

## 3. Dynamic Customer Segmentation Engine
Segmentation is calculated on the fly using actual order performance:
1. **High-Value Customer**: Total confirmed spend ≥ ₹25,000 (Retail) or ≥ ₹2,00,000 (Wholesale / Export).
2. **Repeat Customer**: 2 or more completed consignments.
3. **Due for Reorder**: Days since last delivered consignment is near the product/type restock target (e.g. 21 days for wholesale, 30 days for retail).
4. **Overdue for Reorder**: Days since last delivered consignment exceeds target interval + buffer.
5. **First-Time Buyer**: Exactly 1 completed order; prioritized for post-delivery feedback calls.
6. **Recent Complaint**: Has an unresolved complaint requiring care escalation before sales follow-up.
7. **Outstanding Balance**: Has delivered orders with unsettled payment balances.
8. **Inactive / Dormant**: Registered with orders but no purchase in over 60 days.

## 4. Duplicate Matching & Merge Protocol
- Customers are identified by normalized 10-digit mobile phone numbers and email addresses.
- When duplicates occur (e.g. guest web order vs phone order with the same phone number), the system detects the match.
- Authorized administrators can review the merge: all linked orders, calls, feedback, complaints, and shipments are safely repointed to the primary customer ID, and the duplicate is marked `account_status = 'dormant'` with an audit stamp.
