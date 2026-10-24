'use client';

import React, { useState } from 'react';
import { Mic, Phone, MessageCircle, X, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VoiceOrderFloatingBtn() {
  const { lang } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isKannada = lang === 'kn';

  const playKannadaAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis not supported on this device.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = isKannada
      ? 'ನಮಸ್ಕಾರ! ಶರತ್ ಇನೋರಹಳ್ಳಿ ಫಾರ್ಮ್‌ಗೆ ಸ್ವಾಗತ. ನಿಮಗೆ ಬೇಕಾದ ತೆಂಗಿನಕಾಯಿ, ಕೊಬ್ಬರಿ, ಅಥವಾ ತುಪ್ಪವನ್ನು ವಾಟ್ಸಾಪ್ ಆಡಿಯೋ ಅಥವಾ ಫೋನ್ ಕರೆ ಮೂಲಕ ಸುಲಭವಾಗಿ ಆರ್ಡರ್ ಮಾಡಬಹುದು. ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳಿಗೂ ನೂರಕ್ಕೆ ನೂರು ಉಚಿತ ಡೆಲಿವರಿ ಇದೆ.'
      : 'Welcome to Sharath Inorahalli Farm. You can order fresh coconuts, copra, oil, or ghee easily by sending a WhatsApp voice note or making a direct phone call. 100% Free Doorstep Delivery on all orders.';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = isKannada ? 'kn-IN' : 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const whatsappMessage = encodeURIComponent(
    isKannada
      ? 'ನಮಸ್ಕಾರ ಶರತ್ ಅವರೇ, ನನಗೆ ಫಾರ್ಮ್ ಉತ್ಪನ್ನಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ಸಹಾಯ ಬೇಕು. (ಧ್ವನಿ ಸಂದೇಶ ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡುತ್ತೇನೆ).'
      : 'Hello Sharath, I want to place a farm produce order by WhatsApp voice note / audio call.'
  );

  return (
    <>
      {/* 1. Sticky Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative bg-[#25D366] hover:bg-[#20bd5a] text-stone-900 font-black text-xs sm:text-sm py-2.5 px-3.5 sm:px-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white transition-all transform hover:scale-105 active:scale-95"
          aria-label={isKannada ? 'ಧ್ವನಿ ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ' : 'Voice Order on WhatsApp'}
        >
          {/* Pulsing ring animation */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

          <div className="w-7 h-7 rounded-full bg-white text-[#25D366] flex items-center justify-center shrink-0 shadow-sm">
            <Mic className="w-4 h-4 text-emerald-700 animate-pulse" />
          </div>

          <div className="text-left leading-tight pr-1">
            <span className="block text-[11px] sm:text-xs font-black text-stone-900 tracking-tight">
              {isKannada ? 'ಧ್ವನಿ ಮೂಲಕ ಆರ್ಡರ್' : 'Voice Order'}
            </span>
            <span className="block text-[9px] font-bold text-emerald-950/80">
              {isKannada ? 'ವಾಟ್ಸಾಪ್ / ಕಾಲ್' : 'WhatsApp / Call'}
            </span>
          </div>
        </button>
      </div>

      {/* 2. Interactive Voice & Audio Guidance Modal */}
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
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setIsOpen(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#1c3809] flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Mic className="w-7 h-7 text-[#3b6d11]" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                {isKannada ? 'ಧ್ವನಿ ಮೂಲಕ ಸುಲಭ ಆರ್ಡರ್' : 'Order by Voice Note / Call'}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {isKannada
                  ? 'ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ! ನೇರವಾಗಿ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಆಡಿಯೋ ಕಳುಹಿಸಿ ಅಥವಾ ಫೋನ್ ಮಾಡಿ.'
                  : 'No typing needed! Send a voice note on WhatsApp or talk directly with Sharath.'}
              </p>
            </div>

            {/* Listen in Kannada audio guidance */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-900 block">
                  {isKannada ? 'ಕನ್ನಡದಲ್ಲಿ ಧ್ವನಿ ವಿವರಣೆ ಕೇಳಿ' : 'Listen to Voice Guidance'}
                </span>
                <span className="text-[10px] text-stone-500 block">
                  {isSpeaking ? (isKannada ? 'ಪ್ಲೇ ಆಗುತ್ತಿದೆ...' : 'Speaking...') : (isKannada ? 'ಒಮ್ಮೆ ಟ್ಯಾಪ್ ಮಾಡಿ' : 'Tap to play')}
                </span>
              </div>
              <button
                type="button"
                onClick={playKannadaAudio}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  isSpeaking
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#3b6d11] text-white hover:bg-[#2d5a0b]'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[11px]">{isSpeaking ? 'Stop' : 'Play'}</span>
              </button>
            </div>

            {/* 2 Big Action Buttons */}
            <div className="space-y-2.5">
              {/* WhatsApp Voice Note CTA */}
              <a
                href={`https://wa.me/919591142548?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-stone-900 font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="w-5 h-5 fill-stone-900 text-stone-900 shrink-0" />
                <span>
                  {isKannada ? 'ವಾಟ್ಸಾಪ್ ಧ್ವನಿ ಸಂದೇಶ ಕಳುಹಿಸಿ' : 'Send WhatsApp Voice Note'}
                </span>
              </a>

              {/* Direct Phone Call CTA */}
              <a
                href="tel:+919591142548"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#1c3809] hover:bg-[#2e590c] text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-lime-400 shrink-0" />
                <span>
                  {isKannada ? 'ಶರತ್ ಅವರಿಗೆ ನೇರ ಕರೆ: 9591142548' : 'Call Sharath: +91 95911 42548'}
                </span>
              </a>
            </div>

            {/* Farm trust guarantee note */}
            <div className="text-[10px] text-stone-500 font-medium pt-1">
              {isKannada
                ? '🌾 ಕಿಕ್ಕೇರಿ ಮಂಡ್ಯ ಫಾರ್ಮ್ ಗೇಟ್ • 100% ಉಚಿತ ಮನೆ ಬಾಗಿಲು ಡೆಲಿವರಿ'
                : '🌾 Kikkeri Mandya Farm Hub • 100% Free Doorstep Delivery'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
