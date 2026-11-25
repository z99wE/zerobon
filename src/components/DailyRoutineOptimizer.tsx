import React, { useMemo, useState } from 'react';
import { Check, Share2, RotateCw, Info } from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';
import { GradientBackground } from './ui/noisy-gradient-backgrounds';
import { ROUTINE_SWAPS, RoutineSwapItem } from '../data/routine-swaps';

interface DailyRoutineOptimizerProps {
  outdoorPm25: number;
  selectedCity: string;
  cleanWindowHours: string;
  onCommitReceipt: (receipt: BreathReceipt) => void;
  onTriggerShare: () => void;
}

export const DailyRoutineOptimizer: React.FC<DailyRoutineOptimizerProps> = ({
  outdoorPm25,
  selectedCity,
  cleanWindowHours,
  onCommitReceipt,
  onTriggerShare,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [committedSwaps, setCommittedSwaps] = useState<Record<string, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const filterOptions = ['All', 'Families with Kids', 'Commuters', 'Fitness Enthusiasts', 'Apartment Residents', 'Students'];

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSwaps = ROUTINE_SWAPS.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Families with Kids') {
      return item.lifestyleMatch.some((m) => m === 'Families with Kids' || m === 'All Families');
    }
    return item.lifestyleMatch.includes(selectedFilter);
  });

  const handleCommit = (swap: RoutineSwapItem) => {
    setCommittedSwaps((prev) => ({ ...prev, [swap.id]: true }));

    const receipt = computeBreathReceipt(
      selectedCity,
      swap.title,
      {
        concentration_ug_m3: 35,
        duration_minutes: 120,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      {
        concentration_ug_m3: outdoorPm25,
        duration_minutes: 120,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      'metro_transit'
    );

    const enrichedReceipt: BreathReceipt = {
      ...receipt,
      actionTitle: swap.title,
      doseSavedUg: swap.doseSavedUg,
      cigaretteEquivalentsSaved: swap.cigarettesSaved,
      co2eAvoidedGrams: swap.co2eAvoidedGrams,
      noxAvoidedGrams: swap.noxAvoidedGrams,
    };

    onCommitReceipt(enrichedReceipt);
  };

  // Cumulative impact (single-pass memoized aggregation)
  const {
    totalCommitted,
    cumulativeCigarettes,
    cumulativeDose,
    cumulativeCo2Kg,
  } = useMemo(() => {
    let committed = 0;
    let cigarettes = 0;
    let dose = 0;
    let co2Grams = 0;
    for (const item of ROUTINE_SWAPS) {
      if (committedSwaps[item.id]) {
        committed += 1;
        cigarettes += item.cigarettesSaved;
        dose += item.doseSavedUg;
        co2Grams += item.co2eAvoidedGrams;
      }
    }
    return {
      totalCommitted: committed,
      cumulativeCigarettes: cigarettes,
      cumulativeDose: dose,
      cumulativeCo2Kg: co2Grams / 1000,
    };
  }, [committedSwaps]);

  return (
    <section 
      aria-labelledby="routines-heading"
      className="w-full space-y-6"
    >
      {/* Section Header - De-slopped, Pure Brand Aesthetic */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
          <div>
            <h2 id="routines-heading" className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d]">
              Daily Routine Optimizer
            </h2>
            <p className="font-body-md text-sm text-[#475569] mt-1 max-w-2xl">
              Shift high-exposure activities into {selectedCity}’s clean air window ({cleanWindowHours}) to cut pollution and protect your family.
            </p>
          </div>

          <button
            type="button"
            aria-label="Share daily routine impact"
            onClick={onTriggerShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] text-xs font-semibold border border-[#e3e8ee] transition-all self-start md:self-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share My Progress</span>
          </button>
        </div>

        {/* Live Impact Tally Bar - Brand Monochromatic Palette */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Active Habits
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">{totalCommitted}</span>
              <span className="text-xs text-[#64748d]">/ {ROUTINE_SWAPS.length} completed</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Lung Dose Prevented
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#533afd]">
                {cumulativeDose}
              </span>
              <span className="text-xs text-[#64748d]">µg PM₂.₅</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Cigarettes Saved
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cumulativeCigarettes.toFixed(1)}
              </span>
              <span className="text-xs text-[#64748d]">cigs avoided</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#64748d] block mb-1">
              Emissions Avoided
            </span>
            <span className="font-tabular text-2xl font-bold text-[#0d253d]">
              {cumulativeCo2Kg.toFixed(1)} kg CO₂
            </span>
          </div>
        </div>
      </div>

      {/* Lifestyle Filter Tabs - High-Fidelity Capsule (Never Squished) */}
      <div 
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-1 bg-[#f6f9fc] rounded-full border border-[#e3e8ee] w-fit max-w-full" 
        role="tablist" 
        aria-label="Lifestyle Filters"
      >
        {filterOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-label={`Filter routines by ${opt}`}
            role="tab"
            aria-selected={selectedFilter === opt}
            onClick={() => setSelectedFilter(opt)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
              selectedFilter === opt
                ? 'bg-[#533afd] text-white font-bold shadow-sm'
                : 'text-[#475569] hover:text-[#0d253d] hover:bg-white/60 font-medium'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSwaps.map((swap) => {
          const Icon = swap.icon;
          const isDone = !!committedSwaps[swap.id];
          const isFlipped = !!flippedCards[swap.id];

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
                  toggleFlip(swap.id);
                }
              }}
              className="relative min-h-[530px] sm:min-h-[510px] rounded-3xl transition-all perspective-1000 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2"
              onClick={(e) => {
                // If user clicks a button inside card, let button handler deal with it
                if ((e.target as HTMLElement).closest('button')) return;
                toggleFlip(swap.id);
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
                          <span className="text-[11px] text-[#64748d]">
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
                            toggleFlip(swap.id);
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
                        <span className="text-[10px] text-[#64748d] block">Dose Protected</span>
                        <span className="font-tabular text-sm font-semibold text-[#533afd]">
                          +{swap.doseSavedUg} µg
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-[#64748d] block">Cigarettes Saved</span>
                        <span className="font-tabular text-sm font-semibold text-[#0d253d]">
                          {swap.cigarettesSaved} cigs
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-[#64748d] block">Carbon Cut</span>
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
                      onClick={() => handleCommit(swap)}
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
                            toggleFlip(swap.id);
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
                      <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                        <Info className="w-3.5 h-3.5 text-white/90" />
                        <span>Actionable daily routine wisdom</span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Adopt ${swap.title} routine`}
                        onClick={() => {
                          handleCommit(swap);
                          toggleFlip(swap.id);
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
        })}
      </div>
    </section>
  );
};
