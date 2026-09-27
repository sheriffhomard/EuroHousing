/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  X,
  Layers,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { CountryTimeSeries } from '../../data/types';
import { getCountryInfo } from '../../data/countries';

interface CurveOrderManagerProps {
  seriesMap: Map<string, CountryTimeSeries>;
  curveOrder: string[];
  hiddenCurves: Set<string>;
  highlightedCountry: string | null;
  countryColors: Record<string, string>;
  onMoveCurve: (code: string, direction: 'up' | 'down') => void;
  onBringToFront: (code: string) => void;
  onToggleVisibility: (code: string) => void;
  onExcludeCountry: (code: string) => void;
  onHoverCountry: (code: string | null) => void;
  onResetOrder: () => void;
  onSortByPerformance?: () => void;
}

export const CurveOrderManager: React.FC<CurveOrderManagerProps> = ({
  seriesMap,
  curveOrder,
  hiddenCurves,
  highlightedCountry,
  countryColors,
  onMoveCurve,
  onBringToFront,
  onToggleVisibility,
  onExcludeCountry,
  onHoverCountry,
  onResetOrder,
  onSortByPerformance,
}) => {
  if (curveOrder.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Gestion de l'ordre des courbes & Visibilité</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Les courbes situées en haut de la liste sont dessinées au premier plan sur le graphique. Vous pouvez les réordonner, masquer temporairement ou exclure un pays.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onSortByPerformance && (
            <button
              type="button"
              onClick={onSortByPerformance}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-md transition-colors cursor-pointer"
              title="Classer les courbes par performance décroissante"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Trier par perf</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetOrder}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Réinitialiser l'ordre des courbes"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Ordre initial</span>
          </button>
        </div>
      </div>

      {/* Ordered list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
        {curveOrder.map((code, index) => {
          const series = seriesMap.get(code);
          const country = series?.country || getCountryInfo(code);
          const isHidden = hiddenCurves.has(code);
          const isHighlighted = highlightedCountry === code;
          const color = countryColors[code] || '#3b82f6';
          const isFirst = index === 0;
          const isLast = index === curveOrder.length - 1;

          return (
            <div
              key={code}
              onMouseEnter={() => onHoverCountry(code)}
              onMouseLeave={() => onHoverCountry(null)}
              className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-all text-xs ${
                isHidden
                  ? 'opacity-50 bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                  : isHighlighted
                  ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 shadow-xs ring-1 ring-blue-400/40'
                  : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Country indicator */}
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: color }}
                />
                <span className="text-base shrink-0">{country.flag}</span>
                <span className="font-semibold truncate text-slate-800 dark:text-slate-200">
                  {country.nameFr}
                </span>
                {country.isAggregate && (
                  <span className="text-[10px] font-bold px-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    UE
                  </span>
                )}
              </div>

              {/* Action buttons: Move up, down, front, visibility, remove */}
              <div className="flex items-center gap-0.5 shrink-0">
                {/* Bring to front (top) */}
                {!isFirst && (
                  <button
                    type="button"
                    onClick={() => onBringToFront(code)}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Placer au premier plan (devant toutes les autres)"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => onMoveCurve(code, 'up')}
                  disabled={isFirst}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Monter d'un niveau (plan supérieur)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => onMoveCurve(code, 'down')}
                  disabled={isLast}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Descendre d'un niveau (plan inférieur)"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Eye Visibility */}
                <button
                  type="button"
                  onClick={() => onToggleVisibility(code)}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isHidden
                      ? 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                  }`}
                  title={isHidden ? 'Afficher la courbe' : 'Masquer temporairement la courbe'}
                >
                  {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>

                {/* Exclude Country */}
                {curveOrder.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onExcludeCountry(code)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                    title={`Exclure ${country.nameFr} de la comparaison`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
