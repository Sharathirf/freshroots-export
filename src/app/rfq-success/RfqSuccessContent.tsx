'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  Truck,
} from 'lucide-react';

export default function RfqSuccessContent() {
  const searchParams = useSearchParams();
  const quoteNumber = searchParams.get('quote') || searchParams.get('id') || 'SUBMITTED';
  const company = searchParams.get('company') || 'Procurement Partner';
  const isExport = searchParams.get('export') === 'true';

  const whatsappMessage = encodeURIComponent(
    `Hello Sharath, I have submitted an official quotation request (Quote: ${quoteNumber}) on freshrootsexport.com for ${company}. Please expedite our pricing docket.`
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200 w-full text-center space-y-8">
      {/* Badge & Icon */}
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3.5 py-1 rounded-full inline-block">
            {isExport ? 'International Export RFQ Docket' : 'Commercial Procurement Docket'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight pt-2">
            Quotation Request Registered
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto">
            Thank you. Your inquiry has been routed directly to the Mandi Procurement &amp; Export Desk in Karnataka.
          </p>
        </div>
      </div>

      {/* Quote Details Box */}
      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left text-xs sm:text-sm space-y-3 max-w-lg mx-auto">
        <div className="flex justify-between items-center border-b border-stone-200 pb-2.5">
          <span className="text-stone-500 font-medium">Official Reference:</span>
          <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
            {quoteNumber}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-stone-200 pb-2.5">
          <span className="text-stone-500 font-medium">Assigned Desk:</span>
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-700" />
            Tiptur &amp; Mandya Farm-Gate Siding
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-stone-200 pb-2.5">
          <span className="text-stone-500 font-medium">Response SLA:</span>
          <span className="font-bold text-amber-800 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Within 90 Minutes (Working Hours)
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-500 font-medium">Spot Price Lock:</span>
          <span className="font-bold text-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Guaranteed for 48 Hours
          </span>
        </div>
      </div>

      {/* Next Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-2">
        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-100 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
            <FileCheck2 className="w-4 h-4 text-emerald-700" />
            <span>1. Lot Allocation</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-snug">
            Batch grading, moisture testing &amp; weight confirmation at source warehouse.
          </p>
        </div>

        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-100 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>2. Freight &amp; Logistics</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-snug">
            Dynamic transit calculation for truckload or 20ft/40ft container shipping.
          </p>
        </div>

        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-100 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>3. Formal Quotation</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-snug">
            Proforma invoice with GST, bank details &amp; dispatch schedule issued.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <a
          href={`https://wa.me/919008462568?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-900/10 transition"
        >
          <Phone className="w-4 h-4" />
          <span>Priority Desk via WhatsApp (+91 90084 62568)</span>
        </a>

        <Link
          href="/#catalog"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition"
        >
          <span>Browse Sourcing Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Statutory Footer Badge */}
      <div className="border-t border-stone-100 pt-4 text-[11px] text-stone-400">
        FSSAI Lic. <strong className="text-stone-600 font-mono">21224195000438</strong> • DGFT IEC <strong className="text-stone-600 font-mono">0724018925</strong> • FreshRoots Export Karnataka
      </div>
    </div>
  );
}
