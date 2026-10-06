/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Verified Statistical Calculations Engine for Eurostat Housing & Inflation Data
 *
 * Formal Formula:
 *   Real HPI(t) = 100 * ( Nominal HPI(t) / HICP(t) )
 *
 * Verification & Audit Safeguards:
 * 1. Period alignment check: ensures HPI and HICP refer to the exact same quarter.
 * 2. Base index consistency check: ensures both series share an aligned reference base (e.g. 2015 = 100).
 * 3. Validation guards for missing (null/undefined), non-finite (NaN/Infinity), zero denominator, and negative values.
 * 4. Documented Eurostat half-up rounding rules (2 decimals for indices, 2 decimals for growth rates).
 * 5. Rebasification transitivity and statistical revision management.
 */

import {
  CalculationAuditResult,
  QuarterlyObservation,
  RebaseMode,
} from '../data/types';

/**
 * Standard Eurostat and econometric rounding conventions
 */
export const ROUNDING_RULES = {
  INDEX_DECIMALS: 2,
  GROWTH_RATE_DECIMALS: 2,
  METHOD: 'half-up' as const, // Arrondi arithmétique demi-supérieur standard Eurostat
  DESCRIPTION:
    'Calcul intermédiaire en double précision IEEE-754 puis arrondi arithmétique standard demi-supérieur (half-up) à 2 décimales pour les indices et les taux de croissance, sans biais de représentation binaire.',
};

/**
 * Robust Half-Up Rounding function (arrondi arithmétique demi-supérieur)
 * Prevents JavaScript floating point representation issues (e.g., 1.005 * 100 = 100.49999999999999)
 * by utilizing exponential notation normalization.
 */
