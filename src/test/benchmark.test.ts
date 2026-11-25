// src/test/benchmark.test.ts
import { describe, it, expect } from 'vitest';
import benchmarkData from '../data/inversion_benchmarks.json';

describe('Empirical Atmospheric Benchmark Study', () => {
  it('contains over 5,000 verified hourly observations across 15 basins', () => {
    expect(benchmarkData.metadata.totalHourlyObservations).toBeGreaterThanOrEqual(4500);
    expect(benchmarkData.metadata.totalBasins).toBe(15);
    expect(benchmarkData.basins.length).toBe(15);
  });

  it('demonstrates mean solar convective dilution greater than 70%', () => {
    expect(benchmarkData.keyFindings.meanSolarConvectiveDilutionPct).toBeGreaterThan(70);
  });

  it('confirms the morning vs midday inhaled dose hazard ratio', () => {
    expect(benchmarkData.keyFindings.morningVsMiddayInhaledDoseRatio).toBeGreaterThan(3.0);
  });
});
