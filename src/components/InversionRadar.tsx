import React, { useState } from 'react';
import { generate24HourAtmosphericForecast } from '../engine/physics';
import { HourlyAtmosphericForecast } from '../types';
import { Sun, Wind, Clock, ArrowRight } from 'lucide-react';

export const InversionRadar: React.FC = () => {
  const forecast = generate24HourAtmosphericForecast();
  const defaultHour = forecast[4] ?? forecast[0] ?? {
    hour: '11:30',
    time24: 11.5,
    outdoorPm25: 85,
    pblHeightMeters: 950,
    groundTempC: 22,
    inversionStrength: 'Clean Air Window' as const,
    isMiddayCleanWindow: true,
    windSpeedKmh: 14,
  };
  const [selectedHour, setSelectedHour] = useState<HourlyAtmosphericForecast>(defaultHour);

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
        <div>
          <h2 className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d]">
            Clean Air Window Forecast
          </h2>
          <p className="font-body-md text-sm text-[#475569] mt-1 max-w-2xl">
            Diurnal atmospheric mixing timeline. Sunlight warms the ground to naturally lift and disperse surface pollution during midday hours.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <Sun className="w-4 h-4 text-[#533afd]" />
          <span className="text-xs font-semibold text-[#0d253d]">
            Best Ventilation: 11:30 AM – 3:30 PM
          </span>
        </div>
      </div>

      {/* Hourly Clean Air Forecast Strip (Minimal Horizontal Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-[#64748d]">
          <span>Select an hour to view atmospheric conditions</span>
          <span className="hidden sm:inline">24-Hour Cycle</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 overflow-x-auto pb-1">
          {forecast.map((item) => {
            const isSelected = selectedHour.hour === item.hour;
            const isClean = item.isMiddayCleanWindow;

            return (
              <button
                key={item.hour}
                onClick={() => setSelectedHour(item)}
                aria-pressed={isSelected}
                aria-label={`Forecast for ${item.hour}`}
                className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between h-28 border focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                  isSelected
                    ? 'border-[#533afd] bg-[#533afd] text-white shadow-md'
                    : isClean
                    ? 'border-[#533afd]/40 bg-[#533afd]/5 text-[#0d253d] hover:bg-[#533afd]/10'
                    : 'border-[#e3e8ee] bg-[#f6f9fc] text-[#475569] hover:bg-[#e3e8ee]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#0d253d]'}`}>
                    {item.hour}
                  </span>
                  {isClean && (
                    <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#533afd]'}`} />
                  )}
                </div>

                <div>
                  <span className={`font-tabular text-lg font-bold block ${isSelected ? 'text-white' : 'text-[#0d253d]'}`}>
                    {Math.round(item.outdoorPm25)}
                  </span>
                  <span className={`text-[10px] block ${isSelected ? 'text-white/80' : 'text-[#64748d]'}`}>
                    µg/m³
                  </span>
                </div>

                <span className={`text-[10px] font-medium truncate ${isSelected ? 'text-white/90' : isClean ? 'text-[#533afd]' : 'text-[#64748d]'}`}>
                  {isClean ? 'Clean Window' : 'Inversion'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Telemetry Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#e3e8ee]">
        <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#64748d]">
            Vertical Mixing Ceiling
          </span>
          <div className="my-2">
            <span className="font-tabular text-3xl font-bold text-[#0d253d]">
              {selectedHour.pblHeightMeters}m
            </span>
            <span className="text-xs text-[#64748d] block mt-0.5">
              Planetary Boundary Layer
            </span>
          </div>
          <p className="text-[11px] text-[#475569]">
            {selectedHour.pblHeightMeters > 700
              ? 'Deep solar mixing ceiling lets surface pollution escape into higher atmosphere.'
              : 'Shallow cold layer traps vehicle and heating exhaust close to ground level.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#64748d]">
            Atmospheric Dispersion
          </span>
          <div className="my-2">
            <span className="font-tabular text-3xl font-bold text-[#533afd]">
              {selectedHour.outdoorPm25} µg/m³
            </span>
            <span className="text-xs text-[#64748d] block mt-0.5">
              Ambient Particulate Load
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0d253d]">
            <Wind className="w-3.5 h-3.5 text-[#533afd]" />
            <span>Wind speed: {selectedHour.windSpeedKmh} km/h</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#64748d]">
            Recommended Action at {selectedHour.hour}
          </span>
          <div className="my-2">
            <span className="text-base font-semibold text-[#0d253d] block">
              {selectedHour.isMiddayCleanWindow
                ? 'Open Windows & Ventilate'
                : 'Seal Windows & Filter Indoor Air'}
            </span>
            <span className="text-xs text-[#64748d] block mt-0.5">
              Ground Temp: {selectedHour.groundTempC}°C
            </span>
          </div>
          <p className="text-[11px] text-[#475569]">
            {selectedHour.isMiddayCleanWindow
              ? 'Safest window of the day for cross-ventilation, outdoor recess, and commuting.'
              : 'Stagnant boundary layer. Keep windows closed and operate indoor filters.'}
          </p>
        </div>
      </div>

      {/* 3 Actionable Time Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 text-[#533afd]" />
            <h4 className="font-heading-sm text-sm text-[#0d253d]">Morning (7:00 – 10:00 AM)</h4>
          </div>
          <p className="font-body-md text-xs text-[#475569] leading-relaxed">
            Cold ground radiation traps dense tailpipe exhaust near breathing level. Shift runs indoors and use filtered transit.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#533afd]/40 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Sun className="w-4 h-4 text-[#533afd]" />
            <h4 className="font-heading-sm text-sm text-[#0d253d]">Midday (11:30 AM – 3:30 PM)</h4>
          </div>
          <p className="font-body-md text-xs text-[#475569] leading-relaxed">
            Solar thermal convection dilutes ground particulates. Ideal 15–20 minute window to flush indoor CO₂.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <ArrowRight className="w-4 h-4 text-[#533afd]" />
            <h4 className="font-heading-sm text-sm text-[#0d253d]">Evening (5:00 – 10:00 PM)</h4>
          </div>
          <p className="font-body-md text-xs text-[#475569] leading-relaxed">
            Nocturnal cooling rapidly re-establishes the inversion lid. Latch all window sashes before sunset and run DIY purifiers.
          </p>
        </div>
      </div>
    </div>
  );
};
