/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Housing Market Cycle Analysis Service
 * Detects peaks, troughs, expansion/contraction durations, max drawdowns and recovery times.
 */

import { CountryInfo, QuarterlyObservation } from '../data/types';
import { calculateGrowthRate } from './calculations';

export type CycleMetric = 'real' | 'nominal';

export interface CyclePoint {
  period: string;
  year: number;
  quarter: number;
  value: number;
  type: 'peak' | 'trough';
  isAllTimeHigh?: boolean;
  label?: string;
}

export type MarketPhase = 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery';

export interface PhaseSegment {
  type: 'expansion' | 'contraction';
  startPeriod: string;
  endPeriod: string;
  startValue: number;
  endValue: number;
  durationQuarters: number;
  durationYears: number;
  amplitudePercent: number; // Positive for expansion, negative for contraction
  annualizedRatePercent: number;
}

export interface HistoricalCycle {
  id: string;
  // Starting point (trough before peak)
  priorTroughPeriod?: string;
  priorTroughValue?: number;
  
  // Peak (Sommet)
  peakPeriod: string;
  peakValue: number;
  isAllTimeHigh: boolean;
  
  // Expansion phase (from prior trough to peak)
  expansionDurationQuarters?: number;
  expansionDurationYears?: number;
  expansionAmplitudePercent?: number;

  // Trough (Creux / Point bas after peak)
  troughPeriod?: string;
  troughValue?: number;

  // Contraction phase (from peak to trough or current)
  contractionDurationQuarters: number;
  contractionDurationYears: number;
  maxDrawdownPercent: number; // Amplitude of the deepest drop from peak

  // Recovery (Retrouver le niveau du pic)
  recoveryPeriod?: string; // Period when price exceeded or matched peak
  recoveryDurationQuarters?: number; // Total quarters from peak to full recovery
  recoveryDurationYears?: number;
  isRecovered: boolean;
  currentRecoveryPercent?: number; // If not recovered, percentage of the drop recovered so far
  
  // Current status
  status: 'completed' | 'ongoing_contraction' | 'ongoing_recovery';
}

export interface CountryCycleAnalysis {
  country: CountryInfo;
  metric: CycleMetric;
  currentPeriod: string;
  currentValue: number;
  currentPhase: MarketPhase;
  currentPhaseDurationQuarters: number;
  
  // All-time statistics
  allTimeHighPeriod: string;
  allTimeHighValue: number;
  allTimeLowPeriod: string;
  allTimeLowValue: number;
  distanceFromATHPercent: number; // Current distance from all-time record (%)
  
  // Latest cycle in progress
  lastPeakPeriod: string;
  lastPeakValue: number;
  currentDrawdownFromLastPeakPercent: number;
  quartersSinceLastPeak: number;
  
  // Overall cycle metrics
  cycles: HistoricalCycle[];
  peaks: CyclePoint[];
  troughs: CyclePoint[];
  segments: PhaseSegment[];
  
  // Averages & aggregates
  averageExpansionDurationQuarters: number;
  averageContractionDurationQuarters: number;
  averageRecoveryDurationQuarters: number | null;
  historicalMaxDrawdownPercent: number;
  historicalMaxDrawdownPeriod: { peak: string; trough: string };
  totalCyclesCount: number;
  ratioExpansionToContractionDuration: number;
}

export interface SynchronizedPeakSeries {
  countryCode: string;
  countryName: string;
  flag: string;
  peakPeriod: string;
  relativeQuarters: {
    offset: number; // -8 to +16 (0 = peak)
    period?: string;
    normalizedValue: number; // 100 at peak
    drawdownPercent: number; // 0% at peak
  }[];
}

/**
 * Extracts numeric value from an observation according to selected metric.
 */
function getObsValue(obs: QuarterlyObservation, metric: CycleMetric): number | null {
  if (metric === 'real') {
    return obs.realHpi ?? null;
  }
  return obs.hpi.total ?? null;
}

