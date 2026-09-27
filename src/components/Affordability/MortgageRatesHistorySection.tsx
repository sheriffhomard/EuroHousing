/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mortgage Rates History (ECB MFI interest rates for house purchases)
 */

import React, { useState } from 'react';
import {
  Percent,
  TrendingUp,
  Landmark,
  Layers,
  Info,
  Calendar,
} from 'lucide-react';
import {
  CountryAffordabilityMetrics,
  AFFORDABILITY_COUNTRIES,
} from '../../data/affordabilityData';

interface MortgageRatesHistorySectionProps {
  country: CountryAffordabilityMetrics;
  onSelectCountry: (code: string) => void;
}

export const MortgageRatesHistorySection: React.FC<MortgageRatesHistorySectionProps> = ({
  country,
  onSelectCountry,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const observations = country.observations;
  const chartHeight = 250;
  const chartWidth = 740;
  const padding = { top: 20, right: 35, bottom: 35, left: 50 };

  const rateValues = observations.map((o) => o.mortgageRate);
  const minVal = 0.5;
  const maxVal = 5.0;

  const getX = (i: number) => {
    return (
      padding.left +
      (i / (observations.length - 1)) * (chartWidth - padding.left - padding.right)
    );
  };

  const getY = (val: number) => {
    return (
      chartHeight -
      padding.bottom -
      ((val - minVal) / (maxVal - minVal)) * (chartHeight - padding.top - padding.bottom)
    );
  };

  const pathPoints = observations
    .map((o, i) => `${getX(i)},${getY(o.mortgageRate)}`)
    .join(' ');

  const areaPoints = `${getX(0)},${chartHeight - padding.bottom} ${pathPoints} ${getX(
    observations.length - 1
  )},${chartHeight - padding.bottom}`;

  const currentRate = observations[observations.length - 1]?.mortgageRate ?? 3.4;
  const minRateObs = [...observations].sort((a, b) => a.mortgageRate - b.mortgageRate)[0];
  const maxRateObs = [...observations].sort((a, b) => b.mortgageRate - a.mortgageRate)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Historique des Taux de Crédit Immobilier (BCE / MIR)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Taux d'intérêt annuel effectif moyen accordé aux ménages pour l'acquisition de logements résidentiels (2015 – 2026).
          </p>
        </div>

        {/* Selected Country Flag */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-base">{country.flag}</span>
          <span className="font-bold text-slate-900 dark:text-white">{country.nameFr}</span>
          <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{currentRate.toFixed(2)}%</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Current Rate */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Taux Moyen Actuel (2025-2026)
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
            {currentRate.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Phase de stabilisation après le pic de 2023
          </div>
        </div>

        {/* Card 2: Lowest Rate Floor */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Plancher Historique (2021)
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {minRateObs?.mortgageRate.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Enregistré au {minRateObs?.period} (Taux d'argent quasi-gratuit)
          </div>
        </div>

        {/* Card 3: Peak Rate */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Pic du Choc Monétaire (Fin 2023)
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
            {maxRateObs?.mortgageRate.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Au plus fort du resserrement de la BCE ({maxRateObs?.period})
          </div>
        </div>
      </div>

      {/* SVG Time Series Chart */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Courbe Trimestrielle des Taux de Prêt Immobilier : {country.nameFr}
            </span>
            <p className="text-[11px] text-slate-400">
              Source : Statistiques de la Banque Centrale Européenne (BCE MIR)
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Échelle : 0.5% à 5.0%
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid ticks */}
            {[1.0, 2.0, 3.0, 4.0, 5.0].map((tick) => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={getY(tick)}
                  x2={chartWidth - padding.right}
                  y2={getY(tick)}
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800"
                />
                <text
                  x={padding.left - 8}
                  y={getY(tick) + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {tick.toFixed(1)}%
                </text>
              </g>
            ))}

            {/* Gradient Area */}
            <polygon points={areaPoints} fill="url(#rateGradient)" />

            {/* Line Path */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pathPoints}
            />

            {/* X Labels */}
            {observations.map((o, idx) => {
              if (idx % 8 !== 0 && idx !== observations.length - 1) return null;
              return (
                <text
                  key={o.period}
                  x={getX(idx)}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {o.period.replace('-Q', ' T')}
                </text>
              );
            })}

            {/* Hit testing areas */}
            {observations.map((o, idx) => {
              const x = getX(idx);
              const colWidth = (chartWidth - padding.left - padding.right) / observations.length;
              return (
                <rect
                  key={o.period}
                  x={x - colWidth / 2}
                  y={padding.top}
                  width={colWidth}
                  height={chartHeight - padding.top - padding.bottom}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              );
            })}

            {/* Active Hover crosshair */}
            {hoverIndex !== null && observations[hoverIndex] && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={chartHeight - padding.bottom}
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(observations[hoverIndex].mortgageRate)}
                  r="5"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Hover Inspector Tooltip */}
        {hoverIndex !== null && observations[hoverIndex] && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {observations[hoverIndex].period}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 dark:text-slate-300">
                Taux moyen :{' '}
                <strong className="text-blue-600 dark:text-blue-400 font-mono">
                  {observations[hoverIndex].mortgageRate.toFixed(2)}%
                </strong>
              </span>
            </div>
            <div className="text-slate-500 font-mono">
              Écart vs plancher 2021 :{' '}
              <strong className="text-rose-600">
                +{(observations[hoverIndex].mortgageRate - (minRateObs?.mortgageRate || 1.2)).toFixed(2)} pts
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* European Mortgage Rates Comparison Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Panorama des Taux Pratiqués en Europe (BCE / MIR)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {AFFORDABILITY_COUNTRIES.map((c) => {
            const isSelected = c.countryCode === country.countryCode;
            return (
              <button
                key={c.countryCode}
                onClick={() => onSelectCountry(c.countryCode)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 hover:border-slate-300'
                }`}
              >
                <div className="text-lg">{c.flag}</div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {c.nameFr}
                </div>
                <div className="font-mono font-extrabold text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {c.currentMortgageRate.toFixed(2)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
