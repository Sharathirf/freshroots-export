# FreshRoots Export: Repeat Order & Retention Workflow

## 1. Business Logic & Reorder Intervals
Agricultural commodities have predictable consumption and inventory turnover cycles. Rather than treating all products equally, the system configures product- and customer-specific reorder intervals:
- **Semi-Husked Coconuts (25-Piece / 50-Piece Bags)**: 25 - 35 days (household & commercial kitchen restock).
- **Milling & Ball Copra**: 21 - 30 days (oil extraction & retail confectionery batches).
- **Areca Nut (Rashi / Bette)**: 45 days (pan masala processing runs).
- **Wholesale Truckloads**: 21 days (market mandi distribution cycle).
- **Export Containers**: 45 days (ocean transit & port clearance cycle).

## 2. Retention States
1. **OK**: Customer ordered recently; no follow-up needed.
2. **Due for Reorder**: Days since last delivered order is within 3 days of recommended interval. Flagged on repeat dashboard.
3. **Overdue for Reorder**: Exceeds recommended interval by more than 5 days. High priority for proactive call.
4. **Inactive / Dormant**: More than 60 days without an order. Candidate for re-engagement or mandi price alert.

## 3. Operational Safeguards
- **Never Auto-Confirm**: Reorder reminders flag opportunities for the sales/support desk; they **never** automatically create a confirmed order without explicit customer authorization.
- **Complaint Precedence**: If a customer has an open or escalated complaint (`customer_complaints`), sales repeat outreach is halted until the issue is formally marked resolved.
