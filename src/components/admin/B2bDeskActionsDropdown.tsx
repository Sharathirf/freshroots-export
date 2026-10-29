'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  FileEdit,
  Truck,
  CreditCard,
  UserCheck,
  PauseCircle,
  HelpCircle,
  MessageCircle,
  Mail
} from 'lucide-react';
import { QuotationStatus } from '@/types';

interface B2bDeskActionsDropdownProps {
  rfq: {
    id: string;
    quote_number: string;
    status: QuotationStatus;
    contact_person: string;
    contact_phone?: string;
    contact_email?: string;
    company_name?: string;
    product_title: string;
    requested_quantity: number;
    unit: string;
    proposed_unit_price_inr?: number;
    freight_charges_inr?: number;
    total_quote_inr?: number;
    revision_number?: number;
    operations_owner_name?: string;
  };
  onViewDetails: (rfq: any) => void;
  onTransitionStatus: (id: string, targetStatus: string, reason?: string) => Promise<void>;
  onOpenRejectModal: (rfq: any) => void;
  onOpenReopenModal: (rfq: any) => void;
  onOpenDiscussionModal: (rfq: any) => void;
  onOpenRevisionModal: (rfq: any) => void;
  onOpenHandoverModal: (rfq: any) => void;
  onOpenFulfilmentModal: (rfq: any, tab?: any) => void;
  onOpenPaymentModal: (rfq: any) => void;
}

export default function B2bDeskActionsDropdown({
  rfq,
  onViewDetails,
  onTransitionStatus,
  onOpenRejectModal,
  onOpenReopenModal,
  onOpenDiscussionModal,
  onOpenRevisionModal,
  onOpenHandoverModal,
  onOpenFulfilmentModal,
  onOpenPaymentModal
}: B2bDeskActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const s = rfq.status;

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={dropdownRef}>
      {/* Primary Contextual Action Button */}
      {s === 'submitted' || s === 'new_rfq' ? (
        <button
          onClick={() => onTransitionStatus(rfq.id, 'under_review')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap"
        >
          Start Review
        </button>
      ) : s === 'under_review' ? (
        <button
          onClick={() => onTransitionStatus(rfq.id, 'ready_to_quote')}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap"
        >
          Ready to Quote
        </button>
      ) : s === 'ready_to_quote' || s === 'quotation_draft' ? (
        <button
          onClick={() => onTransitionStatus(rfq.id, 'quote_issued')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap"
        >
          Issue Quotation
        </button>
      ) : s === 'quote_issued' || s === 'revised_quotation_issued' || s === 'discussion_in_progress' ? (
        <button
          onClick={() => onTransitionStatus(rfq.id, 'accepted')}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap"
        >
          Mark Accepted
        </button>
      ) : s === 'accepted' ? (
        <button
          onClick={() => onOpenHandoverModal(rfq)}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap flex items-center gap-1"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Ops Handover</span>
        </button>
      ) : s === 'rejected' || s === 'cancelled' ? (
        <button
          onClick={() => onOpenReopenModal(rfq)}
          className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>Reopen RFQ</span>
        </button>
      ) : (
        <button
          onClick={() => onViewDetails(rfq)}
          className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Ops</span>
        </button>
      )}

      {/* Direct WhatsApp Quick Action Button */}
      {rfq.contact_phone && (
        <a
          href={`https://wa.me/${rfq.contact_phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(rfq.contact_person || 'Buyer')},%20regarding%20your%20FreshRoots%20Export%20quotation%20${rfq.quote_number}%20for%20${encodeURIComponent(rfq.product_title || 'agricultural commodities')}.`}
          target="_blank"
          rel="noopener noreferrer"
          title="Chat directly on WhatsApp"
          className="border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-medium px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1 transition shadow-2xs whitespace-nowrap"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
        </a>
      )}

      {/* Quick View Button */}
      <button
        onClick={() => onViewDetails(rfq)}
        title="Open Full Operational View & Activity Timeline"
        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
        title="More Desk Actions"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-40 text-xs animate-in fade-in max-h-96 overflow-y-auto">
          {/* Section: RFQ Actions */}
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            RFQ & Evaluation
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onViewDetails(rfq);
            }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800 font-semibold"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>View Full Details & Timeline</span>
          </button>

          {s !== 'under_review' && s !== 'rejected' && s !== 'cancelled' && (
            <button
              onClick={() => {
                setIsOpen(false);
                onTransitionStatus(rfq.id, 'under_review');
              }}
              className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Start Review</span>
            </button>
          )}

          {s !== 'needs_information' && s !== 'rejected' && s !== 'cancelled' && (
            <button
              onClick={() => {
                setIsOpen(false);
                onTransitionStatus(rfq.id, 'needs_information');
              }}
              className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Request Information</span>
            </button>
          )}

          {s !== 'on_hold' && s !== 'rejected' && s !== 'cancelled' && (
            <button
              onClick={() => {
                setIsOpen(false);
                onTransitionStatus(rfq.id, 'on_hold');
              }}
              className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
            >
              <PauseCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Put On Hold</span>
            </button>
          )}

          {/* Section: Quotation Actions */}
          <div className="border-t border-stone-100 my-1 px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            Quotation & Negotiation
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenRevisionModal(rfq);
            }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
          >
            <FileEdit className="w-3.5 h-3.5 text-blue-600" />
            <span>Create / Edit Revision</span>
          </button>

          {/* Section: Sales & Communication */}
          <div className="border-t border-stone-100 my-1 px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            Sales & Buyer Contacts
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenDiscussionModal(rfq);
            }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800 font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Discussion</span>
          </button>

          {rfq.contact_phone && (
            <a
              href={`https://wa.me/${rfq.contact_phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(rfq.contact_person || 'Buyer')},%20regarding%20your%20FreshRoots%20Export%20quotation%20${rfq.quote_number}%20for%20${encodeURIComponent(rfq.product_title)}.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Buyer</span>
            </a>
          )}

          {rfq.contact_email && (
            <a
              href={`mailto:${rfq.contact_email}?subject=FreshRoots%20Export%20Quotation%20${rfq.quote_number}&body=Hello%20${encodeURIComponent(rfq.contact_person || 'Buyer')},%0D%0A%0D%0ARegarding%20quotation%20${rfq.quote_number}%20for%20${encodeURIComponent(rfq.product_title)}.`}
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email Buyer</span>
            </a>
          )}

          {/* Section: Operations & Fulfilment */}
          {s === 'accepted' && (
            <>
              <div className="border-t border-stone-100 my-1 px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                Operations & Fulfilment
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenHandoverModal(rfq);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Sales-to-Ops Handover</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFulfilmentModal(rfq, 'procurement');
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
              >
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Procurement / QC / Dispatch</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPaymentModal(rfq);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-800"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Record B2B Payment</span>
              </button>
            </>
          )}

          {/* Governance / Rejection / Reopen */}
          <div className="border-t border-stone-100 my-1 px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            Governance & Closure
          </div>
          {s !== 'rejected' && s !== 'cancelled' ? (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenRejectModal(rfq);
              }}
              className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold"
            >
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Reject RFQ Enquiry</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenReopenModal(rfq);
              }}
              className="w-full text-left px-3.5 py-1.5 hover:bg-amber-50 flex items-center gap-2 text-amber-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Reopen Closed RFQ</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
