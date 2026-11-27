import React from 'react';
import { GradientBackground } from '../ui/noisy-gradient-backgrounds';
import type { CityAirProfile } from '../../engine/city-data';

interface Props {
  cityProfile: CityAirProfile;
  cleanWindowHours?: string;
  flippedCards: Record<string, boolean>;
  toggleCardFlip: (key: string) => void;
  onExploreRoutines: () => void;
  onExploreHacks: () => void;
  onOpenShare: () => void;
}

/** Three flip cards explaining routines, indoor sanctuaries and verifiable receipts. */
export const ValuePillars: React.FC<Props> = ({
  cityProfile, cleanWindowHours, flippedCards, toggleCardFlip,
  onExploreRoutines, onExploreHacks, onOpenShare,
}) => (
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d] font-bold">
            How ZeroBon Solves Urban Winter Smog
          </h2>
          <p className="font-body-md text-sm text-[#475569]">
            Winter smog is trapped cold air holding ground emissions at breathing level. ZeroBon translates atmospheric physics into simple, daily family actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              key: 'routines',
              num: '01',
              title: '1. Low-Emission Routines',
              description:
                'Cold night air traps vehicle exhaust within 150m of ground level. ZeroBon shifts school drop-offs, commutes, and workouts into golden solar convective mixing windows.',
              frontAction: 'View Swaps',
              backLabel: 'Routine Impact Blueprint',
              backTitle: 'Solar Dilution Synchronization',
              backDescription: `Rescheduling high-aerobic activities between ${cleanWindowHours || cityProfile.cleanWindowHours} avoids the 70% particle accumulation trapped beneath the nocturnal inversion lid.`,
              backAction: 'Explore Routine Swaps',
              onAction: onExploreRoutines,
            },
            {
              key: 'hacks',
              num: '02',
              title: '2. $35 DIY Indoor Sanctuaries',
              description:
                'Commercial purifiers cost upwards of $400. Build high-performing box fan purifiers for $35, seal drafty window sashes, and purge kitchen frying soot in minutes.',
              frontAction: 'View Hacks',
              backLabel: 'Sanctuary Blueprint',
              backTitle: 'Box Fan Air Cleanser',
              backDescription:
                'Four affordable home furnace filters and a box fan clear 85% of soot from living rooms in 20 minutes, costing 90% less than store purifiers.',
              backAction: 'Explore Indoor Hacks',
              onAction: onExploreHacks,
            },
            {
              key: 'receipts',
              num: '03',
              title: '3. Verifiable Impact Receipts',
              description:
                'No vague greenwashing. Every routine swap calculates exact inhaled particulate dose prevented (µg PM₂.₅), cigarette equivalents avoided, and avoided emissions.',
              frontAction: 'Share Receipt',
              backLabel: 'Deterministic Receipts',
              backTitle: 'Inhaled Dose Differential',
              backDescription:
                'Mass-balance differential equations calculate particulate exposure reduction down to microgram precision. Ready for 1-click sharing on WhatsApp and X.',
              backAction: 'Share Verified Receipt',
              onAction: onOpenShare,
            },
          ].map((card) => (
            <div
              key={card.key}
              tabIndex={0}
              role="region"
              aria-label={`Pillar ${card.num}: ${card.title}. Press Enter or Space to flip card.`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                  e.preventDefault();
                  toggleCardFlip(card.key);
                }
              }}
              className="relative perspective-[1000px] w-full min-h-[380px] rounded-3xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                  flippedCards[card.key] ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE */}
                <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-white border border-[#e3e8ee] hover:border-[#533afd] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between backface-hidden">
                  <div className="space-y-3">
                    <span className="text-sm font-extrabold font-tabular text-[#533afd] tracking-wider block">
                      {card.num}
                    </span>
                    <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
                      {card.title}
                    </h3>
                    <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#e3e8ee] flex items-center justify-between">
                    <button
                      type="button"
                      aria-label={`Flip ${card.title} card for blueprint`}
                      onClick={() => toggleCardFlip(card.key)}
                      className="text-xs font-semibold text-[#533afd] hover:underline"
                    >
                      Action Blueprint & Flip
                    </button>
                    <button
                      type="button"
                      aria-label={`${card.frontAction} for ${card.title}`}
                      onClick={card.onAction}
                      className="text-xs font-medium text-[#475569] hover:text-[#0d253d]"
                    >
                      {card.frontAction}
                    </button>
                  </div>
                </div>

                {/* BACK FACE (Styled with Seamless Brand Linear Gradient) */}
                <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-[#533afd]/40 shadow-xl backface-hidden rotate-y-180">
                  <GradientBackground
                    className="w-full h-full p-6 text-white flex flex-col justify-between"
                    gradientType="linear-gradient"
                    gradientOrigin="top-left"
                    noiseIntensity={0.5}
                    noisePatternAlpha={25}
                    noisePatternSize={80}
                    noisePatternRefreshInterval={2}
                  >
                    <div className="space-y-3">
                      <span className="text-xs font-bold font-tabular text-white/80 uppercase tracking-wider block">
                        {card.backLabel}
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        {card.backTitle}
                      </h4>
                      <p className="text-xs text-white/90 leading-relaxed">
                        {card.backDescription}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        aria-label={`Flip ${card.title} card back`}
                        onClick={() => toggleCardFlip(card.key)}
                        className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all"
                      >
                        Flip Back
                      </button>
                      <button
                        type="button"
                        aria-label={card.backAction}
                        onClick={card.onAction}
                        className="px-4 py-1.5 rounded-full bg-white text-[#0d253d] text-xs font-bold hover:bg-white/90 transition-all shadow-sm"
                      >
                        {card.backAction}
                      </button>
                    </div>
                  </GradientBackground>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
);
