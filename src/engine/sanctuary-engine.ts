// src/engine/sanctuary-engine.ts
import { z } from 'zod';
import { MassBalanceParams } from '../types';

export type BuildingType = 'brick_drafty' | 'standard_apartment' | 'modern_airtight';
export type FloorLevel = 'ground_first' | 'mid_rise' | 'high_rise';
export type RoomZone = 'bedroom' | 'master_suite' | 'living_hall';

export interface SanctuaryProfile {
  buildingType: BuildingType;
  floorLevel: FloorLevel;
  roomZone: RoomZone;
  roomVolumeM3: number;
  customZoneName?: string;
  isCustomized: boolean;
}

export const BUILDING_DEFINITIONS = {
  brick_drafty: {
    title: 'Older Brick / Masonry',
    subtitle: 'Drafty wooden window sashes',
    penetration: 0.88,
    airExchangeAch: 1.25,
    note: 'Cold smog whistles through perimeter gaps',
  },
  standard_apartment: {
    title: 'Standard Apartment',
    subtitle: 'Standard aluminum/UPVC sashes',
    penetration: 0.78,
    airExchangeAch: 0.85,
    note: 'Standard urban residential permeability',
  },
  modern_airtight: {
    title: 'Modern Airtight Build',
    subtitle: 'Double-glazed rubberized gaskets',
    penetration: 0.52,
    airExchangeAch: 0.42,
    note: 'Tight envelope blocks ~50% of ambient infiltration',
  },
} as const;

export const FLOOR_DEFINITIONS = {
  ground_first: {
    title: 'Ground / 1st Floor',
    subtitle: 'Surface Inversion Trap',
    exposureMultiplier: 1.35,
    note: '+35% diesel exhaust & road dust trapped at street height',
  },
  mid_rise: {
    title: 'Floors 2 – 6',
    subtitle: 'Mid-Rise Urban Level',
    exposureMultiplier: 1.00,
    note: 'Standard ambient reference exposure',
  },
  high_rise: {
    title: '7th Floor & Above',
    subtitle: 'Above Ground Layer',
    exposureMultiplier: 0.75,
    note: '-25% exposure; sits above the shallow 25m vehicle soot lid',
  },
} as const;

export const ROOM_ZONE_DEFINITIONS = {
  bedroom: { title: 'Family Bedroom', defaultVolume: 90 },
  master_suite: { title: 'Master Suite', defaultVolume: 140 },
  living_hall: { title: 'Living & Dining Hall', defaultVolume: 240 },
} as const;

export const DEFAULT_SANCTUARY_PROFILE: SanctuaryProfile = {
  buildingType: 'standard_apartment',
  floorLevel: 'mid_rise',
  roomZone: 'bedroom',
  roomVolumeM3: 90,
  customZoneName: 'Bedroom Sanctuary',
  isCustomized: false,
};

const STORAGE_KEY = 'zerobon_sanctuary_profile_v1';

const SanctuaryProfileSchema = z.object({
  buildingType: z.enum(['brick_drafty', 'standard_apartment', 'modern_airtight']).catch(DEFAULT_SANCTUARY_PROFILE.buildingType),
  floorLevel: z.enum(['ground_first', 'mid_rise', 'high_rise']).catch(DEFAULT_SANCTUARY_PROFILE.floorLevel),
  roomZone: z.enum(['bedroom', 'master_suite', 'living_hall']).catch(DEFAULT_SANCTUARY_PROFILE.roomZone),
  roomVolumeM3: z.number().finite().min(20).max(500).default(DEFAULT_SANCTUARY_PROFILE.roomVolumeM3),
  customZoneName: z.string().trim().min(1).max(60).default(DEFAULT_SANCTUARY_PROFILE.customZoneName ?? 'Bedroom Sanctuary'),
  isCustomized: z.boolean().optional(),
});

export function loadSanctuaryProfile(): SanctuaryProfile {
  if (typeof window === 'undefined') return DEFAULT_SANCTUARY_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SANCTUARY_PROFILE;
    const parsed = SanctuaryProfileSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return DEFAULT_SANCTUARY_PROFILE;
    }
    return {
      ...parsed.data,
      isCustomized: true,
    };
  } catch (err) {
    console.warn('Failed to load sanctuary profile from localStorage:', err);
    return DEFAULT_SANCTUARY_PROFILE;
  }
}

export function saveSanctuaryProfile(profile: SanctuaryProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, isCustomized: true }));
  } catch (err) {
    console.warn('Failed to save sanctuary profile to localStorage:', err);
  }
}

export function calculateCalibratedPhysics(
  profile: SanctuaryProfile,
  rawOutdoorPm25: number,
  activeHacks: {
    corsiRosenthal: boolean;
    kitchenExhaust: boolean;
    draftSealing: boolean;
    windowOpen: boolean;
  }
): {
  calibratedParams: MassBalanceParams;
  effectiveOutdoorPm25: number;
} {
  const bldg = BUILDING_DEFINITIONS[profile.buildingType];
  const floor = FLOOR_DEFINITIONS[profile.floorLevel];

  // Effective outdoor PM2.5 at this exact building elevation
  const effectiveOutdoorPm25 = Math.round(rawOutdoorPm25 * floor.exposureMultiplier);

  // Modulation based on building envelope
  let p_pen: number = bldg.penetration;
  let ach: number = bldg.airExchangeAch;

  // Active user interventions
  if (activeHacks.draftSealing) {
    p_pen *= 0.65; // Draft tape seals window perimeter
    ach *= 0.70;
  }

  if (activeHacks.windowOpen) {
    ach = Math.max(ach, 3.5); // 15-min air flush
    p_pen = 1.0;
  }

  // Clean Air Delivery Rate (m3/h)
  let cadr = 0;
  if (activeHacks.corsiRosenthal) {
    cadr += 380; // Corsi-Rosenthal unit with 4x MERV-13 filters
  }

  const calibratedParams: MassBalanceParams = {
    p_penetration: Math.min(1.0, Math.max(0.2, p_pen)),
    lambda_ach: Math.max(0.1, ach),
    k_deposition: 0.22,
    q_cadr: cadr,
    volume_m3: Math.max(20, profile.roomVolumeM3),
    e_indoor_ug_h: activeHacks.kitchenExhaust ? 0 : 25, // Cooking soot buffer if not exhausted
  };

  return {
    calibratedParams,
    effectiveOutdoorPm25,
  };
}
