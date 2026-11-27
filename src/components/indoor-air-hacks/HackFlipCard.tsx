import React from 'react';
import { RotateCw, Wrench, Zap, Info } from 'lucide-react';
import { GradientBackground } from '../ui/noisy-gradient-backgrounds';
import type { DIYHackDetail } from '../../data/indoor-hacks';

interface Props {
  hack: DIYHackDetail;
  isActive: boolean;
  isFlipped: boolean;
  onToggleFlip: (id: DIYHackDetail['id']) => void;
  onToggleHack: (id: DIYHackDetail['id']) => void;
  onOpenBlueprint: (hack: DIYHackDetail) => void;
  onCreateReceipt: (hack: DIYHackDetail) => void;
}

/** One flip card presenting a DIY indoor-air hack and its plain-language rationale. */
export const HackFlipCard: React.FC<Props> = ({
  hack, isActive, isFlipped, onToggleFlip, onToggleHack, onOpenBlueprint, onCreateReceipt,
}) => (
            <div
              key={hack.id}
              tabIndex={0}
              role="region"
              aria-label={`${hack.title}. Press Enter or Space to flip card.`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                  e.preventDefault();
                  onToggleFlip(hack.id);
                }
              }}
              className="relative min-h-[460px] sm:min-h-[440px] rounded-3xl transition-all perspective-1000 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                onToggleFlip(hack.id);
              }}
            >
              <div
                className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE */}
                <div
                  className={`w-full h-full rounded-3xl p-6 bg-white border flex flex-col justify-between transition-all backface-hidden ${
                    isActive
                      ? 'border-[#533afd] shadow-lg ring-1 ring-[#533afd]/30'
                      : 'border-[#e3e8ee] hover:border-[#533afd]/50 hover:shadow-lg shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top Row: Badge & Flip & Toggle Switch */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold text-[#533afd]">
                        {hack.categoryLabel}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Flip card to view non-technical tips for ${hack.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFlip(hack.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#533afd] text-[#0d253d] hover:text-white text-xs font-semibold border border-[#e3e8ee] transition-all shadow-sm"
                          title="Click to flip card"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Flip Card</span>
                        </button>

                        {/* Accessible Brand Toggle Switch */}
                        <button
                          role="switch"
                          aria-checked={isActive}
                          aria-label={`Toggle ${hack.title}`}
                          onClick={() => onToggleHack(hack.id)}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                            isActive ? 'bg-[#533afd]' : 'bg-[#e3e8ee]'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Title & Performance */}
                    <h3 className="font-heading-md text-lg text-[#0d253d] mb-1">
                      {hack.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 text-xs">
                      <span className="font-semibold text-[#0d253d]">
                        {hack.effectLabel}
                      </span>
                      <span className="text-[#a8c3de]">•</span>
                      <span className="text-[#475569]">{hack.costEst}</span>
                    </div>

                    <p className="font-body-md text-xs text-[#475569] leading-relaxed mb-4">
                      {hack.description}
                    </p>

                    {/* Materials Mini-Pill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {hack.materials.slice(0, 2).map((mat, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#f6f9fc] text-[10px] text-[#475569] border border-[#e3e8ee]"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e3e8ee]">
                    <button
                      type="button"
                      aria-label={`View DIY build blueprint for ${hack.title}`}
                      onClick={() => onOpenBlueprint(hack)}
                      className="flex items-center gap-1.5 text-xs text-[#533afd] font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-[#533afd] rounded"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Build Blueprint</span>
                    </button>

                    <button
                      type="button"
                      aria-label={`Calculate breath receipt for ${hack.title}`}
                      onClick={() => onCreateReceipt(hack)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] text-xs font-medium border border-[#e3e8ee] transition-all"
                    >
                      <Zap className="w-3 h-3 text-[#533afd]" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>

                {/* BACK FACE (Styled with Noisy Gradient Background) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-[#533afd]/40 shadow-xl backface-hidden rotate-y-180"
                >
                  <GradientBackground
                    className="w-full h-full p-6 text-white flex flex-col justify-between"
                    gradientType="linear-gradient"
                    gradientOrigin="top-left"
                    noiseIntensity={0.5}
                    noisePatternAlpha={25}
                    noisePatternSize={80}
                    noisePatternRefreshInterval={2}
                  >
                    <div>
                      {/* Back Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#533afd] ring-2 ring-white/60 animate-pulse" />
                          <span className="text-xs font-semibold tracking-wide uppercase text-white/95">
                            Household Sanctuary Tip
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label="Flip back to front face"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFlip(hack.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#0d253d] text-xs font-semibold border border-white/30 transition-all backdrop-blur-sm shadow-sm"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Flip Back</span>
                        </button>
                      </div>

                      <h4 className="font-heading-md text-lg text-white font-bold mb-2">
                        {hack.title}
                      </h4>

                      {/* Plain Non-Technical D2C Insights */}
                      <div className="space-y-2.5 text-xs leading-relaxed">
                        <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Why it matters:</span>
                          <p className="text-white/80">{hack.humanExplanation}</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                          <span className="font-semibold text-white/90 block mb-0.5">Everyday Family Routine:</span>
                          <p className="text-white/80">
                            {hack.id === 'corsiRosenthal'
                              ? 'Run continuously on medium speed in bedrooms overnight. Uses less power than a 40W lightbulb while scrubbing 85% of soot.'
                              : hack.id === 'draftSealing'
                              ? 'Stops cold outdoor smog from whistling under doors. Keeps warm indoor air trapped and clean air in.'
                              : hack.id === 'kitchenExhaust'
                              ? 'Flipping the vent switch before you cook prevents invisible frying fumes from settling into living room rugs.'
                              : 'Crack windows wide for 15 minutes between 12:00 PM and 3:00 PM to bring in fresh oxygen, then close tightly before sunset.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Back Bottom Button */}
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-white/90">
                        <Info className="w-3.5 h-3.5 text-white/90" />
                        <span>Actionable home sanctuary hack</span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Toggle ${hack.title} and flip back`}
                        onClick={() => {
                          onToggleHack(hack.id);
                          onToggleFlip(hack.id);
                        }}
                        className="px-4 py-1.5 rounded-full bg-white text-[#0d253d] font-semibold text-xs hover:bg-white/90 transition-all shadow-sm"
                      >
                        {isActive ? 'Turn Off & Flip' : 'Activate & Flip'}
                      </button>
                    </div>
                  </GradientBackground>
                </div>
              </div>
            </div>
);
