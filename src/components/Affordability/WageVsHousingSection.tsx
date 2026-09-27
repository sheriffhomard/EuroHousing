/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Wages vs Housing Prices (Labour Cost Index vs House Price Index)
 */

import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Scissors,
  Scale,
  Info,
  Layers,
} from 'lucide-react';
import {
  CountryAffordabilityMetrics,
  AFFORDABILITY_COUNTRIES,
} from '../../data/affordabilityData';

interface WageVsHousingSectionProps {
  country: CountryAffordabilityMetrics;
}

export const WageVsHousingSection: React.FC<WageVsHousingSectionProps> = ({ country }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const observations = country.observations;
  const chartHeight = 260;
  const chartWidth = 740;
  const padding = { top: 20, right: 35, bottom: 35, left: 50 };

  const hpiVals = observations.map((o) => o.hpiIndex);
  const wageVals = observations.map((o) => o.wageIndex);
  const realWageVals = observations.map((o) => o.realWageIndex);
  const allVals = [...hpiVals, ...wageVals, ...realWageVals];

  const minVal = Math.min(80, Math.floor(Math.min(...allVals) / 10) * 10);
  const maxVal = Math.max(160, Math.ceil(Math.max(...allVals) / 10) * 10);

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

  const hpiPoints = observations
    .map((o, i) => `${getX(i)},${getY(o.hpiIndex)}`)
    .join(' ');

  const wagePoints = observations
    .map((o, i) => `${getX(i)},${getY(o.wageIndex)}`)
    .join(' ');

  const realWagePoints = observations
    .map((o, i) => `${getX(i)},${getY(o.realWageIndex)}`)
    .join(' ');

  const latestObs = observations[observations.length - 1];
  const startObs = observations[0];

  const totalHpiGrowth = ((latestObs.hpiIndex - startObs.hpiIndex) / startObs.hpiIndex) * 100;
  const totalWageGrowth = ((latestObs.wageIndex - startObs.wageIndex) / startObs.wageIndex) * 100;
  const divergenceGap = totalHpiGrowth - totalWageGrowth;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Effet Ciseau : Évolution des Salaires vs Prix Immobiliers</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare la vitesse de progression des rémunérations du travail avec la valorisation des biens immobiliers depuis 2015.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 inline-block rounded-full" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Prix Logements (HPI)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 inline-block rounded-full" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Salaires Nominaux</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block rounded-full border-b border-dashed" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Salaires Réels (net inflation)</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: HPI Growth */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Hausse des Prix Immobiliers
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
            +{totalHpiGrowth.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Indice HPI officiel en {country.nameFr}
          </div>
        </div>

        {/* Card 2: Wage Growth */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Progression des Salaires
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            +{totalWageGrowth.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Indice du coût de la main d'œuvre (LCI)
          </div>
        </div>

        {/* Card 3: Divergence Gap */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Écart de Décrochage (Effet Ciseau)
          </div>
          <div
            className={`text-2xl font-extrabold font-mono mt-1 ${
              divergenceGap > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {divergenceGap > 0 ? `+${divergenceGap.toFixed(1)} pts` : `${divergenceGap.toFixed(1)} pts`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {divergenceGap > 0
              ? "L'immobilier a surperformé les salaires"
              : 'Les salaires ont progressé plus vite que la pierre'}
          </div>
        </div>
      </div>

      {/* SVG Multi-curve Chart */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Superposition des Trajectoires : Prix vs Salaires (2015 = 100)
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Grid ticks */}
            {[minVal, 100, 120, 140, 160, maxVal].map((tick) => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={getY(tick)}
                  x2={chartWidth - padding.right}
                  y2={getY(tick)}
                  stroke={tick === 100 ? '#94a3b8' : '#e2e8f0'}
                  strokeDasharray={tick === 100 ? '4 4' : undefined}
                  className="dark:stroke-slate-800"
                />
                <text
                  x={padding.left - 8}
                  y={getY(tick) + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Base 100 benchmark label */}
            <text
              x={chartWidth - padding.right - 2}
              y={getY(100) - 4}
              textAnchor="end"
              className="text-[9px] fill-slate-400 font-semibold"
            >
              Base 100 (2015)
            </text>

            {/* HPI Curve */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={hpiPoints}
            />

            {/* Wage Index Curve */}
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={wagePoints}
            />

            {/* Real Wage Curve (dashed) */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={realWagePoints}
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

            {/* Hover Crosshair */}
            {hoverIndex !== null && observations[hoverIndex] && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={chartHeight - padding.bottom}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(observations[hoverIndex].hpiIndex)}
                  r="4.5"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(observations[hoverIndex].wageIndex)}
                  r="4.5"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(observations[hoverIndex].realWageIndex)}
                  r="4"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Hover Inspector Tooltip */}
        {hoverIndex !== null && observations[hoverIndex] && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs gap-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                {observations[hoverIndex].period}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                Prix HPI : {observations[hoverIndex].hpiIndex}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Salaires : {observations[hoverIndex].wageIndex}
              </span>
              <span className="text-amber-500 font-semibold">
                Salaire Réel : {observations[hoverIndex].realWageIndex}
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Écart Ciseau :{' '}
              <strong className="text-rose-600">
                {(observations[hoverIndex].hpiIndex - observations[hoverIndex].wageIndex).toFixed(1)} pts
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Note on the Scissors Effect */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Analyse du pouvoir d'achat patrimonial :</span>
        </div>
        <p className="leading-relaxed">
          Lorsque la courbe des prix immobiliers (bleue) monte beaucoup plus vite que celle des salaires (verte),
          l'apport personnel nécessaire s'accroît et le temps d'épargne exigé pour devenir propriétaire s'allonge.
          La récente correction des prix en 2023-2024, combinée aux revalorisations salariales post-inflation, a permis un début de rééquilibrage partiel, mais l'effet ciseau reste historiquement défavorable aux primo-accédants par rapport à la décennie 2000-2015.
        </p>
      </div>
    </div>
  );
};
