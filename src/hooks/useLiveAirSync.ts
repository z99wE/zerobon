import { useCallback, useEffect, useState } from 'react';
import { fetchLiveAirQuality, LiveAirReading } from '../engine/live-air-service';
import { FEATURE_FLAGS } from '../config/feature-flags';

interface UseLiveAirSyncResult {
  liveReading: LiveAirReading | null;
  isLiveSyncing: boolean;
  outdoorPm25: number;
  setOutdoorPm25: (val: number) => void;
  syncLiveAir: () => Promise<void>;
}

/**
 * Synchronizes outdoor particulate readings with live Open-Meteo telemetry
 * whenever the selected city changes or when manually triggered.
 */
export function useLiveAirSync(
  selectedCity: string,
  baselinePm25: number
): UseLiveAirSyncResult {
  const [liveReading, setLiveReading] = useState<LiveAirReading | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [outdoorPm25, setOutdoorPm25] = useState<number>(baselinePm25);

  const performSync = useCallback(
    async (isCancelled?: () => boolean) => {
      if (!FEATURE_FLAGS.liveOpenMeteoSync) return;
      setIsLiveSyncing(true);
      try {
        const reading = await fetchLiveAirQuality(selectedCity);
        if (isCancelled?.()) return;
        setLiveReading(reading);
        if (reading.isLive) {
          setOutdoorPm25(reading.pm25);
        }
      } catch (err) {
        console.warn('Real-time atmospheric fetch fallback:', err);
      } finally {
        if (!isCancelled?.()) {
          setIsLiveSyncing(false);
        }
      }
    },
    [selectedCity]
  );

  useEffect(() => {
    let cancelled = false;
    setOutdoorPm25(baselinePm25);
    void performSync(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [baselinePm25, performSync]);

  const syncLiveAir = useCallback(() => performSync(), [performSync]);

  return {
    liveReading,
    isLiveSyncing,
    outdoorPm25,
    setOutdoorPm25,
    syncLiveAir,
  };
}
