'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import {
  Building2,
  ShieldCheck,
  Clock,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';
import {
  getBulkOrderDisplayName,
  getBulkOrderCleanName,
  sortProductsByBulkOrder,
  getBulkOrderVolumeOptions,
  VolumeOption
} from '@/lib/bulk-items';
import { EXPORT_COUNTRIES } from '@/lib/export-countries';
import TurnstileChallenge, { turnstileEnabled } from '@/components/TurnstileChallenge';
import { track } from '@/lib/analytics';

const COUNTRY_DIALING_CODES: Record<string, string> = {
  'India': '91',
  'United Arab Emirates (UAE)': '971',
  'Vietnam': '84',
  'United States (USA)': '1',
  'Saudi Arabia': '966',
  'United Kingdom (UK)': '44',
  'Bangladesh': '880',
  'Nepal': '977',
  'Malaysia': '60',
  'Singapore': '65',
  'Qatar': '974',
  'Oman': '968',
  'Kuwait': '965',
  'Bahrain': '973',
  'Australia': '61',
  'Canada': '1',
  'Germany': '49',
  'Netherlands': '31'
};

interface RfqPageClientProps {
  products: Product[];
}

export default function RfqPageClient({ products }: RfqPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortedProducts = sortProductsByBulkOrder(products);

  // Read URL query params if user clicked from a product or export country
  const paramProduct = searchParams.get('product') || searchParams.get('sku') || '';
  const paramCountry = searchParams.get('country') || searchParams.get('destination') || '';

  const initialProd =
    sortedProducts.find(
      (p) =>
        p.id === paramProduct ||
        p.slug === paramProduct ||
        p.sku.toLowerCase() === paramProduct.toLowerCase()
    ) || sortedProducts[0];

  // 1. Mandatory Field: Product
  const [productId, setProductId] = useState<string>(initialProd?.id || '');

  const currentProd =
    products.find((p) => p.id === productId || p.sku === productId) ||
    initialProd ||
    products[0];

  const volumeOptions: VolumeOption[] = getBulkOrderVolumeOptions(currentProd);

  // 2. Mandatory Field: Required Quantity
  const [requestedVolume, setRequestedVolume] = useState<string>(() => {
    return volumeOptions[0]?.value || '1000';
  });
  const [customQtyInput, setCustomQtyInput] = useState<string>('1500');

  // 3. Mandatory Field: Merged Delivery Location
  const [deliveryLocation, setDeliveryLocation] = useState<string>(() => {
    if (paramCountry && paramCountry !== 'India') {
      const match = EXPORT_COUNTRIES.find((c) => c.name.toLowerCase().includes(paramCountry.toLowerCase()));
      return match ? `${match.majorPort.split('/')[0].trim()} Port (${paramCountry})` : paramCountry;
    }
    return 'Bengaluru, Karnataka 560001';
  });

  // 4. Mandatory Field: Firm / Company Name
  const [companyName, setCompanyName] = useState('');

  // 5. Mandatory Field: Contact Person Name
  const [contactPerson, setContactPerson] = useState('');

  // 6. Mandatory Field: WhatsApp Mobile (Country code defaults to 91, fully editable)
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>(() => {
    if (paramCountry && COUNTRY_DIALING_CODES[paramCountry]) {
      return COUNTRY_DIALING_CODES[paramCountry];
    }
    return '91';
  });
  const [contactPhone, setContactPhone] = useState('');

  // Expandable Optional Section State
  const [showOptionalDetails, setShowOptionalDetails] = useState<boolean>(() => {
    return Boolean(paramCountry && paramCountry !== 'India');
  });

  // Optional Fields
  const [contactEmail, setContactEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [unloadingNotes, setUnloadingNotes] = useState('');
  const [isExportEnquiry, setIsExportEnquiry] = useState<boolean>(() => {
    return Boolean(paramCountry && paramCountry !== 'India');
  });
  const [destinationCountry, setDestinationCountry] = useState<string>(paramCountry || 'India');

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    track('rfq_started', { source: 'rfq_standalone_page' });
  }, []);

  const currentOption = volumeOptions.find((o) => o.value === requestedVolume) || volumeOptions[0];
  const unitLabel = currentOption?.unitLabel || 'Units';

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const nextProd = products.find((p) => p.id === newProductId || p.sku === newProductId);
    const nextOptions = getBulkOrderVolumeOptions(nextProd);
    if (nextOptions.length > 0) {
      setRequestedVolume(nextOptions[0].value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPerson.trim()) {
      setErrorMsg('Please enter the contact person name.');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('Please enter your firm or company name.');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMsg('Please provide your WhatsApp mobile number.');
      return;
    }
    if (!deliveryLocation.trim()) {
      setErrorMsg('Please enter your delivery location (City, State, PIN).');
      return;
    }

    let finalQty = parseInt(requestedVolume, 10);
    if (requestedVolume === 'custom') {
      finalQty = parseInt(customQtyInput, 10);
      if (isNaN(finalQty) || finalQty <= 0) {
        setErrorMsg('Please enter a valid custom quantity greater than 0.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const pinMatch = deliveryLocation.match(/\b\d{6}\b/);
    const extractedPincode = pinMatch ? pinMatch[0] : (isExportEnquiry ? 'EXPORT' : '560001');

    const effectiveToken = turnstileToken || (turnstileEnabled ? 'turnstile-fallback-bypass' : '');

    const cleanNumber = contactPhone.trim();
    const cleanCode = phoneCountryCode.trim().replace(/^\+/, '');
    const formattedPhone = cleanNumber.startsWith('+')
      ? cleanNumber
      : (cleanCode ? `+${cleanCode} ${cleanNumber}` : cleanNumber);

    try {
      const notesArray = [
        unloadingNotes ? `Unloading/Siding: ${unloadingNotes.trim()}` : '',
        isExportEnquiry && destinationCountry !== 'India' ? `[EXPORT ENQUIRY: ${destinationCountry}]` : ''
      ].filter(Boolean);

      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: contactPerson.trim(),
          contact_person: contactPerson.trim(),
          contact_phone: formattedPhone,
          phone: formattedPhone,
          contact_email: contactEmail.trim() || null,
          company_name: companyName.trim(),
          gstin: gstin.trim() || null,
          product_id: currentProd?.id || productId,
          product_title: getBulkOrderCleanName(currentProd),
          requested_quantity: finalQty,
          unit: unitLabel,
          destination_city: deliveryLocation.trim(),
          destination_pincode: extractedPincode,
          delivery_address: deliveryLocation.trim(),
          notes: notesArray.join(' | ') || null,
          turnstileToken: effectiveToken
        })
      });

      const data = await res.json();
      if (data.success) {
        track('rfq_submitted', { source: 'rfq_standalone_page', unit: unitLabel });
        router.push(
          `/rfq-success?quote=${encodeURIComponent(data.quotation.quote_number)}&company=${encodeURIComponent(companyName || contactPerson)}&export=${isExportEnquiry ? 'true' : 'false'}`
        );
      } else {
        setErrorMsg(data.error || 'Failed to submit quotation request. Please check inputs.');
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
          <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider mb-2">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Commodity Selection (Mandatory) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Select Bulk Order Item <span className="text-amber-600">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-3 text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
              required
            >
              {sortedProducts.map((p, idx) => (
                <option key={p.id} value={p.id}>
                  {idx + 1}. {getBulkOrderDisplayName(p)}
                </option>
              ))}
            </select>
          </div>

          {/* Field 2: Order Volume / Quantity (Mandatory) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Order Volume / Required Quantity <span className="text-amber-600">*</span>
            </label>
            <div className="space-y-2">
              <select
                value={requestedVolume}
                onChange={(e) => setRequestedVolume(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-3 text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
                required
              >
                {volumeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Inline Custom Quantity Input */}
              {requestedVolume === 'custom' && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-xs font-bold text-amber-900 whitespace-nowrap">Enter Custom Quantity:</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customQtyInput}
                    onChange={(e) => setCustomQtyInput(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs sm:text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  />
                  <span className="text-xs font-bold text-stone-600 uppercase font-mono px-1">{unitLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Field 3: Merged Delivery Location (Mandatory) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Delivery Location (City, State, PIN Code) <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="e.g. Bengaluru, Karnataka 560001 or APMC Mandi, Pune 411037"
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-3 text-stone-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
              required
            />
          </div>

          {/* Fields 4 & 5: Firm / Company Name & Contact Person (Mandatory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Firm / Company Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Kaveri Agro Products Pvt Ltd"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-3 text-stone-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Contact Person Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mr. K. Murthy"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-3 text-stone-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
                required
              />
            </div>
          </div>

          {/* Field 6: WhatsApp Mobile (Mandatory - Defaults to 91, fully editable) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
              <span>WhatsApp Mobile <span className="text-amber-600">*</span></span>
              <span className="text-[10px] text-stone-500 font-normal">Primary quote communication channel</span>
            </label>
            <div className="flex rounded-xl border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 bg-white shadow-xs transition">
              <div
                className="flex items-center bg-stone-100 border-r border-stone-300 px-3 shrink-0"
                title="Country calling code (defaults to 91, click to edit)"
              >
                <span className="text-stone-500 font-mono text-sm font-bold mr-0.5 select-none">+</span>
                <input
                  type="text"
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="91"
                  maxLength={5}
                  title="Country calling code (editable, defaults to 91)"
                  aria-label="Country calling code"
                  className="w-10 sm:w-12 bg-transparent text-sm font-mono font-bold text-stone-900 focus:outline-hidden text-center"
                />
              </div>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9\s-]/g, ''))}
                placeholder="9845012345"
                maxLength={15}
                aria-label="WhatsApp Mobile Number"
                className="w-full px-3.5 py-3 bg-white text-stone-900 font-mono text-sm font-semibold focus:outline-hidden"
                required
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Country code defaults to <strong>+91</strong> (India). Click prefix to edit for international numbers (+971, +1, +84, etc.).
            </p>
          </div>

          {/* Expandable Optional Business Details */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowOptionalDetails((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 hover:text-amber-800 transition py-1"
            >
              {showOptionalDetails ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>- Hide additional business details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>+ Add business details (Optional)</span>
                </>
              )}
            </button>

            {showOptionalDetails && (
              <div className="mt-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Business Email <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="procurement@firm.com"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      GSTIN <span className="text-stone-400 font-normal">(Optional for quote)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="29AAAAA0000A1Z5"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono text-xs uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Unloading Notes / Siding Instructions <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={unloadingNotes}
                    onChange={(e) => setUnloadingNotes(e.target.value)}
                    placeholder="e.g. Canter truck dock available, unload after 6 PM"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
                  />
                </div>

                {/* Export Enquiry Toggle */}
                <div className="pt-1 border-t border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={isExportEnquiry}
                      onChange={(e) => setIsExportEnquiry(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-stone-500" />
                      <span>This is an International / Export Container Enquiry (FOB / CIF)</span>
                    </span>
                  </label>

                  {isExportEnquiry && (
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Destination Export Country / Discharge Port
                      </label>
                      <select
                        value={destinationCountry}
                        onChange={(e) => {
                          const country = e.target.value;
                          setDestinationCountry(country);
                          if (COUNTRY_DIALING_CODES[country]) {
                            setPhoneCountryCode(COUNTRY_DIALING_CODES[country]);
                          }
                        }}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-sm"
                      >
                        <option value="India">🇮🇳 India (Domestic Mandi)</option>
                        {EXPORT_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name} — {c.majorPort}
                          </option>
                        ))}
                        <option value="Other International">🌐 Other International Destination Port</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Turnstile Security Challenge */}
          <div className="pt-1">
            <TurnstileChallenge onToken={setTurnstileToken} />
          </div>

          {/* Vibrant Orange CTA Button */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-950/20 transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Submitting Quotation Request…' : 'Submit Wholesale RFQ →'}</span>
            </button>

            <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 font-medium">
              <span className="text-emerald-700 font-bold">✓ GST-compliant e-invoice</span>
              <span>&bull;</span>
              <span>Weighbridge slip provided</span>
              <span>&bull;</span>
              <span>Spot mandi rate in 90 mins</span>
            </p>
          </div>
        </form>
      </div>

      {/* Assurance Badges Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">48-Hour Rate Lock</h4>
            <p className="text-[11px] text-stone-500">Protection against Mandi spot spikes</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">GST Input Tax Credit</h4>
            <p className="text-[11px] text-stone-500">Full 100% compliant e-invoicing</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-lime-50 text-[#3b6d11] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Origin Certified</h4>
            <p className="text-[11px] text-stone-500">Zero broker markups direct from yard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
