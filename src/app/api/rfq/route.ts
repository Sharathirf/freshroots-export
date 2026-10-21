import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_name,
      contact_person,
      contact_phone,
      contact_email,
      gstin,
      product_id,
      requested_quantity,
      unit,
      destination_city,
      destination_pincode,
      notes
    } = body;

    if (!company_name || !contact_person || !contact_phone || !product_id || !requested_quantity || !destination_city) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required business and consignment fields' },
        { status: 400 }
      );
    }

    const qty = parseInt(requested_quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, error: 'Requested quantity must be a positive number' },
        { status: 400 }
      );
    }

    // Lookup product
    const dbProd = await query(
      `SELECT id, title, wholesale_benchmark_price_inr, retail_price_inr, tax_rate_percentage 
       FROM products WHERE id = $1`,
      [product_id]
    );

    if (dbProd.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Selected product not found' },
        { status: 404 }
      );
    }

    const prod = dbProd[0];
    const benchmarkUnitPrice = Number(prod.wholesale_benchmark_price_inr || prod.retail_price_inr * 0.7);

    // Dynamic freight estimate heuristic based on distance from Tiptur hub:
    // If Bengaluru (560xxx) ~ ₹1,800 to ₹3,500; Rest of Karnataka ~ ₹3,500 to ₹6,500; Interstate ~ ₹8,000 to ₹14,000
    let estimatedFreight = 2500.00;
    if (destination_pincode?.startsWith('560')) {
      estimatedFreight = 2200.00;
    } else if (destination_pincode?.startsWith('57') || destination_pincode?.startsWith('58')) {
      estimatedFreight = 4000.00;
    } else {
      estimatedFreight = 8500.00;
    }

    // Scale freight if large truckload (>1000 bags or >50 quintals)
    if (qty > 100) {
      estimatedFreight = estimatedFreight * 1.8;
    }

    const subtotal = benchmarkUnitPrice * qty;
    const totalEstimate = subtotal + estimatedFreight;

    // Generate Quote Number: RFQ-YYYYMM-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const quoteNumber = `RFQ-${dateStr}-${randSuffix}`;

    const insertedQuote = await query(
      `INSERT INTO wholesale_quotations (
        quote_number, company_name, contact_person, contact_phone, contact_email,
        gstin, product_id, product_title, requested_quantity, unit, destination_city,
        destination_pincode, proposed_unit_price_inr, freight_charges_inr, total_quote_inr,
        status, valid_until, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'submitted', NOW() + INTERVAL '48 hours', $16)
      RETURNING *`,
      [
        quoteNumber,
        company_name,
        contact_person,
        contact_phone,
        contact_email || null,
        gstin || null,
        prod.id,
        prod.title,
        qty,
        unit || 'Bags / Lots',
        destination_city,
        destination_pincode || '560001',
        benchmarkUnitPrice,
        estimatedFreight,
        totalEstimate,
        notes || null
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('WHOLESALE_RFQ_SUBMITTED', 'wholesale_quotations', $1, $2)`,
      [insertedQuote[0].id, JSON.stringify({ quote_number: quoteNumber, company: company_name, amount: totalEstimate })]
    );

    return NextResponse.json({
      success: true,
      message: 'Wholesale RFQ submitted! Our commercial desk will review within 90 minutes.',
      quotation: insertedQuote[0]
    });
  } catch (error: any) {
    console.error('API Error in /api/rfq (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit RFQ', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const quotes = await query(
      `SELECT * FROM wholesale_quotations ORDER BY created_at DESC LIMIT 50`
    );
    return NextResponse.json({ success: true, count: quotes.length, quotations: quotes });
  } catch (error: any) {
    console.error('API Error in /api/rfq (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve quotations', details: error.message },
      { status: 500 }
    );
  }
}
