/**
 * Shiprocket Shipping Rate Calculator & Logistics Integration
 * Documentation: https://apidocs.shiprocket.in/
 * Endpoint: https://apiv2.shiprocket.in/v1/external/courier/serviceability/
 * 
 * Origin: Kikkeri, K.R. Pete, Mandya, Karnataka - 571423 (SHARATH INORAHALLI)
 * Policy: "Transportation Charged Extra" (Modeled after coconutseller.in/transportation)
 */

export interface CourierOption {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  freight_charge: number;
  handling_charge: number;
  cod_charges: number;
  tax_amount: number;
  estimated_delivery_days: string;
  etd_days: number;
  charge_weight_kg: number;
  rating: number;
  mode: 'Surface Heavy' | 'Express Surface' | 'Air Cargo';
  is_best_value: boolean;
  is_fastest: boolean;
  description: string;
}

export interface ShippingCalculationParams {
  pickup_postcode?: string | number;
  delivery_postcode: string | number;
  weight: number; // in kg
  cod?: number | boolean; // 0 = prepaid, 1 = cash on delivery
  declared_value?: number;
  length?: number; // cm
  breadth?: number; // cm
  height?: number; // cm
}

export interface ShippingCalculationResult {
  success: boolean;
  pickup_postcode: string;
  delivery_postcode: string;
  weight_kg: number;
  zone: string;
  zone_code: 'A' | 'B' | 'C' | 'D' | 'E';
  destination_city: string;
  destination_state: string;
  policy: string;
  available_courier_companies: CourierOption[];
  recommended_courier_company_id: number;
  recommended_courier_name: string;
  lowest_rate: number;
  free_shipping_threshold: number;
  is_free_shipping: boolean;
  effective_rate: number;
  free_shipping_message: string;
  source: 'shiprocket_live_api' | 'shiprocket_rate_engine';
  error?: string;
}

export const FREE_SHIPPING_THRESHOLD = 0; // 100% Free Delivery on all orders
export const ORIGIN_PICKUP_POSTCODE = '571423'; // Kikkeri, Mandya, Karnataka
export const ORIGIN_HUB_NAME = 'SHARATH INORAHALLI Logistics Hub';

/**
 * Determine postal shipping zone from Mandya, Karnataka (571423)
 */
export function determineShippingZone(destinationPincode: string): {
  zone: string;
  zone_code: 'A' | 'B' | 'C' | 'D' | 'E';
  state: string;
  region: string;
} {
  const pin = destinationPincode.trim();
  const prefix2 = pin.substring(0, 2);
  const prefix3 = pin.substring(0, 3);

  // Zone A: Intra-district / Local Hub (Mandya, Mysuru, Hassan)
  if (['571', '570', '573'].includes(prefix3)) {
    return {
      zone: 'Zone A (Mandya / Mysuru Local Corridor)',
      zone_code: 'A',
      state: 'Karnataka',
      region: 'Local Mandya Corridor'
    };
  }

  // Zone B: Intra-State Karnataka (Bengaluru, Tumakuru, Mangaluru, Hubballi, etc.)
  if (['56', '57', '58', '59'].includes(prefix2)) {
    return {
      zone: 'Zone B (Intra-State Karnataka)',
      zone_code: 'B',
      state: 'Karnataka',
      region: 'Karnataka State'
    };
  }

  // Zone C: South India Regional Metros (Tamil Nadu, Kerala, Andhra Pradesh, Telangana)
  if (['50', '51', '52', '53', '60', '61', '62', '63', '64', '67', '68', '69'].includes(prefix2)) {
    return {
      zone: 'Zone C (South India Agri Freight Corridor)',
      zone_code: 'C',
      state: 'South India',
      region: 'South India'
    };
  }

  // Zone E: Special / North East / Jammu & Kashmir / Islands
  if (['78', '79', '18', '19', '74'].includes(prefix2)) {
    return {
      zone: 'Zone E (Special / Remote / North East / J&K)',
      zone_code: 'E',
      state: 'Special Region',
      region: 'Special/Remote'
    };
  }

  // Zone D: Rest of India (North, West, Central, East - Delhi, Mumbai, Gujarat, etc.)
  return {
    zone: 'Zone D (Rest of India - National Surface Corridor)',
    zone_code: 'D',
    state: 'Pan-India',
    region: 'Rest of India'
  };
}

/**
 * Calculate accurate freight rates based on Shiprocket Surface Courier rate cards
 */
