// src/components/ui/noisy-gradient-backgrounds.tsx
import React, { useEffect, useRef } from "react";

export interface ColorStop {
  color: string;
  stop: string;
}

export interface GradientBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  gradientOrigin?:
    | "center"
    | "top-left"
    | "top-middle"
    | "top-right"
    | "right-middle"
    | "bottom-right"
    | "bottom-middle"
    | "bottom-left"
    | "left-middle";
  colors?: ColorStop[];
  gradientSize?: string;
  noiseIntensity?: number;
  noisePatternSize?: number;
  noisePatternRefreshInterval?: number;
}

const DEFAULT_BRAND_COLORS: ColorStop[] = [
  { color: "rgba(13, 37, 61, 1)", stop: "0%" },      // Dark Slate
  { color: "rgba(35, 25, 95, 1)", stop: "35%" },     // Deep Indigo
  { color: "rgba(83, 58, 253, 0.95)", stop: "70%" }, // Electric Indigo
  { color: "rgba(120, 100, 255, 0.85)", stop: "100%" }
];

const ORIGIN_MAP: Record<string, string> = {
  center: "50% 50%",
  "top-left": "0% 0%",
  "top-middle": "50% 0%",
  "top-right": "100% 0%",
  "right-middle": "100% 50%",
  "bottom-right": "100% 100%",
  "bottom-middle": "50% 100%",
  "bottom-left": "0% 100%",
  "left-middle": "0% 50%",
};

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  className = "",
  style = {},
  children,
  gradientOrigin = "bottom-middle",
  colors = DEFAULT_BRAND_COLORS,
  gradientSize = "140% 140%",
  noiseIntensity = 0.9,
  noisePatternSize = 90,
  noisePatternRefreshInterval = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let frame = 0;

    const patternCanvas = document.createElement("canvas");
    const patternSize = Math.max(16, Math.min(256, Math.floor(noisePatternSize)));
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const pCtx = patternCanvas.getContext("2d");
    if (!pCtx) return;

    const generateNoiseTile = () => {
      const imgData = pCtx.createImageData(patternSize, patternSize);
      const data = imgData.data;
      const alphaVal = Math.floor(Math.min(1, Math.max(0, noiseIntensity)) * 55);

      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = alphaVal;
      }
      pCtx.putImageData(imgData, 0, 0);
    };

    generateNoiseTile();

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const render = () => {
      frame++;
      if (frame % noisePatternRefreshInterval === 0) {
        generateNoiseTile();
      }

      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pattern = ctx.createPattern(patternCanvas, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [noiseIntensity, noisePatternSize, noisePatternRefreshInterval]);

  const originPos = ORIGIN_MAP[gradientOrigin] || "50% 50%";
  const gradientStops = colors.map((c) => `${c.color} ${c.stop}`).join(", ");
  const backgroundRadial = `radial-gradient(circle at ${originPos}, ${gradientStops})`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: backgroundRadial,
        backgroundSize: gradientSize,
        ...style,
      }}
    >
      {/* Fallback CSS SVG noise overlay ensures guaranteed high-contrast grain on any browser */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-35 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Live animated canvas noise */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full mix-blend-overlay opacity-80"
        style={{ width: "100%", height: "100%" }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
