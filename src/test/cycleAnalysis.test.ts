/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { analyzeCountryCycles, detectTurningPoints } from '../services/cycleAnalysis';
import { CountryInfo, QuarterlyObservation } from '../data/types';

describe('cycleAnalysis service', () => {
  const mockCountry: CountryInfo = {
    code: 'TEST',
    name: 'Testland',
    nameFr: 'Testland',
    flag: '🏳️',
  };

  // Synthetic series with a clear peak and trough
  // 2015-Q1 (100) -> 2017-Q1 (120, peak) -> 2019-Q1 (90, trough) -> 2021-Q1 (120, recovered) -> 2022-Q2 (135, ATH)
  const mockObservations: QuarterlyObservation[] = [
    { geo: 'TEST', period: '2015-Q1', year: 2015, quarter: 1, hpi: { total: 100, new: null, existing: null }, hicp: 100, realHpi: 100 },
    { geo: 'TEST', period: '2015-Q3', year: 2015, quarter: 3, hpi: { total: 105, new: null, existing: null }, hicp: 100, realHpi: 105 },
    { geo: 'TEST', period: '2016-Q1', year: 2016, quarter: 1, hpi: { total: 110, new: null, existing: null }, hicp: 100, realHpi: 110 },
    { geo: 'TEST', period: '2017-Q1', year: 2017, quarter: 1, hpi: { total: 120, new: null, existing: null }, hicp: 100, realHpi: 120 }, // Peak 1
    { geo: 'TEST', period: '2017-Q3', year: 2017, quarter: 3, hpi: { total: 112, new: null, existing: null }, hicp: 100, realHpi: 112 },
    { geo: 'TEST', period: '2018-Q1', year: 2018, quarter: 1, hpi: { total: 100, new: null, existing: null }, hicp: 100, realHpi: 100 },
    { geo: 'TEST', period: '2019-Q1', year: 2019, quarter: 1, hpi: { total: 90, new: null, existing: null }, hicp: 100, realHpi: 90 }, // Trough 1 (-25% drop)
    { geo: 'TEST', period: '2019-Q3', year: 2019, quarter: 3, hpi: { total: 98, new: null, existing: null }, hicp: 100, realHpi: 98 },
    { geo: 'TEST', period: '2020-Q1', year: 2020, quarter: 1, hpi: { total: 110, new: null, existing: null }, hicp: 100, realHpi: 110 },
    { geo: 'TEST', period: '2021-Q1', year: 2021, quarter: 1, hpi: { total: 122, new: null, existing: null }, hicp: 100, realHpi: 122 }, // Recovery
    { geo: 'TEST', period: '2022-Q2', year: 2022, quarter: 2, hpi: { total: 135, new: null, existing: null }, hicp: 100, realHpi: 135 }, // ATH Peak 2
    { geo: 'TEST', period: '2023-Q2', year: 2023, quarter: 2, hpi: { total: 125, new: null, existing: null }, hicp: 100, realHpi: 125 },
  ];

  it('detects cyclical turning points (peaks and troughs)', () => {
    const { peaks, troughs } = detectTurningPoints(mockObservations, 'nominal');
    expect(peaks.length).toBeGreaterThan(0);
    expect(peaks.some((p) => p.period === '2017-Q1')).toBe(true);
    expect(troughs.some((t) => t.period === '2019-Q1')).toBe(true);
  });

  it('calculates expansion, contraction, drawdown, and recovery duration', () => {
    const analysis = analyzeCountryCycles(mockCountry, mockObservations, 'nominal');

    expect(analysis.allTimeHighValue).toBe(135);
    expect(analysis.allTimeHighPeriod).toBe('2022-Q2');
    expect(analysis.historicalMaxDrawdownPercent).toBeLessThan(0);

    const firstCycle = analysis.cycles.find((c) => c.peakPeriod === '2017-Q1');
    expect(firstCycle).toBeDefined();
    if (firstCycle) {
      expect(firstCycle.isRecovered).toBe(true);
      expect(firstCycle.recoveryPeriod).toBe('2021-Q1');
      expect(firstCycle.maxDrawdownPercent).toBeCloseTo(-25, 0);
    }
  });
});
