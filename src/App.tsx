import React, { useState, useEffect } from 'react';
import { Navbar, D2CTab } from './components/Navbar';
import { GradientMesh } from './components/GradientMesh';
import { DailyRoutineOptimizer } from './components/DailyRoutineOptimizer';
import { IndoorAirHacks } from './components/IndoorAirHacks';
import { InversionRadar } from './components/InversionRadar';
import { HardenedCopilot } from './components/HardenedCopilot';
import { GlyphStream } from './components/GlyphStream';
import { BreathReceiptModal } from './components/BreathReceiptModal';
import { SocialShareModal } from './components/SocialShareModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DEFAULT_PHYSICS_PARAMS, stepAnalytical, computeBreathReceipt } from './engine/physics';
import { getCityProfile } from './engine/city-data';
import { BreathReceipt, MassBalanceParams } from './types';
import { 
  Wind, 
  Sun, 
  Share2, 
  ArrowRight,
  MapPin,
  Sliders
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<D2CTab>('routines');
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');

  // Dynamic City Weather & Air Profile
  const cityProfile = getCityProfile(selectedCity);

  // Ambient & Indoor Physics State
  const [outdoorPm25, setOutdoorPm25] = useState<number>(cityProfile.baselinePm25);
  const [indoorPm25, setIndoorPm25] = useState<number>(Math.round(cityProfile.baselinePm25 * 0.55));

  // Sync outdoor PM2.5 when user switches city
  useEffect(() => {
    setOutdoorPm25(cityProfile.baselinePm25);
    setIndoorPm25(Math.round(cityProfile.baselinePm25 * 0.55));
  }, [cityProfile.name, cityProfile.baselinePm25]);

  // Active IAQ Hacks
  const [activeHacks, setActiveHacks] = useState({
    corsiRosenthal: false,
    kitchenExhaust: false,
    draftSealing: false,
    windowOpen: false,
  });

  // Modals state
  const [activeReceipt, setActiveReceipt] = useState<BreathReceipt | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Real-time Physics Differential Loop (Analytical Mass-Balance)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndoorPm25((prevCin) => {
        const currentParams: MassBalanceParams = {
          ...DEFAULT_PHYSICS_PARAMS,
          p_penetration: activeHacks.draftSealing ? 0.38 : 0.82,
          lambda_ach: activeHacks.windowOpen ? 3.5 : activeHacks.kitchenExhaust ? 1.8 : 0.65,
          q_cadr: activeHacks.corsiRosenthal ? 360.0 : 0.0,
        };

        const step = stepAnalytical(prevCin, outdoorPm25, 0.04, currentParams);
        return Math.round(step.cin * 10) / 10;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [outdoorPm25, activeHacks]);

  const handleToggleHack = (key: 'corsiRosenthal' | 'kitchenExhaust' | 'draftSealing' | 'windowOpen') => {
    setActiveHacks((prev) => {
      const nextVal = !prev[key];
      const nextHacks = { ...prev, [key]: nextVal };

      if (nextVal) {
        const titleMap = {
          corsiRosenthal: 'DIY Corsi-Rosenthal Air Cleanser',
          kitchenExhaust: 'High-Velocity Kitchen Range Hood Flush',
          draftSealing: 'Magnetic Window Sash & Sill Draft Sealing',
          windowOpen: 'Midday Inversion Window Clean Air Flush',
        };

        const receipt = computeBreathReceipt(
          selectedCity,
          titleMap[key],
          {
            concentration_ug_m3: Math.max(15, indoorPm25 * 0.4),
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
          key === 'corsiRosenthal' ? 'corsi_rosenthal' : 'window_airing'
        );

        setActiveReceipt(receipt);
      }

      return nextHacks;
    });
  };

  // Generic receipt for sharing from top CTA if no receipt currently open
  const defaultShareReceipt: BreathReceipt = activeReceipt ?? {
    receiptId: 'ZB-COMMUNITY-LIVE',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    tenantName: selectedCity,
    actionTitle: 'Clean Air Routine & Sanctuary Swaps',
    inhaledDoseUg: 24,
    counterfactualDoseUg: 112,
    doseSavedUg: 88,
    cigaretteEquivalentsSaved: 4.0,
    co2eAvoidedGrams: 2850,
    noxAvoidedGrams: 18.2,
    primaryPm25AvoidedGrams: 1.4,
    neighborhoodMultiplier: 3.2,
  };

  return (
    <div className="relative min-h-screen bg-white text-[#0d253d] flex flex-col font-sans selection:bg-[#533afd]/20 selection:text-[#533afd]">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#533afd] text-white rounded-full text-xs font-medium shadow-lg outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      {/* Subtle Liquid Branded Glyph Stream Cursor Interaction */}
      <GlyphStream />

      {/* Atmospheric Gradient Mesh Upper Third */}
      <GradientMesh />

      {/* D2C Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        outdoorPm25={outdoorPm25}
        temperatureC={cityProfile.temperatureC}
        onOpenShare={() => setShowShareModal(true)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {/* D2C Hero Section - Crisp, Modern, De-slopped */}
      <section 
        aria-label="Hero Section"
        className="relative z-10 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-10 pb-10 text-left"
      >
        <div className="max-w-3xl">
          {/* Söhne Thin Display Headline */}
          <h1 className="font-display-xxl text-[#0d253d] mb-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            Protect your family and community from severe winter smog.
          </h1>

          <p className="font-body-lg text-[#475569] max-w-2xl text-base sm:text-lg leading-relaxed mb-6 font-light">
            Simple daily routine swaps, DIY indoor air quality hacks, and sustainable lifestyle alternatives tailored to {selectedCity}. See the exact lung dose you protect and emissions you prevent.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('routines')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-sm font-medium transition-all shadow-md focus:ring-2 focus:ring-[#533afd] focus:outline-none"
            >
              <span>Explore Daily Routines</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('hacks')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#f6f9fc] text-[#0d253d] text-sm font-medium transition-all border border-[#e3e8ee] shadow-sm focus:ring-2 focus:ring-[#533afd] focus:outline-none"
            >
              <span>Try Indoor Hacks</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] text-[#533afd] text-sm font-medium transition-all border border-[#e3e8ee] focus:ring-2 focus:ring-[#533afd] focus:outline-none"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Impact</span>
            </button>
          </div>
        </div>

        {/* Brand-Aligned Atmospheric Telemetry Deck - No Ugly Red/Green Slop */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Local Weather & Microclimate */}
          <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#64748d]">
                  Weather & Atmosphere
                </span>
                <span className="flex items-center gap-1 text-xs text-[#533afd] font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedCity}</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-tabular text-3xl font-semibold text-[#0d253d]">
                  {cityProfile.temperatureC}°C
                </span>
                <span className="text-xs text-[#64748d]">
                  {cityProfile.humidityPct}% Humidity
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#475569] mt-3 pt-3 border-t border-[#e3e8ee]">
              <Wind className="w-3.5 h-3.5 text-[#533afd]" />
              <span>Wind: {cityProfile.windSpeedKmh} km/h {cityProfile.windDirection}</span>
            </div>
          </div>

          {/* Card 2: Air Quality & Clean Air Hours */}
          <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#64748d]">
                  Air Quality Level
                </span>
                <span className="text-xs font-medium text-[#533afd]">
                  {outdoorPm25 < 60 ? 'Moderate' : outdoorPm25 < 150 ? 'Unhealthy' : 'Severe Winter Smog'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-tabular text-3xl font-semibold text-[#0d253d]">
                  {Math.round(outdoorPm25)}
                </span>
                <span className="text-xs text-[#64748d]">µg/m³ PM₂.₅</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0d253d] font-medium mt-3 pt-3 border-t border-[#e3e8ee]">
              <Sun className="w-3.5 h-3.5 text-[#533afd]" />
              <span>Clean Air Hours: {cityProfile.cleanWindowHours}</span>
            </div>
          </div>

          {/* Card 3: Interactive Smog Simulator */}
          <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="smog-slider" className="text-xs font-semibold text-[#64748d] flex items-center gap-1.5 cursor-pointer">
                  <Sliders className="w-3.5 h-3.5 text-[#533afd]" />
                  <span>Simulate Smog Event</span>
                </label>
                <span className="font-tabular text-xs font-bold text-[#533afd]">
                  {outdoorPm25} µg/m³
                </span>
              </div>
              <input
                id="smog-slider"
                type="range"
                min={25}
                max={380}
                aria-label="Simulate Ambient Smog PM2.5 Level"
                aria-valuemin={25}
                aria-valuemax={380}
                aria-valuenow={outdoorPm25}
                aria-valuetext={`${outdoorPm25} micrograms per cubic meter`}
                value={outdoorPm25}
                onChange={(e) => setOutdoorPm25(Number(e.target.value))}
                className="w-full accent-[#533afd] cursor-pointer mt-1"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#64748d] mt-3 pt-3 border-t border-[#e3e8ee]">
              <button 
                onClick={() => setOutdoorPm25(35)}
                className="hover:text-[#533afd] transition-colors"
              >
                Clear (35)
              </button>
              <button 
                onClick={() => setOutdoorPm25(160)}
                className="hover:text-[#533afd] transition-colors"
              >
                Haze (160)
              </button>
              <button 
                onClick={() => setOutdoorPm25(280)}
                className="hover:text-[#533afd] transition-colors"
              >
                Winter Smog (280)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Surface */}
      <main 
        id="main-content" 
        tabIndex={-1} 
        className="relative z-10 flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pb-20 outline-none space-y-10"
      >
        {/* Tab 1: Daily Routine Optimizer */}
        {activeTab === 'routines' && (
          <ErrorBoundary>
            <DailyRoutineOptimizer
              outdoorPm25={outdoorPm25}
              selectedCity={selectedCity}
              cleanWindowHours={cityProfile.cleanWindowHours}
              onCommitReceipt={(receipt) => setActiveReceipt(receipt)}
              onTriggerShare={() => setShowShareModal(true)}
            />
          </ErrorBoundary>
        )}

        {/* Tab 2: Indoor Air Quality Hacks */}
        {activeTab === 'hacks' && (
          <ErrorBoundary>
            <IndoorAirHacks
              indoorPm25={indoorPm25}
              outdoorPm25={outdoorPm25}
              activeHacks={activeHacks}
              onToggleHack={handleToggleHack}
              onGenerateReceipt={(receipt) => setActiveReceipt(receipt)}
              onTriggerShare={() => setShowShareModal(true)}
              cityName={selectedCity}
            />
          </ErrorBoundary>
        )}

        {/* Tab 3: Smog & Inversion Radar */}
        {activeTab === 'radar' && (
          <ErrorBoundary>
            <InversionRadar />
          </ErrorBoundary>
        )}

        {/* Tab 4: GenAI Clean Air Assistant */}
        {activeTab === 'copilot' && (
          <ErrorBoundary>
            <HardenedCopilot 
              indoorPm25={indoorPm25} 
              outdoorPm25={outdoorPm25} 
              city={selectedCity} 
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Consumer D2C Footer */}
      <footer className="w-full bg-[#f6f9fc] border-t border-[#e3e8ee] py-12 text-[#64748d] text-xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#533afd] flex items-center justify-center text-white text-[10px] font-bold">
              ZB
            </div>
            <span className="text-[#0d253d] font-semibold">ZeroBon</span>
            <span className="hidden sm:inline text-[#e3e8ee]">•</span>
            <span>Winter Smog & Urban Clean Air Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 text-[#533afd] font-medium hover:underline"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Clean Air Impact</span>
            </button>
            <span className="text-[#e3e8ee]">•</span>
            <span className="text-[#475569]">
              Physics-Informed Health Ledger
            </span>
          </div>
        </div>
      </footer>

      {/* Breath Receipt Modal */}
      {activeReceipt && (
        <BreathReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Standalone Social Share Modal */}
      {showShareModal && (
        <SocialShareModal
          receipt={defaultShareReceipt}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
