import { z } from 'zod';
import { VERIFIED_HACK_IDS } from '../shared/verified-hack-ids';

export { VERIFIED_HACK_IDS, type VerifiedHackId } from '../shared/verified-hack-ids';

export type TenantRole = 'household_member' | 'tenant_admin';

export interface TenantConfig {
  id: string;
  name: string;
  type: 'family' | 'school' | 'rwa' | 'corporate';
  h3Index: string;
  subdomain: string;
  recessCancellationPM25Threshold?: number;
  wfhSmogAlertThreshold?: number;
  totalMembers: number;
  activePledgesCount: number;
  collectiveEmissionsSavedKg: number;
}

export interface MassBalanceParams {
  p_penetration: number;      // Envelope penetration coefficient (0.3 to 0.95)
  lambda_ach: number;         // Air exchange rate (1/h)
  k_deposition: number;       // Gravitational & surface deposition (1/h)
  q_cadr: number;             // Clean Air Delivery Rate (m3/h)
  volume_m3: number;          // Room volume (m3)
  e_indoor_ug_h: number;      // Indoor source generation rate (ug/h)
}

export interface SimulationState {
  cin: number;                // Indoor PM2.5 in ug/m3
  cout: number;               // Outdoor PM2.5 in ug/m3
  steadyStateCin: number;     // Theoretical steady state
  decayRatePerHour: number;   // Total removal rate (lambda + kd + CADR/V)
  windowOpen: boolean;
  exhaustActive: boolean;
  corsiRosenthalActive: boolean;
  draftSealed: boolean;
}

export interface InhaledDoseParams {
  concentration_ug_m3: number;
  duration_minutes: number;
  minute_ventilation_m3_min: number;
  mask_efficiency: number;
}

export interface BreathReceipt {
  receiptId: string;
  timestamp: string;
  tenantName: string;
  actionTitle: string;
  inhaledDoseUg: number;
  counterfactualDoseUg: number;
  doseSavedUg: number;
  cigaretteEquivalentsSaved: number;
  co2eAvoidedGrams: number;
  noxAvoidedGrams: number;
  primaryPm25AvoidedGrams: number;
  neighborhoodMultiplier: number;
}

export interface HourlyAtmosphericForecast {
  hour: string;
  time24: number;
  outdoorPm25: number;
  pblHeightMeters: number;
  groundTempC: number;
  inversionStrength: 'Strong Inversion' | 'Moderate Trap' | 'Clean Air Window' | 'Neutral';
  isMiddayCleanWindow: boolean;
  windSpeedKmh: number;
}

export interface IncidentBeacon {
  id: string;
  type: 'waste_burning' | 'construction_dust' | 'diesel_gen' | 'traffic_congestion';
  h3Cell: string;
  relativeDistanceKm: number;
  reportedMinutesAgo: number;
  verifiedCount: number;
}

export interface H3NeighborDome {
  id: string;
  tenantName: string;
  hexOffset: [number, number]; // [x, z] isometric offset
  indoorPm25: number;
  petStatus: 'calm' | 'alert_mask' | 'ventilate' | 'celebrate';
  activeHack: string;
}

// 5-Layer Copilot Schema (Strict Zod validation)
// VERIFIED_HACK_IDS is imported from the shared canonical module above.
export const CopilotResponseSchema = z.object({
  intent_valid: z.boolean(),
  routine_advice: z.array(z.string().max(500)).max(5),
  iaq_hack_ids: z.array(z.enum(VERIFIED_HACK_IDS)).max(3),
  pet_animation_state: z.enum(['calm', 'alert_mask', 'ventilate', 'celebrate']),
  safety_note: z.string().max(250).optional(),
});

export type CopilotResponse = z.infer<typeof CopilotResponseSchema>;

export interface SecurityFirewallReport {
  timestamp: string;
  rawInput: string;
  sanitizedInput: string;
  delimiters: {
    startTag: string;
    endTag: string;
  };
  checksPassed: {
    lengthUnder400: boolean;
    unicodeClean: boolean;
    instructionOverrideClean: boolean;
    canaryUntouched: boolean;
    schemaValid: boolean;
  };
  attackDetected: boolean;
  attackType?: 'instruction_override' | 'canary_leak_attempt' | 'base64_smuggle' | 'oversized_payload' | 'rag_pollution';
  status: 'allowed' | 'sanitized' | 'blocked_fallback';
  canaryToken: string;
}
