// src/test/sanctuary-engine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  DEFAULT_SANCTUARY_PROFILE, 
  calculateCalibratedPhysics, 
  saveSanctuaryProfile, 
  loadSanctuaryProfile,
  SanctuaryProfile 
} from '../engine/sanctuary-engine';

describe('Sanctuary Calibration & Microclimate Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly modulates outdoor exposure by floor elevation', () => {
    const groundProfile: SanctuaryProfile = {
      ...DEFAULT_SANCTUARY_PROFILE,
      floorLevel: 'ground_first',
    };
    const highRiseProfile: SanctuaryProfile = {
      ...DEFAULT_SANCTUARY_PROFILE,
      floorLevel: 'high_rise',
    };

    const outdoorPm25 = 200;
    const groundRes = calculateCalibratedPhysics(groundProfile, outdoorPm25, {
      corsiRosenthal: false,
      kitchenExhaust: false,
      draftSealing: false,
      windowOpen: false,
    });
    const highRiseRes = calculateCalibratedPhysics(highRiseProfile, outdoorPm25, {
      corsiRosenthal: false,
      kitchenExhaust: false,
      draftSealing: false,
      windowOpen: false,
    });

    expect(groundRes.effectiveOutdoorPm25).toBe(270); // 200 * 1.35
    expect(highRiseRes.effectiveOutdoorPm25).toBe(150); // 200 * 0.75
    expect(groundRes.effectiveOutdoorPm25).toBeGreaterThan(highRiseRes.effectiveOutdoorPm25);
  });

  it('reflects building envelope improvements with modern airtight construction', () => {
    const draftyProfile: SanctuaryProfile = {
      ...DEFAULT_SANCTUARY_PROFILE,
      buildingType: 'brick_drafty',
    };
    const airtightProfile: SanctuaryProfile = {
      ...DEFAULT_SANCTUARY_PROFILE,
      buildingType: 'modern_airtight',
    };

    const draftyRes = calculateCalibratedPhysics(draftyProfile, 100, {
      corsiRosenthal: false,
      kitchenExhaust: false,
      draftSealing: false,
      windowOpen: false,
    });
    const airtightRes = calculateCalibratedPhysics(airtightProfile, 100, {
      corsiRosenthal: false,
      kitchenExhaust: false,
      draftSealing: false,
      windowOpen: false,
    });

    expect(draftyRes.calibratedParams.p_penetration).toBe(0.88);
    expect(airtightRes.calibratedParams.p_penetration).toBe(0.52);
    expect(draftyRes.calibratedParams.lambda_ach).toBeGreaterThan(airtightRes.calibratedParams.lambda_ach);
  });

  it('persists and retrieves sanctuary customization in localStorage', () => {
    const custom: SanctuaryProfile = {
      buildingType: 'modern_airtight',
      floorLevel: 'high_rise',
      roomZone: 'master_suite',
      roomVolumeM3: 150,
      customZoneName: 'Penthouse Sanctuary',
      isCustomized: true,
    };

    saveSanctuaryProfile(custom);
    const loaded = loadSanctuaryProfile();

    expect(loaded.isCustomized).toBe(true);
    expect(loaded.buildingType).toBe('modern_airtight');
    expect(loaded.floorLevel).toBe('high_rise');
    expect(loaded.roomVolumeM3).toBe(150);
  });
});
