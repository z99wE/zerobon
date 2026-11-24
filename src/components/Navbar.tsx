import React, { useState } from 'react';
import { Share2, MapPin, Search } from 'lucide-react';
import { ArchitectureBulb } from './ArchitectureDiagram';
import { TOP_CITIES } from '../engine/city-data';

export type D2CTab = 'routines' | 'hacks' | 'radar' | 'copilot';

interface NavbarProps {
  activeTab: D2CTab;
  onSelectTab: (tab: D2CTab) => void;
  outdoorPm25: number;
  temperatureC: number;
  onOpenShare: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  outdoorPm25,
  temperatureC,
  onOpenShare,
  selectedCity,
  onSelectCity,
}) => {
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const handleCitySubmit = (name: string) => {
    if (name.trim()) {
      onSelectCity(name.trim());
      setIsCitySearchOpen(false);
      setCityInput('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#e3e8ee] transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Name & City Picker */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('routines')}
            className="flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-[#533afd] rounded-lg p-1"
            aria-label="ZeroBon Home"
          >
            <div className="w-7 h-7 rounded-full bg-[#533afd] flex items-center justify-center text-white text-xs font-semibold">
              ZB
            </div>
            <div>
              <span className="text-xl font-medium tracking-tight text-[#0d253d] font-sans block leading-none">
                ZeroBon
              </span>
            </div>
          </button>

          <span className="text-[#e3e8ee] text-sm hidden md:inline">/</span>

          {/* City Selector Button & Search Popover */}
          <div className="relative">
            <button
              onClick={() => setIsCitySearchOpen(!isCitySearchOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f6f9fc] hover:bg-[#e3e8ee] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] transition-all focus:ring-2 focus:ring-[#533afd]"
              aria-label={`Current city ${selectedCity}. Click to change city.`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#533afd]" />
              <span className="max-w-[120px] truncate">{selectedCity}</span>
            </button>

            {isCitySearchOpen && (
              <div className="absolute top-10 left-0 w-72 bg-white rounded-2xl shadow-xl border border-[#e3e8ee] p-3 z-50 animate-fadeIn">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCitySubmit(cityInput);
                  }}
                  className="flex items-center gap-1.5 p-2 bg-[#f6f9fc] rounded-xl border border-[#e3e8ee] mb-2"
                >
                  <Search className="w-3.5 h-3.5 text-[#64748d]" />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Type ANY city name..."
                    className="w-full bg-transparent text-xs text-[#0d253d] outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-[11px] font-semibold text-[#533afd] px-2 py-0.5"
                  >
                    Set
                  </button>
                </form>

                <span className="text-[10px] text-[#64748d] font-semibold uppercase tracking-wider block mb-1.5 px-1">
                  Popular Metros
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {TOP_CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleCitySubmit(c.name)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedCity === c.name
                          ? 'bg-[#533afd] text-white font-medium'
                          : 'text-[#273951] hover:bg-[#f6f9fc]'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className={`text-[10px] ${selectedCity === c.name ? 'text-white/80' : 'text-[#64748d]'}`}>
                        {c.country}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Primary D2C Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {(
            [
              { id: 'routines', label: 'Daily Routines' },
              { id: 'hacks', label: 'Indoor Hacks' },
              { id: 'radar', label: 'Air Forecast' },
              { id: 'copilot', label: 'AI Assistant' },
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

        {/* Right Actions: Refined Weather Badge + Share CTA + Architecture Bulb */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refined Brand Weather & PM2.5 Box */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="font-tabular text-xs text-[#0d253d] font-medium">
              {temperatureC}°C · {Math.round(outdoorPm25)} µg/m³
            </span>
          </div>

          {/* Social Share Trigger Button */}
          <button
            onClick={onOpenShare}
            aria-label="Share clean air impact on social media"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-medium transition-all shadow-sm focus:ring-2 focus:ring-[#533afd] focus:outline-none"
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
            { id: 'radar', label: 'Air Forecast' },
            { id: 'copilot', label: 'AI Assistant' },
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
