/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  SlidersHorizontal,
  Table as TableIcon,
  BarChart3,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { CountryMultiSelect } from '../components/Compare/CountryMultiSelect';
import { PeriodPresetsBar } from '../components/Compare/PeriodPresetsBar';
import { CurveOrderManager } from '../components/Compare/CurveOrderManager';
import { CountryRankingSection } from '../components/Compare/CountryRankingSection';
import {
  ComparisonChart,
  DEFAULT_COUNTRY_COLORS,
  ExtendedIndicatorMode,
} from '../components/Charts/ComparisonChart';
import { CountryTimeSeries, IndicatorMode, RebaseMode } from '../data/types';
import { calculateGrowthRate } from '../services/calculations';

interface ComparePageProps {
  seriesMap: Map<string, CountryTimeSeries>;
  comparisonCountries: string[];
  onToggleCountry: (code: string) => void;
  onSetCountries?: (codes: string[]) => void;
  startPeriod: string;
  endPeriod: string;
  availablePeriods: string[];
  onStartPeriodChange: (p: string) => void;
  onEndPeriodChange: (p: string) => void;
  indicator: IndicatorMode;
  onIndicatorChange: (ind: IndicatorMode) => void;
  rebaseMode: RebaseMode;
  onRebaseModeChange: (rm: RebaseMode) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  seriesMap,
  comparisonCountries,
  onToggleCountry,
  onSetCountries,
  startPeriod,
  endPeriod,
  availablePeriods,
  onStartPeriodChange,
  onEndPeriodChange,
  indicator,
  onIndicatorChange,
  rebaseMode,
  onRebaseModeChange,
}) => {
  // Local curve order tracking for stacking and foregrounding
  const [curveOrder, setCurveOrder] = useState<string[]>(comparisonCountries);
  const [hiddenCurves, setHiddenCurves] = useState<Set<string>>(new Set());
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);

  // Synchronize curveOrder when comparisonCountries changes
  useEffect(() => {
    setCurveOrder((prev) => {
      const currentSet = new Set(comparisonCountries);
      // Keep existing order for countries that are still present
      const filtered = prev.filter((c) => currentSet.has(c));
      // Append any newly added countries
      comparisonCountries.forEach((c) => {
        if (!filtered.includes(c)) filtered.push(c);
      });
      return filtered;
    });
  }, [comparisonCountries]);

  // Curve Order Management actions
  const handleMoveCurve = (code: string, direction: 'up' | 'down') => {
    setCurveOrder((prev) => {
      const idx = prev.indexOf(code);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleBringToFront = (code: string) => {
    setCurveOrder((prev) => {
      if (!prev.includes(code)) return prev;
      return [code, ...prev.filter((c) => c !== code)];
    });
  };

  const handleToggleCurveVisibility = (code: string) => {
    setHiddenCurves((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        // Prevent hiding all curves
        if (next.size >= comparisonCountries.length - 1) return prev;
        next.add(code);
      }
      return next;
    });
  };

  const handleResetOrder = () => {
    setCurveOrder([...comparisonCountries]);
    setHiddenCurves(new Set());
  };

  const handleSortCurvesByPerformance = () => {
    // Sort curves based on real growth descending
    const sorted = [...comparisonCountries].sort((a, b) => {
      const obsA = seriesMap.get(a)?.observations || [];
      const obsB = seriesMap.get(b)?.observations || [];
      const growthA =
        obsA.length >= 2
          ? calculateGrowthRate(obsA[obsA.length - 1].realHpi, obsA[0].realHpi) ?? -Infinity
          : -Infinity;
      const growthB =
        obsB.length >= 2
          ? calculateGrowthRate(obsB[obsB.length - 1].realHpi, obsB[0].realHpi) ?? -Infinity
          : -Infinity;
      return growthB - growthA;
    });
    setCurveOrder(sorted);
  };

  const countries = useMemo(() => {
    return curveOrder
      .map((code) => seriesMap.get(code))
      .filter((s): s is CountryTimeSeries => !!s);
  }, [curveOrder, seriesMap]);

  const renderDelta = (v: number | null) => {
    if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
    const isPos = v > 0;
    return (
      <span
        className={`font-semibold tabular-nums font-mono ${
          isPos
            ? 'text-emerald-600 dark:text-emerald-400'
            : v < 0
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-slate-600'
        }`}
      >
        {isPos ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`}
      </span>
    );
  };

  // CSV Export
  const exportCsv = () => {
    const headers = [
      'Code',
      'Pays',
      'Periode_Debut',
      'Periode_Fin',
      'HPI_Initial',
      'HPI_Final',
      'Variation_Nominale_%',
      'HICP_Initial',
      'HICP_Final',
      'Inflation_%',
      'HPI_Reel_Initial',
      'HPI_Reel_Final',
      'Variation_Reelle_%',
    ];

    const rows = countries.map((c) => {
      const obs = c.observations;
      const first = obs[0];
      const latest = obs[obs.length - 1];

      const hpiGrowth = calculateGrowthRate(latest?.hpi.total, first?.hpi.total);
      const hicpGrowth = calculateGrowthRate(latest?.hicp, first?.hicp);
      const realGrowth = calculateGrowthRate(latest?.realHpi, first?.realHpi);

      return [
        c.country.code,
        `"${c.country.nameFr}"`,
        first?.period || '',
        latest?.period || '',
        first?.hpi.total !== null ? first?.hpi.total?.toFixed(1) : '',
        latest?.hpi.total !== null ? latest?.hpi.total?.toFixed(1) : '',
        hpiGrowth !== null ? hpiGrowth.toFixed(2) : '',
        first?.hicp !== null ? first?.hicp?.toFixed(1) : '',
        latest?.hicp !== null ? latest?.hicp?.toFixed(1) : '',
        hicpGrowth !== null ? hicpGrowth.toFixed(2) : '',
        first?.realHpi !== null ? first?.realHpi?.toFixed(1) : '',
        latest?.realHpi !== null ? latest?.realHpi?.toFixed(1) : '',
        realGrowth !== null ? realGrowth.toFixed(2) : '',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eurostat-comparatif-${startPeriod}-${endPeriod}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Country & European Union Selection with Filter Chips */}
      <CountryMultiSelect
        selectedCountries={comparisonCountries}
        onToggleCountry={onToggleCountry}
        onSetCountries={
          onSetCountries
            ? onSetCountries
            : (codes) => {
                // Fallback toggle if onSetCountries not passed
                codes.forEach((c) => {
                  if (!comparisonCountries.includes(c)) onToggleCountry(c);
                });
              }
        }
      />

      {/* 2. Horizon temporel: 5, 10, 15 ans ou personnalisé & Base 100 */}
      <PeriodPresetsBar
        availablePeriods={availablePeriods}
        startPeriod={startPeriod}
        endPeriod={endPeriod}
        onStartChange={onStartPeriodChange}
        onEndChange={onEndPeriodChange}
        rebaseMode={rebaseMode}
        onRebaseModeChange={onRebaseModeChange}
      />

      {/* 3. Multi-country Comparison Chart with Nominal vs Real vs Inflation toggle */}
      <ComparisonChart
        seriesMap={seriesMap}
        indicator={indicator}
        onIndicatorChange={onIndicatorChange}
        onRemoveCountry={onToggleCountry}
        curveOrder={curveOrder}
        hiddenCurves={hiddenCurves}
        highlightedCountry={highlightedCountry}
        countryColors={DEFAULT_COUNTRY_COLORS}
        onMoveCurve={handleMoveCurve}
        onToggleCurveVisibility={handleToggleCurveVisibility}
        onHoverCountry={setHighlightedCountry}
      />

      {/* 4. Curve Order & Visibility Manager */}
      <CurveOrderManager
        seriesMap={seriesMap}
        curveOrder={curveOrder}
        hiddenCurves={hiddenCurves}
        highlightedCountry={highlightedCountry}
        countryColors={DEFAULT_COUNTRY_COLORS}
        onMoveCurve={handleMoveCurve}
        onBringToFront={handleBringToFront}
        onToggleVisibility={handleToggleCurveVisibility}
        onExcludeCountry={onToggleCountry}
        onHoverCountry={setHighlightedCountry}
        onResetOrder={handleResetOrder}
        onSortByPerformance={handleSortCurvesByPerformance}
      />

      {/* 5. Classement des pays selon la variation sur la période choisie */}
      <CountryRankingSection
        seriesMap={seriesMap}
        startPeriod={startPeriod}
        endPeriod={endPeriod}
        hiddenCurves={hiddenCurves}
        highlightedCountry={highlightedCountry}
        countryColors={DEFAULT_COUNTRY_COLORS}
        onToggleVisibility={handleToggleCurveVisibility}
        onExcludeCountry={onToggleCountry}
        onMoveCurve={handleMoveCurve}
        onHoverCountry={setHighlightedCountry}
      />

      {/* 6. Tableau Comparatif Statistique Détaillé */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Tableau de Synthèse Statistique ({startPeriod} → {endPeriod})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparaison exhaustive des indices de début/fin, taux de variation bruts et corrigés de l'inflation.
            </p>
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Pays</th>
                <th className="py-2.5 px-3 text-right">HPI Début</th>
                <th className="py-2.5 px-3 text-right">HPI Dernier</th>
                <th className="py-2.5 px-3 text-right">Croissance Nominale</th>
                <th className="py-2.5 px-3 text-right">Inflation Cumulée</th>
                <th className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                  Croissance Réelle
                </th>
                <th className="py-2.5 px-3 text-right">HPI Réel Actuel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
              {countries.map((c) => {
                const obs = c.observations;
                const first = obs[0];
                const latest = obs[obs.length - 1];

                const hpiGrowth = calculateGrowthRate(latest?.hpi.total, first?.hpi.total);
                const hicpGrowth = calculateGrowthRate(latest?.hicp, first?.hicp);
                const realGrowth = calculateGrowthRate(latest?.realHpi, first?.realHpi);
                const isHidden = hiddenCurves.has(c.country.code);
                const isHighlighted = highlightedCountry === c.country.code;
                const color = DEFAULT_COUNTRY_COLORS[c.country.code] || '#3b82f6';

                return (
                  <tr
                    key={c.country.code}
                    onMouseEnter={() => setHighlightedCountry(c.country.code)}
                    onMouseLeave={() => setHighlightedCountry(null)}
                    className={`transition-colors ${
                      isHidden
                        ? 'opacity-40'
                        : isHighlighted
                        ? 'bg-blue-50/80 dark:bg-blue-950/60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span>{c.country.flag}</span>
                      <span className="font-semibold">{c.country.nameFr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.country.code})</span>
                      {c.country.isAggregate && (
                        <span className="text-[10px] px-1 py-0.2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-bold">
                          UE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {first?.hpi.total !== null ? first?.hpi.total?.toFixed(1) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {latest?.hpi.total !== null ? latest?.hpi.total?.toFixed(1) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">{renderDelta(hpiGrowth)}</td>
                    <td className="py-2.5 px-3 text-right">{renderDelta(hicpGrowth)}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono">
                      {renderDelta(realGrowth)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      {latest?.realHpi !== null ? latest?.realHpi?.toFixed(1) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
