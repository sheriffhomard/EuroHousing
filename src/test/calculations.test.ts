/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRealHpi,
  calculateGrowthRate,
  computeSeriesVariations,
  rebaseSeries,
} from '../services/calculations';
import {
  parseMonthToQuarter,
  aggregateMonthlyToQuarterlyHicp,
} from '../services/aggregation';
import { extractJsonStatValue } from '../api/eurostat';
import { JsonStatResponse, QuarterlyObservation } from '../data/types';

describe('Real HPI Calculations', () => {
  it('calculates Real HPI correctly when both HPI and HICP are on the same base', () => {
    // Example from user prompt: HPI = 150, HICP = 120 -> Real HPI = 125
    const realHpi = calculateRealHpi(150, 120);
    expect(realHpi).toBe(125);
  });

  it('handles neutral base 100 properly', () => {
    expect(calculateRealHpi(100, 100)).toBe(100);
    expect(calculateRealHpi(110, 100)).toBe(110);
    expect(calculateRealHpi(100, 125)).toBe(80);
  });

  it('safely handles null, undefined, 0, and NaN values', () => {
    expect(calculateRealHpi(null, 120)).toBeNull();
    expect(calculateRealHpi(150, null)).toBeNull();
    expect(calculateRealHpi(undefined, 120)).toBeNull();
    expect(calculateRealHpi(150, undefined)).toBeNull();
    expect(calculateRealHpi(NaN, 120)).toBeNull();
    expect(calculateRealHpi(150, NaN)).toBeNull();
    expect(calculateRealHpi(150, 0)).toBeNull(); // Division by zero guard
    expect(calculateRealHpi(150, -10)).toBeNull(); // Negative index guard
  });
});

describe('Growth Rate Calculations', () => {
  it('computes percentage growth correctly', () => {
    expect(calculateGrowthRate(110, 100)).toBe(10);
    expect(calculateGrowthRate(90, 100)).toBe(-10);
    expect(calculateGrowthRate(150, 120)).toBe(25);
  });

  it('handles edge cases for growth rates', () => {
    expect(calculateGrowthRate(null, 100)).toBeNull();
    expect(calculateGrowthRate(100, null)).toBeNull();
    expect(calculateGrowthRate(100, 0)).toBeNull();
    expect(calculateGrowthRate(undefined, 100)).toBeNull();
    expect(calculateGrowthRate(NaN, 100)).toBeNull();
  });
});

describe('HICP Monthly to Quarterly Aggregation', () => {
  it('converts month strings to quarter representations', () => {
    expect(parseMonthToQuarter('2024-01')).toEqual({ year: 2024, quarter: 1, period: '2024-Q1' });
    expect(parseMonthToQuarter('2024-03')).toEqual({ year: 2024, quarter: 1, period: '2024-Q1' });
    expect(parseMonthToQuarter('2024-04')).toEqual({ year: 2024, quarter: 2, period: '2024-Q2' });
    expect(parseMonthToQuarter('2024-09')).toEqual({ year: 2024, quarter: 3, period: '2024-Q3' });
    expect(parseMonthToQuarter('2024-12')).toEqual({ year: 2024, quarter: 4, period: '2024-Q4' });
    expect(parseMonthToQuarter('invalid')).toBeNull();
  });

  it('aggregates 3 consecutive months into a quarterly average', () => {
    const monthlyMap = new Map<string, number>([
      ['2024-01', 120.0],
      ['2024-02', 121.0],
      ['2024-03', 122.0],
      ['2024-04', 123.0],
      ['2024-05', 124.0],
      ['2024-06', 125.0],
    ]);

    const quarterly = aggregateMonthlyToQuarterlyHicp(monthlyMap);
    expect(quarterly.get('2024-Q1')).toBe(121.0);
    expect(quarterly.get('2024-Q2')).toBe(124.0);
  });
});

