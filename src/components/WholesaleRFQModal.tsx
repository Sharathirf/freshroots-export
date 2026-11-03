'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Building2, CheckCircle2, Phone, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import {
  getBulkOrderDisplayName,
  getBulkOrderCleanName,
  sortProductsByBulkOrder,
  getBulkOrderVolumeOptions,
  VolumeOption,
  BULK_ORDER_ITEMS
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

interface WholesaleRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct?: Product | null;
  initialCountry?: string;
}

export default function WholesaleRFQModal({
  isOpen,
  onClose,
  products,
  selectedProduct,
  initialCountry
}: WholesaleRFQModalProps) {
  const sortedProducts = sortProductsByBulkOrder(products);

  // 1. Mandatory Field: Product
  const [productId, setProductId] = useState<string>(() => {
    if (selectedProduct?.id) return selectedProduct.id;
    return sortedProducts.length > 0 ? sortedProducts[0].id : '';
  });

  // Find active product
  const currentProd =
    products.find((p) => p.id === productId || p.sku === productId) ||
    sortedProducts[0] ||
    products[0];

  const volumeOptions: VolumeOption[] = getBulkOrderVolumeOptions(currentProd);

  // 2. Mandatory Field: Required Quantity
  const [requestedVolume, setRequestedVolume] = useState<string>(() => {
    return volumeOptions[0]?.value || '1000';
  });
  const [customQtyInput, setCustomQtyInput] = useState<string>('1500');

  // 3. Mandatory Field: Merged Delivery Location
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Bengaluru, Karnataka 560001');

  // 4. Mandatory Field: Firm / Company Name
  const [companyName, setCompanyName] = useState<string>('');

  // 5. Mandatory Field: Contact Person Name
  const [contactPerson, setContactPerson] = useState<string>('');

  // 6. Mandatory Field: WhatsApp Mobile Number (Country code defaults to 91, fully editable)
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>(() => {
    if (initialCountry && COUNTRY_DIALING_CODES[initialCountry]) {
      return COUNTRY_DIALING_CODES[initialCountry];
    }
    return '91';
  });
  const [contactPhone, setContactPhone] = useState<string>('');

  // Expandable Optional Section State
  const [showOptionalDetails, setShowOptionalDetails] = useState<boolean>(() => {
    return Boolean(initialCountry && initialCountry !== 'India');
  });

  // Optional Fields
  const [contactEmail, setContactEmail] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [incoterm, setIncoterm] = useState<string>('FOB (Free On Board - Nhava Sheva / JNPT)');
  const [unloadingNotes, setUnloadingNotes] = useState<string>('');
  const [isExportEnquiry, setIsExportEnquiry] = useState<boolean>(() => {
    return Boolean(initialCountry && initialCountry !== 'India');
  });
  const [destinationCountry, setDestinationCountry] = useState<string>(() => {
    if (initialCountry && initialCountry !== 'India') {
      return initialCountry;
    }
    return 'United Arab Emirates (UAE)';
  });

  const handleToggleExportEnquiry = (checked: boolean) => {
    setIsExportEnquiry(checked);
    if (checked) {
      const targetCountry =
        destinationCountry && destinationCountry !== 'India'
          ? destinationCountry
          : initialCountry && initialCountry !== 'India'
          ? initialCountry
          : 'United Arab Emirates (UAE)';
      setDestinationCountry(targetCountry);
      if (COUNTRY_DIALING_CODES[targetCountry]) {
        setPhoneCountryCode(COUNTRY_DIALING_CODES[targetCountry]);
      }
    } else {
      setDestinationCountry('India');
      setPhoneCountryCode('91');
    }
  };

  // Form State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  useEffect(() => {
    if (isOpen) track('rfq_started', { source: 'wholesale_rfq_modal' });
  }, [isOpen]);

  // Sync state when selectedProduct changes (e.g. user clicked RFQ on a specific product page)
  useEffect(() => {
    if (selectedProduct) {
      setProductId(selectedProduct.id);
      const opts = getBulkOrderVolumeOptions(selectedProduct);
      if (opts.length > 0) {
        setRequestedVolume(opts[0].value);
      }
    }
  }, [selectedProduct]);

  // Sync state when initialCountry changes
  useEffect(() => {
    if (initialCountry) {
      setDestinationCountry(initialCountry);
      if (initialCountry !== 'India') {
        setIsExportEnquiry(true);
        setShowOptionalDetails(true);
        const found = EXPORT_COUNTRIES.find((c) => c.name === initialCountry);
        setDeliveryLocation(found ? `${found.majorPort.split('/')[0].trim()} Port (${initialCountry})` : initialCountry);
      }
    }
  }, [initialCountry]);

  if (!isOpen) return null;

  const currentOption = volumeOptions.find((o) => o.value === requestedVolume) || volumeOptions[0];
  const unitLabel = currentOption?.unitLabel || 'Units';

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const nextProd = products.find((p) => p.id === newProductId || p.sku === newProductId);
    const nextOptions = getBulkOrderVolumeOptions(nextProd);
    // Reset volume to the primary tier of the newly selected product
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
      setErrorMsg('Please enter your WhatsApp mobile number.');
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

    // Extract PIN code if present in the deliveryLocation string
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
        isExportEnquiry && incoterm ? `Trade Term: ${incoterm}` : '',
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
        setSubmittedQuote(data.quotation);
        track('rfq_submitted', { source: 'wholesale_rfq_modal', unit: unitLabel });
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = `/rfq-success?quote=${encodeURIComponent(data.quotation.quote_number)}&company=${encodeURIComponent(companyName || contactPerson || '')}&export=${isExportEnquiry ? 'true' : 'false'}`;
          }, 800);
        }
      } else {
        setErrorMsg(data.error || 'Failed to submit quotation request. Please check inputs.');
      }
    } catch {
      setErrorMsg('Network error while submitting RFQ. Please retry or contact us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedQuote ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Wholesale Enquiry Received
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900 mt-2">
                Quotation #{submittedQuote.quote_number}
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Our farm procurement desk is reviewing mandi spot rates and will contact you via WhatsApp with pricing and delivery terms within 90 minutes.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/919008462568?text=Hello%20Sharath,%20I%20have%20submitted%20wholesale%20RFQ%20${submittedQuote.quote_number}%20for%20${submittedQuote.company_name}.%20Please%20expedite.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Connect on WhatsApp Desk
              </a>
              <button
                onClick={onClose}
                type="button"
                className="border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>B2B Commercial Procurement Desk</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Request Wholesale Volume Quotation
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1 leading-relaxed">
                Direct mandi truckloads and tempo lots for oil mills, caterers, food processors, and supermarket chains.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Select Bulk Order Item (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Bulk Order Item <span className="text-amber-600">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                >
                  {sortedProducts.length > 0 ? (
                    sortedProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {getBulkOrderDisplayName(p)}
                      </option>
                    ))
                  ) : (
                    BULK_ORDER_ITEMS.map((item) => (
                      <option key={item.skuMatch} value={item.skuMatch}>
                        {item.simpleName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Field 2: Required Quantity / Volume (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Order Volume / Required Quantity <span className="text-amber-600">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={requestedVolume}
                    onChange={(e) => setRequestedVolume(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                  >
                    {volumeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Inline custom quantity input if "Custom Quantity" is chosen */}
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

              {/* Field 3: Merged Delivery Location (City, State, PIN Code) (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Delivery Location (City, State, PIN Code) <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka 560001 or APMC Mandi, Pune 411037"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                />
              </div>

              {/* Fields 4 & 5: Firm / Company Name & Contact Person (Mandatory) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Firm / Company Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Kaveri Agro Products Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contact Person Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Mr. K. Murthy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                  />
                </div>
              </div>

              {/* Field 6: WhatsApp Mobile Number (Mandatory - Defaults to 91, fully editable) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>WhatsApp Mobile <span className="text-amber-600">*</span></span>
                  <span className="text-[10px] text-stone-500 font-normal">Primary quote communication channel</span>
                </label>
                <div className="flex rounded-xl border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 bg-white shadow-xs transition">
                  <div
                    className="flex items-center bg-stone-100 border-r border-stone-300 px-2.5 shrink-0"
                    title="Country calling code (defaults to 91, click to edit)"
                  >
                    <span className="text-stone-500 font-mono text-xs sm:text-sm font-bold mr-0.5 select-none">+</span>
                    <input
                      type="text"
                      value={phoneCountryCode}
                      onChange={(e) => setPhoneCountryCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="91"
                      maxLength={5}
                      title="Country calling code (editable, defaults to 91)"
                      aria-label="Country calling code"
                      className="w-9 sm:w-11 bg-transparent text-xs sm:text-sm font-mono font-bold text-stone-900 focus:outline-hidden text-center"
                    />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9\s-]/g, ''))}
                    placeholder="9845012345"
                    aria-label="WhatsApp Mobile Number"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold text-stone-900 focus:outline-hidden bg-white"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Country code defaults to <strong>+91</strong> (India). Click prefix to edit for international numbers (+971, +1, +84, etc.).
                </p>
              </div>

              {/* Expandable Optional Section */}
              <div className="pt-1">
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
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
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
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
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
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                      />
                    </div>

                    {/* Export Enquiry Checkbox */}
                    <div className="pt-1 border-t border-stone-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                        <input
                          type="checkbox"
                          checked={isExportEnquiry}
                          onChange={(e) => handleToggleExportEnquiry(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                        />
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-stone-500" />
                          <span>This is an International / Export Container Enquiry (FOB / CIF)</span>
                        </span>
                      </label>

                      {isExportEnquiry && (
                        <div className="space-y-2.5 mt-2.5">
                          <div>
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
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                            >
                              {EXPORT_COUNTRIES.map((c) => (
                                <option key={c.code} value={c.name}>
                                  {c.flag} {c.name} — {c.majorPort}
                                </option>
                              ))}
                              <option value="Other International">🌐 Other International Destination Port</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1">
                              Preferred Incoterm / Pricing Basis
                            </label>
                            <select
                              value={incoterm}
                              onChange={(e) => setIncoterm(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900"
                            >
                              <option value="FOB (Free On Board - Nhava Sheva / JNPT)">FOB — Free On Board (Nhava Sheva / JNPT Mumbai or Chennai)</option>
                              <option value="CIF (Cost, Insurance & Freight - Discharge Port)">CIF — Cost, Insurance &amp; Freight (Discharge Seaport)</option>
                              <option value="CFR (Cost & Freight)">CFR — Cost &amp; Freight</option>
                              <option value="EXW (Ex-Works / Farm Gate Kikkeri)">EXW — Ex-Works (Direct Farm-Gate Kikkeri / Tiptur)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Turnstile Security Check */}
              <div className="pt-1">
                <TurnstileChallenge onToken={setTurnstileToken} />
              </div>

              {/* Orange CTA Button & Trust Microcopy */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-950/20 transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Submitting Quotation…' : 'Submit Wholesale RFQ →'}</span>
                </button>

                <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 font-medium">
                  <span className="text-emerald-700 font-bold">✓ GST-compliant e-invoice</span>
                  <span>&bull;</span>
                  <span>Weighbridge slip provided</span>
                  <span>&bull;</span>
                  <span>Spot rate in 90 mins</span>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
