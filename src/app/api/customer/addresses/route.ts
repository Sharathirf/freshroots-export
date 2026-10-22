import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.replace(/\D/g, '');

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Valid 10-digit mobile number required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.slice(-10);
    const rows = await query(
      `SELECT * FROM customer_addresses 
       WHERE customer_phone = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [cleanPhone]
    );

    return NextResponse.json({
      success: true,
      count: rows.length,
      addresses: rows
    });
  } catch (error: any) {
    console.error('API Error in /api/customer/addresses (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer addresses', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      customer_phone,
      recipient_name,
      phone,
      tag,
      street_address,
      city,
      state,
      pincode,
      is_default
    } = body;

    const rawCustPhone = String(customer_phone || '').replace(/\D/g, '');
    if (rawCustPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Valid customer phone number required' },
        { status: 400 }
      );
    }

    const cleanCustPhone = rawCustPhone.slice(-10);
    const street = String(street_address || '').trim();
    const cleanCity = String(city || '').trim();
    const cleanPincode = String(pincode || '').replace(/\D/g, '');

    if (!street || !cleanCity || cleanPincode.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Street address, city, and valid 6-digit pincode are mandatory' },
        { status: 400 }
      );
    }

    const cleanTag = String(tag || 'Home').trim();
    const cleanState = String(state || 'Karnataka').trim();
    const cleanRecipient = recipient_name?.trim() || null;
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : cleanCustPhone;
    const makeDefault = Boolean(is_default);

    // If setting as default, demote all other addresses for this user
    if (makeDefault) {
      await query(
        `UPDATE customer_addresses 
         SET is_default = FALSE 
         WHERE customer_phone = $1`,
        [cleanCustPhone]
      );
    }

    let savedAddress: any;

    if (id) {
      // Update existing address
      const updated = await query(
        `UPDATE customer_addresses 
         SET recipient_name = $1,
             phone = $2,
             tag = $3,
             street_address = $4,
             city = $5,
             state = $6,
             pincode = $7,
             is_default = $8,
             updated_at = NOW()
         WHERE id = $9 AND customer_phone = $10
         RETURNING *`,
        [
          cleanRecipient,
          cleanPhone,
          cleanTag,
          street,
          cleanCity,
          cleanState,
          cleanPincode,
          makeDefault,
          id,
          cleanCustPhone
        ]
      );
      savedAddress = updated[0];
    } else {
      // Check if this is the user's first address; if so, make it default automatically
      const existingCount = await query(
        `SELECT COUNT(*)::int as count FROM customer_addresses WHERE customer_phone = $1`,
        [cleanCustPhone]
      );
      const isFirst = (existingCount[0]?.count || 0) === 0;
      const willBeDefault = makeDefault || isFirst;

      const inserted = await query(
        `INSERT INTO customer_addresses (
          customer_phone, recipient_name, phone, tag, street_address,
          city, state, pincode, is_default, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [
          cleanCustPhone,
          cleanRecipient,
          cleanPhone,
          cleanTag,
          street,
          cleanCity,
          cleanState,
          cleanPincode,
          willBeDefault
        ]
      );
      savedAddress = inserted[0];
    }

    // Sync primary address in users table if default
    if (savedAddress?.is_default) {
      await query(
        `UPDATE users 
         SET address = $1, city = $2, state = $3, pincode = $4, updated_at = NOW()
         WHERE phone = $5 OR phone = $6`,
        [street, cleanCity, cleanState, cleanPincode, cleanCustPhone, `+91${cleanCustPhone}`]
      );
    }

    return NextResponse.json({
      success: true,
      message: id ? 'Address updated successfully' : 'Address saved successfully',
      address: savedAddress
    });
  } catch (error: any) {
    console.error('API Error in /api/customer/addresses (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save address', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const phone = searchParams.get('phone')?.replace(/\D/g, '');

    if (!id || !phone) {
      return NextResponse.json(
        { success: false, error: 'Address id and customer phone are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.slice(-10);
    const deleted = await query(
      `DELETE FROM customer_addresses 
       WHERE id = $1 AND customer_phone = $2
       RETURNING id, is_default`,
      [id, cleanPhone]
    );

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized' },
        { status: 404 }
      );
    }

    // If the deleted address was default, promote the most recent remaining address
    if (deleted[0].is_default) {
      await query(
        `UPDATE customer_addresses 
         SET is_default = TRUE 
         WHERE id = (
           SELECT id FROM customer_addresses 
           WHERE customer_phone = $1 
           ORDER BY created_at DESC LIMIT 1
         )`,
        [cleanPhone]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error: any) {
    console.error('API Error in /api/customer/addresses (DELETE):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete address', details: error.message },
      { status: 500 }
    );
  }
}
