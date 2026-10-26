ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS payment_attempts (
  razorpay_order_id VARCHAR(80) PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  status VARCHAR(24) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed')),
  razorpay_payment_id VARCHAR(80) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_order ON payment_attempts(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES inventory_batches(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(16) NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'fulfilled', 'released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_reservations_order ON order_inventory_reservations(order_id, status);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash CHAR(64) PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);
