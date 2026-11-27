import React, { useMemo, useState } from 'react';
import { Share2 } from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';
import { RoutineCard } from './routine-optimizer/RoutineCard';
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
            <span className="text-xs font-medium text-[#475569] block mb-1">
              Active Habits
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">{totalCommitted}</span>
              <span className="text-xs text-[#475569]">/ {ROUTINE_SWAPS.length} completed</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#475569] block mb-1">
              Lung Dose Prevented
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#533afd]">
                {cumulativeDose}
              </span>
              <span className="text-xs text-[#475569]">µg PM₂.₅</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#475569] block mb-1">
              Cigarettes Saved
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cumulativeCigarettes.toFixed(1)}
              </span>
              <span className="text-xs text-[#475569]">cigs avoided</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-xs font-medium text-[#475569] block mb-1">
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
          const isDone = !!committedSwaps[swap.id];
          const isFlipped = !!flippedCards[swap.id];

          return (
            <RoutineCard
              key={swap.id}
              swap={swap}
              isDone={isDone}
              isFlipped={isFlipped}
              onToggleFlip={toggleFlip}
              onCommit={handleCommit}
              onTriggerShare={onTriggerShare}
            />
          );
        })}
      </div>
    </section>
  );
};
