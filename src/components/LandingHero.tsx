import React, { useState } from 'react';
import { Radio, FileText } from 'lucide-react';
import { CityAirProfile } from '../engine/city-data';
import { SmogSimulatorSection } from './SmogSimulatorSection';
import { HeroTelemetryRow } from './landing-hero/HeroTelemetryRow';
import { ValuePillars } from './landing-hero/ValuePillars';

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
        <HeroTelemetryRow outdoorPm25={outdoorPm25} cityProfile={cityProfile} />
      </div>

      {/* 2. Problem Statement Alignment: 3D Flip Card Architecture (Zero Pill Tags • Zero Icons • Brand Aligned) */}
      <ValuePillars
        cityProfile={cityProfile}
        cleanWindowHours={cleanWindowHours}
        flippedCards={flippedCards}
        toggleCardFlip={toggleCardFlip}
        onExploreRoutines={onExploreRoutines}
        onExploreHacks={onExploreHacks}
        onOpenShare={onOpenShare}
      />

      <SmogSimulatorSection
        outdoorPm25={outdoorPm25}
        onSetOutdoorPm25={onSetOutdoorPm25}
      />
    </section>
  );
};
