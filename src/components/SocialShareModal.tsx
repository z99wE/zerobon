import React, { useState } from 'react';
import { Share2, Check, Copy, X, ExternalLink, Sparkles } from 'lucide-react';
import { BreathReceipt } from '../types';

interface SocialShareModalProps {
  receipt: BreathReceipt;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Full rich text message formulated for viral social awareness and D2C impact
  const shareText = `ZeroBon Clean Air Impact Report:
Protecting our family & neighborhood during this winter smog crisis!

Action: ${receipt.actionTitle}
Lung Dose Prevented: ${receipt.doseSavedUg} µg PM2.5 (${receipt.cigaretteEquivalentsSaved} cigarettes equivalent saved)
Direct Emissions Avoided: ${receipt.co2eAvoidedGrams}g CO₂e | ${receipt.noxAvoidedGrams}g NOx
Community Multiplier: ${receipt.neighborhoodMultiplier}x neighborhood collective impact

Join the clean air movement with ZeroBon: https://zerobon.pages.dev`;

  const copyToClipboard = async (customFeedback?: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setActionFeedback(customFeedback ?? 'Full report text copied to your clipboard!');
      setTimeout(() => {
        setCopied(false);
        setActionFeedback(null);
      }, 4000);
      return true;
    } catch (e) {
      console.warn('Clipboard copy error:', e);
      return false;
    }
  };

  // Universal Web Share API for mobile and modern desktop OS
  const handleNativeShare = async () => {
    await copyToClipboard('Full report copied! Opening share options...');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ZeroBon Clean Air Impact Report',
          text: shareText,
          url: 'https://zerobon.pages.dev',
        });
      } catch (err) {
        // User cancelled or aborted share, ignore
        console.debug('Share cancelled or not supported', err);
      }
    }
  };

  const handleWhatsApp = async () => {
    await copyToClipboard('Full report copied! Opening WhatsApp...');
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterX = async () => {
    await copyToClipboard('Full report copied! Opening X...');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = async () => {
    await copyToClipboard('Full report copied to clipboard! Paste directly into your LinkedIn post.');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://zerobon.pages.dev')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = async () => {
    await copyToClipboard('Full report copied to clipboard! Paste directly into your Facebook update.');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://zerobon.pages.dev')}`;
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
          <div className="w-8 h-8 rounded-full bg-[#533afd] text-white flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h2 id="share-modal-title" className="font-heading-md text-xl text-[#0d253d]">
              Share Your Clean Air Impact
            </h2>
          </div>
        </div>
        <p className="font-body-md text-xs text-[#475569] mb-4">
          Inspire your family, friends, and community. The full verified report is automatically prepared for your post.
        </p>

        {/* Live Feedback Banner */}
        {actionFeedback && (
          <div className="mb-4 p-3 rounded-2xl bg-[#533afd] text-white text-xs flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white" />
              <span>{actionFeedback}</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
          </div>
        )}

        {/* Formatted Full Text Preview Box */}
        <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="share-text-preview" className="text-xs font-semibold text-[#0d253d]">
              Full Share Content
            </label>
            <button
              onClick={() => copyToClipboard('Full report copied to clipboard!')}
              className="text-xs text-[#533afd] font-semibold hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy All'}</span>
            </button>
          </div>
          <textarea
            id="share-text-preview"
            readOnly
            value={shareText}
            rows={7}
            className="w-full bg-white text-xs font-mono text-[#0d253d] p-3 rounded-xl border border-[#e3e8ee] resize-none outline-none focus:ring-2 focus:ring-[#533afd]/20"
          />
        </div>

        {/* Social Share Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <button
            onClick={handleWhatsApp}
            aria-label="Share full text on WhatsApp"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] font-medium text-xs transition-all border border-[#e3e8ee] focus:ring-2 focus:ring-[#533afd]"
          >
            <span className="font-semibold text-[#533afd]">WhatsApp</span>
            <span className="text-[10px] text-[#64748d]">Direct Text</span>
          </button>

          <button
            onClick={handleTwitterX}
            aria-label="Share full text on X"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] font-medium text-xs transition-all border border-[#e3e8ee] focus:ring-2 focus:ring-[#533afd]"
          >
            <span className="font-semibold text-[#533afd]">X (Twitter)</span>
            <span className="text-[10px] text-[#64748d]">Full Tweet</span>
          </button>

          <button
            onClick={handleLinkedIn}
            aria-label="Share on LinkedIn"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] font-medium text-xs transition-all border border-[#e3e8ee] focus:ring-2 focus:ring-[#533afd]"
          >
            <span className="font-semibold text-[#533afd]">LinkedIn</span>
            <span className="text-[10px] text-[#64748d]">Copy & Post</span>
          </button>

          <button
            onClick={handleFacebook}
            aria-label="Share on Facebook"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] font-medium text-xs transition-all border border-[#e3e8ee] focus:ring-2 focus:ring-[#533afd]"
          >
            <span className="font-semibold text-[#533afd]">Facebook</span>
            <span className="text-[10px] text-[#64748d]">Copy & Post</span>
          </button>
        </div>

        {/* Primary Action Button: Native Share / Copy */}
        <div className="flex items-center gap-2">
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
            <button
              onClick={handleNativeShare}
              className="flex-1 py-3 px-4 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm focus:ring-2 focus:ring-[#533afd]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Share via Device Sheet (All Apps)</span>
            </button>
          ) : (
            <button
              onClick={() => copyToClipboard('Full report copied to clipboard!')}
              className="flex-1 py-3 px-4 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm focus:ring-2 focus:ring-[#533afd]"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Full Impact Report'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] text-xs font-medium border border-[#e3e8ee] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