/**
 * Detects peaks and troughs in a time series using economic cyclical rules:
 * - Minimum peak/trough prominence of 1.2%
 * - Alternating sequence of peaks and troughs
 * - Handles ongoing phases at the tail of the data
 */
export function detectTurningPoints(
  observations: QuarterlyObservation[],
  metric: CycleMetric = 'real'
): { peaks: CyclePoint[]; troughs: CyclePoint[] } {
  const valid = observations
    .map((obs) => ({
      period: obs.period,
      year: obs.year,
      quarter: obs.quarter,
      val: getObsValue(obs, metric),
    }))
    .filter((d): d is { period: string; year: number; quarter: number; val: number } => d.val !== null);

  if (valid.length < 5) {
    return { peaks: [], troughs: [] };
  }

  // 1. Identify local extrema using a 2-quarter window
  const rawPeaks: { index: number; period: string; year: number; quarter: number; value: number }[] = [];
  const rawTroughs: { index: number; period: string; year: number; quarter: number; value: number }[] = [];

  for (let i = 1; i < valid.length - 1; i++) {
    const prev = valid[i - 1].val;
    const curr = valid[i].val;
    const next = valid[i + 1].val;

    // Potential peak
    const isLocalMax =
      (curr >= prev && curr > next) ||
      (i >= 2 && curr >= valid[i - 2].val && curr >= prev && curr >= next && (i === valid.length - 2 || curr > valid[i + 2].val));

    // Potential trough
    const isLocalMin =
      (curr <= prev && curr < next) ||
      (i >= 2 && curr <= valid[i - 2].val && curr <= prev && curr <= next && (i === valid.length - 2 || curr < valid[i + 2].val));

    if (isLocalMax) {
      rawPeaks.push({ index: i, period: valid[i].period, year: valid[i].year, quarter: valid[i].quarter, value: curr });
    } else if (isLocalMin) {
      rawTroughs.push({ index: i, period: valid[i].period, year: valid[i].year, quarter: valid[i].quarter, value: curr });
    }
  }

  // 2. Filter and enforce alternation (Peak -> Trough -> Peak -> Trough)
  // Combine all candidate extrema chronologically
  type ExtremaCandidate = {
    index: number;
    period: string;
    year: number;
    quarter: number;
    value: number;
    type: 'peak' | 'trough';
  };

  const combined: ExtremaCandidate[] = [
    ...rawPeaks.map((p) => ({ ...p, type: 'peak' as const })),
    ...rawTroughs.map((t) => ({ ...t, type: 'trough' as const })),
  ].sort((a, b) => a.index - b.index);

  if (combined.length === 0) {
    return { peaks: [], troughs: [] };
  }

  // Deduplicate consecutive peaks (keep highest) and consecutive troughs (keep lowest)
  const alternating: ExtremaCandidate[] = [];

  for (const item of combined) {
    if (alternating.length === 0) {
      alternating.push(item);
      continue;
    }

    const last = alternating[alternating.length - 1];
    if (last.type === item.type) {
      // Keep superior peak or inferior trough
      if (item.type === 'peak' && item.value > last.value) {
        alternating[alternating.length - 1] = item;
      } else if (item.type === 'trough' && item.value < last.value) {
        alternating[alternating.length - 1] = item;
      }
    } else {
      // Must have minimum cyclical amplitude to filter out flat noise (< 1.2% variation)
      const diffPercent = Math.abs(calculateGrowthRate(item.value, last.value) ?? 0);
      if (diffPercent >= 1.2 || item.index - last.index >= 4) {
        alternating.push(item);
      }
    }
  }

  // Find all-time high
  let athVal = -Infinity;
  for (const v of valid) {
    if (v.val > athVal) athVal = v.val;
  }

  const peaks: CyclePoint[] = alternating
    .filter((a) => a.type === 'peak')
    .map((p) => ({
      period: p.period,
      year: p.year,
      quarter: p.quarter,
      value: p.value,
      type: 'peak',
      isAllTimeHigh: Math.abs(p.value - athVal) < 0.2,
      label: `Pic (${p.period})`,
    }));

  const troughs: CyclePoint[] = alternating
    .filter((a) => a.type === 'trough')
    .map((t) => ({
      period: t.period,
      year: t.year,
      quarter: t.quarter,
      value: t.value,
      type: 'trough',
      label: `Creux (${t.period})`,
    }));

  return { peaks, troughs };
}

