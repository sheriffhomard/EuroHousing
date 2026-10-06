/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Eurostat JSON-stat 2.0 Types
export interface JsonStatCategory {
  index: Record<string, number> | string[];
  label?: Record<string, string>;
  unit?: Record<string, { decimals: number; symbol?: string; position?: string }>;
}

export interface JsonStatDimension {
  label: string;
  category: JsonStatCategory;
  extension?: Record<string, unknown>;
}

export interface JsonStatResponse {
  version: string;
  class: string;
  label: string;
  source: string;
  updated: string;
  value: Record<string, number | null> | (number | null)[];
  status?: Record<string, string> | (string | null)[];
  id: string[];
  size: number[];
  dimension: Record<string, JsonStatDimension>;
  extension?: Record<string, unknown>;
}

export type DwellingType = 'TOTAL' | 'DW_NEW' | 'DW_EXST';

export interface CountryInfo {
  code: string;
  name: string;
  nameFr: string;
  flag: string;
  isAggregate?: boolean;
}

export interface HpiRecord {
  total: number | null;
  new: number | null;
  existing: number | null;
}

export interface QuarterlyObservation {
  geo: string;
  period: string; // e.g. "2024-Q1"
  year: number;
  quarter: number; // 1, 2, 3, 4
  hpi: HpiRecord;
  hicp: number | null; // quarterly aggregated HICP index (mean of M01, M02, M03)
  realHpi: number | null; // (hpi.total / hicp) * 100
  // Variations
  hpiQoQ?: number | null;
  hpiYoY?: number | null;
  hicpYoY?: number | null;
  realHpiYoY?: number | null;
  cumulativeHpiGrowth?: number | null;
  cumulativeHicpGrowth?: number | null;
  cumulativeRealGrowth?: number | null;
}

export interface CountryTimeSeries {
  country: CountryInfo;
  observations: QuarterlyObservation[];
  latestObservation?: QuarterlyObservation;
  updatedAt: string;
}

export type IndicatorMode =
  | 'hpi' // HPI nominal - Évolution des prix immobiliers
  | 'real_hpi' // HPI réel - Évolution des prix relativement à l'inflation générale
  | 'yoy' // Variation annuelle - Évolution sur les quatre derniers trimestres
  | 'cumulative' // Variation cumulée - Évolution depuis une date de référence
  | 'both' // Vue comparée HPI vs Inflation
  | 'hicp' // Inflation HICP seule
  | 'dwellings'; // Neufs vs Existants

export type RebaseMode = '2015' | '2010' | 'period_start';

export interface DataFilterOptions {
  selectedCountry: string;
  comparisonCountries: string[];
  startPeriod: string;
  endPeriod: string;
  dwellingType: DwellingType;
  indicator: IndicatorMode;
  rebaseMode: RebaseMode;
}

export interface EurostatFetchState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  lastUpdated: string | null;
  isOffline: boolean;
}

export type CalculationErrorCode =
  | 'MISSING_INPUT'
  | 'ZERO_DENOMINATOR'
  | 'NEGATIVE_INDEX'
  | 'PERIOD_MISMATCH'
  | 'BASE_MISMATCH'
  | 'NON_FINITE'
  | 'OUTLIER_WARNING';

export interface CalculationCheckItem {
  passed: boolean;
  details: string;
}

export interface CalculationAuditResult {
  value: number | null;
  isValid: boolean;
  errorCode?: CalculationErrorCode;
  message: string;
  stepByStep: {
    formula: string;
    substituted: string;
    rawResult: number | null;
    roundedResult: number | null;
    roundingRule: string;
  };
  checks: {
    periodCheck: CalculationCheckItem;
    baseCheck: CalculationCheckItem;
    denominatorCheck: CalculationCheckItem;
    numeratorCheck: CalculationCheckItem;
    finiteCheck: CalculationCheckItem;
  };
}
