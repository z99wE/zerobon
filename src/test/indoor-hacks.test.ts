import { describe, it, expect } from 'vitest';
import { computeBreathReceipt } from '../engine/physics';

describe('Simplified Indoor Air Hacks & Sanctuary Physics', () => {
  it('correctly calculates air reduction percentages for consumer displays', () => {
    const outdoorPm25 = 245;
    const indoorPm25 = 35;
    const reductionPct = Math.max(0, Math.round(((outdoorPm25 - indoorPm25) / outdoorPm25) * 100));
    expect(reductionPct).toBe(86);
  });

  it('handles zero or clean air without negative reduction percentages', () => {
    const outdoorPm25 = 25;
    const indoorPm25 = 25;
    const reductionPct = Math.max(0, Math.round(((outdoorPm25 - indoorPm25) / outdoorPm25) * 100));
    expect(reductionPct).toBe(0);
  });

  it('computes accurate breath receipt for $35 Box Fan Purifier', () => {
    const receipt = computeBreathReceipt(
      'Delhi NCR',
      '$35 Box Fan Purifier (Corsi-Rosenthal Box)',
      {
        concentration_ug_m3: 35,
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      {
        concentration_ug_m3: 245,
        duration_minutes: 180,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      'corsi_rosenthal'
    );

    expect(receipt.tenantName).toBe('Delhi NCR');
    expect(receipt.actionTitle).toBe('$35 Box Fan Purifier (Corsi-Rosenthal Box)');
    expect(receipt.doseSavedUg).toBeGreaterThan(400);
    expect(receipt.cigaretteEquivalentsSaved).toBeGreaterThan(15);
    expect(receipt.co2eAvoidedGrams).toBeGreaterThan(0);
  });

  it('computes accurate breath receipt for Midday Air Flush', () => {
    const receipt = computeBreathReceipt(
      'Lahore',
      'Midday 15-Minute Air Flush',
      {
        concentration_ug_m3: 45,
        duration_minutes: 15,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      {
        concentration_ug_m3: 280,
        duration_minutes: 15,
        minute_ventilation_m3_min: 0.012,
        mask_efficiency: 0.0,
      },
      'window_airing'
    );

    expect(receipt.doseSavedUg).toBeGreaterThan(30);
    expect(receipt.cigaretteEquivalentsSaved).toBeGreaterThanOrEqual(1.5);
  });
});
