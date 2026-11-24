import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  Wrench, 
  Zap, 
  ArrowDown
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
  locationName: string;
}

interface DIYHackDetail {
  id: 'corsiRosenthal' | 'draftSealing' | 'kitchenExhaust' | 'windowOpen';
  title: string;
  badge: string;
  cadrOrEffect: string;
  costEst: string;
  description: string;
  physicsMechanism: string;
  materials: string[];
  steps: string[];
}

const HACK_DETAILS: DIYHackDetail[] = [
  {
    id: 'corsiRosenthal',
    title: 'DIY Corsi-Rosenthal Air Cleanser',
    badge: 'Gold Standard DIY Filtration',
    cadrOrEffect: '+360 m³/h CADR (85% reduction)',
    costEst: '$35 - $45 (vs $400 HEPA)',
    description: 'A cube made of 4 MERV-13 furnace filters taped to a 20-inch box fan. Proven by UC Davis & EPA to match or outperform high-end commercial HEPA purifiers.',
    physicsMechanism: 'Adds massive active mechanical filtration (Q_CADR / V) to the indoor air compartment without backpressure motor strain.',
    materials: [
      '1x 20-inch standard box fan (3-speed)',
      '4x 20x20x2 or 20x20x1 MERV-13 furnace filters',
      '1x cardboard bottom shroud',
      '1x roll of standard duct tape / gaffer tape',
    ],
    steps: [
      'Tape 4 MERV-13 filters into a square cube with arrows pointing inward toward the center.',
      'Seal the cardboard square to the bottom of the cube with duct tape.',
      'Place the 20" box fan on top, blowing UPWARD into the room.',
      'Tape all seams securely to eliminate particulate bypass.',
    ],
  },
  {
    id: 'draftSealing',
    title: 'Magnetic Window Sash & Sill Sealing',
    badge: 'Passive Envelope Defense',
    cadrOrEffect: 'Cuts infiltration P from 0.82 to 0.38',
    costEst: '$8 - $12',
    description: 'High-density foam weatherstripping and magnetic perimeter draft tape along sliding window sashes and exterior door frames.',
    physicsMechanism: 'Halves the building envelope penetration coefficient (P_penetration), blocking exterior smog from drafting through cracks.',
    materials: [
      'High-density EPDM foam rubber weatherstrip tape',
      'Magnetic silicone draft stopper for bottom of entry doors',
      'Window film thermal insulation shrink wrap for old single-pane glass',
    ],
    steps: [
      'Run an incense stick or candle flame along window sills to detect invisible airflow leaks.',
      'Clean window sash tracks thoroughly with rubbing alcohol.',
      'Press self-adhesive silicone draft tape along every perimeter seam.',
      'Install magnetic bottom draft stopper under the main apartment door.',
    ],
  },
  {
    id: 'kitchenExhaust',
    title: 'High-Velocity Kitchen Range Hood Flush',
    badge: 'Source Control Evacuation',
    cadrOrEffect: 'Purges ultrafine cooking spikes in 12 mins',
    costEst: '$0 (Existing Equipment)',
    description: 'Run the ducted range hood on high whenever boiling, searing, or baking. Always keep kitchen doors closed to prevent dispersion into bedrooms.',
    physicsMechanism: 'Increases local compartment exhaust air change rate (λ_ach = 1.8/h) to eject VOCs and oil aerosols directly outside before whole-house mixing.',
    materials: ['Ducted range hood or window exhaust fan', 'Kitchen barrier door or heavy curtain'],
    steps: [
      'Turn exhaust hood ON 2 minutes before igniting burners to establish outward negative pressure.',
      'Close kitchen doors to decouple the cooking plume from sleeping areas.',
      'Cook with tight lids whenever possible to prevent aerosol vaporization.',
      'Keep hood running for 10 minutes post-cooking.',
    ],
  },
  {
    id: 'windowOpen',
    title: 'Midday Inversion Mixing Window Flush',
    badge: 'Solar Boundary Layer Flush',
    cadrOrEffect: 'Reduces indoor CO₂ from 1,400 to 550 ppm',
    costEst: '$0 (Timing Optimization)',
    description: 'Open cross-ventilating windows ONLY between 11:30 AM and 3:30 PM, when solar convection dilutes the surface smog layer.',
    physicsMechanism: 'Exploits the diurnal expansion of the planetary boundary layer (PBL) from 180m to 850m to flush stale carbon dioxide without flooding your home with morning smog.',
    materials: ['Cross-room windows or balcony doors', 'Smart phone timer set for 12:30 PM'],
    steps: [
      'Check ZeroBon Smog Radar to verify PBL height is above 500m.',
      'Open windows on opposite sides of the residence for 15-20 minutes.',
      'Re-seal all windows before 4:00 PM when the nocturnal inversion re-establishes.',
      'Turn DIY Corsi-Rosenthal box on High for 20 minutes post-airing.',
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
  locationName,
}) => {
  const [selectedHackModal, setSelectedHackModal] = useState<DIYHackDetail | null>(null);

  // Compute live reduction percentage
  const reductionPct = Math.max(0, Math.round(((outdoorPm25 - indoorPm25) / outdoorPm25) * 100));

  const handleCreateReceiptForHack = (hack: DIYHackDetail) => {
    const receipt = computeBreathReceipt(
      locationName,
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
      {/* Header Card with Real-time Indoor vs Outdoor Comparison */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#e3e8ee]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#128c7e]" />
              <span className="font-micro-cap text-[#128c7e] font-semibold">
                DIY Indoor Air Quality Hacks
              </span>
            </div>
            <h2 id="indoor-hacks-heading" className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d]">
              Indoor Air Sanctuary Controls
            </h2>
            <p className="font-body-md text-sm text-[#475569] mt-1 max-w-2xl">
              Turn your home into a protected clean-air haven without expensive purifiers. Toggle proven physics-based interventions and observe the immediate reduction.
            </p>
          </div>

          {/* High-Contrast Comparative Gauge */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <div className="text-center">
              <span className="text-[10px] text-[#64748d] font-medium uppercase tracking-wider block">
                Outdoor Smog
              </span>
              <span className="font-tabular text-2xl font-bold text-[#ea2261]">
                {Math.round(outdoorPm25)}
              </span>
              <span className="text-[10px] text-[#64748d] block">µg/m³ PM₂.₅</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#128c7e]/10 flex items-center justify-center text-[#128c7e]">
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="font-tabular text-xs font-bold text-[#128c7e] mt-1">
                -{reductionPct}%
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-[#64748d] font-medium uppercase tracking-wider block">
                Your Indoor Air
              </span>
              <span className={`font-tabular text-2xl font-bold ${indoorPm25 < 35 ? 'text-[#128c7e]' : indoorPm25 < 75 ? 'text-[#f59e0b]' : 'text-[#ea2261]'}`}>
                {Math.round(indoorPm25)}
              </span>
              <span className="text-[10px] text-[#64748d] block">µg/m³ PM₂.₅</span>
            </div>
          </div>
        </div>

        {/* Live Active Interventions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <Sparkles className="w-4 h-4 text-[#533afd]" />
            <span>
              <strong>Physics solver:</strong> Analytical Mass-Balance step (dCin/dt = P·λ·Cout − (λ + kd + CADR/V)·Cin)
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
              <span>Generate Breath Receipt</span>
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
                  ? 'border-[#533afd] shadow-lg ring-2 ring-[#533afd]/20'
                  : 'border-[#e3e8ee] hover:border-[#a8c3de] shadow-sm'
              }`}
            >
              {/* Top Row: Badge & Toggle Switch */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#f6f9fc] border border-[#e3e8ee] text-[11px] font-semibold text-[#533afd]">
                  {hack.badge}
                </span>

                {/* Big Accessible Toggle Switch */}
                <button
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`Toggle ${hack.title}`}
                  onClick={() => onToggleHack(hack.id)}
                  className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2 ${
                    isActive ? 'bg-[#533afd]' : 'bg-[#e3e8ee]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Title & Performance */}
              <h3 className="font-heading-md text-lg text-[#0d253d] mb-1">
                {hack.title}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-[#128c7e]">
                  {hack.cadrOrEffect}
                </span>
                <span className="text-[#a8c3de]">•</span>
                <span className="text-xs text-[#64748d]">{hack.costEst}</span>
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
                  <span>Build Instructions</span>
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

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#533afd]" />
              <span className="text-[11px] font-semibold text-[#533afd] uppercase">DIY Step-by-Step Blueprint</span>
            </div>

            <h3 id="diy-modal-title" className="font-heading-lg text-xl text-[#0d253d] mb-1">
              {selectedHackModal.title}
            </h3>
            <p className="text-xs text-[#64748d] mb-4">
              Estimated Cost: {selectedHackModal.costEst} • Performance: {selectedHackModal.cadrOrEffect}
            </p>

            {/* Materials List */}
            <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] mb-4">
              <span className="text-xs font-bold text-[#0d253d] block mb-2">Materials & Supplies Needed:</span>
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
              <span className="text-xs font-bold text-[#0d253d] block">Step-by-Step Assembly:</span>
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
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
