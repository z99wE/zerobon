import React from 'react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* High-Contrast Architectural Blueprint Shell */}
      <div className="card-dashboard-chrome p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-8">
          <div>
            <h3 className="font-heading-lg text-white mt-1">
              High-Contrast Zerobon 4.0 Infrastructure Blueprint
            </h3>
            <p className="font-body-md text-xs text-white/70 mt-0.5">
              Multi-tenant Cloudflare edge, Google Gemini GenAI pipeline, deterministic Rust/WASM solver, and Three.js client ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#34d399]/20 text-[#34d399] font-tabular text-xs font-medium">
              Sub-5ms Edge CPU • Zero-Trust LLM
            </span>
          </div>
        </div>

        {/* 5-Stage High-Contrast Flowchart Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
          {/* Stage 1: Ingestion */}
          <div className="p-5 rounded-xl bg-[#1c1e54] border-2 border-[#fbbf24] shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-wider font-semibold">1. Telemetry Ingestion</span>
              <h4 className="font-heading-sm text-sm text-white mt-1 mb-3">Planetary Spatial Feed</h4>
              <ul className="space-y-2 text-xs text-white/80 font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#fbbf24] font-bold">›</span>
                  <span>Google Earth Engine & Satellite AOD</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#fbbf24] font-bold">›</span>
                  <span>Open-Meteo Inversion & PBL Heights</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#fbbf24] font-bold">›</span>
                  <span>OpenAQ v3 Ground PM₂.₅ Truth</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#fbbf24] font-bold">›</span>
                  <span>NASA FIRMS Upwind Plume Beacons</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 font-tabular text-[10px] text-[#fbbf24]">
              Hourly Cloudflare Cron Ingestion
            </div>
          </div>

          {/* Stage 2: Cloudflare Edge */}
          <div className="p-5 rounded-xl bg-[#0d253d] border-2 border-[#533afd] shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#b9b9f9] uppercase tracking-wider font-semibold">2. Multi-Tenant Edge</span>
              <h4 className="font-heading-sm text-sm text-white mt-1 mb-3">Cloudflare Workers</h4>
              <ul className="space-y-2 text-xs text-white/80 font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>Hono Multi-Tenant Hostname Router</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>TenantScopedDB (D1 SQLite Enforced)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>Global KV Spatial Telemetry Cache</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>Composite Index: idx_ledger_tenant_h3</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 font-tabular text-[10px] text-[#b9b9f9]">
              &lt; 3ms Median Edge CPU Time
            </div>
          </div>

          {/* Stage 3: Google Gemini GenAI */}
          <div className="p-5 rounded-xl bg-[#1c1e54] border-2 border-[#533afd] shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#533afd] uppercase tracking-wider font-semibold">3. GenAI Intelligence</span>
              <h4 className="font-heading-sm text-sm text-white mt-1 mb-3">Google Gemini Flash</h4>
              <ul className="space-y-2 text-xs text-white/80 font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>Google Gemini 2.5 Flash API</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>5-Layer Prompt-Injection Firewall</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>Zod Schema Lock (intent_valid)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#533afd] font-bold">›</span>
                  <span>Rotating Canary Egress Filter</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 font-tabular text-[10px] text-[#b9b9f9]">
              100% Injection Block Guarantee
            </div>
          </div>

          {/* Stage 4: Rust/WASM Physics */}
          <div className="p-5 rounded-xl bg-[#064e3b] border-2 border-[#34d399] shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#34d399] uppercase tracking-wider font-semibold">4. Deep-Tech Physics</span>
              <h4 className="font-heading-sm text-sm text-white mt-1 mb-3">Rust / WASM Engine</h4>
              <ul className="space-y-2 text-xs text-white/90 font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#34d399] font-bold">›</span>
                  <span>Mass-Balance Differential Solver</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#34d399] font-bold">›</span>
                  <span>Analytical Step: Cin(t) Infiltration</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#34d399] font-bold">›</span>
                  <span>Deterministic Inhaled Lung Dose D(t)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#34d399] font-bold">›</span>
                  <span>IPCC Emission Avoidance Receipts</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 font-tabular text-[10px] text-[#34d399]">
              Zero-Hallucination Math Isolation
            </div>
          </div>

          {/* Stage 5: 3D Three.js Client */}
          <div className="p-5 rounded-xl bg-[#4c0519] border-2 border-[#ea2261] shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#ea2261] uppercase tracking-wider font-semibold">5. 3D WebGL Client</span>
              <h4 className="font-heading-sm text-sm text-white mt-1 mb-3">Living Terrarium PWA</h4>
              <ul className="space-y-2 text-xs text-white/90 font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ea2261] font-bold">›</span>
                  <span>Three.js Lumi Fox Bio-Indicator</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ea2261] font-bold">›</span>
                  <span>3D Airflow Streamline Scrubbing</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ea2261] font-bold">›</span>
                  <span>Isometric Uber H3 Res-7 Biome</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ea2261] font-bold">›</span>
                  <span>Rayleigh Optical Sky Turbidity Analyzer</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 font-tabular text-[10px] text-[#f96bee]">
              60 FPS Adaptive Power Scaling
            </div>
          </div>
        </div>

        {/* High-Contrast Interactive Data Contract Specs */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-[#0f112e] border border-white/10 font-mono text-white/80">
            <span className="text-[#533afd] font-semibold">// Cloudflare D1 Composite Index Isolation Constraint</span>
            <p className="mt-1 text-white">
              CREATE INDEX idx_ledger_tenant_h3 ON impact_ledger(tenant_id, h3_cell, logged_at);
            </p>
            <p className="mt-2 text-white/60 text-[11px]">
              Guarantees zero cross-tenant leakage between B2C households, RWAs, and school campuses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f112e] border border-white/10 font-mono text-white/80">
            <span className="text-[#34d399] font-semibold">// Deterministic Inhaled Dose Equation (Rust WASM)</span>
            <p className="mt-1 text-white">
              D = ∫ C(t) · V_E · (1 - η_mask) dt  →  1 cig ≈ 22 µg PM2.5
            </p>
            <p className="mt-2 text-white/60 text-[11px]">
              Computed deterministically without LLM arithmetic to guarantee zero hallucinations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
