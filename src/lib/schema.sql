-- Tiptur Direct: Agricultural E-Commerce Database Schema
-- Version 1.0.0

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Serviceable Pin Codes Table
CREATE TABLE IF NOT EXISTS serviceable_pincodes (
    pincode VARCHAR(10) PRIMARY KEY,
    district VARCHAR(60) NOT NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'Karnataka',
    hub_location VARCHAR(100) NOT NULL,
    delivery_lead_days INT DEFAULT 1,
    is_retail_active BOOLEAN DEFAULT TRUE,
    is_wholesale_active BOOLEAN DEFAULT TRUE
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    role VARCHAR(30) DEFAULT 'retail_customer' CHECK (role IN ('retail_customer', 'wholesale_customer', 'hub_staff', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Business Profiles (For B2B Buyers)
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    gstin VARCHAR(15),
    pan_number VARCHAR(10),
    business_type VARCHAR(50) CHECK (business_type IN ('oil_mill', 'horeca', 'retailer', 'wholesaler', 'caterer', 'exporter')),
    credit_limit_inr NUMERIC(12, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('mature_coconut', 'copra', 'spices', 'oil_and_extracts', 'coir_commodities', 'value_added')),
    grade VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL DEFAULT 'Tiptur / Tumakuru, Karnataka',
    unit_of_measure VARCHAR(60) NOT NULL,
    estimated_weight_kg NUMERIC(8, 2),
    moisture_percentage NUMERIC(4, 2),
    oil_percentage NUMERIC(4, 2),
    retail_price_inr NUMERIC(10, 2) NOT NULL,
    bulk_min_quantity INT DEFAULT 10,
    wholesale_benchmark_price_inr NUMERIC(10, 2),
    hsn_code VARCHAR(10) NOT NULL,
    tax_rate_percentage NUMERIC(4, 2) DEFAULT 0.00,
    description TEXT NOT NULL,
    specifications JSONB DEFAULT '{}',
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inventory Batches
CREATE TABLE IF NOT EXISTS inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(60) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    origin_mandi VARCHAR(100) NOT NULL,
    intake_date DATE NOT NULL DEFAULT CURRENT_DATE,
    initial_quantity INT NOT NULL,
    available_quantity INT NOT NULL,
    reserved_quantity INT DEFAULT 0,
    damaged_quantity INT DEFAULT 0,
    cost_per_unit_inr NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (available_quantity >= 0),
    CHECK (reserved_quantity >= 0)
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(40) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('retail', 'wholesale')),
    status VARCHAR(30) NOT NULL DEFAULT 'paid' CHECK (
        status IN ('draft', 'pending_payment', 'paid', 'allocated', 'packed', 'dispatched', 'delivered', 'cancelled', 'refunded')
    ),
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    destination_pincode VARCHAR(10) NOT NULL,
    subtotal_inr NUMERIC(12, 2) NOT NULL,
    delivery_fee_inr NUMERIC(10, 2) DEFAULT 0.00,
    tax_inr NUMERIC(10, 2) DEFAULT 0.00,
    total_amount_inr NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL DEFAULT 'upi',
    payment_reference VARCHAR(100),
    tracking_reference VARCHAR(100),
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Wholesale Quotations (RFQ) Table
CREATE TABLE IF NOT EXISTS wholesale_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(40) UNIQUE NOT NULL,
    company_name VARCHAR(200),
    contact_person VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    gstin VARCHAR(15),
    product_id UUID REFERENCES products(id),
    product_title VARCHAR(200) NOT NULL,
    requested_quantity INT NOT NULL,
    unit VARCHAR(30) NOT NULL,
    destination_city VARCHAR(100),
    destination_pincode VARCHAR(30),
    delivery_address TEXT,
    preferred_delivery_date DATE,
    proposed_unit_price_inr NUMERIC(10, 2),
    freight_charges_inr NUMERIC(10, 2) DEFAULT 0.00,
    total_quote_inr NUMERIC(12, 2),
    status VARCHAR(30) DEFAULT 'submitted' CHECK (
        status IN ('submitted', 'under_review', 'quote_issued', 'accepted', 'rejected', 'expired')
    ),
    valid_until TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Abandoned Carts & Watchlist Activity (Retargeting & Notifications)
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(120),
    customer_email VARCHAR(255),
    cart_items JSONB DEFAULT '[]',
    watchlist_items JSONB DEFAULT '[]',
    total_amount_inr NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'notified', 'recovered')),
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    notification_channel VARCHAR(30),
    notification_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON wholesale_quotations(status);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_phone ON abandoned_carts(customer_phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_status ON abandoned_carts(status);
