import React, { useState } from 'react';
import { Share2, Check, Copy, X } from 'lucide-react';
import { BreathReceipt } from '../types';

interface SocialShareModalProps {
  receipt: BreathReceipt;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Full rich text message formulated for viral social awareness and D2C impact
  const shareText = `🌬️ ZeroBon Clean Air Impact Report:
Protecting our family & neighborhood during this winter smog crisis!

✅ Action: ${receipt.actionTitle}
🫁 Lung Dose Prevented: ${receipt.doseSavedUg} µg PM2.5 (${receipt.cigaretteEquivalentsSaved} cigarettes equivalent saved)
🌱 Direct Emissions Avoided: ${receipt.co2eAvoidedGrams}g CO₂e | ${receipt.noxAvoidedGrams}g NOx
✨ Community Multiplier: ${receipt.neighborhoodMultiplier}x neighborhood collective impact

Join the clean air movement with ZeroBon: https://zerobon.pages.dev`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-supported clipboard environments
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://zerobon.pages.dev')}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://zerobon.pages.dev')}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Share Modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#475569] hover:text-[#0d253d] flex items-center justify-center transition-all focus:ring-2 focus:ring-[#533afd]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#533afd]/10 flex items-center justify-center text-[#533afd]">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h2 id="share-modal-title" className="font-heading-md text-lg text-[#0d253d]">
              Share Your Clean Air Impact
            </h2>
          </div>
        </div>
        <p className="font-body-md text-xs text-[#475569] mb-5">
          Inspire your family, friends, and community to make high-impact smog swaps. The complete impact summary will be shared.
        </p>

        {/* Formatted Full Text Preview Box */}
        <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-6">
          <label htmlFor="share-text-preview" className="font-micro-cap text-[#475569] block mb-2 font-medium">
            Full Share Content (Ready for Posting)
          </label>
          <textarea
            id="share-text-preview"
            readOnly
            value={shareText}
            rows={7}
            className="w-full bg-white text-xs font-mono text-[#0d253d] p-3 rounded-xl border border-[#e3e8ee] resize-none outline-none focus:ring-1 focus:ring-[#533afd]"
          />
        </div>

        {/* Social Share Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={handleWhatsApp}
            aria-label="Share full text on WhatsApp"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-medium text-xs transition-all border border-[#25D366]/20 focus:ring-2 focus:ring-[#25D366]"
          >
            <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.044-2.02-.497-1.642-.669-2.704-2.348-2.787-2.457-.082-.109-.668-.888-.668-1.696 0-.808.423-1.206.574-1.37.151-.164.33-.205.44-.205.111 0 .221.002.318.006.102.005.239-.039.374.286.14.336.478 1.163.52 1.248.042.085.07.185.013.298-.057.113-.086.183-.17.283-.084.1-.177.222-.253.298-.085.084-.173.176-.075.344.098.168.436.72 1.054 1.27.794.708 1.464.928 1.673 1.012.21.084.333.071.458-.071.125-.143.536-.624.679-.838.143-.213.286-.178.479-.107.193.071 1.223.577 1.433.682.21.105.351.157.403.245.052.089.052.518-.092.923z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleLinkedIn}
            aria-label="Share full text on LinkedIn"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] font-medium text-xs transition-all border border-[#0077B5]/20 focus:ring-2 focus:ring-[#0077B5]"
          >
            <svg className="w-5 h-5 text-[#0077B5] fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            <span>LinkedIn</span>
          </button>

          <button
            onClick={handleFacebook}
            aria-label="Share full text on Facebook"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-medium text-xs transition-all border border-[#1877F2]/20 focus:ring-2 focus:ring-[#1877F2]"
          >
            <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
            </svg>
            <span>Facebook</span>
          </button>

          <button
            onClick={handleCopy}
            aria-label="Copy full impact text to clipboard"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#533afd]/10 hover:bg-[#533afd]/20 text-[#533afd] font-medium text-xs transition-all border border-[#533afd]/20 focus:ring-2 focus:ring-[#533afd]"
          >
            {copied ? <Check className="w-5 h-5 text-[#34d399]" /> : <Copy className="w-5 h-5 text-[#533afd]" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-[#64748d] pt-3 border-t border-[#e3e8ee]">
          <span>Verified ZeroBon Receipt</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
