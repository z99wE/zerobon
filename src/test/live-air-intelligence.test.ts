// src/test/live-air-intelligence.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  resolveCityCoordinates, 
  calculateDynamicCleanWindow, 
  fetchLiveAirQuality 
} from '../engine/live-air-service';
import { generate24HourAtmosphericForecast } from '../engine/physics';

describe('Real-Time Atmospheric Intelligence & Dynamic Physics Windows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Geocoding & City Coordinates Resolution', () => {
    it('resolves verified coordinates from high-speed local cache', async () => {
      const coords = await resolveCityCoordinates('Delhi NCR');
      expect(coords).not.toBeNull();
      expect(coords?.lat).toBeCloseTo(28.6139, 2);
      expect(coords?.lon).toBeCloseTo(77.2090, 2);
    });

    it('resolves coordinates for international cities in the cache', async () => {
      const coords = await resolveCityCoordinates('Baku');
      expect(coords).not.toBeNull();
      expect(coords?.lat).toBeCloseTo(40.38, 1);
      expect(coords?.lon).toBeCloseTo(49.89, 1);
    });

    it('queries Open-Meteo Geocoding API for arbitrary global locations', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ latitude: 45.4215, longitude: -75.6972, name: 'Ottawa' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const coords = await resolveCityCoordinates('Ottawa');
      expect(mockFetch).toHaveBeenCalled();
      expect(coords).not.toBeNull();
      expect(coords?.lat).toBeCloseTo(45.4215, 3);
      expect(coords?.lon).toBeCloseTo(-75.6972, 3);
    });
  });

  describe('Physics-Informed Dynamic Clean Air Window Calculations', () => {
    it('calculates optimal midday convection window for Plains / Basin with severe smog', () => {
      const result = calculateDynamicCleanWindow('Plains / Basin', 280, 18, 5);
      expect(result.cleanWindowHours).toBe('11:45 AM – 3:15 PM');
      expect(result.pblHeightMeters).toBeGreaterThanOrEqual(160);
      expect(result.reason).toContain('solar ground heating');
    });

    it('broadens convective window when particulate load is moderate', () => {
      const result = calculateDynamicCleanWindow('Plains / Basin', 65, 22, 12);
      expect(result.cleanWindowHours).toBe('11:15 AM – 3:45 PM');
      expect(result.pblHeightMeters).toBeGreaterThan(1000);
    });

    it('adapts clean air window to afternoon sea-breeze ventilation in Coastal regimes', () => {
      const result = calculateDynamicCleanWindow('Coastal / Marine Boundary', 85, 26, 15);
      expect(result.cleanWindowHours).toBe('1:00 PM – 5:30 PM');
    });

    it('advances solar warming window in high-altitude Plateaus', () => {
      const result = calculateDynamicCleanWindow('Plateau / Continental Inversion', 110, 14, 8);
      expect(result.cleanWindowHours).toBe('10:30 AM – 4:00 PM');
    });
  });

  describe('Dynamic Diurnal Atmospheric Forecast & Sounding Simulation', () => {
    it('generates 10 sounding observations covering the full 24-hour cycle', () => {
      const forecast = generate24HourAtmosphericForecast(200, 'Plains / Basin', 1400, 18);
      expect(forecast).toHaveLength(10);
      expect(forecast[0].hour).toBe('00:00');
      expect(forecast[9].hour).toBe('22:00');
    });

    it('correctly models nocturnal radiation inversion lid (140-190m) at morning peak', () => {
      const forecast = generate24HourAtmosphericForecast(200, 'Plains / Basin', 1400, 18);
      const morningTrap = forecast[2]; // 06:00 AM
      expect(morningTrap.pblHeightMeters).toBeLessThanOrEqual(200);
      expect(morningTrap.outdoorPm25).toBeGreaterThan(200);
      expect(morningTrap.inversionStrength).toBe('Strong Inversion');
      expect(morningTrap.isMiddayCleanWindow).toBe(false);
    });

    it('correctly models solar vertical convective expansion (>1000m) at 13:00 PM', () => {
      const forecast = generate24HourAtmosphericForecast(200, 'Plains / Basin', 1400, 18);
      const midday = forecast[5]; // 13:00 PM
      expect(midday.pblHeightMeters).toBeGreaterThanOrEqual(1000);
      expect(midday.outdoorPm25).toBeLessThan(forecast[2].outdoorPm25);
      expect(midday.inversionStrength).toBe('Clean Air Window');
      expect(midday.isMiddayCleanWindow).toBe(true);
    });
  });

  describe('Real-Time Concurrent Open-Meteo Air Quality & Weather API Sync', () => {
    it('fetches live data, parses atmospheric telemetry, and marks isLive=true', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('air-quality-api')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              current: {
                pm2_5: 142.5,
                pm10: 210.0,
                nitrogen_dioxide: 48.0,
              },
            }),
          });
        }
        if (url.includes('forecast?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              current: {
                temperature_2m: 21.4,
                relative_humidity_2m: 54,
                wind_speed_10m: 8.2,
              },
            }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });
      vi.stubGlobal('fetch', mockFetch);

      const reading = await fetchLiveAirQuality('Delhi NCR');
      expect(reading.isLive).toBe(true);
      expect(reading.pm25).toBe(143);
      expect(reading.temperatureC).toBe(21);
      expect(reading.windSpeedKmh).toBe(8.2);
      expect(reading.cleanWindowHours).toBeDefined();
      expect(reading.source).toBe('Live CAMS / Satellite & Ground');
    });

    it('falls back gracefully to verified city baseline when offline or rate-limited', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error or rate limited'));
      vi.stubGlobal('fetch', mockFetch);

      const reading = await fetchLiveAirQuality('Lahore');
      expect(reading.isLive).toBe(false);
      expect(reading.pm25).toBeGreaterThan(0);
      expect(reading.cleanWindowHours).toBeDefined();
      expect(reading.source).toBe('Verified Atmospheric Baseline');
    });
  });
});
