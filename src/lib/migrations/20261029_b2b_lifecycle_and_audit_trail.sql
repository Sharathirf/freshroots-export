-- Migration: B2B RFQ, Quotation, Operations Handover, Fulfilment & Audit Trail
-- Safe, backward-compatible migration for FreshRoots Export

-- 1. Safely widen wholesale_quotations status check constraint
DO $$
BEGIN
    ALTER TABLE wholesale_quotations DROP CONSTRAINT IF EXISTS wholesale_quotations_status_check;
    ALTER TABLE wholesale_quotations ADD CONSTRAINT wholesale_quotations_status_check CHECK (
        status IN (
            'submitted', 'new_rfq', 'under_review', 'needs_information', 'ready_to_quote',
            'on_hold', 'rejected', 'cancelled', 'quotation_draft', 'pending_approval',
            'quote_issued', 'discussion_in_progress', 'revision_requested',
            'revised_quotation_issued', 'accepted', 'expired'
        )
    );
END $$;

-- 2. Add operational and governance columns to wholesale_quotations
ALTER TABLE wholesale_quotations
    ADD COLUMN IF NOT EXISTS sales_owner_name VARCHAR(120) DEFAULT 'Commercial Desk',
    ADD COLUMN IF NOT EXISTS operations_owner_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS revision_number INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS rejection_category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS rejection_notes TEXT,
    ADD COLUMN IF NOT EXISTS rejection_actor VARCHAR(120),
    ADD COLUMN IF NOT EXISTS rejection_timestamp TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reopen_reason TEXT,
    ADD COLUMN IF NOT EXISTS reopened_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS reopened_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'unpaid',
    ADD COLUMN IF NOT EXISTS fulfilment_status VARCHAR(40) DEFAULT 'not_started',
    ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 3. Dedicated Activity Timeline Table
CREATE TABLE IF NOT EXISTS rfq_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    quotation_revision INT DEFAULT 1,
    activity_type VARCHAR(80) NOT NULL,
    activity_title VARCHAR(200) NOT NULL,
    description TEXT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    comments TEXT,
    reason TEXT,
    communication_source VARCHAR(50),
    acting_user VARCHAR(120) NOT NULL DEFAULT 'Commercial Desk',
    actor_role VARCHAR(50) DEFAULT 'sales',
    visibility VARCHAR(30) NOT NULL DEFAULT 'internal_note' CHECK (visibility IN ('internal_note', 'ops_update', 'buyer_visible')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rfq_activities_rfq_time ON rfq_activities(rfq_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfq_activities_visibility ON rfq_activities(visibility);

-- 4. Discussion and Negotiation Tracking Table
CREATE TABLE IF NOT EXISTS rfq_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
    discussion_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    communication_channel VARCHAR(50) NOT NULL,
    channel_other_explanation TEXT,
    employee_name VARCHAR(120) NOT NULL,
    employee_role VARCHAR(50) DEFAULT 'sales',
    buyer_contact_person VARCHAR(120) NOT NULL,
    discussion_summary TEXT NOT NULL,
    buyer_concerns TEXT,
    price_changes_requested TEXT,
    spec_changes_requested TEXT,
    delivery_terms TEXT,
    payment_terms TEXT,
    commercial_commitments TEXT,
    outstanding_questions TEXT,
    next_action TEXT,
    followup_due_date TIMESTAMPTZ,
    responsible_employee VARCHAR(120),
    visibility VARCHAR(30) DEFAULT 'internal_note',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rfq_discussions_rfq_date ON rfq_discussions(rfq_id, discussion_date DESC);

-- 5. Quotation Revision Management Table
CREATE TABLE IF NOT EXISTS quotation_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    quote_number VARCHAR(60) NOT NULL,
    proposed_unit_price_inr NUMERIC(10, 2) NOT NULL,
    freight_charges_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_quote_inr NUMERIC(12, 2) NOT NULL,
    requested_quantity INT NOT NULL,
    unit VARCHAR(30) NOT NULL,
    change_reason TEXT NOT NULL,
    created_by VARCHAR(120) NOT NULL,
    status VARCHAR(40) DEFAULT 'quotation_draft',
    valid_until TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quotation_revisions_rfq_rev ON quotation_revisions(rfq_id, revision_number DESC);

-- 6. Sales-to-Operations Handover Table
CREATE TABLE IF NOT EXISTS b2b_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    initiated_by VARCHAR(120) NOT NULL,
    operations_owner VARCHAR(120) NOT NULL,
    product_specs TEXT,
    confirmed_quantity INT NOT NULL,
    unit VARCHAR(30) NOT NULL,
    quotation_revision INT DEFAULT 1,
    destination TEXT NOT NULL,
    commercial_terms TEXT,
    payment_terms TEXT,
    packaging_requirements TEXT,
    delivery_commitments TEXT,
    quality_requirements TEXT,
    buyer_discussions_summary TEXT,
    outstanding_questions TEXT,
    required_ops_actions TEXT,
    handover_status VARCHAR(40) DEFAULT 'pending_acknowledgement',
    acknowledged_by VARCHAR(120),
    acknowledged_at TIMESTAMPTZ,
    acknowledgement_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_b2b_handovers_rfq ON b2b_handovers(rfq_id);

-- 7. B2B Fulfilment: Procurement, QC, Dispatch & Delivery
CREATE TABLE IF NOT EXISTS b2b_fulfilments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    procurement_status VARCHAR(40) DEFAULT 'not_started',
    procurement_source VARCHAR(150),
    procurement_expected_readiness DATE,
    procurement_notes TEXT,
    quality_status VARCHAR(40) DEFAULT 'pending',
    quality_inspector VARCHAR(120),
    quality_inspected_quantity INT,
    quality_inspection_date TIMESTAMPTZ,
    quality_observations TEXT,
    dispatch_status VARCHAR(40) DEFAULT 'pending',
    dispatched_quantity INT DEFAULT 0,
    dispatch_date TIMESTAMPTZ,
    transporter_name VARCHAR(120),
    vehicle_number VARCHAR(60),
    driver_name VARCHAR(120),
    driver_phone VARCHAR(30),
    lr_number VARCHAR(100),
    tracking_reference VARCHAR(100),
    bag_or_box_count INT,
    delivery_status VARCHAR(40) DEFAULT 'pending',
    delivered_quantity INT DEFAULT 0,
    delivery_date TIMESTAMPTZ,
    recipient_name VARCHAR(120),
    delivery_remarks TEXT,
    delivery_exception_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_b2b_fulfilments_rfq ON b2b_fulfilments(rfq_id);

-- 8. B2B Payments Ledger Table
CREATE TABLE IF NOT EXISTS b2b_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    confirmed_order_value_inr NUMERIC(12, 2) NOT NULL,
    amount_paid_inr NUMERIC(12, 2) NOT NULL CHECK (amount_paid_inr > 0),
    payment_method VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(120) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by VARCHAR(120) NOT NULL,
    reconciliation_status VARCHAR(40) DEFAULT 'pending_reconciliation',
    reconciled_by VARCHAR(120),
    reconciled_at TIMESTAMPTZ,
    payment_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_b2b_payments_rfq ON b2b_payments(rfq_id);

-- 9. B2B Follow-ups and Reminders Table
CREATE TABLE IF NOT EXISTS b2b_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
    followup_type VARCHAR(50) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    responsible_employee VARCHAR(120) NOT NULL,
    assigned_by VARCHAR(120) NOT NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rescheduled', 'cancelled')),
    completed_at TIMESTAMPTZ,
    completion_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_b2b_followups_rfq_due ON b2b_followups(rfq_id, due_date ASC);
