import React from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import type { D2CTab } from './Navbar';

interface FooterProps {
  selectedCity: string;
  activeCleanWindow: string;
  isLiveReading: boolean;
  onNavigateTab: (tab: D2CTab) => void;
  onOpenShare: () => void;
}

const FOOTER_NAV_LINKS: ReadonlyArray<{ tab: D2CTab; label: string }> = [
  { tab: 'overview', label: 'Overview' },
  { tab: 'routines', label: 'Routines' },
  { tab: 'hacks', label: 'Indoor Hacks' },
  { tab: 'radar', label: 'Air Forecast' },
  { tab: 'copilot', label: 'AI Assistant' },
];

export const Footer: React.FC<FooterProps> = ({
  selectedCity,
  activeCleanWindow,
  isLiveReading,
  onNavigateTab,
  onOpenShare,
}) => {
  return (
    <footer className="w-full bg-[#f6f9fc] border-t-2 border-[#533afd]/20 pt-16 text-[#64748d] text-xs">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12 pb-14">
        {/* Prominent Footer Hero Call-to-Action (CTA) Entity */}
        <div className="w-full rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#0d253d] via-[#1a123f] to-[#533afd] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-[11px] font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#533afd] ring-2 ring-white/60 animate-pulse" />
              <span>ZeroBon Community Clean Air Initiative</span>
            </div>
            <h3 className="font-heading-lg text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to protect your home and neighborhood?
            </h3>
            <p className="font-body-md text-sm text-white/80 leading-relaxed">
              Join thousands of families shifting routines into clean air windows, building $35 DIY cleansers, and sharing verifiable breath receipts. Make clean air accessible to all.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('routines')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#0d253d] text-xs font-bold hover:bg-white/90 transition-all shadow-md focus:ring-2 focus:ring-white"
            >
              <span>Adopt First Routine</span>
              <ArrowRight className="w-4 h-4 text-[#533afd]" />
            </button>

            <button
              onClick={onOpenShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm focus:ring-2 focus:ring-white"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Clean Air Impact</span>
            </button>
          </div>

          {/* Subtle background glow effect */}
          <div
            aria-hidden="true"
            className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#533afd]/30 blur-3xl pointer-events-none"
          />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#e3e8ee]">
          {/* Brand Logo & Mission */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#0d253d] font-bold text-xl tracking-tight">ZeroBon</span>
            </div>
            <p className="font-body-md text-xs text-[#475569] max-w-md leading-relaxed">
              Empowering households, schools, and communities with physics-verified winter smog routines, DIY air cleansers, and live atmospheric guidance.
            </p>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex flex-wrap items-center gap-6">
            {FOOTER_NAV_LINKS.map((item) => (
              <button
                key={item.tab}
                onClick={() => onNavigateTab(item.tab)}
                className="text-[#0d253d] hover:text-[#533afd] font-semibold transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Impact</span>
            </button>
          </div>
        </div>

        {/* Lower Footer: Microclimate City Status & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-[11px] text-[#64748d]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#533afd] animate-pulse" />
            <span>Active City Microclimate:</span>
            <span className="font-semibold text-[#0d253d]">{selectedCity}</span>
            <span className="text-[#a8c3de]">•</span>
            <span>Clean Window: {activeCleanWindow}</span>
            {isLiveReading && (
              <>
                <span className="text-[#a8c3de]">•</span>
                <span className="text-[#533afd] font-medium">Real-time Station Active</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span>Physics Mass-Balance Engine</span>
            <span className="text-[#e3e8ee]">•</span>
            <span>Zero-Hallucination Health Ledger</span>
          </div>
        </div>
      </div>

      {/* Seamless Ambient Mesh Gradient Mirroring Top Header */}
      <div className="relative w-full h-16 sm:h-20 overflow-hidden pointer-events-none select-none">
        <svg
          className="absolute inset-0 w-full h-full opacity-65 mix-blend-multiply"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <g filter="url(#stripe-blur-footer)">
            <path
              d="M-100 20C200 80 480 10 720 70C960 120 1240 30 1540 80V140H-100V20Z"
              fill="url(#footer-grad-1)"
            />
            <path
              d="M-50 40C260 10 540 80 840 30C1140 90 1380 20 1600 60V140H-50V40Z"
              fill="url(#footer-grad-2)"
              opacity="0.8"
            />
          </g>
          <defs>
            <filter id="stripe-blur-footer" x="-100" y="-100" width="1700" height="350" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="35" />
            </filter>
            <linearGradient id="footer-grad-1" x1="-100" y1="20" x2="1540" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#533afd" stopOpacity="0.7" />
              <stop offset="35%" stopColor="#b9b9f9" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#f5e9d4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ea2261" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="footer-grad-2" x1="1600" y1="100" x2="-50" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ea2261" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#f5e9d4" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#b9b9f9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#533afd" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </footer>
  );
};
