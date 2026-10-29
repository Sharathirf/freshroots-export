-- ============================================================================
-- FreshRoots Export: Customer CRM, Repeat Sales, Admin Orders, Shipments & Notifications
-- Migration: 20261029_customer_crm_shipments_notifications.sql
-- ============================================================================

-- 1. Centralized Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(40) UNIQUE NOT NULL,
    customer_type VARCHAR(40) NOT NULL DEFAULT 'retail', -- 'retail', 'wholesale', 'export', 'business'
    name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    contact_person VARCHAR(150),
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(120),
    billing_address TEXT,
    shipping_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    acquisition_source VARCHAR(60) DEFAULT 'website', -- 'website', 'phone', 'whatsapp', 'email', 'in_person', 'referral', 'mandi_outreach'
    account_status VARCHAR(40) DEFAULT 'active', -- 'active', 'dormant', 'blocked'
    assigned_rep VARCHAR(120),
    communication_prefs JSONB DEFAULT '{"email": true, "whatsapp": true, "sms": true, "push": true}'::jsonb,
    marketing_consent BOOLEAN DEFAULT true,
    internal_notes TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    merged_into UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- 2. Extend Orders Table for CRM, Multi-Channel Sourcing & Admin Creation
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS order_source VARCHAR(40) DEFAULT 'website', -- 'website', 'phone', 'whatsapp', 'email', 'in_person', 'admin'
    ADD COLUMN IF NOT EXISTS order_channel VARCHAR(40) DEFAULT 'retail', -- 'retail', 'wholesale', 'export'
    ADD COLUMN IF NOT EXISTS created_by_admin_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS admin_notes TEXT,
    ADD COLUMN IF NOT EXISTS customer_consent_source TEXT,
    ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reorder_from_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(80),
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(40) DEFAULT 'paid', -- 'unpaid', 'pending', 'paid', 'partially_paid', 'refunded'
    ADD COLUMN IF NOT EXISTS fulfilment_status VARCHAR(40) DEFAULT 'unfulfilled'; -- 'unfulfilled', 'allocated', 'packed', 'dispatched', 'in_transit', 'delivered', 'returned'

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_source ON orders(order_source);
CREATE INDEX IF NOT EXISTS idx_orders_order_channel ON orders(order_channel);

-- 3. Customer Calls & Telephone Order Logging
CREATE TABLE IF NOT EXISTS customer_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    call_type VARCHAR(40) NOT NULL, -- 'feedback', 'repeat_order', 'callback', 'complaint', 'support', 'telephone_order'
    call_outcome VARCHAR(40) NOT NULL, -- 'contacted', 'interested', 'order_taken', 'callback_requested', 'no_answer', 'busy', 'wrong_number', 'not_interested', 'complaint_raised', 'escalated'
    summary TEXT NOT NULL,
    rep_name VARCHAR(120) NOT NULL,
    call_date TIMESTAMPTZ DEFAULT NOW(),
    reorder_interest BOOLEAN DEFAULT false,
    requested_products JSONB DEFAULT '[]'::jsonb,
    next_action TEXT,
    next_action_due TIMESTAMPTZ,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_calls_customer_id ON customer_calls(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_calls_due ON customer_calls(next_action_due);

-- 4. Customer Feedback Table
CREATE TABLE IF NOT EXISTS customer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    product_quality_rating INT CHECK (product_quality_rating BETWEEN 1 AND 5),
    quantity_accuracy_rating INT CHECK (quantity_accuracy_rating BETWEEN 1 AND 5),
    packaging_rating INT CHECK (packaging_rating BETWEEN 1 AND 5),
    delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5),
    pricing_satisfaction_rating INT CHECK (pricing_satisfaction_rating BETWEEN 1 AND 5),
    overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    source VARCHAR(40) DEFAULT 'phone_call', -- 'phone_call', 'whatsapp', 'website_review'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_feedback_cust ON customer_feedback(customer_id);