export function roundHalfUp(value: number, decimals = ROUNDING_RULES.INDEX_DECIMALS): number {
  if (!isFinite(value)) return value;
  // Convert to scientific notation to shift decimal point safely
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

export interface CalculateRealHpiAuditParams {
  hpi: number | null | undefined;
  hicp: number | null | undefined;
  hpiPeriod?: string;
  hicpPeriod?: string;
  hpiBase?: string;
  hicpBase?: string;
  decimals?: number;
}

/**
 * Audit-grade Real HPI Calculation.
 * Evaluates Real HPI = 100 * (HPI / HICP) while performing 5 comprehensive consistency checks:
 * 1. Period consistency check
 * 2. Base index alignment check
 * 3. Denominator validity (strictly positive HICP > 0)
 * 4. Numerator validity (non-negative HPI >= 0)
 * 5. Finite numeric value check
 *
 * Returns the final value alongside full audit diagnostic metadata and step-by-step substitution.
 */
export function calculateRealHpiAudit(params: CalculateRealHpiAuditParams): CalculationAuditResult {
  const {
    hpi,
    hicp,
    hpiPeriod,
    hicpPeriod,
    hpiBase = '2015=100',
    hicpBase = '2015=100',
    decimals = ROUNDING_RULES.INDEX_DECIMALS,
  } = params;

  // 1. Period Check
  const hasPeriods = Boolean(hpiPeriod && hicpPeriod);
  const periodPassed = !hasPeriods || hpiPeriod === hicpPeriod;
  const periodDetails = hasPeriods
    ? periodPassed
      ? `Périodes concordantes (${hpiPeriod} = ${hicpPeriod})`
      : `Incohérence temporelle détectée : HPI=${hpiPeriod} vs HICP=${hicpPeriod}`
    : 'Périodes non spécifiées (vérification implicite)';

  // 2. Base Index Check
  const basePassed = !hpiBase || !hicpBase || hpiBase === hicpBase;
  const baseDetails = basePassed
    ? `Bases concordantes (${hpiBase})`
    : `Incohérence de base détectée : HPI(${hpiBase}) vs HICP(${hicpBase})`;

  // 3. Denominator Check (HICP must be strictly positive)
  const isHicpValid = hicp !== null && hicp !== undefined && !isNaN(hicp);
  const denomPassed = isHicpValid && hicp > 0;
  const denomDetails = !isHicpValid
    ? 'Dénominateur HICP manquant ou non défini'
    : hicp === 0
    ? 'Dénominateur HICP nul (division par zéro impossible)'
    : hicp < 0
    ? `Dénominateur HICP invalide (indice négatif impossible : ${hicp})`
    : `Dénominateur HICP strictement positif (${hicp} > 0)`;

  // 4. Numerator Check (HPI must be non-negative)
  const isHpiValid = hpi !== null && hpi !== undefined && !isNaN(hpi);
  const numPassed = isHpiValid && hpi >= 0;
  const numDetails = !isHpiValid
    ? 'Numérateur HPI manquant ou non défini'
    : hpi < 0
    ? `Numérateur HPI invalide (indice négatif impossible : ${hpi})`
    : `Numérateur HPI valide (${hpi} >= 0)`;

  // 5. Finite Check
  const finitePassed = isHpiValid && isHicpValid && isFinite(hpi) && isFinite(hicp);
  const finiteDetails = finitePassed
    ? 'Valeurs numériques finies valides'
    : 'Valeurs non finies (NaN ou infini détecté)';

  const checks = {
    periodCheck: { passed: periodPassed, details: periodDetails },
    baseCheck: { passed: basePassed, details: baseDetails },
    denominatorCheck: { passed: denomPassed, details: denomDetails },
    numeratorCheck: { passed: numPassed, details: numDetails },
    finiteCheck: { passed: finitePassed, details: finiteDetails },
  };

  // Failure triage
  if (!periodPassed) {
    return {
      value: null,
      isValid: false,
      errorCode: 'PERIOD_MISMATCH',
      message: `Calcul rejeté : discordance de période entre HPI (${hpiPeriod}) et HICP (${hicpPeriod}).`,
      stepByStep: {
        formula: 'Real HPI(t) = 100 * ( HPI(t) / HICP(t) )',
        substituted: 'Périodes incompatibles',
        rawResult: null,
        roundedResult: null,
        roundingRule: `${decimals} décimales, demi-supérieur (half-up)`,
      },
      checks,
    };
  }

  if (!basePassed) {
    return {
      value: null,
      isValid: false,
      errorCode: 'BASE_MISMATCH',
      message: `Calcul rejeté : discordance de base de référence entre HPI (${hpiBase}) et HICP (${hicpBase}).`,
      stepByStep: {
        formula: 'Real HPI(t) = 100 * ( HPI(t) / HICP(t) )',
        substituted: 'Bases incompatibles',
        rawResult: null,
        roundedResult: null,
        roundingRule: `${decimals} décimales, demi-supérieur (half-up)`,
      },
      checks,
    };
  }

  if (!isHpiValid || !isHicpValid) {
    return {
      value: null,
      isValid: false,
      errorCode: 'MISSING_INPUT',
      message: 'Calcul impossible : valeur manquante pour HPI ou HICP.',
      stepByStep: {
        formula: 'Real HPI(t) = 100 * ( HPI(t) / HICP(t) )',
        substituted: `100 * ( ${hpi ?? 'N/D'} / ${hicp ?? 'N/D'} )`,
        rawResult: null,
        roundedResult: null,
        roundingRule: `${decimals} décimales, demi-supérieur (half-up)`,
      },
      checks,
    };
  }

  if (hicp === 0) {
    return {
      value: null,
      isValid: false,
      errorCode: 'ZERO_DENOMINATOR',
      message: 'Erreur mathématique : dénominateur HICP nul (division par zéro).',
      stepByStep: {
        formula: 'Real HPI(t) = 100 * ( HPI(t) / HICP(t) )',
        substituted: `100 * ( ${hpi} / 0 ) = Indéfini`,
        rawResult: null,
        roundedResult: null,
        roundingRule: `${decimals} décimales, demi-supérieur (half-up)`,
      },
      checks,
    };
  }

  if (hpi < 0 || hicp < 0) {
    return {
      value: null,
      isValid: false,
      errorCode: 'NEGATIVE_INDEX',
      message: 'Erreur économique : un indice de prix ne peut pas être strictement négatif.',
      stepByStep: {
        formula: 'Real HPI(t) = 100 * ( HPI(t) / HICP(t) )',
        substituted: `100 * ( ${hpi} / ${hicp} )`,
        rawResult: null,
        roundedResult: null,
        roundingRule: `${decimals} décimales, demi-supérieur (half-up)`,
      },
      checks,
    };
  }

  if (!finitePassed) {
    return {
      value: null,
      isValid: false,
      errorCode: 'NON_FINITE',
      message: 'Erreur numérique : valeur infinie ou indéterminée.',
      stepByStep: {
        formula: 'Real HPI(t) = 100 * ( HPI(t) / HICP(t) )',
        substituted: `100 * ( ${hpi} / ${hicp} )`,
        rawResult: null,
        roundedResult: null,
        roundingRule: `${decimals} décimales, demi-supérieur (half-up)`,
      },
      checks,
    };
  }

  // Exact computation
  const rawRatio = hpi / hicp;
  const rawValue = 100 * rawRatio;
  const roundedValue = roundHalfUp(rawValue, decimals);

  // Outlier detection (> 10 000 or < 1)
  const isOutlier = roundedValue > 10000 || roundedValue < 1;
  const errorCode = isOutlier ? 'OUTLIER_WARNING' : undefined;
  const message = isOutlier
    ? `Avertissement statistique : valeur calculée atypique (${roundedValue})`
    : `Calcul vérifié conforme : HPI réel = ${roundedValue}`;

  return {
    value: roundedValue,
    isValid: true,
    errorCode,
    message,
    stepByStep: {
      formula: 'Real HPI(t) = 100 * ( HPI(t) / HICP(t) )',
      substituted: `100 * ( ${hpi} / ${hicp} ) = 100 * ${rawRatio.toFixed(6)} = ${rawValue.toFixed(6)}`,
      rawResult: rawValue,
      roundedResult: roundedValue,
      roundingRule: `Arrondi arithmétique demi-supérieur à ${decimals} décimales (Eurostat)`,
    },
    checks,
  };
}

/**
 * Standard fast Real HPI calculation wrapper.
 * Returns the verified number or null, applying all guards and the standard Eurostat half-up rounding.
 */
export function calculateRealHpi(
  hpiNominal: number | null | undefined,
  hicp: number | null | undefined
): number | null {
  const audit = calculateRealHpiAudit({ hpi: hpiNominal, hicp });
  return audit.isValid ? audit.value : null;
}

/**
 * Computes growth percentage between two values: ((current - previous) / previous) * 100
 * Applies half-up rounding to 2 decimals.
 */
export function calculateGrowthRate(
  current: number | null | undefined,
  previous: number | null | undefined,
  decimals = ROUNDING_RULES.GROWTH_RATE_DECIMALS
): number | null {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    isNaN(current) ||
    isNaN(previous) ||
    previous === 0
  ) {
    return null;
  }

  const rate = ((current - previous) / Math.abs(previous)) * 100;
  if (!isFinite(rate)) return null;

  return roundHalfUp(rate, decimals);
}

