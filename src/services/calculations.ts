/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuarterlyObservation, RebaseMode } from '../data/types';

/**
 * Calculates Real HPI (House Price Index adjusted for consumer-price inflation).
 * Formula: Real HPI = (Nominal HPI / HICP) * 100
 * Ensures safety against division by zero, null, undefined, and NaN.
 */
export function calculateRealHpi(hpiNominal: number | null | undefined, hicp: number | null | undefined): number | null {
  if (
    hpiNominal === null ||
    hpiNominal === undefined ||
    hicp === null ||
    hicp === undefined ||
    isNaN(hpiNominal) ||
    isNaN(hicp) ||
    hicp <= 0
  ) {
    return null;
  }

  const realValue = (hpiNominal / hicp) * 100;
  if (!isFinite(realValue)) return null;

  return Number(realValue.toFixed(2));
}

/**
 * Computes growth percentage between two values: ((current - base) / base) * 100
 */
export function calculateGrowthRate(current: number | null | undefined, previous: number | null | undefined): number | null {
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

  return Number(rate.toFixed(2));
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
  const baseHpi = sorted.find((o) => o.hpi.total !== null)?.hpi.total;
  const baseHicp = sorted.find((o) => o.hicp !== null)?.hicp;
  const baseReal = sorted.find((o) => o.realHpi !== null)?.realHpi;

  return sorted.map((obs, idx) => {
    // 1. Real HPI
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
    const rebasedTotal = refHpiTotal && obs.hpi.total !== null ? Number(((obs.hpi.total / refHpiTotal) * 100).toFixed(2)) : null;
    const rebasedNew = refHpiNew && obs.hpi.new !== null ? Number(((obs.hpi.new / refHpiNew) * 100).toFixed(2)) : null;
    const rebasedExst = refHpiExst && obs.hpi.existing !== null ? Number(((obs.hpi.existing / refHpiExst) * 100).toFixed(2)) : null;
    const rebasedHicp = refHicp && obs.hicp !== null ? Number(((obs.hicp / refHicp) * 100).toFixed(2)) : null;

    // Real HPI on the rebased scale
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
