import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { getCustomerDossier } from '@/lib/crm-service';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = await params;
    const dossier = await getCustomerDossier(id);

    if (!dossier) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...dossier });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers/[id] (GET):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers/[id]', method: 'GET' } });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve customer dossier', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      company_name,
      contact_person,
      email,
      customer_type,
      shipping_address,
      billing_address,
      city,
      state,
      pincode,
      assigned_rep,
      account_status,
      communication_prefs,
      marketing_consent,
      internal_notes,
    } = body;

    const updated = await query(
      `UPDATE customers
       SET name = COALESCE($1, name),
           company_name = COALESCE($2, company_name),
           contact_person = COALESCE($3, contact_person),
           email = COALESCE($4, email),
           customer_type = COALESCE($5, customer_type),
           shipping_address = COALESCE($6, shipping_address),
           billing_address = COALESCE($7, billing_address),
           city = COALESCE($8, city),
           state = COALESCE($9, state),
           pincode = COALESCE($10, pincode),
           assigned_rep = COALESCE($11, assigned_rep),
           account_status = COALESCE($12, account_status),
           communication_prefs = COALESCE($13, communication_prefs),
           marketing_consent = COALESCE($14, marketing_consent),
           internal_notes = COALESCE($15, internal_notes),
           updated_at = NOW()
       WHERE id = $16
       RETURNING *`,
      [
        name,
        company_name,
        contact_person,
        email,
        customer_type,
        shipping_address,
        billing_address,
        city,
        state,
        pincode,
        assigned_rep,
        account_status,
        communication_prefs ? JSON.stringify(communication_prefs) : null,
        marketing_consent,
        internal_notes,
        id,
      ]
    );

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: updated[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers/[id] (PATCH):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers/[id]', method: 'PATCH' } });
    return NextResponse.json(
      { success: false, error: 'Failed to update customer', details: error.message },
      { status: 500 }
    );
  }
}
