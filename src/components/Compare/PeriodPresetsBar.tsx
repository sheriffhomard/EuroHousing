/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Calendar, Clock, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { RebaseMode } from '../../data/types';

interface PeriodPresetsBarProps {
  availablePeriods: string[];
  startPeriod: string;
  endPeriod: string;
  onStartChange: (period: string) => void;
  onEndChange: (period: string) => void;
  rebaseMode: RebaseMode;
  onRebaseModeChange: (rm: RebaseMode) => void;
}

export const PeriodPresetsBar: React.FC<PeriodPresetsBarProps> = ({
  availablePeriods,
  startPeriod,
  endPeriod,
  onStartChange,
  onEndChange,
  rebaseMode,
  onRebaseModeChange,
}) => {
  if (availablePeriods.length === 0) return null;

  const minPeriod = availablePeriods[0];
  const maxPeriod = availablePeriods[availablePeriods.length - 1];

  // Calculate quarter indices
  const maxIndex = availablePeriods.indexOf(maxPeriod);

  // Targets for 5y (20 quarters), 10y (40 quarters), 15y (60 quarters)
  const p5y = availablePeriods[Math.max(0, maxIndex - 20)];
  const p10y = availablePeriods[Math.max(0, maxIndex - 40)];
  const p15y = availablePeriods[Math.max(0, maxIndex - 60)];
  const pAll = minPeriod; // 2010-Q1

  // Detect active preset
  const activePreset = useMemo(() => {
    if (endPeriod === maxPeriod) {
      if (startPeriod === p5y) return '5y';
      if (startPeriod === p10y) return '10y';
      if (startPeriod === p15y) return '15y';
      if (startPeriod === pAll) return 'all';
    }
    return 'custom';
  }, [startPeriod, endPeriod, p5y, p10y, p15y, pAll, maxPeriod]);

  const handleApplyPreset = (preset: '5y' | '10y' | '15y' | 'all') => {
    onEndChange(maxPeriod);
    if (preset === '5y') onStartChange(p5y);
    else if (preset === '10y') onStartChange(p10y);
    else if (preset === '15y') onStartChange(p15y);
    else if (preset === 'all') onStartChange(pAll);
  };

  // Calculate duration in years and quarters
  const startIndex = availablePeriods.indexOf(startPeriod);
  const endIndex = availablePeriods.indexOf(endPeriod);
  const totalQuarters = startIndex !== -1 && endIndex !== -1 ? Math.max(1, endIndex - startIndex + 1) : 1;
  const yearsApprox = (totalQuarters / 4).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top row with presets buttons & summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Horizon temporel de comparaison
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {totalQuarters} trimestres (~{yearsApprox} ans)
          </span>
        </div>

        {/* 5, 10, 15 ans, Depuis 2010 buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyPreset('5y')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              activePreset === '5y'
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            5 ans ({p5y} → {maxPeriod})
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('10y')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              activePreset === '10y'
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            10 ans ({p10y} → {maxPeriod})
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('15y')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              activePreset === '15y'
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            15 ans ({p15y} → {maxPeriod})
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              activePreset === 'all'
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Depuis 2010 (Max)
          </button>

          <span
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              activePreset === 'custom'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {activePreset === 'custom' ? 'Période personnalisée' : 'Préréglage actif'}
          </span>
        </div>
      </div>

      {/* Range controls: Start, End, and Base 100 selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Trimestre Début
          </label>
          <select
            value={startPeriod}
            onChange={(e) => {
              const val = e.target.value;
              if (val <= endPeriod) onStartChange(val);
            }}
            className="w-full text-xs font-mono font-medium py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {availablePeriods.map((p) => (
              <option key={`start-${p}`} value={p} disabled={p > endPeriod}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Trimestre Fin
          </label>
          <select
            value={endPeriod}
            onChange={(e) => {
              const val = e.target.value;
              if (val >= startPeriod) onEndChange(val);
            }}
            className="w-full text-xs font-mono font-medium py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {availablePeriods.map((p) => (
              <option key={`end-${p}`} value={p} disabled={p < startPeriod}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span>Normalisation (Base 100)</span>
          </label>
          <select
            value={rebaseMode}
            onChange={(e) => onRebaseModeChange(e.target.value as RebaseMode)}
            className="w-full text-xs font-medium py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="period_start">Début de période ({startPeriod} = 100)</option>
            <option value="2015">2015 = 100 (Standard Eurostat)</option>
            <option value="2010">2010-Q1 = 100 (Origine série)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
