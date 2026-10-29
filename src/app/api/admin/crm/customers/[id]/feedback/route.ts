import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const { id: customerId } = await params;
    const body = await request.json();

    const {
      order_id,
      product_quality_rating,
      quantity_accuracy_rating,
      packaging_rating,
      delivery_rating,
      pricing_satisfaction_rating,
      overall_rating,
      feedback_text,
      source = 'phone_call',
    } = body;

    const inserted = await query(
      `INSERT INTO customer_feedback (
        customer_id, order_id, product_quality_rating, quantity_accuracy_rating,
        packaging_rating, delivery_rating, pricing_satisfaction_rating,
        overall_rating, feedback_text, source, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10, NOW()
      ) RETURNING *`,
      [
        customerId,
        order_id || null,
        product_quality_rating || null,
        quantity_accuracy_rating || null,
        packaging_rating || null,
        delivery_rating || null,
        pricing_satisfaction_rating || null,
        overall_rating || null,
        feedback_text || null,
        source,
      ]
    );

    return NextResponse.json({ success: true, feedback: inserted[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers/[id]/feedback (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers/[id]/feedback', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to record feedback', details: error.message },
      { status: 500 }
    );
  }
}
