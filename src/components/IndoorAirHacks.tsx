import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Wrench, 
  Zap, 
  ArrowDown,
  ShieldCheck,
  RotateCw,
  Info
} from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';
import { GradientBackground } from './ui/noisy-gradient-backgrounds';

interface IndoorAirHacksProps {
  indoorPm25: number;
  outdoorPm25: number;
  activeHacks: {
    corsiRosenthal: boolean;
    kitchenExhaust: boolean;
    draftSealing: boolean;
    windowOpen: boolean;
  };
  onToggleHack: (key: 'corsiRosenthal' | 'kitchenExhaust' | 'draftSealing' | 'windowOpen') => void;
  onGenerateReceipt: (receipt: BreathReceipt) => void;
  onTriggerShare: () => void;
  cityName: string;
}

interface DIYHackDetail {
  id: 'corsiRosenthal' | 'draftSealing' | 'kitchenExhaust' | 'windowOpen';
  title: string;
  categoryLabel: string;
  effectLabel: string;
  costEst: string;
  description: string;
  humanExplanation: string;
  materials: string[];
  steps: string[];
}

const HACK_DETAILS: DIYHackDetail[] = [
  {
    id: 'corsiRosenthal',
    title: '$35 Box Fan Purifier (Corsi-Rosenthal Box)',
    categoryLabel: 'DIY Home Purifier',
    effectLabel: 'Cleans 85% of smoke in 20 mins',
    costEst: '$35 (saves $350 vs commercial purifiers)',
    description: 'Tape 4 standard home furnace filters around a standard 20-inch box fan. It cleans bedroom air as fast as a $400 store unit at a fraction of the price.',
    humanExplanation: 'Four large filters trap smoke, soot, and dust without straining the fan motor. Runs quietly overnight while using less power than a lightbulb.',
    materials: [
      '1x Standard 20-inch box fan ($20)',
      '4x MERV-13 furnace filters (20"x20") ($15–$20 total)',
      '1x Cardboard square for the bottom base',
      '1x Roll of duct tape or packing tape',
    ],
    steps: [
      'Stand the 4 filters in a square cube with the arrow marks pointing inward toward the center.',
      'Tape the vertical edges together firmly with duct tape.',
      'Tape the cardboard square to seal the bottom of the cube completely.',
      'Place the box fan on top, blowing clean air upward toward the ceiling.',
      'Tape all remaining seams tightly so air only enters through the filters. Plug in and run on low or medium.',
    ],
  },
  {
    id: 'draftSealing',
    title: 'Seal Window & Door Cracks',
    categoryLabel: 'Leak Prevention',
    effectLabel: 'Blocks 54% of outdoor smoke leaks',
    costEst: '$10 weather tape',
    description: 'Stick peel-and-stick foam tape along rattling window seams and slide a draft stopper under exterior doors to block dirty winter drafts.',
    humanExplanation: 'Over half of outdoor smog sneaks into living rooms through hairline cracks around windows and doors. Sealing them locks clean air inside.',
    materials: [
      'Peel-and-stick foam weatherstrip tape',
      'Door-bottom draft sweep or fabric roll',
      'Cloth to wipe frames before applying',
    ],
    steps: [
      'Wipe window frames and sills dry with a cloth to remove dust.',
      'Press self-adhesive foam tape along every gap where window panels meet.',
      'Slide or stick the draft stopper along the bottom edge of your front door.',
      'Check for leaks on a breezy evening—you shouldn\'t feel cool air drafts whistling in.',
    ],
  },
  {
    id: 'kitchenExhaust',
    title: 'Kitchen Exhaust & Stove Venting',
    categoryLabel: 'Cooking Soot Control',
    effectLabel: 'Clears cooking smoke in 10 mins',
    costEst: '$0 (Free)',
    description: 'Turn your stove exhaust fan on high before turning on burners or heating oil, and keep bedroom doors shut so frying smoke doesn\'t drift.',
    humanExplanation: 'Cooking oil fumes and gas flames release massive invisible spikes of fine soot. Venting them outdoors immediately protects family lungs.',
    materials: [
      'Kitchen exhaust fan or window vent',
      'Cooking pot and pan lids',
      'Bedroom doors kept shut while cooking',
    ],
    steps: [
      'Switch on the kitchen exhaust fan 2 minutes before you start cooking.',
      'Keep kitchen and bedroom doors closed to isolate cooking smoke.',
      'Always cover sizzling pans with lids to trap oil mist.',
      'Keep the fan running for 10 minutes after turning off the stove.',
    ],
  },
  {
    id: 'windowOpen',
    title: 'Midday 15-Minute Air Flush',
    categoryLabel: 'Fresh Air Timing',
    effectLabel: 'Brings fresh oxygen without smog flood',
    costEst: '$0 (Free timing trick)',
    description: 'Only open windows between 12:00 PM and 3:00 PM. Sunlight warms the ground and pushes the smog layer high into the sky, making it safe to air out your home.',
    humanExplanation: 'Never open windows in early morning or late evening when cold air traps car exhaust at ground level. Midday sun naturally dilutes pollution by up to 75%.',
    materials: [
      'Windows or balcony doors on opposite sides of home',
      'Phone alarm set for 1:00 PM',
    ],
    steps: [
      'Check your city\'s clean window (typically 12:00 PM – 3:00 PM).',
      'Open windows on two sides of the home for 15 minutes to create a fresh cross-breeze.',
      'Close and lock all windows tightly by 3:30 PM before sunset cooling starts.',
      'Turn on your DIY box fan purifier to quickly clean the fresh indoor air.',
    ],
  },
];

