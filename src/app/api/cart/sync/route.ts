import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, email, cart_items, watchlist_items, subtotal, is_exit } = body;

    const rawPhone = String(phone || '').replace(/\D/g, '');
    if (!rawPhone || rawPhone.length < 10) {
      // Anonymous visitor, no contact details yet
      return NextResponse.json({ success: true, anonymous: true, message: 'No phone registered yet' });
    }

    const cleanPhone = rawPhone.slice(-10);
    const cartList = Array.isArray(cart_items) ? cart_items : [];
    const watchList = Array.isArray(watchlist_items) ? watchlist_items : [];
    const totalAmount = parseFloat(subtotal || '0') || 0;

    // If both cart and watchlist are empty, mark any active record as recovered
    if (cartList.length === 0 && watchList.length === 0) {
      await query(
        `UPDATE abandoned_carts 
         SET status = 'recovered', updated_at = NOW() 
         WHERE customer_phone = $1 AND status IN ('active', 'abandoned')`,
        [cleanPhone]
      );
      return NextResponse.json({ success: true, status: 'recovered' });
    }

    const newStatus = is_exit ? 'abandoned' : 'active';

    // Upsert into abandoned_carts table
    const existing = await query(
      `SELECT id, status FROM abandoned_carts 
       WHERE customer_phone = $1 AND status IN ('active', 'abandoned') 
       ORDER BY updated_at DESC LIMIT 1`,
      [cleanPhone]
    );

    let cartRecordId: string;

    if (existing.length > 0) {
      cartRecordId = existing[0].id;
      await query(
        `UPDATE abandoned_carts 
         SET customer_name = COALESCE($1, customer_name),
             customer_email = COALESCE($2, customer_email),
             cart_items = $3,
             watchlist_items = $4,
             total_amount_inr = $5,
             status = $6,
             updated_at = NOW()
         WHERE id = $7`,
        [
          name || null,
          email || null,
          JSON.stringify(cartList),
          JSON.stringify(watchList),
          totalAmount,
          newStatus,
          cartRecordId
        ]
      );
    } else {
      const inserted = await query(
        `INSERT INTO abandoned_carts (
          customer_phone, customer_name, customer_email, cart_items, watchlist_items,
          total_amount_inr, status, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id`,
        [
          cleanPhone,
          name || null,
          email || null,
          JSON.stringify(cartList),
          JSON.stringify(watchList),
          totalAmount,
          newStatus
        ]
      );
      cartRecordId = inserted[0].id;
    }

    // If user is exiting the site, write audit log
    if (is_exit) {
      await query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details)
         VALUES ('CART_OR_WATCHLIST_EXIT_DETECTED', 'abandoned_carts', $1, $2)`,
        [
          cartRecordId,
          JSON.stringify({
            phone: cleanPhone,
            cart_count: cartList.length,
            watchlist_count: watchList.length,
            total_inr: totalAmount,
            timestamp: new Date().toISOString()
          })
        ]
      );
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      cart_id: cartRecordId
    });
  } catch (error: any) {
    console.error('API Error in /api/cart/sync (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync cart activity', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('id') || searchParams.get('cart_id');
    const phone = searchParams.get('phone')?.replace(/\D/g, '');

    if (cartId) {
      const rows = await query(
        `SELECT * FROM abandoned_carts WHERE id = $1 LIMIT 1`,
        [cartId]
      );
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, cart: rows[0] });
    }

    if (phone) {
      const cleanPhone = phone.slice(-10);
      const rows = await query(
        `SELECT * FROM abandoned_carts WHERE customer_phone = $1 ORDER BY updated_at DESC LIMIT 5`,
        [cleanPhone]
      );
      return NextResponse.json({ success: true, count: rows.length, carts: rows });
    }

    // Admin view of all abandoned carts
    const rows = await query(
      `SELECT * FROM abandoned_carts ORDER BY updated_at DESC LIMIT 50`
    );
    return NextResponse.json({ success: true, count: rows.length, carts: rows });
  } catch (error: any) {
    console.error('API Error in /api/cart/sync (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve cart records', details: error.message },
      { status: 500 }
    );
  }
}