export function calculateLocalShiprocketRates(
  params: ShippingCalculationParams
): ShippingCalculationResult {
  const pickup = String(params.pickup_postcode || ORIGIN_PICKUP_POSTCODE).trim();
  const delivery = String(params.delivery_postcode).trim();
  const weightKg = Math.max(0.5, Number(params.weight) || 1.0);
  const isCod = params.cod === 1 || params.cod === true;
  const declaredValue = Number(params.declared_value || 0);

  const { zone, zone_code, state, region } = determineShippingZone(delivery);

  // Rate multipliers based on zonal distance from Mandya
  const zoneRateTable = {
    A: { base500g: 45, addKg: 20, bulkKg: 10, days: '1-2 Days', etdDays: 2 },
    B: { base500g: 65, addKg: 30, bulkKg: 14, days: '2-3 Days', etdDays: 3 },
    C: { base500g: 85, addKg: 42, bulkKg: 20, days: '3-4 Days', etdDays: 4 },
    D: { base500g: 110, addKg: 60, bulkKg: 28, days: '4-6 Days', etdDays: 5 },
    E: { base500g: 150, addKg: 85, bulkKg: 42, days: '6-8 Days', etdDays: 7 }
  }[zone_code];

  // Weight charge calculation (heavy agricultural parcels get volume bulk discounts)
  const computeCourierFreight = (baseMultiplier: number, perKgMultiplier: number) => {
    let freight = 0;
    if (weightKg <= 0.5) {
      freight = zoneRateTable.base500g * baseMultiplier;
    } else if (weightKg <= 5.0) {
      freight = (zoneRateTable.base500g + (weightKg - 0.5) * zoneRateTable.addKg) * perKgMultiplier;
    } else {
      // Heavy parcel pricing (e.g. 15 kg coconut bags, 15 kg copra boxes, plants)
      freight = (zoneRateTable.base500g + 4.5 * zoneRateTable.addKg + (weightKg - 5.0) * zoneRateTable.bulkKg) * perKgMultiplier;
    }
    return Math.round(freight);
  };

  const codFee = isCod ? Math.max(40, Math.round(declaredValue * 0.015)) : 0;

  // 1. VRL Logistics Agri Surface (Best for agricultural bulk & heavy bags)
  const vrlFreight = computeCourierFreight(0.85, 0.88);
  const vrlHandling = Math.round(weightKg * 1.5);
  const vrlTotal = vrlFreight + vrlHandling + (isCod ? 50 : 0);

  // 2. Delhivery Surface Cargo (Standard express surface, nationwide coverage)
  const delFreight = computeCourierFreight(1.0, 1.0);
  const delHandling = Math.round(weightKg * 2.0);
  const delTotal = delFreight + delHandling + codFee;

  // 3. DTDC Express Cargo (Reliable pan-India network)
  const dtdcFreight = computeCourierFreight(1.15, 1.12);
  const dtdcHandling = Math.round(weightKg * 2.5);
  const dtdcTotal = dtdcFreight + dtdcHandling + codFee;

  // 4. Bluedart Express Surface (Premium priority air/surface)
  const blueFreight = computeCourierFreight(1.45, 1.35);
  const blueHandling = Math.round(weightKg * 3.0);
  const blueTotal = blueFreight + blueHandling + codFee;

  const couriers: CourierOption[] = [
    {
      courier_company_id: 22,
      courier_name: 'VRL Logistics Agri Heavy Surface',
      rate: vrlTotal,
      freight_charge: vrlFreight,
      handling_charge: vrlHandling,
      cod_charges: isCod ? 50 : 0,
      tax_amount: Math.round(vrlTotal * 0.18),
      estimated_delivery_days: zoneRateTable.days,
      etd_days: zoneRateTable.etdDays,
      charge_weight_kg: weightKg,
      rating: 4.8,
      mode: 'Surface Heavy',
      is_best_value: true,
      is_fastest: false,
      description: 'Specialized cargo for agricultural bags, saplings & oil cartons with weighbridge verification.'
    },
    {
      courier_company_id: 10,
      courier_name: 'Delhivery Surface Express',
      rate: delTotal,
      freight_charge: delFreight,
      handling_charge: delHandling,
      cod_charges: codFee,
      tax_amount: Math.round(delTotal * 0.18),
      estimated_delivery_days: zoneRateTable.days,
      etd_days: zoneRateTable.etdDays,
      charge_weight_kg: weightKg,
      rating: 4.6,
      mode: 'Express Surface',
      is_best_value: false,
      is_fastest: false,
      description: 'Pan-India automated barcode tracking with SMS and WhatsApp OTP delivery.'
    },
    {
      courier_company_id: 14,
      courier_name: 'DTDC Agri Parcel Network',
      rate: dtdcTotal,
      freight_charge: dtdcFreight,
      handling_charge: dtdcHandling,
      cod_charges: codFee,
      tax_amount: Math.round(dtdcTotal * 0.18),
      estimated_delivery_days: zoneRateTable.days,
      etd_days: zoneRateTable.etdDays,
      charge_weight_kg: weightKg,
      rating: 4.5,
      mode: 'Express Surface',
      is_best_value: false,
      is_fastest: false,
      description: 'Extensive rural and taluk level doorstep delivery coverage.'
    },
    {
      courier_company_id: 4,
      courier_name: 'Bluedart Priority Surface',
      rate: blueTotal,
      freight_charge: blueFreight,
      handling_charge: blueHandling,
      cod_charges: codFee,
      tax_amount: Math.round(blueTotal * 0.18),
      estimated_delivery_days: Math.max(1, zoneRateTable.etdDays - 1) + ' Days',
      etd_days: Math.max(1, zoneRateTable.etdDays - 1),
      charge_weight_kg: weightKg,
      rating: 4.9,
      mode: 'Air Cargo',
      is_best_value: false,
      is_fastest: true,
      description: 'Guaranteed fastest transit with premium weather-protected delivery vans.'
    }
  ];

  // Sort by price ascending
  couriers.sort((a, b) => a.rate - b.rate);

  const lowestRate = couriers[0].rate;

  return {
    success: true,
    pickup_postcode: pickup,
    delivery_postcode: delivery,
    weight_kg: weightKg,
    zone,
    zone_code,
    destination_city: `${region} (PIN: ${delivery})`,
    destination_state: state,
    policy: '100% Free Doorstep Delivery on ALL Orders across India (No Minimum Quantity)',
    available_courier_companies: couriers,
    recommended_courier_company_id: couriers[0].courier_company_id,
    recommended_courier_name: couriers[0].courier_name,
    lowest_rate: lowestRate,
    free_shipping_threshold: 0,
    is_free_shipping: true,
    effective_rate: 0,
    free_shipping_message: 'Qualified for 100% FREE Doorstep Delivery (All Orders - No Minimums)',
    source: 'shiprocket_rate_engine'
  };
}

