import React, { useState } from 'react';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { Share2, Zap, ArrowDown, ShieldCheck } from 'lucide-react';
import { BreathReceipt } from '../types';
import { computeBreathReceipt } from '../engine/physics';
import { HackFlipCard } from './indoor-air-hacks/HackFlipCard';
import { DiyBuildModal } from './indoor-air-hacks/DiyBuildModal';
import { HACK_DETAILS, DIYHackDetail } from '../data/indoor-hacks';

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
  const modalRef = useAccessibleModal(Boolean(selectedHackModal), () => setSelectedHackModal(null));

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
              <span className="text-xs text-[#475569] font-medium block">
                Outdoor Smog
              </span>
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {Math.round(outdoorPm25)}
              </span>
              <span className="text-[10px] text-[#475569] block">µg/m³</span>
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
              <span className="text-xs text-[#475569] font-medium block">
                Your Indoor Air
              </span>
              <span className="font-tabular text-2xl font-bold text-[#533afd]">
                {Math.round(indoorPm25)}
              </span>
              <span className="text-[10px] text-[#475569] block">µg/m³</span>
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
              type="button"
              aria-label="Share indoor air sanctuary impact"
              onClick={onTriggerShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] text-xs font-semibold border border-[#e3e8ee] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Sanctuary</span>
            </button>
            <button
              type="button"
              aria-label="View breath receipt for DIY box fan purifier"
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
        {HACK_DETAILS.map((hack) => (
          <HackFlipCard
            key={hack.id}
            hack={hack}
            isActive={!!activeHacks[hack.id]}
            isFlipped={!!flippedHacks[hack.id]}
            onToggleFlip={toggleFlip}
            onToggleHack={onToggleHack}
            onOpenBlueprint={setSelectedHackModal}
            onCreateReceipt={handleCreateReceiptForHack}
          />
        ))}
      </div>

      {selectedHackModal && (
        <DiyBuildModal
          hack={selectedHackModal}
          dialogRef={modalRef}
          onClose={() => setSelectedHackModal(null)}
        />
      )}
    </section>
  );
};