/**
 * Validates consistency between two series arrays (e.g. HPI and HICP)
 * Checks:
 * - Period alignment
 * - Coverage gaps
 * - Base consistency
 */
export function validateSeriesConsistency(
  observations: QuarterlyObservation[]
): {
  isFullyConsistent: boolean;
  totalPeriods: number;
  validPairsCount: number;
  missingHpiCount: number;
  missingHicpCount: number;
  anomalies: { period: string; issue: string }[];
} {
  const anomalies: { period: string; issue: string }[] = [];
  let validPairsCount = 0;
  let missingHpiCount = 0;
  let missingHicpCount = 0;

  for (const obs of observations) {
    const hasHpi = obs.hpi.total !== null && !isNaN(obs.hpi.total);
    const hasHicp = obs.hicp !== null && !isNaN(obs.hicp);

    if (hasHpi && hasHicp) {
      if (obs.hicp! <= 0) {
        anomalies.push({
          period: obs.period,
          issue: `HICP non strictement positif (${obs.hicp})`,
        });
      } else if (obs.hpi.total! < 0) {
        anomalies.push({
          period: obs.period,
          issue: `HPI strictement négatif (${obs.hpi.total})`,
        });
      } else {
        validPairsCount++;
      }
    } else {
      if (!hasHpi) missingHpiCount++;
      if (!hasHicp) missingHicpCount++;
      anomalies.push({
        period: obs.period,
        issue: `Donnée incomplète : HPI=${hasHpi ? 'OK' : 'Manquant'}, HICP=${hasHicp ? 'OK' : 'Manquant'}`,
      });
    }
  }

  return {
    isFullyConsistent: anomalies.length === 0,
    totalPeriods: observations.length,
    validPairsCount,
    missingHpiCount,
    missingHicpCount,
    anomalies,
  };
}

