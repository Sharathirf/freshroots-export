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
        retail_available: pin.is_retail_active,
        wholesale_available: pin.is_wholesale_active,
        message: `Standard delivery in ${pin.delivery_lead_days} day(s) from ${pin.hub_location}.`
      });
    }

    // Heuristic for Karnataka pincodes (starts with 56, 57, 58, 59)
    const isKarnataka = /^(56|57|58|59)/.test(pincode);

    return NextResponse.json({
      success: true,
      serviceable: isKarnataka,
      pincode,
      district: isKarnataka ? 'Karnataka Regional' : 'Outside Karnataka',
      state: isKarnataka ? 'Karnataka' : 'Rest of India',
      hub_location: isKarnataka ? 'Karnataka Regional Logistics' : 'Interstate Freight Hub',
      delivery_lead_days: isKarnataka ? 3 : 5,
      retail_available: isKarnataka,
      wholesale_available: true, // Wholesale is always serviceable via truckload freight
      message: isKarnataka
        ? 'Regional delivery available within 2-3 business days via PTL freight.'
        : 'Retail not yet active in your area. Wholesale truckload orders (>500kg) supported via freight inquiry.'
    });
  } catch (error: any) {
    console.error('API Error in /api/pincode/check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify PIN code', details: error.message },
      { status: 500 }
    );
  }
}
