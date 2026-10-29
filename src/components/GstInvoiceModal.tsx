'use client';

import React from 'react';
import { X, Printer, ShieldCheck, Sprout } from 'lucide-react';
import { Order } from '@/types';

interface GstInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function GstInvoiceModal({ isOpen, onClose, order }: GstInvoiceModalProps) {
  if (!isOpen || !order) return null;

  const orderDate = order.created_at ? new Date(order.created_at) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const parsedItems = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? JSON.parse(order.items)
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300">
              Official GST Tax Invoice
            </span>
            <span className="text-xs text-stone-500 font-mono">#{order.order_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#3b6d11] hover:bg-[#2d5a0b] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-stone-900 font-sans print:p-8 print:overflow-visible">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3b6d11] text-white flex items-center justify-center font-black text-sm">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-stone-900 tracking-tight">SHARATH INORAHALLI</h1>
                  <p className="text-[11px] text-[#3b6d11] font-extrabold uppercase tracking-wider">Direct Farm-Gate Agricultural Commerce</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 mt-2 max-w-sm leading-relaxed">
                Packaging &amp; Dispatch Facility: Karnataka, India - 571423
              </p>
              <div className="mt-2 text-[11px] text-stone-500 space-y-0.5 font-mono">
                <div>GSTIN: <strong className="text-stone-800">29AAKPI7841N1ZX</strong></div>
                <div>FSSAI Reg. No: <strong className="text-stone-800">21224195000438</strong> (Mandya Division)</div>
                <div>WhatsApp &amp; Support Desk: <strong className="text-stone-800">+91 90084 62568</strong></div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 sm:self-start bg-stone-50 p-3 sm:p-4 rounded-2xl border border-stone-200 shrink-0">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Tax Invoice (Original for Recipient)
              </span>
              <div className="text-xs font-mono pt-1">
                <span className="text-stone-500">Invoice No:</span> <strong className="text-stone-900">{order.order_number}</strong>
              </div>
              <div className="text-xs font-mono">
                <span className="text-stone-500">Date:</span> <strong className="text-stone-900">{formattedDate}</strong>
              </div>
              <div className="text-xs font-mono">
                <span className="text-stone-500">Payment:</span> <strong className="text-emerald-800 uppercase">PAID (Prepaid Online)</strong>
              </div>
              <div className="text-xs font-mono">
                <span className="text-stone-500">Waybill / Courier:</span> <strong className="text-stone-800">{order.tracking_reference || 'Shiprocket Road Express'}</strong>
              </div>
            </div>
          </div>

          {/* Billed To / Shipped To Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Customer Details (Billed To)</span>
              <div className="font-bold text-stone-900 text-sm mt-0.5">{order.customer_name}</div>
              <div className="text-stone-600 font-mono mt-0.5">Phone: +91 {order.customer_phone}</div>
              {order.customer_email && (
                <div className="text-stone-600 mt-0.5">Email: {order.customer_email}</div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Delivery Address (Shipped To)</span>
              <div className="text-stone-800 font-medium mt-0.5 leading-relaxed">{order.shipping_address}</div>
              <div className="text-stone-600 font-mono mt-1 font-bold">
                Destination PIN: {order.destination_pincode} (India)
              </div>
            </div>
          </div>

          {/* Itemized Goods Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/90 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Commodity &amp; Grade</th>
                  <th className="py-2.5 px-3 text-center">HSN</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-center">GST %</th>
                  <th className="py-2.5 px-3 text-right">Net (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {parsedItems.map((item: any, idx: number) => {
                  const qty = Number(item.quantity) || 1;
                  const unitPrice = Number(item.unit_price_inr || item.unitPrice || 0);
                  const totalPrice = Number(item.total_price_inr || item.totalPrice || qty * unitPrice);

                  // HSN and GST lookup
                  let hsn = '080112';
                  let gstRate = 0.0;
                  const skuLower = (item.sku || '').toLowerCase();
                  const titleLower = (item.title || item.name || '').toLowerCase();

                  if (skuLower.includes('cop') || titleLower.includes('copra')) {
                    hsn = '1203';
                    gstRate = 5.0;
                  } else if (skuLower.includes('ghe') || titleLower.includes('ghee')) {
                    hsn = '0405';
                    gstRate = 12.0;
                  } else if (skuLower.includes('oil') || titleLower.includes('oil')) {
                    hsn = '1508';
                    gstRate = 5.0;
                  } else if (skuLower.includes('shl') || titleLower.includes('shell')) {
                    hsn = '140490';
                    gstRate = 5.0;
                  } else if (skuLower.includes('rag') || titleLower.includes('ragi')) {
                    hsn = '100829';
                    gstRate = 0.0;
                  } else if (skuLower.includes('plt') || titleLower.includes('plant')) {
                    hsn = '060290';
                    gstRate = 0.0;
                  }

                  return (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 text-stone-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-stone-900">{item.title || item.name}</div>
                        <div className="text-[10px] text-stone-500">{item.unit_of_measure || item.packSize || 'Standard Pack'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-stone-600">{hsn}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-stone-900 font-mono">{qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-700">₹{unitPrice.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-stone-600">{gstRate.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-stone-900 font-mono">₹{totalPrice.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-stone-500 space-y-1 max-w-sm">
              <div className="font-bold text-stone-700">Declaration:</div>
              <p className="leading-relaxed text-[11px]">
                We declare that this invoice shows the actual price of the agricultural goods described and that all particulars are true and correct. Nil-rated for fresh coconuts and produce under GST notification No. 2/2017-Central Tax (Rate).
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[#3b6d11] font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Doorstep Spoilage Guarantee Registered</span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Produce Subtotal:</span>
                <span className="font-mono font-medium">₹{Number(order.subtotal_inr).toLocaleString('en-IN')}</span>
              </div>
              {order.discount_inr && Number(order.discount_inr) > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-₹{Number(order.discount_inr).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Taxes (GST Included):</span>
                <span className="font-mono">₹{Number(order.tax_inr || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Doorstep Delivery:</span>
                <span className="text-[#3b6d11] font-bold">FREE (₹0.00)</span>
              </div>
              <div className="flex justify-between text-stone-900 font-black text-sm pt-2 border-t border-stone-300">
                <span>Total Amount:</span>
                <span className="font-mono text-[#1c3809] text-base">₹{Number(order.total_amount_inr).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Farm Authorized Signature Footer */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-4">
            <div>
              Generated electronically via FreshRoots Export Digital Commerce Platform. No physical signature required.
            </div>
            <div className="text-right">
              <div className="font-bold text-stone-800">For FreshRoots Export</div>
              <div className="text-[10px] text-stone-500">Authorized Agricultural Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
