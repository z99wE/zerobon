import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useLiveAirSync } from '../hooks/useLiveAirSync';

describe('Live Air Sync Hook', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the verified baseline when telemetry is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { result } = renderHook(() => useLiveAirSync('HookOfflineTown', 180));

    await waitFor(() => expect(result.current.isLiveSyncing).toBe(false));
    expect(result.current.outdoorPm25).toBe(180);
    expect(result.current.liveReading?.isLive).toBe(false);
  });

  it('adopts the live reading when telemetry succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('air-quality-api')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ current: { pm2_5: 42, pm10: 60, nitrogen_dioxide: 20 } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            current: { temperature_2m: 18, relative_humidity_2m: 55, wind_speed_10m: 5 },
          }),
        });
      })
    );

    const { result } = renderHook(() => useLiveAirSync('Delhi NCR', 200));
    await waitFor(() => expect(result.current.outdoorPm25).toBe(42));
    expect(result.current.liveReading?.isLive).toBe(true);
  });

  it('supports a manual outdoor concentration override', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { result } = renderHook(() => useLiveAirSync('HookOverrideTown', 180));
    await waitFor(() => expect(result.current.isLiveSyncing).toBe(false));

    act(() => result.current.setOutdoorPm25(95));
    expect(result.current.outdoorPm25).toBe(95);
  });
});
