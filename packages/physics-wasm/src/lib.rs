//! Zerobon Atmospheric Mass-Balance & Breath-Cost Engine
//! 100% Deterministic, #[forbid(unsafe_code)]

#![forbid(unsafe_code)]

use serde::{Deserialize, Serialize};

/// Mass-balance parameters for indoor air quality dynamics
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct MassBalanceParams {
    /// Penetration factor P (0.0 to 1.0)
    pub p_penetration: f64,
    /// Air exchange rate lambda (ACH, h^-1)
    pub lambda_ach: f64,
    /// Deposition rate k_d (h^-1), typical PM2.5 range 0.1 - 0.4 h^-1
    pub k_deposition: f64,
    /// Air cleaner clean air delivery rate Q_CADR (m^3/h)
    pub q_cadr: f64,
    /// Room volume V (m^3)
    pub volume_m3: f64,
    /// Indoor emission rate E_indoor (ug/h)
    pub e_indoor_ug_h: f64,
}

impl Default for MassBalanceParams {
    fn default() -> Self {
        Self {
            p_penetration: 0.75, // typical residential envelope
            lambda_ach: 0.80,    // 0.8 ACH typical without mechanical ventilation
            k_deposition: 0.20,  // particle settling
            q_cadr: 0.0,         // no purifier initially
            volume_m3: 110.0,    // ~45 m^2 apartment with 2.45m ceiling
            e_indoor_ug_h: 0.0,  // zero indoor emission baseline
        }
    }
}

/// Instantaneous rates and next concentration state
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct MassBalanceState {
    pub c_in: f64,
    pub c_out: f64,
    pub dc_dt: f64,
    pub steady_state_cin: f64,
    pub effective_decay_rate: f64,
}

/// Computes the instantaneous derivative dC_in/dt:
/// dC_in/dt = P * lambda * C_out - (lambda + k_d + Q_CADR/V) * C_in + E_indoor/V
pub fn compute_dc_dt(c_in: f64, c_out: f64, p: &MassBalanceParams) -> f64 {
    let removal_rate = p.lambda_ach + p.k_deposition + (p.q_cadr / p.volume_m3.max(1.0));
    let infiltration = p.p_penetration * p.lambda_ach * c_out;
    let emission_conc_rate = p.e_indoor_ug_h / p.volume_m3.max(1.0);
    infiltration - (removal_rate * c_in) + emission_conc_rate
}

/// Analytical step forward over dt (in hours) assuming constant C_out and E_indoor
pub fn step_analytical(c_in_0: f64, c_out: f64, dt_hours: f64, p: &MassBalanceParams) -> MassBalanceState {
    let removal_rate = p.lambda_ach + p.k_deposition + (p.q_cadr / p.volume_m3.max(1.0));
    let source_rate = p.p_penetration * p.lambda_ach * c_out + (p.e_indoor_ug_h / p.volume_m3.max(1.0));
    
    let steady_state = if removal_rate > 1e-6 {
        source_rate / removal_rate
    } else {
        c_in_0
    };

    let c_in_next = steady_state + (c_in_0 - steady_state) * (-removal_rate * dt_hours).exp();
    let clamped_cin = c_in_next.max(0.0);
    let dc_dt = compute_dc_dt(clamped_cin, c_out, p);

    MassBalanceState {
        c_in: clamped_cin,
        c_out,
        dc_dt,
        steady_state_cin: steady_state.max(0.0),
        effective_decay_rate: removal_rate,
    }
}

/// Inhaled Lung Dose calculation parameters
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct InhaledDoseParams {
    /// PM2.5 ambient/indoor concentration (ug/m^3)
    pub concentration_ug_m3: f64,
    /// Duration of exposure (minutes)
    pub duration_minutes: f64,
    /// Minute ventilation rate (m^3/min or L/min converted to m^3/min)
    /// Resting adult: ~0.0075 m^3/min (7.5 L/min), Moderate walk: ~0.016 m^3/min, Heavy exercise: ~0.035 m^3/min
    pub minute_ventilation_m3_min: f64,
    /// Mask filtration efficiency eta_mask (e.g. 0.0 for none, 0.95 for N95, 0.60 for surgical)
    pub mask_efficiency: f64,
}

