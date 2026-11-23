import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BreathReceipt } from '../types';

interface BreathReceiptModalProps {
  receipt: BreathReceipt;
  onClose: () => void;
}

export const BreathReceiptModal: React.FC<BreathReceiptModalProps> = ({ receipt, onClose }) => {
  useEffect(() => {
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 },
      colors: ['#533afd', '#b9b9f9', '#34d399'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/50 backdrop-blur-sm animate-fadeIn">
      {/* Stripe Financial Confirmation Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-[#e3e8ee] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#64748d] hover:text-[#0d253d] flex items-center justify-center transition-all text-xs"
        >
          ✕
        </button>

        {/* Financial Header */}
        <div className="border-b border-[#e3e8ee] pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#34d399]" />
            <span className="font-micro-cap text-[#64748d]">Verified Environmental Transaction</span>
          </div>
          <h2 className="font-heading-lg text-[#0d253d]">Deterministic Breath Receipt</h2>
          <div className="flex items-center justify-between text-xs text-[#64748d] mt-1 font-tabular">
            <span>Reference: {receipt.receiptId}</span>
            <span>{receipt.timestamp}</span>
          </div>
        </div>

        {/* Primary Inhaled Dose Hero Box */}
        <div className="my-6 text-center py-5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <span className="font-micro-cap text-[#64748d]">Personal Lung Dose Prevented</span>
          <div className="flex items-baseline justify-center gap-2 mt-1">
            <span className="font-tabular text-4xl sm:text-5xl font-light text-[#533afd]">
              {receipt.doseSavedUg}
            </span>
            <span className="font-body-md text-sm text-[#64748d]">µg PM₂.₅</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34d399]/15 text-[#0d253d] font-tabular text-xs font-normal">
            <span>= {receipt.cigaretteEquivalentsSaved} Cigarette Equivalents Saved</span>
          </div>
        </div>

        {/* Tabular Atmospheric & Emissions Ledger */}
        <div className="space-y-3 border-t border-b border-[#e3e8ee] py-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748d] font-light">Household / Tenant</span>
            <span className="text-[#0d253d] font-medium">{receipt.tenantName}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748d] font-light">Routine Action</span>
            <span className="text-[#533afd] font-medium">{receipt.actionTitle}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748d] font-light">Avoided CO₂e Emission</span>
            <span className="font-tabular text-[#0d253d] font-medium">{receipt.co2eAvoidedGrams} g CO₂e</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748d] font-light">Avoided Smog-Forming NOₓ</span>
            <span className="font-tabular text-[#0d253d] font-medium">{receipt.noxAvoidedGrams} g NOₓ</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748d] font-light">Primary Exhaust PM₂.₅</span>
            <span className="font-tabular text-[#0d253d] font-medium">{receipt.primaryPm25AvoidedGrams} g PM₂.₅</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748d] font-light">Community Multiplier</span>
            <span className="font-tabular text-[#34d399] font-medium">{receipt.neighborhoodMultiplier}x Impact</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <span className="font-caption text-[#64748d]">IPCC/EPA Tier-1 Physics Model</span>
          <button
            onClick={onClose}
            className="button-primary-pill"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
