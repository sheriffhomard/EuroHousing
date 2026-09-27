/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Rent index evolution vs House prices (HPI) and Price-to-Rent analysis
 */

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Key,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CountryAffordabilityMetrics } from '../../data/affordabilityData';

interface RentVsBuySectionProps {
  country: CountryAffordabilityMetrics;
}

export const RentVsBuySection: React.FC<RentVsBuySectionProps> = ({ country }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const observations = country.observations;
  const chartHeight = 260;
  const chartWidth = 740;
  const padding = { top: 20, right: 35, bottom: 35, left: 50 };

  // Calculate scales based on HPI and Rent series
  const hpiValues = observations.map((o) => o.hpiIndex);
  const rentValues = observations.map((o) => o.rentIndex);
  const allVals = [...hpiValues, ...rentValues];

  const minVal = Math.min(90, Math.floor(Math.min(...allVals) / 10) * 10);
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

  const rentPoints = observations
    .map((o, i) => `${getX(i)},${getY(o.rentIndex)}`)
    .join(' ');

  const latestObs = observations[observations.length - 1];
  const startObs = observations[0];

  const totalHpiGrowth = ((latestObs.hpiIndex - startObs.hpiIndex) / startObs.hpiIndex) * 100;
  const totalRentGrowth = ((latestObs.rentIndex - startObs.rentIndex) / startObs.rentIndex) * 100;

  // Estimated gross rental yield: 1 / priceToRentRatio * 100
  const estimatedGrossYield = (1 / (country.priceToRentRatio || 22)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Évolution des Loyers vs Prix à l'Achat (Indice Eurostat CP0411)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mise en parallèle de l'indice des loyers d'Eurostat et du prix des logements pour éclairer l'arbitrage Achat vs Location.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 inline-block rounded-full" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Prix Achat (HPI)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-500 inline-block rounded-full" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Loyers (Rent Index)</span>
          </div>
        </div>
      </div>

      {/* KPI Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: HPI Growth */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Hausse des Prix à l'Achat (HPI)
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
            +{totalHpiGrowth.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Progression globale cumulée depuis 2015
          </div>
        </div>

        {/* Card 2: Rent Growth */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Hausse des Loyers Réels (Eurostat)
          </div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-mono mt-1">
            +{totalRentGrowth.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Hausse continue et ininterrompue des baux
          </div>
        </div>

        {/* Card 3: Price-to-Rent Ratio */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Ratio Prix / Loyers (Price-to-Rent)
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {country.priceToRentRatio} ans
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rendement brut estimé : <strong>{estimatedGrossYield.toFixed(2)}%</strong>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Trajectoire Comparée : Prix d'Achat vs Loyers en {country.nameFr} (2015 = 100)
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

            {/* HPI Curve */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={hpiPoints}
            />

            {/* Rent Index Curve */}
            <polyline
              fill="none"
              stroke="#14b8a6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={rentPoints}
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
                  cy={getY(observations[hoverIndex].rentIndex)}
                  r="4.5"
                  fill="#14b8a6"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Hover Inspector */}
        {hoverIndex !== null && observations[hoverIndex] && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {observations[hoverIndex].period}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                Prix Achat : {observations[hoverIndex].hpiIndex}
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold">
                Loyers : {observations[hoverIndex].rentIndex}
              </span>
            </div>
            <div className="text-slate-500 font-mono">
              Écart Achat/Loyer :{' '}
              <strong>
                {(observations[hoverIndex].hpiIndex - observations[hoverIndex].rentIndex).toFixed(1)} pts
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Note on Rent Dynamics */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Comprendre la divergence Prix vs Loyers :</span>
        </div>
        <p className="leading-relaxed">
          Alors que les prix d'achat ont réagi rapidement au resserrement monétaire de la BCE en 2022-2023 (baisse de l'activité, correction des prix dans certains pays comme l'Allemagne),
          les loyers ont poursuivi une <strong>progression continue et rigide</strong> sous l'effet de l'inflation, du report massif des ménages bloqués pour acheter vers la location, et de la pénurie structurelle de logements neufs en Europe.
        </p>
      </div>
    </div>
  );
};
