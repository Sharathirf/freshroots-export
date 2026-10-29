import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { getCustomersWithMetrics } from '@/lib/crm-service';
import { query } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/crm-constants';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') || undefined;
    const segment = searchParams.get('segment') || undefined;
    const reorderStatus = searchParams.get('reorderStatus') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getCustomersWithMetrics({
      search,
      type,
      segment,
      reorderStatus,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers (GET):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers', method: 'GET' } });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve customers', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const body = await request.json();
    const {
      name,
      company_name,
      contact_person,
      phone,
      email,
      customer_type = 'retail',
      shipping_address,
      billing_address,
      city,
      state,
      pincode,
      country = 'India',
      acquisition_source = 'admin',
      assigned_rep,
      internal_notes,
    } = body;

    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'A valid 10-digit Indian phone number is required' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Check existing duplicates
    const dupes = await query('SELECT id, customer_code, name, phone, email FROM customers WHERE phone = $1', [cleanPhone]);
    if (dupes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `A customer with phone number ${cleanPhone} already exists (${dupes[0].customer_code} - ${dupes[0].name}).`,
          existing_customer: dupes[0],
        },
        { status: 409 }
      );
    }

    const code = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
    const inserted = await query(
      `INSERT INTO customers (
        customer_code, customer_type, name, company_name, contact_person, phone, email,
        shipping_address, billing_address, city, state, pincode, country,
        acquisition_source, assigned_rep, internal_notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, NOW(), NOW()
      ) RETURNING *`,
      [
        code,
        customer_type,
        name.trim(),
        company_name || null,
        contact_person || null,
        cleanPhone,
        email || null,
        shipping_address || null,
        billing_address || null,
        city || null,
        state || null,
        pincode || null,
        country,
        acquisition_source,
        assigned_rep || null,
        internal_notes || null,
      ]
    );

    return NextResponse.json({ success: true, customer: inserted[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to create customer', details: error.message },
      { status: 500 }
    );
  }
}
