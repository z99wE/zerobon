import { describe, it, expect, vi } from 'vitest';
import { stepAnalytical, computeInhaledDose, computeBreathReceipt, generate24HourAtmosphericForecast } from '../engine/physics';
import { analyzeSkyLuminanceData } from '../engine/optical-haze';
import { looksLikeBase64Smuggle } from '../shared/copilot-security';
import worker, { callGoogleGeminiAssistant } from '../../apps/edge-api/index';
import type { MassBalanceParams } from '../types';

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

const postQuery = (query: string, env = {}) =>
  worker.fetch(
    new Request('https://api.zerobon.dev/api/v4/copilot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }),
    env,
    { waitUntil: vi.fn(), passThroughOnException: vi.fn() }
  );

describe('Physics Edge Branches', () => {
  it('keeps initial concentration as steady state when there is no removal', () => {
    const params: MassBalanceParams = {
      p_penetration: 0, lambda_ach: 0, k_deposition: 0,
      q_cadr: 0, volume_m3: 100, e_indoor_ug_h: 0,
    };
    const result = stepAnalytical(50, 100, 1, params);
    expect(result.steadyState).toBe(50);
    expect(result.decayRate).toBe(0);
    expect(result.cin).toBe(50);
  });

  it('clamps mask efficiency above one to the maximum filtration factor', () => {
    const exposure = {
      concentration_ug_m3: 100, duration_minutes: 60, minute_ventilation_m3_min: 0.01,
    };
    const normal = computeInhaledDose({ ...exposure, mask_efficiency: 0 });
    const excessive = computeInhaledDose({ ...exposure, mask_efficiency: 5 });
    expect(excessive).toBeCloseTo(normal * 0.001, 6);
  });

  it('clamps negative mask efficiency to unfiltered exposure', () => {
    const exposure = {
      concentration_ug_m3: 100, duration_minutes: 60, minute_ventilation_m3_min: 0.01,
    };
    expect(computeInhaledDose({ ...exposure, mask_efficiency: -2 })).toBe(
      computeInhaledDose({ ...exposure, mask_efficiency: 0 })
    );
  });

  it('uses generic emission factors for an unrecognised action type', () => {
    const dose = { concentration_ug_m3: 20, duration_minutes: 60, minute_ventilation_m3_min: 0.01, mask_efficiency: 0 };
    const receipt = computeBreathReceipt('Test', 'Unknown', dose, dose, 'unlisted_action' as 'metro_transit');
    expect(receipt.co2eAvoidedGrams).toBe(450);
    expect(receipt.neighborhoodMultiplier).toBe(1);
  });

  it('models coastal clean-air windows with sea-breeze wind speeds', () => {
    const forecast = generate24HourAtmosphericForecast(200, 'Coastal', 1350, 20);
    const clean = forecast.find((point) => point.isMiddayCleanWindow);
    expect(clean).toBeDefined();
    expect(clean!.windSpeedKmh).toBe(18);
    expect(clean!.outdoorPm25).toBeLessThan(200);
  });
});

describe('Optical Turbidity Edge Branches', () => {
  it('falls back safely when every sampled pixel is blown out', () => {
    const result = analyzeSkyLuminanceData(image(255, 255, 255));
    expect(result.hazeClass).toBe('Moderate Aerosol');
    expect(result.confidencePercent).toBe(50);
  });

  it('handles a zero-red sky pixel without dividing by zero', () => {
    const result = analyzeSkyLuminanceData(image(0, 0, 100));
    expect(result.blueToRedRatio).toBe(1);
    expect(result.hazeClass).toBe('Severe Particulate Plume');
    expect(Number.isFinite(result.inferredPm25)).toBe(true);
  });

  it('classifies a moderately hazy sky between the calibration thresholds', () => {
    const result = analyzeSkyLuminanceData(image(100, 110, 130));
    expect(['Moderate Aerosol', 'Dense Winter Smog']).toContain(result.hazeClass);
  });
});

describe('Base64 Smuggling Guard Branches', () => {
  it('rejects payloads containing whitespace', () => {
    expect(looksLikeBase64Smuggle('A'.repeat(30) + ' ' + 'A'.repeat(30))).toBe(false);
  });

  it('rejects payloads that are too short', () => {
    expect(looksLikeBase64Smuggle('A'.repeat(39))).toBe(false);
  });

  it('rejects payloads outside the base64 character set', () => {
    expect(looksLikeBase64Smuggle('A'.repeat(60) + '!')).toBe(false);
  });

  it('allows padded length that is not a multiple of four through to the shape check', () => {
    expect(looksLikeBase64Smuggle('A'.repeat(41) + '=')).toBe(false);
  });
});

describe('Edge API Remaining Branches', () => {
  it('answers CORS preflight without invoking the query pipeline', async () => {
    const res = await worker.fetch(
      new Request('https://api.zerobon.dev/api/v4/copilot/query', { method: 'OPTIONS' }),
      {},
      { waitUntil: vi.fn(), passThroughOnException: vi.fn() }
    );
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('routes unknown paths to the versioned status response', async () => {
    const res = await worker.fetch(new Request('https://api.zerobon.dev/unknown'), {}, {
      waitUntil: vi.fn(), passThroughOnException: vi.fn(),
    });
    const body = (await res.json()) as { status: string };
    expect(body.status).toContain('v4.0');
  });

  it('resolves institutional tenants from the request host', async () => {
    for (const [host, tenant] of [
      ['greenwood.zerobon.dev', 'tenant-greenwood-school'],
      ['powai-rwa.zerobon.dev', 'tenant-powai-rwa'],
      ['apex-campus.zerobon.dev', 'tenant-apex-campus'],
    ]) {
      const res = await worker.fetch(new Request(`https://${host}/api/v4/tenant/config`), {}, {
        waitUntil: vi.fn(), passThroughOnException: vi.fn(),
      });
      const body = (await res.json()) as { tenant_id: string };
      expect(body.tenant_id).toBe(tenant);
    }
  });

  it('uses the deterministic playbook when no Gemini key is configured', async () => {
    const res = await postQuery('How can I filter indoor air?');
    const body = (await res.json()) as { routine_advice: string[] };
    expect(body.routine_advice.length).toBeGreaterThan(0);
    expect(body.routine_advice[0]).toContain('weatherstripping');
  });

  it('blocks a canary leak from model output at egress', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({
        intent_valid: true, routine_advice: ['CANARY_ZEROBON_SEC_99F3B'],
        iaq_hack_ids: [], pet_animation_state: 'calm',
      }) }] } }],
    }), { status: 200 })));

    const res = await postQuery('ordinary question', {
      GEMINI_API_KEY: 'test-key',
      CANARY_SECRET: 'CANARY_ZEROBON_SEC_99F3B',
    });
    const body = (await res.json()) as { code?: string };
    expect(res.status).toBe(500);
    expect(body.code).toBe('CANARY_LEAK_PREVENTED');
    vi.unstubAllGlobals();
  });

  it('strips HTML markup from the query before it reaches the model', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            intent_valid: true, routine_advice: ['ok'], iaq_hack_ids: [], pet_animation_state: 'calm',
          }) }] } }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    await postQuery('<script>alert(1)</script>best air hack', { GEMINI_API_KEY: 'test-key' });

    const geminiCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes('generativelanguage.googleapis.com')
    );
    expect(geminiCall).toBeDefined();
    const body = JSON.parse(geminiCall![1].body);
    expect(JSON.stringify(body)).not.toContain('<script>');
    expect(body.contents[0].parts[0].text).toContain('best air hack');
    vi.unstubAllGlobals();
  });

  it('masks malformed Gemini JSON as an internal error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: '{not-json' }] } }],
    }), { status: 200 })));
    const res = await postQuery('ordinary question', { GEMINI_API_KEY: 'test-key' });
    const body = (await res.json()) as { code: string };
    expect(res.status).toBe(500);
    expect(body.code).toBe('INTERNAL_ERROR');
    vi.unstubAllGlobals();
  });

  it('returns null from the Gemini helper when no API key is present', async () => {
    await expect(callGoogleGeminiAssistant('query', {})).resolves.toBeNull();
  });
});