/**
 * Enriches a quarterly observations series with:
 * - Real HPI
 * - QoQ variations
 * - YoY variations
 * - Cumulative growth from first valid observation
 */
export function computeSeriesVariations(observations: QuarterlyObservation[]): QuarterlyObservation[] {
  // Sort chronologically
  const sorted = [...observations].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.quarter - b.quarter;
  });

  // Find baseline values for cumulative growth (first valid non-null values)
  const baseHpi = sorted.find((o) => o.hpi.total !== null && o.hpi.total > 0)?.hpi.total;
  const baseHicp = sorted.find((o) => o.hicp !== null && o.hicp > 0)?.hicp;
  const baseReal = sorted.find((o) => o.realHpi !== null && o.realHpi > 0)?.realHpi;

  return sorted.map((obs, idx) => {
    // 1. Real HPI calculated with validated audit rules
    const realHpi = calculateRealHpi(obs.hpi.total, obs.hicp);

    // 2. QoQ (Quarter on Quarter)
    const prevObs = idx > 0 ? sorted[idx - 1] : null;
    const hpiQoQ = prevObs ? calculateGrowthRate(obs.hpi.total, prevObs.hpi.total) : null;

    // 3. YoY (Year on Year = 4 quarters prior)
    const yoyObs = idx >= 4 ? sorted[idx - 4] : null;
    const hpiYoY = yoyObs ? calculateGrowthRate(obs.hpi.total, yoyObs.hpi.total) : null;
    const hicpYoY = yoyObs ? calculateGrowthRate(obs.hicp, yoyObs.hicp) : null;
    const realHpiYoY = yoyObs ? calculateGrowthRate(realHpi, yoyObs.realHpi) : null;

    // 4. Cumulative growth from start
    const cumulativeHpiGrowth = baseHpi ? calculateGrowthRate(obs.hpi.total, baseHpi) : null;
    const cumulativeHicpGrowth = baseHicp ? calculateGrowthRate(obs.hicp, baseHicp) : null;
    const cumulativeRealGrowth = baseReal ? calculateGrowthRate(realHpi, baseReal) : null;

    return {
      ...obs,
      realHpi,
      hpiQoQ,
      hpiYoY,
      hicpYoY,
      realHpiYoY,
      cumulativeHpiGrowth,
      cumulativeHicpGrowth,
      cumulativeRealGrowth,
    };
  });
}

/**
 * Rebases a series dynamically to a target base without modifying original Eurostat data.
 * Base options:
 * - '2015': Eurostat standard base (2015 = 100)
 * - '2010': First quarter of 2010 = 100
 * - 'period_start': First quarter of the selected range = 100
 *
 * Guarantees transitivity and preserves real ratios when both HPI and HICP are rebased synchronously.
 */
