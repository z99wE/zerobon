import React from 'react';
import { TenantConfig } from '../types';
import { DEMO_TENANTS } from '../engine/tenancy';
import { ArchitectureBulb } from './ArchitectureDiagram';

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
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#e3e8ee] transition-all">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Name & Tenant Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectTab('terrarium')}>
            <div className="w-5 h-5 rounded-full bg-[#533afd] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-lg font-normal tracking-[-0.3px] text-[#0d253d] font-sans">
              Zerobon
            </span>
          </div>

          <span className="text-[#a8c3de] text-xs">/</span>

          {/* Tenant Selector Dropdown (Hairline Input Style) */}
          <div className="relative">
            <label htmlFor="tenant-switcher" className="sr-only">Select Household or Institutional Tenant</label>
            <select
              id="tenant-switcher"
              aria-label="Select Household or Institutional Tenant"
              value={selectedTenant.id}
              onChange={(e) => {
                const found = DEMO_TENANTS.find((t) => t.id === e.target.value);
                if (found) onSelectTenant(found);
              }}
              className="bg-transparent text-xs font-normal text-[#273951] hover:text-[#0d253d] cursor-pointer outline-none border border-[#e3e8ee] hover:border-[#a8c3de] focus:ring-2 focus:ring-[#533afd]/20 rounded-md px-2.5 py-1 transition-all"
            >
              {DEMO_TENANTS.map((t) => (
                <option key={t.id} value={t.id} className="bg-white text-[#0d253d] text-xs">
                  {t.name} ({t.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Primary Nav (Thin Söhne / Inter 300) */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="Main Navigation">
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
              aria-current={activeTab === item.id ? 'page' : undefined}
              className={`text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd] rounded-md px-1.5 py-0.5 ${
                activeTab === item.id
                  ? 'text-[#533afd] font-medium border-b-2 border-[#533afd] pb-1'
                  : 'text-[#273951] hover:text-[#0d253d] font-light'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Voltage CTA & Tabular Figure Status */}
        <div className="flex items-center gap-3">
          {/* Small Architecture Bulb */}
          <ArchitectureBulb />
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className={`w-1.5 h-1.5 rounded-full ${outdoorPm25 < 75 ? 'bg-[#34d399]' : 'bg-[#ea2261] animate-pulse'}`} />
            <span className="font-tabular text-xs text-[#64748d]">
              Outdoor: <strong className="text-[#0d253d] font-medium">{Math.round(outdoorPm25)} µg/m³</strong>
            </span>
          </div>

          {/* Single Voltage CTA per band */}
          <button
            onClick={() => onSelectTab('admin')}
            className="button-primary-pill"
          >
            <span>Tenant Dashboard</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-[#e3e8ee] bg-[#f6f9fc] gap-2">
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
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-light transition-all ${
              activeTab === item.id ? 'bg-[#533afd] text-white' : 'text-[#273951] bg-white border border-[#e3e8ee]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
