import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../config/feature-flags', () => ({
  FEATURE_FLAGS: {
    liveOpenMeteoSync: false,
    sanctuaryCalibration: true,
    safeRecessPassPdf: true,
    hardenedCopilot: true,
  },
}));

import { useLiveAirSync } from '../hooks/useLiveAirSync';

describe('Live air sync feature flag', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('skips network work entirely when live sync is disabled', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderHook(() => useLiveAirSync('FlagOffCity', 180));

    expect(result.current.outdoorPm25).toBe(180);
    expect(result.current.isLiveSyncing).toBe(false);
    expect(result.current.liveReading).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
