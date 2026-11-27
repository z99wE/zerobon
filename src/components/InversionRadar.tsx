import React, { useState, useMemo } from 'react';
import { generate24HourAtmosphericForecast } from '../engine/physics';
import { getCityProfile, CityAirProfile } from '../engine/city-data';
import { HourlyAtmosphericForecast } from '../types';
import { Sun } from 'lucide-react';
import { PBL_CHART, buildPblCurve } from './inversion-radar/geometry';
import { SelectedHourTelemetry } from './inversion-radar/SelectedHourTelemetry';
import { DiurnalStrategyCards } from './inversion-radar/DiurnalStrategyCards';

interface InversionRadarProps {
  selectedCity?: string;
  outdoorPm25?: number;
  cityProfile?: CityAirProfile;
  cleanWindowHours?: string;
  isLiveReading?: boolean;
}

export const InversionRadar: React.FC<InversionRadarProps> = ({
  selectedCity = 'Delhi NCR',
  outdoorPm25 = 245,
  cityProfile,
  cleanWindowHours,
  isLiveReading = false,
}) => {
  const profile = cityProfile || getCityProfile(selectedCity);
  const activeCleanWindow = cleanWindowHours || profile.cleanWindowHours;

  const forecast = useMemo(() => {
    return generate24HourAtmosphericForecast(
      outdoorPm25,
      profile.terrainType,
      profile.pblHeightMeters,
      profile.temperatureC
    );
  }, [outdoorPm25, profile.terrainType, profile.pblHeightMeters, profile.temperatureC]);
  
  // Real-time atmospheric selection: syncs to current local hour and updates dynamically when forecast changes
  const initialHourKey = useMemo(() => {
    const currentHourDecimal = new Date().getHours() + new Date().getMinutes() / 60;
    const closest = forecast.reduce((prev, curr) => {
      return Math.abs(curr.time24 - currentHourDecimal) < Math.abs(prev.time24 - currentHourDecimal) ? curr : prev;
    }, forecast[0]) || forecast[0];
    return closest.hour;
  }, [forecast]);

  const [selectedHourKey, setSelectedHourKey] = useState<string>(initialHourKey);
  const selectedHour: HourlyAtmosphericForecast = useMemo(() => {
    return forecast.find((h) => h.hour === selectedHourKey) ?? forecast[0];
  }, [forecast, selectedHourKey]);
  const setSelectedHour = (item: HourlyAtmosphericForecast) => setSelectedHourKey(item.hour);

  const { width: svgWidth, height: svgHeight, paddingX, paddingY, maxPbl } = PBL_CHART;

  // Memoize curve geometry so hover/other state updates don't recompute Bézier paths
  const { points, pathData, areaData, activePoint } = useMemo(
    () => buildPblCurve(forecast, selectedHour),
    [forecast, selectedHour]
  );

  return (
    <div className="w-full space-y-8">
      {/* 1. Elevated Atmospheric Radar Header Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#533afd] uppercase tracking-wider">
                {selectedCity} Microclimate
              </span>
              <span className="text-xs text-[#475569]">·</span>
              <span className="text-xs text-[#475569]">
                {isLiveReading ? 'Live CAMS Satellite & Station Feed' : 'Verified Atmospheric Baseline'}
              </span>
            </div>
            <h2 className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d] font-bold">
              Clean Air Window & Inversion Forecast
            </h2>
            <p className="font-body-md text-sm text-[#475569] max-w-2xl leading-relaxed">
              Solar heating warms the ground during midday hours in {selectedCity} ({profile.terrainType}), expanding the mixing boundary to dilute ground-level vehicle soot and PM₂.₅ by up to 74%.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#533afd]/10 to-[#533afd]/5 border border-[#533afd]/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#533afd] text-white flex items-center justify-center shadow-sm">
                <Sun className="w-5 h-5 text-[#ffd166]" />
              </div>
              <div>
                <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
                  Golden Mixing Window
                </span>
                <span className="text-sm font-bold text-[#0d253d]">
                  {activeCleanWindow}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive SVG Atmospheric Mixing Ceiling Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#475569]">
            <span className="font-semibold text-[#0d253d]">
              Boundary Layer Mixing Height vs. Ground Stagnation (24-Hour Profile)
            </span>
            <span className="hidden sm:inline font-tabular">
              Click any hour point to inspect microclimate
            </span>
          </div>

          <div className="relative w-full bg-[#f8fafc] rounded-2xl p-4 border border-[#e3e8ee] overflow-hidden">
            {/* Background Daylight / Night shading zones */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div className="w-[42%] h-full bg-slate-900/[0.03]" />
              <div className="w-[28%] h-full bg-[#533afd]/[0.06] border-x border-[#533afd]/15" />
              <div className="w-[30%] h-full bg-slate-900/[0.03]" />
            </div>

            <svg
              role="img"
              aria-label={`24-hour Planetary Boundary Layer mixing altitude curve for ${selectedCity}`}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible relative z-10"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pbl-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#533afd" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#533afd" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#533afd" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="pbl-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="45%" stopColor="#533afd" />
                  <stop offset="70%" stopColor="#533afd" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>

              {/* Grid Reference Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={svgWidth - paddingX}
                y2={paddingY}
                stroke="#cbd5e1"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text x={paddingX + 4} y={paddingY + 12} fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                1,350m Peak Solar Mixing
              </text>

              <line
                x1={paddingX}
                y1={svgHeight - paddingY - 30}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY - 30}
                stroke="#cbd5e1"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text x={paddingX + 4} y={svgHeight - paddingY - 34} fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                140m Cold Surface Inversion Trap
              </text>

              {/* Area Under Curve */}
              <path d={areaData} fill="url(#pbl-fill)" />

              {/* Curve Stroke Line */}
              <path
                d={pathData}
                fill="none"
                stroke="url(#pbl-stroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Points on the Curve */}
              {points.map((p) => {
                const isSelected = p.item.hour === selectedHour.hour;
                const isClean = p.item.isMiddayCleanWindow;

                return (
                  <g
                    key={p.item.hour}
                    className="cursor-pointer transition-transform"
                    onClick={() => setSelectedHour(p.item)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 6 : isClean ? 4.5 : 3.5}
                      fill={isSelected ? '#ffffff' : isClean ? '#533afd' : '#475569'}
                      stroke={isSelected ? '#533afd' : '#ffffff'}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                  </g>
                );
              })}

              {/* Active Selection Pin Indicator */}
              <line
                x1={activePoint.x}
                y1={activePoint.y + 8}
                x2={activePoint.x}
                y2={svgHeight - paddingY}
                stroke="#533afd"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </svg>

            {/* Time labels below chart */}
            <div className="flex justify-between items-center text-[10px] text-[#475569] font-tabular pt-1 px-2 border-t border-[#e3e8ee]/80">
              {forecast.map((f) => (
                <button
                  key={f.hour}
                  type="button"
                  aria-label={`Select ${f.hour} atmospheric sounding`}
                  onClick={() => setSelectedHour(f)}
                  className={`px-1 py-0.5 rounded transition-colors ${
                    f.hour === selectedHour.hour
                      ? 'text-[#533afd] font-bold bg-[#533afd]/10'
                      : f.isMiddayCleanWindow
                      ? 'text-[#0d253d] font-semibold'
                      : 'text-[#475569] hover:text-[#0d253d]'
                  }`}
                >
                  {f.hour}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Hourly Clean Air Forecast Strip (Interactive Selector Cards) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 text-xs text-[#475569]">
            <span className="font-semibold text-[#0d253d]">24-Hour Diurnal Timeline</span>
            <span>Tap any hour block below</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 overflow-x-auto pb-1">
            {forecast.map((item) => {
              const isSelected = selectedHour.hour === item.hour;
              const isClean = item.isMiddayCleanWindow;

              return (
                <button
                  key={item.hour}
                  type="button"
                  aria-label={`Forecast for ${item.hour}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedHour(item)}
                  className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between h-32 border focus:outline-none focus:ring-2 focus:ring-[#533afd] ${
                    isSelected
                      ? 'border-[#533afd] bg-gradient-to-b from-[#533afd] to-[#3a22c4] text-white shadow-lg ring-2 ring-[#533afd]/30 scale-[1.02]'
                      : isClean
                      ? 'border-[#533afd]/40 bg-gradient-to-b from-[#533afd]/5 to-transparent text-[#0d253d] hover:border-[#533afd] hover:bg-[#533afd]/10'
                      : 'border-[#e3e8ee] bg-[#f8fafc] text-[#475569] hover:bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#0d253d]'}`}>
                      {item.hour}
                    </span>
                    {isClean && (
                      <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ffd166]' : 'text-[#533afd]'}`} />
                    )}
                  </div>

                  <div>
                    <span className={`font-tabular text-xl font-extrabold block leading-none ${isSelected ? 'text-white' : 'text-[#0d253d]'}`}>
                      {Math.round(item.outdoorPm25)}
                    </span>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#475569]'}`}>
                      µg/m³ PM₂.₅
                    </span>
                  </div>

                  <div className="pt-1 border-t border-black/10 dark:border-white/10">
                    <span className={`text-[10px] font-semibold block truncate ${
                      isSelected ? 'text-white/95' : isClean ? 'text-[#533afd]' : 'text-[#475569]'
                    }`}>
                      {isClean ? 'Clean Window' : 'Inversion'}
                    </span>
                    <span className={`text-[9px] block font-tabular ${isSelected ? 'text-white/80' : 'text-[#475569]'}`}>
                      PBL: {item.pblHeightMeters}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <SelectedHourTelemetry selectedHour={selectedHour} maxPbl={maxPbl} />
      </div>

        <DiurnalStrategyCards />
    </div>
  );
};
