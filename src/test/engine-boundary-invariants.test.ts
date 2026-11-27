import { describe, it, expect } from 'vitest';
import { calculateDynamicCleanWindow } from '../engine/live-air-service';
import { getCityProfile } from '../engine/city-data';
import {
  calculateCalibratedPhysics,
  DEFAULT_SANCTUARY_PROFILE,
  type SanctuaryProfile,
} from '../engine/sanctuary-engine';
import { TenantScopedDB, DEMO_TENANTS } from '../engine/tenancy';
import { analyzeSkyLuminanceData } from '../engine/optical-haze';
import { computeInhaledDose, generate24HourAtmosphericForecast } from '../engine/physics';

const NO_HACKS = {
  corsiRosenthal: false,
  kitchenExhaust: false,
  draftSealing: false,
  windowOpen: false,
};

const asImageData = (r: number, g: number, b: number, width = 100, height = 100): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData;
};

describe('Dynamic Clean-Air Window Boundary Conditions', () => {
  it('keeps the whole daylight period open when particulate load is pristine', () => {
    const window = calculateDynamicCleanWindow('Plains / Basin', 25);
    expect(window.cleanWindowHours).toContain('All Day');
    expect(window.pblHeightMeters).toBe(1450);
  });

  it('clamps the coastal sea-breeze mixing height inside physical bounds', () => {
    const window = calculateDynamicCleanWindow('Coastal', 500);
    expect(window.cleanWindowHours).toBe('1:00 PM – 5:30 PM');
    expect(window.pblHeightMeters).toBeGreaterThanOrEqual(620);
    expect(window.pblHeightMeters).toBeLessThanOrEqual(1250);
  });

  it('clamps the high-altitude plateau window and mixing height', () => {
    const window = calculateDynamicCleanWindow('Plateau', 600);
    expect(window.cleanWindowHours).toBe('10:30 AM – 4:00 PM');
    expect(window.pblHeightMeters).toBeGreaterThanOrEqual(700);
    expect(window.pblHeightMeters).toBeLessThanOrEqual(1350);
  });

  it('delays the basin window when severe smog suppresses morning convection', () => {
    const severe = calculateDynamicCleanWindow('Plains / Basin', 300);
    expect(severe.cleanWindowHours).toBe('11:45 AM – 3:15 PM');
  });

  it('opens the basin window earlier under moderate particulate load', () => {
    const moderate = calculateDynamicCleanWindow('Valley', 120);
    expect(moderate.cleanWindowHours).toBe('11:15 AM – 3:45 PM');
  });

  it('never reports a sub-surface boundary layer under extreme pollution', () => {
    const window = calculateDynamicCleanWindow('Basin', 5000);
    expect(window.pblHeightMeters).toBe(160);
  });
});

describe('City Profile Resolution Invariants', () => {
  it('is deterministic for an identical unknown city name', () => {
    expect(getCityProfile('Unknown Alpine Town')).toEqual(getCityProfile('Unknown Alpine Town'));
  });

  it('normalizes casing and padding for known cities', () => {
    expect(getCityProfile('  DELHI NCR  ').name).toBe('Delhi NCR');
  });

  it('falls back to substring matching for an unfamiliar city variant', () => {
    expect(getCityProfile('Greater Mumbai').name).toBe('Mumbai');
  });

  it('keeps synthetic baselines inside physically valid ranges', () => {
    for (const name of ['Zeta City', 'Aqua Ville', 'North Pole']) {
      const profile = getCityProfile(name);
      expect(profile.baselinePm25).toBeGreaterThanOrEqual(25);
      expect(profile.baselinePm25).toBeLessThanOrEqual(214);
      expect(profile.pblHeightMeters).toBeGreaterThanOrEqual(190);
      expect(profile.pblHeightMeters).toBeLessThanOrEqual(949);
      expect(profile.country).toBe('Global');
    }
  });
});

