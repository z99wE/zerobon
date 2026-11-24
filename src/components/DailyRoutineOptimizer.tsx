import React, { useState } from 'react';
import { 
  Bus, 
  Sun, 
  Baby, 
  Flame, 
  Home, 
  Check, 
  Share2, 
  Sparkles, 
  Wind, 
  Thermometer, 
  Clock, 
  Layers
} from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';

interface RoutineSwapItem {
  id: string;
  title: string;
  category: 'Commute' | 'Exercise' | 'Family & School' | 'Home Energy';
  description: string;
  actionDetails: string;
  inversionReason: string;
  doseSavedUg: number;
  cigarettesSaved: number;
  co2eAvoidedGrams: number;
  noxAvoidedGrams: number;
  icon: React.ElementType;
  lifestyleMatch: string[];
}

const ROUTINE_SWAPS: RoutineSwapItem[] = [
  {
    id: 'metro-commute',
    title: 'Electric Metro Commute Switch',
    category: 'Commute',
    description: 'Switch from solo petrol/diesel drive to underground electric metro or electric bus.',
    actionDetails: 'Air-filtered underground transit cabin keeps exposure under 35 µg/m³ while taking a vehicle off jammed surface roads.',
    inversionReason: 'During 8:00 AM surface temperature inversions, tailpipe exhaust remains trapped within 200m of the ground.',
    doseSavedUg: 58,
    cigarettesSaved: 2.6,
    co2eAvoidedGrams: 1420,
    noxAvoidedGrams: 9.4,
    icon: Bus,
    lifestyleMatch: ['Commuters', 'All Families'],
  },
  {
    id: 'midday-exercise',
    title: 'Shift Outdoor Run to Midday Mixing Window',
    category: 'Exercise',
    description: 'Move cardio from 6:30 AM stagnant smog to 1:00 PM when the boundary layer expands.',
    actionDetails: 'Solar heating elevates boundary layer height from 180m to 850m, dispersing surface smog by up to 60%.',
    inversionReason: 'Morning ground inversion concentrates particulates at head height. Midday thermal convection ventilates the city.',
    doseSavedUg: 84,
    cigarettesSaved: 3.8,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Sun,
    lifestyleMatch: ['Fitness Enthusiasts', 'All Families'],
  },
  {
    id: 'school-walking-bus',
    title: 'Walking School Bus with N95 Respiration',
    category: 'Family & School',
    description: 'Coordinate neighborhood walking pod with certified N95 masks, bypassing idling car queues at school gates.',
    actionDetails: 'Eliminates dense micro-hotspots of diesel exhaust idling right where children assemble outside school gates.',
    inversionReason: 'Idling combustion exhaust around school drop-off zones creates localized spikes over 450 µg/m³.',
    doseSavedUg: 62,
    cigarettesSaved: 2.8,
    co2eAvoidedGrams: 890,
    noxAvoidedGrams: 6.2,
    icon: Baby,
    lifestyleMatch: ['Families with Kids'],
  },
  {
    id: 'induction-cooking',
    title: 'Electric Induction Cooking Swap',
    category: 'Home Energy',
    description: 'Prepare dinner on electric induction cooktop with lids sealed rather than open-flame gas or deep frying.',
    actionDetails: 'Prevents indoor ultrafine particle spikes (often > 200 µg/m³) and unburned hydrocarbons inside closed winter homes.',
    inversionReason: 'Because outdoor air is too toxic to ventilate freely, indoor combustion products stay trapped for hours.',
    doseSavedUg: 46,
    cigarettesSaved: 2.1,
    co2eAvoidedGrams: 420,
    noxAvoidedGrams: 3.5,
    icon: Flame,
    lifestyleMatch: ['All Families', 'Apartment Residents'],
  },
  {
    id: 'remote-work-smog-day',
    title: 'Smog-Emergency Remote Work Day',
    category: 'Commute',
    description: 'Work from your filtered home sanctuary on high-inversion alert days to avoid peak road exposure.',
    actionDetails: 'Completely bypasses 90+ minutes of high-concentration road tunnel and bumper-to-bumper particulate inhalation.',
    inversionReason: 'Traffic emissions on cold, windless winter mornings become secondary particulate precursors through photochemical smog.',
    doseSavedUg: 96,
    cigarettesSaved: 4.4,
    co2eAvoidedGrams: 3250,
    noxAvoidedGrams: 21.0,
    icon: Home,
    lifestyleMatch: ['Commuters', 'Apartment Residents'],
  },
];

