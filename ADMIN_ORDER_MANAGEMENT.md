# FreshRoots Export: Admin Order Management & Offline Sales

## 1. Multi-Channel Order Sourcing
Orders enter FreshRoots Export through multiple distinct channels:
1. **Website Store (`website`)**: Self-service retail or wholesale checkout.
2. **Phone Orders (`phone`)**: Customer called support desk to order farm commodities.
3. **WhatsApp Orders (`whatsapp`)**: Inbound negotiation or reorder request over WhatsApp.
4. **Email Orders (`email`)**: Written purchase order sent via email.
5. **In-Person Orders (`in_person`)**: Farm-gate or Mandi yard spot purchase.
6. **Admin Orders (`admin`)**: Placed by administrative staff.

## 2. Admin Order Placement Protocol
1. **Customer Selection**: Search for existing customer or quickly register a new customer profile.
2. **Product Line Items**: Select from the official 11 catalog products (reusing official prices, weights, unit of measure, and tax rates).
3. **Tax & Freight Calculation**:
   - Fresh Coconuts (HSN 080112): 0.00% GST.
   - Copra (HSN 1203): 5.00% GST.
   - Delivery / Freight: 100% Free Doorstep Delivery for standard retail or custom vehicle road freight.
4. **Mandatory Consent Verification**: Staff must enter an explicit customer consent source note (e.g. *"Customer agreed on WhatsApp chat at 10:45 AM confirming 20 bags Semi-Husked Coconuts"*).
5. **Initial Order Lifecycle**:
   - `Confirmed & Paid`: Triggers inventory reservation and allocation.
   - `Payment Pending`: Issues invoice and awaits bank/UPI confirmation.
   - `Draft`: Saved for internal review before customer confirmation.
6. **Audit & Notifications**: Creates an audit trail event and sends an instant order confirmation notification.
