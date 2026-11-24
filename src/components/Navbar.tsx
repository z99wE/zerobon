import React from 'react';
import { Share2, MapPin, CloudFog } from 'lucide-react';
import { ArchitectureBulb } from './ArchitectureDiagram';

export type D2CTab = 'routines' | 'hacks' | 'radar' | 'copilot' | 'scanner';

interface NavbarProps {
  activeTab: D2CTab;
  onSelectTab: (tab: D2CTab) => void;
  outdoorPm25: number;
  onOpenShare: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
}

export const LOCATIONS = [
  'Delhi NCR (Anand Vihar)',
  'South Delhi (RK Puram)',
  'Gurugram (Cyber City)',
  'Noida (Sector 62)',
  'Central Delhi (Lodhi Road)',
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  outdoorPm25,
  onOpenShare,
  selectedLocation,
  onSelectLocation,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#e3e8ee] transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Name & Location Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('routines')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-[#533afd] rounded-lg p-1"
            aria-label="ZeroBon Home"
          >
            <div className="w-7 h-7 rounded-full bg-[#533afd] flex items-center justify-center shadow-sm">
              <CloudFog className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-medium tracking-tight text-[#0d253d] font-sans block leading-none">
                ZeroBon
              </span>
              <span className="text-[10px] text-[#64748d] font-light hidden sm:inline">
                Clean Air Assistant
              </span>
            </div>
          </button>

          <span className="text-[#a8c3de] text-xs hidden md:inline">|</span>

          {/* D2C Location Selector */}
          <div className="relative hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f6f9fc] border border-[#e3e8ee]">
            <MapPin className="w-3.5 h-3.5 text-[#533afd] flex-shrink-0" />
            <label htmlFor="location-select" className="sr-only">Select your metropolitan location</label>
            <select
              id="location-select"
              aria-label="Select metropolitan location"
              value={selectedLocation}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="bg-transparent text-xs font-normal text-[#273951] hover:text-[#0d253d] cursor-pointer outline-none focus:ring-1 focus:ring-[#533afd] rounded"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc} className="bg-white text-[#0d253d]">
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Primary D2C Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {(
            [
              { id: 'routines', label: 'Daily Routines' },
              { id: 'hacks', label: 'Indoor Hacks' },
              { id: 'radar', label: 'Smog Radar' },
              { id: 'copilot', label: 'AI Assistant' },
              { id: 'scanner', label: 'Sky Scanner' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
              className={`text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd] rounded-md px-2 py-1 ${
                activeTab === item.id
                  ? 'text-[#533afd] font-semibold border-b-2 border-[#533afd]'
                  : 'text-[#273951] hover:text-[#0d253d] font-normal'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Weather Badge + Share CTA + Architecture Bulb */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Weather / AQI badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f6f9fc] border border-[#e3e8ee]">
            <span
              className={`w-2 h-2 rounded-full ${
                outdoorPm25 < 60
                  ? 'bg-[#34d399]'
                  : outdoorPm25 < 150
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#ea2261] animate-pulse'
              }`}
            />
            <span className="font-tabular text-xs text-[#273951]">
              14°C • <strong className="text-[#0d253d] font-semibold">{Math.round(outdoorPm25)} µg/m³ PM₂.₅</strong>
            </span>
          </div>

          {/* Social Share Trigger Button */}
          <button
            onClick={onOpenShare}
            aria-label="Share clean air impact on social media"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-medium transition-all shadow-sm focus:ring-2 focus:ring-[#533afd] focus:outline-none"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Impact</span>
          </button>

          {/* Small Architecture Bulb Modal Trigger */}
          <ArchitectureBulb />
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-[#e3e8ee] bg-[#f6f9fc] gap-2">
        {(
          [
            { id: 'routines', label: 'Daily Routines' },
            { id: 'hacks', label: 'Indoor Hacks' },
            { id: 'radar', label: 'Smog Radar' },
            { id: 'copilot', label: 'AI Assistant' },
            { id: 'scanner', label: 'Sky Scanner' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs transition-all ${
              activeTab === item.id
                ? 'bg-[#533afd] text-white font-medium shadow-sm'
                : 'text-[#273951] bg-white border border-[#e3e8ee]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