interface DailyRoutineOptimizerProps {
  outdoorPm25: number;
  selectedLocation: string;
  onCommitReceipt: (receipt: BreathReceipt) => void;
  onTriggerShare: () => void;
}

export const DailyRoutineOptimizer: React.FC<DailyRoutineOptimizerProps> = ({
  outdoorPm25,
  selectedLocation,
  onCommitReceipt,
  onTriggerShare,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [committedSwaps, setCommittedSwaps] = useState<Record<string, boolean>>({});

  const filterOptions = ['All', 'Families with Kids', 'Commuters', 'Fitness Enthusiasts', 'Apartment Residents'];

  const filteredSwaps = ROUTINE_SWAPS.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.lifestyleMatch.includes(selectedFilter);
  });

  const handleCommit = (swap: RoutineSwapItem) => {
    setCommittedSwaps((prev) => ({ ...prev, [swap.id]: true }));

    const receipt = computeBreathReceipt(
      selectedLocation,
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

    // Override with custom swap stats
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

  // Cumulative impact
  const totalCommitted = Object.values(committedSwaps).filter(Boolean).length;
  const cumulativeCigarettes = ROUTINE_SWAPS.reduce((acc, curr) => {
    return committedSwaps[curr.id] ? acc + curr.cigarettesSaved : acc;
  }, 0);
  const cumulativeDose = ROUTINE_SWAPS.reduce((acc, curr) => {
    return committedSwaps[curr.id] ? acc + curr.doseSavedUg : acc;
  }, 0);
  const cumulativeCo2Kg = ROUTINE_SWAPS.reduce((acc, curr) => {
    return committedSwaps[curr.id] ? acc + (curr.co2eAvoidedGrams / 1000) : acc;
  }, 0);

  return (
    <section 
      aria-labelledby="routines-heading"
      className="w-full space-y-6"
    >
      {/* Section Header & Weather Context */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#533afd]" />
              <span className="font-micro-cap text-[#533afd] font-semibold">
                Low-Emission Daily Routines
              </span>
            </div>
            <h2 id="routines-heading" className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d]">
              Inversion-Smart Daily Routines
            </h2>
            <p className="font-body-md text-sm text-[#475569] mt-1 max-w-2xl">
              Shift high-exposure activities away from morning stagnation traps and switch to low-emission transport alternatives tailored to your lifestyle.
            </p>
          </div>

          {/* Weather & Atmospheric Dispersion Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#533afd]" />
              <span className="text-xs text-[#273951]">14°C Calm</span>
            </div>
            <span className="text-[#a8c3de] hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#ea2261]" />
              <span className="text-xs font-medium text-[#ea2261]">
                Trap: Inversion &lt; 250m
              </span>
            </div>
            <span className="text-[#a8c3de] hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#128c7e]" />
              <span className="text-xs font-semibold text-[#128c7e]">
                Clean Window: 11:30 AM – 3:30 PM
              </span>
            </div>
          </div>
        </div>

        {/* Live Impact Tally Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="text-[11px] font-medium text-[#64748d] uppercase tracking-wider block mb-1">
              Active Swaps
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">{totalCommitted}</span>
              <span className="text-xs text-[#64748d]">/ {ROUTINE_SWAPS.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#533afd]/5 border border-[#533afd]/20">
            <span className="text-[11px] font-medium text-[#533afd] uppercase tracking-wider block mb-1">
              Lung Dose Prevented
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#533afd]">
                {cumulativeDose}
              </span>
              <span className="text-xs text-[#533afd]/80">µg PM₂.₅</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#34d399]/10 border border-[#34d399]/30">
            <span className="text-[11px] font-medium text-[#128c7e] uppercase tracking-wider block mb-1">
              Cigarettes Saved
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-[#128c7e]">
                {cumulativeCigarettes.toFixed(1)}
              </span>
              <span className="text-xs text-[#128c7e]">cigs avoided</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-[#64748d] uppercase tracking-wider block mb-1">
                CO₂e Avoided
              </span>
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cumulativeCo2Kg.toFixed(1)} kg
              </span>
            </div>
            {totalCommitted > 0 && (
              <button
                onClick={onTriggerShare}
                className="mt-2 flex items-center gap-1 text-xs text-[#533afd] font-semibold hover:underline"
              >
                <Share2 className="w-3 h-3" />
                <span>Share Total</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lifestyle Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Lifestyle Filters">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            role="tab"
            aria-selected={selectedFilter === opt}
            onClick={() => setSelectedFilter(opt)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
              selectedFilter === opt
                ? 'bg-[#0d253d] text-white font-medium shadow-sm'
                : 'bg-white text-[#273951] hover:bg-[#f6f9fc] border border-[#e3e8ee]'
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

          return (
            <div
              key={swap.id}
              className={`rounded-3xl p-6 bg-white border transition-all ${
                isDone
                  ? 'border-[#34d399] shadow-md ring-1 ring-[#34d399]/40'
                  : 'border-[#e3e8ee] hover:border-[#a8c3de] shadow-sm'
              }`}
            >
              {/* Card Category & Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-[#533afd]/10 flex items-center justify-center text-[#533afd]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#533afd] uppercase tracking-wider block">
                      {swap.category}
                    </span>
                    <span className="text-xs text-[#64748d]">
                      {swap.lifestyleMatch.join(' • ')}
                    </span>
                  </div>
                </div>

                {isDone && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#34d399]/20 text-[#0f5132] text-xs font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Committed</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="font-heading-md text-lg text-[#0d253d] mb-1.5">
                {swap.title}
              </h3>
              <p className="font-body-md text-xs text-[#475569] leading-relaxed mb-4">
                {swap.description}
              </p>

              {/* Inversion Context Box */}
              <div className="p-3 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-4 text-xs text-[#273951] space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#533afd] flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-[#0d253d]">Atmospheric Reason:</span>
                </div>
                <p className="text-[11px] text-[#475569] pl-5">
                  {swap.inversionReason}
                </p>
              </div>

              {/* Impact Metrics Row */}
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-[#e3e8ee] mb-5">
                <div className="text-left">
                  <span className="text-[10px] text-[#64748d] block">Lung Dose Avoided</span>
                  <span className="font-tabular text-sm font-semibold text-[#533afd]">
                    +{swap.doseSavedUg} µg
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-[#64748d] block">Cigarettes Equivalent</span>
                  <span className="font-tabular text-sm font-semibold text-[#128c7e]">
                    {swap.cigarettesSaved} cigs
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-[#64748d] block">Avoided Emissions</span>
                  <span className="font-tabular text-sm font-semibold text-[#0d253d]">
                    {swap.co2eAvoidedGrams > 0 ? `${(swap.co2eAvoidedGrams / 1000).toFixed(1)}kg CO₂` : 'Zero Tailpipe'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => handleCommit(swap)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-medium transition-all focus:ring-2 focus:ring-[#533afd] ${
                    isDone
                      ? 'bg-[#f6f9fc] text-[#0d253d] border border-[#e3e8ee] hover:bg-[#e3e8ee]'
                      : 'bg-[#533afd] hover:bg-[#432ec9] text-white shadow-sm'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Update Receipt' : 'Commit Routine Swap'}</span>
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
          );
        })}
      </div>
    </section>
  );
};
