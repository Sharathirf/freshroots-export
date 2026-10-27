-- Migration: Add Google Auth, OAuth Provider Tracking & Rich Customer Metadata
-- Description: Supports Google Sign-In (GIS) and captures rich profile, avatar, verified email, and JSONB telemetry.

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Allow phone to be nullable initially when authenticating via Google OAuth (linked upon OTP/checkout)
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Indexes for high-speed authentication and provider lookups
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users (provider_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users (auth_provider);
