'use client';

import React, { useState } from 'react';
import { ChevronDown, Send, CheckCircle2 } from 'lucide-react';
import { BULK_ORDER_ITEMS } from '@/lib/bulk-items';
import TurnstileChallenge, { turnstileEnabled } from '@/components/TurnstileChallenge';
import { track } from '@/lib/analytics';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What is the Minimum Order Quantity (MOQ) for retail vs wholesale orders?',
    answer: 'For retail customers, our MOQ is just 1 bag or carton (e.g. 1 bag of 50 Grade A coconuts or 1 box of 25kg Tiptur ball copra) with Pan-India courier delivery. For wholesale and commercial buyers, bulk lot pricing and customized freight logistics activate starting at 10 bags (~500 nuts) or 1 quintal (100kg copra), all the way up to 25-tonne full truckloads (FTL) and export shipping containers.'
  },
  {
    question: 'How do you test and certify copra moisture and oil content?',
    answer: 'Every incoming batch from Tiptur farmers is tested using digital capacitance moisture meters calibrated to AGMARK standards. We reject lots above 5.8% moisture, ensuring our delivered copra is strictly ≤ 5.5% moisture with ≥ 68% natural oil content. This eliminates internal mold, ensures maximum oil yield for expellers, and extends shelf life to over 6 months.'
  },
  {
    question: 'Are coconuts and agricultural commodities subject to GST?',
    answer: 'Fresh mature coconuts (HSN 080112) and washed horticultural coir pith (HSN 530500) are classified as unprocessed raw agricultural produce and are Nil-rated (0.00% GST) under Indian GST law. Ball Copra (HSN 1203), Milling Copra, Byadgi Chilli (HSN 090421), Malnad Black Pepper (HSN 090411), and Virgin Coconut Oil (HSN 151311) attract 5.00% GST with full Input Tax Credit (ITC) pass-through on GSTIN invoices.'
  },
  {
    question: 'Do you support international container export orders and phytosanitary certificates?',
    answer: 'Yes. We regularly supply 20ft (approx. 10–12 MT) and 40ft (approx. 22–25 MT) ocean shipping containers to Vietnam, Bangladesh, United Arab Emirates (UAE), Nepal, Saudi Arabia, United States (USA), Cambodia, Qatar, Malaysia, Kuwait, Iran, and the United Kingdom (UK) through Chennai, Mangalore, and JNPT Mumbai ports. We provide complete export documentation including Phytosanitary Certificates (PSC), Certificates of Origin (COO), Lab Test Reports, and palletized fumigation packaging.'
  },
  {
    question: 'What is your transit damage and spoilage guarantee?',
    answer: 'We pack all produce in heavy-duty multi-wall breathable bags and 5-ply export corrugated cartons. In the rare event of transit damage or weight discrepancies exceeding natural moisture variation (±1.5%), our 100% replacement or instant credit guarantee covers your shipment upon uploading photo proof within 24 hours of delivery.'
  },
  {
    question: 'How fast are orders packed and dispatched?',
    answer: 'Retail consumer orders are packed and dispatched within 24 to 48 hours via express air and road couriers with real-time SMS/WhatsApp tracking. Commercial bulk orders (truckloads) are loaded directly from the Tiptur yard and weighed on electronic weighbridges, with transit time typically 2 to 4 days across India.'
  }
];

export default function CommercialInquiryFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [customerType, setCustomerType] = useState('Commercial Buyer / Wholesaler');
  const [productTitle, setProductTitle] = useState(BULK_ORDER_ITEMS[0].simpleName);
  const [quantity, setQuantity] = useState('500');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setErrorMsg('Please provide at least one contact method (phone number or email address)');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid requested quantity greater than 0');
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
          customer_name: name,
          contact_phone: phone,
          contact_email: email,
          company_name: `${customerType} Organization`,
          product_title: productTitle,
          requested_quantity: qty,
          unit: 'Units / kg',
          additional_requirements: message ? `[Customer Type: ${customerType}] ${message}` : `Customer Type: ${customerType}`,
          turnstileToken
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        track('rfq_submitted', { source: 'commercial_faq_form', buyer_type: customerType });
      } else {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again or reach our desk directly at +91 90084 62568 or sales@freshrootsexport.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Commercial Inquiry Form (Katyayani home-form) */}
          <div className="lg:col-span-5 bg-stone-50 border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-emerald-100/70 px-3 py-1 rounded-full">
                Direct Farm Sourcing Desk
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight mt-2.5">
                Get in Touch
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Tell us your volume requirements and our agricultural procurement team will get back to you with custom mandi pricing.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-emerald-900 text-lg">Inquiry Received!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you, <strong>{name}</strong>. Our commercial trade manager is reviewing current mandi spot rates and will contact you via WhatsApp or Email within 2 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#3b6d11] hover:underline pt-2 block mx-auto"
                >
                  Submit another request →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#3b6d11] focus:outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Phone Number (WhatsApp) <span className="text-stone-400 font-normal text-[10px]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9845012345"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#3b6d11] focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Business Email <span className="text-stone-400 font-normal text-[10px]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="buyer@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#3b6d11] focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Who are you? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#3b6d11] focus:outline-none bg-white"
                    >
                      <option value="Commercial Buyer / Wholesaler">Commercial Buyer / Wholesaler</option>
                      <option value="Oil Mill Expeller">Oil Mill Expeller</option>
                      <option value="Retail Store / Kirana">Retail Store / Kirana</option>
                      <option value="Exporter / Trade House">Exporter / Trade House</option>
                      <option value="Temple / Religious Trust">Temple / Religious Trust</option>
                      <option value="Household Consumer">Household Consumer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Bulk Order Item <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#3b6d11] focus:outline-none bg-white font-medium"
                    >
                      {BULK_ORDER_ITEMS.map((item) => (
                        <option key={item.order} value={item.simpleName}>
                          {item.simpleName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Approximate Quantity (Units / Bags / kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold font-mono focus:ring-2 focus:ring-[#3b6d11] focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Message / Delivery City <span className="text-stone-400 font-normal text-[10px]">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Need FTL delivery in Bengaluru or FOB Chennai container freight"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#3b6d11] focus:outline-none bg-white"
                  />
                </div>

                <TurnstileChallenge onToken={setTurnstileToken} />

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3b6d11] hover:bg-[#2d5a0b] disabled:opacity-50 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2 group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  <span>{isSubmitting ? 'Transmitting Request...' : 'Send Commercial Enquiry'}</span>
                </button>

                <p className="text-[11px] text-stone-400 text-center">
                  We usually reply within one business hour • Direct farm rates
                </p>
              </form>
            )}
          </div>

          {/* Right Column: Interactive Accordion FAQs (Katyayani home-faq) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3b6d11] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Frequently Asked Questions
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight mt-2.5">
                Everything You Need to Know
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Transparent answers about Mandi sourcing, lab testing, GST taxation, logistics, and container exports.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-stone-200 rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 bg-white hover:bg-stone-50 flex items-center justify-between gap-4 transition"
                    >
                      <span className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#3b6d11]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 bg-white text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
