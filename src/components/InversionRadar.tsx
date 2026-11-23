import React, { useState } from 'react';
import { generate24HourAtmosphericForecast } from '../engine/physics';
import { HourlyAtmosphericForecast } from '../types';

export const InversionRadar: React.FC = () => {
  const forecast = generate24HourAtmosphericForecast();
  const [selectedHour, setSelectedHour] = useState<HourlyAtmosphericForecast>(forecast[4]!); // 11:30 AM window

  return (
    <div className="w-full card-feature-light p-6 sm:p-8">
      {/* Title & Atmospheric Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="pill-tag-soft">Atmospheric Physics Radar</span>
          <h3 className="font-heading-lg text-[#0d253d] mt-1">
            Thermal Inversion & Boundary Layer Dispersion
          </h3>
          <p className="font-body-md text-[#64748d] mt-0.5">
            Hourly Planetary Boundary Layer (PBL) altitude curve mapping diurnal clean air windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f6f9fc] border border-[#e3e8ee]">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="font-tabular text-xs text-[#273951]">Midday Window: 11:30 – 15:30</span>
          </div>
        </div>
      </div>

      {/* Interactive 24-Hour Inversion Curve Visualization */}
      <div className="relative w-full h-56 bg-[#f6f9fc] rounded-xl p-4 border border-[#e3e8ee] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#64748d] font-tabular">
          <span>00:00 (Ground Trap)</span>
          <span className="text-[#533afd] font-medium">Solar Boundary Layer Expansion</span>
          <span>23:59 (Radiation Inversion)</span>
        </div>

        {/* 24-Hour Dispersion Graph */}
        <div className="relative w-full h-36 flex items-end justify-between px-2">
          {/* Shaded clean air window column */}
          <div className="absolute left-[38%] right-[32%] top-0 bottom-0 bg-[#533afd]/5 border-x border-[#533afd]/20 rounded-lg pointer-events-none flex items-center justify-center">
            <span className="font-micro-cap text-[#533afd]">Clean Air Window</span>
          </div>

          {forecast.map((item) => {
            const isSelected = selectedHour.hour === item.hour;
            const pblBarHeight = Math.max(16, (item.pblHeightMeters / 1400) * 100);

            return (
              <button
                key={item.hour}
                onClick={() => setSelectedHour(item)}
                className="group relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer focus:outline-none"
              >
                <div
                  style={{ height: `${pblBarHeight}%` }}
                  className={`w-3 sm:w-5 rounded-t transition-all duration-200 ${
                    item.isMiddayCleanWindow
                      ? isSelected
                        ? 'bg-[#533afd] shadow-md shadow-[#533afd]/30'
                        : 'bg-[#533afd]/60 group-hover:bg-[#533afd]'
                      : isSelected
                      ? 'bg-[#ea2261] shadow-md shadow-[#ea2261]/30'
                      : 'bg-[#a8c3de] group-hover:bg-[#64748d]'
                  }`}
                />

                <span className={`font-tabular text-[11px] mt-2 transition-colors ${isSelected ? 'text-[#0d253d] font-medium' : 'text-[#64748d]'}`}>
                  {item.hour.split(':')[0]}h
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Telemetry Grid (Tabular Figures) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <span className="font-micro-cap text-[#64748d]">Boundary Layer (PBL)</span>
          <p className="font-tabular text-2xl font-normal text-[#0d253d] mt-1">{selectedHour.pblHeightMeters} m</p>
          <span className="font-caption text-[#64748d]">Vertical mixing depth</span>
        </div>

        <div className="p-4 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <span className="font-micro-cap text-[#64748d]">Ambient PM₂.₅</span>
          <p className={`font-tabular text-2xl font-normal mt-1 ${selectedHour.outdoorPm25 < 75 ? 'text-[#34d399]' : 'text-[#ea2261]'}`}>
            {selectedHour.outdoorPm25} µg/m³
          </p>
          <span className="font-caption text-[#64748d]">Fine particulate</span>
        </div>

        <div className="p-4 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <span className="font-micro-cap text-[#64748d]">Inversion State</span>
          <p className="font-heading-sm text-[#0d253d] mt-1">{selectedHour.inversionStrength}</p>
          <span className="font-tabular text-xs text-[#64748d]">{selectedHour.groundTempC}°C surface</span>
        </div>

        <div className="p-4 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <span className="font-micro-cap text-[#64748d]">Wind Vector</span>
          <p className="font-tabular text-2xl font-normal text-[#0d253d] mt-1">{selectedHour.windSpeedKmh} km/h</p>
          <span className="font-caption text-[#64748d]">Advective dispersion</span>
        </div>
      </div>

      {/* Inversion-Aware Routine Scheduler Cards */}
      <div className="mt-8 pt-6 border-t border-[#e3e8ee]">
        <span className="font-micro-cap text-[#64748d] mb-3 block">Inversion-Aware Routine Swaps</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#ffffff] border border-[#e3e8ee] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading-sm text-[#0d253d]">Morning School Run</span>
              <span className="text-[10px] text-[#ea2261] px-2 py-0.5 rounded-full bg-[#ea2261]/10 font-mono">Inversion Peak</span>
            </div>
            <p className="font-body-md text-xs text-[#64748d] leading-relaxed">
              Shallow 140m PBL traps diesel exhaust at street grade. Suggest closed-cabin carpool or underground metro transit.
            </p>
          </div>

          {/* Warm Cream Band Card (Stripe Chromatic Interlude) */}
          <div className="card-cream-band p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading-sm text-[#0d253d]">Midday Airing & Recess</span>
              <span className="text-[10px] text-[#9b6829] px-2 py-0.5 rounded-full bg-[#9b6829]/15 font-mono">Clean Window</span>
            </div>
            <p className="font-body-md text-xs text-[#0d253d]/80 leading-relaxed">
              Deep 1,350m thermal mixing dilutes ground pollutants. Ideal window for cross-ventilation, outdoor recess, and errands.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#ffffff] border border-[#e3e8ee] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading-sm text-[#0d253d]">Evening Inversion Return</span>
              <span className="text-[10px] text-[#273951] px-2 py-0.5 rounded-full bg-[#f6f9fc] border border-[#e3e8ee] font-mono">Surface Capping</span>
            </div>
            <p className="font-body-md text-xs text-[#64748d] leading-relaxed">
              Planetary boundary layer collapses at 16:30. Close window sashes before sunset and engage Corsi-Rosenthal unit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
