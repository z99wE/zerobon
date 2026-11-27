'use client';

import React, { useEffect, useRef } from 'react';
import './GhostFibers.css';

import { GRADIENTS, FIBER_STYLES, HOVER_EFFECTS, clamp, DEG } from './ghost-fibers/shaders';
import { useGhostFibersRenderer } from './ghost-fibers/useGhostFibersRenderer';
import type { GhostFibersSettings } from './ghost-fibers/types';

export interface GhostFibersProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  lineColor?: string;
  secondaryColor?: string;
  gradient?: 'depth' | 'along' | 'across';
  speed?: number;
  scale?: number;
  rotation?: number;
  rollSpeed?: number;
  layers?: number;
  waves?: number;
  twist?: number;
  threads?: number;
  volume?: number;
  spread?: number;
  density?: number;
  thickness?: number;
  flow?: number;
  fiberStyle?: 'dots' | 'dashes' | 'lines';
  tips?: number;
  foldGlow?: number;
  perspective?: number;
  depthOfField?: number;
  focusDepth?: number;
  particles?: number;
  sparkle?: number;
  glow?: number;
  brightness?: number;
  vignette?: number;
  grain?: number;
  mouseInteraction?: boolean;
  hoverEffect?: 'focus' | 'part' | 'none';
  mouseStrength?: number;
  pulseOnClick?: boolean;
  intro?: boolean;
  lightMode?: boolean;
  paused?: boolean;
  dpr?: number;
  className?: string;
}

export const GhostFibers: React.FC<GhostFibersProps> = ({
  glowColor = '#8b5cf6',
  lineColor,
  secondaryColor,
  gradient = 'depth',
  speed = 0.5,
  scale = 1,
  rotation = 18,
  rollSpeed = 0.15,
  layers = 3,
  waves = 1,
  twist = 1.2,
  threads = 72,
  volume = 0.7,
  spread = 1,
  density = 1,
  thickness = 1,
  flow = 0.4,
  fiberStyle = 'dots',
  tips = 0,
  foldGlow = 1,
  perspective = 0.65,
  depthOfField = 0.85,
  focusDepth = 0,
  particles = 0.5,
  sparkle = 0.5,
  glow = 0.8,
  brightness = 1,
  vignette = 0.3,
  grain = 0.06,
  mouseInteraction = true,
  hoverEffect = 'focus',
  mouseStrength = 1,
  pulseOnClick = true,
  intro = true,
  lightMode = false,
  paused = false,
  dpr,
  className = '',
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);

  const settings: GhostFibersSettings = {
    glowColor: String(glowColor),
    lineColor: lineColor ? String(lineColor) : '',
    secondaryColor: secondaryColor ? String(secondaryColor) : '',
    gradient: GRADIENTS[gradient] ?? 0,
    speed: Math.max(0, speed),
    scale: clamp(scale, 0.3, 3),
    rotation: rotation * DEG,
    rollSpeed,
    layers: clamp(Math.round(layers), 1, 3),
    waves: Math.max(0, waves),
    twist: Math.max(0, twist),
    threads: clamp(Math.round(threads), 6, 180),
    volume: clamp(volume, 0, 2),
    spread: clamp(spread, 0.2, 3),
    density: clamp(density, 0.2, 3),
    thickness: clamp(thickness, 0.2, 4),
    flow,
    dotLength: FIBER_STYLES[fiberStyle] ?? 0,
    tips: clamp(tips, 0, 1),
    foldGlow: clamp(foldGlow, 0, 3),
    perspective: clamp(perspective, 0, 1),
    depthOfField: clamp(depthOfField, 0, 2),
    focusDepth: clamp(focusDepth, -1, 1),
    particles: clamp(particles, 0, 2),
    sparkle: clamp(sparkle, 0, 2),
    glow: Math.max(0, glow),
    brightness: Math.max(0, brightness),
    vignette: clamp(vignette, 0, 1),
    grain: Math.max(0, grain),
    mouseInteraction,
    hover: HOVER_EFFECTS[hoverEffect] ?? 0,
    mouseStrength: Math.max(0, mouseStrength),
    pulseOnClick,
    intro,
    lightMode,
    paused,
    dpr
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useGhostFibersRenderer(containerRef, canvasRef, settingsRef, wakeRef);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div ref={containerRef} className={`ghost-fibers-container${className ? ` ${className}` : ''}`} {...rest}>
      <canvas ref={canvasRef} className="ghost-fibers-canvas" aria-hidden="true" />
    </div>
  );
};

export default GhostFibers;
