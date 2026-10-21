'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { Building2, CheckCircle2, ShieldCheck, Clock, ArrowRight, Phone } from 'lucide-react';

interface BulkInquiryFormProps {
  product: Product;
  onSuccess?: () => void;
}

export default function BulkInquiryForm({ product, onSuccess }: BulkInquiryFormProps) {
  // Required fields
  const [customerName, setCustomerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('500');
  const [unit, setUnit] = useState(
    product.category === 'mature_coconut'
      ? 'Nuts'
      : product.category === 'copra' || product.category === 'spices'
      ? 'kg'
      : product.unit_of_measure.split(' ')[0] || 'Units'
  );

  // Optional fields
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);

  // Available units based on product
  const getUnitOptions = () => {
    if (product.category === 'mature_coconut') {
      return [
        { value: 'Nuts', label: 'Nuts / Individual Pieces' },
        { value: 'Bags (50 nuts each)', label: 'Bags of 50 Nuts' },
        { value: 'Metric Tonnes', label: 'Metric Tonnes (~2,000 nuts/MT)' }
      ];
    }
    if (product.category === 'copra') {
      return [
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'Boxes (25kg)', label: '25kg Master Boxes' },
        { value: 'Gunny Sacks (50kg)', label: '50kg Gunny Sacks' },
        { value: 'Quintals', label: 'Metric Quintals (100 kg)' },
        { value: 'Metric Tonnes', label: 'Metric Tonnes (1,000 kg)' }
      ];
    }
    if (product.category === 'spices') {
      return [
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'Quintals', label: 'Quintals (100 kg)' },
        { value: 'Metric Tonnes', label: 'Metric Tonnes (1,000 kg)' }
      ];
    }
    if (product.category === 'oil_and_extracts') {
      return [
        { value: 'Litres', label: 'Litres (L)' },
        { value: '5L Tins', label: '5-Litre Food Tins' },
        { value: 'Barrels (200L)', label: 'Commercial Barrels (200L)' }
      ];
    }
    return [
      { value: 'Units', label: 'Units' },
      { value: 'Bags / Boxes', label: 'Bags / Boxes' },
      { value: 'Metric Tonnes', label: 'Metric Tonnes' }
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate mandatory fields
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!contactPhone.trim() && !contactEmail.trim()) {
      setErrorMsg('Please provide at least one contact method: a phone number or an email address.');
      return;
    }

    const qty = parseInt(requestedQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid requested quantity greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          company_name: companyName,
          gstin: gstin,
          product_id: product.id,
          product_title: product.title,
          requested_quantity: qty,
          unit: unit,
          destination_city: destinationCity,
          delivery_address: deliveryAddress,
          preferred_delivery_date: preferredDate,
          additional_requirements: additionalNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedQuote(data.quotation);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(data.error || 'Failed to submit quote inquiry. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Your entered data has been preserved. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedQuote) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Inquiry Registered
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-2">
            Quote Request #{submittedQuote.quote_number}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
            Thank you, <strong>{submittedQuote.contact_person}</strong>. Our commercial procurement team will review today&apos;s Mandi benchmark and dispatch an official quotation.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-stone-500">Requested Commodity:</span>
            <span className="font-bold text-stone-900">{submittedQuote.product_title}</span>
          </div>
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-stone-500">Required Quantity:</span>
            <span className="font-semibold text-stone-800">{submittedQuote.requested_quantity} {submittedQuote.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Response Turnaround:</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Within 90 Minutes
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <a
            href={`https://wa.me/919591142548?text=Hello%20Sharath,%20I%20have%20submitted%20bulk%20inquiry%20${submittedQuote.quote_number}%20for%20${encodeURIComponent(product.title)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Connect on WhatsApp</span>
          </a>
          <button
            onClick={() => setSubmittedQuote(null)}
            className="border border-stone-300 hover:bg-white text-stone-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <Building2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Commercial Wholesale Sourcing:</strong> Wholesale prices are customized based on order volume, freight route, and harvest lot. Request a quote below for volume inquiries.
        </div>
      </div>

      {/* Required: Name */}
      <div>
        <label className="block text-xs font-bold text-stone-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Ramesh Kumar"
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
        />
      </div>

      {/* Required Contact Method: Phone OR Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Mobile Number (WhatsApp) <span className="text-stone-400 font-normal text-[11px]">(Phone or Email required *)</span>
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="e.g. 9845012345"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Business Email <span className="text-stone-400 font-normal text-[11px]">(Phone or Email required *)</span>
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="e.g. buyer@company.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Required: Quantity & Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Required Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={requestedQuantity}
            onChange={(e) => setRequestedQuantity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Unit of Measurement <span className="text-red-500">*</span>
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            {getUnitOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional Business Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Company / Business Name <span className="text-stone-400 text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Sri Krishna Oil Expellers"
            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            GSTIN <span className="text-stone-400 text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            maxLength={15}
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="29AAAAA0000A1Z5"
            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Optional Delivery & Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Delivery City / Destination <span className="text-stone-400 text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value)}
            placeholder="e.g. Bengaluru, Salem, JNPT Export Port"
            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Preferred Delivery Date <span className="text-stone-400 text-[11px]">(Optional)</span>
          </label>
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Optional Full Delivery Address */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">
          Complete Delivery Address / Warehouse Location <span className="text-stone-400 text-[11px]">(Optional)</span>
        </label>
        <input
          type="text"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="e.g. Plot 42, Industrial Growth Center, Peenya, Bengaluru 560058"
          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
        />
      </div>

      {/* Optional Requirements / Notes */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">
          Additional Requirements / Quality Tolerances <span className="text-stone-400 text-[11px]">(Optional)</span>
        </label>
        <textarea
          rows={2}
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="e.g. Need truck with hydraulic lift, specific moisture tolerance, or export phytosanitary documentation"
          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2 group"
        >
          {isSubmitting ? (
            <span>Transmitting Bulk Inquiry...</span>
          ) : (
            <>
              <span>Request a Bulk Quote</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-stone-500 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Direct APMC source • Private quotation without public price exposure</span>
      </div>
    </form>
  );
}
