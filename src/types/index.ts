// TypeScript type definitions for Tiptur Direct Agri-Commerce Platform

export type ProductCategory =
  | 'mature_coconut'
  | 'copra'
  | 'arecanut'
  | 'spices'
  | 'oil_and_extracts'
  | 'coir_commodities'
  | 'value_added';

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  category: ProductCategory;
  grade: string;
  origin: string;
  unit_of_measure: string;
  estimated_weight_kg: number;
  moisture_percentage: number | null;
  oil_percentage: number | null;
  retail_price_inr: number;
  bulk_min_quantity: number;
  wholesale_benchmark_price_inr: number;
  hsn_code: string;
  tax_rate_percentage: number;
  description: string;
  specifications: Record<string, string>;
  image_url: string;
  average_rating?: number;
  review_count?: number;
  is_active: boolean;
  available_stock?: number;
}

export interface ServiceablePincode {
  pincode: string;
  district: string;
  state: string;
  hub_location: string;
  delivery_lead_days: number;
  is_retail_active: boolean;
  is_wholesale_active: boolean;
}

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'allocated'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  product_id: string;
  sku: string;
  title: string;
  unit_of_measure: string;
  quantity: number;
  unit_price_inr: number;
  total_price_inr: number;
  tax_rate_percentage?: number;
  estimated_weight_kg: number;
  item_key?: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: 'retail' | 'wholesale';
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  destination_pincode: string;
  subtotal_inr: number;
  delivery_fee_inr: number;
  tax_inr: number;
  total_amount_inr: number;
  payment_method: string;
  payment_reference?: string;
  tracking_reference?: string;
  carrier?: string;
  delivery_lead_days?: number;
  discount_inr?: number;
  coupon_code?: string;
  whatsapp_alert_url?: string;
  items: OrderItem[];
  created_at: string;
}

export type QuotationStatus =
  // Stage A: RFQ Intake & Review
  | 'submitted'
  | 'new_rfq'
  | 'under_review'
  | 'needs_information'
  | 'ready_to_quote'
  | 'on_hold'
  | 'rejected'
  | 'cancelled'
  // Stage B: Quotation & Negotiation
  | 'quotation_draft'
  | 'pending_approval'
  | 'quote_issued'
  | 'discussion_in_progress'
  | 'revision_requested'
  | 'revised_quotation_issued'
  | 'accepted'
  | 'expired';

export type B2bPaymentStatus =
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded';

export type B2bFulfilmentStatus =
  | 'not_started'
  | 'procurement_in_progress'
  | 'quality_check'
  | 'ready_for_dispatch'
  | 'partially_dispatched'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivery_exception'
  | 'partially_delivered'
  | 'delivered'
  | 'returned'
  | 'completed';

export type ActivityVisibility = 'internal_note' | 'ops_update' | 'buyer_visible';

export type CommunicationChannel =
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'meeting'
  | 'web_inquiry'
  | 'video'
  | 'internal'
  | 'other';

export type StaffRole =
  | 'sales'
  | 'quotation_manager'
  | 'operations'
  | 'finance'
  | 'management'
  | 'admin';

export interface WholesaleQuotation {
  id: string;
  quote_number: string;
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email?: string;
  gstin?: string;
  product_id?: string;
  product_title: string;
  requested_quantity: number;
  unit: string;
  destination_city: string;
  destination_pincode: string;
  delivery_address?: string;
  preferred_delivery_date?: string;
  proposed_unit_price_inr?: number;
  freight_charges_inr?: number;
  total_quote_inr?: number;
  status: QuotationStatus;
  valid_until?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  // B2B Operational & Governance Extensions
  sales_owner_name?: string;
  operations_owner_name?: string;
  revision_number?: number;
  rejection_category?: string;
  rejection_reason?: string;
  rejection_notes?: string;
  rejection_actor?: string;
  rejection_timestamp?: string;
  reopen_reason?: string;
  reopened_by?: string;
  reopened_at?: string;
  payment_status?: B2bPaymentStatus;
  fulfilment_status?: B2bFulfilmentStatus;
  internal_notes?: string;
  // Linked entities count / summary
  activity_count?: number;
  discussion_count?: number;
  pending_followup_count?: number;
}