-- 5. Customer Complaints & Escalation Table
CREATE TABLE IF NOT EXISTS customer_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number VARCHAR(40) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    category VARCHAR(60) NOT NULL, -- 'damaged_produce', 'delayed_delivery', 'short_delivery', 'quality_mismatch', 'pricing_dispute', 'support_issue'
    description TEXT NOT NULL,
    assigned_to VARCHAR(120),
    deadline TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'escalated', 'closed'
    resolution_notes TEXT,
    customer_acknowledgment TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_cust ON customer_complaints(customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON customer_complaints(status);

-- 6. Shipments Table (Linked to Orders, Multi-Shipment, Carrier & Transporter Details)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_number VARCHAR(40) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    delivery_partner VARCHAR(60) NOT NULL, -- 'Shiprocket', 'Delhivery', 'BlueDart', 'DTDC', 'VRL Logistics', 'TCI Freight', 'Direct Farm Fleet'
    shipment_type VARCHAR(40) NOT NULL DEFAULT 'courier', -- 'courier', 'truckload', 'part_truckload', 'air_cargo', 'sea_container'
    tracking_number VARCHAR(100) NOT NULL,
    tracking_url TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'created', -- 'created', 'awaiting_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'failed_attempt', 'returned', 'cancelled'
    origin VARCHAR(100) DEFAULT 'Tiptur Mandi Hub, Karnataka',
    destination VARCHAR(100),
    destination_pincode VARCHAR(20),
    package_count INT DEFAULT 1,
    dispatched_quantity_kg NUMERIC(10,2),
    vehicle_number VARCHAR(40),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    consignment_note_number VARCHAR(80),
    lr_number VARCHAR(80),
    dispatch_date TIMESTAMPTZ DEFAULT NOW(),
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    delivered_to_name VARCHAR(120),
    pod_reference TEXT,
    exception_reason TEXT,
    created_by_name VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- 7. Shipment Tracking Events Table (Event Milestones)
CREATE TABLE IF NOT EXISTS shipment_tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(40) NOT NULL,
    location VARCHAR(120),
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    description TEXT NOT NULL,
    source VARCHAR(30) DEFAULT 'manual', -- 'manual', 'carrier_webhook', 'carrier_api'
    created_by_name VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment ON shipment_tracking_events(shipment_id);

-- 8. Customer Notifications Table (Audit, Queue & Deduplication)
CREATE TABLE IF NOT EXISTS customer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    channel VARCHAR(30) NOT NULL, -- 'in_app', 'push', 'whatsapp', 'email', 'sms'
    event_type VARCHAR(60) NOT NULL, -- 'order_confirmed', 'order_dispatched', 'shipment_update', 'order_delivered', 'complaint_received', 'reorder_reminder'
    recipient VARCHAR(150) NOT NULL,
    title VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'queued', -- 'queued', 'sent', 'delivered', 'failed', 'bounced'
    provider VARCHAR(40), -- 'firebase_push', 'whatsapp_meta', 'resend_email', 'local_queue'
    provider_response JSONB,
    idempotency_key VARCHAR(120) UNIQUE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cust_notif_order ON customer_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_cust_notif_customer ON customer_notifications(customer_id);

-- 9. Repeat Order Rules (Configurable intervals)
CREATE TABLE IF NOT EXISTS repeat_order_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_sku VARCHAR(60),
    customer_type VARCHAR(40),
    recommended_reorder_days INT NOT NULL DEFAULT 30,
    buffer_days INT NOT NULL DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default repeat intervals for agricultural commodities if empty
INSERT INTO repeat_order_rules (product_sku, customer_type, recommended_reorder_days, buffer_days)
SELECT * FROM (VALUES
    ('SEMI-HUSK-25', 'retail', 25, 4),
    ('SEMI-HUSK-50', 'retail', 35, 5),
    ('COPRA-MILL-KG', 'retail', 30, 5),
    ('COPRA-BALL-KG', 'retail', 30, 5),
    ('ARECA-RASHI-KG', 'retail', 45, 7),
    (NULL, 'retail', 30, 5),
    (NULL, 'wholesale', 21, 3),
    (NULL, 'export', 45, 10)
) AS v(product_sku, customer_type, recommended_reorder_days, buffer_days)
WHERE NOT EXISTS (SELECT 1 FROM repeat_order_rules LIMIT 1);
