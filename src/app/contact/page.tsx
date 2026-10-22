'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3b6d11] bg-lime-100 border border-lime-300 px-3 py-1 rounded-full">
            Direct Farm-Gate Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Contact &amp; Operations
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            Reach out directly to Sharath Inorahalli for farm-gate lot bookings, bulk consignment quotes, retail customer support, or Mandi rate inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Official Business Coordinates */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-stone-900 border-b pb-3">
              Headquarters &amp; Dispatch Hub
            </h2>

            <div className="space-y-4 text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3b6d11] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Registered Farm Office:</strong>
                  <span>Main Bazaar Road, Kikkeri Village, K.R. Pete Taluk, Mandya District, Karnataka, India - 571423</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#3b6d11] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Direct Telephone / Helpline:</strong>
                  <a href="tel:+919591142548" className="font-mono font-bold text-stone-900 hover:text-emerald-700">
                    +91 95911 42548
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#3b6d11] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Official Electronic Mail:</strong>
                  <a href="mailto:sharathir198@gmail.com" className="font-medium text-emerald-800 hover:underline">
                    sharathir198@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#3b6d11] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Desk Working Hours:</strong>
                  <span>Monday &ndash; Saturday: 8:00 AM &ndash; 7:30 PM IST</span>
                  <p className="text-xs text-stone-500 mt-0.5">Sunday: Reserved for Mandi harvest allocations</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919591142548?text=Hello%20Sharath,%20I%20have%20an%20inquiry%20regarding%20agricultural%20commodities."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#3b6d11] hover:bg-[#2e590c] text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp Directly</span>
              </a>
            </div>
          </div>

          {/* Card 2: Regulatory & Transparency Credentials */}
          <div className="bg-stone-100/70 p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-stone-900 border-b border-stone-200 pb-3">
                Regulatory &amp; Compliance Data
              </h2>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block">APMC Mandi Registration:</span>
                  <span>Registered trader &amp; producer under the Karnataka Agricultural Produce Marketing (Regulation and Development) Act.</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block">Goods &amp; Services Tax (GST):</span>
                  <span>Nil-rated fresh agricultural produce (0% GST on mature coconuts, unbranded ragi, fresh ginger). Standard statutory GST applied to Copra (5%), Groundnut Oil (5%), and Cow Ghee (12%).</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block">Food Safety &amp; Standards:</span>
                  <span>Traditional wooden bilona churning, wood-pressed cold extraction, zero sulphur bleaching on ball copra.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200 text-center text-xs">
              <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-stone-900">100% Spoilage Policy</span>
                <span className="text-[10px] text-stone-500">Free replacement</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-stone-900">Shiprocket Pan-India</span>
                <span className="text-[10px] text-stone-500">Free &gt; ₹2,999</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
