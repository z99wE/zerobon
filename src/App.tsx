import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GradientMesh } from './components/GradientMesh';
import { AtmosphericTerrarium } from './components/AtmosphericTerrarium';
import { H3CommunityBiome } from './components/H3CommunityBiome';
import { InversionRadar } from './components/InversionRadar';
import { HardenedCopilot } from './components/HardenedCopilot';
import { OpticalHazeEstimator } from './components/OpticalHazeEstimator';
import { MultiTenantAdmin } from './components/MultiTenantAdmin';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { BreathReceiptModal } from './components/BreathReceiptModal';
import { DEMO_TENANTS } from './engine/tenancy';
import { DEFAULT_PHYSICS_PARAMS, stepAnalytical, computeBreathReceipt } from './engine/physics';
import { TenantConfig, BreathReceipt, MassBalanceParams } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terrarium' | 'biome' | 'radar' | 'copilot' | 'turbidity' | 'admin' | 'architecture'>('terrarium');
  const [selectedTenant, setSelectedTenant] = useState<TenantConfig>(DEMO_TENANTS[0] ?? {
    id: 'tenant-family-chen',
    name: 'The Chen Household',
    type: 'family',
    h3Index: '87283082bffffff',
    subdomain: 'chen.zerobon.io',
    totalMembers: 4,
    activePledgesCount: 3,
    collectiveEmissionsSavedKg: 14.8,
  });

  // Ambient & Indoor Physics State
  const [outdoorPm25, setOutdoorPm25] = useState(245);
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

  // Real-time Physics Differential Loop
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
    <div className="relative min-h-screen bg-white text-[#0d253d] flex flex-col font-sans selection:bg-[#533afd]/20 selection:text-[#533afd]">
      {/* Skip to Content for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#533afd] text-white rounded-full text-xs font-medium shadow-lg outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      {/* Stripe Signature Atmospheric Gradient Mesh Upper Third */}
      <GradientMesh />

      {/* Floating Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedTenant={selectedTenant}
        onSelectTenant={setSelectedTenant}
        outdoorPm25={outdoorPm25}
      />

      {/* Hero Section floating above the Gradient Mesh */}
      <section className="relative z-10 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-12 pb-14 text-left">
        <div className="max-w-3xl">
          {/* Söhne Thin Display Headline (-1.4px letter-spacing at 56px, weight 300) */}
          <h1 className="font-display-xxl text-[#0d253d] mb-4">
            Financial-grade precision for the air you breathe.
          </h1>

          <p className="font-body-lg text-[#273951] max-w-2xl leading-relaxed mb-6">
            A physics-informed indoor mass-balance engine bound to a living 3D atmospheric familiar. Deterministic breath-cost receipts, multi-tenant isolation, and zero-trust LLM security on Cloudflare edge.
          </p>

          {/* Single-Voltage CTA: Electric Indigo Pill + Secondary Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('terrarium')}
              className="button-primary-pill"
            >
              <span>Explore 3D Terrarium</span>
              <span>→</span>
            </button>

            <button
              onClick={handleManualReceipt}
              className="button-secondary-pill"
            >
              <span>View Deterministic Receipt</span>
            </button>
          </div>
        </div>

        {/* Ambient Winter Smog Scrubber Control (Card Feature Light) */}
        <div className="mt-10 max-w-md card-feature-light p-4 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="smog-simulator-slider" className="font-micro-cap text-[#475569] cursor-pointer">
              Simulate Ambient Smog Event
            </label>
            <span className="font-tabular text-xs text-[#0d253d] font-medium" aria-live="polite">
              {outdoorPm25} µg/m³ PM₂.₅
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-tabular text-xs text-[#475569]">15</span>
            <input
              id="smog-simulator-slider"
              type="range"
              min={15}
              max={380}
              aria-label="Simulate Ambient Smog PM2.5 Level"
              aria-valuemin={15}
              aria-valuemax={380}
              aria-valuenow={outdoorPm25}
              aria-valuetext={`${outdoorPm25} micrograms per cubic meter`}
              value={outdoorPm25}
              onChange={(e) => setOutdoorPm25(Number(e.target.value))}
              className="w-full focus:ring-2 focus:ring-[#533afd] focus:outline-none"
            />
            <span className="font-tabular text-xs text-[#475569]">380</span>
          </div>
        </div>
      </section>

      {/* Main Content Surface */}
      <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pb-20 flex flex-col gap-10 outline-none">
        {/* Problem Statement Reimagined as High-Impact Stripe-Style Marketing Copy */}
        <section
          id="problem-statement"
          className="card-feature-light p-6 sm:p-8 md:p-10 bg-white border border-[#e3e8ee] shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#533afd]" />
              <span className="font-micro-cap text-[#533afd]">The Zerobon Mandate</span>
            </div>
          </div>

          <div className="max-w-3xl mb-6">
            <h2 className="font-heading-lg sm:font-display-md text-[#0d253d] font-light tracking-tight mb-3">
              Intelligent atmospheric defense for homes and neighborhoods.
            </h2>
            <p className="font-body-lg text-[#273951] font-light leading-relaxed">
              When severe winter inversions trap toxic urban smog, Zerobon’s generative AI copilot guides your household through the crisis. Get dynamic routine swaps reshaped around clean air windows, discover proven indoor hacks that scrub particulates without costly hardware, and embrace sustainable lifestyle alternatives tailored to your floor level and daily commute—all backed by deterministic receipts that prove the exact lung dose you protect and emissions you prevent.
            </p>
          </div>

          <div className="pt-6 border-t border-[#e3e8ee] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
              <span className="font-micro-cap text-[#533afd]">GenAI Edge Copilot</span>
              <p className="font-heading-sm text-xs text-[#0d253d] mt-1 mb-0.5">Context-Aware Guidance</p>
              <p className="font-body-md text-[#64748d] text-[11px] leading-relaxed">
                Hardened with a 5-layer anti-hijacking firewall to provide safe, verified IAQ interventions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
              <span className="font-micro-cap text-[#533afd]">Inversion-Aware Routines</span>
              <p className="font-heading-sm text-xs text-[#0d253d] mt-1 mb-0.5">Thermal Window Scheduling</p>
              <p className="font-body-md text-[#64748d] text-[11px] leading-relaxed">
                Shifts school runs, outdoor exercise, and ventilation into golden midday boundary layer mixing windows.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
              <span className="font-micro-cap text-[#533afd]">Indoor Air Quality Hacks</span>
              <p className="font-heading-sm text-xs text-[#0d253d] mt-1 mb-0.5">Physics-Driven Sanctuaries</p>
              <p className="font-body-md text-[#64748d] text-[11px] leading-relaxed">
                Test DIY Corsi-Rosenthal boxes, draft sash sealing, and exhaust purges on a living 3D terrarium.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
              <span className="font-micro-cap text-[#533afd]">Deterministic Impact</span>
              <p className="font-heading-sm text-xs text-[#0d253d] mt-1 mb-0.5">Breath-Cost Accounting</p>
              <p className="font-body-md text-[#64748d] text-[11px] leading-relaxed">
                Prints verifiable receipts for avoided PM₂.₅ lung doses, cigarette equivalents, and carbon reductions.
              </p>
            </div>
          </div>
        </section>
        {/* Active Tab Subsystem */}
        {activeTab === 'terrarium' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Dark-App Dashboard Track Composited Above Canvas */}
            <AtmosphericTerrarium
              indoorPm25={indoorPm25}
              outdoorPm25={outdoorPm25}
              activeHacks={activeHacks}
              onTriggerHackToggle={handleToggleHack}
              onOpenReceipt={handleManualReceipt}
            />

            {/* 3 Stripe Feature Cards (White + Cream Band + Light) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-feature-light p-6">
                <span className="font-micro-cap text-[#533afd]">Rust / WASM Engine</span>
                <h4 className="font-heading-md text-[#0d253d] mt-1 mb-2">Mass-Balance Solver</h4>
                <p className="font-tabular text-xs text-[#533afd] font-mono mb-2">
                  dCin/dt = P·λ·Cout − (λ + kd + CADR/V)·Cin + Eindoor/V
                </p>
                <p className="font-body-md text-xs text-[#64748d] leading-relaxed">
                  Computes real-time indoor fine particulate infiltration analytically without requiring proprietary hardware sensors.
                </p>
              </div>

              {/* Warm Cream Band Card (Stripe Chromatic Interlude #f5e9d4) */}
              <div className="card-cream-band p-6">
                <span className="font-micro-cap text-[#9b6829]">Living Bio-Indicator</span>
                <h4 className="font-heading-md text-[#0d253d] mt-1 mb-2">Lumi the Cloud Fox</h4>
                <p className="font-body-md text-xs text-[#0d253d]/80 leading-relaxed">
                  Transforms particulate physics into emotional habit loops. Shifts from relaxed blooming idle (Cin &lt; 15) to deploying an N95 respirator mask (&gt; 150 µg/m³).
                </p>
              </div>

              <div className="card-feature-light p-6">
                <span className="font-micro-cap text-[#533afd]">Deterministic Impact</span>
                <h4 className="font-heading-md text-[#0d253d] mt-1 mb-2">Breath-Cost Accounting</h4>
                <p className="font-body-md text-xs text-[#64748d] leading-relaxed">
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

        {activeTab === 'architecture' && (
          <div className="animate-fadeIn">
            <ArchitectureDiagram />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            <MultiTenantAdmin tenant={selectedTenant} />
          </div>
        )}
      </main>

      {/* Stripe Site-Wide Footer (footer-light) */}
      <footer className="w-full bg-[#f6f9fc] border-t border-[#e3e8ee] py-12 text-[#64748d] text-xs font-light">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#533afd]" />
            <span className="text-[#0d253d] font-normal font-sans">Zerobon 4.0</span>
            <span>• Stripe Inspired Atmospheric Architecture</span>
          </div>
          <div className="font-tabular text-[12px] text-[#64748d]">
            100% Cloudflare Free Tier • Rust/WASM Mass-Balance • Sub-5ms Edge CPU
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
    </div>
  );
};
