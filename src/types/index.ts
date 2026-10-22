// TypeScript type definitions for Tiptur Direct Agri-Commerce Platform

export type ProductCategory =
  | 'mature_coconut'
  | 'copra'
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
  items: OrderItem[];
  created_at: string;
}

export type QuotationStatus =
  | 'submitted'
  | 'under_review'
  | 'quote_issued'
  | 'accepted'
  | 'rejected'
  | 'expired';

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
  proposed_unit_price_inr?: number;
  freight_charges_inr?: number;
  total_quote_inr?: number;
  status: QuotationStatus;
  valid_until?: string;
  notes?: string;
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
