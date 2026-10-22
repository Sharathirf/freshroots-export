'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { Truck, CheckCircle2, MapPin, Clock } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3b6d11] bg-lime-100 border border-lime-300 px-3 py-1 rounded-full">
            Logistics Guidelines
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-stone-500 text-xs">
            Direct farm-gate dispatch via Shiprocket, VRL Logistics &amp; regional freight networks.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-8 text-sm text-stone-700 leading-relaxed">
          {/* Threshold-Based Free Shipping Banner */}
          <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-emerald-950 text-base">Threshold-Based Free Delivery</h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Enjoy <strong>100% FREE delivery across India for any retail cart value greater than ₹2,999</strong>. Orders equal to or below ₹2,999 are billed at genuine transporter actuals calculated transparently via Shiprocket based on parcel weight and destination PIN code.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <span>1. Dispatch Lead Times</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Fresh Coconuts &amp; Copra:</strong> Harvested, hand-graded, and packed into master cartons within <strong>24 to 48 hours</strong> of order booking.</li>
              <li><strong>Nursery Saplings:</strong> Root-ball moisturized and reinforced in wooden crates for dispatch on Mondays &amp; Tuesdays to avoid weekend transit delays.</li>
              <li><strong>Same-Day Dispatch:</strong> Available for orders booked before 11:00 AM IST on business days.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <span>2. Delivery Timelines by Region</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Bengaluru &amp; South Karnataka (Zone A/B):</span>
                <span className="text-stone-600">1 to 2 business days via express courier / road line haul.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Rest of South India (TN, Kerala, AP, TS):</span>
                <span className="text-stone-600">2 to 3 business days via surface express.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Western &amp; Central India (MH, MP, Gujarat):</span>
                <span className="text-stone-600">3 to 4 business days.</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Northern &amp; Eastern India (Delhi NCR, UP, WB):</span>
                <span className="text-stone-600">4 to 6 business days.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>3. Serviceable PIN Codes &amp; Tracking</span>
            </h2>
            <p>
              We service all valid 6-digit Indian postal PIN codes nationwide through Shiprocket integrated courier partners (Delhivery, Blue Dart, DTDC, Xpressbees, Shadowfax) and regional heavy transport operators (VRL Logistics).
            </p>
            <p>
              Immediately upon courier pickup, an automated WhatsApp and SMS notification with a live tracking link is transmitted to your registered mobile number. You can also monitor real-time shipment status anytime on our dedicated <a href="/track-order" className="font-bold text-emerald-800 underline">Order Tracking Page</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