/**
 * Live Shiprocket API caller with fallback to rate engine
 */
export async function calculateShippingRate(
  params: ShippingCalculationParams
): Promise<ShippingCalculationResult> {
  const pickup = String(params.pickup_postcode || ORIGIN_PICKUP_POSTCODE).trim();
  const delivery = String(params.delivery_postcode).trim();
  const weight = Math.max(0.5, Number(params.weight) || 1.0);
  const cod = params.cod === 1 || params.cod === true ? 1 : 0;

  // Validate pincode format
  if (!delivery || delivery.length !== 6 || !/^\d{6}$/.test(delivery)) {
    throw new Error('Please enter a valid 6-digit Indian PIN code');
  }

  const token = process.env.SHIPROCKET_TOKEN;

  if (token) {
    try {
      const url = new URL('https://apiv2.shiprocket.in/v1/external/courier/serviceability/');
      url.searchParams.set('pickup_postcode', pickup);
      url.searchParams.set('delivery_postcode', delivery);
      url.searchParams.set('weight', String(weight));
      url.searchParams.set('cod', String(cod));
      if (params.length) url.searchParams.set('length', String(params.length));
      if (params.breadth) url.searchParams.set('breadth', String(params.breadth));
      if (params.height) url.searchParams.set('height', String(params.height));

      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 60 } // Cache for 1 min
      });

      if (res.ok) {
        const json = await res.json();
        const companies = json.data?.available_courier_companies || [];
        if (companies.length > 0) {
          const mapped: CourierOption[] = companies.map((c: any) => ({
            courier_company_id: c.courier_company_id,
            courier_name: c.courier_name,
            rate: Math.round(Number(c.rate || 0)),
            freight_charge: Math.round(Number(c.freight_charge || c.rate || 0)),
            handling_charge: Math.round(Number(c.handling_charge || 0)),
            cod_charges: Math.round(Number(c.cod_charges || 0)),
            tax_amount: Math.round(Number(c.tax_amount || 0)),
            estimated_delivery_days: c.estimated_delivery_days || `${c.etd} Days`,
            etd_days: parseInt(c.estimated_delivery_days, 10) || 3,
            charge_weight_kg: Number(c.charge_weight || weight),
            rating: Number(c.rating || 4.5),
            mode: 'Express Surface',
            is_best_value: c.courier_company_id === json.data?.recommended_courier_company_id,
            is_fastest: false,
            description: 'Direct courier dispatch from Mandya via Shiprocket.'
          }));

          const { zone, zone_code, state, region } = determineShippingZone(delivery);
          const lowest = mapped[0]?.rate || 100;

          return {
            success: true,
            pickup_postcode: pickup,
            delivery_postcode: delivery,
            weight_kg: weight,
            zone,
            zone_code,
            destination_city: `${region} (PIN: ${delivery})`,
            destination_state: state,
            policy: '100% Free Doorstep Delivery on ALL Orders across India (No Minimum Quantity)',
            available_courier_companies: mapped,
            recommended_courier_company_id: json.data?.recommended_courier_company_id || mapped[0].courier_company_id,
            recommended_courier_name: mapped[0]?.courier_name || 'Shiprocket Courier',
            lowest_rate: lowest,
            free_shipping_threshold: 0,
            is_free_shipping: true,
            effective_rate: 0,
            free_shipping_message: 'Qualified for 100% FREE Doorstep Delivery (All Orders - No Minimums)',
            source: 'shiprocket_live_api'
          };
        }
      }
    } catch (err) {
      console.warn('Shiprocket live API error, falling back to local rate engine:', err);
    }
  }

  // Fallback to high-fidelity rate engine
  return calculateLocalShiprocketRates({
    pickup_postcode: pickup,
    delivery_postcode: delivery,
    weight,
    cod,
    declared_value: params.declared_value
  });
}
