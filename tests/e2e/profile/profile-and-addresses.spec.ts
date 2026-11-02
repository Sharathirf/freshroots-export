import { test, expect } from '../../fixtures/base-test';

test.describe('H. User Profile & Address Management', () => {
  const phoneA = '9845011100';
  const phoneB = '9845022200';

  test('Save and retrieve multiple delivery addresses for a customer', async ({ request }) => {
    // 1. Add Address 1 (Home)
    const add1 = await request.post('/api/customer/addresses', {
      data: {
        customer_phone: phoneA,
        tag: 'Farm Office',
        recipient_name: 'Anand Kumar',
        phone: phoneA,
        street_address: 'Near APMC Yard, B.H. Road',
        city: 'Tiptur',
        state: 'Karnataka',
        pincode: '572201',
        is_default: true,
      },
    });
    expect(add1.status()).toBe(200);
    const json1 = await add1.json();
    expect(json1.success).toBe(true);

    // 2. Add Address 2 (Warehouse)
    const add2 = await request.post('/api/customer/addresses', {
      data: {
        customer_phone: phoneA,
        tag: 'Export Warehouse',
        recipient_name: 'Anand Kumar',
        phone: phoneA,
        street_address: 'Shed No. 4, KIADB Industrial Area',
        city: 'Tiptur',
        state: 'Karnataka',
        pincode: '572202',
        is_default: false,
      },
    });
    expect(add2.status()).toBe(200);

    // 3. Retrieve addresses for phoneA
    const getAddresses = await request.get(`/api/customer/addresses?phone=${phoneA}`);
    expect(getAddresses.status()).toBe(200);
    const getJson = await getAddresses.json();
    expect(getJson.success).toBe(true);
    expect(getJson.addresses.length).toBeGreaterThanOrEqual(2);
  });

  test('Data isolation: Phone B cannot see Phone A delivery addresses', async ({ request }) => {
    const getB = await request.get(`/api/customer/addresses?phone=${phoneB}`);
    expect(getB.status()).toBe(200);
    const jsonB = await getB.json();
    expect(jsonB.success).toBe(true);
    // Should NOT contain Phone A addresses
    const hasAddressA = (jsonB.addresses || []).some(
      (a: any) => a.street_address && a.street_address.includes('Near APMC Yard')
    );
    expect(hasAddressA).toBe(false);
  });
});
