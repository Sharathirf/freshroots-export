import { Customer, CustomerPurchaseSummary, Order, CustomerComplaint } from '@/types';

export const CUSTOMER_TYPES = [
  { value: 'retail', label: 'Retail Consumer' },
  { value: 'wholesale', label: 'Wholesale / Bulk' },
  { value: 'export', label: 'Export / International' },
  { value: 'business', label: 'Business / Trader' },
] as const;

export const ORDER_SOURCES = [
  { value: 'website', label: 'Website Store' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp Chat' },
  { value: 'email', label: 'Email Order' },
  { value: 'in_person', label: 'In-Person / Mandi' },
  { value: 'admin', label: 'Admin Desk' },
] as const;

export const ORDER_CHANNELS = [
  { value: 'retail', label: 'Retail (B2C)' },
  { value: 'wholesale', label: 'Bulk Wholesale (B2B)' },
  { value: 'export', label: 'Export Corridors' },
] as const;

export const CALL_TYPES = [
  { value: 'feedback', label: 'Post-Delivery Feedback' },
  { value: 'repeat_order', label: 'Repeat Order Outreach' },
  { value: 'telephone_order', label: 'Inbound Telephone Order' },
  { value: 'callback', label: 'Requested Callback' },
  { value: 'complaint', label: 'Complaint / Quality Issue' },
  { value: 'support', label: 'General Support' },
] as const;

export const CALL_OUTCOMES = [
  { value: 'contacted', label: 'Successfully Contacted' },
  { value: 'interested', label: 'Interested in Reordering' },
  { value: 'order_taken', label: 'Order Confirmed & Placed' },
  { value: 'callback_requested', label: 'Callback Requested' },
  { value: 'no_answer', label: 'No Answer / Ringing' },
  { value: 'busy', label: 'Line Busy' },
  { value: 'wrong_number', label: 'Incorrect Contact Details' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'complaint_raised', label: 'Complaint Raised' },
  { value: 'escalated', label: 'Escalated to Management' },
] as const;

export const COMPLAINT_CATEGORIES = [
  { value: 'damaged_produce', label: 'Damaged / Spoiled Produce' },
  { value: 'delayed_delivery', label: 'Delayed Delivery / In-Transit Stall' },
  { value: 'short_delivery', label: 'Short Delivery / Missing Bags' },
  { value: 'quality_mismatch', label: 'Moisture / Quality Grade Mismatch' },
  { value: 'pricing_dispute', label: 'Freight or Pricing Discrepancy' },
  { value: 'support_issue', label: 'Service / Communication Issue' },
] as const;

export const SHIPMENT_PARTNERS = [
  { value: 'Shiprocket', label: 'Shiprocket (Surface Express)' },
  { value: 'Delhivery', label: 'Delhivery Surface' },
  { value: 'BlueDart', label: 'BlueDart Express' },
  { value: 'DTDC', label: 'DTDC Express' },
  { value: 'VRL Logistics', label: 'VRL Logistics (Part Truckload)' },
  { value: 'TCI Freight', label: 'TCI Freight (Full Truckload)' },
  { value: 'Direct Farm Fleet', label: 'Direct Farm Gate Fleet' },
] as const;

export const SHIPMENT_STATUSES = [
  { value: 'created', label: 'Shipment Created' },
  { value: 'awaiting_pickup', label: 'Awaiting Pickup' },
  { value: 'picked_up', label: 'Picked Up by Transporter' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'delayed', label: 'Transit Delayed' },
  { value: 'failed_attempt', label: 'Delivery Attempt Failed' },
  { value: 'returned', label: 'Returned to Hub' },
  { value: 'cancelled', label: 'Shipment Cancelled' },
] as const;

/**
 * Normalizes phone numbers to standard Indian 10-digit format
 */
export function normalizePhoneNumber(raw?: string | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

/**
 * Computes exact financial, retention, and segmentation metrics from actual order history
 */
export function computeCustomerMetrics(
  customer: Customer,
  orders: Order[] = [],
  complaints: CustomerComplaint[] = [],
  reorderDaysOverride?: number
): CustomerPurchaseSummary {
  const total_orders = orders.length;

  let successful_orders = 0;
  let cancelled_orders = 0;
  let returned_orders = 0;
  let total_sales_value = 0;
  let collected_revenue = 0;
  let outstanding_balance = 0;

  const productCounts: Record<string, { count: number; total_qty: number }> = {};
  const successfulDates: number[] = [];

  for (const o of orders) {
    const amount = Number(o.total_amount_inr) || 0;
    const isDelivered = o.status === 'delivered';
    const isPaid = o.status === 'paid' || (o as any).payment_status === 'paid';
    const isCancelled = o.status === 'cancelled';
    const isReturned = o.status === 'refunded' || (o as any).fulfilment_status === 'returned';

    if (isCancelled) {
      cancelled_orders++;
      continue;
    }

    if (isReturned) {
      returned_orders++;
      continue;
    }

    if (isDelivered || isPaid || o.status === 'allocated' || o.status === 'packed' || o.status === 'dispatched') {
      successful_orders++;
      total_sales_value += amount;
      successfulDates.push(new Date(o.created_at).getTime());

      // Track revenue vs outstanding
      if (isPaid || isDelivered) {
        collected_revenue += amount;
      } else {
        outstanding_balance += amount;
      }

      // Track products
      const items = Array.isArray(o.items) ? o.items : [];
      for (const item of items) {
        const title = item.title || 'Agricultural Produce';
        if (!productCounts[title]) {
          productCounts[title] = { count: 0, total_qty: 0 };
        }
        productCounts[title].count++;
        productCounts[title].total_qty += Number(item.quantity) || 1;
      }
    }
  }

  // Sort dates descending
  successfulDates.sort((a, b) => b - a);
  const last_order_date = successfulDates[0] ? new Date(successfulDates[0]).toISOString() : undefined;
  const previous_order_date = successfulDates[1] ? new Date(successfulDates[1]).toISOString() : undefined;

  // Calculate repeat frequency in days
  let repeat_purchase_frequency_days: number | undefined;
  if (successfulDates.length >= 2) {
    const intervals: number[] = [];
    for (let i = 0; i < successfulDates.length - 1; i++) {
      const diffDays = Math.round((successfulDates[i] - successfulDates[i + 1]) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) intervals.push(diffDays);
    }
    if (intervals.length > 0) {
      repeat_purchase_frequency_days = Math.round(
        intervals.reduce((acc, v) => acc + v, 0) / intervals.length
      );
    }
  }

  const average_order_value = successful_orders > 0 ? Math.round(total_sales_value / successful_orders) : 0;

  // Top products
  const frequent_products = Object.entries(productCounts)
    .map(([title, val]) => ({ title, count: val.count, total_qty: val.total_qty }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 5);

  // Recommended reorder interval
  const recommended_reorder_days =
    reorderDaysOverride ||
    (customer.customer_type === 'wholesale' ? 21 : customer.customer_type === 'export' ? 45 : 30);

  // Days since last order
  let days_since_last_order: number | undefined;
  if (last_order_date) {
    days_since_last_order = Math.max(
      0,
      Math.floor((Date.now() - new Date(last_order_date).getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  // Determine reorder status
  let reorder_status: 'due' | 'overdue' | 'ok' | 'inactive' = 'ok';
  if (days_since_last_order !== undefined) {
    if (days_since_last_order > 60) {
      reorder_status = 'inactive';
    } else if (days_since_last_order > recommended_reorder_days + 5) {
      reorder_status = 'overdue';
    } else if (days_since_last_order >= recommended_reorder_days - 3) {
      reorder_status = 'due';
    } else {
      reorder_status = 'ok';
    }
  } else {
    reorder_status = 'inactive';
  }

  // Dynamic Segment determination
  const hasOpenComplaint = complaints.some((c) => c.status === 'open' || c.status === 'escalated');
  const highValueThreshold = customer.customer_type === 'retail' ? 25000 : 200000;

  let segment = 'New Customer';
  let segment_reason = 'Recently registered with 0 completed orders.';

  if (hasOpenComplaint) {
    segment = 'Recent Complaint';
    segment_reason = 'Has unresolved complaint requiring customer care escalation before reorder.';
  } else if (outstanding_balance > 0) {
    segment = 'Outstanding Balance';
    segment_reason = `Unsettled balance of ₹${outstanding_balance.toLocaleString('en-IN')} pending reconciliation.`;
  } else if (total_sales_value >= highValueThreshold) {
    segment = customer.customer_type === 'wholesale' ? 'High-Value Wholesale Buyer' : 'High-Value Retail Customer';
    segment_reason = `High-spend account with ₹${total_sales_value.toLocaleString('en-IN')} across ${successful_orders} orders.`;
  } else if (reorder_status === 'overdue') {
    segment = 'Overdue for Reorder';
    segment_reason = `Last order delivered ${days_since_last_order} days ago (exceeds ${recommended_reorder_days}d interval).`;
  } else if (reorder_status === 'due') {
    segment = 'Customers Due for Reorder';
    segment_reason = `Due for standard restock (${days_since_last_order} days since last consignment).`;
  } else if (successful_orders >= 2) {
    segment = 'Repeat Customer';
    segment_reason = `${successful_orders} completed orders, last delivered ${days_since_last_order ?? 0} days ago.`;
  } else if (successful_orders === 1) {
    segment = 'First-Time Buyer';
    segment_reason = `Completed 1 order of ₹${total_sales_value.toLocaleString('en-IN')}. Target for post-delivery feedback.`;
  } else if (reorder_status === 'inactive' && total_orders > 0) {
    segment = 'Inactive Customer';
    segment_reason = `No completed purchase in over 60 days. Re-engagement needed.`;
  }

  return {
    total_orders,
    successful_orders,
    cancelled_orders,
    returned_orders,
    total_sales_value,
    collected_revenue,
    outstanding_balance,
    average_order_value,
    last_order_date,
    previous_order_date,
    frequent_products,
    repeat_purchase_frequency_days,
    segment,
    segment_reason,
    reorder_status,
    recommended_reorder_days,
    days_since_last_order,
  };
}

/**
 * Checks for duplicate customer profiles by Phone, Email or Company
 */
export function findPotentialDuplicates(
  candidate: { phone?: string; email?: string; company_name?: string; id?: string },
  existingList: Customer[]
): Customer[] {
  const normPhone = normalizePhoneNumber(candidate.phone);
  const normEmail = candidate.email?.trim().toLowerCase();
  const normCompany = candidate.company_name?.trim().toLowerCase();

  return existingList.filter((c) => {
    if (candidate.id && c.id === candidate.id) return false;
    if (normPhone && normalizePhoneNumber(c.phone) === normPhone) return true;
    if (normEmail && c.email?.trim().toLowerCase() === normEmail) return true;
    if (normCompany && c.company_name?.trim().toLowerCase() === normCompany) return true;
    return false;
  });
}

/**
 * Formats notification messages for customers from actual verified data
 */
export function formatCustomerNotification(
  eventType: string,
  data: {
    order_number: string;
    customer_name?: string;
    delivery_partner?: string;
    tracking_number?: string;
    estimated_delivery?: string;
    shipment_status?: string;
    items_summary?: string;
    total_inr?: number;
  }
): { title: string; message: string } {
  const customerName = data.customer_name || 'Valued Customer';

  switch (eventType) {
    case 'order_confirmed':
      return {
        title: `Order ${data.order_number} Confirmed`,
        message: `Namaskara ${customerName}, your FreshRoots Export order ${data.order_number} (${data.items_summary || 'Farm Commodities'}, ₹${Number(data.total_inr || 0).toLocaleString('en-IN')}) has been confirmed. Direct farm-gate allocation has commenced.`,
      };

    case 'order_dispatched':
      return {
        title: `Order ${data.order_number} Dispatched`,
        message: `Your FreshRoots Export order ${data.order_number} has been dispatched through ${data.delivery_partner || 'Surface Carrier'}. Tracking number: ${data.tracking_number || 'Assigned'}.${data.estimated_delivery ? ` Estimated delivery: ${data.estimated_delivery}.` : ''}`,
      };

    case 'shipment_update':
      return {
        title: `Shipment Update: ${data.order_number}`,
        message: `Shipment update for order ${data.order_number}: Currently ${data.shipment_status || 'In Transit'}. Live parcel tracking available in your account.`,
      };

    case 'order_delivered':
      return {
        title: `Order ${data.order_number} Delivered`,
        message: `Your FreshRoots Export order ${data.order_number} has been delivered. Thank you for sourcing directly from Tiptur Mandi farmer clusters! Please let us know your feedback.`,
      };

    case 'reorder_reminder':
      return {
        title: `Time to Restock Your Farm Produce`,
        message: `Namaskara ${customerName}, based on your regular consumption of ${data.items_summary || 'Fresh Produce'}, you may be due for a restock. Tap to place a repeat order with 1-click.`,
      };

    default:
      return {
        title: `Order Update: ${data.order_number}`,
        message: `FreshRoots Export update for order ${data.order_number}.`,
      };
  }
}
