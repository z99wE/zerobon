import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Share2, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { BreathReceipt } from '../types';
import { SocialShareModal } from './SocialShareModal';

interface BreathReceiptModalProps {
  receipt: BreathReceipt;
  onClose: () => void;
}

export const BreathReceiptModal: React.FC<BreathReceiptModalProps> = ({ receipt, onClose }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#533afd', '#b9b9f9', '#0d253d'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <>
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="receipt-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/60 backdrop-blur-sm animate-fadeIn"
      >
        {/* Modern D2C Impact Receipt Card */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close Breath Receipt Modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#475569] hover:text-[#0d253d] flex items-center justify-center transition-all text-sm focus:ring-2 focus:ring-[#533afd]"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Environmental Transaction Header */}
          <div className="border-b border-[#e3e8ee] pb-4">
            <h2 id="receipt-title" className="font-heading-lg text-xl sm:text-2xl text-[#0d253d]">
              Deterministic Breath Receipt
            </h2>
            <div className="flex items-center justify-between text-xs text-[#64748d] mt-1.5 font-tabular">
              <span>Ref: {receipt.receiptId}</span>
              <span>{receipt.timestamp}</span>
            </div>
          </div>

          {/* Primary Inhaled Dose Hero Box */}
          <div className="my-5 text-center py-5 px-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs text-[#64748d] block mb-1">
              Personal Lung Dose Prevented
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-tabular text-4xl sm:text-5xl font-semibold text-[#533afd]">
                {receipt.doseSavedUg}
              </span>
              <span className="font-body-md text-sm text-[#475569]">µg PM₂.₅</span>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#e3e8ee] text-[#0d253d] font-tabular text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#533afd]" />
              <span>= {receipt.cigaretteEquivalentsSaved} Cigarette Equivalents Saved</span>
            </div>
          </div>

          {/* Detailed Impact Ledger */}
          <div className="space-y-2.5 border-t border-b border-[#e3e8ee] py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748d]">City / Location</span>
              <span className="text-[#0d253d] font-medium">{receipt.tenantName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748d]">Adopted Action</span>
              <span className="text-[#533afd] font-semibold">{receipt.actionTitle}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748d]">Direct Avoided Emissions</span>
              <span className="font-tabular text-[#0d253d] font-medium">
                {receipt.co2eAvoidedGrams}g CO₂e • {receipt.noxAvoidedGrams}g NOₓ
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748d]">Avoided Exhaust Particulates</span>
              <span className="font-tabular text-[#0d253d] font-medium">
                {receipt.primaryPm25AvoidedGrams}g PM₂.₅
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748d]">Community Impact Multiplier</span>
              <span className="font-tabular text-[#533afd] font-semibold">
                {receipt.neighborhoodMultiplier}x Collective Impact
              </span>
            </div>
          </div>

          {/* Action CTAs: Share Impact (WhatsApp, LinkedIn, Facebook, X) + Done */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748d]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#533afd]" />
              <span>Physics Inhaled Dose Model</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-medium transition-all shadow-sm focus:ring-2 focus:ring-[#533afd]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Impact</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] text-xs font-medium transition-all border border-[#e3e8ee] focus:ring-2 focus:ring-[#533afd]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <SocialShareModal
          receipt={receipt}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};
