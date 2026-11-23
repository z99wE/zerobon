import { describe, it, expect } from 'vitest';
import {
  computeDerivative,
  stepAnalytical,
  computeBreathReceipt,
  generate24HourAtmosphericForecast,
  DEFAULT_PHYSICS_PARAMS,
} from '../physics';

describe('Indoor Atmospheric Physics & Mass-Balance Solver', () => {
  it('correctly calculates dCin/dt derivative at baseline', () => {
    // When Cin = Cout, deposition and infiltration balance
    const dCin = computeDerivative(50, 100, DEFAULT_PHYSICS_PARAMS);
    // Infiltration = 0.78 * 0.85 * 100 = 66.3
    // Removal = (0.85 + 0.22 + 0) * 50 = 53.5
    // dCin = 66.3 - 53.5 = 12.8
    expect(dCin).toBeCloseTo(12.8, 1);
  });

  it('stabilizes indoor concentration at steady state with air cleaner CADR active', () => {
    const paramsWithCadr = {
      ...DEFAULT_PHYSICS_PARAMS,
      q_cadr: 350.0, // Corsi-Rosenthal box active
    };
    const step = stepAnalytical(120, 250, 1.0, paramsWithCadr);
    
    // Effective removal rate should dramatically increase
    expect(step.decayRate).toBeGreaterThan(3.0);
    // Steady state should be significantly lower than outdoor 250 ug/m3
    expect(step.steadyState).toBeLessThan(50);
    // Next Cin after 1 hour should drop substantially
    expect(step.cin).toBeLessThan(60);
  });

  it('generates deterministic breath receipt with exact cigarette and IPCC equivalencies', () => {
    const receipt = computeBreathReceipt(
      'The Chen Family',
      'DIY Corsi-Rosenthal Box Active',
      { concentration_ug_m3: 35, minute_ventilation_m3_min: 0.012, duration_minutes: 480, mask_efficiency: 0 },
      { concentration_ug_m3: 180, minute_ventilation_m3_min: 0.012, duration_minutes: 480, mask_efficiency: 0 },
      'corsi_rosenthal'
    );

    expect(receipt.receiptId).toMatch(/^ZB-[A-Z0-9]+$/);
    expect(receipt.doseSavedUg).toBeGreaterThan(0);
    expect(receipt.cigaretteEquivalentsSaved).toBeCloseTo(receipt.doseSavedUg / 22.0, 1);
    expect(receipt.co2eAvoidedGrams).toBe(120);
    expect(receipt.neighborhoodMultiplier).toBe(1.2);
  });

  it('generates a 24-hour atmospheric curve containing a valid midday clean air window', () => {
    const forecast = generate24HourAtmosphericForecast();
    expect(forecast).toHaveLength(10);
    
    const cleanWindows = forecast.filter((f) => f.isMiddayCleanWindow);
    expect(cleanWindows.length).toBeGreaterThanOrEqual(3);
    cleanWindows.forEach((w) => {
      expect(w.pblHeightMeters).toBeGreaterThanOrEqual(950);
      expect(w.outdoorPm25).toBeLessThan(100);
    });
  });
});
