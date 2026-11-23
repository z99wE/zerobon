import React, { useRef, useState, useEffect } from 'react';
import { analyzeSkyLuminanceData, TurbidityResult } from '../engine/optical-haze';

interface OpticalHazeEstimatorProps {
  onApplyEstimatedOutdoorPm25: (pm: number) => void;
}

export const OpticalHazeEstimator: React.FC<OpticalHazeEstimatorProps> = ({ onApplyEstimatedOutdoorPm25 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<TurbidityResult | null>(null);
  const [skySample, setSkySample] = useState<'clean' | 'moderate' | 'severe'>('moderate');

  const drawAndAnalyzeSky = (mode: 'clean' | 'moderate' | 'severe') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    if (mode === 'clean') {
      grad.addColorStop(0, '#1e40af');
      grad.addColorStop(0.5, '#533afd');
      grad.addColorStop(1, '#b9b9f9');
    } else if (mode === 'moderate') {
      grad.addColorStop(0, '#64748d');
      grad.addColorStop(0.5, '#94a3b8');
      grad.addColorStop(1, '#cbd5e1');
    } else {
      grad.addColorStop(0, '#9b6829');
      grad.addColorStop(0.5, '#a8a29e');
      grad.addColorStop(1, '#f5e9d4');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const analysis = analyzeSkyLuminanceData(imgData);
    setResult(analysis);
  };

  useEffect(() => {
    drawAndAnalyzeSky(skySample);
  }, [skySample]);

  return (
    <div className="w-full card-feature-light p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading-lg text-[#0d253d] mt-1">
            Sky Turbidity & Rayleigh Scattering Pipeline
          </h3>
          <p className="font-body-md text-[#64748d] mt-0.5">
            Client-side blue-to-red luminance scattering ratio estimating local Aerosol Optical Depth (AOD).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#34d399]" />
          <span className="font-tabular text-xs text-[#273951]">Optical Engine Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Sky Viewfinder Canvas */}
        <div className="relative rounded-xl overflow-hidden border border-[#e3e8ee] bg-[#f6f9fc]">
          <canvas ref={canvasRef} width={400} height={240} className="w-full h-56 object-cover" />

          {/* Crosshair & Sampling Box */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-32 h-20 border border-white/60 rounded flex flex-col items-center justify-center bg-black/15 backdrop-blur-[1px]">
              <span className="text-[10px] text-white uppercase tracking-wider font-mono">Zenith Band</span>
            </div>
          </div>

          {/* Sample Switcher Pills */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2" role="group" aria-label="Sky sample modes">
            <button
              onClick={() => setSkySample('clean')}
              aria-pressed={skySample === 'clean'}
              aria-label="Select Clean Rayleigh Sky Sample"
              className={`px-3 py-1 rounded-full text-xs font-light transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                skySample === 'clean' ? 'bg-[#533afd] text-white shadow-sm' : 'bg-white/80 text-[#0d253d] hover:bg-white'
              }`}
            >
              Rayleigh Sky
            </button>
            <button
              onClick={() => setSkySample('moderate')}
              aria-pressed={skySample === 'moderate'}
              aria-label="Select Noon Haze Sky Sample"
              className={`px-3 py-1 rounded-full text-xs font-light transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                skySample === 'moderate' ? 'bg-[#533afd] text-white shadow-sm' : 'bg-white/80 text-[#0d253d] hover:bg-white'
              }`}
            >
              Noon Haze
            </button>
            <button
              onClick={() => setSkySample('severe')}
              aria-pressed={skySample === 'severe'}
              aria-label="Select Winter Smog Sky Sample"
              className={`px-3 py-1 rounded-full text-xs font-light transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                skySample === 'severe' ? 'bg-[#533afd] text-white shadow-sm' : 'bg-white/80 text-[#0d253d] hover:bg-white'
              }`}
            >
              Winter Smog
            </button>
          </div>
        </div>

        {/* Optical Diagnostics & Calculation Card */}
        <div className="p-5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-4">
          <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-3">
            <span className="font-heading-sm text-xs text-[#0d253d]">Rayleigh Ratio & Ambient Inference</span>
            {result && (
              <span className="font-tabular text-xs text-[#34d399] font-medium">
                {result.confidencePercent}% Confidence
              </span>
            )}
          </div>

          {result && (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="font-body-md text-xs text-[#64748d]">Estimated Ambient PM₂.₅:</span>
                <span className="font-tabular text-3xl font-normal text-[#0d253d]">
                  {result.inferredPm25} <span className="text-xs text-[#64748d] font-normal">µg/m³</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-[#e3e8ee]">
                <span className="text-[#64748d]">Rayleigh B/R Ratio:</span>
                <span className="font-tabular text-[#0d253d] font-medium">{result.blueToRedRatio}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-[#e3e8ee]">
                <span className="text-[#64748d]">Aerosol Optical Depth (AOD):</span>
                <span className="font-tabular text-[#0d253d] font-medium">{result.estimatedAOD}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-[#64748d]">Aerosol Scattering Class:</span>
                <span className="font-body-md text-xs text-[#533afd] font-medium">{result.hazeClass}</span>
              </div>

              <button
                onClick={() => onApplyEstimatedOutdoorPm25(result.inferredPm25)}
                className="w-full mt-2 button-primary-pill"
              >
                Apply Inferred Ambient to 3D Dome
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
