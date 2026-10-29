'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Building2, ShieldCheck, Clock, CheckCircle2, Phone, ArrowRight, Ship } from 'lucide-react';
import {
  getBulkOrderDisplayName,
  sortProductsByBulkOrder,
  BULK_ORDER_ITEMS
} from '@/lib/bulk-items';
import { EXPORT_COUNTRIES } from '@/lib/export-countries';
import TurnstileChallenge, { turnstileEnabled } from '@/components/TurnstileChallenge';
import { track } from '@/lib/analytics';

interface WholesaleRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct?: Product | null;
  initialCountry?: string;
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
      { value: '5000', label: '5,000 Units', unitLabel: 'Units' }
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
      { value: '10000', label: '10,000 Tender Nuts (Lorry Consignment)', unitLabel: 'Tender Nuts' }
    ];
  }

  // 2. Bulk arecanut commodity
  if (product.category === 'arecanut') {
    return [
      { value: '100', label: '100 kg (1 Quintal)', unitLabel: 'kg' },
      { value: '250', label: '250 kg (2.5 Quintals)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Truckload)', unitLabel: 'kg' }
    ];
  }

  // 3. Arecanut Plants
  if ((sku.includes('ARE') || title.includes('arecanut')) && (sku.includes('PLT') || title.includes('plant') || title.includes('sapling'))) {
    return [
      { value: '100', label: '100 Plants (1–1.5 Ft)', unitLabel: 'Plants' },
      { value: '250', label: '250 Plants (Farm Acre Lot)', unitLabel: 'Plants' },
      { value: '500', label: '500 Plants (Plantation Lot)', unitLabel: 'Plants' },
      { value: '1000', label: '1,000 Plants (Orchard Consignment)', unitLabel: 'Plants' },
      { value: '2500', label: '2,500 Plants (Full Nursery Truck)', unitLabel: 'Plants' }
    ];
  }

  // 4. Coconut Plants
  if (sku.includes('PLT') || title.includes('coconut plant') || title.includes('sapling')) {
    return [
      { value: '50', label: '50 Plants (1 Yr Old, 2 Ft)', unitLabel: 'Plants' },
      { value: '100', label: '100 Plants (Orchard Starter)', unitLabel: 'Plants' },
      { value: '200', label: '200 Plants (Estate Block)', unitLabel: 'Plants' },
      { value: '500', label: '500 Plants (Canter Load)', unitLabel: 'Plants' },
      { value: '1000', label: '1,000 Plants (10-Wheeler Truckload)', unitLabel: 'Plants' }
    ];
  }

  // 5. Ragi Millet
  if (sku.includes('RAG') || title.includes('ragi')) {
    return [
      { value: '100', label: '100 kg (4 Bags of 25kg)', unitLabel: 'kg' },
      { value: '250', label: '250 kg (10 Bags of 25kg)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Truckload)', unitLabel: 'kg' }
    ];
  }

  // 6. Groundnut Oil
  if (sku.includes('GND') || title.includes('groundnut')) {
    return [
      { value: '25', label: '25 Litres (Commercial Cans)', unitLabel: 'Litres' },
      { value: '50', label: '50 Litres (Wholesale Batch)', unitLabel: 'Litres' },
      { value: '100', label: '100 Litres (Food Processing Lot)', unitLabel: 'Litres' },
      { value: '200', label: '200 Litres (Standard Drum / Barrel)', unitLabel: 'Litres' },
      { value: '500', label: '500 Litres (Bulk Tanker Consignment)', unitLabel: 'Litres' }
    ];
  }

  // 7. Cow Ghee
  if (sku.includes('GHE') || title.includes('ghee')) {
    return [
      { value: '15', label: '15 Litres (15x 1L Jars)', unitLabel: 'Litres' },
      { value: '30', label: '30 Litres (Temple / Catering Pack)', unitLabel: 'Litres' },
      { value: '50', label: '50 Litres (50x 1L Jars)', unitLabel: 'Litres' },
      { value: '100', label: '100 Litres (Commercial Wholesale)', unitLabel: 'Litres' },
      { value: '250', label: '250 Litres (Bulk Dairy Lot)', unitLabel: 'Litres' }
    ];
  }

  // 8. Mature Coconuts
  if (sku.includes('MAT') || sku.includes('SEMI') || product.category === 'mature_coconut') {
    return [
      { value: '500', label: '500 Nuts (20 Bags of 25)', unitLabel: 'Nuts' },
      { value: '1000', label: '1,000 Nuts (40 Bags of 25)', unitLabel: 'Nuts' },
      { value: '2500', label: '2,500 Nuts (100 Bags)', unitLabel: 'Nuts' },
      { value: '5000', label: '5,000 Nuts (Canter Load)', unitLabel: 'Nuts' },
      { value: '20000', label: '20,000 Nuts (10 MT Truckload)', unitLabel: 'Nuts' }
    ];
  }

  // 9. Ball Copra
  if (sku.includes('COP') || sku.includes('BAL') || product.category === 'copra') {
    return [
      { value: '150', label: '150 kg (10 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '300', label: '300 kg (20 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 MT)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Truckload)', unitLabel: 'kg' }
    ];
  }

  // 10. Fresh Ginger
  if (sku.includes('GIN') || title.includes('ginger')) {
    return [
      { value: '100', label: '100 kg (2 Gunny Bags of 50kg)', unitLabel: 'kg' },
      { value: '250', label: '250 kg (5 Gunny Bags)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (10 Bags / 5 Quintals)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 MT Mandi Lot)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Full Tempo)', unitLabel: 'kg' }
    ];
  }

  // 11. Coconut Shells
  if (sku.includes('SHL') || title.includes('shell')) {
    return [
      { value: '1', label: '1 Metric Tonne (1,000 kg)', unitLabel: 'Tonne' },
      { value: '5', label: '5 Metric Tonnes', unitLabel: 'Tonnes' },
      { value: '10', label: '10 Metric Tonnes (Full Lorry)', unitLabel: 'Tonnes' },
      { value: '25', label: '25 Metric Tonnes (Export Container)', unitLabel: 'Tonnes' }
    ];
  }

  return [
    { value: '500', label: '500 Units', unitLabel: 'Units' },
    { value: '1000', label: '1,000 Units', unitLabel: 'Units' },
    { value: '5000', label: '5,000 Units', unitLabel: 'Units' }
  ];
}

