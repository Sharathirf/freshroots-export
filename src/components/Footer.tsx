'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sprout, Phone, Mail, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

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
              <span>APMC Market Insights & Mandi Broadcast</span>
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
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email or WhatsApp number"
                  className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400 flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#3b6d11] hover:bg-[#4a8a18] active:bg-[#2d5a0b] text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-md"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
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
                <span className="font-black text-xl text-white tracking-tight">SHARATH</span>
                <span className="font-extrabold text-xl text-lime-400 tracking-tight"> INORAHALLI</span>
              </div>
            </Link>

            <p className="text-stone-400 leading-relaxed max-w-sm">
              India&apos;s premier digital agricultural platform connecting coconut producers and spice farmers in Karnataka directly with household consumers, oil expellers, and global export buyers.
            </p>

            <div className="space-y-1.5 text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                <span>Kikkeri, K.R. Pete Taluk, Mandya District, Karnataka, India - 571423</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-lime-400 shrink-0" />
                <a href="https://wa.me/919591142548" target="_blank" rel="noopener noreferrer" className="hover:text-lime-300 transition">
                  Desk & WhatsApp: +91 95911 42548
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-lime-400 shrink-0" />
                <a href="mailto:sharathir198@gmail.com" className="hover:text-lime-300 transition">
                  sharathir198@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Commodities
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><Link href="/#catalog" className="hover:text-white transition">Fresh Coconuts (Grade A/B)</Link></li>
              <li><Link href="/#catalog" className="hover:text-white transition">GI Tiptur Ball Copra</Link></li>
              <li><Link href="/#catalog" className="hover:text-white transition">Industrial Milling Copra</Link></li>
              <li><Link href="/#catalog" className="hover:text-white transition">GI Byadgi Wrinkled Chilli</Link></li>
              <li><Link href="/#catalog" className="hover:text-white transition">Malnad Bold Black Pepper</Link></li>
              <li><Link href="/#catalog" className="hover:text-white transition">Virgin Extra Coconut Oil</Link></li>
              <li><Link href="/#catalog" className="hover:text-white transition">Low-EC Coir Pith Blocks</Link></li>
            </ul>
          </div>

          {/* Column 2: Commercial & Wholesale */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              B2B & Sourcing
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><a href="#catalog" className="hover:text-white transition">Request Wholesale Quotation</a></li>
              <li><a href="#catalog" className="hover:text-white transition">Full Truckload (FTL) Freight</a></li>
              <li><a href="#catalog" className="hover:text-white transition">20ft / 40ft Export Containers</a></li>
              <li><a href="#catalog" className="hover:text-white transition">Phytosanitary Certification</a></li>
              <li><Link href="/admin" className="hover:text-white transition">Operations Dashboard</Link></li>
              <li><a href="#catalog" className="hover:text-white transition">APMC Live Mandi Benchmarks</a></li>
            </ul>
          </div>

          {/* Column 3: Trust & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Trust & Guarantees
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><span className="text-stone-300">✓ Moisture Testing (≤ 5.5%)</span></li>
              <li><span className="text-stone-300">✓ 100% Spoilage Guarantee</span></li>
              <li><span className="text-stone-300">✓ Direct APMC Weighbridges</span></li>
              <li><span className="text-stone-300">✓ Nil-Rated GST Coconuts</span></li>
              <li><span className="text-stone-300">✓ Pan-India Coverage</span></li>
              <li><span className="text-stone-300">✓ Secure UPI & NetBanking</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment Methods, Legal & APMC Compliance */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Sharath Inorahalli Agri-Commerce Platform. All rights reserved. Registered under Karnataka APMC Act.
          </div>

          {/* Payment Badges (Katyayani Payment Badges) */}
          <div className="flex items-center gap-3 text-stone-400">
            <span className="font-bold text-stone-300">Secure Payments:</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">UPI</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">Visa</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">NetBanking</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-lime-400 font-mono font-bold text-[10px]">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
