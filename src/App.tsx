import React, { useState, useEffect } from 'react';
import { Navbar, D2CTab, LOCATIONS } from './components/Navbar';
import { GradientMesh } from './components/GradientMesh';
import { DailyRoutineOptimizer } from './components/DailyRoutineOptimizer';
import { IndoorAirHacks } from './components/IndoorAirHacks';
import { InversionRadar } from './components/InversionRadar';
import { HardenedCopilot } from './components/HardenedCopilot';
import { OpticalHazeEstimator } from './components/OpticalHazeEstimator';
import { BreathReceiptModal } from './components/BreathReceiptModal';
import { SocialShareModal } from './components/SocialShareModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DEFAULT_PHYSICS_PARAMS, stepAnalytical, computeBreathReceipt } from './engine/physics';
import { BreathReceipt, MassBalanceParams } from './types';
import { 
  Wind, 
  Sun, 
  Share2, 
  ArrowRight,
  MapPin
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<D2CTab>('routines');
  const [selectedLocation, setSelectedLocation] = useState<string>(LOCATIONS[0] ?? 'Delhi NCR (Anand Vihar)');

  // Ambient & Indoor Physics State
  const [outdoorPm25, setOutdoorPm25] = useState<number>(245);
  const [indoorPm25, setIndoorPm25] = useState<number>(135);

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
          corsiRosenthal: 'DIY Corsi-Rosenthal Air Cleanser (+360 CADR)',
          kitchenExhaust: 'High-Velocity Kitchen Range Hood Flush',
          draftSealing: 'Magnetic Window Sash & Sill Draft Sealing',
          windowOpen: 'Midday Inversion Window Clean Air Flush',
        };

        const receipt = computeBreathReceipt(
          selectedLocation,
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
    tenantName: selectedLocation,
    actionTitle: 'Inversion-Aware Routine & Indoor Defense Swaps',
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

      {/* Atmospheric Gradient Mesh Upper Third */}
      <GradientMesh />

      {/* D2C Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        outdoorPm25={outdoorPm25}
        onOpenShare={() => setShowShareModal(true)}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
      />

      {/* D2C Hero Section */}
      <section 
        aria-label="Hero Section"
        className="relative z-10 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-10 pb-10 text-left"
      >
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#e3e8ee] shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-[#533afd] animate-pulse" />
            <span className="text-xs font-medium text-[#533afd]">
              GenAI Clean Air Assistant • Winter Smog Defense
            </span>
          </div>

          {/* Söhne Thin Display Headline */}
          <h1 className="font-display-xxl text-[#0d253d] mb-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            Protect your family and community from severe winter smog.
          </h1>

          <p className="font-body-lg text-[#273951] max-w-2xl text-base sm:text-lg leading-relaxed mb-6 font-light">
            Actionable low-emission daily routines, DIY indoor air quality hacks, and sustainable lifestyle alternatives tailored to your location. Backed by verified receipts that prove the exact lung dose you protect and emissions you prevent.
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

        {/* Live Weather & Atmospheric Smog Control Banner */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weather Status Card */}
          <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#e3e8ee] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#64748d] uppercase tracking-wider">
                Current Weather & Wind
              </span>
              <span className="flex items-center gap-1 text-xs text-[#533afd] font-medium">
                <MapPin className="w-3 h-3" />
                <span>{selectedLocation.split(' ')[0]}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular text-3xl font-semibold text-[#0d253d]">14°C</span>
              <span className="text-xs text-[#475569]">Light Fog • 68% Humidity</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748d] mt-2">
              <Wind className="w-3.5 h-3.5 text-[#533afd]" />
              <span>Wind: 3.8 km/h NW (Stagnant Dispersion)</span>
            </div>
          </div>

          {/* Thermal Inversion Status */}
          <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#e3e8ee] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#ea2261] uppercase tracking-wider">
                Boundary Layer Inversion
              </span>
              <span className="w-2 h-2 rounded-full bg-[#ea2261] animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular text-3xl font-semibold text-[#ea2261]">
                {Math.round(outdoorPm25)}
              </span>
              <span className="text-xs text-[#ea2261] font-medium">µg/m³ PM₂.₅ (Severe)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#128c7e] font-medium mt-2">
              <Sun className="w-3.5 h-3.5" />
              <span>Golden Window: 11:30 AM – 3:30 PM</span>
            </div>
          </div>

          {/* Interactive Ambient Smog Simulator Slider */}
          <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#e3e8ee] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="smog-slider" className="text-[11px] font-semibold text-[#64748d] uppercase tracking-wider">
                Simulate Smog Level
              </label>
              <span className="font-tabular text-xs font-bold text-[#0d253d]">
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
              className="w-full accent-[#533afd] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#64748d] mt-1">
              <button 
                onClick={() => setOutdoorPm25(35)}
                className="hover:text-[#533afd] underline"
              >
                Clear (35)
              </button>
              <button 
                onClick={() => setOutdoorPm25(245)}
                className="hover:text-[#533afd] underline"
              >
                Winter Smog (245)
              </button>
              <button 
                onClick={() => setOutdoorPm25(360)}
                className="hover:text-[#ea2261] underline"
              >
                Emergency (360)
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
              selectedLocation={selectedLocation}
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
              locationName={selectedLocation}
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
            <HardenedCopilot indoorPm25={indoorPm25} outdoorPm25={outdoorPm25} />
          </ErrorBoundary>
        )}

        {/* Tab 5: Sky Scanner */}
        {activeTab === 'scanner' && (
          <ErrorBoundary>
            <OpticalHazeEstimator onApplyEstimatedOutdoorPm25={(pm) => setOutdoorPm25(pm)} />
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
            <span className="hidden sm:inline text-[#a8c3de]">•</span>
            <span>GenAI Winter Smog & Urban Clean Air Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 text-[#533afd] font-medium hover:underline"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Clean Air Impact</span>
            </button>
            <span className="text-[#a8c3de]">•</span>
            <span className="text-[#475569]">
              Deterministic IPCC Physics Solver
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
