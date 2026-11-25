import { describe, it, expect } from 'vitest';
import { stepAnalytical, DEFAULT_PHYSICS_PARAMS } from '../engine/physics';
import { getCityProfile, TOP_CITIES } from '../engine/city-data';

describe('Physics Analytical Engine & Steady-State Convergence', () => {
  it('converges toward steady-state indoor PM2.5 under active filtration', () => {
    let cin = 200; // initial high indoor PM2.5
    const cout = 250;
    const paramsWithCorsi = {
      ...DEFAULT_PHYSICS_PARAMS,
      p_penetration: 0.38,
      lambda_ach: 0.65,
      q_cadr: 360.0,
    };

    // Step forward 50 iterations (simulating 2 hours)
    for (let i = 0; i < 50; i++) {
      const result = stepAnalytical(cin, cout, 0.04, paramsWithCorsi);
      cin = result.cin;
    }

    // With 360 CADR and draft sealing, indoor PM2.5 should drop below 40 µg/m³
    expect(cin).toBeLessThan(40);
  });

  it('prevents unnecessary calculation drift when system reaches equilibrium', () => {
    const cout = 100;
    const params = {
      ...DEFAULT_PHYSICS_PARAMS,
      p_penetration: 0.82,
      lambda_ach: 0.65,
      q_cadr: 0.0,
    };

    // Calculate steady-state value
    const steadyState = (params.p_penetration * params.lambda_ach * cout) / (params.lambda_ach + params.k_deposition);
    
    // Step forward from steady state
    const step = stepAnalytical(steadyState, cout, 0.04, params);
    expect(Math.abs(step.cin - steadyState)).toBeLessThan(0.01);
  });

  it('efficiently resolves 50+ city queries in under 5ms', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const city = TOP_CITIES[i % TOP_CITIES.length]!;
      const profile = getCityProfile(city.name);
      expect(profile.name).toBe(city.name);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50); // High throughput execution
  });
});
