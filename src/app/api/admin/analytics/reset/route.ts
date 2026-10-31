import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const countRes = await pool.query('SELECT COUNT(*) as count FROM site_visits');
    const rowCount = countRes.rows[0]?.count || 0;

    await pool.query('TRUNCATE TABLE site_visits');

    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('RESET_SITE_VISIT_ANALYTICS', 'site_visits', '0', $1)`,
      [JSON.stringify({ deleted_rows: rowCount, timestamp: new Date().toISOString() })]
    );

    return NextResponse.json({
      success: true,
      message: `Analytics successfully reset. Cleared ${rowCount} historical visit records.`,
      deleted_rows: parseInt(rowCount, 10) || 0
    });
  } catch (error: any) {
    console.error('Failed to reset visitor analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