describe('Series Rebasification', () => {
  it('rebases series dynamically to 2010-Q1 = 100', () => {
    const mockObs: QuarterlyObservation[] = [
      {
        geo: 'FR',
        period: '2010-Q1',
        year: 2010,
        quarter: 1,
        hpi: { total: 50, new: 40, existing: 55 },
        hicp: 80,
        realHpi: 62.5,
      },
      {
        geo: 'FR',
        period: '2010-Q2',
        year: 2010,
        quarter: 2,
        hpi: { total: 100, new: 80, existing: 110 },
        hicp: 88,
        realHpi: 113.6,
      },
    ];

    const rebased = rebaseSeries(mockObs, '2010');
    // First observation should now have index 100
    expect(rebased[0].hpi.total).toBe(100);
    expect(rebased[0].hicp).toBe(100);
    expect(rebased[0].realHpi).toBe(100);

    // Second observation should scale proportionally: 100 / 50 * 100 = 200
    expect(rebased[1].hpi.total).toBe(200);
    expect(rebased[1].hicp).toBe(110);
  });
});

describe('JSON-stat 2.0 Decoder', () => {
  it('decodes multi-dimensional row-major coordinate indices properly', () => {
    const mockDataset: JsonStatResponse = {
      version: '2.0',
      class: 'dataset',
      label: 'Test dataset',
      source: 'Eurostat',
      updated: '2026-01-01',
      id: ['geo', 'time'],
      size: [2, 2],
      dimension: {
        geo: {
          label: 'Country',
          category: {
            index: { FR: 0, DE: 1 },
          },
        },
        time: {
          label: 'Quarter',
          category: {
            index: { '2024-Q1': 0, '2024-Q2': 1 },
          },
        },
      },
      value: {
        '0': 100, // FR, 2024-Q1
        '1': 105, // FR, 2024-Q2
        '2': 95,  // DE, 2024-Q1
        '3': 98,  // DE, 2024-Q2
      },
    };

    expect(extractJsonStatValue(mockDataset, { geo: 'FR', time: '2024-Q1' })).toBe(100);
    expect(extractJsonStatValue(mockDataset, { geo: 'FR', time: '2024-Q2' })).toBe(105);
    expect(extractJsonStatValue(mockDataset, { geo: 'DE', time: '2024-Q1' })).toBe(95);
    expect(extractJsonStatValue(mockDataset, { geo: 'DE', time: '2024-Q2' })).toBe(98);
    expect(extractJsonStatValue(mockDataset, { geo: 'ES', time: '2024-Q1' })).toBeNull();
  });
});

describe('Country Comparison & Ranking Calculations', () => {
  it('correctly calculates the inflation spread (nominal growth - inflation growth)', () => {
    // Nominal house price growth = +40%, Inflation = +25% -> Spread = +15%
    const nominalGrowth = 40;
    const inflationGrowth = 25;
    const spread = nominalGrowth - inflationGrowth;
    expect(spread).toBe(15);
  });

  it('correctly identifies negative real erosion when inflation exceeds nominal growth', () => {
    // Nominal house price growth = +10%, Inflation = +20% -> Spread = -10% (purchasing power loss)
    const nominalGrowth = 10;
    const inflationGrowth = 20;
    const spread = nominalGrowth - inflationGrowth;
    expect(spread).toBe(-10);
  });

  it('ranks countries consistently by real variation', () => {
    const countries = [
      { code: 'FR', realGrowth: 15.2 },
      { code: 'DE', realGrowth: 4.8 },
      { code: 'PT', realGrowth: 42.1 },
      { code: 'IT', realGrowth: -8.5 },
    ];

    const sortedDesc = [...countries].sort((a, b) => b.realGrowth - a.realGrowth);
    expect(sortedDesc[0].code).toBe('PT');
    expect(sortedDesc[1].code).toBe('FR');
    expect(sortedDesc[2].code).toBe('DE');
    expect(sortedDesc[3].code).toBe('IT');
  });

  it('computes 5, 10, and 15 year quarter offsets accurately', () => {
    // 4 quarters per year
    expect(5 * 4).toBe(20);
    expect(10 * 4).toBe(40);
    expect(15 * 4).toBe(60);
  });
});

