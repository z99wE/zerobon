import React from 'react';

interface SmogSimulatorSectionProps {
  outdoorPm25: number;
  onSetOutdoorPm25: (val: number) => void;
}

const PRESET_LEVELS: ReadonlyArray<{
  value: number;
  label: string;
  ariaLabel: string;
  highlight?: boolean;
}> = [
  { value: 35, label: 'Clear Air (35)', ariaLabel: 'Simulate clear air at 35 micrograms per cubic meter' },
  { value: 160, label: 'Haze (160)', ariaLabel: 'Simulate haze at 160 micrograms per cubic meter' },
  {
    value: 280,
    label: 'Winter Smog (280)',
    ariaLabel: 'Simulate severe winter smog at 280 micrograms per cubic meter',
    highlight: true,
  },
];

const VERIFICATION_METRICS: ReadonlyArray<{
  label: string;
  value: string;
  sublabel: string;
  accentValue?: boolean;
}> = [
  { label: 'Hourly soundings', value: '5,040', sublabel: '14-day winter basins' },
  { label: 'Mean solar dilution', value: '74.4%', sublabel: '11:30 AM – 3:30 PM peak' },
  { label: 'Nocturnal inversion lid', value: '142m', sublabel: 'Surface vehicle lid' },
  { label: 'Avoided alveolar dose', value: '3.9×', sublabel: 'Midday vs 7:30 AM', accentValue: true },
];

export const SmogSimulatorSection: React.FC<SmogSimulatorSectionProps> = ({
  outdoorPm25,
  onSetOutdoorPm25,
}) => {
  const dispersionLabel =
    outdoorPm25 < 60
      ? 'Moderate Dispersion'
      : outdoorPm25 < 150
      ? 'Unhealthy Surface Haze'
      : 'Severe Thermal Inversion Smog';

  return (
    <>
      {/* 3. Interactive Atmospheric Telemetry & Smog Simulator Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee]">
          <div>
            <h3 className="font-heading-md text-xl font-bold text-[#0d253d]">
              Live Atmospheric Telemetry & Smog Slider
            </h3>
            <p className="font-body-md text-xs text-[#475569] mt-0.5">
              Simulate ambient winter pollution spikes to see how indoor air quality reacts in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {PRESET_LEVELS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.ariaLabel}
                onClick={() => onSetOutdoorPm25(preset.value)}
                className={`px-3 py-1.5 rounded-full text-xs bg-[#f6f9fc] hover:bg-[#e3e8ee] border border-[#e3e8ee] transition-all ${
                  preset.highlight ? 'text-[#533afd] font-semibold' : 'text-[#0d253d] font-medium'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <span className="text-xs text-[#64748d] font-semibold block">Simulated Ambient Pollution:</span>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular text-4xl font-extrabold text-[#533afd]">
                {outdoorPm25}
              </span>
              <span className="text-xs text-[#475569]">µg/m³ PM₂.₅</span>
            </div>
            <span className="text-[11px] text-[#64748d]">{dispersionLabel}</span>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748d]">
              <span>Slide to simulate severe pollution conditions</span>
              <span className="font-tabular font-bold text-[#0d253d]">{outdoorPm25} µg/m³</span>
            </div>
            <input
              type="range"
              min={25}
              max={380}
              aria-label="Simulate Ambient Smog PM2.5 Level"
              value={outdoorPm25}
              onChange={(e) => onSetOutdoorPm25(Number(e.target.value))}
              className="w-full accent-[#533afd] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#64748d]">
              <span>Clean Day (25 µg/m³)</span>
              <span>Moderate (100 µg/m³)</span>
              <span>Emergency Peak (380 µg/m³)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Hi-Fi Interactive Atmospheric Verification Block (Reveals on Hover at Footer Level) */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Atmospheric Research & Ground-Truth Verification Data"
        className="group relative w-full rounded-3xl overflow-hidden border border-white/80 hover:border-[#533afd]/50 bg-white/70 backdrop-blur-2xl hover:bg-[#0d253d] p-8 sm:p-12 lg:p-16 transition-all duration-700 ease-out cursor-default shadow-[0_20px_60px_-15px_rgba(83,58,253,0.08)] hover:shadow-2xl hover:shadow-[#533afd]/20"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(83,58,253,0.35),transparent_65%),radial-gradient(ellipse_70%_70%_at_85%_90%,rgba(185,185,249,0.22),transparent_60%)]"
        />

        <div className="relative z-10 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#0d253d] group-hover:text-white transition-colors duration-500">
              Validated across{' '}
              <span className="text-[#533afd] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#b9b9f9] group-hover:via-white group-hover:to-[#b9b9f9] transition-all duration-500 underline decoration-[#533afd]/30 group-hover:decoration-white/30 decoration-4 underline-offset-8">
                5,040 hourly atmospheric observations
              </span>{' '}
              in 15 winter smog basins.
            </h2>

            <p className="font-body-lg text-sm sm:text-base text-[#475569] group-hover:text-white/85 max-w-3xl leading-relaxed transition-colors duration-500">
              Nocturnal surface radiation cooling traps heavy exhaust below 140m every winter morning. By 11:30 AM, solar thermal ground heating triggers vertical convective boundary-layer expansion, achieving a 74.4% natural dilution ceiling across global urban airsheds.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#e3e8ee] group-hover:border-white/15 transition-colors duration-500">
            {VERIFICATION_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-2xl bg-white/80 group-hover:bg-white/10 border border-[#e3e8ee] group-hover:border-white/15 backdrop-blur-sm transition-all duration-500"
              >
                <span className="text-xs text-[#64748d] group-hover:text-white/60 block mb-1">
                  {metric.label}
                </span>
                <span
                  className={`font-tabular text-2xl sm:text-3xl font-extrabold text-[#0d253d] ${
                    metric.accentValue ? 'group-hover:text-[#b9b9f9]' : 'group-hover:text-white'
                  } transition-colors`}
                >
                  {metric.value}
                </span>
                <span className="text-xs text-[#533afd] group-hover:text-[#b9b9f9] block mt-1 font-medium">
                  {metric.sublabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
