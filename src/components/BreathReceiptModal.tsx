import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BreathReceipt } from '../types';

interface BreathReceiptModalProps {
  receipt: BreathReceipt;
  onClose: () => void;
}

export const BreathReceiptModal: React.FC<BreathReceiptModalProps> = ({ receipt, onClose }) => {
  useEffect(() => {
    // Subtle Apple-style celebratory particle burst
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#34d399', '#f8fafc'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Apple Card Style Glass Receipt */}
      <div className="relative w-full max-w-md apple-glass-card rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center transition-all text-xs"
        >
          ✕
        </button>

        {/* Apple Card Header Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Deterministic Impact</p>
            <h2 className="text-xl font-semibold text-white tracking-tight mt-0.5">Breath-Cost Receipt</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-mono">{receipt.receiptId}</span>
            <p className="text-[11px] text-neutral-300">{receipt.timestamp}</p>
          </div>
        </div>

        {/* Primary Impact Hero (Cigarette Equivalents Saved) */}
        <div className="my-6 text-center py-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05]">
          <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Personal Lung Dose Avoided</p>
          <div className="flex items-baseline justify-center gap-2 mt-1">
            <span className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-400">
              {receipt.doseSavedUg}
            </span>
            <span className="text-sm font-medium text-neutral-300">µg PM₂.₅</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            <span>= {receipt.cigaretteEquivalentsSaved} Cigarette Equivalents Saved</span>
          </div>
        </div>

        {/* Deterministic Atmospheric & Climate Ledger */}
        <div className="space-y-3 border-t border-b border-white/[0.08] py-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Household / Tenant</span>
            <span className="text-white font-medium">{receipt.tenantName}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Routine Action</span>
            <span className="text-sky-300 font-medium">{receipt.actionTitle}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Avoided CO₂e Emission</span>
            <span className="text-white font-medium">{receipt.co2eAvoidedGrams} g CO₂e</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Avoided Smog-Forming NOₓ</span>
            <span className="text-white font-medium">{receipt.noxAvoidedGrams} g NOₓ</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Primary Exhaust PM₂.₅</span>
            <span className="text-white font-medium">{receipt.primaryPm25AvoidedGrams} g PM₂.₅</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Community Multiplier</span>
            <span className="text-emerald-400 font-medium">{receipt.neighborhoodMultiplier}x Impact Multiplier</span>
          </div>
        </div>

        {/* Footer Note & Verification */}
        <div className="mt-5 flex items-center justify-between text-[11px] text-neutral-400">
          <span>IPCC/EPA Tier-1 Physics Model</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
