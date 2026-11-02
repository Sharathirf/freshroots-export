import { test, expect } from '../../fixtures/base-test';
import { getOrderFromDb } from '../../helpers/db-helpers';
import { createAdminSession } from '../../../src/lib/admin-auth';

test.describe('E. Order Creation & Lifecycle Management', () => {
  let createdOrderNumber = '';
  let createdOrderId = '';

  test('Reject order when mandatory shipping info is missing', async ({ request }) => {
    const res = await request.post('/api/orders', {
      data: {
        payment_method: 'upi',
        items: [{ product_id: 'prod-copra', quantity: 1 }],
      },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  test('Reject Pay on Delivery (COD) per business policy', async ({ request }) => {
    const res = await request.post('/api/orders', {
      data: {
        customer_name: 'Anand Kumar',
        customer_phone: '9845017777',
        shipping_address: '12th Cross, Malleshwaram',
        destination_pincode: '560003',
        payment_method: 'cod',
        items: [{ product_id: 'prod-copra', quantity: 1 }],
      },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('Pay on Delivery is currently disabled');
  });

  test('Successful Order Creation generates order number and DB record', async ({ request }) => {
    const res = await request.post('/api/orders', {
      data: {
        customer_name: 'Dr. Ramesh Chandra',
        customer_phone: '9845017777',
        customer_email: 'ramesh.chandra@gmail.com',
        shipping_address: 'No. 45, Temple Road, V.V. Puram, Bengaluru',
        destination_pincode: '560004',
        payment_method: 'upi',
        payment_reference: 'UTR-987654321012',
        items: [
          {
            title: 'GI Tiptur Ball Copra (15 kg Master Box)',
            quantity: 1,
            unit_of_measure: '15kg Box',
            retail_price_inr: 5508,
            estimated_weight_kg: 15,
          },
        ],
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.order.order_number).toMatch(/^(AGR|ORD)-/i);
    createdOrderNumber = json.order.order_number;
    createdOrderId = json.order.id;

    // Verify in PostgreSQL DB
    const dbOrder = await getOrderFromDb(createdOrderNumber);
    expect(dbOrder).not.toBeNull();
    expect(dbOrder?.customer_name).toBe('Dr. Ramesh Chandra');
    expect(dbOrder?.customer_phone).toBe('9845017777');
    expect(Number(dbOrder?.total_amount_inr)).toBeGreaterThan(0);
  });

  test('Customer can track order using tracking API', async ({ request }) => {
    expect(createdOrderNumber).toBeTruthy();
    const res = await request.get(`/api/orders?order_number=${createdOrderNumber}`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.orders.length).toBeGreaterThan(0);
    expect(json.orders[0].order_number).toBe(createdOrderNumber);
  });

  test('Admin status transition lifecycle (pending_payment -> paid -> allocated)', async ({ request, baseURL }) => {
    expect(createdOrderId).toBeTruthy();

    const { value: sessionCookie } = createAdminSession();
    const origin = baseURL || 'http://localhost:3000';

    // Transition 1: pending_payment -> paid
    const paidRes = await request.patch('/api/admin/orders', {
      headers: {
        Cookie: `freshroots_admin_session=${sessionCookie}`,
        Origin: origin,
      },
      data: {
        id: createdOrderId,
        next_status: 'paid',
        payment_status: 'paid',
        admin_notes: 'Bank UTR payment verified by Accounts Desk',
      },
    });
    expect(paidRes.status()).toBe(200);
    const paidJson = await paidRes.json();
    expect(paidJson.success).toBe(true);
    expect(paidJson.order.status).toBe('paid');

    // Transition 2: paid -> allocated
    const allocRes = await request.patch('/api/admin/orders', {
      headers: {
        Cookie: `freshroots_admin_session=${sessionCookie}`,
        Origin: origin,
      },
      data: {
        id: createdOrderId,
        next_status: 'allocated',
        admin_notes: 'Allocated from Tiptur APMC Yard harvest batch #TB-2026',
      },
    });
    expect(allocRes.status()).toBe(200);
    const allocJson = await allocRes.json();
    expect(allocJson.success).toBe(true);
    expect(allocJson.order.status).toBe('allocated');
  });
});
