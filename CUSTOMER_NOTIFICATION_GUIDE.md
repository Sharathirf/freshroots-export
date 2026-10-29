# FreshRoots Export: Customer Notifications & Push Pipeline Guide

## 1. Supported Notification Channels
1. **WhatsApp Business Alerts**: Direct click-to-chat and webhook-driven WhatsApp templates for order and shipment updates.
2. **Web Push (FCM / PWA)**: Browser-based push notifications via service worker (`/api/push/messaging-sw.js`).
3. **Email Notifications**: Transactional emails sent via Resend for order confirmations, GST invoices, and dispatch alerts.
4. **In-App Account Notifications**: Visible in customer account dashboard.

## 2. Notification Events & Lifecycle
- `order_confirmed`: Triggered immediately when an order is created and paid.
- `order_dispatched`: Triggered when operations records a shipment with AWB and delivery partner.
- `shipment_update`: Triggered when an in-transit milestone or exception is posted.
- `order_delivered`: Triggered when a shipment is marked delivered.
- `reorder_reminder`: Triggered for customers due for restock.

## 3. Reliability & Security Controls
- **Idempotency**: All notifications use a unique `idempotency_key` (e.g. `notif_<orderId>_<eventType>`) to prevent duplicate messages when retried.
- **Privacy Shield**: Confidential operational comments, internal employee notes, and trade margins are strictly excluded from all customer-facing templates.
- **Preferences**: System checks `customers.communication_prefs` before dispatching.
