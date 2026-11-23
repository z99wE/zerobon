import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AtmosphericTerrarium } from './components/AtmosphericTerrarium';
import { H3CommunityBiome } from './components/H3CommunityBiome';
import { InversionRadar } from './components/InversionRadar';
import { HardenedCopilot } from './components/HardenedCopilot';
import { OpticalHazeEstimator } from './components/OpticalHazeEstimator';
import { MultiTenantAdmin } from './components/MultiTenantAdmin';
import { BreathReceiptModal } from './components/BreathReceiptModal';
import { DEMO_TENANTS } from './engine/tenancy';
import { DEFAULT_PHYSICS_PARAMS, stepAnalytical, computeBreathReceipt } from './engine/physics';
import { TenantConfig, BreathReceipt, MassBalanceParams } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terrarium' | 'biome' | 'radar' | 'copilot' | 'turbidity' | 'admin'>('terrarium');
  const [selectedTenant, setSelectedTenant] = useState<TenantConfig>(DEMO_TENANTS[0]!);

  // Ambient & Indoor Physics State
  const [outdoorPm25, setOutdoorPm25] = useState(245); // High winter smog
  const [indoorPm25, setIndoorPm25] = useState(135);

  // Active IAQ Hacks
  const [activeHacks, setActiveHacks] = useState({
    corsiRosenthal: false,
    kitchenExhaust: false,
    draftSealing: false,
    windowOpen: false,
  });

  // Breath receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<BreathReceipt | null>(null);

  // Real-time Physics Differential Loop (Continuous analytical step forward)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndoorPm25((prevCin) => {
        // Adjust physics parameters according to active user hacks
        const currentParams: MassBalanceParams = {
          ...DEFAULT_PHYSICS_PARAMS,
          p_penetration: activeHacks.draftSealing ? 0.38 : 0.82,
          lambda_ach: activeHacks.windowOpen ? 3.5 : activeHacks.kitchenExhaust ? 1.8 : 0.65,
          q_cadr: activeHacks.corsiRosenthal ? 360.0 : 0.0,
        };

        // If window is open during severe smog, high outdoor infiltration enters.
        // If window is open during midday clean air window (outdoorPm25 < 75), it purges!
        const step = stepAnalytical(prevCin, outdoorPm25, 0.04, currentParams);
        return Math.round(step.cin * 10) / 10;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [outdoorPm25, activeHacks]);

  // Handle toggling hacks & generating deterministic receipt
  const handleToggleHack = (key: 'corsiRosenthal' | 'kitchenExhaust' | 'draftSealing' | 'windowOpen') => {
    setActiveHacks((prev) => {
      const nextVal = !prev[key];
      const nextHacks = { ...prev, [key]: nextVal };

      if (nextVal) {
        // Generate counterfactual receipt
        const titleMap = {
          corsiRosenthal: 'Corsi-Rosenthal Box Air Cleanser (+350 CADR)',
          kitchenExhaust: 'Kitchen Range Hood High Exhaust Purge',
          draftSealing: 'Magnetic Window Sash Draft Sealing',
          windowOpen: 'Midday Inversion Window Clean Air Flush',
        };

        const receipt = computeBreathReceipt(
          selectedTenant.name,
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

  const handleManualReceipt = () => {
    const receipt = computeBreathReceipt(
      selectedTenant.name,
      'Multi-Modal IAQ Envelope Defense',
      {
        concentration_ug_m3: indoorPm25,
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: indoorPm25 > 90 ? 0.95 : 0.0,
      },
      {
        concentration_ug_m3: outdoorPm25,
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      'corsi_rosenthal'
    );
    setActiveReceipt(receipt);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f5f7] flex flex-col font-sans selection:bg-sky-500/20">
      {/* Precision Apple-Style Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedTenant={selectedTenant}
        onSelectTenant={setSelectedTenant}
        outdoorPm25={outdoorPm25}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-10">
        {/* Apple Product Showcase Header (Bold Typography, No eyebrow tags, No cluttered icons) */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
          <p className="apple-tag">Zerobon 4.0 • Atmospheric Physics & Digital Pet</p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white font-sans">
            Clean air, made tangible.
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto">
            A physics-informed indoor mass-balance engine bound to an atmospheric familiar that breathes with your home. 100% full-stack on Cloudflare edge.
          </p>
        </div>

        {/* Ambient Simulation Scrubber (Precision Apple slider) */}
        <div className="max-w-xl w-full mx-auto apple-glass px-6 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Ambient Winter Smog Control</p>
            <p className="text-xs text-neutral-300 font-medium mt-0.5">
              Outdoor PM₂.₅: <strong className="text-white">{outdoorPm25} µg/m³</strong>
            </p>
          </div>

          <div className="w-full sm:w-56 flex items-center gap-3">
            <span className="text-[10px] text-neutral-500">15</span>
            <input
              type="range"
              min={15}
              max={380}
              value={outdoorPm25}
              onChange={(e) => setOutdoorPm25(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-[10px] text-neutral-500">380</span>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'terrarium' && (
          <div className="space-y-8 animate-fadeIn">
            <AtmosphericTerrarium
              indoorPm25={indoorPm25}
              outdoorPm25={outdoorPm25}
              activeHacks={activeHacks}
              onTriggerHackToggle={handleToggleHack}
              onOpenReceipt={handleManualReceipt}
            />

            {/* Differential Equation Explainer Card (Apple Precision Design) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="apple-glass p-6 rounded-3xl space-y-2">
                <p className="apple-tag">Mass-Balance Solver</p>
                <h4 className="text-base font-semibold text-white">Client-Side WASM Engine</h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-mono text-[11px]">
                  dCin/dt = P·λ·Cout − (λ + kd + CADR/V)·Cin + Eindoor/V
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Calculates real-time particle infiltration without requiring proprietary indoor hardware sensors.
                </p>
              </div>

              <div className="apple-glass p-6 rounded-3xl space-y-2">
                <p className="apple-tag">Bio-Indicator State</p>
                <h4 className="text-base font-semibold text-white">Lumi the Cloud Fox</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Dynamically shifts from playful blooming idle (Cin &lt; 15), to amber scarf alertness (35–100), to deploying an N95 protective shield (&gt; 150 µg/m³).
                </p>
              </div>

              <div className="apple-glass p-6 rounded-3xl space-y-2">
                <p className="apple-tag">Deterministic Receipts</p>
                <h4 className="text-base font-semibold text-white">Breath-Cost Accounting</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Converts avoided microgram PM2.5 lung doses directly into cigarette equivalents saved and verified IPCC CO2e emission reductions.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'biome' && (
          <div className="animate-fadeIn">
            <H3CommunityBiome tenantId={selectedTenant.id} />
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="animate-fadeIn">
            <InversionRadar />
          </div>
        )}

        {activeTab === 'copilot' && (
          <div className="animate-fadeIn">
            <HardenedCopilot indoorPm25={indoorPm25} outdoorPm25={outdoorPm25} />
          </div>
        )}

        {activeTab === 'turbidity' && (
          <div className="animate-fadeIn">
            <OpticalHazeEstimator onApplyEstimatedOutdoorPm25={(pm) => setOutdoorPm25(pm)} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            <MultiTenantAdmin tenant={selectedTenant} />
          </div>
        )}
      </main>

      {/* Apple-grade Minimalist Footer */}
      <footer className="w-full border-t border-white/[0.06] py-8 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Zerobon Version 4.0 — 100% Cloudflare Free Tier + Rust/WASM + Three.js</p>
          <p className="font-mono text-[11px] text-neutral-400">Zero-Trust LLM Pipeline • Sub-5ms Edge CPU • H3 Resolution-7 Mesh</p>
        </div>
      </footer>

      {/* Breath Receipt Modal */}
      {activeReceipt && (
        <BreathReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
