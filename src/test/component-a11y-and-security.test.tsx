import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, waitFor, act } from '@testing-library/react';
import * as axe from 'axe-core';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SafeRecessPassModal } from '../components/SafeRecessPassModal';
import { SanctuaryCalibrationModal } from '../components/SanctuaryCalibrationModal';
import { DailyRoutineOptimizer } from '../components/DailyRoutineOptimizer';
import { loadSanctuaryProfile } from '../engine/sanctuary-engine';
import { fetchLiveAirQuality, resolveCityCoordinates } from '../engine/live-air-service';
import { useLiveAirSync } from '../hooks/useLiveAirSync';

describe('Real Component Accessibility (axe-core WCAG 2.1 AA) & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Live Mounted Component axe-core Audits', () => {
    it('Navbar passes axe-core WCAG 2.1 AA with zero violations', async () => {
      const { container } = render(
        <Navbar
          activeTab="overview"
          onSelectTab={vi.fn()}
          outdoorPm25={180}
          temperatureC={16}
          onOpenShare={vi.fn()}
          selectedCity="Delhi NCR"
          onSelectCity={vi.fn()}
          onOpenSanctuaryCalibration={vi.fn()}
          onSyncLiveAir={vi.fn()}
          isLiveSyncing={false}
          isLiveReading={true}
          sanctuaryZoneName="Home"
        />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('Footer passes axe-core WCAG 2.1 AA with zero violations', async () => {
      const { container } = render(
        <Footer
          selectedCity="Delhi NCR"
          activeCleanWindow="11:30 AM – 3:30 PM"
          isLiveReading={true}
          onNavigateTab={vi.fn()}
          onOpenShare={vi.fn()}
        />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('SafeRecessPassModal passes axe-core WCAG 2.1 AA with labeled inputs', async () => {
      const { container } = render(
        <SafeRecessPassModal
          cityName="Delhi NCR"
          outdoorPm25={245}
          cleanWindowHours="11:30 AM – 3:30 PM"
          onClose={vi.fn()}
        />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('SanctuaryCalibrationModal passes axe-core WCAG 2.1 AA with labeled range slider', async () => {
      const profile = loadSanctuaryProfile();
      const { container } = render(
        <SanctuaryCalibrationModal
          currentProfile={profile}
          outdoorPm25={210}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('DailyRoutineOptimizer passes axe-core WCAG 2.1 AA and renders dynamic clean window', async () => {
      const { container, getByText } = render(
        <DailyRoutineOptimizer
          outdoorPm25={180}
          selectedCity="Lahore"
          cleanWindowHours="12:00 PM – 3:15 PM"
          onCommitReceipt={vi.fn()}
          onTriggerShare={vi.fn()}
        />
      );
      expect(getByText(/12:00 PM – 3:15 PM/)).toBeTruthy();
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });
  });

  describe('Zod Schema Validation & Input Sanitization Security', () => {
    it('rejects out-of-bounds negative or absurdly spiked PM2.5 payloads from external APIs', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: { pm2_5: -50, pm10: 99999 },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const reading = await fetchLiveAirQuality('TestPoisonCity');
      expect(reading.isLive).toBe(false);
      expect(reading.source).toBe('Verified Atmospheric Baseline');
    });

    it('rejects out-of-range geocoding coordinates from untrusted responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ latitude: 999, longitude: -999, country: 'Invalid' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const coords = await resolveCityCoordinates('<script>alert(1)</script>UnknownPlace');
      // Falls back safely to default coordinates
      expect(coords.lat).toBeGreaterThanOrEqual(-90);
      expect(coords.lat).toBeLessThanOrEqual(90);
    });
  });

  describe('useLiveAirSync Hook Lifecycle', () => {
    it('auto-fetches live reading on mount and supports manual re-sync', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('air-quality-api')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              current: { pm2_5: 88, pm10: 120, nitrogen_dioxide: 24 },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            current: { temperature_2m: 19, relative_humidity_2m: 50, wind_speed_10m: 9 },
          }),
        });
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useLiveAirSync('Mumbai', 92));

      await waitFor(() => {
        expect(result.current.liveReading?.isLive).toBe(true);
      });
      expect(result.current.outdoorPm25).toBe(88);

      await act(async () => {
        await result.current.syncLiveAir();
      });
      expect(result.current.isLiveSyncing).toBe(false);
    });
  });
});
