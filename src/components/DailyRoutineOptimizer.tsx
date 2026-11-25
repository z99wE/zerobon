import React, { useState } from 'react';
import { 
  Bus, 
  Sun, 
  Baby, 
  Flame, 
  Home, 
  Check, 
  Share2,
  RotateCw,
  Info
} from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';
import { GradientBackground } from './ui/noisy-gradient-backgrounds';

interface RoutineSwapItem {
  id: string;
  title: string;
  category: string;
  description: string;
  actionDetails: string;
  humanReason: string;
  doseSavedUg: number;
  cigarettesSaved: number;
  co2eAvoidedGrams: number;
  noxAvoidedGrams: number;
  icon: React.ElementType;
  lifestyleMatch: string[];
  // D2C back face wisdom
  d2cTips: {
    quickAction: string;
    familyBenefit: string;
    proTip: string;
  };
}

const ROUTINE_SWAPS: RoutineSwapItem[] = [
  {
    id: 'metro-commute',
    title: 'Switch Commute to Electric Metro',
    category: 'Daily Commute',
    description: 'Switch from solo petrol/diesel drive to underground electric metro or electric bus.',
    actionDetails: 'Air-filtered underground transit cabin keeps exposure under 35 µg/m³ while removing a vehicle from congested roads.',
    humanReason: 'Morning cold air pools vehicle exhaust close to the road. Underground rail completely avoids traffic fumes.',
    doseSavedUg: 58,
    cigarettesSaved: 2.6,
    co2eAvoidedGrams: 1420,
    noxAvoidedGrams: 9.4,
    icon: Bus,
    lifestyleMatch: ['Commuters', 'All Families'],
    d2cTips: {
      quickAction: 'Leave your car at home 2 mornings a week and board the nearest air-conditioned metro train.',
      familyBenefit: 'Bypasses morning bumper-to-bumper smog plumes, lowering blood pressure and particulate inhalation.',
      proTip: 'Wear a comfortable cloth or N95 mask during walking connections between station doors and your office.',
    },
  },
  {
    id: 'midday-exercise',
    title: 'Shift Outdoor Run to Midday Hours',
    category: 'Fitness & Health',
    description: 'Move workouts from early morning cold smog to midday when rising warm air disperses the smoke.',
    actionDetails: 'Midday sunlight expands the vertical mixing layer by 4x, diluting surface pollution significantly.',
    humanReason: 'Heavy breathing during morning runs multiplies particulate intake by 10x. Midday air is far more dispersed.',
    doseSavedUg: 84,
    cigarettesSaved: 3.8,
    co2eAvoidedGrams: 0,
    noxAvoidedGrams: 0,
    icon: Sun,
    lifestyleMatch: ['Fitness Enthusiasts', 'All Families'],
    d2cTips: {
      quickAction: 'Schedule your runs or brisk walks between 12:00 PM and 3:00 PM when solar warming dilutes smog.',
      familyBenefit: 'Spares your lungs from heavy morning diesel soot deposits while maintaining cardiovascular health.',
      proTip: 'Do morning mobility or yoga indoors, then take your cardio outside during lunchtime sunshine.',
    },
  },
  {
    id: 'school-walking-bus',
    title: 'Walking Pod with N95 Respiration',
    category: 'Family & School',
    description: 'Coordinate a neighborhood walking pod with certified N95 masks, bypassing idling car queues at school gates.',
    actionDetails: 'Eliminates dense micro-hotspots of diesel exhaust idling right where children assemble outside school gates.',
    humanReason: 'Car exhaust around school drop-off zones creates dangerous particulate spikes. Walking with masks protects children.',
    doseSavedUg: 62,
    cigarettesSaved: 2.8,
    co2eAvoidedGrams: 890,
    noxAvoidedGrams: 6.2,
    icon: Baby,
    lifestyleMatch: ['Families with Kids'],
    d2cTips: {
      quickAction: 'Team up with 2 neighboring parents to take turns walking kids to school on foot with sealed pediatric N95s.',
      familyBenefit: 'Kids avoid breathing the thick cloud of exhaust that pools from 50 idling SUVs at school gates.',
      proTip: 'Pack spare masks in school bags and ask administrators to keep school corridor doors shut during drop-offs.',
    },
  },
  {
    id: 'induction-cooking',
    title: 'Cook with Electric Induction & Sealed Lids',
    category: 'Home Habits',
    description: 'Prepare dinner on electric induction cooktop with lids sealed rather than open-flame gas or deep frying.',
    actionDetails: 'Prevents indoor ultrafine particle spikes and unburned hydrocarbons inside closed winter homes.',
    humanReason: 'Gas stoves produce nitrogen dioxide and fine soot. In winter, closed windows keep these fumes inside your home.',
    doseSavedUg: 46,
    cigarettesSaved: 2.1,
    co2eAvoidedGrams: 420,
    noxAvoidedGrams: 3.5,
    icon: Flame,
    lifestyleMatch: ['All Families', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Keep pan lids closed while simmering and turn on the range exhaust fan 2 minutes before igniting burners.',
      familyBenefit: 'Keeps kitchen NOx and burnt oil particulates from drafting into bedrooms where children sleep.',
      proTip: 'Switching to electric kettles and induction pans eliminates up to 60% of winter indoor particulate spikes.',
    },
  },
  {
    id: 'remote-work-smog-day',
    title: 'Remote Work on High-Smog Days',
    category: 'Work & Living',
    description: 'Work from your filtered home sanctuary on high-pollution days to avoid peak road exposure.',
    actionDetails: 'Completely bypasses 90+ minutes of dense road tunnel and bumper-to-bumper particulate inhalation.',
    humanReason: 'Eliminating the daily commute avoids breathing concentrated road exhaust during peak traffic jams.',
    doseSavedUg: 96,
    cigarettesSaved: 4.4,
    co2eAvoidedGrams: 3250,
    noxAvoidedGrams: 21.0,
    icon: Home,
    lifestyleMatch: ['Commuters', 'Apartment Residents'],
    d2cTips: {
      quickAction: 'Check morning AQI: if outdoor levels exceed 200 µg/m³, request a work-from-home focus day.',
      familyBenefit: 'Saves 2 hours of stressful road exposure while keeping your home air cleansed and peaceful.',
      proTip: 'Set up your desk in the bedroom or study that has active window draft seals and continuous air purification.',
    },
  },
];

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
  onCommitReceipt,
  onTriggerShare,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [committedSwaps, setCommittedSwaps] = useState<Record<string, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const filterOptions = ['All', 'Families with Kids', 'Commuters', 'Fitness Enthusiasts', 'Apartment Residents'];

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSwaps = ROUTINE_SWAPS.filter((item) => {
    if (selectedFilter === 'All') return true;
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
      {/* Section Header - De-slopped, Pure Brand Aesthetic */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
          <div>
            <h2 id="routines-heading" className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d]">
              Daily Routine Optimizer
            </h2>
            <p className="font-body-md text-sm text-[#475569] mt-1 max-w-2xl">
              Shift high-exposure activities away from morning stagnation traps. Choose routines that cut pollution and protect your family in {selectedCity}.
            </p>
          </div>

          <button
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
                ? 'bg-[#533afd] text-white font-medium shadow-sm'
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(swap.id);
                          }}
                          aria-label={`Flip card to see lifestyle tips for ${swap.title}`}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(swap.id);
                          }}
                          aria-label="Flip back to front face"
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
