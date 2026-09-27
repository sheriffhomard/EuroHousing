/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Eye,
  EyeOff,
  X,
  ArrowUp,
  ArrowDown,
  Percent,
  SlidersHorizontal,
} from 'lucide-react';
import { CountryTimeSeries } from '../../data/types';
import { calculateGrowthRate } from '../../services/calculations';
import { getCountryInfo } from '../../data/countries';

export type RankingCriterion = 'real_growth' | 'nominal_growth' | 'inflation' | 'spread' | 'latest_level';

interface CountryRankingSectionProps {
  seriesMap: Map<string, CountryTimeSeries>;
  startPeriod: string;
  endPeriod: string;
  hiddenCurves: Set<string>;
  highlightedCountry: string | null;
  countryColors: Record<string, string>;
  onToggleVisibility: (code: string) => void;
  onExcludeCountry: (code: string) => void;
  onMoveCurve: (code: string, direction: 'up' | 'down') => void;
  onHoverCountry: (code: string | null) => void;
}

interface RankedCountry {
  code: string;
  country: ReturnType<typeof getCountryInfo>;
  nominalGrowth: number | null;
  inflationGrowth: number | null;
  realGrowth: number | null;
  spread: number | null; // nominalGrowth - inflationGrowth (inflation impact)
  latestReal: number | null;
  latestNominal: number | null;
  firstPeriod: string;
  latestPeriod: string;
  color: string;
  isAggregate: boolean;
}

