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

    // Create realistic sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    if (mode === 'clean') {
      grad.addColorStop(0, '#1e40af'); // Deep Rayleigh blue
      grad.addColorStop(0.5, '#38bdf8'); // Sky cyan
      grad.addColorStop(1, '#bae6fd');
    } else if (mode === 'moderate') {
      grad.addColorStop(0, '#64748b'); // Mixed Mie haze
      grad.addColorStop(0.5, '#94a3b8');
      grad.addColorStop(1, '#cbd5e1');
    } else {
      grad.addColorStop(0, '#78716c'); // Winter smog yellowish-grey
      grad.addColorStop(0.5, '#a8a29e');
      grad.addColorStop(1, '#d6d3d1');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Analyze pixels
    const imgData = ctx.getImageData(0, 0, width, height);
    const analysis = analyzeSkyLuminanceData(imgData);
    setResult(analysis);
  };

  useEffect(() => {
    drawAndAnalyzeSky(skySample);
  }, [skySample]);

  return (
    <div className="w-full apple-glass-card rounded-3xl p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="apple-tag mb-1">Zero-Hardware Optical Estimator</p>
          <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
            Sky Turbidity & Rayleigh Scattering Analyzer
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-neutral-300 font-medium">Luminance Edge Pipeline Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Sky Viewfinder Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
          <canvas ref={canvasRef} width={400} height={240} className="w-full h-56 object-cover" />

          {/* Crosshair & Zenith Sampling Box */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-32 h-20 border border-white/40 rounded-lg flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <span className="text-[10px] text-white/90 uppercase tracking-wider font-mono">Zenith Sample</span>
            </div>
          </div>

          {/* Sample Preset Switcher */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
            <button
              onClick={() => setSkySample('clean')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                skySample === 'clean' ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-black/80'
              }`}
            >
              Clean Sky
            </button>
            <button
              onClick={() => setSkySample('moderate')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                skySample === 'moderate' ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-black/80'
              }`}
            >
              Noon Haze
            </button>
            <button
              onClick={() => setSkySample('severe')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                skySample === 'severe' ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-black/80'
              }`}
            >
              Winter Smog
            </button>
          </div>
        </div>

        {/* Optical Diagnostics & Calculation Card */}
        <div className="apple-glass p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-xs font-semibold text-white">Scattering Ratio & Inferred PM₂.₅</span>
            {result && (
              <span className="text-xs font-medium text-emerald-400">
                {result.confidencePercent}% Confidence
              </span>
            )}
          </div>

          {result && (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-400 text-xs">Estimated Ambient PM₂.₅:</span>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {result.inferredPm25} <span className="text-xs text-neutral-400 font-normal">µg/m³</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Rayleigh B/R Ratio:</span>
                <span className="text-white font-mono">{result.blueToRedRatio}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Aerosol Optical Depth (AOD):</span>
                <span className="text-white font-mono">{result.estimatedAOD}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-neutral-400">Atmospheric Scattering Class:</span>
                <span className="text-sky-300 font-medium">{result.hazeClass}</span>
              </div>

              <button
                onClick={() => onApplyEstimatedOutdoorPm25(result.inferredPm25)}
                className="w-full mt-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all active:scale-95 shadow-md shadow-sky-500/20"
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