describe('Sanctuary Calibration Intervention Effects', () => {
  const calibrated = (
    overrides: Partial<SanctuaryProfile> = {},
    hacks: Partial<typeof NO_HACKS> = {}
  ) =>
    calculateCalibratedPhysics(
      { ...DEFAULT_SANCTUARY_PROFILE, ...overrides },
      200,
      { ...NO_HACKS, ...hacks }
    );

  it('adds exactly one Corsi-Rosenthal clean-air delivery rate', () => {
    expect(calibrated().calibratedParams.q_cadr).toBe(0);
    expect(calibrated({}, { corsiRosenthal: true }).calibratedParams.q_cadr).toBe(380);
  });

  it('reduces both envelope penetration and air exchange when drafts are sealed', () => {
    const base = calibrated().calibratedParams;
    const sealed = calibrated({}, { draftSealing: true }).calibratedParams;
    expect(sealed.p_penetration).toBeLessThan(base.p_penetration);
    expect(sealed.lambda_ach).toBeLessThan(base.lambda_ach);
  });

  it('forces a full flush rate and unfiltered infiltration when a window is open', () => {
    const open = calibrated({}, { windowOpen: true }).calibratedParams;
    expect(open.lambda_ach).toBeGreaterThanOrEqual(3.5);
    expect(open.p_penetration).toBe(1.0);
  });

  it('clears the indoor cooking soot source only when exhaust is active', () => {
    expect(calibrated().calibratedParams.e_indoor_ug_h).toBe(25);
    expect(calibrated({}, { kitchenExhaust: true }).calibratedParams.e_indoor_ug_h).toBe(0);
  });

  it('applies the floor elevation gradient to outdoor exposure', () => {
    expect(calibrated({ floorLevel: 'ground_first' }).effectiveOutdoorPm25).toBe(270);
    expect(calibrated({ floorLevel: 'high_rise' }).effectiveOutdoorPm25).toBe(150);
  });
});

describe('Tenancy, Optical and Dose Invariants', () => {
  it('falls back to the default tenant configuration for an unknown tenant', () => {
    const db = new TenantScopedDB('tenant-not-provisioned');
    expect(db.getTenantId()).toBe('tenant-not-provisioned');
    expect(db.getTenantConfig().id).toBe(DEMO_TENANTS[0]!.id);
  });

  it('exposes exactly three active community pledges', () => {
    const pledges = new TenantScopedDB('tenant-greenwood-school').getTenantPledges();
    expect(pledges).toHaveLength(3);
    expect(pledges.every((pledge) => pledge.status === 'Active')).toBe(true);
  });

  it('returns a neutral turbidity reading when no usable sky pixels are present', () => {
    const result = analyzeSkyLuminanceData(asImageData(0, 0, 0));
    expect(result.hazeClass).toBe('Moderate Aerosol');
    expect(result.confidencePercent).toBe(50);
    expect(result.inferredPm25).toBe(110);
  });

  it('bounds optical turbidity confidence within the calibrated range', () => {
    const result = analyzeSkyLuminanceData(asImageData(40, 90, 230));
    expect(result.confidencePercent).toBeGreaterThanOrEqual(65);
    expect(result.confidencePercent).toBeLessThanOrEqual(94);
  });

  it('reduces inhaled dose in proportion to mask filtration efficiency', () => {
    const exposure = {
      concentration_ug_m3: 200,
      duration_minutes: 60,
      minute_ventilation_m3_min: 0.015,
    };
    const unmasked = computeInhaledDose({ ...exposure, mask_efficiency: 0 });
    const n95 = computeInhaledDose({ ...exposure, mask_efficiency: 0.95 });
    expect(n95).toBeLessThan(unmasked);
    expect(n95).toBeCloseTo(unmasked * 0.05, 6);
  });

  it('keeps every forecast observation finite and non-negative under extreme inputs', () => {
    const forecast = generate24HourAtmosphericForecast(0, 'Plateau', 900, -10);
    expect(forecast).toHaveLength(10);
    expect(
      forecast.every(
        (point) =>
          Number.isFinite(point.outdoorPm25) &&
          point.outdoorPm25 >= 10 &&
          Number.isFinite(point.pblHeightMeters) &&
          point.pblHeightMeters >= 130
      )
    ).toBe(true);
  });
});
