import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode')?.trim();

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 6-digit Indian PIN code' },
        { status: 400 }
      );
    }

    const rows = await query(
      `SELECT * FROM serviceable_pincodes WHERE pincode = $1`,
      [pincode]
    );

    if (rows.length > 0) {
      const pin = rows[0];
      return NextResponse.json({
        success: true,
        serviceable: true,
        pincode: pin.pincode,
        district: pin.district,
        state: pin.state,
        hub_location: pin.hub_location,
        delivery_lead_days: pin.delivery_lead_days,
        retail_available: true,
        wholesale_available: true,
        worldwide_bulk_available: true,
        message: `Direct delivery active in ${pin.delivery_lead_days} business day(s) from ${pin.hub_location}.`
      });
    }

    // Heuristic for Karnataka vs Pan-India
    const isKarnataka = /^(56|57|58|59)/.test(pincode);
    const isSouthIndia = /^(5|6)/.test(pincode);

    const leadDays = isKarnataka ? 2 : isSouthIndia ? 3 : 4;
    const regionName = isKarnataka ? 'Karnataka Hub' : isSouthIndia ? 'South India Corridor' : 'National Express Freight';

    return NextResponse.json({
      success: true,
      serviceable: true,
      pincode,
      district: isKarnataka ? 'Karnataka Region' : 'All-India Network',
      state: isKarnataka ? 'Karnataka' : 'Pan-India',
      hub_location: `${regionName} (Tiptur Origin)`,
      delivery_lead_days: leadDays,
      retail_available: true,
      wholesale_available: true,
      worldwide_bulk_available: true,
      message: `Serviceable across India! Standard dispatch in ${leadDays} business day(s). Worldwide container freight available for bulk orders.`
    });
  } catch (error: any) {
    console.error('API Error in /api/pincode/check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify PIN code', details: error.message },
      { status: 500 }
    );
  }
}
