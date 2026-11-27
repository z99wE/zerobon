import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeSkyLuminanceData } from '../engine/optical-haze';
import { loadSanctuaryProfile, saveSanctuaryProfile } from '../engine/sanctuary-engine';
import { fetchLiveAirQuality } from '../engine/live-air-service';
import { executeHardenedCopilotPipeline } from '../engine/copilot-firewall';
import { looksLikeBase64Smuggle } from '../shared/copilot-security';
import worker from '../../apps/edge-api/index';

const image = (r: number, g: number, b: number): ImageData => {
  const data = new Uint8ClampedArray(100 * 100 * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return { data, width: 100, height: 100, colorSpace: 'srgb' } as ImageData;
};

describe('Remaining optical turbidity branches', () => {
  it('ignores near-black pixels as unusable sky samples', () => {
    const result = analyzeSkyLuminanceData(image(10, 10, 10));
    expect(result.confidencePercent).toBe(50);
    expect(result.hazeClass).toBe('Moderate Aerosol');
  });

  it('ignores blown-out white pixels as clouds or sun disc', () => {
    expect(analyzeSkyLuminanceData(image(255, 255, 255)).confidencePercent).toBe(50);
  });

  it('classifies a dense winter smog ratio between the calibration bands', () => {
    const result = analyzeSkyLuminanceData(image(100, 110, 112));
    expect(result.hazeClass).toBe('Dense Winter Smog');
    expect(result.estimatedAOD).toBe(1.45);
  });
});

describe('Sanctuary profile validation fallbacks', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('falls back to defaults for invalid enum values in storage', () => {
    localStorage.setItem(
      'zerobon_sanctuary_profile_v1',
      JSON.stringify({ buildingType: 'bogus', floorLevel: 'bogus', roomZone: 'bogus', roomVolumeM3: 140 })
    );
    const profile = loadSanctuaryProfile();
    expect(profile.buildingType).toBe('standard_apartment');
    expect(profile.floorLevel).toBe('mid_rise');
    expect(profile.roomZone).toBe('bedroom');
    expect(profile.roomVolumeM3).toBe(140);
    expect(profile.isCustomized).toBe(true);
  });

  it('falls back to defaults for malformed JSON in storage', () => {
    localStorage.setItem('zerobon_sanctuary_profile_v1', '{not-json');
    expect(loadSanctuaryProfile().roomVolumeM3).toBe(90);
  });

  it('persists a valid profile and marks it customised', () => {
    saveSanctuaryProfile({ ...loadSanctuaryProfile(), roomVolumeM3: 140 });
    expect(loadSanctuaryProfile().roomVolumeM3).toBe(140);
  });

  it('survives a storage write failure without throwing', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => saveSanctuaryProfile(loadSanctuaryProfile())).not.toThrow();
    spy.mockRestore();
  });
});

describe('Telemetry fallback branches', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('falls back to default coordinates when geocoding rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('geocoding-api')) return Promise.resolve({ ok: false, status: 500 });
      if (url.includes('air-quality-api')) {
        return Promise.resolve({ ok: true, json: async () => ({ current: { pm2_5: 88 } }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ current: {} }) });
    }));
    const reading = await fetchLiveAirQuality('UnknownGeoCity');
    expect(reading.country).toBe('India');
    expect(reading.isLive).toBe(true);
  });

  it('uses the verified baseline when the air payload is invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { pm2_5: 'not-a-number' } }),
    }));
    const reading = await fetchLiveAirQuality('InvalidPayloadCity');
    expect(reading.isLive).toBe(false);
    expect(reading.error).toContain('Invalid PM2.5');
  });
});

describe('Copilot tenant fallback branches', () => {
  const context = { indoorPm25: 60, outdoorPm25: 200, isMiddayWindow: false };

  it('produces a school campus protocol for school tenants', async () => {
    const { response } = await executeHardenedCopilotPipeline('Should we have outdoor recess?', {
      ...context, tenantProfile: 'school',
    });
    expect(response.routine_advice.join(' ')).toContain('For school campuses');
  });

  it('produces a community protocol for RWA tenants', async () => {
    const { response } = await executeHardenedCopilotPipeline('Our generator and waste burning issue', {
      ...context, tenantProfile: 'community',
    });
    expect(response.routine_advice.join(' ')).toContain('Residential Community Protocol');
  });

  it('reports an oversized payload as a blocked fallback', async () => {
    const { response, report } = await executeHardenedCopilotPipeline('a'.repeat(401), context);
    expect(response.intent_valid).toBe(false);
    expect(report.attackType).toBe('oversized_payload');
    expect(report.status).toBe('blocked_fallback');
  });
});

describe('Remaining edge and guard branches', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects non-multiple-of-four base64 strings without padding', () => {
    expect(looksLikeBase64Smuggle('A'.repeat(41))).toBe(false);
  });

  it('ignores a tenant header made only of invalid characters', async () => {
    const res = await worker.fetch(
      new Request('https://api.zerobon.dev/api/v4/tenant/config', {
        headers: { 'X-Tenant-ID': '<<<>>>' },
      }),
      {},
      { waitUntil: vi.fn(), passThroughOnException: vi.fn() }
    );
    const body = (await res.json()) as { tenant_id: string };
    expect(body.tenant_id).toBe('tenant-family-chen');
  });
});
