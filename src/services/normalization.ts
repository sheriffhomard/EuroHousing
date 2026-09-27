/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractJsonStatValue, getDimensionCategories } from '../api/eurostat';
import { getCountryInfo } from '../data/countries';
import {
  CountryTimeSeries,
  JsonStatResponse,
  QuarterlyObservation,
} from '../data/types';
import { aggregateMonthlyToQuarterlyHicp } from './aggregation';
import { computeSeriesVariations } from './calculations';

/**
 * Normalizes raw Eurostat JSON-stat responses for a specific country
 * into a structured, unified quarterly time series.
 */
export function normalizeCountryData(
  geoCode: string,
  hpiDataset: JsonStatResponse | null,
  hicpDataset: JsonStatResponse | null
): CountryTimeSeries {
  const country = getCountryInfo(geoCode);

  // 1. Gather all quarterly periods from HPI and HICP
  const hpiPeriods = hpiDataset ? getDimensionCategories(hpiDataset, 'time').codes : [];
  
  // 2. Extract monthly HICP values and aggregate them to quarterly
  const monthlyHicpMap = new Map<string, number>();
  if (hicpDataset) {
    const hicpMonths = getDimensionCategories(hicpDataset, 'time').codes;
    for (const month of hicpMonths) {
      const val = extractJsonStatValue(hicpDataset, {
        geo: geoCode,
        time: month,
        coicop: 'CP00',
        unit: 'I15',
        freq: 'M',
      });
      if (val !== null) {
        monthlyHicpMap.set(month, val);
      }
    }
  }

  const quarterlyHicpMap = aggregateMonthlyToQuarterlyHicp(monthlyHicpMap);

  // Merge unique quarter periods, filtered to valid format YYYY-QX
  const allPeriodsSet = new Set<string>();
  for (const p of hpiPeriods) {
    if (/^\d{4}-Q[1-4]$/.test(p)) {
      allPeriodsSet.add(p);
    }
  }
  for (const p of quarterlyHicpMap.keys()) {
    if (/^\d{4}-Q[1-4]$/.test(p)) {
      allPeriodsSet.add(p);
    }
  }

  const sortedPeriods = Array.from(allPeriodsSet).sort();

  // Build raw observations
  const observations: QuarterlyObservation[] = [];

  for (const period of sortedPeriods) {
    const parts = period.split('-Q');
    const year = parseInt(parts[0], 10);
    const quarter = parseInt(parts[1], 10);

    // Extract HPI values
    let totalHpi: number | null = null;
    let newHpi: number | null = null;
    let existingHpi: number | null = null;

    if (hpiDataset) {
      totalHpi = extractJsonStatValue(hpiDataset, {
        geo: geoCode,
        time: period,
        purchase: 'TOTAL',
        unit: 'I15_Q',
        freq: 'Q',
      });

      newHpi = extractJsonStatValue(hpiDataset, {
        geo: geoCode,
        time: period,
        purchase: 'DW_NEW',
        unit: 'I15_Q',
        freq: 'Q',
      });

      existingHpi = extractJsonStatValue(hpiDataset, {
        geo: geoCode,
        time: period,
        purchase: 'DW_EXST',
        unit: 'I15_Q',
        freq: 'Q',
      });
    }

    const hicpVal = quarterlyHicpMap.get(period) ?? null;

    // Skip quarters where neither HPI nor HICP has data
    if (totalHpi === null && hicpVal === null) {
      continue;
    }

    observations.push({
      geo: geoCode,
      period,
      year,
      quarter,
      hpi: {
        total: totalHpi,
        new: newHpi,
        existing: existingHpi,
      },
      hicp: hicpVal,
      realHpi: null, // Will be computed in computeSeriesVariations
    });
  }

  // 3. Compute real HPI, YoY, QoQ, cumulative growth
  const enrichedObservations = computeSeriesVariations(observations);
  const latestObservation = enrichedObservations.length > 0 ? enrichedObservations[enrichedObservations.length - 1] : undefined;

  return {
    country,
    observations: enrichedObservations,
    latestObservation,
    updatedAt: new Date().toISOString(),
  };
}
