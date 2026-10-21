import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.replace(/\D/g, '');

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.slice(-10);
    const rows = await query(
      `SELECT id, full_name, phone, email, address, city, state, pincode, role, created_at, updated_at 
       FROM users 
       WHERE phone = $1 OR phone = $2 LIMIT 1`,
      [cleanPhone, `+91${cleanPhone}`]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        exists: false,
        customer: null
      });
    }

    const customer = rows[0];

    // Fetch order statistics
    const orderStats = await query(
      `SELECT COUNT(*)::int as total_orders, COALESCE(SUM(total_amount_inr), 0) as total_spent
       FROM orders 
       WHERE customer_phone = $1 OR customer_phone = $2`,
      [cleanPhone, `+91${cleanPhone}`]
    );

    return NextResponse.json({
      success: true,
      exists: true,
      customer: {
        id: customer.id,
        name: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address || null,
        city: customer.city || null,
        state: customer.state || null,
        pincode: customer.pincode || null,
        total_orders: orderStats[0]?.total_orders || 0,
        total_spent: orderStats[0]?.total_spent || 0,
        created_at: customer.created_at
      }
    });
  } catch (error: any) {
    console.error('API Error in /api/customer/profile (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve customer profile', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, full_name, email, address, city, state, pincode } = body;

    const rawPhone = String(phone || '').replace(/\D/g, '');
    if (rawPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Valid 10-digit mobile number is mandatory' },
        { status: 400 }
      );
    }

    const cleanPhone = rawPhone.slice(-10);
    const name = String(full_name || '').trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Customer name is mandatory' },
        { status: 400 }
      );
    }

    const cleanEmail = email?.trim() || null;
    const cleanAddress = address !== undefined ? (address?.trim() || null) : null;
    const cleanCity = city !== undefined ? (city?.trim() || null) : null;
    const cleanState = state !== undefined ? (state?.trim() || null) : null;
    const cleanPincode = pincode !== undefined ? (pincode?.trim() || null) : null;

    // Upsert into users table
    const result = await query(
      `INSERT INTO users (full_name, phone, email, address, city, state, pincode, role, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'retail_customer', NOW())
       ON CONFLICT (phone) DO UPDATE 
       SET full_name = EXCLUDED.full_name,
           email = COALESCE(EXCLUDED.email, users.email),
           address = COALESCE(EXCLUDED.address, users.address),
           city = COALESCE(EXCLUDED.city, users.city),
           state = COALESCE(EXCLUDED.state, users.state),
           pincode = COALESCE(EXCLUDED.pincode, users.pincode),
           updated_at = NOW()
       RETURNING id, full_name, phone, email, address, city, state, pincode, role, created_at, updated_at`,
      [name, cleanPhone, cleanEmail, cleanAddress, cleanCity, cleanState, cleanPincode]
    );

    const savedUser = result[0];

    // Log customer profile activity in audit_logs
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('CUSTOMER_PROFILE_UPSERT', 'users', $1, $2)`,
      [
        savedUser.id,
        JSON.stringify({
          phone: cleanPhone,
          name,
          email: cleanEmail,
          address: cleanAddress,
          city: cleanCity,
          state: cleanState,
          pincode: cleanPincode,
          timestamp: new Date().toISOString()
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile synchronized successfully',
      customer: {
        id: savedUser.id,
        name: savedUser.full_name,
        phone: savedUser.phone,
        email: savedUser.email,
        address: savedUser.address,
        city: savedUser.city,
        state: savedUser.state,
        pincode: savedUser.pincode,
        created_at: savedUser.created_at
      }
    });
  } catch (error: any) {
    console.error('API Error in /api/customer/profile (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to synchronize customer profile', details: error.message },
      { status: 500 }
    );
  }
}
