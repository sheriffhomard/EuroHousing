/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Maps a month string (e.g. "2024-01" or "2024M01") to its year and quarter.
 * Returns { year: 2024, quarter: 1, period: "2024-Q1" } or null if invalid.
 */
export function parseMonthToQuarter(monthStr: string): { year: number; quarter: number; period: string } | null {
  const match = monthStr.match(/^(\d{4})[-M](\d{2})$/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  if (month < 1 || month > 12) return null;

  const quarter = Math.ceil(month / 3);
  return {
    year,
    quarter,
    period: `${year}-Q${quarter}`,
  };
}

/**
 * Aggregates monthly HICP indices into a quarterly index.
 * Methodology: Eurostat-consistent arithmetic average of the three consecutive
 * monthly consumer price indices comprising the quarter:
 * Q1 = mean(January, February, March)
 * Q2 = mean(April, May, June)
 * Q3 = mean(July, August, September)
 * Q4 = mean(October, November, December)
 *
 * @param monthlyValues Map of month string "YYYY-MM" to HICP index value
 * @param minMonthsRequired Minimum number of months required to compute quarter (default: 2)
 */
export function aggregateMonthlyToQuarterlyHicp(
  monthlyValues: Map<string, number>,
  minMonthsRequired = 2
): Map<string, number> {
  const quarterBuckets = new Map<string, number[]>();

  for (const [monthKey, val] of monthlyValues.entries()) {
    if (val === null || val === undefined || isNaN(val)) continue;

    const parsed = parseMonthToQuarter(monthKey);
    if (!parsed) continue;

    const currentList = quarterBuckets.get(parsed.period) || [];
    currentList.push(val);
    quarterBuckets.set(parsed.period, currentList);
  }

  const quarterlyHicp = new Map<string, number>();

  for (const [period, values] of quarterBuckets.entries()) {
    if (values.length >= minMonthsRequired) {
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / values.length;
      // Round to 2 decimal places for index reporting, keeping high precision
      quarterlyHicp.set(period, Number(avg.toFixed(3)));
    }
  }

  return quarterlyHicp;
}
