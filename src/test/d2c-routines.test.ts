import { describe, it, expect } from 'vitest';
import { computeInhaledDose, computeBreathReceipt } from '../engine/physics';

describe('D2C Low-Emission Daily Routine Swaps & Physics Math', () => {
  it('correctly calculates avoided lung dose and cigarette equivalents for commute shift', () => {
    // Metro commute in filtered air (35 ug/m3) vs road congestion (245 ug/m3) for 120 mins
    const transitDose = computeInhaledDose({
      concentration_ug_m3: 35,
      duration_minutes: 120,
      minute_ventilation_m3_min: 0.012,
      mask_efficiency: 0.0,
    });

    const carDose = computeInhaledDose({
      concentration_ug_m3: 245,
      duration_minutes: 120,
      minute_ventilation_m3_min: 0.012,
      mask_efficiency: 0.0,
    });

    const doseSaved = Math.round((carDose - transitDose) * 10) / 10;
    const cigsSaved = Math.round((doseSaved / 22.0) * 10) / 10;

    expect(transitDose).toBeGreaterThan(0);
    expect(carDose).toBeGreaterThan(transitDose);
    expect(doseSaved).toBeGreaterThan(300); // 245*1.44 - 35*1.44 = 302.4 ug
    expect(cigsSaved).toBeGreaterThan(13);
  });

  it('generates a valid deterministic breath receipt for school run shift', () => {
    const receipt = computeBreathReceipt(
      'Delhi NCR (Anand Vihar)',
      'Walking School Bus with N95 Respiration',
      {
        concentration_ug_m3: 25,
        duration_minutes: 60,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.95,
      },
      {
        concentration_ug_m3: 280,
        duration_minutes: 60,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      'metro_transit'
    );

    expect(receipt.receiptId).toMatch(/^ZB-/);
    expect(receipt.tenantName).toBe('Delhi NCR (Anand Vihar)');
    expect(receipt.doseSavedUg).toBeGreaterThan(0);
    expect(receipt.cigaretteEquivalentsSaved).toBeGreaterThan(0);
    expect(receipt.co2eAvoidedGrams).toBeGreaterThan(0);
    expect(receipt.noxAvoidedGrams).toBeGreaterThan(0);
  });

  it('accurately verifies Corsi-Rosenthal filtration receipt metrics', () => {
    const receipt = computeBreathReceipt(
      'South Delhi (RK Puram)',
      'DIY Corsi-Rosenthal Air Cleanser (+360 CADR)',
      {
        concentration_ug_m3: 18,
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      {
        concentration_ug_m3: 220,
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      'corsi_rosenthal'
    );

    expect(receipt.actionTitle).toContain('Corsi-Rosenthal');
    expect(receipt.doseSavedUg).toBeGreaterThan(400);
    expect(receipt.neighborhoodMultiplier).toBe(1.2);
  });
});
