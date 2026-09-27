/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar } from 'lucide-react';

interface PeriodSliderProps {
  availablePeriods: string[];
  startPeriod: string;
  endPeriod: string;
  onStartChange: (period: string) => void;
  onEndChange: (period: string) => void;
}

export const PeriodSlider: React.FC<PeriodSliderProps> = ({
  availablePeriods,
  startPeriod,
  endPeriod,
  onStartChange,
  onEndChange,
}) => {
  if (availablePeriods.length === 0) return null;

  const minPeriod = availablePeriods[0];
  const maxPeriod = availablePeriods[availablePeriods.length - 1];

  const handlePreset = (type: 'all' | '5y' | '10y' | 'covid') => {
    if (type === 'all') {
      onStartChange('2010-Q1');
      onEndChange(maxPeriod);
    } else if (type === 'covid') {
      onStartChange('2020-Q1');
      onEndChange(maxPeriod);
    } else if (type === '5y') {
      const idx = Math.max(0, availablePeriods.length - 20);
      onStartChange(availablePeriods[idx]);
      onEndChange(maxPeriod);
    } else if (type === '10y') {
      const idx = Math.max(0, availablePeriods.length - 40);
      onStartChange(availablePeriods[idx]);
      onEndChange(maxPeriod);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>Période d'analyse</span>
        </label>

        {/* Quick Presets */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePreset('all')}
            className={`px-2 py-0.5 text-[11px] rounded-md transition-colors cursor-pointer ${
              startPeriod === '2010-Q1' && endPeriod === maxPeriod
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            2010 → Actuel
          </button>
          <button
            type="button"
            onClick={() => handlePreset('covid')}
            className={`px-2 py-0.5 text-[11px] rounded-md transition-colors cursor-pointer ${
              startPeriod === '2020-Q1'
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Post-Covid
          </button>
          <button
            type="button"
            onClick={() => handlePreset('5y')}
            className="px-2 py-0.5 text-[11px] rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            5 ans
          </button>
          <button
            type="button"
            onClick={() => handlePreset('10y')}
            className="px-2 py-0.5 text-[11px] rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            10 ans
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="block text-[10px] text-slate-500 mb-0.5">Début</span>
          <select
            value={startPeriod}
            onChange={(e) => {
              const val = e.target.value;
              if (val <= endPeriod) onStartChange(val);
            }}
            className="w-full text-xs font-mono py-1.5 px-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
          >
            {availablePeriods.map((p) => (
              <option key={`start-${p}`} value={p} disabled={p > endPeriod}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-[10px] text-slate-500 mb-0.5">Fin</span>
          <select
            value={endPeriod}
            onChange={(e) => {
              const val = e.target.value;
              if (val >= startPeriod) onEndChange(val);
            }}
            className="w-full text-xs font-mono py-1.5 px-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
          >
            {availablePeriods.map((p) => (
              <option key={`end-${p}`} value={p} disabled={p < startPeriod}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
