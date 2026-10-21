'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Building2, ShieldCheck, Clock, CheckCircle2, Phone, ArrowRight } from 'lucide-react';

interface WholesaleRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct?: Product | null;
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

  // 1. Coconuts (Mature / Semi-Husked / Tender)
  if (product.category === 'mature_coconut') {
    return [
      { value: '500', label: '500 Nuts (20 Bags of 25)', unitLabel: 'Nuts' },
      { value: '1000', label: '1,000 Nuts (40 Bags of 25)', unitLabel: 'Nuts' },
      { value: '2500', label: '2,500 Nuts (100 Bags)', unitLabel: 'Nuts' },
      { value: '5000', label: '5,000 Nuts (Canter Load)', unitLabel: 'Nuts' },
      { value: '20000', label: '20,000 Nuts (10 MT Truckload)', unitLabel: 'Nuts' }
    ];
  }

  // 2. GI Ball Copra
  if (product.category === 'copra') {
    return [
      { value: '150', label: '150 kg (10 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '300', label: '300 kg (20 Boxes of 15kg)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 MT)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT Truckload)', unitLabel: 'kg' }
    ];
  }

  // 3. Nursery Plants (Coconut & Arecanut)
  if (product.sku.includes('NUR')) {
    return [
      { value: '50', label: '50 Plants', unitLabel: 'Plants' },
      { value: '100', label: '100 Plants', unitLabel: 'Plants' },
      { value: '200', label: '200 Plants', unitLabel: 'Plants' },
      { value: '500', label: '500 Plants', unitLabel: 'Plants' },
      { value: '1000', label: '1,000 Plants (Orchard Load)', unitLabel: 'Plants' }
    ];
  }

  // 4. Oils & Ghee
  if (product.category === 'oil_and_extracts') {
    return [
      { value: '25', label: '25 Litres', unitLabel: 'Litres' },
      { value: '50', label: '50 Litres', unitLabel: 'Litres' },
      { value: '100', label: '100 Litres (Commercial Canister)', unitLabel: 'Litres' },
      { value: '500', label: '500 Litres (Barrel Consignment)', unitLabel: 'Litres' }
    ];
  }

  // 5. Coconut Shells
  if (product.sku.includes('SHL')) {
    return [
      { value: '1', label: '1 Metric Tonne (1,000 kg)', unitLabel: 'Tonne' },
      { value: '5', label: '5 Metric Tonnes', unitLabel: 'Tonnes' },
      { value: '10', label: '10 Metric Tonnes (Full Lorry)', unitLabel: 'Tonnes' },
      { value: '25', label: '25 Metric Tonnes (Export Container)', unitLabel: 'Tonnes' }
    ];
  }

  // 6. Ragi & Ginger
  if (product.category === 'spices') {
    return [
      { value: '100', label: '100 kg (2 Gunny Bags)', unitLabel: 'kg' },
      { value: '250', label: '250 kg (5 Gunny Bags)', unitLabel: 'kg' },
      { value: '500', label: '500 kg (10 Gunny Bags)', unitLabel: 'kg' },
      { value: '1000', label: '1,000 kg (1 MT)', unitLabel: 'kg' },
      { value: '5000', label: '5,000 kg (5 MT)', unitLabel: 'kg' }
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
  selectedProduct
}: WholesaleRFQModalProps) {
  const [productId, setProductId] = useState<string>(
    selectedProduct?.id || (products.length > 0 ? products[0].id : '')
  );
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [destinationCity, setDestinationCity] = useState('Bengaluru');
  const [destinationPincode, setDestinationPincode] = useState('560001');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentProd = products.find((p) => p.id === productId) || products[0];
  const volumeOptions = getVolumeOptions(currentProd);
  const [requestedQuantity, setRequestedQuantity] = useState<string>(
    volumeOptions.length > 1 ? volumeOptions[1].value : volumeOptions[0]?.value || '1000'
  );

  // Sync state when selectedProduct changes
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
          requested_quantity: qty,
          unit: currentOption?.unitLabel || 'Units',
          destination_city: destinationCity,
          destination_pincode: destinationPincode,
          notes: notes
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedQuote(data.quotation);
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
                Our Tiptur sourcing desk will review APMC mandi lots, calculate vehicle freight, and issue an official tax invoice quotation within 90 minutes.
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
                href={`https://wa.me/919591142548?text=Hello%20Sharath,%20I%20have%20submitted%20wholesale%20RFQ%20${submittedQuote.quote_number}%20for%20${submittedQuote.company_name}.%20Please%20expedite.`}
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Target Agricultural SKU *</label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Volume & Destination Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Order Volume *</label>
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
                  <label className="block text-xs font-bold text-stone-700 mb-1">Destination City *</label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="e.g. Bengaluru, Salem, Mysuru"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Destination PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={destinationPincode}
                    onChange={(e) => setDestinationPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="560001"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

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
