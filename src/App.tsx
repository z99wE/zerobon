import React, { lazy, Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar, D2CTab } from './components/Navbar';
import { GradientMesh } from './components/GradientMesh';
import { LandingHero } from './components/LandingHero';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import GhostFibers from './components/ui/GhostFibers';

const DailyRoutineOptimizer = lazy(() =>
  import('./components/DailyRoutineOptimizer').then((m) => ({ default: m.DailyRoutineOptimizer }))
);
const IndoorAirHacks = lazy(() =>
  import('./components/IndoorAirHacks').then((m) => ({ default: m.IndoorAirHacks }))
);
const InversionRadar = lazy(() =>
  import('./components/InversionRadar').then((m) => ({ default: m.InversionRadar }))
);
const HardenedCopilot = lazy(() =>
  import('./components/HardenedCopilot').then((m) => ({ default: m.HardenedCopilot }))
);
const BreathReceiptModal = lazy(() =>
  import('./components/BreathReceiptModal').then((m) => ({ default: m.BreathReceiptModal }))
);
const SocialShareModal = lazy(() =>
  import('./components/SocialShareModal').then((m) => ({ default: m.SocialShareModal }))
);
const SanctuaryCalibrationModal = lazy(() =>
  import('./components/SanctuaryCalibrationModal').then((m) => ({ default: m.SanctuaryCalibrationModal }))
);
const SafeRecessPassModal = lazy(() =>
  import('./components/SafeRecessPassModal').then((m) => ({ default: m.SafeRecessPassModal }))
);
import { stepAnalytical, computeBreathReceipt } from './engine/physics';
import { getCityProfile } from './engine/city-data';
import { 
  loadSanctuaryProfile, 
  SanctuaryProfile, 
  calculateCalibratedPhysics
} from './engine/sanctuary-engine';
import { useLiveAirSync } from './hooks/useLiveAirSync';
import { FEATURE_FLAGS } from './config/feature-flags';
import { BreathReceipt } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<D2CTab>('overview');
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');

  // Dynamic City Weather & Air Profile
  const cityProfile = getCityProfile(selectedCity);

  // Personalized Sanctuary Profile (Stored in localStorage)
  const [sanctuaryProfile, setSanctuaryProfile] = useState<SanctuaryProfile>(() => loadSanctuaryProfile());
  const [showSanctuaryModal, setShowSanctuaryModal] = useState<boolean>(false);
  const [showRecessModal, setShowRecessModal] = useState<boolean>(false);

  // Live Atmospheric Station Sync & Outdoor PM2.5
  const {
    liveReading,
    isLiveSyncing,
    outdoorPm25,
    setOutdoorPm25,
    syncLiveAir: handleSyncLiveAir,
  } = useLiveAirSync(selectedCity, cityProfile.baselinePm25);

  const [indoorPm25, setIndoorPm25] = useState<number>(Math.round(cityProfile.baselinePm25 * 0.55));

  useEffect(() => {
    setIndoorPm25(Math.round(cityProfile.baselinePm25 * 0.55));
  }, [cityProfile.baselinePm25]);

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

  // Memoized Sanctuary Physics parameters (recomputed only when profile, outdoor PM2.5, or hacks change)
  const { calibratedParams, effectiveOutdoorPm25 } = useMemo(
    () => calculateCalibratedPhysics(sanctuaryProfile, outdoorPm25, activeHacks),
    [sanctuaryProfile, outdoorPm25, activeHacks]
  );

  // Real-time Physics Differential Loop (Analytical Mass-Balance modulated by Sanctuary Envelope)
  // High Efficiency: Throttled/paused when tab is hidden to conserve device CPU & battery
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setIndoorPm25((prevCin) => {
        const step = stepAnalytical(prevCin, effectiveOutdoorPm25, 0.04, calibratedParams);
        const nextVal = Math.round(step.cin * 10) / 10;
        return nextVal === prevCin ? prevCin : nextVal;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [calibratedParams, effectiveOutdoorPm25]);

  const handleToggleHack = useCallback(
    (key: 'corsiRosenthal' | 'kitchenExhaust' | 'draftSealing' | 'windowOpen') => {
      const nextVal = !activeHacks[key];
      setActiveHacks((prev) => ({ ...prev, [key]: nextVal }));

      if (nextVal) {
        const titleMap = {
          corsiRosenthal: 'DIY Corsi-Rosenthal Air Cleanser',
          kitchenExhaust: 'High-Velocity Kitchen Range Hood Flush',
          draftSealing: 'Magnetic Window Sash & Sill Draft Sealing',
          windowOpen: 'Midday Inversion Window Clean Air Flush',
        } as const;

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
    },
    [activeHacks, selectedCity, indoorPm25, outdoorPm25]
  );

  // Generic receipt for sharing from top CTA if no receipt currently open
  const defaultShareReceipt: BreathReceipt = useMemo(
    () =>
      activeReceipt ?? {
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
      },
    [activeReceipt, selectedCity]
  );

  const activeCleanWindow = liveReading?.cleanWindowHours || cityProfile.cleanWindowHours;
  const activePblHeight = liveReading?.pblHeightMeters || cityProfile.pblHeightMeters;
  const activeTemperature = liveReading?.temperatureC ?? cityProfile.temperatureC;
  const isLiveReading = Boolean(liveReading?.isLive);
  const sanctuaryZoneName = sanctuaryProfile.isCustomized ? sanctuaryProfile.customZoneName : 'Home';

  const handleNavigateTab = useCallback((tab: D2CTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

      {/* Ambient Branded Morphism GhostFibers Skin in Negative Space (Reduced opacity by 15% for soft brand subtlety) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10 group-hover/skin:opacity-45 transition-opacity duration-700 ease-out"
      >
        <GhostFibers
          glowColor="#533afd"
          lineColor="#b9b9f9"
          secondaryColor="#432ec9"
          layers={3}
          twist={1.2}
          threads={64}
          fiberStyle="dots"
          depthOfField={0.8}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
          lightMode={true}
          brightness={0.72}
          glow={0.5}
          speed={0.35}
          className="w-full h-full"
        />
      </div>

      {/* Subtle Negative Space Glassmorphism Glow Highlights in Brand Colors */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(83,58,253,0.04),rgba(185,185,249,0.02),transparent_70%)] group-hover/skin:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(83,58,253,0.06),rgba(185,185,249,0.03),transparent_70%)] transition-all duration-700"
      />

      {/* D2C Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        outdoorPm25={outdoorPm25}
        temperatureC={activeTemperature}
        onOpenShare={() => setShowShareModal(true)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenSanctuaryCalibration={() => setShowSanctuaryModal(true)}
        onOpenRecessPass={() => setShowRecessModal(true)}
        onSyncLiveAir={handleSyncLiveAir}
        isLiveSyncing={isLiveSyncing}
        isLiveReading={isLiveReading}
        sanctuaryZoneName={sanctuaryZoneName}
      />

      {/* Accessibility Status Announcer for Screen Readers (WCAG 4.1.3 Status Messages) */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {`ZeroBon platform active. Current city is ${selectedCity}. Outdoor PM2.5 is ${outdoorPm25} micrograms. Estimated indoor air is ${Math.round(indoorPm25)} micrograms.`}
      </div>

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
              isLiveReading={isLiveReading}
              sanctuaryBadgeText={sanctuaryZoneName}
              indoorPm25={indoorPm25}
              cleanWindowHours={activeCleanWindow}
              pblHeightMeters={activePblHeight}
            />
          </ErrorBoundary>
        )}

        <Suspense
          fallback={
            <div role="status" className="w-full py-16 text-center text-xs font-medium text-[#475569]">
              Loading ZeroBon module...
            </div>
          }
        >
          {/* Tab 1: Daily Routine Optimizer */}
          {activeTab === 'routines' && (
            <ErrorBoundary>
              <DailyRoutineOptimizer
                outdoorPm25={outdoorPm25}
                selectedCity={selectedCity}
                cleanWindowHours={activeCleanWindow}
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
              <InversionRadar
                selectedCity={selectedCity}
                outdoorPm25={outdoorPm25}
                cityProfile={cityProfile}
                cleanWindowHours={activeCleanWindow}
                isLiveReading={isLiveReading}
              />
            </ErrorBoundary>
          )}

          {/* Tab 4: GenAI Clean Air Assistant */}
          {FEATURE_FLAGS.hardenedCopilot && activeTab === 'copilot' && (
            <ErrorBoundary>
              <HardenedCopilot 
                indoorPm25={indoorPm25} 
                outdoorPm25={outdoorPm25} 
                city={selectedCity} 
              />
            </ErrorBoundary>
          )}
        </Suspense>
      </main>

      <Footer
        selectedCity={selectedCity}
        activeCleanWindow={activeCleanWindow}
        isLiveReading={isLiveReading}
        onNavigateTab={handleNavigateTab}
        onOpenShare={() => setShowShareModal(true)}
      />

      <Suspense fallback={null}>
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

        {/* Personal Home Sanctuary Calibration Modal */}
        {FEATURE_FLAGS.sanctuaryCalibration && showSanctuaryModal && (
          <SanctuaryCalibrationModal
            currentProfile={sanctuaryProfile}
            outdoorPm25={outdoorPm25}
            onSave={(updated) => setSanctuaryProfile(updated)}
            onClose={() => setShowSanctuaryModal(false)}
          />
        )}

        {/* Institutional Safe Recess Pass Printable Certificate Modal */}
        {FEATURE_FLAGS.safeRecessPassPdf && showRecessModal && (
          <SafeRecessPassModal
            cityName={selectedCity}
            outdoorPm25={outdoorPm25}
            cleanWindowHours={activeCleanWindow}
            onClose={() => setShowRecessModal(false)}
          />
        )}
      </Suspense>
    </div>
  );
};
