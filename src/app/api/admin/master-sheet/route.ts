import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdminSessionValid } from '@/lib/admin-auth';
import { loadIntegrationSettings } from '@/lib/integration-settings';
import { createHmac } from 'node:crypto';

export const dynamic = 'force-dynamic';

function getExportKey(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'freshroots-master-export-key';
  return createHmac('sha256', secret).update('google-master-sheet-sync').digest('hex').substring(0, 16);
}

function verifyAccess(request: NextRequest): boolean {
  if (isAdminSessionValid(request)) return true;
  const key = request.nextUrl.searchParams.get('key') || request.nextUrl.searchParams.get('token');
  if (key && key === getExportKey()) return true;
  return false;
}

function toCsvRow(items: (string | number | boolean | null | undefined)[]): string {
  return items.map(val => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }).join(',');
}

export async function GET(request: NextRequest) {
  if (!verifyAccess(request)) {
    return NextResponse.json({ error: 'Unauthorized. Admin session or valid export key required.' }, { status: 401 });
  }

  const dataset = request.nextUrl.searchParams.get('dataset') || 'overview';
  const format = request.nextUrl.searchParams.get('format') || (dataset === 'overview' ? 'json' : 'csv');
  const exportKey = getExportKey();

  const settings = await loadIntegrationSettings();
  const masterSheetUrl = settings.get('GOOGLE_MASTER_SHEET_URL') || 
    process.env.GOOGLE_MASTER_SHEET_URL || 
    'https://docs.google.com/spreadsheets/d/1vNnrqgjQXaYyLAdx6C35wUZAV5oDfFnf4CJiIAe2FaU/edit?gid=0#gid=0';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://freshrootsexport.com';

  // 1. PRODUCTS DATASET
  if (dataset === 'products') {
    const rows = await query<{
      sku: string;
      title: string;
      category: string;
      grade: string;
      origin: string;
      unit_of_measure: string;
      retail_price_inr: number;
      wholesale_benchmark_price_inr: number;
      bulk_min_quantity: number;
      estimated_weight_kg: number;
      moisture_percentage: number;
      oil_percentage: number;
      hsn_code: string;
      tax_rate_percentage: number;
      is_active: boolean;
    }>(`
      SELECT
        sku, title, category, grade, origin, unit_of_measure,
        retail_price_inr, wholesale_benchmark_price_inr, bulk_min_quantity,
        estimated_weight_kg, moisture_percentage, oil_percentage,
        hsn_code, tax_rate_percentage, is_active
      FROM products
      ORDER BY id ASC
    `);

    if (format === 'csv') {
      const headers = [
        'SKU', 'Product Title', 'Category', 'Grade / Lot', 'Origin',
        'Retail Price (₹)', 'Unit of Measure', 'Wholesale Benchmark (₹)',
        'Min Wholesale Qty', 'Weight (kg)', 'Moisture (%)', 'Oil Content (%)',
        'GST (%)', 'HSN Code', 'Status'
      ];

      const csvLines = [headers.map(h => `"${h}"`).join(',')];
      for (const p of rows) {
        csvLines.push(toCsvRow([
          p.sku,
          p.title,
          p.category,
          p.grade || 'Standard Lot',
          p.origin || 'Karnataka',
          p.retail_price_inr,
          p.unit_of_measure,
          p.wholesale_benchmark_price_inr || '',
          p.bulk_min_quantity || 1,
          p.estimated_weight_kg || '',
          p.moisture_percentage ? `${p.moisture_percentage}%` : '≤ 5.5%',
          p.oil_percentage ? `${p.oil_percentage}%` : '',
          `${p.tax_rate_percentage || 0}%`,
          p.hsn_code || '080112',
          p.is_active ? 'Active' : 'Inactive'
        ]));
      }

      return new NextResponse(csvLines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="freshroots-catalog-products.csv"',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return NextResponse.json({ dataset: 'products', count: rows.length, data: rows });
  }

  // 2. ORDERS DATASET
  if (dataset === 'orders') {
    const rows = await query<{
      order_number: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      destination_pincode: string;
      shipping_address: string;
      total_amount_inr: number;
      payment_method: string;
      payment_status: string;
      status: string;
      carrier_name: string;
      tracking_reference: string;
      created_at: string;
    }>(`
      SELECT
        order_number, customer_name, customer_phone, customer_email,
        destination_pincode, shipping_address, total_amount_inr,
        payment_method, payment_status, status,
        carrier_name, tracking_reference, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 1000
    `);

    if (format === 'csv') {
      const headers = [
        'Order Number', 'Date', 'Customer Name', 'Phone', 'Email',
        'PIN Code', 'Delivery Address', 'Total Amount (₹)',
        'Payment Method', 'Payment Status', 'Order Status', 'Carrier', 'Tracking AWB', 'Timestamp'
      ];

      const csvLines = [headers.map(h => `"${h}"`).join(',')];
      for (const o of rows) {
        csvLines.push(toCsvRow([
          o.order_number,
          o.created_at ? new Date(o.created_at).toISOString().split('T')[0] : '',
          o.customer_name,
          o.customer_phone,
          o.customer_email || '',
          o.destination_pincode,
          o.shipping_address,
          o.total_amount_inr,
          o.payment_method,
          o.payment_status || 'PENDING',
          o.status,
          o.carrier_name || 'Pending Dispatch',
          o.tracking_reference || '',
          o.created_at
        ]));
      }

      return new NextResponse(csvLines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="freshroots-customer-orders.csv"',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return NextResponse.json({ dataset: 'orders', count: rows.length, data: rows });
  }

  // 3. WHOLESALE RFQS DATASET
  if (dataset === 'rfqs') {
    const rows = await query<{
      quote_number: string;
      contact_person: string;
      company_name: string;
      contact_phone: string;
      contact_email: string;
      product_title: string;
      requested_quantity: number;
      unit: string;
      destination_city: string;
      destination_pincode: string;
      total_quote_inr: number;
      status: string;
      notes: string;
      created_at: string;
    }>(`
      SELECT
        quote_number, contact_person, company_name, contact_phone, contact_email,
        product_title, requested_quantity, unit, destination_city, destination_pincode,
        total_quote_inr, status, notes, created_at
      FROM wholesale_quotations
      ORDER BY created_at DESC
      LIMIT 1000
    `);

    if (format === 'csv') {
      const headers = [
        'Quote Number', 'Date', 'Contact Person', 'Company Name', 'Phone', 'Email',
        'Commodity', 'Requested Quantity', 'Unit', 'Destination City', 'PIN Code',
        'Quote Value (₹)', 'Status', 'Notes', 'Created At'
      ];

      const csvLines = [headers.map(h => `"${h}"`).join(',')];
      for (const r of rows) {
        csvLines.push(toCsvRow([
          r.quote_number,
          r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '',
          r.contact_person,
          r.company_name || 'Individual Bulk Buyer',
          r.contact_phone,
          r.contact_email || '',
          r.product_title,
          r.requested_quantity,
          r.unit,
          r.destination_city,
          r.destination_pincode || '',
          r.total_quote_inr || '',
          r.status,
          r.notes || '',
          r.created_at
        ]));
      }

      return new NextResponse(csvLines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="freshroots-b2b-rfqs.csv"',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return NextResponse.json({ dataset: 'rfqs', count: rows.length, data: rows });
  }

  // 4. CRM CUSTOMERS DATASET
  if (dataset === 'customers') {
    const rows = await query<{
      customer_code: string;
      name: string;
      company_name: string;
      phone: string;
      email: string;
      city: string;
      state: string;
      pincode: string;
      customer_type: string;
      created_at: string;
    }>(`
      SELECT
        customer_code, name, company_name, phone, email,
        city, state, pincode, customer_type, created_at
      FROM customers
      ORDER BY created_at DESC
      LIMIT 1000
    `);

    if (format === 'csv') {
      const headers = [
        'Customer Code', 'Name', 'Company', 'Phone', 'Email',
        'City', 'State', 'PIN Code', 'Segment', 'Member Since'
      ];

      const csvLines = [headers.map(h => `"${h}"`).join(',')];
      for (const c of rows) {
        csvLines.push(toCsvRow([
          c.customer_code,
          c.name,
          c.company_name || '',
          c.phone,
          c.email || '',
          c.city || '',
          c.state || '',
          c.pincode || '',
          c.customer_type || 'Retail B2C',
          c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : ''
        ]));
      }

      return new NextResponse(csvLines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="freshroots-crm-customers.csv"',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return NextResponse.json({ dataset: 'customers', count: rows.length, data: rows });
  }

  // 5. MANDI BENCHMARK RATES DATASET
  if (dataset === 'mandi') {
    const rows = await query<{
      market_name: string;
      commodity: string;
      maximum_price_per_quintal: number;
      reported_at: string;
      source_url: string;
      refresh_status: string;
    }>(`
      SELECT
        market_name, commodity, maximum_price_per_quintal,
        reported_at, source_url, refresh_status
      FROM mandi_prices
      ORDER BY reported_at DESC, market_name ASC
      LIMIT 500
    `);

    if (format === 'csv') {
      const headers = [
        'Market', 'Commodity', 'Benchmark Rate (₹/Qtl)', 'Reported At', 'Source', 'Status'
      ];

      const csvLines = [headers.map(h => `"${h}"`).join(',')];
      for (const m of rows) {
        csvLines.push(toCsvRow([
          m.market_name,
          m.commodity,
          m.maximum_price_per_quintal,
          m.reported_at ? new Date(m.reported_at).toISOString().split('T')[0] : '',
          m.source_url || 'APMC Karnataka',
          m.refresh_status || 'Verified'
        ]));
      }

      return new NextResponse(csvLines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="freshroots-mandi-rates.csv"',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return NextResponse.json({ dataset: 'mandi', count: rows.length, data: rows });
  }

  // DEFAULT: OVERVIEW & GOOGLE SHEETS IMPORT FORMULAS
  const [productCount, orderCount, rfqCount, customerCount, mandiCount] = await Promise.all([
    query<{ c: string }>('SELECT COUNT(*)::text as c FROM products'),
    query<{ c: string }>('SELECT COUNT(*)::text as c FROM orders'),
    query<{ c: string }>('SELECT COUNT(*)::text as c FROM wholesale_quotations'),
    query<{ c: string }>('SELECT COUNT(*)::text as c FROM customers'),
    query<{ c: string }>('SELECT COUNT(*)::text as c FROM mandi_prices'),
  ]);

  return NextResponse.json({
    success: true,
    masterSheetUrl,
    exportKey,
    synchronization: {
      instructions: 'You can paste the IMPORTDATA formulas into cell A1 of each tab in your Google Sheet to maintain real-time automated synchronization with FreshRoots Export database.',
      datasets: [
        {
          name: 'Catalog Products & Inventory',
          tabName: 'Products',
          recordCount: parseInt(productCount[0]?.c || '0', 10),
          csvUrl: `${baseUrl}/api/admin/master-sheet?dataset=products&format=csv&key=${exportKey}`,
          googleSheetFormula: `=IMPORTDATA("${baseUrl}/api/admin/master-sheet?dataset=products&format=csv&key=${exportKey}")`,
        },
        {
          name: 'Retail Customer Orders',
          tabName: 'Orders',
          recordCount: parseInt(orderCount[0]?.c || '0', 10),
          csvUrl: `${baseUrl}/api/admin/master-sheet?dataset=orders&format=csv&key=${exportKey}`,
          googleSheetFormula: `=IMPORTDATA("${baseUrl}/api/admin/master-sheet?dataset=orders&format=csv&key=${exportKey}")`,
        },
        {
          name: 'B2B Wholesale RFQs & Quotations',
          tabName: 'B2B RFQs',
          recordCount: parseInt(rfqCount[0]?.c || '0', 10),
          csvUrl: `${baseUrl}/api/admin/master-sheet?dataset=rfqs&format=csv&key=${exportKey}`,
          googleSheetFormula: `=IMPORTDATA("${baseUrl}/api/admin/master-sheet?dataset=rfqs&format=csv&key=${exportKey}")`,
        },
        {
          name: 'CRM Customer Registry',
          tabName: 'Customers',
          recordCount: parseInt(customerCount[0]?.c || '0', 10),
          csvUrl: `${baseUrl}/api/admin/master-sheet?dataset=customers&format=csv&key=${exportKey}`,
          googleSheetFormula: `=IMPORTDATA("${baseUrl}/api/admin/master-sheet?dataset=customers&format=csv&key=${exportKey}")`,
        },
        {
          name: 'Mandi APMC Benchmark Rates',
          tabName: 'Mandi Rates',
          recordCount: parseInt(mandiCount[0]?.c || '0', 10),
          csvUrl: `${baseUrl}/api/admin/master-sheet?dataset=mandi&format=csv&key=${exportKey}`,
          googleSheetFormula: `=IMPORTDATA("${baseUrl}/api/admin/master-sheet?dataset=mandi&format=csv&key=${exportKey}")`,
        },
      ]
    }
  });
}
