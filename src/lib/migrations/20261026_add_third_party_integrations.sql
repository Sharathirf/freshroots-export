-- Store a browser token only after the visitor explicitly enables mandi alerts.
CREATE TABLE IF NOT EXISTS push_subscriptions (
    fcm_token TEXT PRIMARY KEY,
    user_agent VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
