import React from 'react';
import { Check, RotateCw, Info, Share2 } from 'lucide-react';
import { GradientBackground } from '../ui/noisy-gradient-backgrounds';
import type { RoutineSwapItem } from '../../data/routine-swaps';

interface Props {
  swap: RoutineSwapItem;
  isDone: boolean;
  isFlipped: boolean;
  onToggleFlip: (id: string) => void;
  onCommit: (swap: RoutineSwapItem) => void;
  onTriggerShare: () => void;
}

/** A single flip card for a low-emission daily routine and its measured impact. */
export const RoutineCard: React.FC<Props> = ({
  swap, isDone, isFlipped, onToggleFlip, onCommit, onTriggerShare,
}) => {
  const Icon = swap.icon;
  return (
            <div
              key={swap.id}
              tabIndex={0}
              role="region"
              aria-label={`${swap.title}. Press Enter or Space to flip card.`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                  e.preventDefault();
                  onToggleFlip(swap.id);
                }
              }}
              className="relative min-h-[530px] sm:min-h-[510px] rounded-3xl transition-all perspective-1000 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2"
              onClick={(e) => {
                // If user clicks a button inside card, let button handler deal with it
                if ((e.target as HTMLElement).closest('button')) return;
                onToggleFlip(swap.id);
              }}
            >
              <div
                className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE */}
                <div
                  className={`w-full h-full rounded-3xl p-5 sm:p-6 bg-white border flex flex-col justify-between transition-all backface-hidden ${
                    isDone
                      ? 'border-[#533afd] shadow-md ring-1 ring-[#533afd]/30'
                      : 'border-[#e3e8ee] hover:border-[#533afd]/50 hover:shadow-lg shadow-sm'
                  }`}
                >
                  <div>
                    {/* Card Category & Badge & Flip Button */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] flex items-center justify-center text-[#533afd]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#0d253d] block">
                            {swap.category}
                          </span>
                          <span className="text-[11px] text-[#475569]">
                            {swap.lifestyleMatch.join(' • ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDone && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f6f9fc] border border-[#e3e8ee] text-[#533afd] text-xs font-medium">
                            <Check className="w-3.5 h-3.5" />
                            <span>Adopted</span>
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label={`Flip card to see lifestyle tips for ${swap.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFlip(swap.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#533afd] text-[#0d253d] hover:text-white text-xs font-semibold border border-[#e3e8ee] transition-all shadow-sm"
                          title="Click to flip card"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Flip Card</span>
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-heading-md text-base sm:text-lg text-[#0d253d] mb-1">
                      {swap.title}
                    </h3>
                    <p className="font-body-md text-xs text-[#475569] leading-relaxed mb-3">
                      {swap.description}
                    </p>

                    {/* Plain Human Reason Box */}
                    <div className="p-3 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-3 text-xs text-[#273951]">
                      <span className="font-medium text-[#0d253d] block mb-0.5">Why this works:</span>
                      <p className="text-[11px] text-[#475569] leading-relaxed">
                        {swap.humanReason}
                      </p>
                    </div>

                    {/* Impact Metrics Row - Brand Styled */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-[#e3e8ee] mb-3">
                      <div className="text-left">
                        <span className="text-[10px] text-[#475569] block">Dose Protected</span>
                        <span className="font-tabular text-sm font-semibold text-[#533afd]">
                          +{swap.doseSavedUg} µg
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-[#475569] block">Cigarettes Saved</span>
                        <span className="font-tabular text-sm font-semibold text-[#0d253d]">
                          {swap.cigarettesSaved} cigs
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-[#475569] block">Carbon Cut</span>
                        <span className="font-tabular text-sm font-semibold text-[#0d253d]">
                          {swap.co2eAvoidedGrams > 0 ? `${(swap.co2eAvoidedGrams / 1000).toFixed(1)}kg CO₂` : 'Zero Fuel'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      aria-label={`Adopt ${swap.title} routine`}
                      onClick={() => onCommit(swap)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-medium transition-all focus:ring-2 focus:ring-[#533afd] ${
                        isDone
                          ? 'bg-[#f6f9fc] text-[#0d253d] border border-[#e3e8ee] hover:bg-[#e3e8ee]'
                          : 'bg-[#533afd] hover:bg-[#432ec9] text-white shadow-sm'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Update Receipt' : 'Adopt Routine Swap'}</span>
                    </button>

                    {isDone && (
                      <button
                        onClick={onTriggerShare}
                        aria-label={`Share ${swap.title} on Social Media`}
                        className="p-2.5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] border border-[#e3e8ee] transition-all focus:ring-2 focus:ring-[#533afd]"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* BACK FACE (Styled with Noisy Gradient Background - Unclipped) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-[#533afd]/40 shadow-xl backface-hidden rotate-y-180"
                >
                  <GradientBackground
                    className="w-full h-full p-5 sm:p-6 text-white flex flex-col justify-between"
                    gradientType="linear-gradient"
                    gradientOrigin="top-left"
                    noiseIntensity={0.5}
                    noisePatternAlpha={25}
                    noisePatternSize={80}
                    noisePatternRefreshInterval={2}
                  >
                    <div>
                      {/* Back Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-white/15 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#533afd] ring-2 ring-white/60 animate-pulse" />
                          <span className="text-xs font-semibold tracking-wide uppercase text-white/95">
                            Practical Living Wisdom
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label="Flip back to front face"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFlip(swap.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#0d253d] text-xs font-semibold border border-white/30 transition-all backdrop-blur-sm shadow-sm"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Flip Back</span>
                        </button>
                      </div>

                      <h4 className="font-heading-md text-base sm:text-lg text-white font-bold mb-2">
                        {swap.title}
                      </h4>

                      {/* Actionable Non-Technical D2C Insights */}
                      <div className="space-y-2 text-xs leading-relaxed">
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Quick Action:</span>
                          <p className="text-white/80">{swap.d2cTips.quickAction}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Family & Health Benefit:</span>
                          <p className="text-white/80">{swap.d2cTips.familyBenefit}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Smart Pro Tip:</span>
                          <p className="text-white/80">{swap.d2cTips.proTip}</p>
                        </div>
                      </div>
                    </div>

                    {/* Back Bottom Button - Elevated & Never Clipped */}
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                        <Info className="w-3.5 h-3.5 text-white/90" />
                        <span>Actionable daily routine wisdom</span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Adopt ${swap.title} routine`}
                        onClick={() => {
                          onCommit(swap);
                          onToggleFlip(swap.id);
                        }}
                        className="px-4 py-2 rounded-full bg-white text-[#0d253d] font-semibold text-xs hover:bg-white/90 transition-all shadow-sm"
                      >
                        Adopt & Flip
                      </button>
                    </div>
                  </GradientBackground>
                </div>
              </div>
            </div>
  );
};
