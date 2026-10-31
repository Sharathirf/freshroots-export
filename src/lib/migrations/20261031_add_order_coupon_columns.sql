-- Add discount and coupon tracking columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_inr NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(40);
