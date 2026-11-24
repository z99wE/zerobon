import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sun, 
  MapPin, 
  HeartHandshake, 
  Share2 
} from 'lucide-react';
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
  return (
    <section aria-label="ZeroBon Clean Air Landing" className="w-full space-y-12">
      {/* 1. Flagship Hero Element with Noisy Gradient Background & Big CTA */}
      <div className="relative w-full rounded-3xl sm:rounded-[36px] overflow-hidden border border-[#533afd]/30 shadow-2xl">
        <GradientBackground
          gradientOrigin="bottom-middle"
          noiseIntensity={0.85}
          noisePatternSize={90}
          noisePatternRefreshInterval={2}
          className="w-full min-h-[580px] sm:min-h-[620px] p-6 sm:p-12 lg:p-16 flex flex-col justify-between text-white"
        >
          {/* Top Pill & Live Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/15">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#533afd] ring-4 ring-white/50 animate-pulse" />
              <span>Winter Smog Defense • Built for Families & Communities</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/90">
              <MapPin className="w-4 h-4 text-white" />
              <span className="font-semibold">{selectedCity}</span>
              <span className="text-white/40">•</span>
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full font-tabular text-[11px]">
                {cityProfile.cleanWindowHours} Clean Air Window
              </span>
            </div>
          </div>

          {/* Central Hero Headline & Value Proposition */}
          <div className="max-w-3xl my-8 sm:my-10 space-y-5 text-left">
            <h1 className="font-display-xxl text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.12]">
              Navigate severe winter smog with <span className="font-semibold text-white underline decoration-[#533afd] decoration-4 underline-offset-8">physics-verified</span> routines & hacks.
            </h1>

            <p className="font-body-lg text-sm sm:text-lg text-white/85 leading-relaxed max-w-2xl font-normal">
              A GenAI-powered assistant designed for households and neighborhoods. Shift high-emission routines, deploy $35 DIY clean sanctuaries, and calculate the exact breath-dose you protect for your loved ones.
            </p>

            {/* BIG CALL TO ACTION (CTA) BUTTONS */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onExploreRoutines}
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-[#0d253d] text-base font-bold hover:bg-[#f6f9fc] hover:shadow-xl transition-all shadow-lg focus:ring-4 focus:ring-white/40 focus:outline-none"
              >
                <span>Adopt Low-Emission Routines</span>
                <ArrowRight className="w-5 h-5 text-[#533afd] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreHacks}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white text-base font-semibold border border-white/25 backdrop-blur-md transition-all focus:ring-4 focus:ring-white/30 focus:outline-none"
              >
                <span>Explore $35 Indoor Hacks</span>
              </button>

              <button
                onClick={onOpenAssistant}
                className="flex items-center justify-center gap-2 px-5 py-4 rounded-full bg-black/20 hover:bg-black/35 text-white/90 text-sm font-medium border border-white/15 backdrop-blur-md transition-all"
              >
                <span>Ask AI Copilot</span>
              </button>
            </div>
          </div>

          {/* Bottom Live Microclimate Stats Bar inside Hero */}
          <div className="pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">
                Ambient Air Quality
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-tabular text-2xl font-bold text-white">
                  {Math.round(outdoorPm25)}
                </span>
                <span className="text-xs text-white/70">µg/m³ PM₂.₅</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">
                Surface Temp & Humidity
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-tabular text-2xl font-bold text-white">
                  {cityProfile.temperatureC}°C
                </span>
                <span className="text-xs text-white/70">· {cityProfile.humidityPct}% RH</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">
                Wind Dispersion
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-tabular text-2xl font-bold text-white">
                  {cityProfile.windSpeedKmh}
                </span>
                <span className="text-xs text-white/70">km/h {cityProfile.windDirection}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">
                Atmospheric State
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-tabular text-base font-semibold text-white truncate">
                  {outdoorPm25 > 160 ? 'Thermal Inversion Cap' : 'Active Boundary Layer'}
                </span>
              </div>
            </div>
          </div>
        </GradientBackground>
      </div>

      {/* 2. Problem Statement Alignment Pillars (The 3 Core Challenges of Winter Smog) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#533afd] bg-[#533afd]/10 px-3 py-1 rounded-full">
            Tailored Solution Architecture
          </span>
          <h2 className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d] font-bold">
            How ZeroBon Solves Urban Winter Pollution
          </h2>
          <p className="font-body-md text-sm text-[#475569]">
            Winter smog is not just bad air—it is trapped cold air holding ground emissions at nose level. Here is how our GenAI assistant helps you take back control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Low-Emission Daily Routines */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-sm transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#533afd]/10 text-[#533afd] flex items-center justify-center font-bold">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
                1. Low-Emission Routines
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed">
                Cold night air traps vehicle exhaust within 150m of ground level. ZeroBon shifts school drop-offs, commutes, and workouts into golden solar convective mixing windows.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e3e8ee]">
              <button
                onClick={onExploreRoutines}
                className="text-xs font-bold text-[#533afd] flex items-center gap-1.5 hover:underline"
              >
                <span>View Routine Swaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pillar 2: DIY Indoor Air Sanctuaries */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-sm transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#533afd]/10 text-[#533afd] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
                2. $35 DIY Indoor Sanctuaries
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed">
                Commercial HEPA units cost upwards of $400. Build high-CADR Corsi-Rosenthal boxes for $35, seal drafty window sashes, and purge kitchen frying soot in minutes.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e3e8ee]">
              <button
                onClick={onExploreHacks}
                className="text-xs font-bold text-[#533afd] flex items-center gap-1.5 hover:underline"
              >
                <span>Explore Indoor Hacks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pillar 3: Deterministic Impact Receipts */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-sm transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#533afd]/10 text-[#533afd] flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
                3. Verifiable Impact Receipts
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-[#475569] leading-relaxed">
                No vague greenwashing. Every routine swap calculates exact inhaled particulate dose prevented (µg PM₂.₅), cigarette equivalents avoided, and avoided emissions.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e3e8ee]">
              <button
                onClick={onOpenShare}
                className="text-xs font-bold text-[#533afd] flex items-center gap-1.5 hover:underline"
              >
                <span>Share Verified Receipt</span>
                <Share2 className="w-3.5 h-3.5" />
              </button>
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
