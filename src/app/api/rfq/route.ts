import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      contact_person,
      contact_phone,
      contact_email,
      company_name,
      gstin,
      product_id,
      product_title,
      requested_quantity,
      unit,
      destination_city,
      destination_pincode,
      delivery_address,
      preferred_delivery_date,
      additional_requirements,
      notes
    } = body;

    const name = (contact_person || customer_name)?.trim();
    const phone = contact_phone?.trim() || null;
    const email = contact_email?.trim() || null;

    // 1. Validate mandatory fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // At least one contact method is required
    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: 'Please provide at least one contact method: a phone number or an email address' },
        { status: 400 }
      );
    }

    if (!product_id && !product_title) {
      return NextResponse.json(
        { success: false, error: 'Target product is required' },
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

    const unitOfMeasure = unit?.trim();
    if (!unitOfMeasure) {
      return NextResponse.json(
        { success: false, error: 'Unit of measurement is required' },
        { status: 400 }
      );
    }

    // 2. Lookup product in database
    let prod: any = null;
    if (product_id) {
      const dbProd = await query(
        `SELECT id, title, wholesale_benchmark_price_inr FROM products WHERE id = $1`,
        [product_id]
      );
      if (dbProd.length > 0) prod = dbProd[0];
    }

    if (!prod && product_title) {
      const dbProd = await query(
        `SELECT id, title, wholesale_benchmark_price_inr FROM products WHERE title ILIKE $1 LIMIT 1`,
        [`%${product_title}%`]
      );
      if (dbProd.length > 0) prod = dbProd[0];
    }

    const finalTitle = prod ? prod.title : product_title || 'Agricultural Commodity';
    const benchmarkUnitPrice = prod ? Number(prod.wholesale_benchmark_price_inr || 0) : 0;

    // Generate Inquiry Reference: RFQ-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = `${Date.now().toString().slice(-5)}${Math.floor(1000 + Math.random() * 9000)}`;
    const quoteNumber = `RFQ-${dateStr}-${randSuffix}`;

    const mergedNotes = [
      additional_requirements || notes || '',
      preferred_delivery_date ? `Preferred Delivery Date: ${preferred_delivery_date}` : '',
      delivery_address ? `Delivery Address: ${delivery_address}` : ''
    ].filter(Boolean).join(' | ');

    const inserted = await query(
      `INSERT INTO wholesale_quotations (
        quote_number, company_name, contact_person, contact_phone, contact_email,
        gstin, product_id, product_title, requested_quantity, unit, destination_city,
        destination_pincode, delivery_address, preferred_delivery_date,
        proposed_unit_price_inr, freight_charges_inr, total_quote_inr,
        status, valid_until, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'submitted', NOW() + INTERVAL '48 hours', $18)
      RETURNING *`,
      [
        quoteNumber,
        company_name?.trim() || 'Individual / Commercial Buyer',
        name,
        phone,
        email,
        gstin?.trim() || null,
        prod ? prod.id : null,
        finalTitle,
        qty,
        unitOfMeasure,
        destination_city?.trim() || null,
        destination_pincode?.trim() || null,
        delivery_address?.trim() || null,
        preferred_delivery_date || null,
        benchmarkUnitPrice, // Stored privately on server
        0.00, // Calculated during admin review
        benchmarkUnitPrice * qty, // Stored privately on server
        mergedNotes || null
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('WHOLESALE_RFQ_SUBMITTED', 'wholesale_quotations', $1, $2)`,
      [inserted[0].id, JSON.stringify({ quote_number: quoteNumber, name, phone, email, qty, unit: unitOfMeasure })]
    );

    // Public response: Never leak wholesale internal pricing or benchmarks!
    return NextResponse.json({
      success: true,
      message: 'Your bulk quote request has been received! Our commercial desk will review and send a customized quotation.',
      quote_number: quoteNumber,
      quotation: {
        id: inserted[0].id,
        quote_number: quoteNumber,
        contact_person: name,
        product_title: finalTitle,
        requested_quantity: qty,
        unit: unitOfMeasure,
        status: 'submitted',
        created_at: inserted[0].created_at
      }
    });
  } catch (error: any) {
    console.error('API Error in /api/rfq (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit quote inquiry', details: error.message },
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
