/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonStatResponse } from '../data/types';

export const EUROSTAT_BASE_URL = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

/**
 * Universal JSON-stat 2.0 value decoder
 * Computes the row-major linearized index for arbitrary multi-dimensional cubes.
 */
export function extractJsonStatValue(
  dataset: JsonStatResponse,
  coords: Record<string, string>
): number | null {
  if (!dataset || !dataset.id || !dataset.size || !dataset.dimension) {
    return null;
  }

  const { id, size, dimension, value } = dataset;
  if (!value) return null;

  let linearIndex = 0;
  let multiplier = 1;

  // Process dimensions in reverse order (row-major order)
  for (let m = id.length - 1; m >= 0; m--) {
    const dimName = id[m];
    const dim = dimension[dimName];
    if (!dim || !dim.category) return null;

    const requestedVal = coords[dimName];
    if (!requestedVal) {
      // If the coordinate is not specified and dimension size is 1, default to the only index 0
      if (size[m] === 1) {
        multiplier *= size[m];
        continue;
      }
      return null;
    }

    const catIndex = dim.category.index;
    let pos = -1;

    if (Array.isArray(catIndex)) {
      pos = catIndex.indexOf(requestedVal);
    } else if (catIndex && typeof catIndex === 'object' && requestedVal in catIndex) {
      pos = catIndex[requestedVal];
    }

    if (pos === -1 || pos === undefined) {
      return null;
    }

    linearIndex += pos * multiplier;
    multiplier *= size[m];
  }

  // Value may be stored as an object with string keys or an array
  let rawVal: number | null | undefined;
  if (Array.isArray(value)) {
    rawVal = value[linearIndex];
  } else {
    rawVal = value[String(linearIndex)];
  }

  if (rawVal === undefined || rawVal === null || isNaN(rawVal)) {
    return null;
  }

  return Number(rawVal);
}

/**
 * Extract all available categories for a dimension in a dataset
 */
export function getDimensionCategories(
  dataset: JsonStatResponse,
  dimName: string
): { codes: string[]; labels: Record<string, string> } {
  const dim = dataset?.dimension?.[dimName];
  if (!dim || !dim.category) {
    return { codes: [], labels: {} };
  }

  const catIndex = dim.category.index;
  let codes: string[] = [];

  if (Array.isArray(catIndex)) {
    codes = [...catIndex];
  } else if (catIndex && typeof catIndex === 'object') {
    codes = Object.keys(catIndex).sort((a, b) => (catIndex[a] ?? 0) - (catIndex[b] ?? 0));
  }

  const labels = dim.category.label || {};
  return { codes, labels };
}

/**
 * Fetch Eurostat dataset with timeout and error checking
 */
export async function fetchEurostatDataset(
  datasetCode: string,
  params: Record<string, string | string[]>,
  timeoutMs = 12000
): Promise<JsonStatResponse> {
  const url = new URL(`${EUROSTAT_BASE_URL}/${datasetCode}`);

  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        url.searchParams.append(key, item);
      }
    } else if (val) {
      url.searchParams.append(key, val);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Eurostat API error ${res.status}: ${res.statusText}`);
    }

    const data: JsonStatResponse = await res.json();
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
