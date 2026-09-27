/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Price-to-Income (PIR) Ratio & Purchase Effort Analysis
 */

import React, { useState } from 'react';
import {
  Coins,
  TrendingUp,
  Info,
  Building,
  Scale,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  CountryAffordabilityMetrics,
  AFFORDABILITY_COUNTRIES,
} from '../../data/affordabilityData';

interface PriceToIncomeSectionProps {
  selectedCountry: CountryAffordabilityMetrics;
  onSelectCountry: (code: string) => void;
}

export const PriceToIncomeSection: React.FC<PriceToIncomeSectionProps> = ({
  selectedCountry,
  onSelectCountry,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // SVG Chart setup for Price-to-Income time series
  const observations = selectedCountry.observations;
  const chartHeight = 240;
  const chartWidth = 720;
  const padding = { top: 20, right: 30, bottom: 35, left: 50 };

  const values = observations.map((o) => o.priceToIncomeIndex);
  const minVal = Math.min(80, Math.floor(Math.min(...values) / 10) * 10);
  const maxVal = Math.max(160, Math.ceil(Math.max(...values) / 10) * 10);

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

  // Generate SVG path points
  const points = observations
    .map((o, i) => `${getX(i)},${getY(o.priceToIncomeIndex)}`)
    .join(' ');

  const areaPoints = `${getX(0)},${chartHeight - padding.bottom} ${points} ${getX(
    observations.length - 1
  )},${chartHeight - padding.bottom}`;

  const currentPIR = observations[observations.length - 1]?.priceToIncomeIndex ?? 100;
  const peakPIR = Math.max(...values);
  const startPIR = observations[0]?.priceToIncomeIndex ?? 100;
  const totalPIRVariation = ((currentPIR - startPIR) / startPIR) * 100;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Prix des Logements Rapportés aux Revenus des Ménages (Price-to-Income)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            L'indicateur officiel (OCDE / Eurostat) mesurant l'effort financier réel d'acquisition d'un logement par rapport aux revenus disponibles.
          </p>
        </div>

        {/* Selected country badge */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="font-bold text-slate-900 dark:text-white">{selectedCountry.nameFr}</span>
          <span className="text-slate-400 font-mono text-[11px]">({selectedCountry.countryCode})</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Years of income for 75m2 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Effort d'achat (75 m²)
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            {selectedCountry.yearsOfIncomeFor75m2} ans
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            de revenus nets totaux du ménage pour financer 75 m²
          </div>
        </div>

        {/* KPI 2: Price-to-Income Index */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Indice PIR Actuel (Base 2015=100)
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {currentPIR}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className={totalPIRVariation >= 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {totalPIRVariation >= 0 ? `+${totalPIRVariation.toFixed(1)}%` : `${totalPIRVariation.toFixed(1)}%`}
            </span>
            <span>vs niveau de 2015</span>
          </div>
        </div>

        {/* KPI 3: Square Meter Price */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Prix Moyen du m² Résidentiel
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {selectedCountry.averageSquareMeterPrice.toLocaleString('fr-FR')} €/m²
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Moyenne pondérée nationale
          </div>
        </div>

        {/* KPI 4: Affordability Diagnosis */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Diagnostic Accessibilité
          </div>
          <div className="mt-1 flex items-center gap-2">
            {selectedCountry.affordabilityStatus === 'critical' && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Tension Critique
              </span>
            )}
            {selectedCountry.affordabilityStatus === 'strained' && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Marché Tendu
              </span>
            )}
            {selectedCountry.affordabilityStatus === 'balanced' && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Scale className="w-4 h-4" /> Marché Équilibré
              </span>
            )}
            {selectedCountry.affordabilityStatus === 'favorable' && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Accessibilité Favorable
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Écart par rapport à la moyenne historique UE
          </div>
        </div>
      </div>

      {/* Interactive Time Series Chart: Evolution of Price-to-Income */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Trajectoire Temporelle de l'Effort d'Achat : {selectedCountry.nameFr} (2015 – 2026)
            </span>
            <p className="text-[11px] text-slate-400">
              Indice &gt; 100 : Les prix progressent plus vite que les revenus (accessibilité dégradée).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-600 rounded-full inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Price-to-Income (PIR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-slate-400 inline-block" />
              <span className="text-slate-400">Base 100 Équilibre</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="pirGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[minVal, 100, 120, 140, maxVal].map((tick) => (
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

            {/* Base 100 Reference Tag */}
            <text
              x={chartWidth - padding.right - 2}
              y={getY(100) - 4}
              textAnchor="end"
              className="text-[9px] fill-slate-400 font-semibold"
            >
              Équilibre 2015 (100)
            </text>

            {/* Gradient Area */}
            <polygon points={areaPoints} fill="url(#pirGradient)" />

            {/* Main Path */}
            <polyline
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />

            {/* Timeline X Labels */}
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

            {/* Mouse Tracking Rect */}
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

            {/* Active Hover Crosshair */}
            {hoverIndex !== null && observations[hoverIndex] && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={chartHeight - padding.bottom}
                  stroke="#4f46e5"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(observations[hoverIndex].priceToIncomeIndex)}
                  r="5"
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Hover Inspector Tooltip readout */}
        {hoverIndex !== null && observations[hoverIndex] && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {observations[hoverIndex].period}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 dark:text-slate-300">
                PIR : <strong>{observations[hoverIndex].priceToIncomeIndex}</strong>
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <span>HPI Prix : {observations[hoverIndex].hpiIndex}</span>
              <span>Indice Salaires : {observations[hoverIndex].wageIndex}</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Écart : {(observations[hoverIndex].hpiIndex - observations[hoverIndex].wageIndex).toFixed(1)} pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* European Comparison Leaderboard for Price-to-Income */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Classement Européen de l'Effort d'Achat (Nombre d'années de revenus pour 75 m²)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AFFORDABILITY_COUNTRIES.map((c) => {
            const isSelected = c.countryCode === selectedCountry.countryCode;
            return (
              <button
                key={c.countryCode}
                onClick={() => onSelectCountry(c.countryCode)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{c.flag}</span>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {c.nameFr}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {c.averageSquareMeterPrice.toLocaleString('fr-FR')} €/m² · PIR : {c.observations[c.observations.length - 1]?.priceToIncomeIndex}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                    {c.yearsOfIncomeFor75m2} ans
                  </div>
                  <div className="text-[10px] text-slate-400">de revenus</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