export const CountryRankingSection: React.FC<CountryRankingSectionProps> = ({
  seriesMap,
  startPeriod,
  endPeriod,
  hiddenCurves,
  highlightedCountry,
  countryColors,
  onToggleVisibility,
  onExcludeCountry,
  onMoveCurve,
  onHoverCountry,
}) => {
  const [criterion, setCriterion] = useState<RankingCriterion>('real_growth');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Compute stats for every country in seriesMap
  const rankedData = useMemo<RankedCountry[]>(() => {
    const list: RankedCountry[] = [];

    seriesMap.forEach((series, code) => {
      const obs = series.observations;
      if (obs.length === 0) return;

      const first = obs[0];
      const latest = obs[obs.length - 1];

      const nominalGrowth = calculateGrowthRate(latest?.hpi.total, first?.hpi.total);
      const inflationGrowth = calculateGrowthRate(latest?.hicp, first?.hicp);
      const realGrowth = calculateGrowthRate(latest?.realHpi, first?.realHpi);

      const spread =
        nominalGrowth !== null && inflationGrowth !== null
          ? nominalGrowth - inflationGrowth
          : null;

      list.push({
        code,
        country: series.country,
        nominalGrowth,
        inflationGrowth,
        realGrowth,
        spread,
        latestReal: latest?.realHpi ?? null,
        latestNominal: latest?.hpi.total ?? null,
        firstPeriod: first.period,
        latestPeriod: latest.period,
        color: countryColors[code] || '#3b82f6',
        isAggregate: !!series.country.isAggregate,
      });
    });

    // Sort according to criterion and direction
    list.sort((a, b) => {
      let valA: number = -Infinity;
      let valB: number = -Infinity;

      if (criterion === 'real_growth') {
        valA = a.realGrowth ?? -Infinity;
        valB = b.realGrowth ?? -Infinity;
      } else if (criterion === 'nominal_growth') {
        valA = a.nominalGrowth ?? -Infinity;
        valB = b.nominalGrowth ?? -Infinity;
      } else if (criterion === 'inflation') {
        valA = a.inflationGrowth ?? -Infinity;
        valB = b.inflationGrowth ?? -Infinity;
      } else if (criterion === 'spread') {
        valA = a.spread ?? -Infinity;
        valB = b.spread ?? -Infinity;
      } else if (criterion === 'latest_level') {
        valA = a.latestReal ?? -Infinity;
        valB = b.latestReal ?? -Infinity;
      }

      if (valA === valB) return 0;
      return sortDirection === 'desc' ? (valA < valB ? 1 : -1) : valA > valB ? 1 : -1;
    });

    return list;
  }, [seriesMap, criterion, sortDirection, countryColors]);

  // Find EU27 Benchmark if present
  const euBenchmark = useMemo(() => {
    return (
      rankedData.find((c) => c.code === 'EU27_2020') ||
      rankedData.find((c) => c.code === 'EA20')
    );
  }, [rankedData]);

  // Find max absolute value to scale visual bars
  const maxBarValue = useMemo(() => {
    let max = 10;
    rankedData.forEach((d) => {
      const v =
        criterion === 'real_growth'
          ? d.realGrowth
          : criterion === 'nominal_growth'
          ? d.nominalGrowth
          : criterion === 'inflation'
          ? d.inflationGrowth
          : d.spread;

      if (v !== null && !isNaN(v)) {
        if (Math.abs(v) > max) max = Math.abs(v);
      }
    });
    return max;
  }, [rankedData, criterion]);

  const renderDelta = (v: number | null) => {
    if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
    const isPos = v > 0;
    return (
      <span
        className={`font-semibold tabular-nums font-mono ${
          isPos ? 'text-emerald-600 dark:text-emerald-400' : v < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600'
        }`}
      >
        {isPos ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`}
      </span>
    );
  };

  const getPrimaryValue = (d: RankedCountry) => {
    if (criterion === 'real_growth') return d.realGrowth;
    if (criterion === 'nominal_growth') return d.nominalGrowth;
    if (criterion === 'inflation') return d.inflationGrowth;
    if (criterion === 'spread') return d.spread;
    return d.latestReal;
  };

  const topThree = rankedData.slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Classement des Marchés Immobiliers ({startPeriod} → {endPeriod})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Palmarès et hiérarchie des pays selon les variations calculées sur la période choisie.
          </p>
        </div>

        {/* Criterion Selector & Order */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setCriterion('real_growth')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                criterion === 'real_growth'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              HPI Réel (Pouvoir d'achat)
            </button>
            <button
              type="button"
              onClick={() => setCriterion('nominal_growth')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                criterion === 'nominal_growth'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              HPI Nominal (Brut)
            </button>
            <button
              type="button"
              onClick={() => setCriterion('inflation')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                criterion === 'inflation'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Inflation HICP
            </button>
            <button
              type="button"
              onClick={() => setCriterion('spread')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                criterion === 'spread'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Écart (Nominal - Inflation)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            title="Inverser le sens du classement"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {sortDirection === 'desc' ? 'Plus forte hausse' : 'Plus modéré / baisse'}
            </span>
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length >= 3 && sortDirection === 'desc' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topThree.map((item, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
            const medalTitle = idx === 0 ? '1er Rang' : idx === 1 ? '2e Rang' : '3e Rang';
            const primaryVal = getPrimaryValue(item);

            return (
              <div
                key={item.code}
                onMouseEnter={() => onHoverCountry(item.code)}
                onMouseLeave={() => onHoverCountry(null)}
                className={`p-3.5 rounded-xl border transition-all ${
                  idx === 0
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl" title={medalTitle}>
                    {medal}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    #{idx + 1}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg">{item.country.flag}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.country.nameFr}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">({item.code})</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Variation clé :</span>
                  <span className="text-sm font-bold">{renderDelta(primaryVal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Benchmark Reference Banner if EU-27 is present */}
      {euBenchmark && (
        <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🇪🇺</span>
            <span className="font-bold text-indigo-950 dark:text-indigo-200">
              Moyenne Union Européenne (UE-27) sur la période :
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono tabular-nums">
            <span>
              Nominal : <strong>{renderDelta(euBenchmark.nominalGrowth)}</strong>
            </span>
            <span className="text-indigo-300">|</span>
            <span>
              Inflation : <strong>{renderDelta(euBenchmark.inflationGrowth)}</strong>
            </span>
            <span className="text-indigo-300">|</span>
            <span>
              Réel : <strong className="text-blue-600 dark:text-blue-400">{renderDelta(euBenchmark.realGrowth)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Ranking Table with Visual Performance Bars */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">Rang</th>
              <th className="py-2.5 px-3">Pays</th>
              <th className="py-2.5 px-3">Performance visuelle ({criterion.replace('_', ' ')})</th>
              <th className="py-2.5 px-3 text-right">Variation Nominale</th>
              <th className="py-2.5 px-3 text-right">Inflation HICP</th>
              <th className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                Variation Réelle
              </th>
              {euBenchmark && <th className="py-2.5 px-3 text-right">vs Moyenne UE-27</th>}
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rankedData.map((d, index) => {
              const primaryVal = getPrimaryValue(d);
              const isHidden = hiddenCurves.has(d.code);
              const isHighlighted = highlightedCountry === d.code;
              const isEU = d.isAggregate;

              // Compare vs EU benchmark
              const diffVsEU =
                euBenchmark && primaryVal !== null && getPrimaryValue(euBenchmark) !== null
                  ? primaryVal - getPrimaryValue(euBenchmark)!
                  : null;

              // Bar width calculation
              const barPercent = primaryVal !== null ? Math.min(100, (Math.abs(primaryVal) / maxBarValue) * 100) : 0;
              const isPositive = (primaryVal ?? 0) >= 0;

              return (
                <tr
                  key={d.code}
                  onMouseEnter={() => onHoverCountry(d.code)}
                  onMouseLeave={() => onHoverCountry(null)}
                  className={`transition-colors ${
                    isHidden
                      ? 'opacity-40 bg-slate-50/40 dark:bg-slate-900/30'
                      : isHighlighted
                      ? 'bg-blue-50/80 dark:bg-blue-950/50'
                      : isEU
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/20 font-semibold'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                    {index === 0 && sortDirection === 'desc'
                      ? '🥇'
                      : index === 1 && sortDirection === 'desc'
                      ? '🥈'
                      : index === 2 && sortDirection === 'desc'
                      ? '🥉'
                      : `#${index + 1}`}
                  </td>

                  {/* Country Name & Flag */}
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-base">{d.country.flag}</span>
                    <span className="font-semibold">{d.country.nameFr}</span>
                    {isEU && (
                      <span className="text-[10px] px-1 py-0.2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-bold">
                        Agrégat UE
                      </span>
                    )}
                  </td>

                  {/* Visual Bar Gauge */}
                  <td className="py-2.5 px-3 w-56">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isPositive
                              ? 'bg-emerald-500 dark:bg-emerald-400'
                              : 'bg-rose-500 dark:bg-rose-400'
                          }`}
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-xs font-mono font-bold">
                        {renderDelta(primaryVal)}
                      </span>
                    </div>
                  </td>

                  {/* Nominal Growth */}
                  <td className="py-2.5 px-3 text-right">{renderDelta(d.nominalGrowth)}</td>

                  {/* Inflation Growth */}
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {renderDelta(d.inflationGrowth)}
                  </td>

                  {/* Real Growth */}
                  <td className="py-2.5 px-3 text-right font-bold font-mono">
                    {renderDelta(d.realGrowth)}
                  </td>

                  {/* vs EU Benchmark */}
                  {euBenchmark && (
                    <td className="py-2.5 px-3 text-right">
                      {isEU ? (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      ) : diffVsEU !== null ? (
                        <span
                          className={`font-mono text-xs font-semibold ${
                            diffVsEU > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : diffVsEU < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {diffVsEU > 0 ? `+${diffVsEU.toFixed(1)}%` : `${diffVsEU.toFixed(1)}%`}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  )}

                  {/* Actions (Visibility, Move, Exclude) */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleVisibility(d.code)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isHidden
                            ? 'text-slate-400 hover:text-slate-600'
                            : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                        }`}
                        title={isHidden ? 'Afficher la courbe' : 'Masquer la courbe'}
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onMoveCurve(d.code, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Monter d'un plan"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {seriesMap.size > 1 && (
                        <button
                          type="button"
                          onClick={() => onExcludeCountry(d.code)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={`Exclure ${d.country.nameFr}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
