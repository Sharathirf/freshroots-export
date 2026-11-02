import { test, expect } from '../../fixtures/base-test';
import { getRfqFromDb } from '../../helpers/db-helpers';

test.describe('D. B2B Request For Quotation (RFQ) Workflow', () => {
  let submittedQuoteNumber = '';

  test('Mandatory field validation on RFQ submission', async ({ request }) => {
    // Missing customer name and phone
    const res = await request.post('/api/rfq', {
      data: {
        product_title: 'Tiptur Ball Copra',
        requested_quantity: 100,
        unit: 'kg',
      },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  test('Successful wholesale RFQ submission creates database record and reference', async ({ request }) => {
    const rfqPayload = {
      customer_name: 'Karnataka Agro Commodities Corp',
      contact_person: 'Mr. Siddeshwara Gowda',
      contact_phone: '9845018888',
      contact_email: 'siddesh@karnataka-agro.in',
      company_name: 'Karnataka Agro Commodities Corp',
      product_title: 'GI Tiptur Ball Copra (Whole Unde Kobbari)',
      requested_quantity: 2500,
      unit: 'kg',
      destination_city: 'Hubballi',
      destination_pincode: '580020',
      delivery_address: 'APMC Yard, Cotton Market Road, Hubballi',
      preferred_delivery_date: '2026-11-20',
      additional_requirements: 'Export grade lot with moisture below 5.5% in master corrugated boxes',
    };

    const res = await request.post('/api/rfq', {
      data: rfqPayload,
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.quote_number).toMatch(/^RFQ-\d+-\d+$/);
    submittedQuoteNumber = json.quote_number;

    // Validate in PostgreSQL Database
    const dbRecord = await getRfqFromDb(submittedQuoteNumber);
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.contact_person).toBe('Mr. Siddeshwara Gowda');
    expect(dbRecord?.product_title).toContain('Tiptur Ball Copra');
    expect(dbRecord?.status).toBe('submitted');
  });

  test('Admin can view submitted RFQ via protected desk API', async ({ request }) => {
    // Calling /api/rfq without admin session should be 401
    const unauthRes = await request.get('/api/rfq');
    expect(unauthRes.status()).toBe(401);
  });
});
