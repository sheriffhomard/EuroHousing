/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Building, Layers } from 'lucide-react';
import { CountryTimeSeries } from '../../data/types';
import { calculateGrowthRate } from '../../services/calculations';

interface DwellingBreakdownProps {
  series: CountryTimeSeries;
}

export const DwellingBreakdown: React.FC<DwellingBreakdownProps> = ({ series }) => {
  const observations = series.observations;
  if (observations.length === 0) return null;

  const first = observations[0];
  const latest = observations[observations.length - 1];

  const totalGrowth = calculateGrowthRate(latest?.hpi.total, first?.hpi.total);
  const newGrowth = calculateGrowthRate(latest?.hpi.new, first?.hpi.new);
  const exstGrowth = calculateGrowthRate(latest?.hpi.existing, first?.hpi.existing);

  const hasNew = latest?.hpi.new !== null;
  const hasExst = latest?.hpi.existing !== null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-500" />
            <span>Segmentation : Logements Neufs vs Existants</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Divergence des dynamiques de prix selon le segment de marché immobilier.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Eurostat <code>prc_hpi_q</code> (DW_NEW / DW_EXST)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {/* Total */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Tous Logements (Total)</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {latest?.hpi.total !== null ? latest?.hpi.total?.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-slate-500">indice</span>
          </div>
          <div className="mt-2 text-xs font-mono">
            <span className="text-slate-500 text-[10px] block">Croissance période :</span>
            <span className={totalGrowth && totalGrowth > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
              {totalGrowth !== null ? (totalGrowth > 0 ? `+${totalGrowth}%` : `${totalGrowth}%`) : 'N/D'}
            </span>
          </div>
        </div>

        {/* New Dwellings */}
        <div className="p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Logements Neufs (DW_NEW)</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {hasNew ? latest?.hpi.new?.toFixed(1) : 'Non publié'}
            </span>
            {hasNew && <span className="text-xs text-slate-500">indice</span>}
          </div>
          <div className="mt-2 text-xs font-mono">
            <span className="text-slate-500 text-[10px] block">Croissance période :</span>
            <span className={newGrowth && newGrowth > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
              {newGrowth !== null ? (newGrowth > 0 ? `+${newGrowth}%` : `${newGrowth}%`) : 'N/D'}
            </span>
          </div>
        </div>

        {/* Existing Dwellings */}
        <div className="p-3.5 rounded-lg border border-teal-200 dark:border-teal-900/40 bg-teal-50/20 dark:bg-teal-950/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Building className="w-3.5 h-3.5 text-teal-600" />
            <span>Logements Existants (DW_EXST)</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {hasExst ? latest?.hpi.existing?.toFixed(1) : 'Non publié'}
            </span>
            {hasExst && <span className="text-xs text-slate-500">indice</span>}
          </div>
          <div className="mt-2 text-xs font-mono">
            <span className="text-slate-500 text-[10px] block">Croissance période :</span>
            <span className={exstGrowth && exstGrowth > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
              {exstGrowth !== null ? (exstGrowth > 0 ? `+${exstGrowth}%` : `${exstGrowth}%`) : 'N/D'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
