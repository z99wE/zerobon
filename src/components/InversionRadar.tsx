import React, { useState } from 'react';
import { generate24HourAtmosphericForecast } from '../engine/physics';
import { HourlyAtmosphericForecast } from '../types';
import { Sun, Wind, ShieldCheck, Thermometer } from 'lucide-react';

export const InversionRadar: React.FC = () => {
  const forecast = generate24HourAtmosphericForecast();
  
  // Real-time atmospheric selection: syncs to current local hour (no stale data)
  const currentHourDecimal = new Date().getHours() + new Date().getMinutes() / 60;
  const initialCurrentHour = forecast.reduce((prev, curr) => {
    return Math.abs(curr.time24 - currentHourDecimal) < Math.abs(prev.time24 - currentHourDecimal) ? curr : prev;
  }, forecast[0]) || forecast[0];

  const [selectedHour, setSelectedHour] = useState<HourlyAtmosphericForecast>(initialCurrentHour);

  // SVG dimensions for the 24-hour Planetary Boundary Layer (PBL) altitude curve
  const svgWidth = 800;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 24;
  const maxPbl = 1400;

  // Compute curve points
  const points = forecast.map((item, index) => {
    const x = paddingX + (index / (forecast.length - 1)) * (svgWidth - 2 * paddingX);
    // Y inverted: 0 at bottom, maxPbl at top
    const y = svgHeight - paddingY - (item.pblHeightMeters / maxPbl) * (svgHeight - 2 * paddingY);
    return { x, y, item };
  });

  // Construct SVG path string for the curve
  const pathData = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cpx1 = prev.x + (curr.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (curr.x - prev.x) / 2;
    const cpy2 = curr.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }, '');

  // Area under curve path
  const areaData = `${pathData} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Find selected point coordinates
  const activePoint = points.find((p) => p.item.hour === selectedHour.hour) ?? points[4];

  return (
    <div className="w-full space-y-8">
      {/* 1. Elevated Atmospheric Radar Header Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e3e8ee]">
          <div className="space-y-1">
            <h2 className="font-heading-lg text-2xl sm:text-3xl text-[#0d253d] font-bold">
              Clean Air Window & Inversion Forecast
            </h2>
            <p className="font-body-md text-sm text-[#475569] max-w-2xl leading-relaxed">
              Solar heating warms the ground during midday hours, causing the atmospheric boundary layer to expand upward. This naturally dilutes trapped vehicle exhaust and ground soot.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#533afd]/10 to-[#533afd]/5 border border-[#533afd]/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#533afd] text-white flex items-center justify-center shadow-sm">
                <Sun className="w-5 h-5 text-[#ffd166]" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748d] block font-semibold uppercase tracking-wider">
                  Golden Mixing Window
                </span>
                <span className="text-sm font-bold text-[#0d253d]">
                  11:30 AM – 3:30 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive SVG Atmospheric Mixing Ceiling Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748d]">
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
                  <stop offset="0%" stopColor="#64748d" />
                  <stop offset="45%" stopColor="#533afd" />
                  <stop offset="70%" stopColor="#533afd" />
                  <stop offset="100%" stopColor="#64748d" />
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
                      fill={isSelected ? '#ffffff' : isClean ? '#533afd' : '#64748d'}
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
            <div className="flex justify-between items-center text-[10px] text-[#64748d] font-tabular pt-1 px-2 border-t border-[#e3e8ee]/80">
              {forecast.map((f) => (
                <button
                  key={f.hour}
                  onClick={() => setSelectedHour(f)}
                  className={`px-1 py-0.5 rounded transition-colors ${
                    f.hour === selectedHour.hour
                      ? 'text-[#533afd] font-bold bg-[#533afd]/10'
                      : f.isMiddayCleanWindow
                      ? 'text-[#0d253d] font-semibold'
                      : 'text-[#64748d] hover:text-[#0d253d]'
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
          <div className="flex items-center justify-between mb-2.5 text-xs text-[#64748d]">
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
                  onClick={() => setSelectedHour(item)}
                  aria-pressed={isSelected}
                  aria-label={`Forecast for ${item.hour}`}
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
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#64748d]'}`}>
                      µg/m³ PM₂.₅
                    </span>
                  </div>

                  <div className="pt-1 border-t border-black/10 dark:border-white/10">
                    <span className={`text-[10px] font-semibold block truncate ${
                      isSelected ? 'text-white/95' : isClean ? 'text-[#533afd]' : 'text-[#64748d]'
                    }`}>
                      {isClean ? 'Clean Window' : 'Inversion'}
                    </span>
                    <span className={`text-[9px] block font-tabular ${isSelected ? 'text-white/70' : 'text-[#94a3b8]'}`}>
                      PBL: {item.pblHeightMeters}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Telemetry Command Card for Selected Hour (Enhanced Brand Purple Gradient) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#533afd] via-[#3c25b8] to-[#1e1b4b] text-white shadow-xl space-y-5 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/20">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-white/80 block mb-0.5">
                Atmospheric State at {selectedHour.hour}
              </span>
              <h3 className="font-heading-md text-xl sm:text-2xl font-bold text-white">
                {selectedHour.isMiddayCleanWindow
                  ? 'Active Clean Air Window (Solar Convection)'
                  : 'Surface Thermal Inversion Stagnation'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-white/70 block">Estimated Ambient PM₂.₅</span>
                <span className="font-tabular text-3xl font-extrabold text-white">
                  {selectedHour.outdoorPm25} <span className="text-sm font-normal text-white/70">µg/m³</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3 Telemetry Data Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Vertical Mixing Ceiling</span>
                <span className="font-tabular font-semibold text-white">{selectedHour.pblHeightMeters}m</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#533afd] to-[#a5b4fc] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (selectedHour.pblHeightMeters / maxPbl) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                {selectedHour.pblHeightMeters > 700
                  ? 'Deep boundary expansion allows ground pollutants to disperse upwards into the atmosphere.'
                  : 'Cold dense ground air caps smoke within street level, compounding vehicle exhaust exposure.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Ground Temp & Humidity</span>
                <span className="font-tabular font-semibold text-white flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-[#a5b4fc]" />
                  <span>{selectedHour.groundTempC}°C</span>
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-white/90">
                <Wind className="w-4 h-4 text-[#a5b4fc]" />
                <span>Wind speed: {selectedHour.windSpeedKmh} km/h</span>
                <span className="text-white/40">•</span>
                <span>{selectedHour.windSpeedKmh > 8 ? 'Active Advection' : 'Stagnant Airflow'}</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                {selectedHour.windSpeedKmh > 8
                  ? 'Sufficient horizontal surface breeze to prevent particulate pooling in street canyons.'
                  : 'Calm or near-zero horizontal wind causes severe localized particulate accumulation.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Action Protocol at {selectedHour.hour}</span>
                <ShieldCheck className="w-4 h-4 text-[#a5b4fc]" />
              </div>
              <span className="text-xs font-bold text-white block">
                {selectedHour.isMiddayCleanWindow
                  ? 'Ventilate & Run Outdoor Errands'
                  : 'Seal Windows & Run DIY Air Purifier'}
              </span>
              <p className="text-[11px] text-white/80 leading-relaxed">
                {selectedHour.isMiddayCleanWindow
                  ? 'Open opposite windows for 15–20 minutes to flush indoor CO₂ without soot flooding. Safe for outdoor cardio.'
                  : 'Latch window sashes securely to block infiltration. Avoid morning runs or prolonged roadside exposure.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Three Everyday Diurnal Routine Strategy Cards (Clean Text • No Icons) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-sm transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-heading-sm text-base font-bold text-[#0d253d]">
              Morning Inversion Peak (7:00 – 10:00 AM)
            </h4>
            <p className="font-body-md text-xs text-[#475569] leading-relaxed">
              Nocturnal surface radiation leaves ground air colder than upper air, trapping diesel exhaust under a shallow 140m lid.
            </p>
          </div>
          <div className="pt-3 border-t border-[#e3e8ee] text-xs font-semibold text-[#533afd]">
            Shift runs indoors • Ride air-filtered underground metro
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-[#533afd]/30 shadow-md transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-heading-sm text-base font-bold text-[#0d253d]">
              Midday Clean Air Window (11:30 AM – 3:30 PM)
            </h4>
            <p className="font-body-md text-xs text-[#475569] leading-relaxed">
              Solar ground heating triggers vertical thermal convection, expanding the mixing ceiling to 1,350m and naturally diluting pollution by up to 75%.
            </p>
          </div>
          <div className="pt-3 border-t border-[#e3e8ee] text-xs font-bold text-[#533afd]">
            Open windows for 15 mins • Ideal for recess & workouts
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-sm transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-heading-sm text-base font-bold text-[#0d253d]">
              Evening Inversion Return (5:00 – 10:00 PM)
            </h4>
            <p className="font-body-md text-xs text-[#475569] leading-relaxed">
              As the sun sets, ground temperatures drop rapidly, collapsing the boundary layer and trapping evening traffic smoke at surface height.
            </p>
          </div>
          <div className="pt-3 border-t border-[#e3e8ee] text-xs font-semibold text-[#0d253d]">
            Close window sashes before sunset • Engage Corsi-Rosenthal box
          </div>
        </div>
      </div>
    </div>
  );
};