/**
 * Builds full cycle diagnostic for a country's series.
 */
export function analyzeCountryCycles(
  country: CountryInfo,
  observations: QuarterlyObservation[],
  metric: CycleMetric = 'real'
): CountryCycleAnalysis {
  const valid = observations
    .map((obs) => ({
      period: obs.period,
      year: obs.year,
      quarter: obs.quarter,
      val: getObsValue(obs, metric),
    }))
    .filter((d): d is { period: string; year: number; quarter: number; val: number } => d.val !== null);

  const fallback: CountryCycleAnalysis = {
    country,
    metric,
    currentPeriod: observations[observations.length - 1]?.period || '2025-Q3',
    currentValue: 100,
    currentPhase: 'expansion',
    currentPhaseDurationQuarters: 1,
    allTimeHighPeriod: '2022-Q2',
    allTimeHighValue: 100,
    allTimeLowPeriod: '2015-Q1',
    allTimeLowValue: 100,
    distanceFromATHPercent: 0,
    lastPeakPeriod: '2022-Q2',
    lastPeakValue: 100,
    currentDrawdownFromLastPeakPercent: 0,
    quartersSinceLastPeak: 0,
    cycles: [],
    peaks: [],
    troughs: [],
    segments: [],
    averageExpansionDurationQuarters: 16,
    averageContractionDurationQuarters: 6,
    averageRecoveryDurationQuarters: 10,
    historicalMaxDrawdownPercent: 0,
    historicalMaxDrawdownPeriod: { peak: '2022-Q2', trough: '2024-Q1' },
    totalCyclesCount: 0,
    ratioExpansionToContractionDuration: 2.5,
  };

  if (valid.length < 5) {
    return fallback;
  }

  // 1. Extreme levels
  let ath = valid[0];
  let atl = valid[0];
  for (const d of valid) {
    if (d.val > ath.val) ath = d;
    if (d.val < atl.val) atl = d;
  }

  const latest = valid[valid.length - 1];
  const distanceFromATH = calculateGrowthRate(latest.val, ath.val) ?? 0;

  // 2. Turning points
  const { peaks, troughs } = detectTurningPoints(observations, metric);

  // If no peaks found (e.g. uninterrupted boom or flat), add synthetic ATH peak if it differs from latest
  let allPeaks = [...peaks];
  let allTroughs = [...troughs];

  if (allPeaks.length === 0) {
    allPeaks.push({
      period: ath.period,
      year: ath.year,
      quarter: ath.quarter,
      value: ath.val,
      type: 'peak',
      isAllTimeHigh: true,
      label: `Pic historique (${ath.period})`,
    });
  }

  // Ensure chronological sort
  allPeaks.sort((a, b) => a.period.localeCompare(b.period));
  allTroughs.sort((a, b) => a.period.localeCompare(b.period));

  // 3. Build Historical Cycles for each peak
  const cycles: HistoricalCycle[] = [];
  const segments: PhaseSegment[] = [];

  for (let i = 0; i < allPeaks.length; i++) {
    const peak = allPeaks[i];
    const peakIndexInValid = valid.findIndex((v) => v.period === peak.period);

    // Find preceding trough
    const priorTrough = allTroughs.filter((t) => t.period < peak.period).pop();
    let priorTroughPeriod = priorTrough?.period;
    let priorTroughValue = priorTrough?.value;
    let expansionQuarters = 0;
    let expansionAmplitude = 0;

    if (priorTrough) {
      const priorTroughIdx = valid.findIndex((v) => v.period === priorTrough.period);
      if (priorTroughIdx !== -1 && peakIndexInValid !== -1) {
        expansionQuarters = peakIndexInValid - priorTroughIdx;
        expansionAmplitude = calculateGrowthRate(peak.value, priorTrough.value) ?? 0;

        segments.push({
          type: 'expansion',
          startPeriod: priorTrough.period,
          endPeriod: peak.period,
          startValue: priorTrough.value,
          endValue: peak.value,
          durationQuarters: expansionQuarters,
          durationYears: Number((expansionQuarters / 4).toFixed(1)),
          amplitudePercent: expansionAmplitude,
          annualizedRatePercent: Number(
            ((Math.pow(1 + expansionAmplitude / 100, 4 / Math.max(1, expansionQuarters)) - 1) * 100).toFixed(1)
          ),
        });
      }
    } else if (peakIndexInValid > 0) {
      // From beginning of series to peak
      priorTroughPeriod = valid[0].period;
      priorTroughValue = valid[0].val;
      expansionQuarters = peakIndexInValid;
      expansionAmplitude = calculateGrowthRate(peak.value, valid[0].val) ?? 0;
    }

    // Find succeeding trough (point bas after peak)
    const nextTrough = allTroughs.find((t) => t.period > peak.period);
    const nextPeak = allPeaks.find((p) => p.period > peak.period);

    let troughPeriod: string | undefined;
    let troughValue: number | undefined;
    let contractionQuarters = 0;
    let maxDrawdown = 0;

    // Search through observations between this peak and either the next peak or end of series
    const searchEndPeriod = nextPeak ? nextPeak.period : valid[valid.length - 1].period;
    const postPeakObs = valid.filter((v) => v.period > peak.period && v.period <= searchEndPeriod);

    if (postPeakObs.length > 0) {
      let lowestObs = postPeakObs[0];
      for (const obs of postPeakObs) {
        if (obs.val < lowestObs.val) {
          lowestObs = obs;
        }
      }
      troughPeriod = lowestObs.period;
      troughValue = lowestObs.val;

      const troughIdxInValid = valid.findIndex((v) => v.period === lowestObs.period);
      contractionQuarters = Math.max(1, troughIdxInValid - peakIndexInValid);
      maxDrawdown = calculateGrowthRate(lowestObs.val, peak.value) ?? 0;

      segments.push({
        type: 'contraction',
        startPeriod: peak.period,
        endPeriod: lowestObs.period,
        startValue: peak.value,
        endValue: lowestObs.val,
        durationQuarters: contractionQuarters,
        durationYears: Number((contractionQuarters / 4).toFixed(1)),
        amplitudePercent: maxDrawdown,
        annualizedRatePercent: Number(
          ((Math.pow(1 + maxDrawdown / 100, 4 / Math.max(1, contractionQuarters)) - 1) * 100).toFixed(1)
        ),
      });
    }

    // Check Recovery: Did prices ever exceed the peak afterwards?
    const recoveryObs = valid.find((v) => v.period > peak.period && v.val >= peak.value);
    let isRecovered = false;
    let recoveryPeriod: string | undefined;
    let recoveryDurationQuarters: number | undefined;
    let currentRecoveryPercent: number | undefined;

    if (recoveryObs) {
      isRecovered = true;
      recoveryPeriod = recoveryObs.period;
      const recIdx = valid.findIndex((v) => v.period === recoveryObs.period);
      recoveryDurationQuarters = recIdx - peakIndexInValid;
    } else {
      // Not yet recovered
      isRecovered = false;
      if (troughValue !== undefined && Math.abs(maxDrawdown) > 0.1) {
        const dropAmount = peak.value - troughValue;
        const reboundAmount = Math.max(0, latest.val - troughValue);
        currentRecoveryPercent = Number(Math.min(99.9, (reboundAmount / Math.max(0.01, dropAmount)) * 100).toFixed(1));
      }
    }

    // Determine cycle status
    let status: HistoricalCycle['status'] = 'completed';
    if (i === allPeaks.length - 1) {
      if (!isRecovered) {
        if (troughPeriod && latest.period > troughPeriod && latest.val > troughValue!) {
          status = 'ongoing_recovery';
        } else {
          status = 'ongoing_contraction';
        }
      }
    }

    cycles.push({
      id: `cycle-${peak.period}`,
      priorTroughPeriod,
      priorTroughValue,
      peakPeriod: peak.period,
      peakValue: peak.value,
      isAllTimeHigh: peak.isAllTimeHigh || false,
      expansionDurationQuarters: expansionQuarters > 0 ? expansionQuarters : undefined,
      expansionDurationYears: expansionQuarters > 0 ? Number((expansionQuarters / 4).toFixed(1)) : undefined,
      expansionAmplitudePercent: expansionQuarters > 0 ? Number(expansionAmplitude.toFixed(1)) : undefined,
      troughPeriod,
      troughValue,
      contractionDurationQuarters: contractionQuarters,
      contractionDurationYears: Number((contractionQuarters / 4).toFixed(1)),
      maxDrawdownPercent: Number(maxDrawdown.toFixed(1)),
      recoveryPeriod,
      recoveryDurationQuarters,
      recoveryDurationYears: recoveryDurationQuarters ? Number((recoveryDurationQuarters / 4).toFixed(1)) : undefined,
      isRecovered,
      currentRecoveryPercent,
      status,
    });
  }

  // 4. Determine Current Market Phase
  const lastPeak = allPeaks[allPeaks.length - 1];
  const lastPeakIdx = valid.findIndex((v) => v.period === lastPeak.period);
  const quartersSinceLastPeak = Math.max(0, valid.length - 1 - lastPeakIdx);
  const currentDrawdown = calculateGrowthRate(latest.val, lastPeak.value) ?? 0;

  let currentPhase: MarketPhase = 'expansion';
  let currentPhaseDuration = 1;

  if (quartersSinceLastPeak === 0) {
    currentPhase = 'peak';
    currentPhaseDuration = 1;
  } else if (currentDrawdown < -0.5) {
    // We are below the peak
    const lastCycle = cycles[cycles.length - 1];
    if (lastCycle?.troughPeriod && latest.period > lastCycle.troughPeriod && latest.val > (lastCycle.troughValue ?? 0)) {
      currentPhase = 'recovery';
      const troughIdx = valid.findIndex((v) => v.period === lastCycle.troughPeriod);
      currentPhaseDuration = Math.max(1, valid.length - 1 - troughIdx);
    } else {
      currentPhase = 'contraction';
      currentPhaseDuration = quartersSinceLastPeak;
    }
  } else {
    // Current price is at or above last peak
    currentPhase = 'expansion';
    const lastTrough = allTroughs[allTroughs.length - 1];
    if (lastTrough) {
      const troughIdx = valid.findIndex((v) => v.period === lastTrough.period);
      currentPhaseDuration = Math.max(1, valid.length - 1 - troughIdx);
    } else {
      currentPhaseDuration = quartersSinceLastPeak;
    }
  }

  // 5. Averages & Aggregate Statistics
  const expansionDurations = cycles
    .map((c) => c.expansionDurationQuarters)
    .filter((d): d is number => d !== undefined && d > 0);
  const avgExpansion = expansionDurations.length > 0
    ? Number((expansionDurations.reduce((a, b) => a + b, 0) / expansionDurations.length).toFixed(1))
    : 16;

  const contractionDurations = cycles
    .map((c) => c.contractionDurationQuarters)
    .filter((d) => d > 0);
  const avgContraction = contractionDurations.length > 0
    ? Number((contractionDurations.reduce((a, b) => a + b, 0) / contractionDurations.length).toFixed(1))
    : 6;

  const recoveryDurations = cycles
    .map((c) => c.recoveryDurationQuarters)
    .filter((d): d is number => d !== undefined && d > 0);
  const avgRecovery = recoveryDurations.length > 0
    ? Number((recoveryDurations.reduce((a, b) => a + b, 0) / recoveryDurations.length).toFixed(1))
    : null;

  // Find deepest historical drawdown
  let deepestDrop = 0;
  let deepestDropPeriod = { peak: lastPeak.period, trough: latest.period };
  for (const c of cycles) {
    if (c.maxDrawdownPercent < deepestDrop) {
      deepestDrop = c.maxDrawdownPercent;
      deepestDropPeriod = { peak: c.peakPeriod, trough: c.troughPeriod || latest.period };
    }
  }

  return {
    country,
    metric,
    currentPeriod: latest.period,
    currentValue: latest.val,
    currentPhase,
    currentPhaseDurationQuarters: currentPhaseDuration,
    allTimeHighPeriod: ath.period,
    allTimeHighValue: ath.val,
    allTimeLowPeriod: atl.period,
    allTimeLowValue: atl.val,
    distanceFromATHPercent: Number(distanceFromATH.toFixed(1)),
    lastPeakPeriod: lastPeak.period,
    lastPeakValue: lastPeak.value,
    currentDrawdownFromLastPeakPercent: Number(currentDrawdown.toFixed(1)),
    quartersSinceLastPeak,
    cycles,
    peaks: allPeaks,
    troughs: allTroughs,
    segments,
    averageExpansionDurationQuarters: avgExpansion,
    averageContractionDurationQuarters: avgContraction,
    averageRecoveryDurationQuarters: avgRecovery,
    historicalMaxDrawdownPercent: deepestDrop,
    historicalMaxDrawdownPeriod: deepestDropPeriod,
    totalCyclesCount: cycles.length,
    ratioExpansionToContractionDuration: Number((avgExpansion / Math.max(1, avgContraction)).toFixed(1)),
  };
}