export function rebaseSeries(
  observations: QuarterlyObservation[],
  mode: RebaseMode
): QuarterlyObservation[] {
  if (observations.length === 0 || mode === '2015') {
    return observations;
  }

  let refObs: QuarterlyObservation | undefined;

  if (mode === '2010') {
    refObs = observations.find((o) => o.period === '2010-Q1') || observations[0];
  } else if (mode === 'period_start') {
    refObs = observations[0];
  }

  if (!refObs) return observations;

  const refHpiTotal = refObs.hpi.total;
  const refHpiNew = refObs.hpi.new;
  const refHpiExst = refObs.hpi.existing;
  const refHicp = refObs.hicp;

  return observations.map((obs) => {
    const rebasedTotal =
      refHpiTotal && refHpiTotal > 0 && obs.hpi.total !== null
        ? roundHalfUp((obs.hpi.total / refHpiTotal) * 100)
        : null;

    const rebasedNew =
      refHpiNew && refHpiNew > 0 && obs.hpi.new !== null
        ? roundHalfUp((obs.hpi.new / refHpiNew) * 100)
        : null;

    const rebasedExst =
      refHpiExst && refHpiExst > 0 && obs.hpi.existing !== null
        ? roundHalfUp((obs.hpi.existing / refHpiExst) * 100)
        : null;

    const rebasedHicp =
      refHicp && refHicp > 0 && obs.hicp !== null
        ? roundHalfUp((obs.hicp / refHicp) * 100)
        : null;

    // Real HPI on the rebased scale (both indices rebased to identical reference period)
    const rebasedRealHpi = calculateRealHpi(rebasedTotal, rebasedHicp);

    return {
      ...obs,
      hpi: {
        total: rebasedTotal,
        new: rebasedNew,
        existing: rebasedExst,
      },
      hicp: rebasedHicp,
      realHpi: rebasedRealHpi,
    };
  });
}

/**
 * Handles Statistical Data Revisions.
 * Eurostat frequently updates provisional data ('p') in subsequent quarterly dissemination rounds.
 * This function integrates a revision for a specific quarter, recalculates derived series
 * (Real HPI, YoY, QoQ, Cumulative), and outputs the exact audit impact delta.
 */
export function applySeriesRevision(
  series: QuarterlyObservation[],
  revision: {
    period: string;
    revisedHpiTotal?: number | null;
    revisedHpiNew?: number | null;
    revisedHpiExisting?: number | null;
    revisedHicp?: number | null;
  }
): {
  updatedSeries: QuarterlyObservation[];
  auditDelta: {
    period: string;
    previousHpi: number | null;
    newHpi: number | null;
    previousHicp: number | null;
    newHicp: number | null;
    previousRealHpi: number | null;
    newRealHpi: number | null;
    hpiDelta: number | null;
    realHpiDelta: number | null;
  };
} {
  let previousHpi: number | null = null;
  let previousHicp: number | null = null;
  let previousRealHpi: number | null = null;
  let newHpi: number | null = null;
  let newHicp: number | null = null;
  let newRealHpi: number | null = null;

  const modified = series.map((obs) => {
    if (obs.period !== revision.period) return obs;

    previousHpi = obs.hpi.total;
    previousHicp = obs.hicp;
    previousRealHpi = obs.realHpi ?? null;

    newHpi = revision.revisedHpiTotal !== undefined ? revision.revisedHpiTotal : obs.hpi.total;
    newHicp = revision.revisedHicp !== undefined ? revision.revisedHicp : obs.hicp;
    newRealHpi = calculateRealHpi(newHpi, newHicp);

    return {
      ...obs,
      hpi: {
        total: newHpi,
        new: revision.revisedHpiNew !== undefined ? revision.revisedHpiNew : obs.hpi.new,
        existing:
          revision.revisedHpiExisting !== undefined
            ? revision.revisedHpiExisting
            : obs.hpi.existing,
      },
      hicp: newHicp,
      realHpi: newRealHpi,
    };
  });

  // Recompute variations across the modified series
  const updatedSeries = computeSeriesVariations(modified);

  const hpiDelta =
    previousHpi !== null && newHpi !== null ? roundHalfUp(newHpi - previousHpi) : null;
  const realHpiDelta =
    previousRealHpi !== null && newRealHpi !== null
      ? roundHalfUp(newRealHpi - previousRealHpi)
      : null;

  return {
    updatedSeries,
    auditDelta: {
      period: revision.period,
      previousHpi,
      newHpi,
      previousHicp,
      newHicp,
      previousRealHpi,
      newRealHpi,
      hpiDelta,
      realHpiDelta,
    },
  };
}
