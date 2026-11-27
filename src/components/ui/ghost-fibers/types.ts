/** Normalised, clamped renderer settings shared by the component and its WebGL hook. */
export interface GhostFibersSettings {
  glowColor: string;
  lineColor: string;
  secondaryColor: string;
  gradient: number;
  speed: number;
  scale: number;
  rotation: number;
  rollSpeed: number;
  layers: number;
  waves: number;
  twist: number;
  threads: number;
  volume: number;
  spread: number;
  density: number;
  thickness: number;
  flow: number;
  dotLength: number;
  tips: number;
  foldGlow: number;
  perspective: number;
  depthOfField: number;
  focusDepth: number;
  particles: number;
  sparkle: number;
  glow: number;
  brightness: number;
  vignette: number;
  grain: number;
  mouseInteraction: boolean;
  hover: number;
  mouseStrength: number;
  pulseOnClick: boolean;
  intro: boolean;
  lightMode: boolean;
  paused: boolean;
  dpr: number | undefined;
}

/** Structural ref type so the hook does not depend on a specific React ref implementation. */
export type MutableRef<T> = { current: T };
