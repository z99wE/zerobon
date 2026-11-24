import React, { useState } from 'react';
import { 
  Share2, 
  Wrench, 
  Zap, 
  ArrowDown,
  ShieldCheck
} from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';

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
    title: 'DIY Corsi-Rosenthal Box Air Cleanser',
    categoryLabel: 'Proven Home Filtration',
    effectLabel: 'Cleans ~350 m³/h (85% reduction)',
    costEst: '$35 – $45 (vs $400 HEPA unit)',
    description: 'A cube built from 4 MERV-13 furnace filters taped to a 20-inch box fan. Matches commercial air purifiers with lower noise and longer filter life.',
    humanExplanation: 'Four large filters provide an enormous surface area, pulling particles out of room air rapidly without burning out the fan motor.',
    materials: [
      '1x 20-inch box fan (3-speed)',
      '4x 20x20x2" MERV-13 furnace filters',
      '1x cardboard bottom base piece',
      '1x roll of standard duct tape or gaffer tape',
    ],
    steps: [
      'Tape 4 MERV-13 filters into a square cube with the airflow arrows pointing inward.',
      'Tape the cardboard bottom firmly to seal the base of the cube.',
      'Place the 20" box fan on top, blowing UPWARD into the room.',
      'Tape all corners and seams securely to ensure no unfiltered air leaks past.',
    ],
  },
  {
    id: 'draftSealing',
    title: 'Magnetic Window Sash & Sill Sealing',
    categoryLabel: 'Leakage Prevention',
    effectLabel: 'Cuts outdoor air infiltration by 54%',
    costEst: '$8 – $12',
    description: 'Self-adhesive foam weatherstripping and silicone draft seals along sliding window sashes and door bottoms.',
    humanExplanation: 'Most smog enters through tiny cracks around windows and doors. Sealing these gaps blocks outdoor haze from leaking into living areas.',
    materials: [
      'High-density EPDM foam rubber weatherstrip tape',
      'Silicone door-bottom draft stopper',
      'Rubbing alcohol for cleaning surfaces before application',
    ],
    steps: [
      'Clean window sills and sash channels thoroughly with rubbing alcohol.',
      'Press self-adhesive silicone tape along every perimeter contact seam.',
      'Install the door bottom seal along the exterior entrance door.',
      'Check for remaining drafts using a lit candle or tissue paper on windy days.',
    ],
  },
  {
    id: 'kitchenExhaust',
    title: 'High-Velocity Kitchen Exhaust Flush',
    categoryLabel: 'Indoor Source Control',
    effectLabel: 'Flushes cooking particles in 12 mins',
    costEst: '$0 (Existing Equipment)',
    description: 'Run the range hood fan on high whenever frying or boiling, and keep kitchen doors closed to protect bedrooms.',
    humanExplanation: 'Cooking oil fumes and gas flames create intense fine particle spikes. Venting them directly outside keeps sleeping rooms clean.',
    materials: ['Ducted kitchen range hood or window exhaust fan', 'Kitchen barrier door or curtain'],
    steps: [
      'Turn on the exhaust fan 2 minutes before heating oil or igniting burners.',
      'Keep kitchen doors closed to isolate cooking fumes from living rooms.',
      'Always use pot lids when simmering or boiling.',
      'Leave the exhaust fan running for 10 minutes after cooking finishes.',
    ],
  },
  {
    id: 'windowOpen',
    title: 'Midday Inversion Window Clean Air Flush',
    categoryLabel: 'Solar Convective Airing',
    effectLabel: 'Flushes indoor CO₂ without smog flood',
    costEst: '$0 (Timing Optimization)',
    description: 'Open cross-ventilating windows only during midday clean air hours, when solar warmth lifts and dilutes surface pollution.',
    humanExplanation: 'Opening windows in early morning floods your home with trapped smog. Midday solar heating raises the smog lid, making airing safe.',
    materials: ['Cross-room windows or balcony doors', 'Smartphone reminder set for 1:00 PM'],
    steps: [
      'Verify clean air hours (typically 11:30 AM to 3:30 PM).',
      'Open windows on opposite sides of your home for 15 to 20 minutes.',
      'Close and latch all windows securely before 4:00 PM as evening cooling sets in.',
      'Run your DIY filter on high for 20 minutes following the flush.',
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

          return (
            <div
              key={hack.id}
              className={`rounded-3xl p-6 bg-white border transition-all ${
                isActive
                  ? 'border-[#533afd] shadow-lg ring-1 ring-[#533afd]/30'
                  : 'border-[#e3e8ee] hover:border-[#a8c3de] shadow-sm'
              }`}
            >
              {/* Top Row: Badge & Toggle Switch */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-[#533afd]">
                  {hack.categoryLabel}
                </span>

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
              onClick={() => setSelectedHackModal(null)}
              aria-label="Close DIY Guide"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#475569] flex items-center justify-center text-xs"
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