export const IndoorAirHacks: React.FC<IndoorAirHacksProps> = ({
  indoorPm25,
  outdoorPm25,
  activeHacks,
  onToggleHack,
  onGenerateReceipt,
  onTriggerShare,
  cityName,
}) => {
  const [selectedHackModal, setSelectedHackModal] = useState<DIYHackDetail | null>(null);
  const [flippedHacks, setFlippedHacks] = useState<Record<string, boolean>>({});

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedHackModal(null);
      }
    };
    if (selectedHackModal) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedHackModal]);

  const toggleFlip = (id: string) => {
    setFlippedHacks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute live reduction percentage
  const reductionPct = Math.max(0, Math.round(((outdoorPm25 - indoorPm25) / outdoorPm25) * 100));

  const handleCreateReceiptForHack = (hack: DIYHackDetail) => {
    const receipt = computeBreathReceipt(
      cityName,
      hack.title,
      {
        concentration_ug_m3: Math.max(15, indoorPm25),
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      {
        concentration_ug_m3: outdoorPm25,
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      hack.id === 'corsiRosenthal' ? 'corsi_rosenthal' : 'window_airing'
    );
    onGenerateReceipt(receipt);
  };

  return (
    <section 
      aria-labelledby="indoor-hacks-heading"
      className="w-full space-y-6"
    >
      {/* Header Card - De-slopped & Brand Aligned */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#e3e8ee]">
          <div>
            <h2 id="indoor-hacks-heading" className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d]">
              Indoor Air Sanctuary Controls
            </h2>
            <p className="font-body-md text-sm text-[#475569] mt-1 max-w-2xl">
              Turn your home in {cityName} into a protected haven without costly commercial purifiers. Toggle proven DIY interventions below.
            </p>
          </div>

          {/* Clean Brand Comparative Gauge */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <div className="text-center">
              <span className="text-xs text-[#64748d] font-medium block">
                Outdoor Smog
              </span>
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {Math.round(outdoorPm25)}
              </span>
              <span className="text-[10px] text-[#64748d] block">µg/m³</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border border-[#e3e8ee] flex items-center justify-center text-[#533afd] shadow-sm">
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="font-tabular text-xs font-bold text-[#533afd] mt-1">
                -{reductionPct}%
              </span>
            </div>

            <div className="text-center">
              <span className="text-xs text-[#64748d] font-medium block">
                Your Indoor Air
              </span>
              <span className="font-tabular text-2xl font-bold text-[#533afd]">
                {Math.round(indoorPm25)}
              </span>
              <span className="text-[10px] text-[#64748d] block">µg/m³</span>
            </div>
          </div>
        </div>

        {/* Live Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <ShieldCheck className="w-4 h-4 text-[#533afd]" />
            <span>
              Real-time room air simulator updating based on active filter and window seals.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] text-xs font-semibold border border-[#e3e8ee] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Sanctuary</span>
            </button>
            <button
              onClick={() => handleCreateReceiptForHack(HACK_DETAILS[0]!)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-medium transition-all shadow-sm focus:ring-2 focus:ring-[#533afd]"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>View Impact Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive Hacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {HACK_DETAILS.map((hack) => {
          const isActive = activeHacks[hack.id];
          const isFlipped = !!flippedHacks[hack.id];

          return (
            <div
              key={hack.id}
              tabIndex={0}
              role="region"
              aria-label={`${hack.title}. Press Enter or Space to flip card.`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                  e.preventDefault();
                  toggleFlip(hack.id);
                }
              }}
              className="relative min-h-[460px] sm:min-h-[440px] rounded-3xl transition-all perspective-1000 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                toggleFlip(hack.id);
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(hack.id);
                          }}
                          aria-label={`Flip card to view non-technical tips for ${hack.title}`}
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
                      <span className="text-[#64748d]">{hack.costEst}</span>
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
                      onClick={() => setSelectedHackModal(hack)}
                      className="flex items-center gap-1.5 text-xs text-[#533afd] font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-[#533afd] rounded"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Build Blueprint</span>
                    </button>

                    <button
                      onClick={() => handleCreateReceiptForHack(hack)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(hack.id);
                          }}
                          aria-label="Flip back to front face"
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
                      <div className="flex items-center gap-1 text-[11px] text-white/70">
                        <Info className="w-3.5 h-3.5 text-white/90" />
                        <span>Actionable home sanctuary hack</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onToggleHack(hack.id);
                          toggleFlip(hack.id);
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
        })}
      </div>

      {/* DIY Build Instructions Modal */}
      {selectedHackModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="diy-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              autoFocus
              onClick={() => setSelectedHackModal(null)}
              aria-label="Close DIY Guide (or press Escape)"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#475569] flex items-center justify-center text-xs focus:outline-none focus:ring-2 focus:ring-[#533afd]"
            >
              ✕
            </button>

            <span className="text-xs font-semibold text-[#533afd] block mb-1">DIY Assembly Blueprint</span>

            <h3 id="diy-modal-title" className="font-heading-lg text-xl text-[#0d253d] mb-1">
              {selectedHackModal.title}
            </h3>
            <p className="text-xs text-[#64748d] mb-4">
              Estimated Cost: {selectedHackModal.costEst} • Performance: {selectedHackModal.effectLabel}
            </p>

            {/* Materials List */}
            <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-4">
              <span className="text-xs font-bold text-[#0d253d] block mb-2">Materials & Supplies:</span>
              <ul className="space-y-1.5 text-xs text-[#475569]">
                {selectedHackModal.materials.map((m, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#533afd]" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assembly Steps */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold text-[#0d253d] block">Step-by-Step Instructions:</span>
              {selectedHackModal.steps.map((st, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#273951]">
                  <span className="w-5 h-5 rounded-full bg-[#533afd]/10 text-[#533afd] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <p className="pt-0.5">{st}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedHackModal(null)}
                className="px-5 py-2.5 rounded-full bg-[#533afd] text-white text-xs font-medium hover:bg-[#432ec9] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
