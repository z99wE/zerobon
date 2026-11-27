import rawFlags from '../../flags.json';

export interface FeatureFlags {
  liveOpenMeteoSync: boolean;
  sanctuaryCalibration: boolean;
  safeRecessPassPdf: boolean;
  hardenedCopilot: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  liveOpenMeteoSync: rawFlags.flags?.liveOpenMeteoSync?.enabled ?? true,
  sanctuaryCalibration: rawFlags.flags?.sanctuaryCalibration?.enabled ?? true,
  safeRecessPassPdf: rawFlags.flags?.safeRecessPassPdf?.enabled ?? true,
  hardenedCopilot: rawFlags.flags?.hardenedCopilot?.enabled ?? true,
};
