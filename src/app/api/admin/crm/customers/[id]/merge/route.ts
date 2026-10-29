import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  const client = await pool.connect();
  try {
    const { id: primaryId } = await params;
    const body = await request.json();
    const { duplicate_customer_id, admin_actor = 'Admin Officer', reason } = body;

    if (!duplicate_customer_id) {
      return NextResponse.json(
        { success: false, error: 'duplicate_customer_id is required' },
        { status: 400 }
      );
    }

    if (primaryId === duplicate_customer_id) {
      return NextResponse.json(
        { success: false, error: 'Cannot merge a customer into itself' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const primaryCheck = await client.query('SELECT * FROM customers WHERE id = $1', [primaryId]);
    const dupeCheck = await client.query('SELECT * FROM customers WHERE id = $1', [duplicate_customer_id]);

    if (primaryCheck.rows.length === 0 || dupeCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Customer records not found' }, { status: 404 });
    }

    const primary = primaryCheck.rows[0];
    const dupe = dupeCheck.rows[0];

    // Re-link orders
    await client.query('UPDATE orders SET customer_id = $1 WHERE customer_id = $2', [primaryId, duplicate_customer_id]);

    // Re-link customer calls
    await client.query('UPDATE customer_calls SET customer_id = $1 WHERE customer_id = $2', [primaryId, duplicate_customer_id]);

    // Re-link customer feedback
    await client.query('UPDATE customer_feedback SET customer_id = $1 WHERE customer_id = $2', [primaryId, duplicate_customer_id]);

    // Re-link customer complaints
    await client.query('UPDATE customer_complaints SET customer_id = $1 WHERE customer_id = $2', [primaryId, duplicate_customer_id]);

    // Re-link shipments
    await client.query('UPDATE shipments SET customer_id = $1 WHERE customer_id = $2', [primaryId, duplicate_customer_id]);

    // Mark duplicate as merged
    await client.query(
      `UPDATE customers
       SET merged_into = $1,
           account_status = 'dormant',
           internal_notes = COALESCE(internal_notes, '') || E'\n[Merged into ' || $3 || ' by ' || $4 || ': ' || $5 || ']',
           updated_at = NOW()
       WHERE id = $2`,
      [primaryId, duplicate_customer_id, primary.customer_code, admin_actor, reason || 'Duplicate profile merged']
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('CUSTOMER_PROFILES_MERGED', 'customers', $1, $2)`,
      [
        primaryId,
        JSON.stringify({
          primary_code: primary.customer_code,
          merged_dupe_id: duplicate_customer_id,
          merged_dupe_code: dupe.customer_code,
          actor: admin_actor,
          reason,
        }),
      ]
    );

    await client.query('COMMIT');
    return NextResponse.json({
      success: true,
      message: `Successfully merged customer ${dupe.customer_code} into ${primary.customer_code}.`,
    });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('API Error in /api/admin/crm/customers/[id]/merge (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers/[id]/merge', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to merge customers', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
