import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get('phone')?.replace(/\D/g, '');
    const emailParam = searchParams.get('email')?.trim().toLowerCase();
    const providerIdParam = searchParams.get('provider_id')?.trim();

    let rows: any[] = [];
    let cleanPhone: string | null = null;

    if (rawPhone && rawPhone.length >= 10) {
      cleanPhone = rawPhone.slice(-10);
      rows = await query(
        `SELECT id, full_name, phone, email, address, city, state, pincode, role,
                auth_provider, provider_id, avatar_url, email_verified, metadata,
                created_at, updated_at 
         FROM users 
         WHERE phone = $1 OR phone = $2 LIMIT 1`,
        [cleanPhone, `+91${cleanPhone}`]
      );
    } else if (emailParam) {
      rows = await query(
        `SELECT id, full_name, phone, email, address, city, state, pincode, role,
                auth_provider, provider_id, avatar_url, email_verified, metadata,
                created_at, updated_at 
         FROM users 
         WHERE LOWER(email) = $1 LIMIT 1`,
        [emailParam]
      );
      if (rows.length > 0 && rows[0].phone) {
        cleanPhone = rows[0].phone.slice(-10);
      }
    } else if (providerIdParam) {
      rows = await query(
        `SELECT id, full_name, phone, email, address, city, state, pincode, role,
                auth_provider, provider_id, avatar_url, email_verified, metadata,
                created_at, updated_at 
         FROM users 
         WHERE provider_id = $1 LIMIT 1`,
        [providerIdParam]
      );
      if (rows.length > 0 && rows[0].phone) {
        cleanPhone = rows[0].phone.slice(-10);
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Please provide phone, email, or provider_id' },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        exists: false,
        customer: null
      });
    }

    const customer = rows[0];

    // Fetch order statistics if phone is available
    let totalOrders = 0;
    let totalSpent = 0;
    if (cleanPhone) {
      const orderStats = await query(
        `SELECT COUNT(*)::int as total_orders, COALESCE(SUM(total_amount_inr), 0) as total_spent
         FROM orders 
         WHERE customer_phone = $1 OR customer_phone = $2`,
        [cleanPhone, `+91${cleanPhone}`]
      );
      totalOrders = orderStats[0]?.total_orders || 0;
      totalSpent = Number(orderStats[0]?.total_spent || 0);
    }

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
        auth_provider: customer.auth_provider || 'phone',
        provider_id: customer.provider_id || null,
        avatar_url: customer.avatar_url || null,
        email_verified: Boolean(customer.email_verified),
        metadata: customer.metadata || {},
        total_orders: totalOrders,
        total_spent: totalSpent,
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
    const {
      phone,
      full_name,
      email,
      address,
      city,
      state,
      pincode,
      auth_provider = 'phone',
      provider_id,
      avatar_url,
      email_verified,
      metadata = {}
    } = body;

    const rawPhone = phone ? String(phone).replace(/\D/g, '') : '';
    const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : null;
    const cleanEmail = email?.trim() ? email.trim().toLowerCase() : null;
    const cleanProviderId = provider_id ? String(provider_id).trim() : null;
    const cleanName = String(full_name || '').trim();

    // Ensure we have at least one valid identifier (phone, email, or provider_id)
    if (!cleanPhone && !cleanEmail && !cleanProviderId) {
      return NextResponse.json(
        { success: false, error: 'Valid 10-digit mobile number, email, or OAuth provider ID is mandatory' },
        { status: 400 }
      );
    }

    if (!cleanName && !cleanEmail) {
      return NextResponse.json(
        { success: false, error: 'Customer name or email is mandatory' },
        { status: 400 }
      );
    }

    const displayName = cleanName || cleanEmail?.split('@')[0] || 'Customer';
    const cleanAddress = address !== undefined ? (address?.trim() || null) : null;
    const cleanCity = city !== undefined ? (city?.trim() || null) : null;
    const cleanState = state !== undefined ? (state?.trim() || null) : null;
    const cleanPincode = pincode !== undefined ? (pincode?.trim() || null) : null;
    const cleanAvatar = avatar_url?.trim() || null;
    const isVerified = Boolean(email_verified);
    const safeMetadata = typeof metadata === 'object' && metadata !== null ? JSON.stringify(metadata) : '{}';

    let savedUser: any = null;

    if (cleanPhone) {
      // Upsert by phone number (primary identity for deliveries & SMS/WhatsApp)
      const result = await query(
        `INSERT INTO users (
           full_name, phone, email, address, city, state, pincode, role,
           auth_provider, provider_id, avatar_url, email_verified, metadata, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'retail_customer', $8, $9, $10, $11, $12::jsonb, NOW())
         ON CONFLICT (phone) DO UPDATE 
         SET full_name = EXCLUDED.full_name,
             email = COALESCE(EXCLUDED.email, users.email),
             address = COALESCE(EXCLUDED.address, users.address),
             city = COALESCE(EXCLUDED.city, users.city),
             state = COALESCE(EXCLUDED.state, users.state),
             pincode = COALESCE(EXCLUDED.pincode, users.pincode),
             auth_provider = COALESCE(EXCLUDED.auth_provider, users.auth_provider),
             provider_id = COALESCE(EXCLUDED.provider_id, users.provider_id),
             avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
             email_verified = COALESCE(EXCLUDED.email_verified, users.email_verified),
             metadata = users.metadata || EXCLUDED.metadata,
             updated_at = NOW()
         RETURNING id, full_name, phone, email, address, city, state, pincode, role,
                   auth_provider, provider_id, avatar_url, email_verified, metadata, created_at, updated_at`,
        [
          displayName,
          cleanPhone,
          cleanEmail,
          cleanAddress,
          cleanCity,
          cleanState,
          cleanPincode,
          auth_provider,
          cleanProviderId,
          cleanAvatar,
          isVerified,
          safeMetadata
        ]
      );
      savedUser = result[0];
    } else {
      // User signed up with Google OAuth without entering phone yet
      // Check if user exists by email or provider_id
      const existing = await query(
        `SELECT id FROM users WHERE (provider_id = $1 AND provider_id IS NOT NULL) OR (email = $2 AND email IS NOT NULL) LIMIT 1`,
        [cleanProviderId, cleanEmail]
      );

      if (existing.length > 0) {
        const result = await query(
          `UPDATE users 
           SET full_name = COALESCE($1, full_name),
               avatar_url = COALESCE($2, avatar_url),
               auth_provider = COALESCE($3, auth_provider),
               provider_id = COALESCE($4, provider_id),
               email_verified = COALESCE($5, email_verified),
               metadata = users.metadata || $6::jsonb,
               updated_at = NOW()
           WHERE id = $7
           RETURNING id, full_name, phone, email, address, city, state, pincode, role,
                     auth_provider, provider_id, avatar_url, email_verified, metadata, created_at, updated_at`,
          [displayName, cleanAvatar, auth_provider, cleanProviderId, isVerified, safeMetadata, existing[0].id]
        );
        savedUser = result[0];
      } else {
        const result = await query(
          `INSERT INTO users (
             full_name, phone, email, address, city, state, pincode, role,
             auth_provider, provider_id, avatar_url, email_verified, metadata, updated_at
           )
           VALUES ($1, NULL, $2, $3, $4, $5, $6, 'retail_customer', $7, $8, $9, $10, $11::jsonb, NOW())
           RETURNING id, full_name, phone, email, address, city, state, pincode, role,
                     auth_provider, provider_id, avatar_url, email_verified, metadata, created_at, updated_at`,
          [
            displayName,
            cleanEmail,
            cleanAddress,
            cleanCity,
            cleanState,
            cleanPincode,
            auth_provider,
            cleanProviderId,
            cleanAvatar,
            isVerified,
            safeMetadata
          ]
        );
        savedUser = result[0];
      }
    }

    // Log customer profile activity in audit_logs
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('CUSTOMER_PROFILE_UPSERT', 'users', $1, $2)`,
      [
        savedUser.id,
        JSON.stringify({
          phone: savedUser.phone,
          name: savedUser.full_name,
          email: savedUser.email,
          auth_provider: savedUser.auth_provider,
          avatar_url: savedUser.avatar_url,
          timestamp: new Date().toISOString()
        })
      ]
    ).catch((logErr) => console.warn('Audit log write skipped:', logErr.message));

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
        auth_provider: savedUser.auth_provider,
        provider_id: savedUser.provider_id,
        avatar_url: savedUser.avatar_url,
        email_verified: savedUser.email_verified,
        metadata: savedUser.metadata,
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

