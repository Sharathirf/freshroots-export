'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sprout, Phone, Mail, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import PushNotificationOptIn from '@/components/PushNotificationOptIn';
import { EXPORT_COUNTRIES, getCountrySlug } from '@/lib/export-countries';

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#111c08] text-stone-300 text-xs border-t border-[#1c3809] pt-14 pb-24 md:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Newsletter / Community Band (Katyayani Newsletter standard) */}
        <div className="bg-[#1c3809] border border-emerald-900/80 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 text-lime-400 font-extrabold uppercase tracking-wider text-[10px]">
              <Sprout className="w-4 h-4" />
              <span>Farm Market Insights & Mandi Broadcast</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Join 50,000+ Farmers & Procurement Heads
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm font-normal">
              Receive weekly Tiptur mandi price reports, copra moisture advisories, and early notifications on fresh harvests.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-xs">Subscribed to Mandi Broadcast!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email or WhatsApp number"
                  className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400 flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="bg-[#3b6d11] hover:bg-[#4a8a18] active:bg-[#2d5a0b] text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <PushNotificationOptIn />
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-4">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b6d11] to-[#1c3809] flex items-center justify-center text-white shadow-md">
                <Sprout className="w-5 h-5 text-lime-300" />
              </div>
              <div>
                <span className="font-black text-xl text-white tracking-tight">FreshRoots</span>
                <span className="font-extrabold text-xl text-lime-400 tracking-tight"> Export</span>
              </div>
            </Link>

            <p className="text-stone-400 leading-relaxed max-w-sm">
              India&apos;s premier digital agricultural platform connecting coconut producers and spice farmers in Karnataka directly with household consumers, oil expellers, and global export buyers.
            </p>

            <div className="space-y-1.5 text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                <span>Karnataka, India • 100% Free Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-lime-400 shrink-0" />
                <a href="https://wa.me/919008462568" target="_blank" rel="noopener noreferrer" className="hover:text-lime-300 transition">
                  Desk & WhatsApp: +91 90084 62568
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-lime-400 shrink-0" />
                <a href="mailto:sales@freshrootsexport.com" className="hover:text-lime-300 transition">
                  sales@freshrootsexport.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Commodity Hubs
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><Link href="/category/mature-coconut" className="hover:text-white transition">Fresh Coconuts (Mandya)</Link></li>
              <li><Link href="/category/copra" className="hover:text-white transition">GI Tiptur Ball Copra</Link></li>
              <li><Link href="/category/oil-and-extracts" className="hover:text-white transition">Wood-Pressed Oils &amp; Ghee</Link></li>
              <li><Link href="/category/spices" className="hover:text-white transition">Unpolished Ragi &amp; Spices</Link></li>
              <li><Link href="/category/nursery-plants" className="hover:text-white transition">Coconut &amp; Arecanut Saplings</Link></li>
              <li><Link href="/category/coir-commodities" className="hover:text-white transition">Industrial Coconut Shells</Link></li>
              <li><Link href="/category/arecanut" className="hover:text-white transition">Shivamogga Arecanut (Adike)</Link></li>
            </ul>
          </div>

          {/* Column 2: Commercial & Wholesale */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              B2B &amp; Sourcing
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><Link href="/export" className="text-lime-300 font-semibold hover:text-white transition">Global Agri-Export Desk</Link></li>
              <li><Link href="/export/ball-copra-india" className="text-lime-300 font-semibold hover:text-white transition">Tiptur Ball Copra Export (FCL)</Link></li>
              <li><Link href="/wholesale/mandi-rates" className="text-lime-300 font-semibold hover:text-white transition">Live Mandi Rates Hub</Link></li>
              <li><Link href="/rfq" className="text-amber-300 font-semibold hover:text-white transition">Request Wholesale RFQ</Link></li>
              <li><Link href="/guides" className="hover:text-white transition">Guides &amp; Quality Standards</Link></li>
              <li><Link href="/transportation" className="hover:text-white transition">Pan-India Freight Logistics</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Farm-Gate Desk</Link></li>
              <li><Link href="/#catalog" className="hover:text-white transition">Direct Farm Catalog</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition">Track Consignment</Link></li>
            </ul>
          </div>

          {/* Column 3: Trust & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Legal &amp; Policies
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><Link href="/refund-policy" className="hover:text-lime-300 transition text-stone-300">100% Spoilage Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-lime-300 transition text-stone-300">Shipping &amp; Delivery Terms</Link></li>
              <li><Link href="/transportation" className="hover:text-lime-300 transition text-stone-300 font-semibold">Transportation &amp; Freight Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-lime-300 transition text-stone-300">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-lime-300 transition text-stone-300">Terms &amp; Conditions</Link></li>
              <li><Link href="/contact" className="hover:text-lime-300 transition text-stone-300">Contact &amp; Operations</Link></li>
              <li><span className="text-stone-400">✓ Certified Weighbridges</span></li>
            </ul>
          </div>
        </div>

        {/* Global Export Destinations Band */}
        <div className="py-4 border-t border-stone-800/80 text-[11px] text-stone-400">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="font-bold uppercase tracking-wider text-lime-400 text-[10px]">
              🌐 Active Global Export Markets (20ft &amp; 40ft FCL):
            </span>
            <span className="text-stone-400 text-[10px]">
              Full Phytosanitary &amp; Certificate of Origin via JNPT, Chennai &amp; Mangalore Ports
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-stone-300 font-medium">
            {EXPORT_COUNTRIES.map((country, idx) => (
              <React.Fragment key={country.code}>
                {idx > 0 && <span className="text-stone-600" aria-hidden="true">•</span>}
                <Link
                  href={`/export/corridors/${getCountrySlug(country.name)}`}
                  className="hover:text-lime-300 hover:underline transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lime-400 rounded-sm"
                  title={`Request 20ft/40ft export quotation for ${country.name} (${country.majorPort})`}
                >
                  <span role="img" aria-label={country.name}>{country.flag}</span>
                  <span>{country.name}</span>
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Statutory Compliance: FSSAI, APEDA, IEC & Legal Metrology */}
        <div className="py-4 border-t border-stone-800/80 text-[11px] text-stone-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-lime-950 text-lime-300 font-mono font-bold border border-lime-800 text-[11px] flex items-center gap-1.5">
              <span className="text-white font-extrabold tracking-wide">fssai</span>
              <span>Lic. No. 21224195000438</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-300 font-mono font-bold border border-stone-700 text-[10px] flex items-center gap-1">
              <span>DGFT IEC:</span>
              <span className="text-lime-300">0724018925</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-300 font-mono font-bold border border-stone-700 text-[10px] flex items-center gap-1">
              <span>APEDA:</span>
              <span className="text-emerald-300">RCMC-AGR-2026</span>
            </span>
            <span className="text-stone-300 text-[11px]">
              Govt Certified • Full Legal Compliance for <strong>Pure Cow Ghee, Cold-Pressed Oils, Ball Copra &amp; Ragi Millets</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>GSTIN: <strong className="text-stone-300 font-mono">29AAKPI7841N1ZX</strong></span>
            <span>•</span>
            <span>Karnataka Farm-Gate Producer Hub</span>
            <span>•</span>
            <span>100% Transit Spoilage Guarantee</span>
          </div>
        </div>

        {/* Bottom Bar: Payment Methods, Legal & Statutory Compliance */}
        <div className="pt-6 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} FreshRoots Export. All rights reserved.</span>
            <Link href="/privacy" className="hover:underline text-stone-400">Privacy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:underline text-stone-400">Terms</Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:underline text-stone-400">Refunds</Link>
            <span>&bull;</span>
            <Link href="/shipping-policy" className="hover:underline text-stone-400">Shipping</Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:underline text-stone-400">Contact</Link>
          </div>

          {/* Payment Badges (100% Prepaid Secure) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-stone-400 text-xs">
            <span className="font-bold text-stone-300">100% Secure Prepaid:</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">UPI</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">GPay</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">PhonePe</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">Cards</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
