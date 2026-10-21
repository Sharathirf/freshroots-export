'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Calculator, MapPin, Package, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CourierOption, ShippingCalculationResult } from '@/lib/shiprocket';

interface ShippingRateCalculatorProps {
  initialWeight?: number;
  initialPincode?: string;
  compact?: boolean;
  onRateSelected?: (courier: CourierOption) => void;
}

export default function ShippingRateCalculator({
  initialWeight = 15,
  initialPincode = '560001',
  compact = false,
  onRateSelected
}: ShippingRateCalculatorProps) {
  const [pincode, setPincode] = useState(initialPincode);
  const [weight, setWeight] = useState<number>(initialWeight);
  const [selectedProduct, setSelectedProduct] = useState<string>('COC-SEMI-25P-15K');
  const [isCod, setIsCod] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShippingCalculationResult | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);

  const productPresets = [
    { sku: 'COC-SEMI-25P-15K', name: 'Fresh Mature Coconuts (25-pc bag, ~15 kg)', weight: 15 },
    { sku: 'COP-BAL-BOX-15K', name: 'GI Ball Copra (15 kg Master Box)', weight: 15 },
    { sku: 'COP-BAL-BOX-25K', name: 'GI Ball Copra (25 kg Master Box)', weight: 25 },
    { sku: 'COP-BAL-BOX-30K', name: 'GI Ball Copra (30 kg Master Box)', weight: 30 },
    { sku: 'NUR-COC-PLT-01Y', name: 'Coconut Plants (50 saplings MOQ, ~175 kg)', weight: 175 },
    { sku: 'NUR-ARE-PLT-01Y', name: 'Arecanut Plants (200 saplings MOQ, ~240 kg)', weight: 240 },
    { sku: 'OIL-GND-WOD-01L', name: 'Wood-Pressed Groundnut Oil (1 Litre, ~1 kg)', weight: 1 },
    { sku: 'MIL-RAG-ORG-05K', name: 'Karnataka Ragi Millet (5 kg Pack)', weight: 5 },
    { sku: 'MIL-RAG-ORG-25K', name: 'Karnataka Ragi Millet (25 kg Gunny)', weight: 25 },
    { sku: 'DAI-GHE-BIL-01L', name: 'Pure Desi Cow Ghee (1 Litre Jar, ~1.2 kg)', weight: 1.2 },
    { sku: 'CUSTOM', name: 'Custom Weight (Enter Below)', weight: initialWeight }
  ];

  const handleProductChange = (sku: string) => {
    setSelectedProduct(sku);
    const found = productPresets.find((p) => p.sku === sku);
    if (found && found.sku !== 'CUSTOM') {
      setWeight(found.weight);
    }
  };

  const calculateRates = async () => {
    if (!pincode || pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    if (weight <= 0) {
      setError('Weight must be greater than zero');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/shipping/calculate?pincode=${pincode.trim()}&weight=${weight}&cod=${isCod ? 1 : 0}`
      );
      const data = await res.json();

      if (data.success) {
        setResult(data);
        if (data.available_courier_companies?.length > 0) {
          const first = data.available_courier_companies[0];
          setSelectedCourierId(first.courier_company_id);
          if (onRateSelected) {
            onRateSelected(first);
          }
        }
      } else {
        setError(data.error || 'Failed to calculate shipping rates');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to Shiprocket shipping engine');
    } finally {
      setLoading(false);
    }
  };

  // Initial calculation on mount
  useEffect(() => {
    calculateRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCourier = (courier: CourierOption) => {
    setSelectedCourierId(courier.courier_company_id);
    if (onRateSelected) {
      onRateSelected(courier);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-[#3b6d11] font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4 text-[#3b6d11]" />
            <span>Shiprocket Powered Freight Calculator</span>
          </div>
          <h3 className={`font-black text-stone-900 tracking-tight mt-1 ${compact ? 'text-base' : 'text-xl'}`}>
            Live Transportation Rate Engine
          </h3>
          <p className="text-stone-500 text-xs mt-0.5">
            Transportation charged extra on actual weight & destination (Modeled after coconutseller.in logistics)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-600">
          <MapPin className="w-3.5 h-3.5 text-[#3b6d11] shrink-0" />
          <span>Origin: <strong>Kikkeri, Mandya (571423)</strong></span>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 pb-5">
        {/* Preset Commodity */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Select Commodity / Pack
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] font-medium"
          >
            {productPresets.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Weight in kg */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex justify-between">
            <span>Shipment Weight (kg)</span>
            <span className="text-[11px] text-stone-400 font-normal">Volumetric / Gross</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="50000"
              value={weight}
              onChange={(e) => {
                setWeight(parseFloat(e.target.value) || 1);
                setSelectedProduct('CUSTOM');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] font-bold font-mono"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
              KG
            </span>
          </div>
        </div>

        {/* Destination Pincode */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex justify-between">
            <span>Destination Pincode</span>
            <span className="text-[11px] text-[#3b6d11] font-semibold">Pan-India</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 560001"
              className="flex-1 px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6d11] font-bold font-mono"
            />
            <button
              type="button"
              onClick={calculateRates}
              disabled={loading}
              className="bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculate</span>
                </>
              )}
            </button>
          </div>
          <label className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isCod}
              onChange={(e) => setIsCod(e.target.checked)}
              className="rounded text-[#3b6d11] focus:ring-[#3b6d11]"
            />
            <span>Cash on Delivery (COD)</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Container */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Zonal Corridor Bar */}
          <div className="bg-lime-50/70 border border-lime-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-600 animate-pulse"></span>
              <span className="text-stone-700 font-medium">Destination Zone:</span>
              <strong className="text-stone-900">{result.zone}</strong>
            </div>
            <div className="text-stone-500">
              Chargeable Weight: <strong className="font-mono text-stone-900">{result.weight_kg} kg</strong>
            </div>
          </div>

          {/* Courier Rates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.available_courier_companies?.map((courier) => {
              const isSelected = selectedCourierId === courier.courier_company_id;
              return (
                <div
                  key={courier.courier_company_id}
                  onClick={() => handleSelectCourier(courier)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'border-[#3b6d11] bg-lime-50/40 shadow-sm ring-1 ring-[#3b6d11]'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">
                          {courier.courier_name}
                        </span>
                        {courier.is_best_value && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#1c3809] text-[10px] font-black uppercase tracking-wider">
                            Best Value
                          </span>
                        )}
                        {courier.is_fastest && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                            Fastest
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Estimated Transit: <strong className="text-stone-800">{courier.estimated_delivery_days}</strong> (Doorstep Delivery)
                      </div>
                      <div className="text-[11px] text-stone-400 leading-snug">
                        {courier.description}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black font-mono text-stone-900">
                        ₹{courier.rate.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Base: ₹{courier.freight_charge} + ₹{courier.handling_charge} hdl
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-medium">
                      Mode: <span className="text-stone-700 font-semibold">{courier.mode}</span>
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-[#3b6d11]' : 'text-stone-400'}`}>
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3b6d11]" />
                          Selected Courier
                        </>
                      ) : (
                        'Click to Select'
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Heavy Truckload Note (coconutseller.in standard) */}
          {weight >= 100 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5 mt-2">
              <Package className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">
                  Heavy Consignment / Full Truckload (FTL) Notice (10T, 25T, 30T):
                </div>
                <div className="text-amber-900 leading-relaxed text-[11px]">
                  For high-tonnage consignments (e.g. 50+ bags of mature coconuts, tender coconut lots, or 500+ plant saplings), transportation is arranged via dedicated multi-axle lorries directly from Kikkeri weighbridge. Direct transport cost is charged at actuals with weighbridge slips and driver contacts.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
