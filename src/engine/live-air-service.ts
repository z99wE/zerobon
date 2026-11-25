// src/engine/live-air-service.ts
import { getCityProfile } from './city-data';

export interface LiveAirReading {
  cityName: string;
  pm25: number;
  pm10?: number;
  no2?: number;
  source: 'Live CAMS / Satellite & Ground' | 'Verified Atmospheric Baseline';
  isLive: boolean;
  timestamp: string;
  error?: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Delhi NCR': { lat: 28.6139, lon: 77.2090 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Bengaluru': { lat: 12.9716, lon: 77.5946 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Lahore': { lat: 31.5204, lon: 74.3587 },
  'Karachi': { lat: 24.8607, lon: 67.0011 },
  'Dhaka': { lat: 23.8103, lon: 90.4125 },
  'Kathmandu': { lat: 27.7172, lon: 85.3240 },
  'Beijing': { lat: 39.9042, lon: 116.4074 },
  'Shanghai': { lat: 31.2304, lon: 121.4737 },
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Seoul': { lat: 37.5665, lon: 126.9780 },
  'Bangkok': { lat: 13.7563, lon: 100.5018 },
  'Hanoi': { lat: 21.0285, lon: 105.8542 },
  'Jakarta': { lat: -6.2088, lon: 106.8456 },
  'Singapore': { lat: 1.3521, lon: 103.8198 },
  'Dubai': { lat: 25.2048, lon: 55.2708 },
  'Tehran': { lat: 35.6892, lon: 51.3890 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'Berlin': { lat: 52.5200, lon: 13.4050 },
  'Milan': { lat: 45.4642, lon: 9.1900 },
  'Madrid': { lat: 40.4168, lon: -3.7038 },
  'Warsaw': { lat: 52.2297, lon: 21.0122 },
  'Zurich': { lat: 47.3769, lon: 8.5417 },
  'Amsterdam': { lat: 52.3676, lon: 4.9041 },
  'New York': { lat: 40.7128, lon: -74.0060 },
  'Los Angeles': { lat: 34.0522, lon: -118.2437 },
  'Salt Lake City': { lat: 40.7608, lon: -111.8910 },
  'Toronto': { lat: 43.6532, lon: -79.3832 },
  'Mexico City': { lat: 19.4326, lon: -99.1332 },
  'São Paulo': { lat: -23.5505, lon: -46.6333 },
  'Santiago': { lat: -33.4489, lon: -70.6693 },
  'Bogota': { lat: 4.7110, lon: -74.0721 },
  'Cairo': { lat: 30.0444, lon: 31.2357 },
  'Nairobi': { lat: -1.2921, lon: 36.8219 },
  'Johannesburg': { lat: -26.2041, lon: 28.0473 },
  'Sydney': { lat: -33.8688, lon: 151.2093 },
  'Melbourne': { lat: -37.8136, lon: 144.9631 },
  'Patna': { lat: 25.5941, lon: 85.1376 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 },
  'Chandigarh': { lat: 30.7333, lon: 76.7794 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Ulaanbaatar': { lat: 47.8864, lon: 106.9057 },
  'Sarajevo': { lat: 43.8563, lon: 18.4131 },
  'Skopje': { lat: 41.9981, lon: 21.4254 },
  'Almaty': { lat: 43.2220, lon: 76.8512 },
  'Bakersfield': { lat: 35.3733, lon: -119.0187 },
  'Fresno': { lat: 36.7468, lon: -119.7726 },
  'Chiang Mai': { lat: 18.7883, lon: 98.9853 },
  'Faisalabad': { lat: 31.4504, lon: 73.1350 },
  'Chengdu': { lat: 30.5728, lon: 104.0668 },
  'Wuhan': { lat: 30.5928, lon: 114.3055 },
};

// In-memory client cache with 5-minute TTL
interface CachedReading {
  data: LiveAirReading;
  expiresAt: number;
}
const cache = new Map<string, CachedReading>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches real-time particulate pollution from Open-Meteo Air Quality API
 * (100% free, zero cost, no API keys, client-side execution).
 * Falls back safely to verified regional baseline if offline or network drops.
 */
export async function fetchLiveAirQuality(cityName: string): Promise<LiveAirReading> {
  const profile = getCityProfile(cityName);
  const now = Date.now();

  // Return cached result if valid
  const cached = cache.get(cityName);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const coords = CITY_COORDINATES[cityName] || { lat: 28.6139, lon: 77.2090 };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm2_5,pm10,nitrogen_dioxide`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo API HTTP ${res.status}`);
    }

    const json = await res.json();
    const current = json.current;

    if (typeof current?.pm2_5 !== 'number' || isNaN(current.pm2_5)) {
      throw new Error('Invalid PM2.5 format in API response');
    }

    const livePm25 = Math.round(current.pm2_5);
    const reading: LiveAirReading = {
      cityName,
      pm25: livePm25,
      pm10: typeof current.pm10 === 'number' ? Math.round(current.pm10) : undefined,
      no2: typeof current.nitrogen_dioxide === 'number' ? Math.round(current.nitrogen_dioxide) : undefined,
      source: 'Live CAMS / Satellite & Ground',
      isLive: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    cache.set(cityName, { data: reading, expiresAt: now + CACHE_TTL_MS });
    return reading;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMsg = err instanceof Error ? err.message : 'Network error';

    // Safe fallback to verified atmospheric profile
    const fallbackReading: LiveAirReading = {
      cityName,
      pm25: profile.baselinePm25,
      source: 'Verified Atmospheric Baseline',
      isLive: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      error: errorMsg,
    };

    return fallbackReading;
  }
}
