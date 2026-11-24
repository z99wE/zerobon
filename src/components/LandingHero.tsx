import React, { useState } from 'react';
import { GradientBackground } from './ui/noisy-gradient-backgrounds';
import { CityAirProfile } from '../engine/city-data';

interface LandingHeroProps {
  selectedCity: string;
  cityProfile: CityAirProfile;
  outdoorPm25: number;
  onSetOutdoorPm25: (val: number) => void;
  onExploreRoutines: () => void;
  onExploreHacks: () => void;
  onOpenAssistant: () => void;
  onOpenShare: () => void;
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
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#0d253d] tracking-tight">{selectedCity}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#0d253d] font-semibold">
              Clean Air Window: <strong className="text-[#533afd] font-extrabold">{cityProfile.cleanWindowHours}</strong>
            </span>
            <span className="text-[#533afd] font-black">•</span>
            <span className="text-[#0d253d] font-semibold">
              Mixing Ceiling: <strong className="text-[#533afd] font-extrabold">{cityProfile.pblHeightMeters}m</strong>
            </span>
          </div>
        </div>

        {/* Central Hero Headline & Value Proposition */}
        <div className="max-w-4xl space-y-6 text-left">
          <h1 className="font-display-xxl text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#0d253d] leading-[1.12]">
            Navigate severe winter smog with{' '}
            <span className="font-semibold text-[#533afd] underline decoration-[#533afd]/30 decoration-4 underline-offset-8">
              physics-verified
            </span>{' '}
            routines & hacks.
          </h1>

          <p className="font-body-lg text-base sm:text-xl text-[#475569] leading-relaxed max-w-3xl font-normal">
            A GenAI-powered assistant designed for households and communities. Shift high-emission routines into solar mixing windows, deploy $35 DIY clean sanctuaries, and calculate the exact breath-dose you protect for your loved ones.
          </p>

