'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Award, Printer } from 'lucide-react';

interface CertificateViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'fssai' | 'dgft' | 'apeda' | 'gst';
}

export default function CertificateViewerModal({
  isOpen,
  onClose,
  defaultTab = 'fssai'
}: CertificateViewerModalProps) {
  const [activeTab, setActiveTab] = useState<'fssai' | 'dgft' | 'apeda' | 'gst'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                Statutory Trade Credentials &amp; Verification
              </h3>
              <p className="text-xs text-stone-500">
                Government of India &bull; State of Karnataka Regulatory Authorizations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition"
            aria-label="Close credentials modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'fssai', label: 'FSSAI License', number: '21224195000438' },
            { id: 'dgft', label: 'DGFT Export IEC', number: '0724018925' },
            { id: 'apeda', label: 'APEDA & CDB', number: 'Agro-Export' },
            { id: 'gst', label: 'GST Tax Docket', number: 'Nil-Rated 0%' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex flex-col items-start ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono text-stone-400 font-normal">{tab.number}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'fssai' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    Active &bull; Verified Food Safety License
                  </span>
                  <h4 className="text-xl font-mono font-black text-emerald-950">
                    FSSAI: 21224195000438
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Issuing Authority: Food Safety and Standards Authority of India (FSSAI), Govt. of Karnataka
                  </p>
                </div>
                <div className="text-right sm:border-l sm:pl-4 border-emerald-200">
                  <div className="text-xs font-bold text-stone-700">Category of Business</div>
                  <div className="text-xs font-semibold text-emerald-900">Wholesaler, Repacking &amp; Edible Oils</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">Licensed Entity:</strong>
                  <span>FreshRoots Export Agri-Commerce</span>
                  <span className="block text-stone-500 mt-1">Kikkeri, K.R. Pet Taluk, Mandya – 571423</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">Scope of Produce:</strong>
                  <span>Mature Coconuts, Desiccated Copra, Pure Desi Cow Ghee (Bilona), Wood-Pressed Oils, Ragi Millet Flour.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dgft' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-700" />
                    Authorized Foreign Trade License
                  </span>
                  <h4 className="text-xl font-mono font-black text-blue-950">
                    DGFT IEC: 0724018925
                  </h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Directorate General of Foreign Trade, Ministry of Commerce &amp; Industry, Government of India
                  </p>
                </div>
                <div className="text-right sm:border-l sm:pl-4 border-blue-200">
                  <div className="text-xs font-bold text-stone-700">Trade Jurisdiction</div>
                  <div className="text-xs font-semibold text-blue-900">Global Importer &bull; Exporter</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">Primary Export Sea Ports:</strong>
                  <span>JNPT / Nhava Sheva (Mumbai) &bull; Chennai Port (Tamil Nadu) &bull; Mangalore Port</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">Commercial Shipment Modes:</strong>
                  <span>20ft FCL (15-18 MT) &bull; 40ft High Cube (25-28 MT) &bull; Palletized Air Cargo</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apeda' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
                    <Award className="w-3 h-3 text-amber-700" />
                    Export Board Regulatory Alignment
                  </span>
                  <h4 className="text-lg font-black text-amber-950">
                    APEDA &amp; Coconut Development Board Standards
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Agricultural &amp; Processed Food Products Export Development Authority (APEDA)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-700">
                <strong className="block text-stone-900 text-sm">International Consignment Docket Guarantee:</strong>
                <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                  <li>Phytosanitary Inspection Certificate issued by Plant Quarantine Station (Govt. of India).</li>
                  <li>Fumigation Certificate (Methyl Bromide / Phosphine treatment for ocean transit).</li>
                  <li>Official Chamber of Commerce Certificate of Origin (COO).</li>
                  <li>Lab Analysis Report confirming copra moisture ≤5.5% and free fatty acid (FFA) &lt;1.0%.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-black uppercase tracking-wider">
                  Statutory GST Classification Docket
                </span>
                <h4 className="text-lg font-bold text-stone-900">
                  Indian Goods &amp; Services Tax (GST) Schedule
                </h4>
                <p className="text-xs text-stone-600">
                  FreshRoots Export issues standardized tax invoices compliant with GST council notifications for raw and processed agricultural commodities.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
                  <div>
                    <span className="font-bold text-stone-900 block">Fresh Mature Coconuts &amp; Raw Ginger</span>
                    <span className="text-stone-500">HSN 080112 / HSN 091011 &bull; Direct Farm Produce</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold">
                    0.00% GST (Nil-Rated)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
                  <div>
                    <span className="font-bold text-stone-900 block">Tiptur Ball Copra &amp; Milling Copra</span>
                    <span className="text-stone-500">HSN 1203 &bull; Dried Agricultural Commodity</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-mono font-bold">
                    5.00% GST
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
                  <div>
                    <span className="font-bold text-stone-900 block">Wood-Pressed Oils (Coconut / Groundnut)</span>
                    <span className="text-stone-500">HSN 1513 / HSN 1508 &bull; Edible Vegetable Oils</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 font-mono font-bold">
                    5.00% GST
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Verifiable via FoSCoS &amp; DGFT Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Docket</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
