import React, { useState } from 'react';
import { generate24HourAtmosphericForecast } from '../engine/physics';
import { HourlyAtmosphericForecast } from '../types';

export const InversionRadar: React.FC = () => {
  const forecast = generate24HourAtmosphericForecast();
  const [selectedHour, setSelectedHour] = useState<HourlyAtmosphericForecast>(forecast[4]!); // 11:30 AM window

  return (
    <div className="w-full apple-glass-card rounded-3xl p-6 md:p-8">
      {/* Title & Atmospheric Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="apple-tag mb-1">Atmospheric Physics Radar</p>
          <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
            Thermal Inversion & Boundary Layer Forecast
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="apple-glass px-3.5 py-2 rounded-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-neutral-300 font-medium">Midday Window: 11:30 – 15:30</span>
          </div>
        </div>
      </div>

      {/* Interactive 24-Hour Inversion Curve Visualization */}
      <div className="relative w-full h-52 bg-white/[0.02] rounded-2xl p-4 border border-white/[0.06] flex flex-col justify-between">
        {/* Graph Legend */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>00:00 (Midnight)</span>
          <span className="text-emerald-400 font-medium">Optimal Aeration Window</span>
          <span>23:59 (Night Inversion)</span>
        </div>

        {/* SVG Curve for PBL Height & PM2.5 Inversion */}
        <div className="relative w-full h-32 flex items-end justify-between px-2">
          {/* Shaded clean air window column */}
          <div className="absolute left-[38%] right-[32%] top-0 bottom-0 bg-emerald-500/10 border-x border-emerald-500/20 rounded-lg pointer-events-none flex items-center justify-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400/80">Clean Air Window</span>
          </div>

          {forecast.map((item) => {
            const isSelected = selectedHour.hour === item.hour;
            // Height proportional to PBL height (140m to 1400m)
            const pblBarHeight = Math.max(16, (item.pblHeightMeters / 1400) * 100);

            return (
              <button
                key={item.hour}
                onClick={() => setSelectedHour(item)}
                className="group relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer focus:outline-none"
              >
                {/* PM2.5 Bar Indicator */}
                <div
                  style={{ height: `${pblBarHeight}%` }}
                  className={`w-3 md:w-5 rounded-t-md transition-all duration-300 ${
                    item.isMiddayCleanWindow
                      ? isSelected
                        ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                        : 'bg-emerald-500/60 group-hover:bg-emerald-400'
                      : isSelected
                      ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                      : 'bg-neutral-600/50 group-hover:bg-neutral-400'
                  }`}
                />

                <span className={`text-[10px] mt-2 transition-colors ${isSelected ? 'text-white font-semibold' : 'text-neutral-500'}`}>
                  {item.hour.split(':')[0]}h
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Atmospheric Diagnostics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="apple-glass p-3.5 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Boundary Layer (PBL)</p>
          <p className="text-xl font-semibold text-white mt-0.5">{selectedHour.pblHeightMeters} m</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Dispersion depth</p>
        </div>

        <div className="apple-glass p-3.5 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Outdoor Ambient</p>
          <p className={`text-xl font-semibold mt-0.5 ${selectedHour.outdoorPm25 < 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {selectedHour.outdoorPm25} µg/m³
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Fine particulate PM₂.₅</p>
        </div>

        <div className="apple-glass p-3.5 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Ground Inversion</p>
          <p className="text-base font-semibold text-white mt-0.5">{selectedHour.inversionStrength}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{selectedHour.groundTempC}°C surface temp</p>
        </div>

        <div className="apple-glass p-3.5 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Dispersion Wind</p>
          <p className="text-xl font-semibold text-white mt-0.5">{selectedHour.windSpeedKmh} km/h</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Ventilation vector</p>
        </div>
      </div>

      {/* Inversion-Aware Routine Scheduler */}
      <div className="mt-6 border-t border-white/[0.08] pt-6">
        <p className="apple-tag mb-3">Inversion-Aware Routine Swaps</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="apple-glass p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Morning School Run</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">Inversion Trap</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Shallow 140m PBL traps diesel soot. Recommend N95 respirators or carpooling via closed AC cabin.
            </p>
          </div>

          <div className="apple-glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Midday Outdoor Play & Airing</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Clean Air Window</span>
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              1,350m deep solar mixing dilutes ground pollutants. Best time for cross-ventilation and outdoor exercise.
            </p>
          </div>

          <div className="apple-glass p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Evening Return & Dinner</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Surface Cooling</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Boundary layer caps at 200m. Close window sashes before 16:30. Run kitchen range hood during cooking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