          {/* Big Action CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={onExploreRoutines}
              className="px-8 py-4 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-base font-semibold transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-[#533afd]/30 focus:outline-none"
            >
              Adopt Low-Emission Routines
            </button>

            <button
              onClick={onExploreHacks}
              className="px-7 py-4 rounded-full bg-white hover:bg-[#f6f9fc] text-[#0d253d] text-base font-semibold border border-[#e3e8ee] shadow-sm transition-all focus:ring-4 focus:ring-[#533afd]/20 focus:outline-none"
            >
              Explore $35 Indoor Hacks
            </button>

            <button
              onClick={onOpenAssistant}
              className="px-6 py-4 rounded-full bg-[#533afd]/10 hover:bg-[#533afd]/15 text-[#533afd] text-sm font-semibold transition-all focus:ring-4 focus:ring-[#533afd]/20 focus:outline-none"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>

        {/* Live Microclimate Telemetry Row (Seamless Flowing Divs) */}
        <div className="pt-6 border-t border-[#e3e8ee] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#64748d] block font-semibold uppercase tracking-wider">
              Ambient Air Quality
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {Math.round(outdoorPm25)}
              </span>
              <span className="text-xs text-[#64748d]">µg/m³ PM₂.₅</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#64748d] block font-semibold uppercase tracking-wider">
              Surface Temp & Humidity
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cityProfile.temperatureC}°C
              </span>
              <span className="text-xs text-[#64748d]">· {cityProfile.humidityPct}% RH</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#64748d] block font-semibold uppercase tracking-wider">
              Wind Dispersion
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cityProfile.windSpeedKmh}
              </span>
              <span className="text-xs text-[#64748d]">km/h {cityProfile.windDirection}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#64748d] block font-semibold uppercase tracking-wider">
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
          {/* Pillar 1: Low-Emission Routines Flip Card */}
          <div className="relative perspective-[1000px] w-full min-h-[380px]">
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                flippedCards.routines ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-white border border-[#e3e8ee] hover:border-[#533afd] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between backface-hidden">
                <div className="space-y-3">
                  <span className="text-sm font-extrabold font-tabular text-[#533afd] tracking-wider block">
                    01
                  </span>
                  <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
                    1. Low-Emission Routines
                  </h3>
                  <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Cold night air traps vehicle exhaust within 150m of ground level. ZeroBon shifts school drop-offs, commutes, and workouts into golden solar convective mixing windows.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#e3e8ee] flex items-center justify-between">
                  <button
                    onClick={() => toggleCardFlip('routines')}
                    className="text-xs font-semibold text-[#533afd] hover:underline"
                  >
                    Action Blueprint & Flip
                  </button>
                  <button
                    onClick={onExploreRoutines}
                    className="text-xs font-medium text-[#64748d] hover:text-[#0d253d]"
                  >
                    View Swaps
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
                      Routine Impact Blueprint
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      Solar Dilution Synchronization
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed">
                      Rescheduling high-aerobic activities between 11:30 AM and 3:30 PM avoids the 70% particle accumulation trapped beneath the nocturnal inversion lid.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleCardFlip('routines')}
                      className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all"
                    >
                      Flip Back
                    </button>
                    <button
                      onClick={onExploreRoutines}
                      className="px-4 py-1.5 rounded-full bg-white text-[#0d253d] text-xs font-bold hover:bg-white/90 transition-all shadow-sm"
                    >
                      Explore Routine Swaps
                    </button>
                  </div>
                </GradientBackground>
              </div>
            </div>
          </div>

          {/* Pillar 2: $35 DIY Indoor Sanctuaries Flip Card */}
          <div className="relative perspective-[1000px] w-full min-h-[380px]">
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                flippedCards.hacks ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-white border border-[#e3e8ee] hover:border-[#533afd] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between backface-hidden">
                <div className="space-y-3">
                  <span className="text-sm font-extrabold font-tabular text-[#533afd] tracking-wider block">
                    02
                  </span>
                  <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
                    2. $35 DIY Indoor Sanctuaries
                  </h3>
                  <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Commercial purifiers cost upwards of $400. Build high-performing Corsi-Rosenthal boxes for $35, seal drafty window sashes, and purge kitchen frying soot in minutes.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#e3e8ee] flex items-center justify-between">
                  <button
                    onClick={() => toggleCardFlip('hacks')}
                    className="text-xs font-semibold text-[#533afd] hover:underline"
                  >
                    Action Blueprint & Flip
                  </button>
                  <button
                    onClick={onExploreHacks}
                    className="text-xs font-medium text-[#64748d] hover:text-[#0d253d]"
                  >
                    View Hacks
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
                      Sanctuary Physics
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      Corsi-Rosenthal Box Filtration
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed">
                      Delivers over 350 m³/h Clean Air Delivery Rate (CADR). Four MERV-13 filters and a box fan achieve 85% indoor particulate reduction at 10% commercial cost.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleCardFlip('hacks')}
                      className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all"
                    >
                      Flip Back
                    </button>
                    <button
                      onClick={onExploreHacks}
                      className="px-4 py-1.5 rounded-full bg-white text-[#0d253d] text-xs font-bold hover:bg-white/90 transition-all shadow-sm"
                    >
                      Explore Indoor Hacks
                    </button>
                  </div>
                </GradientBackground>
              </div>
            </div>
          </div>

          {/* Pillar 3: Verifiable Impact Receipts Flip Card */}
          <div className="relative perspective-[1000px] w-full min-h-[380px]">
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                flippedCards.receipts ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-white border border-[#e3e8ee] hover:border-[#533afd] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between backface-hidden">
                <div className="space-y-3">
                  <span className="text-sm font-extrabold font-tabular text-[#533afd] tracking-wider block">
                    03
                  </span>
                  <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
                    3. Verifiable Impact Receipts
                  </h3>
                  <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed">
                    No vague greenwashing. Every routine swap calculates exact inhaled particulate dose prevented (µg PM₂.₅), cigarette equivalents avoided, and avoided emissions.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#e3e8ee] flex items-center justify-between">
                  <button
                    onClick={() => toggleCardFlip('receipts')}
                    className="text-xs font-semibold text-[#533afd] hover:underline"
                  >
                    Action Blueprint & Flip
                  </button>
                  <button
                    onClick={onOpenShare}
                    className="text-xs font-medium text-[#64748d] hover:text-[#0d253d]"
                  >
                    Share Receipt
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
                      Deterministic Receipts
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      Inhaled Dose Differential
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed">
                      Mass-balance differential equations calculate particulate exposure reduction down to microgram precision. Ready for 1-click sharing on WhatsApp and X.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleCardFlip('receipts')}
                      className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all"
                    >
                      Flip Back
                    </button>
                    <button
                      onClick={onOpenShare}
                      className="px-4 py-1.5 rounded-full bg-white text-[#0d253d] text-xs font-bold hover:bg-white/90 transition-all shadow-sm"
                    >
                      Share Verified Receipt
                    </button>
                  </div>
                </GradientBackground>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Atmospheric Telemetry & Smog Simulator Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee]">
          <div>
            <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
              Live Atmospheric Telemetry & Smog Slider
            </h3>
            <p className="font-body-md text-xs text-[#475569] mt-0.5">
              Simulate ambient winter pollution spikes to see how indoor air quality reacts in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetOutdoorPm25(35)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] border border-[#e3e8ee] transition-all"
            >
              Clear Air (35)
            </button>
            <button
              onClick={() => onSetOutdoorPm25(160)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#0d253d] border border-[#e3e8ee] transition-all"
            >
              Haze (160)
            </button>
            <button
              onClick={() => onSetOutdoorPm25(280)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] font-semibold border border-[#e3e8ee] transition-all"
            >
              Winter Smog (280)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <span className="text-xs text-[#64748d] font-semibold block">Simulated Ambient Pollution:</span>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular text-4xl font-extrabold text-[#533afd]">
                {outdoorPm25}
              </span>
              <span className="text-xs text-[#475569]">µg/m³ PM₂.₅</span>
            </div>
            <span className="text-[11px] text-[#64748d]">
              {outdoorPm25 < 60 ? 'Moderate Dispersion' : outdoorPm25 < 150 ? 'Unhealthy Surface Haze' : 'Severe Thermal Inversion Smog'}
            </span>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748d]">
              <span>Slide to simulate severe pollution conditions</span>
              <span className="font-tabular font-bold text-[#0d253d]">{outdoorPm25} µg/m³</span>
            </div>
            <input
              type="range"
              min={25}
              max={380}
              aria-label="Simulate Ambient Smog PM2.5 Level"
              value={outdoorPm25}
              onChange={(e) => onSetOutdoorPm25(Number(e.target.value))}
              className="w-full accent-[#533afd] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#64748d]">
              <span>Clean Day (25 µg/m³)</span>
              <span>Moderate (100 µg/m³)</span>
              <span>Emergency Peak (380 µg/m³)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
