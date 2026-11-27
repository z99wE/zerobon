import React, { useState } from 'react';
import { Share2, MapPin, Search, Radio } from 'lucide-react';
import { TOP_CITIES } from '../engine/city-data';

export type D2CTab = 'overview' | 'routines' | 'hacks' | 'radar' | 'copilot';

interface NavbarProps {
  activeTab: D2CTab;
  onSelectTab: (tab: D2CTab) => void;
  outdoorPm25: number;
  temperatureC: number;
  onOpenShare: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenSanctuaryCalibration?: () => void;
  onOpenRecessPass?: () => void;
  onSyncLiveAir?: () => void;
  isLiveSyncing?: boolean;
  isLiveReading?: boolean;
  sanctuaryZoneName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  outdoorPm25,
  temperatureC,
  onOpenShare,
  selectedCity,
  onSelectCity,
  onOpenSanctuaryCalibration,
  onOpenRecessPass: _onOpenRecessPass,
  onSyncLiveAir,
  isLiveSyncing = false,
  isLiveReading = false,
  sanctuaryZoneName,
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

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'routines', label: 'Daily Routines' },
    { id: 'hacks', label: 'Indoor Hacks' },
    { id: 'radar', label: 'Air Forecast' },
    { id: 'copilot', label: 'AI Assistant' },
  ] as const;

  const handleNavClick = (tabId: D2CTab) => {
    onSelectTab(tabId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#e3e8ee] transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Name & City Picker */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-[#533afd] rounded-lg p-1"
            aria-label="ZeroBon Home"
          >
            <span className="text-xl font-bold tracking-tight text-[#0d253d] font-sans block leading-none">
              ZeroBon
            </span>
          </button>

          <span className="text-[#e3e8ee] text-sm hidden md:inline">/</span>

          {/* City Selector Button & Search Popover */}
          <div className="relative">
            <button
              type="button"
              aria-label={`Current city ${selectedCity}. Click to change city.`}
              aria-expanded={isCitySearchOpen}
              aria-haspopup="dialog"
              onClick={() => setIsCitySearchOpen(!isCitySearchOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f6f9fc] hover:bg-[#e3e8ee] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] transition-all focus:ring-2 focus:ring-[#533afd]"
            >
              <MapPin className="w-3.5 h-3.5 text-[#533afd]" />
              <span className="max-w-[120px] truncate">{selectedCity}</span>
            </button>

            {isCitySearchOpen && (
              <div
                role="dialog"
                aria-label="Select city or neighborhood"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsCitySearchOpen(false);
                }}
                className="absolute top-10 left-0 w-72 bg-white rounded-2xl shadow-xl border border-[#e3e8ee] p-3 z-50 animate-fadeIn"
              >
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
                    aria-label="Search city or neighborhood"
                    maxLength={64}
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Type ANY city name..."
                    className="w-full bg-transparent text-xs text-[#0d253d] outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    aria-label="Set selected city"
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
                      type="button"
                      aria-label={`Select ${c.name}, ${c.country}`}
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

        {/* Center Primary D2C Navigation - High-Fidelity Segmented Brand Capsule (Never Squished) */}
        <nav 
          className="hidden md:flex items-center bg-[#f6f9fc] p-1.5 rounded-full border border-[#e3e8ee] shadow-2xs gap-1" 
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Open ${item.label} tab`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                  isActive
                    ? 'bg-white text-[#533afd] shadow-sm font-bold border border-black/[0.04]'
                    : 'text-[#475569] hover:text-[#0d253d] hover:bg-white/50 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Live Sync + Calibrate Sanctuary + Share CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Station Sync Button */}
          {onSyncLiveAir && (
            <button
              onClick={onSyncLiveAir}
              disabled={isLiveSyncing}
              title="Fetch live satellite & ground station readings via Open-Meteo API"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isLiveReading
                  ? 'bg-[#533afd]/10 border-[#533afd]/30 text-[#533afd] font-semibold shadow-2xs'
                  : 'bg-[#f6f9fc] hover:bg-[#e3e8ee] border-[#e3e8ee] text-[#0d253d]'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-pulse text-[#533afd]' : isLiveReading ? 'text-[#533afd]' : 'text-[#64748d]'}`} />
              <span className="hidden xl:inline">{isLiveReading ? 'Live CAMS' : 'Sync live'}</span>
              <span className="font-tabular font-bold">{temperatureC}°C · {Math.round(outdoorPm25)} µg</span>
            </button>
          )}

          {/* Calibrate Sanctuary Retention Button (No Icon) */}
          {onOpenSanctuaryCalibration && (
            <button
              onClick={onOpenSanctuaryCalibration}
              title="Calibrate your building type & floor elevation"
              className="hidden lg:flex items-center px-3.5 py-1.5 rounded-full bg-[#f6f9fc] hover:bg-[#e3e8ee] border border-[#e3e8ee] text-[#0d253d] text-xs font-medium transition-all"
            >
              <span>{sanctuaryZoneName || 'Home'}</span>
            </button>
          )}

          {/* Social Share Trigger Button */}
          <button
            onClick={onOpenShare}
            aria-label="Share clean air impact on social media"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#533afd] hover:bg-[#432ec9] text-white text-xs font-bold transition-all shadow-sm focus:ring-2 focus:ring-[#533afd] focus:outline-none"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Subnav - Fluid Centered Segmented Capsule */}
      <div className="md:hidden flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar px-4 py-2.5 border-t border-[#e3e8ee] bg-white/95 backdrop-blur-md">
        <div className="flex items-center p-1 bg-[#f6f9fc] rounded-full border border-[#e3e8ee] gap-1 shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Open ${item.label} tab`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#533afd] shadow-sm font-bold border border-black/[0.04]'
                    : 'text-[#475569] hover:text-[#0d253d] font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
