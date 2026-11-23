import React from 'react';
import { TenantConfig } from '../types';
import { DEMO_TENANTS } from '../engine/tenancy';

interface NavbarProps {
  activeTab: 'terrarium' | 'biome' | 'radar' | 'copilot' | 'turbidity' | 'admin';
  onSelectTab: (tab: 'terrarium' | 'biome' | 'radar' | 'copilot' | 'turbidity' | 'admin') => void;
  selectedTenant: TenantConfig;
  onSelectTenant: (tenant: TenantConfig) => void;
  outdoorPm25: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  selectedTenant,
  onSelectTenant,
  outdoorPm25,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#050507]/80 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Name (Apple-style precision minimalist logotype) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-sky-400/80 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            </div>
            <span className="text-base font-semibold tracking-tight text-white font-sans">Zerobon</span>
          </div>

          <span className="hidden sm:inline-block text-neutral-600 text-sm">/</span>

          {/* Tenant Switcher dropdown */}
          <div className="relative">
            <select
              value={selectedTenant.id}
              onChange={(e) => {
                const found = DEMO_TENANTS.find((t) => t.id === e.target.value);
                if (found) onSelectTenant(found);
              }}
              className="bg-transparent text-xs font-medium text-neutral-300 hover:text-white cursor-pointer outline-none transition-colors pr-2"
            >
              {DEMO_TENANTS.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#121218] text-white text-xs">
                  {t.name} ({t.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Minimalist Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.06]">
          {(
            [
              { id: 'terrarium', label: '3D Terrarium' },
              { id: 'biome', label: 'H3 Biome' },
              { id: 'radar', label: 'Inversion Radar' },
              { id: 'copilot', label: 'Zero-Trust Copilot' },
              { id: 'turbidity', label: 'Optical Sky' },
              { id: 'admin', label: 'Tenant Admin' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Ambient Indicator & Quick Switch */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className={`w-2 h-2 rounded-full ${outdoorPm25 < 75 ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
            <span className="text-[11px] text-neutral-300">
              Outdoor PM₂.₅: <strong className="text-white font-medium">{Math.round(outdoorPm25)} µg/m³</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Tab Navigation */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-white/[0.04] gap-2">
        {(
          [
            { id: 'terrarium', label: '3D Terrarium' },
            { id: 'biome', label: 'H3 Biome' },
            { id: 'radar', label: 'Inversion Radar' },
            { id: 'copilot', label: 'Copilot' },
            { id: 'turbidity', label: 'Optical Sky' },
            { id: 'admin', label: 'Tenant Admin' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${
              activeTab === item.id ? 'bg-white text-black' : 'text-neutral-400 bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
