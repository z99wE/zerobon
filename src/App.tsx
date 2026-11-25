import React, { useState, useEffect } from 'react';
import { Navbar, D2CTab } from './components/Navbar';
import { GradientMesh } from './components/GradientMesh';
import { DailyRoutineOptimizer } from './components/DailyRoutineOptimizer';
import { IndoorAirHacks } from './components/IndoorAirHacks';
import { InversionRadar } from './components/InversionRadar';
import { HardenedCopilot } from './components/HardenedCopilot';
import { LandingHero } from './components/LandingHero';
import { BreathReceiptModal } from './components/BreathReceiptModal';
import { SocialShareModal } from './components/SocialShareModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SanctuaryCalibrationModal } from './components/SanctuaryCalibrationModal';
import { SafeRecessPassModal } from './components/SafeRecessPassModal';
import GhostFibers from './components/ui/GhostFibers';
import { stepAnalytical, computeBreathReceipt } from './engine/physics';
import { getCityProfile } from './engine/city-data';
import { 
  loadSanctuaryProfile, 
  SanctuaryProfile, 
  calculateCalibratedPhysics
} from './engine/sanctuary-engine';
import { fetchLiveAirQuality, LiveAirReading } from './engine/live-air-service';
import { BreathReceipt } from './types';
import { 
  Share2, 
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<D2CTab>('overview');
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');

  // Dynamic City Weather & Air Profile
  const cityProfile = getCityProfile(selectedCity);

  // Personalized Sanctuary Profile (Stored in localStorage)
  const [sanctuaryProfile, setSanctuaryProfile] = useState<SanctuaryProfile>(() => loadSanctuaryProfile());
  const [showSanctuaryModal, setShowSanctuaryModal] = useState<boolean>(false);
  const [showRecessModal, setShowRecessModal] = useState<boolean>(false);

  // Live Atmospheric Station Sync
  const [liveReading, setLiveReading] = useState<LiveAirReading | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);

  // Ambient & Indoor Physics State
  const [outdoorPm25, setOutdoorPm25] = useState<number>(cityProfile.baselinePm25);
  const [indoorPm25, setIndoorPm25] = useState<number>(Math.round(cityProfile.baselinePm25 * 0.55));

  // Sync outdoor PM2.5 when user switches city
  useEffect(() => {
    setLiveReading(null);
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

  // Real-time Physics Differential Loop (Analytical Mass-Balance modulated by Sanctuary Envelope)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndoorPm25((prevCin) => {
        const { calibratedParams, effectiveOutdoorPm25 } = calculateCalibratedPhysics(
          sanctuaryProfile,
          outdoorPm25,
          activeHacks
        );

        const step = stepAnalytical(prevCin, effectiveOutdoorPm25, 0.04, calibratedParams);
        const nextVal = Math.round(step.cin * 10) / 10;
        return nextVal === prevCin ? prevCin : nextVal;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [outdoorPm25, activeHacks, sanctuaryProfile]);

  const handleSyncLiveAir = async () => {
    setIsLiveSyncing(true);
    try {
      const reading = await fetchLiveAirQuality(selectedCity);
      setLiveReading(reading);
      if (reading.isLive) {
        setOutdoorPm25(reading.pm25);
      }
    } finally {
      setIsLiveSyncing(false);
    }
  };

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

  const handleNavigateTab = (tab: D2CTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="relative min-h-screen bg-white text-[#0d253d] flex flex-col font-sans selection:bg-[#533afd]/20 selection:text-[#533afd] group/skin">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#533afd] text-white rounded-full text-xs font-medium shadow-lg outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      {/* Atmospheric Gradient Mesh Upper Third */}
      <GradientMesh />

      {/* Ambient Branded Morphism GhostFibers Skin in Negative Space */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25 group-hover/skin:opacity-60 transition-opacity duration-700 ease-out"
      >
        <GhostFibers
          glowColor="#533afd"
          lineColor="#b9b9f9"
          secondaryColor="#ea2261"
          layers={3}
          twist={1.2}
          threads={64}
          fiberStyle="dots"
          depthOfField={0.8}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
          lightMode={true}
          brightness={0.85}
          glow={0.6}
          speed={0.35}
          className="w-full h-full"
        />
      </div>

      {/* Subtle Negative Space Glassmorphism Glow Highlights in Brand Colors */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(83,58,253,0.05),rgba(234,34,97,0.025),transparent_70%)] group-hover/skin:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(83,58,253,0.08),rgba(234,34,97,0.04),transparent_70%)] transition-all duration-700"
      />

      {/* D2C Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        outdoorPm25={outdoorPm25}
        temperatureC={cityProfile.temperatureC}
        onOpenShare={() => setShowShareModal(true)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenSanctuaryCalibration={() => setShowSanctuaryModal(true)}
        onOpenRecessPass={() => setShowRecessModal(true)}
        onSyncLiveAir={handleSyncLiveAir}
        isLiveSyncing={isLiveSyncing}
        isLiveReading={Boolean(liveReading?.isLive)}
        sanctuaryZoneName={sanctuaryProfile.isCustomized ? sanctuaryProfile.customZoneName : 'Home'}
      />

      {/* Main Content Surface - Displays Tab Directly Without Scrolling Friction */}
      <main 
        id="main-content" 
        tabIndex={-1} 
        className="relative z-10 flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-6 pb-20 outline-none space-y-10"
      >
        {/* Tab 0: World-Class D2C Overview Landing Page */}
        {activeTab === 'overview' && (
          <ErrorBoundary>
            <LandingHero
              selectedCity={selectedCity}
              cityProfile={cityProfile}
              outdoorPm25={outdoorPm25}
              onSetOutdoorPm25={setOutdoorPm25}
              onExploreRoutines={() => handleNavigateTab('routines')}
              onExploreHacks={() => handleNavigateTab('hacks')}
              onOpenAssistant={() => handleNavigateTab('copilot')}
              onOpenShare={() => setShowShareModal(true)}
              onOpenSanctuaryCalibration={() => setShowSanctuaryModal(true)}
              onOpenRecessPass={() => setShowRecessModal(true)}
              onSyncLiveAir={handleSyncLiveAir}
              isLiveSyncing={isLiveSyncing}
              isLiveReading={Boolean(liveReading?.isLive)}
              sanctuaryBadgeText={sanctuaryProfile.isCustomized ? sanctuaryProfile.customZoneName : 'Home'}
              indoorPm25={indoorPm25}
            />
          </ErrorBoundary>
        )}

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

      {/* High-End Branded Versioned Footer with Prominent Community CTA Banner & Top Gradient Ribbon Match */}
      <footer className="w-full bg-[#f6f9fc] border-t-2 border-[#533afd]/20 pt-16 text-[#64748d] text-xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12 pb-14">
          {/* Prominent Footer Hero Call-to-Action (CTA) Entity */}
          <div className="w-full rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#0d253d] via-[#1a123f] to-[#533afd] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-[11px] font-semibold backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#533afd] ring-2 ring-white/60 animate-pulse" />
                <span>ZeroBon Community Clean Air Initiative</span>
              </div>
              <h3 className="font-heading-lg text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Ready to protect your home and neighborhood?
              </h3>
              <p className="font-body-md text-sm text-white/80 leading-relaxed">
                Join thousands of families shifting routines into clean air windows, building $35 DIY cleansers, and sharing verifiable breath receipts. Make clean air accessible to all.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleNavigateTab('routines')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#0d253d] text-xs font-bold hover:bg-white/90 transition-all shadow-md focus:ring-2 focus:ring-white"
              >
                <span>Adopt First Routine</span>
                <ArrowRight className="w-4 h-4 text-[#533afd]" />
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm focus:ring-2 focus:ring-white"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Clean Air Impact</span>
              </button>
            </div>

            {/* Subtle background glow effect */}
            <div 
              aria-hidden="true" 
              className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#533afd]/30 blur-3xl pointer-events-none" 
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#e3e8ee]">
            {/* Brand Logo & Mission */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#0d253d] font-bold text-xl tracking-tight">ZeroBon</span>
              </div>
              <p className="font-body-md text-xs text-[#475569] max-w-md leading-relaxed">
                Empowering households, schools, and communities with physics-verified winter smog routines, DIY air cleansers, and live atmospheric guidance.
              </p>
            </div>

            {/* Quick Actions & Navigation */}
            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => handleNavigateTab('overview')}
                className="text-[#0d253d] hover:text-[#533afd] font-semibold transition-colors"
              >
                Overview
              </button>
              <button
                onClick={() => handleNavigateTab('routines')}
                className="text-[#0d253d] hover:text-[#533afd] font-semibold transition-colors"
              >
                Routines
              </button>
              <button
                onClick={() => handleNavigateTab('hacks')}
                className="text-[#0d253d] hover:text-[#533afd] font-semibold transition-colors"
              >
                Indoor Hacks
              </button>
              <button
                onClick={() => handleNavigateTab('radar')}
                className="text-[#0d253d] hover:text-[#533afd] font-semibold transition-colors"
              >
                Air Forecast
              </button>
              <button
                onClick={() => handleNavigateTab('copilot')}
                className="text-[#0d253d] hover:text-[#533afd] font-semibold transition-colors"
              >
                AI Assistant
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-semibold transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Impact</span>
              </button>
            </div>
          </div>

          {/* Lower Footer: Microclimate City Status & Attribution */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-[11px] text-[#64748d]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#533afd] animate-pulse" />
              <span>Active City Microclimate:</span>
              <span className="font-semibold text-[#0d253d]">{selectedCity}</span>
              <span className="text-[#a8c3de]">•</span>
              <span>Clean Window: {cityProfile.cleanWindowHours}</span>
            </div>

            <div className="flex items-center gap-4">
              <span>Physics Mass-Balance Engine</span>
              <span className="text-[#e3e8ee]">•</span>
              <span>Zero-Hallucination Health Ledger</span>
            </div>
          </div>
        </div>

        {/* Seamless Ambient Mesh Gradient Mirroring Top Header */}
        <div className="relative w-full h-16 sm:h-20 overflow-hidden pointer-events-none select-none">
          <svg
            className="absolute inset-0 w-full h-full opacity-65 mix-blend-multiply"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <g filter="url(#stripe-blur-footer)">
              <path
                d="M-100 20C200 80 480 10 720 70C960 120 1240 30 1540 80V140H-100V20Z"
                fill="url(#footer-grad-1)"
              />
              <path
                d="M-50 40C260 10 540 80 840 30C1140 90 1380 20 1600 60V140H-50V40Z"
                fill="url(#footer-grad-2)"
                opacity="0.8"
              />
            </g>
            <defs>
              <filter id="stripe-blur-footer" x="-100" y="-100" width="1700" height="350" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="35" />
              </filter>
              <linearGradient id="footer-grad-1" x1="-100" y1="20" x2="1540" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#533afd" stopOpacity="0.7" />
                <stop offset="35%" stopColor="#b9b9f9" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#f5e9d4" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ea2261" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="footer-grad-2" x1="1600" y1="100" x2="-50" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ea2261" stopOpacity="0.5" />
                <stop offset="40%" stopColor="#f5e9d4" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#b9b9f9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#533afd" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
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

      {/* Retention Moat: Personal Home Sanctuary Calibration Modal */}
      {showSanctuaryModal && (
        <SanctuaryCalibrationModal
          currentProfile={sanctuaryProfile}
          outdoorPm25={outdoorPm25}
          onSave={(updated) => setSanctuaryProfile(updated)}
          onClose={() => setShowSanctuaryModal(false)}
        />
      )}

      {/* Institutional Moat: Safe Recess Pass Printable Certificate Modal */}
      {showRecessModal && (
        <SafeRecessPassModal
          cityName={selectedCity}
          outdoorPm25={outdoorPm25}
          onClose={() => setShowRecessModal(false)}
        />
      )}
    </div>
  );
};