/**
 * Computes synchronized peak series (T=0 at each country's cyclical peak)
 * Allows cross-country overlay comparing drawdown severity and recovery speeds.
 */
export function buildSynchronizedPeakSeries(
  countriesData: { country: CountryInfo; observations: QuarterlyObservation[] }[],
  metric: CycleMetric = 'real',
  targetPeakEra: 'recent_2022' | 'all_time_high' = 'recent_2022'
): SynchronizedPeakSeries[] {
  return countriesData.map(({ country, observations }) => {
    const analysis = analyzeCountryCycles(country, observations, metric);

    // Choose target peak: either the latest major peak (2021-2023 ECB tightening cycle) or all-time high
    let peakPeriod = analysis.lastPeakPeriod;
    if (targetPeakEra === 'all_time_high') {
      peakPeriod = analysis.allTimeHighPeriod;
    }

    const valid = observations
      .map((obs) => ({
        period: obs.period,
        val: getObsValue(obs, metric),
      }))
      .filter((d): d is { period: string; val: number } => d.val !== null);

    const peakIdx = valid.findIndex((v) => v.period === peakPeriod);
    const peakVal = peakIdx !== -1 ? valid[peakIdx].val : 100;

    // Window: T-8 to T+16
    const relativeQuarters: SynchronizedPeakSeries['relativeQuarters'] = [];

    for (let offset = -8; offset <= 16; offset++) {
      const targetIdx = peakIdx + offset;
      if (targetIdx >= 0 && targetIdx < valid.length) {
        const item = valid[targetIdx];
        const normalizedValue = Number(((item.val / peakVal) * 100).toFixed(2));
        const drawdownPercent = Number((normalizedValue - 100).toFixed(2));
        relativeQuarters.push({
          offset,
          period: item.period,
          normalizedValue,
          drawdownPercent,
        });
      } else {
        // Out of available observations
        relativeQuarters.push({
          offset,
          normalizedValue: offset === 0 ? 100 : (offset < 0 ? 95 : 100),
          drawdownPercent: 0,
        });
      }
    }

    return {
      countryCode: country.code,
      countryName: country.nameFr,
      flag: country.flag,
      peakPeriod,
      relativeQuarters,
    };
  });
}
