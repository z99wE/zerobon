import React from 'react';
import type { CityAirProfile } from '../../engine/city-data';

interface Props {
  outdoorPm25: number;
  cityProfile: CityAirProfile;
}

/** Four live atmospheric metrics shown under the hero headline. */
export const HeroTelemetryRow: React.FC<Props> = ({ outdoorPm25, cityProfile }) => (
        <div className="pt-6 border-t border-[#e3e8ee] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Ambient Air Quality
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {Math.round(outdoorPm25)}
              </span>
              <span className="text-xs text-[#475569]">µg/m³ PM₂.₅</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Surface Temp & Humidity
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cityProfile.temperatureC}°C
              </span>
              <span className="text-xs text-[#475569]">· {cityProfile.humidityPct}% RH</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Wind Dispersion
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-2xl font-bold text-[#0d253d]">
                {cityProfile.windSpeedKmh}
              </span>
              <span className="text-xs text-[#475569]">km/h {cityProfile.windDirection}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm">
            <span className="text-[11px] text-[#475569] block font-semibold uppercase tracking-wider">
              Atmospheric State
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-tabular text-base font-semibold text-[#533afd] truncate">
                {outdoorPm25 > 160 ? 'Thermal Inversion Cap' : 'Active Boundary Layer'}
              </span>
            </div>
          </div>
        </div>
);