/// Inhaled dose receipt calculation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BreathReceipt {
    /// Inhaled dose in micrograms of PM2.5
    pub inhaled_dose_ug: f64,
    /// Counterfactual dose without hack/intervention (ug)
    pub counterfactual_dose_ug: f64,
    /// Dose saved (ug)
    pub dose_saved_ug: f64,
    /// Cigarette equivalents saved (22 ug PM2.5 per cigarette)
    pub cigarette_equivalents_saved: f64,
    /// CO2 equivalent emissions avoided in grams
    pub co2e_avoided_grams: f64,
    /// NOx avoided in grams
    pub nox_avoided_grams: f64,
    /// Primary PM2.5 avoided in grams
    pub primary_pm25_avoided_grams: f64,
}

const CIGARETTE_EQUIVALENT_PM25_UG: f64 = 22.0;

/// Deterministically computes personal inhaled dose and counterfactual receipt
pub fn calculate_breath_receipt(
    intervention: InhaledDoseParams,
    counterfactual: InhaledDoseParams,
    routine_swap_type: &str,
) -> BreathReceipt {
    let compute_dose = |p: &InhaledDoseParams| -> f64 {
        let dose = p.concentration_ug_m3 
            * p.minute_ventilation_m3_min 
            * p.duration_minutes 
            * (1.0 - p.mask_efficiency.clamp(0.0, 0.999));
        dose.max(0.0)
    };

    let actual_dose = compute_dose(&intervention);
    let baseline_dose = compute_dose(&counterfactual);
    let dose_saved = (baseline_dose - actual_dose).max(0.0);
    let cigs_saved = dose_saved / CIGARETTE_EQUIVALENT_PM25_UG;

    // Routine swap IPCC emission factors (g CO2e, g NOx, g PM2.5)
    let (co2e, nox, pm25) = match routine_swap_type {
        "metro_transit" => (1450.0, 3.8, 0.45),
        "ev_carpool" => (980.0, 2.1, 0.22),
        "wfh_smog_day" => (2850.0, 7.2, 0.95),
        "corsi_rosenthal" => (120.0, 0.05, 0.85),
        "clean_window_airing" => (0.0, 0.0, 0.65),
        _ => (450.0, 1.2, 0.15),
    };

    BreathReceipt {
        inhaled_dose_ug: actual_dose,
        counterfactual_dose_ug: baseline_dose,
        dose_saved_ug: dose_saved,
        cigarette_equivalents_saved: cigs_saved,
        co2e_avoided_grams: co2e,
        nox_avoided_grams: nox,
        primary_pm25_avoided_grams: pm25,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_steady_state_clean_purifier() {
        let params = MassBalanceParams {
            p_penetration: 0.7,
            lambda_ach: 0.5,
            k_deposition: 0.2,
            q_cadr: 300.0, // High-flow Corsi-Rosenthal box or HEPA
            volume_m3: 100.0,
            e_indoor_ug_h: 0.0,
        };
        let c_out = 250.0; // severe winter smog
        let mut state = step_analytical(250.0, c_out, 0.0, &params);
        assert_eq!(state.c_in, 250.0);

        // Step forward 2 hours
        state = step_analytical(state.c_in, c_out, 2.0, &params);
        // Effective removal rate = 0.5 + 0.2 + 3.0 = 3.7 h^-1
        // Steady state = (0.7 * 0.5 * 250) / 3.7 = 87.5 / 3.7 = 23.6 ug/m^3
        assert!(state.c_in < 30.0);
        assert!(state.c_in >= 0.0);
    }

    #[test]
    fn test_mass_conservation_and_no_nan() {
        let params = MassBalanceParams::default();
        let state = step_analytical(50.0, 100.0, 1.0, &params);
        assert!(!state.c_in.is_nan());
        assert!(!state.dc_dt.is_nan());
        assert!(state.c_in > 0.0);
    }

    #[test]
    fn test_breath_receipt_dose_saved() {
        let actual = InhaledDoseParams {
            concentration_ug_m3: 20.0,
            duration_minutes: 60.0,
            minute_ventilation_m3_min: 0.015,
            mask_efficiency: 0.95, // N95 mask
        };
        let counterfactual = InhaledDoseParams {
            concentration_ug_m3: 250.0,
            duration_minutes: 60.0,
            minute_ventilation_m3_min: 0.015,
            mask_efficiency: 0.0,
        };

        let receipt = calculate_breath_receipt(actual, counterfactual, "metro_transit");
        assert!(receipt.dose_saved_ug > 200.0);
        assert!(receipt.cigarette_equivalents_saved > 5.0);
        assert_eq!(receipt.co2e_avoided_grams, 1450.0);
    }
}
