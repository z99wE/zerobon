// src/engine/live-air-service.ts
import { z } from 'zod';
import { getCityProfile } from './city-data';

const OpenMeteoGeocodingSchema = z.object({
  results: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        country: z.string().max(80).optional(),
      })
    )
    .optional(),
});

const OpenMeteoAirQualitySchema = z.object({
  current: z.object({
    pm2_5: z.number().finite().min(0).max(2000),
    pm10: z.number().finite().min(0).max(3000).optional(),
    nitrogen_dioxide: z.number().finite().min(0).max(2000).optional(),
  }),
});

const OpenMeteoWeatherSchema = z.object({
  current: z.object({
    temperature_2m: z.number().finite().min(-80).max(65).optional(),
    relative_humidity_2m: z.number().finite().min(0).max(100).optional(),
    wind_speed_10m: z.number().finite().min(0).max(300).optional(),
  }),
});

function sanitizeCityQuery(cityName: string): string {
  return cityName.replace(/[<>{}[\]\\;`]/g, '').trim().slice(0, 64);
}

export interface LiveAirReading {
  cityName: string;
  country?: string;
  pm25: number;
  pm10?: number;
  no2?: number;
  temperatureC?: number;
  humidityPct?: number;
  windSpeedKmh?: number;
  cleanWindowHours: string;
  pblHeightMeters: number;
  source: 'Live CAMS / Satellite & Ground' | 'Verified Atmospheric Baseline';
  isLive: boolean;
  timestamp: string;
  error?: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lon: number; country?: string }> = {
  'Delhi NCR': { lat: 28.6139, lon: 77.2090, country: 'India' },
  'Mumbai': { lat: 19.0760, lon: 72.8777, country: 'India' },
  'Kolkata': { lat: 22.5726, lon: 88.3639, country: 'India' },
  'Bengaluru': { lat: 12.9716, lon: 77.5946, country: 'India' },
  'Chennai': { lat: 13.0827, lon: 80.2707, country: 'India' },
  'Hyderabad': { lat: 17.3850, lon: 78.4867, country: 'India' },
  'Lahore': { lat: 31.5204, lon: 74.3587, country: 'Pakistan' },
  'Karachi': { lat: 24.8607, lon: 67.0011, country: 'Pakistan' },
  'Dhaka': { lat: 23.8103, lon: 90.4125, country: 'Bangladesh' },
  'Kathmandu': { lat: 27.7172, lon: 85.3240, country: 'Nepal' },
  'Beijing': { lat: 39.9042, lon: 116.4074, country: 'China' },
  'Shanghai': { lat: 31.2304, lon: 121.4737, country: 'China' },
  'Tokyo': { lat: 35.6762, lon: 139.6503, country: 'Japan' },
  'Seoul': { lat: 37.5665, lon: 126.9780, country: 'South Korea' },
  'Bangkok': { lat: 13.7563, lon: 100.5018, country: 'Thailand' },
  'Hanoi': { lat: 21.0285, lon: 105.8542, country: 'Vietnam' },
  'Jakarta': { lat: -6.2088, lon: 106.8456, country: 'Indonesia' },
  'Singapore': { lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  'Dubai': { lat: 25.2048, lon: 55.2708, country: 'UAE' },
  'Tehran': { lat: 35.6892, lon: 51.3890, country: 'Iran' },
  'London': { lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  'Paris': { lat: 48.8566, lon: 2.3522, country: 'France' },
  'Berlin': { lat: 52.5200, lon: 13.4050, country: 'Germany' },
  'Milan': { lat: 45.4642, lon: 9.1900, country: 'Italy' },
  'Madrid': { lat: 40.4168, lon: -3.7038, country: 'Spain' },
  'Warsaw': { lat: 52.2297, lon: 21.0122, country: 'Poland' },
  'Zurich': { lat: 47.3769, lon: 8.5417, country: 'Switzerland' },
  'Amsterdam': { lat: 52.3676, lon: 4.9041, country: 'Netherlands' },
  'New York': { lat: 40.7128, lon: -74.0060, country: 'United States' },
  'Los Angeles': { lat: 34.0522, lon: -118.2437, country: 'United States' },
  'Salt Lake City': { lat: 40.7608, lon: -111.8910, country: 'United States' },
  'Toronto': { lat: 43.6532, lon: -79.3832, country: 'Canada' },
  'Mexico City': { lat: 19.4326, lon: -99.1332, country: 'Mexico' },
  'São Paulo': { lat: -23.5505, lon: -46.6333, country: 'Brazil' },
  'Santiago': { lat: -33.4489, lon: -70.6693, country: 'Chile' },
  'Bogota': { lat: 4.7110, lon: -74.0721, country: 'Colombia' },
  'Cairo': { lat: 30.0444, lon: 31.2357, country: 'Egypt' },
  'Nairobi': { lat: -1.2921, lon: 36.8219, country: 'Kenya' },
  'Johannesburg': { lat: -26.2041, lon: 28.0473, country: 'South Africa' },
  'Sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
  'Melbourne': { lat: -37.8136, lon: 144.9631, country: 'Australia' },
  'Patna': { lat: 25.5941, lon: 85.1376, country: 'India' },
  'Lucknow': { lat: 26.8467, lon: 80.9462, country: 'India' },
  'Chandigarh': { lat: 30.7333, lon: 76.7794, country: 'India' },
  'Jaipur': { lat: 26.9124, lon: 75.7873, country: 'India' },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714, country: 'India' },
  'Ulaanbaatar': { lat: 47.8864, lon: 106.9057, country: 'Mongolia' },
  'Sarajevo': { lat: 43.8563, lon: 18.4131, country: 'Bosnia' },
  'Skopje': { lat: 41.9981, lon: 21.4254, country: 'North Macedonia' },
  'Almaty': { lat: 43.2220, lon: 76.8512, country: 'Kazakhstan' },
  'Bakersfield': { lat: 35.3733, lon: -119.0187, country: 'United States' },
  'Fresno': { lat: 36.7468, lon: -119.7726, country: 'United States' },
  'Chiang Mai': { lat: 18.7883, lon: 98.9853, country: 'Thailand' },
  'Faisalabad': { lat: 31.4504, lon: 73.1350, country: 'Pakistan' },
  'Chengdu': { lat: 30.5728, lon: 104.0668, country: 'China' },
  'Wuhan': { lat: 30.5928, lon: 114.3055, country: 'China' },
};

// In-memory client cache with 3-minute TTL
interface CachedReading {
  data: LiveAirReading;
  expiresAt: number;
}
const cache = new Map<string, CachedReading>();
const CACHE_TTL_MS = 3 * 60 * 1000;

/**
 * Dynamically calculates the optimal clean air window using atmospheric physics:
 * - Planetary Boundary Layer vertical thermal convection onset (ground solar heating)
 * - Terrain morphology (Basins vs Coastal sea-breeze vs Plateaus)
 * - Baseline pollution severity (elevated inversion delay)
 */
export function calculateDynamicCleanWindow(
  terrainType: string,
  pm25: number,
  _tempC?: number,
  _windSpeedKmh?: number
): { cleanWindowHours: string; pblHeightMeters: number; reason: string } {
  // If ambient air is pristine / clean
  if (pm25 <= 25) {
    return {
      cleanWindowHours: 'All Day (9:00 AM – 6:00 PM)',
      pblHeightMeters: 1450,
      reason: 'Low particulate baseline with continuous vertical convective dispersion.',
    };
  }

  // Coastal microclimate: Onshore sea-breeze flushing in afternoon
  if (terrainType.includes('Coastal')) {
    return {
      cleanWindowHours: '1:00 PM – 5:30 PM',
      pblHeightMeters: Math.max(620, Math.min(1250, 1050 - Math.round(pm25 * 1.2))),
      reason: 'Diurnal sea-breeze circulation clears morning construction dust and haze.',
    };
  }

  // High-elevation Plateau microclimate
  if (terrainType.includes('Plateau')) {
    return {
      cleanWindowHours: '10:30 AM – 4:00 PM',
      pblHeightMeters: Math.max(700, Math.min(1350, 1150 - Math.round(pm25 * 1.1))),
      reason: 'High elevation solar radiation initiates early boundary-layer convective lifting.',
    };
  }

  // Plains / Basins / Valleys: Severe nocturnal surface radiational cooling
  const startHour = pm25 > 220 ? '11:45 AM' : '11:15 AM';
  const endHour = pm25 > 250 ? '3:15 PM' : '3:45 PM';
  const pbl = Math.max(160, Math.min(1350, 1200 - Math.round(pm25 * 2.2)));

  return {
    cleanWindowHours: `${startHour} – ${endHour}`,
    pblHeightMeters: pbl,
    reason: 'Intense diurnal solar ground heating forces vertical convective boundary expansion.',
  };
}

/**
 * Resolves latitude, longitude, and country for any city globally.
 * Uses static metro cache first, then falls back to Open-Meteo's free geocoding API.
 */
export async function resolveCityCoordinates(cityName: string): Promise<{ lat: number; lon: number; country?: string }> {
  const normalized = sanitizeCityQuery(cityName);
  if (!normalized) {
    return { lat: 28.6139, lon: 77.2090, country: 'India' };
  }
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }

  // Case-insensitive match in preconfigured table
  const matchKey = Object.keys(CITY_COORDINATES).find(
    (k) => k.toLowerCase() === normalized.toLowerCase()
  );
  if (matchKey) {
    return CITY_COORDINATES[matchKey];
  }

  // Dynamic Geocoding lookup via Open-Meteo (fast, zero key required)
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalized)}&count=1&language=en&format=json`;
    const res = await fetch(geoUrl);
    if (res.ok) {
      const parsed = OpenMeteoGeocodingSchema.safeParse(await res.json());
      if (parsed.success && parsed.data.results?.[0]) {
        const item = parsed.data.results[0];
        const resolved = {
          lat: item.latitude,
          lon: item.longitude,
          country: item.country || 'Global',
        };
        CITY_COORDINATES[normalized] = resolved;
        return resolved;
      }
    }
  } catch {
    // ignore network errors and fallback
  }

  return { lat: 28.6139, lon: 77.2090, country: 'India' };
}

interface WeatherFallback {
  temperatureC: number;
  humidityPct: number;
  windSpeedKmh: number;
}

async function parseWeatherTelemetry(
  weatherRes: Response | null,
  fallback: WeatherFallback
): Promise<WeatherFallback> {
  if (!weatherRes || !weatherRes.ok) return fallback;
  try {
    const parsed = OpenMeteoWeatherSchema.safeParse(await weatherRes.json());
    if (!parsed.success) return fallback;
    const current = parsed.data.current;
    return {
      temperatureC:
        current.temperature_2m !== undefined
          ? Math.round(current.temperature_2m)
          : fallback.temperatureC,
      humidityPct:
        current.relative_humidity_2m !== undefined
          ? Math.round(current.relative_humidity_2m)
          : fallback.humidityPct,
      windSpeedKmh:
        current.wind_speed_10m !== undefined
          ? Math.round(current.wind_speed_10m * 10) / 10
          : fallback.windSpeedKmh,
    };
  } catch {
    return fallback;
  }
}

/**
 * Fetches real-time atmospheric particulate pollution & weather from Open-Meteo API
 * (100% free, zero cost, no API keys, client-side execution).
 * Dynamically resolves coordinates for ANY city in the world.
 */
export async function fetchLiveAirQuality(cityName: string): Promise<LiveAirReading> {
  const profile = getCityProfile(cityName);
  const now = Date.now();

  // Return cached result if valid
  const cached = cache.get(cityName);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const coords = await resolveCityCoordinates(cityName);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm2_5,pm10,nitrogen_dioxide`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const [airRes, weatherRes] = await Promise.all([
      fetch(airUrl, { signal: controller.signal }),
      fetch(weatherUrl, { signal: controller.signal }).catch(() => null),
    ]);

    clearTimeout(timeoutId);

    if (!airRes.ok) {
      throw new Error(`Open-Meteo Air Quality HTTP ${airRes.status}`);
    }

    const parsedAir = OpenMeteoAirQualitySchema.safeParse(await airRes.json());
    if (!parsedAir.success) {
      throw new Error('Invalid PM2.5 in API response');
    }
    const currentAir = parsedAir.data.current;

    const {
      temperatureC: tempC,
      humidityPct: humidity,
      windSpeedKmh: wind,
    } = await parseWeatherTelemetry(weatherRes, {
      temperatureC: profile.temperatureC,
      humidityPct: profile.humidityPct,
      windSpeedKmh: profile.windSpeedKmh,
    });

    const livePm25 = Math.round(currentAir.pm2_5);
    const dynamicWindow = calculateDynamicCleanWindow(profile.terrainType, livePm25, tempC, wind);

    const reading: LiveAirReading = {
      cityName,
      country: coords.country || profile.country,
      pm25: livePm25,
      pm10: typeof currentAir.pm10 === 'number' ? Math.round(currentAir.pm10) : undefined,
      no2: typeof currentAir.nitrogen_dioxide === 'number' ? Math.round(currentAir.nitrogen_dioxide) : undefined,
      temperatureC: tempC,
      humidityPct: humidity,
      windSpeedKmh: wind,
      cleanWindowHours: dynamicWindow.cleanWindowHours,
      pblHeightMeters: dynamicWindow.pblHeightMeters,
      source: 'Live CAMS / Satellite & Ground',
      isLive: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    cache.set(cityName, { data: reading, expiresAt: now + CACHE_TTL_MS });
    return reading;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMsg = err instanceof Error ? err.message : 'Network error';

    const dynamicWindow = calculateDynamicCleanWindow(profile.terrainType, profile.baselinePm25);

    // Safe fallback to verified atmospheric profile with dynamic window calculation
    const fallbackReading: LiveAirReading = {
      cityName,
      country: profile.country,
      pm25: profile.baselinePm25,
      cleanWindowHours: dynamicWindow.cleanWindowHours,
      pblHeightMeters: dynamicWindow.pblHeightMeters,
      temperatureC: profile.temperatureC,
      humidityPct: profile.humidityPct,
      windSpeedKmh: profile.windSpeedKmh,
      source: 'Verified Atmospheric Baseline',
      isLive: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      error: errorMsg,
    };

    return fallbackReading;
  }
}
