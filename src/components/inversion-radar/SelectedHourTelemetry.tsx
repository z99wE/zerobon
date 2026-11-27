import React from 'react';
import { ShieldCheck, Thermometer, Wind } from 'lucide-react';
import type { HourlyAtmosphericForecast } from '../../types';

interface Props {
  selectedHour: HourlyAtmosphericForecast;
  maxPbl: number;
}

/** Dark telemetry card describing the atmospheric state at the selected hour. */
export const SelectedHourTelemetry: React.FC<Props> = ({ selectedHour, maxPbl }) => (
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
          <span className="text-[11px] text-white/90 block">Estimated Ambient PM₂.₅</span>
          <span className="font-tabular text-3xl font-extrabold text-white">
            {selectedHour.outdoorPm25} <span className="text-sm font-normal text-white/90">µg/m³</span>
          </span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-white/90">
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
        <div className="flex items-center justify-between text-xs text-white/90">
          <span>Ground Temp & Humidity</span>
          <span className="font-tabular font-semibold text-white flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-[#a5b4fc]" />
            <span>{selectedHour.groundTempC}°C</span>
          </span>
        </div>
        <div className="flex items-center gap-2 pt-1 text-xs text-white/90">
          <Wind className="w-4 h-4 text-[#a5b4fc]" />
          <span>Wind speed: {selectedHour.windSpeedKmh} km/h</span>
          <span className="text-white/75">•</span>
          <span>{selectedHour.windSpeedKmh > 8 ? 'Active Advection' : 'Stagnant Airflow'}</span>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed">
          {selectedHour.windSpeedKmh > 8
            ? 'Sufficient horizontal surface breeze to prevent particulate pooling in street canyons.'
            : 'Calm or near-zero horizontal wind causes severe localized particulate accumulation.'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-white/90">
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
);