export default function WholesaleRFQModal({
  isOpen,
  onClose,
  products,
  selectedProduct,
  initialCountry
}: WholesaleRFQModalProps) {
  const sortedProducts = sortProductsByBulkOrder(products);
  const [productId, setProductId] = useState<string>(
    selectedProduct?.id || (sortedProducts.length > 0 ? sortedProducts[0].id : '')
  );
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [destinationCountry, setDestinationCountry] = useState<string>(initialCountry || 'India');
  const [destinationCity, setDestinationCity] = useState(
    initialCountry && initialCountry !== 'India'
      ? (EXPORT_COUNTRIES.find((c) => c.name === initialCountry)?.majorPort.split('/')[0].trim() || 'Direct Discharge Port')
      : 'Bengaluru'
  );
  const [destinationPincode, setDestinationPincode] = useState(
    initialCountry && initialCountry !== 'India' ? 'EXPORT' : '560001'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    if (isOpen) track('rfq_started', { source: 'wholesale_rfq_modal' });
  }, [isOpen]);

  const currentProd = products.find((p) => p.id === productId) || products[0];
  const volumeOptions = getVolumeOptions(currentProd);
  const [requestedQuantity, setRequestedQuantity] = useState<string>(
    volumeOptions.length > 1 ? volumeOptions[1].value : volumeOptions[0]?.value || '1000'
  );

  // Sync state when selectedProduct or initialCountry changes
  useEffect(() => {
    if (selectedProduct) {
      setProductId(selectedProduct.id);
      const opts = getVolumeOptions(selectedProduct);
      if (opts.length > 1) {
        setRequestedQuantity(opts[1].value);
      } else if (opts.length > 0) {
        setRequestedQuantity(opts[0].value);
      }
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (initialCountry) {
      setDestinationCountry(initialCountry);
      if (initialCountry !== 'India') {
        const found = EXPORT_COUNTRIES.find((c) => c.name === initialCountry);
        if (found) {
          setDestinationCity(found.majorPort.split('/')[0].trim());
          setDestinationPincode('EXPORT');
        } else {
          setDestinationCity('Major Discharge Port');
          setDestinationPincode('EXPORT');
        }
      }
    }
  }, [initialCountry]);

  if (!isOpen) return null;

  const currentOption = volumeOptions.find((o) => o.value === requestedQuantity) || volumeOptions[0];
  const qty = parseInt(requestedQuantity, 10) || 0;

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const nextProd = products.find((p) => p.id === newProductId);
    const nextOptions = getVolumeOptions(nextProd);
    // Reset volume to standard tier of the selected product
    if (nextOptions.length > 1) {
      setRequestedQuantity(nextOptions[1].value);
    } else if (nextOptions.length > 0) {
      setRequestedQuantity(nextOptions[0].value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPerson.trim()) {
      setErrorMsg('Please enter your full name or contact person.');
      return;
    }
    if (!contactPhone.trim() && !contactEmail.trim()) {
      setErrorMsg('Please provide at least one contact method (phone number or email).');
      return;
    }
    if (!productId) {
      setErrorMsg('Please select a product.');
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setErrorMsg('Please complete the anti-spam check before submitting.');
      return;
    }

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
          destination_city: destinationCountry === 'India' ? destinationCity : `${destinationCity}, ${destinationCountry}`,
          destination_pincode: destinationCountry === 'India' ? destinationPincode : 'EXPORT',
          notes: destinationCountry === 'India' ? notes : `[EXPORT DESTINATION: ${destinationCountry} | Port: ${destinationCity}] ${notes}`.trim(),
          turnstileToken
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedQuote(data.quotation);
        track('rfq_submitted', { source: 'wholesale_rfq_modal', unit: currentOption?.unitLabel || 'Units' });
      } else {
        setErrorMsg(data.error || 'Failed to submit quotation request.');
      }
    } catch {
      setErrorMsg('Network error while submitting RFQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedQuote ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Official Commercial RFQ Received
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900 mt-2">
                Quotation Request #{submittedQuote.quote_number}
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Our Tiptur sourcing desk will review farm lots, calculate vehicle freight, and issue an official tax invoice quotation within 90 minutes.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-stone-500">Consignment:</span>
                <span className="font-bold text-stone-900">
                  {submittedQuote.requested_quantity} {submittedQuote.unit} of {submittedQuote.product_title}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-stone-500">Destination Hub:</span>
                <span className="font-semibold text-stone-800">{submittedQuote.destination_city || 'Pan-India / Worldwide'} ({submittedQuote.destination_pincode || 'Regional'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Price Lock Guarantee:</span>
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 48 Hours from issuance
                </span>
              </div>
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
                className="border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>B2B Commercial Procurement Desk</span>
              </div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                Request Wholesale Volume Quotation
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                Direct mandi truckloads and tempo lots for oil mills, caterers, food processors, and supermarket chains.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select Bulk Order Item *</label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
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

              {/* Destination Market / Country Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Destination Market / Country *</span>
                  {destinationCountry !== 'India' && (
                    <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Ship className="w-3 h-3 text-emerald-700" /> 20ft / 40ft FCL Container Sea Freight
                    </span>
                  )}
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => {
                    const country = e.target.value;
                    setDestinationCountry(country);
                    if (country !== 'India') {
                      const match = EXPORT_COUNTRIES.find((c) => c.name === country);
                      if (match) {
                        setDestinationCity(match.majorPort.split('/')[0].trim());
                        setDestinationPincode('EXPORT');
                      } else {
                        setDestinationCity('Major Discharge Port');
                        setDestinationPincode('EXPORT');
                      }
                    } else {
                      setDestinationCity('Bengaluru');
                      setDestinationPincode('560001');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="India">🇮🇳 India (Domestic Truckload / Commercial Mandi)</option>
                  <optgroup label="Export Destination Countries (20ft / 40ft Container)">
                    {EXPORT_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name} ({c.region})
                      </option>
                    ))}
                    <option value="Other International">🌐 Other International Destination Port</option>
                  </optgroup>
                </select>
              </div>

              {/* Volume & Destination Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {destinationCountry === 'India' ? 'Order Volume *' : 'Export Volume *'}
                  </label>
                  <select
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {volumeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {destinationCountry === 'India' ? 'Destination City *' : 'Discharge Port / City *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder={destinationCountry === 'India' ? 'e.g. Bengaluru, Salem, Mysuru' : 'e.g. Jebel Ali, Cat Lai, Chittagong'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {destinationCountry === 'India' ? 'Destination PIN *' : 'Postal / Port Code'}
                  </label>
                  <input
                    type="text"
                    required={destinationCountry === 'India'}
                    maxLength={destinationCountry === 'India' ? 6 : 12}
                    value={destinationPincode}
                    onChange={(e) => setDestinationPincode(e.target.value)}
                    placeholder={destinationCountry === 'India' ? '560001' : 'EXPORT'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {destinationCountry !== 'India' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Export Protocol Included:</strong> Phytosanitary Inspection (PSC), Certificate of Origin (COO), and container fumigation certification.
                  </span>
                </div>
              )}

              {/* Company Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Firm / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Kaveri Agro Products Pvt Ltd"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Mr. K. Murthy"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 9845012345"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Business Email (Optional)</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="procurement@firm.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">GSTIN (Optional for quote)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Unloading Notes / Siding</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Canter truck dock available"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>



                <TurnstileChallenge onToken={setTurnstileToken} />

                {errorMsg && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2 flex justify-between items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>GST compliant e-invoice & weighbridge slip provided.</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-amber-900/10 transition flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Submitting RFQ...' : 'Submit Wholesale RFQ'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
