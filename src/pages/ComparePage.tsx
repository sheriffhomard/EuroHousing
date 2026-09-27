/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Check, SlidersHorizontal } from 'lucide-react';
import { ComparisonChart } from '../components/Charts/ComparisonChart';
import { PeriodSlider } from '../components/PeriodSelector/PeriodSlider';
import { CountryTimeSeries, IndicatorMode, RebaseMode } from '../data/types';
import { EUROPEAN_COUNTRIES } from '../data/countries';
import { calculateGrowthRate } from '../services/calculations';

interface ComparePageProps {
  seriesMap: Map<string, CountryTimeSeries>;
  comparisonCountries: string[];
  onToggleCountry: (code: string) => void;
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
  const countries = Array.from(seriesMap.values());

  const renderDelta = (v: number | null) => {
    if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
    const isPos = v > 0;
    return (
      <span className={isPos ? 'text-emerald-600 font-semibold' : v < 0 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
        {isPos ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Country Selection Tags Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sélectionnez les pays à comparer
            </h3>
            <p className="text-xs text-slate-500">
              Cliquez pour activer ou désactiver un pays sur le graphique.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {comparisonCountries.length} pays sélectionnés
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {EUROPEAN_COUNTRIES.map((c) => {
            const isSelected = comparisonCountries.includes(c.code);
            return (
              <button
                key={c.code}
                onClick={() => onToggleCountry(c.code)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.nameFr}</span>
                {isSelected ? (
                  <Check className="w-3 h-3 text-blue-600" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period & Rebase Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <PeriodSlider
            availablePeriods={availablePeriods}
            startPeriod={startPeriod}
            endPeriod={endPeriod}
            onStartChange={onStartPeriodChange}
            onEndChange={onEndPeriodChange}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span>Base 100 de référence</span>
          </label>
          <select
            value={rebaseMode}
            onChange={(e) => onRebaseModeChange(e.target.value as RebaseMode)}
            className="w-full text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="2015">2015 = 100 (Eurostat)</option>
            <option value="2010">2010-Q1 = 100</option>
            <option value="period_start">Début période = 100</option>
          </select>
        </div>
      </div>

      {/* Multi-country Comparison Chart */}
      <ComparisonChart
        seriesMap={seriesMap}
        indicator={indicator}
        onIndicatorChange={onIndicatorChange}
        onRemoveCountry={onToggleCountry}
        onAddCountry={() => {}}
      />

      {/* Statistical Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs overflow-hidden">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tableau Comparatif Statistique ({startPeriod} → {endPeriod})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dernières valeurs observées et croissances cumulées sur la période choisie.
          </p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Pays</th>
                <th className="py-2.5 px-3 text-right">HPI Dernier</th>
                <th className="py-2.5 px-3 text-right">Inflation HICP</th>
                <th className="py-2.5 px-3 text-right">HPI Réel</th>
                <th className="py-2.5 px-3 text-right">Croissance HPI</th>
                <th className="py-2.5 px-3 text-right">Inflation Cumulée</th>
                <th className="py-2.5 px-3 text-right">Croissance Réelle</th>
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

                return (
                  <tr key={c.country.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{c.country.flag}</span>
                      <span>{c.country.nameFr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.country.code})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {latest?.hpi.total !== null ? latest?.hpi.total?.toFixed(1) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {latest?.hicp !== null ? latest?.hicp?.toFixed(1) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      {latest?.realHpi !== null ? latest?.realHpi?.toFixed(1) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {renderDelta(hpiGrowth)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {renderDelta(hicpGrowth)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {renderDelta(realGrowth)}
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
