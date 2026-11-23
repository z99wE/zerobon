import { MassBalanceParams, InhaledDoseParams, BreathReceipt, HourlyAtmosphericForecast } from '../types';

export const CIGARETTE_EQUIVALENT_PM25_UG = 22.0;

export const DEFAULT_PHYSICS_PARAMS: MassBalanceParams = {
  p_penetration: 0.78,    // Typical residential window/wall penetration factor
  lambda_ach: 0.85,       // Baseline air exchange rate (h^-1)
  k_deposition: 0.22,     // Natural surface deposition rate (h^-1)
  q_cadr: 0.0,            // Clean Air Delivery Rate (m3/h)
  volume_m3: 110.0,       // 45 m2 apartment (~270 m3 or single family master zone 110 m3)
  e_indoor_ug_h: 0.0,     // Indoor generation rate (e.g. frying, incense)
};

/**
 * Calculates instantaneous derivative dCin/dt
 */
export function computeDerivative(
  cin: number,
  cout: number,
  params: MassBalanceParams
): number {
  const removalRate = params.lambda_ach + params.k_deposition + (params.q_cadr / Math.max(1, params.volume_m3));
  const infiltration = params.p_penetration * params.lambda_ach * cout;
  const emissionRate = params.e_indoor_ug_h / Math.max(1, params.volume_m3);
  return infiltration - removalRate * cin + emissionRate;
}

/**
 * Analytical forward solution for step dt (hours)
 * Cin(t) = Css + (Cin(0) - Css) * exp(-keff * dt)
 */
export function stepAnalytical(
  cin0: number,
  cout: number,
  dtHours: number,
  params: MassBalanceParams
): { cin: number; steadyState: number; decayRate: number } {
  const keff = params.lambda_ach + params.k_deposition + (params.q_cadr / Math.max(1, params.volume_m3));
  const totalSource = params.p_penetration * params.lambda_ach * cout + (params.e_indoor_ug_h / Math.max(1, params.volume_m3));
  
  const steadyState = keff > 1e-5 ? totalSource / keff : cin0;
  const nextCin = steadyState + (cin0 - steadyState) * Math.exp(-keff * dtHours);

  return {
    cin: Math.max(0, nextCin),
    steadyState: Math.max(0, steadyState),
    decayRate: keff,
  };
}

/**
 * Deterministic breath dose and counterfactual receipt calculator
 */
export function computeBreathReceipt(
  tenantName: string,
  actionTitle: string,
  intervention: InhaledDoseParams,
  counterfactual: InhaledDoseParams,
  actionType: 'corsi_rosenthal' | 'metro_transit' | 'wfh_smog_day' | 'ev_carpool' | 'window_airing'
): BreathReceipt {
  const calcDose = (p: InhaledDoseParams) => {
    return p.concentration_ug_m3 * p.minute_ventilation_m3_min * p.duration_minutes * (1 - Math.min(0.999, Math.max(0, p.mask_efficiency)));
  };

  const actualDose = calcDose(intervention);
  const baselineDose = calcDose(counterfactual);
  const doseSaved = Math.max(0, baselineDose - actualDose);
  const cigsSaved = doseSaved / CIGARETTE_EQUIVALENT_PM25_UG;

  // IPCC / EPA conversion factors
  const factors = {
    corsi_rosenthal: { co2e: 120, nox: 0.08, pm25: 0.85, multiplier: 1.2 },
    metro_transit: { co2e: 1450, nox: 3.80, pm25: 0.45, multiplier: 2.5 },
    wfh_smog_day: { co2e: 2850, nox: 7.20, pm25: 0.95, multiplier: 3.1 },
    ev_carpool: { co2e: 980, nox: 2.10, pm25: 0.22, multiplier: 1.8 },
    window_airing: { co2e: 0, nox: 0.00, pm25: 0.60, multiplier: 1.1 },
  }[actionType] || { co2e: 450, nox: 1.2, pm25: 0.15, multiplier: 1.0 };

  return {
    receiptId: `ZB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    tenantName,
    actionTitle,
    inhaledDoseUg: Math.round(actualDose * 10) / 10,
    counterfactualDoseUg: Math.round(baselineDose * 10) / 10,
    doseSavedUg: Math.round(doseSaved * 10) / 10,
    cigaretteEquivalentsSaved: Math.round(cigsSaved * 10) / 10,
    co2eAvoidedGrams: factors.co2e,
    noxAvoidedGrams: factors.nox,
    primaryPm25AvoidedGrams: factors.pm25,
    neighborhoodMultiplier: factors.multiplier,
  };
}

/**
 * 24-Hour Synthetic Inversion Curve generator based on real winter atmospheric physics
 * (Cold morning inversion with shallow PBL -> midday thermal solar expansion -> evening inversion capping)
 */
export function generate24HourAtmosphericForecast() {
  const hours = [
    { hour: '00:00', time24: 0, cout: 260, pbl: 180, temp: 12, inv: 'Strong Inversion' },
    { hour: '03:00', time24: 3, cout: 285, pbl: 150, temp: 10, inv: 'Strong Inversion' },
    { hour: '06:00', time24: 6, cout: 310, pbl: 140, temp: 9, inv: 'Strong Inversion' },
    { hour: '09:00', time24: 9, cout: 240, pbl: 320, temp: 16, inv: 'Moderate Trap' },
    { hour: '11:30', time24: 11.5, cout: 85, pbl: 950, temp: 22, inv: 'Clean Air Window' },
    { hour: '13:00', time24: 13, cout: 48, pbl: 1350, temp: 25, inv: 'Clean Air Window' },
    { hour: '15:00', time24: 15, cout: 62, pbl: 1100, temp: 24, inv: 'Clean Air Window' },
    { hour: '17:30', time24: 17.5, cout: 165, pbl: 480, temp: 19, inv: 'Moderate Trap' },
    { hour: '20:00', time24: 20, cout: 245, pbl: 210, temp: 15, inv: 'Strong Inversion' },
    { hour: '22:00', time24: 22, cout: 275, pbl: 190, temp: 13, inv: 'Strong Inversion' },
  ];

  return hours.map((h) => ({
    hour: h.hour,
    time24: h.time24,
    outdoorPm25: h.cout,
    pblHeightMeters: h.pbl,
    groundTempC: h.temp,
    inversionStrength: h.inv as HourlyAtmosphericForecast['inversionStrength'],
    isMiddayCleanWindow: h.inv === 'Clean Air Window',
    windSpeedKmh: h.inv === 'Clean Air Window' ? 14 : 3,
  }));
}
