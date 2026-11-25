import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, waitFor, act } from '@testing-library/react';
import * as axe from 'axe-core';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SafeRecessPassModal } from '../components/SafeRecessPassModal';
import { SanctuaryCalibrationModal } from '../components/SanctuaryCalibrationModal';
import { DailyRoutineOptimizer } from '../components/DailyRoutineOptimizer';
import { LandingHero } from '../components/LandingHero';
import { IndoorAirHacks } from '../components/IndoorAirHacks';
import { InversionRadar } from '../components/InversionRadar';
import { HardenedCopilot } from '../components/HardenedCopilot';
import { BreathReceiptModal } from '../components/BreathReceiptModal';
import { SocialShareModal } from '../components/SocialShareModal';
import { getCityProfile } from '../engine/city-data';
import { DEFAULT_SANCTUARY_PROFILE, loadSanctuaryProfile } from '../engine/sanctuary-engine';
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

    it('LandingHero passes axe-core WCAG 2.1 AA with zero violations', async () => {
      const profile = getCityProfile('Delhi NCR');
      const { container } = render(
        <LandingHero
          selectedCity="Delhi NCR"
          cityProfile={profile}
          outdoorPm25={210}
          onSetOutdoorPm25={vi.fn()}
          onExploreRoutines={vi.fn()}
          onExploreHacks={vi.fn()}
          onOpenAssistant={vi.fn()}
          onOpenShare={vi.fn()}
          onOpenSanctuaryCalibration={vi.fn()}
          onOpenRecessPass={vi.fn()}
          onSyncLiveAir={vi.fn()}
          isLiveSyncing={false}
          isLiveReading={true}
          sanctuaryBadgeText="Bedroom Sanctuary"
          indoorPm25={42}
          cleanWindowHours="11:30 AM – 3:30 PM"
          pblHeightMeters={950}
        />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('IndoorAirHacks passes axe-core WCAG 2.1 AA with zero violations', async () => {
      const { container } = render(
        <IndoorAirHacks
          indoorPm25={45}
          outdoorPm25={220}
          activeHacks={{
            corsiRosenthal: true,
            kitchenExhaust: false,
            draftSealing: true,
            windowOpen: false,
          }}
          onToggleHack={vi.fn()}
          onGenerateReceipt={vi.fn()}
          onTriggerShare={vi.fn()}
          cityName="Delhi NCR"
        />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('InversionRadar passes axe-core WCAG 2.1 AA with zero violations', async () => {
      const profile = getCityProfile('Lahore');
      const { container } = render(
        <InversionRadar
          selectedCity="Lahore"
          outdoorPm25={260}
          cityProfile={profile}
          cleanWindowHours="11:45 AM – 3:15 PM"
          isLiveReading={true}
        />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('HardenedCopilot passes axe-core WCAG 2.1 AA with zero violations', async () => {
      const { container } = render(
        <HardenedCopilot indoorPm25={42} outdoorPm25={210} city="Delhi NCR" />
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    it('BreathReceiptModal & SocialShareModal pass axe-core WCAG 2.1 AA with zero violations', async () => {
      const receipt = {
        receiptId: 'ZB-TEST-100',
        timestamp: '12:30 PM',
        tenantName: 'Delhi NCR',
        actionTitle: 'DIY Box Fan Purifier',
        inhaledDoseUg: 24,
        counterfactualDoseUg: 112,
        doseSavedUg: 88,
        cigaretteEquivalentsSaved: 4.0,
        co2eAvoidedGrams: 1450,
        noxAvoidedGrams: 9.2,
        primaryPm25AvoidedGrams: 1.1,
        neighborhoodMultiplier: 3.0,
      };
      const r1 = render(<BreathReceiptModal receipt={receipt} onClose={vi.fn()} />);
      expect((await axe.run(r1.container)).violations).toEqual([]);

      const r2 = render(<SocialShareModal receipt={receipt} onClose={vi.fn()} />);
      expect((await axe.run(r2.container)).violations).toEqual([]);
    });
  });

  describe('Zod Schema Validation & Input Sanitization Security', () => {
    it('rejects poisoned localStorage sanctuary profiles with invalid enums or negative volume', () => {
      localStorage.setItem(
        'zerobon_sanctuary_profile_v1',
        JSON.stringify({
          buildingType: '__proto__',
          floorLevel: 'ground_first',
          roomZone: 'bedroom',
          roomVolumeM3: -9999,
          customZoneName: 'Test',
        })
      );
      const loaded = loadSanctuaryProfile();
      expect(loaded).toEqual(DEFAULT_SANCTUARY_PROFILE);
    });
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
