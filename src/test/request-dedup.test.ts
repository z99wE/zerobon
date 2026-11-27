import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchLiveAirQuality } from '../engine/live-air-service';

describe('Live telemetry request deduplication', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shares one in-flight network request between concurrent callers of the same city', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality-api')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ current: { pm2_5: 77, pm10: 90, nitrogen_dioxide: 30 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          current: { temperature_2m: 20, relative_humidity_2m: 50, wind_speed_10m: 4 },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([
      fetchLiveAirQuality('DedupTestCity'),
      fetchLiveAirQuality('DedupTestCity'),
    ]);

    expect(first).toBe(second);
    expect(first.pm25).toBe(77);
    const airCalls = fetchMock.mock.calls.filter(([url]) => url.includes('air-quality-api'));
    expect(airCalls).toHaveLength(1);
  });

  it('serves a fresh cached reading without a second network call', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality-api')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ current: { pm2_5: 55, pm10: 70, nitrogen_dioxide: 18 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          current: { temperature_2m: 21, relative_humidity_2m: 48, wind_speed_10m: 6 },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchLiveAirQuality('CacheHitCity');
    const callsAfterFirst = fetchMock.mock.calls.length;
    await fetchLiveAirQuality('CacheHitCity');
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });

  it('does not merge concurrent requests for different cities', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality-api')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ current: { pm2_5: 60, pm10: 80, nitrogen_dioxide: 20 } }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ results: [] }) });
    });
    vi.stubGlobal('fetch', fetchMock);

    await Promise.all([
      fetchLiveAirQuality('DedupCityOne'),
      fetchLiveAirQuality('DedupCityTwo'),
    ]);

    const airCalls = fetchMock.mock.calls.filter(([url]) => url.includes('air-quality-api'));
    expect(airCalls).toHaveLength(2);
  });
});
