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

            <p className="text-stone-300 leading-relaxed max-w-sm">
              India&apos;s premier digital agricultural platform connecting coconut producers and spice farmers in Karnataka directly with household consumers, oil expellers, and global export buyers.
            </p>

            <div className="space-y-1.5 text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=FreshRoots+Export+Kikkeri+Karnataka+571423"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lime-300 transition underline-offset-2 hover:underline"
                  title="View FreshRoots Export on Google Maps (opens in a new tab)"
                >
                  Kikkeri, Karnataka 571423 • Verified on Google Maps (5.0 ★)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-lime-400 shrink-0" />
                <a
                  href="https://wa.me/919008462568"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lime-300 transition"
                  title="Contact FreshRoots Desk & WhatsApp (opens in a new tab)"
                  aria-label="Contact FreshRoots Desk & WhatsApp (opens in a new tab)"
                >
                  Desk &amp; WhatsApp: +91 90084 62568
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-lime-400 shrink-0" />
                <a href="mailto:sales@freshrootsexport.com" className="hover:text-lime-300 transition">
                  sales@freshrootsexport.com
                </a>
              </div>
            </div>

            {/* Official Social Media Channels */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="https://www.instagram.com/freshroots_export/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-white/10 hover:border-transparent text-stone-300 hover:text-white transition text-xs font-semibold group shadow-xs"
                title="Follow FreshRoots Export on Instagram (@freshroots_export)"
                aria-label="Follow FreshRoots Export on Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current text-pink-400 group-hover:text-white transition" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.facebook.com/people/Freshrootsexport/61596026285762/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#1877F2] border border-white/10 hover:border-transparent text-stone-300 hover:text-white transition text-xs font-semibold group shadow-xs"
                title="Follow FreshRoots Export on Facebook"
                aria-label="Follow FreshRoots Export on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current text-blue-400 group-hover:text-white transition" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Column 1: Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Commodity Hubs
            </h4>
            <ul className="space-y-2 text-stone-300">
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
            <ul className="space-y-2 text-stone-300">
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
            <ul className="space-y-2 text-stone-300">
              <li><Link href="/refund-policy" className="hover:text-lime-300 transition text-stone-300">100% Spoilage Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-lime-300 transition text-stone-300">Shipping &amp; Delivery Terms</Link></li>
              <li><Link href="/transportation" className="hover:text-lime-300 transition text-stone-300 font-semibold">Transportation &amp; Freight Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-lime-300 transition text-stone-300">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-lime-300 transition text-stone-300">Terms &amp; Conditions</Link></li>
              <li><Link href="/contact" className="hover:text-lime-300 transition text-stone-300">Contact &amp; Operations</Link></li>
              <li><span className="text-stone-300">✓ Certified Weighbridges</span></li>
            </ul>
          </div>
        </div>

        {/* Global Export Destinations Band */}
        <div className="py-4 border-t border-stone-800/80 text-[11px] text-stone-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="font-bold uppercase tracking-wider text-lime-400 text-[10px]">
              🌐 Active Global Export Markets (20ft &amp; 40ft FCL):
            </span>
            <span className="text-stone-300 text-[10px]">
              Full Phytosanitary &amp; Certificate of Origin via JNPT, Chennai &amp; Mangalore Ports
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-stone-200 font-medium">
            {EXPORT_COUNTRIES.map((country, idx) => (
              <React.Fragment key={country.code}>
                {idx > 0 && <span className="text-stone-600 hidden sm:inline" aria-hidden="true">•</span>}
                <Link
                  href={`/export/corridors/${getCountrySlug(country.name)}`}
                  className="hover:text-lime-300 hover:underline transition-colors inline-flex items-center gap-1.5 py-1.5 px-1 min-h-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400 focus-visible:outline-offset-2 rounded-sm"
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
        <div className="py-4 border-t border-stone-800/80 text-[11px] text-stone-300 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-lime-950 text-lime-300 font-mono font-bold border border-lime-800 text-[11px] flex items-center gap-1.5">
              <span className="text-white font-extrabold tracking-wide">fssai</span>
              <span>Lic. No. 21224195000438</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-200 font-mono font-bold border border-stone-700 text-[10px] flex items-center gap-1">
              <span>DGFT IEC:</span>
              <span className="text-lime-300">0724018925</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-200 font-mono font-bold border border-stone-700 text-[10px] flex items-center gap-1">
              <span>APEDA:</span>
              <span className="text-emerald-300">RCMC-AGR-2026</span>
            </span>
            <span className="text-stone-200 text-[11px]">
              Govt Certified • Full Legal Compliance for <strong>Pure Cow Ghee, Cold-Pressed Oils, Ball Copra &amp; Ragi Millets</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-300 text-[11px]">
            <span>GSTIN: <strong className="text-white font-mono">29AAKPI7841N1ZX</strong></span>
            <span>•</span>
            <span>Karnataka Farm-Gate Producer Hub</span>
            <span>•</span>
            <span>100% Transit Spoilage Guarantee</span>
          </div>
        </div>

        {/* Bottom Bar: Payment Methods, Legal & Statutory Compliance */}
        <div className="pt-6 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-300 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} FreshRoots Export. All rights reserved.</span>
            <Link href="/privacy" className="hover:underline text-stone-300 hover:text-white">Privacy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:underline text-stone-300 hover:text-white">Terms</Link>
            <span>&bull;</span>
            <Link href="/refund-policy" className="hover:underline text-stone-300 hover:text-white">Refunds</Link>
            <span>&bull;</span>
            <Link href="/shipping-policy" className="hover:underline text-stone-300 hover:text-white">Shipping</Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:underline text-stone-300 hover:text-white">Contact</Link>
          </div>

          {/* Payment Badges (100% Prepaid Secure) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-stone-300 text-xs">
            <span className="font-bold text-white">100% Secure Prepaid:</span>
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
