/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Home, ShoppingCart, Scale } from 'lucide-react';
import { CountryTimeSeries } from '../../data/types';
import { Tooltip } from '../Common/Tooltip';

interface StatCardsGridProps {
  series: CountryTimeSeries;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = ({ series }) => {
  const latest = series.latestObservation;
  const observations = series.observations;
  const first = observations.length > 0 ? observations[0] : undefined;

  const hpiVal = latest?.hpi.total ?? null;
  const hicpVal = latest?.hicp ?? null;
  const realVal = latest?.realHpi ?? null;

  // Cumulative growth over the currently displayed observations
  const hpiGrowth = first?.hpi.total && latest?.hpi.total
    ? Number((((latest.hpi.total - first.hpi.total) / first.hpi.total) * 100).toFixed(1))
    : null;

  const hicpGrowth = first?.hicp && latest?.hicp
    ? Number((((latest.hicp - first.hicp) / first.hicp) * 100).toFixed(1))
    : null;

  const realGrowth = first?.realHpi && latest?.realHpi
    ? Number((((latest.realHpi - first.realHpi) / first.realHpi) * 100).toFixed(1))
    : null;

  const periodLabel = first && latest ? `${first.period} → ${latest.period}` : '';

  const renderDelta = (val: number | null, suffix = '%') => {
    if (val === null || val === undefined) return <span className="text-slate-400">N/D</span>;
    const isPos = val > 0;
    const isZero = val === 0;

    return (
      <span
        className={`inline-flex items-center gap-0.5 font-mono text-xs font-semibold tabular-nums ${
          isPos
            ? 'text-emerald-700 dark:text-emerald-400'
            : isZero
            ? 'text-slate-500'
            : 'text-rose-700 dark:text-rose-400'
        }`}
      >
        {isPos ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : isZero ? (
          <Minus className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        <span>{isPos ? `+${val}${suffix}` : `${val}${suffix}`}</span>
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Nominal House Price Index */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Prix Immobiliers (HPI)</span>
            <Tooltip
              title="Indice des Prix des Logements"
              content="Mesure trimestrielle officielle Eurostat (prc_hpi_q) couvrant toutes les transactions de logements résidentiels neufs et anciens acquis par les ménages."
            />
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {latest?.period ?? '—'}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {hpiVal !== null ? hpiVal.toFixed(1) : '—'}
          </span>
          <span className="text-xs text-slate-500">indice</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Variation annuelle (YoY)</span>
            {renderDelta(latest?.hpiYoY ?? null)}
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">Sur la période ({periodLabel})</span>
            {renderDelta(hpiGrowth)}
          </div>
        </div>
      </div>

      {/* 2. Consumer Price Index (Inflation) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
            <span>Inflation (HICP)</span>
            <Tooltip
              title="Indice des Prix à la Consommation (IPCH / HICP)"
              content="Mesure officielle Eurostat de l'inflation d'ensemble (prc_hicp_midx, COICOP CP00). L'indice trimestriel est calculé comme la moyenne arithmétique des 3 mois civils du trimestre."
            />
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {latest?.period ?? '—'}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {hicpVal !== null ? hicpVal.toFixed(1) : '—'}
          </span>
          <span className="text-xs text-slate-500">indice</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Inflation annuelle (YoY)</span>
            {renderDelta(latest?.hicpYoY ?? null)}
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">Sur la période ({periodLabel})</span>
            {renderDelta(hicpGrowth)}
          </div>
        </div>
      </div>

      {/* 3. Real House Price Index (Inflation Adjusted) */}
      <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 rounded-xl p-4 sm:p-5 shadow-xs transition-all bg-gradient-to-br from-blue-50/20 to-transparent dark:from-blue-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>HPI Réel (Corrigé Inflation)</span>
            <Tooltip
              title="Indice Immobilier Réel"
              content="Calcul : (HPI nominal / HICP) × 100. Neutralise l'inflation pour mesurer la variation réelle de valeur patrimoniale. Une valeur > 100 signifie que l'immobilier a augmenté plus vite que le coût de la vie."
            />
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {latest?.period ?? '—'}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {realVal !== null ? realVal.toFixed(1) : '—'}
          </span>
          <span className="text-xs text-slate-500">indice réel</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Variation réelle (YoY)</span>
            {renderDelta(latest?.realHpiYoY ?? null)}
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">Sur la période ({periodLabel})</span>
            {renderDelta(realGrowth)}
          </div>
        </div>
      </div>
    </div>
  );
};
