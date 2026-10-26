import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetPhone = body.phone ? String(body.phone).replace(/\D/g, '').slice(-10) : null;

    // Query carts that are abandoned or active without completion
    let queryStr = `
      SELECT ac.* 
      FROM abandoned_carts ac
      LEFT JOIN orders o ON ac.customer_phone = o.customer_phone AND o.created_at >= ac.created_at
      WHERE o.id IS NULL 
        AND ac.status IN ('abandoned', 'active')
        AND (ac.cart_items != '[]'::jsonb OR ac.watchlist_items != '[]'::jsonb)
    `;
    const params: any[] = [];

    if (targetPhone) {
      queryStr += ` AND ac.customer_phone = $1`;
      params.push(targetPhone);
    } else {
      // In automated mode, trigger for carts updated > 10 minutes ago
      queryStr += ` AND ac.updated_at <= NOW() - INTERVAL '10 minutes'`;
    }

    queryStr += ` ORDER BY ac.updated_at DESC LIMIT 20`;

    const cartsToNotify = await query(queryStr, params);
    const notificationsSent: any[] = [];

    for (const cart of cartsToNotify) {
      const customerName = cart.customer_name || 'Valued Farmer / Buyer';
      const cartItems = Array.isArray(cart.cart_items) ? cart.cart_items : [];
      const watchlistItems = Array.isArray(cart.watchlist_items) ? cart.watchlist_items : [];
      
      const primaryItem = cartItems[0]?.title || watchlistItems[0]?.title || 'Farm Commodities';
      const itemsCount = cartItems.length + watchlistItems.length;
      const subtotal = Number(cart.total_amount_inr || 0);

      // Generate localized WhatsApp Recovery Notification Message
      const whatsappMessage = `🌾 *SHARATH INORAHALLI — Farm-Gate Order Reminder*

Namaskara ${customerName},

You left *${primaryItem}* ${itemsCount > 1 ? `and ${itemsCount - 1} other item(s)` : ''} in your cart (Total: ₹${subtotal.toLocaleString('en-IN')}).

✨ Direct farm-gate stock is reserved for your parcel.
🚚 Express Pan-India surface dispatch available via Shiprocket.

👉 *Click to complete your order:*
https://tipturdirect.in/cart?resume=${cart.id}

Need bulk truckload assistance or custom rates? Reply directly to this WhatsApp message or call our agri desk: +91 95911 42548.`;

      // Update abandoned_carts table to 'notified'
      await query(
        `UPDATE abandoned_carts 
         SET status = 'notified',
             notification_sent_at = NOW(),
             notification_channel = 'whatsapp',
             notification_message = $1
         WHERE id = $2`,
        [whatsappMessage, cart.id]
      );

      // Record in audit logs
      await query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details)
         VALUES ('ABANDONMENT_NOTIFICATION_DISPATCHED', 'abandoned_carts', $1, $2)`,
        [
          cart.id,
          JSON.stringify({
            customer_phone: cart.customer_phone,
            customer_name: customerName,
            channel: 'whatsapp',
            items_count: itemsCount,
            subtotal_inr: subtotal,
            dispatched_at: new Date().toISOString()
          })
        ]
      );

      notificationsSent.push({
        cart_id: cart.id,
        customer_phone: cart.customer_phone,
        customer_name: customerName,
        channel: 'whatsapp',
        primary_item: primaryItem,
        subtotal_inr: subtotal,
        message_preview: whatsappMessage
      });
    }

    return NextResponse.json({
      success: true,
      count: notificationsSent.length,
      notifications: notificationsSent
    });
  } catch (error: any) {
    console.error('API Error in /api/notifications/abandonment (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger abandonment notifications', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const history = await query(
      `SELECT id, customer_phone, customer_name, total_amount_inr, status, 
              notification_sent_at, notification_channel, notification_message, created_at, updated_at
       FROM abandoned_carts 
       WHERE status = 'notified'
       ORDER BY notification_sent_at DESC LIMIT 50`
    );

    return NextResponse.json({
      success: true,
      count: history.length,
      notifications: history
    });
  } catch (error: any) {
    console.error('API Error in /api/notifications/abandonment (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve notification logs', details: error.message },
      { status: 500 }
    );
  }
}
