import React, { useState } from 'react';
import { Radio, FileText } from 'lucide-react';
import { GradientBackground } from './ui/noisy-gradient-backgrounds';
import { CityAirProfile } from '../engine/city-data';
import { SmogSimulatorSection } from './SmogSimulatorSection';

interface LandingHeroProps {
  selectedCity: string;
  cityProfile: CityAirProfile;
  outdoorPm25: number;
  onSetOutdoorPm25: (val: number) => void;
  onExploreRoutines: () => void;
  onExploreHacks: () => void;
  onOpenAssistant: () => void;
  onOpenShare: () => void;
  onOpenSanctuaryCalibration?: () => void;
  onOpenRecessPass?: () => void;
  onSyncLiveAir?: () => void;
  isLiveSyncing?: boolean;
  isLiveReading?: boolean;
  sanctuaryBadgeText?: string;
  indoorPm25?: number;
  cleanWindowHours?: string;
  pblHeightMeters?: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  selectedCity,
  cityProfile,
  outdoorPm25,
  onSetOutdoorPm25,
  onExploreRoutines,
  onExploreHacks,
  onOpenAssistant,
  onOpenShare,
  onOpenSanctuaryCalibration,
  onOpenRecessPass,
  onSyncLiveAir,
  isLiveSyncing,
  isLiveReading,
  sanctuaryBadgeText,
  indoorPm25,
  cleanWindowHours,
  pblHeightMeters,
}) => {
  // Flip states for the 3 Solution Architecture Cards
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({
    routines: false,
    hacks: false,
    receipts: false,
  });

  const toggleCardFlip = (key: string) => {
    setFlippedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section aria-label="ZeroBon Clean Air Landing" className="w-full space-y-16">
      {/* 1. Flagship Hero Section: Seamlessly Integrated on Page (No Hard Box Cutoffs) */}
      <div className="w-full space-y-8 pt-2">
        {/* Top Microclimate Status (Glassmorphism Surface • Crisp & Ultra-Readable) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-sm text-[#0d253d] tracking-tight">{selectedCity}</span>

            {/* Live Station / Satellite Badge */}
            {onSyncLiveAir && (
              <button
                onClick={onSyncLiveAir}
                disabled={isLiveSyncing}
                title="Click to sync live atmospheric station & satellite readings"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  isLiveReading
                    ? 'bg-[#533afd]/10 text-[#533afd] border-[#533afd]/30 shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-[#0d253d] border-[#e3e8ee]'
                }`}
              >
                <Radio className={`w-3 h-3 ${isLiveSyncing ? 'animate-pulse text-[#533afd]' : isLiveReading ? 'text-[#533afd]' : 'text-[#475569]'}`} />
                <span>{isLiveReading ? 'Live CAMS feed' : 'Sync live air'}</span>
              </button>
            )}

            {/* Calibrated Sanctuary Badge */}
            {onOpenSanctuaryCalibration && (
              <button
                type="button"
                aria-label="Open home sanctuary calibration"
                onClick={onOpenSanctuaryCalibration}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-[#0d253d] text-[11px] font-medium border border-[#e3e8ee] transition-all shadow-2xs"
              >
                <span>{sanctuaryBadgeText || 'Home'}</span>
                {indoorPm25 !== undefined && (
                  <span className="text-[10px] text-[#475569]">· Est. {Math.round(indoorPm25)} µg</span>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[#0d253d] font-semibold">
              Clean Air Window: <strong className="text-[#533afd] font-extrabold">{cleanWindowHours || cityProfile.cleanWindowHours}</strong>
            </span>
            <span className="text-[#533afd] font-black">•</span>
            <span className="text-[#0d253d] font-semibold">
              Mixing Ceiling: <strong className="text-[#533afd] font-extrabold">{pblHeightMeters || cityProfile.pblHeightMeters}m</strong>
            </span>

            {/* Safe Recess Pass Quick Action */}
            {onOpenRecessPass && (
              <button
                type="button"
                aria-label="Open Safe Recess Pass PDF generator"
                onClick={onOpenRecessPass}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#f6f9fc] text-[#0d253d] font-bold text-[11px] border border-[#cbd5e1] shadow-2xs transition-all"
              >
                <FileText className="w-3 h-3 text-[#533afd]" />
                <span>Safe Recess Pass (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Central Hero Headline & Value Proposition */}
        <div className="max-w-4xl space-y-6 text-left">
          <h1 className="font-display-xxl text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#0d253d] leading-[1.12]">
            Navigate severe winter smog and{' '}
            <span className="font-semibold text-[#533afd] underline decoration-[#533afd]/30 decoration-4 underline-offset-8">
              urban air pollution
            </span>
            .
          </h1>

          <p className="font-body-lg text-base sm:text-xl text-[#475569] leading-relaxed max-w-3xl font-normal">
            A GenAI-powered assistant helping families and communities in {selectedCity} adopt low-emission daily routines, $35 indoor air quality hacks, and sustainable alternatives tailored to your location and lifestyle—clearly explaining the direct health and carbon impact of every choice.
          </p>

          {/* Big Action CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              type="button"
              aria-label="Adopt low-emission daily routines"
              onClick={onExploreRoutines}
              className="px-8 py-4 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-base font-semibold transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-[#533afd]/30 focus:outline-none"
            >
              Adopt Low-Emission Routines
            </button>

            <button
              type="button"
              aria-label="Explore $35 indoor air quality hacks"
              onClick={onExploreHacks}
              className="px-7 py-4 rounded-full bg-white hover:bg-[#f6f9fc] text-[#0d253d] text-base font-semibold border border-[#e3e8ee] shadow-sm transition-all focus:ring-4 focus:ring-[#533afd]/20 focus:outline-none"
            >
              Explore $35 Indoor Hacks
            </button>

            {onOpenSanctuaryCalibration && (
              <button
                type="button"
                aria-label="Open home sanctuary calibration"
                onClick={onOpenSanctuaryCalibration}
                className="px-6 py-4 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] text-sm font-semibold border border-[#e3e8ee] transition-all focus:ring-4 focus:ring-[#533afd]/20 focus:outline-none flex items-center justify-center"
              >
                <span>Home</span>
              </button>
            )}

            <button
              type="button"
              aria-label="Open AI Clean Air Assistant"
              onClick={onOpenAssistant}
              className="px-5 py-4 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] text-sm font-semibold border border-[#e3e8ee] transition-all focus:ring-4 focus:ring-[#533afd]/20 focus:outline-none"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>

        {/* Live Microclimate Telemetry Row (Seamless Flowing Divs) */}
        <div className="pt-6 border-t border-[#e3e8ee] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Ambient Air Quality
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {Math.round(outdoorPm25)}
              </span>
              <span className="text-xs text-[#475569]">µg/m³ PM₂.₅</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Surface Temp & Humidity
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cityProfile.temperatureC}°C
              </span>
              <span className="text-xs text-[#475569]">· {cityProfile.humidityPct}% RH</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Wind Dispersion
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cityProfile.windSpeedKmh}
              </span>
              <span className="text-xs text-[#475569]">km/h {cityProfile.windDirection}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Atmospheric State
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-base font-semibold text-[#533afd] truncate">
                {outdoorPm25 > 160 ? 'Thermal Inversion Cap' : 'Active Boundary Layer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Problem Statement Alignment: 3D Flip Card Architecture (Zero Pill Tags • Zero Icons • Brand Aligned) */}
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

      <SmogSimulatorSection
        outdoorPm25={outdoorPm25}
        onSetOutdoorPm25={onSetOutdoorPm25}
      />
    </section>
  );
};