export interface RfqActivity {
  id: string;
  rfq_id: string;
  order_id?: string;
  quotation_revision: number;
  activity_type: string;
  activity_title: string;
  description?: string;
  previous_status?: string;
  new_status?: string;
  comments?: string;
  reason?: string;
  communication_source?: string;
  acting_user: string;
  actor_role: StaffRole;
  visibility: ActivityVisibility;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RfqDiscussion {
  id: string;
  rfq_id: string;
  discussion_date: string;
  communication_channel: CommunicationChannel;
  channel_other_explanation?: string;
  employee_name: string;
  employee_role: StaffRole;
  buyer_contact_person: string;
  discussion_summary: string;
  buyer_concerns?: string;
  price_changes_requested?: string;
  spec_changes_requested?: string;
  delivery_terms?: string;
  payment_terms?: string;
  commercial_commitments?: string;
  outstanding_questions?: string;
  next_action?: string;
  followup_due_date?: string;
  responsible_employee?: string;
  visibility: ActivityVisibility;
  created_at: string;
}

export interface QuotationRevision {
  id: string;
  rfq_id: string;
  revision_number: number;
  quote_number: string;
  proposed_unit_price_inr: number;
  freight_charges_inr: number;
  total_quote_inr: number;
  requested_quantity: number;
  unit: string;
  change_reason: string;
  created_by: string;
  status: string;
  valid_until?: string;
  notes?: string;
  created_at: string;
}

export interface B2bHandover {
  id: string;
  rfq_id: string;
  order_id?: string;
  initiated_by: string;
  operations_owner: string;
  product_specs?: string;
  confirmed_quantity: number;
  unit: string;
  quotation_revision: number;
  destination: string;
  commercial_terms?: string;
  payment_terms?: string;
  packaging_requirements?: string;
  delivery_commitments?: string;
  quality_requirements?: string;
  buyer_discussions_summary?: string;
  outstanding_questions?: string;
  required_ops_actions?: string;
  handover_status: 'pending_acknowledgement' | 'acknowledged' | 'needs_clarification';
  acknowledged_by?: string;
  acknowledged_at?: string;
  acknowledgement_comments?: string;
  created_at: string;
}

export interface B2bFulfilment {
  id: string;
  rfq_id: string;
  order_id?: string;
  procurement_status: 'not_started' | 'in_progress' | 'sourced' | 'delayed';
  procurement_source?: string;
  procurement_expected_readiness?: string;
  procurement_notes?: string;
  quality_status: 'pending' | 'passed' | 'failed' | 'conditional_pass';
  quality_inspector?: string;
  quality_inspected_quantity?: number;
  quality_inspection_date?: string;
  quality_observations?: string;
  dispatch_status: 'pending' | 'ready_for_dispatch' | 'partially_dispatched' | 'dispatched';
  dispatched_quantity: number;
  dispatch_date?: string;
  transporter_name?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  lr_number?: string;
  tracking_reference?: string;
  bag_or_box_count?: number;
  delivery_status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivery_exception' | 'partially_delivered' | 'delivered' | 'returned' | 'completed';
  delivered_quantity: number;
  delivery_date?: string;
  recipient_name?: string;
  delivery_remarks?: string;
  delivery_exception_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface B2bPayment {
  id: string;
  rfq_id: string;
  order_id?: string;
  confirmed_order_value_inr: number;
  amount_paid_inr: number;
  payment_method: string;
  transaction_reference: string;
  payment_date: string;
  recorded_by: string;
  reconciliation_status: 'pending_reconciliation' | 'reconciled' | 'disputed';
  reconciled_by?: string;
  reconciled_at?: string;
  payment_notes?: string;
  created_at: string;
}

export interface B2bFollowup {
  id: string;
  rfq_id: string;
  followup_type: string;
  due_date: string;
  responsible_employee: string;
  assigned_by: string;
  notes?: string;
  status: 'pending' | 'completed' | 'rescheduled' | 'cancelled';
  completed_at?: string;
  completion_notes?: string;
  created_at: string;
}

export interface InventoryBatch {
  id: string;
  batch_number: string;
  product_id: string;
  product_title?: string;
  origin_mandi: string;
  intake_date: string;
  initial_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  damaged_quantity: number;
  cost_per_unit_inr: number;
}

export interface CustomerAddress {
  id: string;
  customer_phone: string;
  recipient_name?: string;
  phone?: string;
  tag: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  product_title?: string;
  product_slug?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_buyer: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// Customer CRM, Order Management, Shipments & Notifications
// ============================================================================

export type CustomerType = 'retail' | 'wholesale' | 'export' | 'business';
export type OrderSource = 'website' | 'phone' | 'whatsapp' | 'email' | 'in_person' | 'admin';
export type OrderChannel = 'retail' | 'wholesale' | 'export';
export type CustomerAccountStatus = 'active' | 'dormant' | 'blocked';

export interface Customer {
  id: string;
  customer_code: string;
  customer_type: CustomerType;
  name: string;
  company_name?: string;
  contact_person?: string;
  phone: string;
  email?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  acquisition_source: string;
  account_status: CustomerAccountStatus;
  assigned_rep?: string;
  communication_prefs: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
    push: boolean;
  };
  marketing_consent: boolean;
  internal_notes?: string;
  user_id?: string;
  merged_into?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerPurchaseSummary {
  total_orders: number;
  successful_orders: number;
  cancelled_orders: number;
  returned_orders: number;
  total_sales_value: number;
  collected_revenue: number;
  outstanding_balance: number;
  average_order_value: number;
  last_order_date?: string;
  previous_order_date?: string;
  frequent_products: { title: string; count: number; total_qty: number }[];
  repeat_purchase_frequency_days?: number;
  segment: string;
  segment_reason: string;
  reorder_status: 'due' | 'overdue' | 'ok' | 'inactive';
  recommended_reorder_days: number;
  days_since_last_order?: number;
}

export type CallType = 'feedback' | 'repeat_order' | 'callback' | 'complaint' | 'support' | 'telephone_order';
export type CallOutcome =
  | 'contacted'
  | 'interested'
  | 'order_taken'
  | 'callback_requested'
  | 'no_answer'
  | 'busy'
  | 'wrong_number'
  | 'not_interested'
  | 'complaint_raised'
  | 'escalated';

export interface CustomerCall {
  id: string;
  customer_id: string;
  order_id?: string;
  call_type: CallType;
  call_outcome: CallOutcome;
  summary: string;
  rep_name: string;
  call_date: string;
  reorder_interest: boolean;
  requested_products?: any[];
  next_action?: string;
  next_action_due?: string;
  internal_notes?: string;
  created_at: string;
}

export interface CustomerFeedback {
  id: string;
  customer_id: string;
  order_id?: string;
  product_quality_rating?: number;
  quantity_accuracy_rating?: number;
  packaging_rating?: number;
  delivery_rating?: number;
  pricing_satisfaction_rating?: number;
  overall_rating?: number;
  feedback_text?: string;
  source: 'phone_call' | 'whatsapp' | 'website_review';
  created_at: string;
}

export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintCategory =
  | 'damaged_produce'
  | 'delayed_delivery'
  | 'short_delivery'
  | 'quality_mismatch'
  | 'pricing_dispute'
  | 'support_issue';
export type ComplaintStatus = 'open' | 'investigating' | 'resolved' | 'escalated' | 'closed';

export interface CustomerComplaint {
  id: string;
  complaint_number: string;
  customer_id: string;
  order_id?: string;
  severity: ComplaintSeverity;
  category: ComplaintCategory;
  description: string;
  assigned_to?: string;
  deadline?: string;
  status: ComplaintStatus;
  resolution_notes?: string;
  customer_acknowledgment?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus =
  | 'created'
  | 'awaiting_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed'
  | 'failed_attempt'
  | 'returned'
  | 'cancelled';

export interface Shipment {
  id: string;
  shipment_number: string;
  order_id: string;
  customer_id?: string;
  delivery_partner: string;
  shipment_type: 'courier' | 'truckload' | 'part_truckload' | 'air_cargo' | 'sea_container';
  tracking_number: string;
  tracking_url?: string;
  status: ShipmentStatus;
  origin?: string;
  destination?: string;
  destination_pincode?: string;
  package_count: number;
  dispatched_quantity_kg?: number;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  consignment_note_number?: string;
  lr_number?: string;
  dispatch_date: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  delivered_to_name?: string;
  pod_reference?: string;
  exception_reason?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentTrackingEvent {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location?: string;
  event_timestamp: string;
  description: string;
  source: 'manual' | 'carrier_webhook' | 'carrier_api';
  created_by_name?: string;
  created_at: string;
}

export type NotificationChannel = 'in_app' | 'push' | 'whatsapp' | 'email' | 'sms';
export type NotificationEventType =
  | 'order_confirmed'
  | 'order_dispatched'
  | 'shipment_update'
  | 'order_delivered'
  | 'complaint_received'
  | 'reorder_reminder';

export interface CustomerNotification {
  id: string;
  customer_id?: string;
  order_id?: string;
  shipment_id?: string;
  channel: NotificationChannel;
  event_type: NotificationEventType;
  recipient: string;
  title?: string;
  message: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
  provider?: string;
  provider_response?: any;
  idempotency_key?: string;
  sent_at?: string;
  created_at: string;
}
