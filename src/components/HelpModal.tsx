'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  Truck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HelpModal() {
  const { isHelpOpen, setIsHelpOpen } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!isHelpOpen) return null;

  const faqs = [
    {
      q: 'How long does delivery take?',
      a: 'For Bengaluru and Karnataka addresses, delivery typically takes 24 to 48 hours via surface courier. For interstate shipments, delivery takes 3 to 4 working days.'
    },
    {
      q: 'How does Free Shipping work?',
      a: '100% FREE door delivery is included on ALL orders across India! There is no minimum order value or minimum quantity requirement.'
    },
    {
      q: 'What if items arrive damaged or broken in transit?',
      a: 'We offer a 100% free immediate replacement or full refund guarantee. Simply share a quick photo of the package on WhatsApp (+91 90084 62568) and we dispatch a fresh batch immediately.'
    },
    {
      q: 'How can I quickly reorder past commodities?',
      a: 'Click "Orders" in the navigation bar or mobile footer, find your past shipment, and tap "Reorder This". All items will be added to your cart instantly.'
    },
    {
      q: 'Can I purchase bulk container or lorry truckloads?',
      a: 'Yes. We supply 500 kg to 30 metric tonne truckloads for industrial oil expellers, temples, and exporters with official gate pass documentation. Tap Wholesale RFQ or call our desk.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={() => setIsHelpOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 relative animate-in zoom-in-95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1c3809] text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-300 bg-lime-900/50 px-2.5 py-0.5 rounded-full border border-lime-400/30">
                Direct Farm Desk
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Customer Support &amp; Help
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Talk directly with Sharath and our farm dispatch team.
            </p>
          </div>

          <button
            onClick={() => setIsHelpOpen(false)}
            className="text-emerald-100 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Cards */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 3 Instant Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <a
              href="https://wa.me/919008462568?text=Hi%20Sharath,%20I%20need%20help%20with%20an%20order/inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 p-3.5 rounded-2xl flex flex-col items-center text-center transition group shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-stone-900">WhatsApp Desk</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">+91 90084 62568</div>
              <span className="text-[10px] text-stone-400 mt-1">Instant Response</span>
            </a>

            {/* Direct Call */}
            <a
              href="tel:+919008462568"
              className="bg-lime-50 hover:bg-lime-100/80 border border-lime-200 p-3.5 rounded-2xl flex flex-col items-center text-center transition group shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[#3b6d11] text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-stone-900">Call Farm Direct</div>
              <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">+91 90084 62568</div>
              <span className="text-[10px] text-stone-400 mt-1">7 AM – 9 PM IST</span>
            </a>

            {/* Email */}
            <a
              href="mailto:sales@freshrootsexport.com"
              className="bg-stone-50 hover:bg-stone-100 border border-stone-200 p-3.5 rounded-2xl flex flex-col items-center text-center transition group shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-stone-700 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-stone-900">Email Desk</div>
              <div className="text-[10px] text-stone-600 font-semibold mt-0.5 break-all max-w-[150px] truncate" title="sales@freshrootsexport.com">sales@freshrootsexport.com</div>
              <span className="text-[10px] text-stone-400 mt-1">Official Inquiry</span>
            </a>
          </div>

          {/* Delivery Note */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
            <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <strong>Pan-India Doorstep Delivery:</strong> 100% Free Shipping on all orders across India
            </div>
          </div>

          {/* Quick FAQs Accordion */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Frequently Asked Questions
            </h3>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
              {faqs.map((faq, idx) => (
                <div key={idx} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-3.5 hover:bg-stone-50 transition flex items-center justify-between gap-3 text-xs font-bold text-stone-800"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform ${
                        openFaq === idx ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-3.5 pb-3.5 text-xs text-stone-600 leading-relaxed bg-stone-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between text-xs shrink-0 px-5">
          <span className="text-stone-500 text-[11px]">
            Have an urgent query? WhatsApp us for instant assistance.
          </span>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="text-stone-700 hover:text-stone-900 font-bold px-3 py-1 rounded-lg hover:bg-stone-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
