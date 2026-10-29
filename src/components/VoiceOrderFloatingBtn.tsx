'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VoiceOrderFloatingBtn() {
  const { lang } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isKannada = lang === 'kn';

  const whatsappMessage = encodeURIComponent(
    isKannada
      ? 'ನಮಸ್ಕಾರ ಶರತ್ ಅವರೇ, ನನಗೆ ಫಾರ್ಮ್ ಉತ್ಪನ್ನಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ಸಹಾಯ ಬೇಕು.'
      : 'Hello Sharath, I would like to place an order for fresh farm produce.'
  );

  return (
    <>
      {/* 1. Sticky Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end max-w-[calc(100vw-1.5rem)]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative bg-[#25D366] hover:bg-[#20bd5a] text-stone-900 font-black text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
          aria-label={isKannada ? 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ' : 'Order on WhatsApp'}
        >
          {/* Pulsing ring animation */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-pulse pointer-events-none" />

          <div className="w-7 h-7 rounded-full bg-white text-[#25D366] flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
          </div>

          <div className="text-left leading-tight pr-1">
            <span className="block text-[11px] sm:text-xs font-black text-stone-900 tracking-tight">
              {isKannada ? 'ವಾಟ್ಸಾಪ್ ಆರ್ಡರ್' : 'WhatsApp Order'}
            </span>
            <span className="block text-[9px] font-bold text-emerald-950/80">
              {isKannada ? 'ಸಂದೇಶ ಕಳುಹಿಸಿ' : 'Chat & Order'}
            </span>
          </div>
        </button>
      </div>

      {/* 2. Interactive WhatsApp Message Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <MessageCircle className="w-7 h-7 text-[#25D366] fill-[#25D366]" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                {isKannada ? 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಸುಲಭ ಆರ್ಡರ್' : 'Order on WhatsApp'}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {isKannada
                  ? 'ನೇರವಾಗಿ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ ಶರತ್ ಅವರೊಂದಿಗೆ ಸುಲಭವಾಗಿ ಆರ್ಡರ್ ಮಾಡಿ.'
                  : 'Send a message on WhatsApp directly to Sharath to place your order or ask questions.'}
              </p>
            </div>

            {/* WhatsApp Message CTA Action */}
            <div className="pt-1">
              <a
                href={`https://wa.me/919008462568?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-stone-900 font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="w-5 h-5 fill-stone-900 text-stone-900 shrink-0" />
                <span>
                  {isKannada ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ' : 'Send WhatsApp Message'}
                </span>
              </a>
            </div>

            {/* Farm trust guarantee note */}
            <div className="text-[10px] text-stone-500 font-medium pt-1">
              {isKannada
                ? '🌾 100% ಉಚಿತ ಮನೆ ಬಾಗಿಲು ಡೆಲಿವರಿ'
                : '🌾 100% Free Doorstep Delivery on All Orders'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
