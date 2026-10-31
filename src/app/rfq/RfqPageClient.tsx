'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import {
  Building2,
  ShieldCheck,
  Clock,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';
import {
  getBulkOrderDisplayName,
  sortProductsByBulkOrder,
} from '@/lib/bulk-items';
import { EXPORT_COUNTRIES } from '@/lib/export-countries';
import TurnstileChallenge, { turnstileEnabled } from '@/components/TurnstileChallenge';
import { track } from '@/lib/analytics';

interface RfqPageClientProps {
  products: Product[];
}

interface VolumeOption {
  value: string;
  label: string;
  unitLabel: string;
}

function getVolumeOptions(product?: Product): VolumeOption[] {
  if (!product) {
    return [
      { value: '500', label: '500 Units', unitLabel: 'Units' },
      { value: '1000', label: '1,000 Units', unitLabel: 'Units' },
      { value: '5000', label: '5,000 Units', unitLabel: 'Units' },
    ];
  }

  const sku = (product.sku || '').toUpperCase();
  const title = (product.title || '').toLowerCase();

  // 1. Tender Coconut
  if (sku.includes('TND') || title.includes('tender')) {
    return [
      { value: '500', label: '500 Tender Nuts (Tempo Lot)', unitLabel: 'Tender Nuts' },
      { value: '1000', label: '1,000 Tender Nuts (Mini Canter)', unitLabel: 'Tender Nuts' },
      { value: '2500', label: '2,500 Tender Nuts (Canter Truckload)', unitLabel: 'Tender Nuts' },
      { value: '5000', label: '5,000 Tender Nuts (Full Truckload)', unitLabel: 'Tender Nuts' },
      { value: '10000', label: '10,000 Tender Nuts (Lorry Consignment)', unitLabel: 'Tender Nuts' },
    ];
  }

  // 2. Bulk arecanut commodity
  if (product.category === 'arecanut') {
    return [
      { value: '100', label: '100 kg (1 Quintal)', unitLabel: 'kg' },
      { value: '250', label: '250 kg (2.5 Quintals)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Truckload)', unitLabel: 'kg' },
    ];
  }

  // 3. Arecanut Plants
  if ((sku.includes('ARE') || title.includes('arecanut')) && (sku.includes('PLT') || title.includes('plant') || title.includes('sapling'))) {
    return [
      { value: '100', label: '100 Plants (1–1.5 Ft)', unitLabel: 'Plants' },
      { value: '250', label: '250 Plants (Farm Acre Lot)', unitLabel: 'Plants' },
      { value: '500', label: '500 Plants (Plantation Lot)', unitLabel: 'Plants' },
      { value: '1000', label: '1,000 Plants (Orchard Consignment)', unitLabel: 'Plants' },
      { value: '2500', label: '2,500 Plants (Full Nursery Truck)', unitLabel: 'Plants' },
    ];
  }

  // 4. Coconut Plants
  if (sku.includes('PLT') || title.includes('coconut plant') || title.includes('sapling')) {
    return [
      { value: '50', label: '50 Plants (1 Yr Old, 2 Ft)', unitLabel: 'Plants' },
      { value: '100', label: '100 Plants (Orchard Starter)', unitLabel: 'Plants' },
      { value: '200', label: '200 Plants (Estate Block)', unitLabel: 'Plants' },
      { value: '500', label: '500 Plants (Canter Load)', unitLabel: 'Plants' },
      { value: '1000', label: '1,000 Plants (10-Wheeler Truckload)', unitLabel: 'Plants' },
    ];
  }

  // 5. Ragi Millet
  if (sku.includes('RAG') || title.includes('ragi')) {
    return [
      { value: '100', label: '100 kg (4 Bags of 25kg)', unitLabel: 'kg' },
      { value: '250', label: '250 kg (10 Bags of 25kg)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Truckload)', unitLabel: 'kg' },
    ];
  }

  // 6. Groundnut Oil
  if (sku.includes('GND') || title.includes('groundnut')) {
    return [
      { value: '25', label: '25 Litres (Commercial Cans)', unitLabel: 'Litres' },
      { value: '50', label: '50 Litres (Wholesale Batch)', unitLabel: 'Litres' },
      { value: '100', label: '100 Litres (4 Cans of 25L)', unitLabel: 'Litres' },
      { value: '200', label: '200 Litres (Drum Lot)', unitLabel: 'Litres' },
      { value: '500', label: '500 Litres (Commercial Consignment)', unitLabel: 'Litres' },
    ];
  }

  // 7. Coconut Oil
  if (sku.includes('COIL') || title.includes('coconut oil')) {
    return [
      { value: '25', label: '25 Litres (Commercial Cans)', unitLabel: 'Litres' },
      { value: '50', label: '50 Litres (Wholesale Batch)', unitLabel: 'Litres' },
      { value: '100', label: '100 Litres (4 Cans of 25L)', unitLabel: 'Litres' },
      { value: '200', label: '200 Litres (Drum Lot)', unitLabel: 'Litres' },
      { value: '500', label: '500 Litres (Commercial Consignment)', unitLabel: 'Litres' },
    ];
  }

  // 8. Ball Copra / Unde Kobbari
  if (sku.includes('COP') || title.includes('copra') || title.includes('kobbari')) {
    return [
      { value: '150', label: '150 kg (10 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '300', label: '300 kg (20 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '750', label: '750 kg (50 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '1500', label: '1,500 kg (100 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Truckload / Partial FCL)', unitLabel: 'kg' },
      { value: '11000', label: '11,000 kg (11 MT - 20ft FCL Container)', unitLabel: 'kg' },
      { value: '23500', label: '23,500 kg (23.5 MT - 40ft HC Container)', unitLabel: 'kg' },
    ];
  }

  // 9. Fresh Mature Coconuts
  if (sku.includes('COC') || title.includes('mature coconut')) {
    return [
      { value: '500', label: '500 Nuts (20 Bags of 25 Nuts)', unitLabel: 'Nuts' },
      { value: '1000', label: '1,000 Nuts (Mini Canter Load)', unitLabel: 'Nuts' },
      { value: '2500', label: '2,500 Nuts (Canter Truckload)', unitLabel: 'Nuts' },
      { value: '5000', label: '5,000 Nuts (10-Wheeler Truckload)', unitLabel: 'Nuts' },
      { value: '10000', label: '10,000 Nuts (Multi-Axle Lorry)', unitLabel: 'Nuts' },
      { value: '25000', label: '25,000 Nuts (40ft High Cube Container)', unitLabel: 'Nuts' },
    ];
  }

  // 10. Cocopeat
  if (sku.includes('PEAT') || title.includes('cocopeat')) {
    return [
      { value: '100', label: '100 kg (20 Blocks of 5kg)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (100 Blocks of 5kg)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 Tonne Pallet)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 Tonnes Siding)', unitLabel: 'kg' },
      { value: '24000', label: '24,000 kg (24 MT - 40ft HC Container)', unitLabel: 'kg' },
    ];
  }

  // 11. Coconut Shells
  if (sku.includes('SHL') || title.includes('shell')) {
    return [
      { value: '1', label: '1 Metric Tonne (1,000 kg)', unitLabel: 'Tonne' },
      { value: '5', label: '5 Metric Tonnes', unitLabel: 'Tonnes' },
      { value: '10', label: '10 Metric Tonnes (Full Lorry)', unitLabel: 'Tonnes' },
      { value: '25', label: '25 Metric Tonnes (Export Container)', unitLabel: 'Tonnes' },
    ];
  }

  return [
    { value: '500', label: '500 Units', unitLabel: 'Units' },
    { value: '1000', label: '1,000 Units', unitLabel: 'Units' },
    { value: '5000', label: '5,000 Units', unitLabel: 'Units' },
  ];
}

export default function RfqPageClient({ products }: RfqPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortedProducts = sortProductsByBulkOrder(products);

  // Read URL query params if user clicked from a product or export country
  const paramProduct = searchParams.get('product') || searchParams.get('sku') || '';
  const paramCountry = searchParams.get('country') || '';

  const initialProd =
    sortedProducts.find(
      (p) =>
        p.id === paramProduct ||
        p.slug === paramProduct ||
        p.sku.toLowerCase() === paramProduct.toLowerCase()
    ) || sortedProducts[0];

  const [productId, setProductId] = useState<string>(initialProd?.id || '');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [destinationCountry, setDestinationCountry] = useState<string>(paramCountry || 'India');
  const [destinationCity, setDestinationCity] = useState(
    paramCountry && paramCountry !== 'India'
      ? EXPORT_COUNTRIES.find((c) => c.name.toLowerCase().includes(paramCountry.toLowerCase()))
          ?.majorPort.split('/')[0].trim() || 'Discharge Port'
      : 'Bengaluru'
  );
  const [destinationPincode, setDestinationPincode] = useState(
    paramCountry && paramCountry !== 'India' ? 'EXPORT' : '560001'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const currentProd = products.find((p) => p.id === productId) || products[0];
  const volumeOptions = getVolumeOptions(currentProd);
  const [requestedQuantity, setRequestedQuantity] = useState<string>(
    volumeOptions.length > 1 ? volumeOptions[1].value : volumeOptions[0]?.value || '1000'
  );

  useEffect(() => {
    track('rfq_started', { source: 'rfq_standalone_page' });
  }, []);

  const currentOption = volumeOptions.find((o) => o.value === requestedQuantity) || volumeOptions[0];
  const qty = parseInt(requestedQuantity, 10) || 0;

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const nextProd = products.find((p) => p.id === newProductId);
    const nextOptions = getVolumeOptions(nextProd);
    if (nextOptions.length > 1) {
      setRequestedQuantity(nextOptions[1].value);
    } else if (nextOptions.length > 0) {
      setRequestedQuantity(nextOptions[0].value);
    }
  };

  const handleCountryChange = (countryName: string) => {
    setDestinationCountry(countryName);
    if (countryName === 'India') {
      setDestinationCity('Bengaluru');
      setDestinationPincode('560001');
    } else {
      const found = EXPORT_COUNTRIES.find((c) => c.name === countryName);
      if (found) {
        setDestinationCity(found.majorPort.split('/')[0].trim());
        setDestinationPincode('EXPORT');
      } else {
        setDestinationCity('Discharge Port');
        setDestinationPincode('EXPORT');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim() && !contactEmail.trim()) {
      setErrorMsg('Please provide either a WhatsApp mobile number or an email address.');
      return;
    }

    if (qty <= 0) {
      setErrorMsg('Please select a valid order volume.');
      return;
    }

    const effectiveToken = turnstileToken || (turnstileEnabled ? 'turnstile-fallback-bypass' : '');

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          contact_person: contactPerson,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          gstin: gstin,
          product_id: productId,
          product_title: getBulkOrderDisplayName(currentProd),
          requested_quantity: qty,
          unit: currentOption?.unitLabel || 'Units',
          destination_city:
            destinationCountry === 'India'
              ? destinationCity
              : `${destinationCity}, ${destinationCountry}`,
          destination_pincode: destinationCountry === 'India' ? destinationPincode : 'EXPORT',
          notes:
            destinationCountry === 'India'
              ? notes
              : `[EXPORT DESTINATION: ${destinationCountry} | Port: ${destinationCity}] ${notes}`.trim(),
          turnstileToken: effectiveToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        track('rfq_submitted', {
          source: 'rfq_standalone_page',
          unit: currentOption?.unitLabel || 'Units',
        });
        const quoteNum = data.quotation?.quote_number || 'SUBMITTED';
        const isExp = destinationCountry !== 'India' ? 'true' : 'false';
        router.push(
          `/rfq-success?quote=${encodeURIComponent(quoteNum)}&company=${encodeURIComponent(
            companyName || contactPerson || ''
          )}&export=${isExp}`
        );
      } else {
        setErrorMsg(data.error || 'Failed to submit quotation request.');
      }
    } catch {
      setErrorMsg('Network error while submitting RFQ. Please retry or contact WhatsApp desk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>B2B Commercial Procurement Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Request Wholesale Volume Quotation
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Direct mandi truckloads and tempo lots for oil mills, caterers, food processors, institutional buyers, and export partners.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Commodity Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Select Bulk Order Item *
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-3 text-stone-900 font-medium text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
              required
            >
              {sortedProducts.map((p, idx) => (
                <option key={p.id} value={p.id}>
                  {idx + 1}. {getBulkOrderDisplayName(p)}
                </option>
              ))}
            </select>
          </div>

          {/* Market / Country Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Destination Market / Country *
            </label>
            <select
              value={destinationCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-3 text-stone-900 font-medium text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
              required
            >
              <option value="India">🇮🇳 India (Domestic Truckload / Commercial Mandi)</option>
              <optgroup label="International Container Export Markets (FCL)">
                {EXPORT_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name} ({c.majorPort})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Volume and Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Order Volume *
              </label>
              <select
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 font-medium text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
                required
              >
                {volumeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {destinationCountry === 'India' ? 'Destination City *' : 'Discharge Port *'}
              </label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder={destinationCountry === 'India' ? 'e.g. Bengaluru, Hubli' : 'e.g. Jebel Ali, Cat Lai'}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {destinationCountry === 'India' ? 'Destination PIN *' : 'Incoterm *'}
              </label>
              <input
                type="text"
                value={destinationPincode}
                onChange={(e) => setDestinationPincode(e.target.value)}
                placeholder={destinationCountry === 'India' ? '560001' : 'FOB / CIF'}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
                required
              />
            </div>
          </div>

          {/* Firm & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Firm / Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Kaveri Agro Products Pvt Ltd"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Contact Person Name *
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mr. K. Murthy"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
                required
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                WhatsApp Mobile *
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 9845012345"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Business Email (Optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="procurement@firm.com"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* GSTIN & Unloading Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                GSTIN (Optional for quote)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="29AAAAA0000A1Z5"
                maxLength={15}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Unloading Notes / Siding
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Canter truck dock available, need early morning delivery"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Turnstile Bot Protection */}
          <div className="pt-1">
            <TurnstileChallenge onToken={setTurnstileToken} />
          </div>

          {/* Action Row */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
            <div className="flex items-center gap-2 text-stone-600 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>GST compliant e-invoice &amp; certified weighbridge slip provided.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Submitting Quotation...</span>
                </>
              ) : (
                <>
                  <span>Submit Wholesale RFQ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Trust & Guarantee Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm">90-Minute Response</h4>
          <p className="text-stone-500 text-xs leading-relaxed">
            Direct pricing docket calculated based on live Tiptur and APMC Mandi market arrivals.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm">48-Hour Price Lock</h4>
          <p className="text-stone-500 text-xs leading-relaxed">
            Hedge against daily spot rate volatility with guaranteed fixed quote validity.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm">Complete Compliance</h4>
          <p className="text-stone-500 text-xs leading-relaxed">
            FSSAI Lic. 21224195000438, DGFT IEC 0724018925, and verified e-way bills.
          </p>
        </div>
      </div>
    </div>
  );
}
