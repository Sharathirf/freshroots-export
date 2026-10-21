import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingRate, ORIGIN_PICKUP_POSTCODE } from '@/lib/shiprocket';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deliveryPostcode = searchParams.get('delivery_postcode') || searchParams.get('pincode');
    const pickupPostcode = searchParams.get('pickup_postcode') || ORIGIN_PICKUP_POSTCODE;
    const weight = parseFloat(searchParams.get('weight') || '1.0');
    const cod = searchParams.get('cod') === '1' || searchParams.get('cod') === 'true';
    const declaredValue = parseFloat(searchParams.get('declared_value') || '0');

    if (!deliveryPostcode || deliveryPostcode.trim().length !== 6 || !/^\d{6}$/.test(deliveryPostcode.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid 6-digit Indian delivery PIN code',
          pickup_postcode: pickupPostcode
        },
        { status: 400 }
      );
    }

    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { success: false, error: 'Shipment weight in kilograms must be greater than zero' },
        { status: 400 }
      );
    }

    const calculation = await calculateShippingRate({
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPostcode.trim(),
      weight,
      cod,
      declared_value: declaredValue
    });

    return NextResponse.json(calculation);
  } catch (error: any) {
    console.error('API Error in /api/shipping/calculate (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping rate', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deliveryPostcode = body.delivery_postcode || body.pincode || body.destination_pincode;
    const pickupPostcode = body.pickup_postcode || ORIGIN_PICKUP_POSTCODE;
    const weight = parseFloat(body.weight || '1.0');
    const cod = body.cod === 1 || body.cod === true;
    const declaredValue = parseFloat(body.declared_value || body.subtotal || '0');

    if (!deliveryPostcode || String(deliveryPostcode).trim().length !== 6 || !/^\d{6}$/.test(String(deliveryPostcode).trim())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid 6-digit Indian delivery PIN code',
          pickup_postcode: pickupPostcode
        },
        { status: 400 }
      );
    }

    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { success: false, error: 'Shipment weight in kilograms must be greater than zero' },
        { status: 400 }
      );
    }

    const calculation = await calculateShippingRate({
      pickup_postcode: pickupPostcode,
      delivery_postcode: String(deliveryPostcode).trim(),
      weight,
      cod,
      declared_value: declaredValue,
      length: body.length,
      breadth: body.breadth,
      height: body.height
    });

    return NextResponse.json(calculation);
  } catch (error: any) {
    console.error('API Error in /api/shipping/calculate (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping rate', details: error.message },
      { status: 500 }
    );
  }
}
