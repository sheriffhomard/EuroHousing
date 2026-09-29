/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Synchronized Peak Trajectory Chart (T=0 at cyclical peak)
 * Allows direct visual comparison of downturns and recovery speeds across countries.
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import {
  SynchronizedPeakSeries,
  CycleMetric,
} from '../../services/cycleAnalysis';

interface PeakComparisonChartProps {
  seriesList: SynchronizedPeakSeries[];
  metric: CycleMetric;
  onMetricChange: (metric: CycleMetric) => void;
  selectedCountryCodes: string[];
  onToggleCountry: (code: string) => void;
  availableCountries: { code: string; name: string; flag: string }[];
}

const COUNTRY_COLORS: Record<string, string> = {
  FR: '#2563eb', // Blue
  DE: '#dc2626', // Red
  ES: '#f59e0b', // Amber
  IT: '#059669', // Emerald
  NL: '#ea580c', // Orange
  SE: '#0284c7', // Sky
  DK: '#7c3aed', // Purple
  PT: '#14b8a6', // Teal
  AT: '#e11d48', // Rose
  IE: '#16a34a', // Green
  BE: '#475569', // Slate
  PL: '#db2777', // Pink
  EU27_2020: '#3b82f6', // Bright Blue
};

export const PeakComparisonChart: React.FC<PeakComparisonChartProps> = ({
  seriesList,
  metric,
  onMetricChange,
  selectedCountryCodes,
  onToggleCountry,
  availableCountries,
}) => {
  const [displayMode, setDisplayMode] = useState<'drawdown' | 'index'>('drawdown');
  const [hoverOffset, setHoverOffset] = useState<number | null>(null);

  // Filter series according to selection
  const activeSeries = useMemo(() => {
    return seriesList.filter((s) => selectedCountryCodes.includes(s.countryCode));
  }, [seriesList, selectedCountryCodes]);

  const chartHeight = 340;
  const padding = { top: 35, right: 35, bottom: 45, left: 60 };
  const width = 760;

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Offsets span from -8 to +16 quarters
  const minOffset = -8;
  const maxOffset = 16;
  const totalOffsets = maxOffset - minOffset;

  const getX = (offset: number) => {
    return padding.left + ((offset - minOffset) / totalOffsets) * innerWidth;
  };

  // Find min and max value for vertical scaling
  const { minY, maxY } = useMemo(() => {
    if (displayMode === 'drawdown') {
      let min = 0;
      activeSeries.forEach((s) => {
        s.relativeQuarters.forEach((q) => {
          if (q.drawdownPercent < min) min = q.drawdownPercent;
        });
      });
      return {
        minY: Math.min(-30, Math.floor(min - 3)),
        maxY: 8, // slight overshoot if some countries surpassed peak
      };
    } else {
      let min = 100;
      let max = 100;
      activeSeries.forEach((s) => {
        s.relativeQuarters.forEach((q) => {
          if (q.normalizedValue < min) min = q.normalizedValue;
          if (q.normalizedValue > max) max = q.normalizedValue;
        });
      });
      return {
        minY: Math.min(70, Math.floor(min - 5)),
        maxY: Math.max(105, Math.ceil(max + 5)),
      };
    }
  }, [activeSeries, displayMode]);

  const getY = (val: number) => {
    const range = maxY - minY || 1;
    return padding.top + innerHeight - ((val - minY) / range) * innerHeight;
  };

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const count = 5;
    const step = (maxY - minY) / count;
    const ticks: number[] = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(Math.round(minY + i * step));
    }
    return ticks;
  }, [minY, maxY]);

  // Key performance comparison insights
  const insights = useMemo(() => {
    if (activeSeries.length === 0) return null;

    let worstDrop = 0;
    let worstCountry = activeSeries[0];

    activeSeries.forEach((s) => {
      let countryMin = 0;
      s.relativeQuarters.forEach((q) => {
        if (q.drawdownPercent < countryMin) {
          countryMin = q.drawdownPercent;
        }
      });
      if (countryMin < worstDrop) {
        worstDrop = countryMin;
        worstCountry = s;
      }
    });

    return {
      worstCountry,
      worstDrop,
    };
  }, [activeSeries]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Synchronisation des Cycles
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">Superposition T = 0</span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
            Trajectoires Post-Sommet : Comparaison de la Vitesse de Chute et de Reprise
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Toutes les courbes sont alignées sur leur sommet cyclique respectif (T = 0). Observez l'ampleur de la correction et le temps mis pour regagner le terrain perdu.
          </p>
        </div>

        {/* Display mode toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setDisplayMode('drawdown')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                displayMode === 'drawdown'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Écart au sommet (%)
            </button>
            <button
              onClick={() => setDisplayMode('index')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                displayMode === 'index'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Base 100 au sommet
            </button>
          </div>
        </div>
      </div>

      {/* Country Selection Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 mr-1">Pays comparés :</span>
        {availableCountries.map((c) => {
          const isSelected = selectedCountryCodes.includes(c.code);
          const color = COUNTRY_COLORS[c.code] || '#3b82f6';
          return (
            <button
              key={c.code}
              onClick={() => onToggleCountry(c.code)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: color }}
              />
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const svgX = (mouseX / rect.width) * width;
            const offset = Math.round(minOffset + ((svgX - padding.left) / innerWidth) * totalOffsets);
            setHoverOffset(Math.max(minOffset, Math.min(maxOffset, offset)));
          }}
          onMouseLeave={() => setHoverOffset(null)}
        >
          {/* Shaded Pre-Peak and Post-Peak Areas */}
          <rect
            x={padding.left}
            y={padding.top}
            width={getX(0) - padding.left}
            height={innerHeight}
            fill="#3b82f6"
            fillOpacity={0.03}
          />
          <rect
            x={getX(0)}
            y={padding.top}
            width={width - padding.right - getX(0)}
            height={innerHeight}
            fill="#ef4444"
            fillOpacity={0.03}
          />

          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                  className="dark:stroke-slate-800"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 font-semibold"
                >
                  {displayMode === 'drawdown' ? `${tick}%` : tick}
                </text>
              </g>
            );
          })}

          {/* Baseline (0% in drawdown mode or 100 in index mode) */}
          <line
            x1={padding.left}
            y1={getY(displayMode === 'drawdown' ? 0 : 100)}
            x2={width - padding.right}
            y2={getY(displayMode === 'drawdown' ? 0 : 100)}
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Vertical T=0 Peak Line */}
          <line
            x1={getX(0)}
            y1={padding.top}
            x2={getX(0)}
            y2={chartHeight - padding.bottom}
            stroke="#991b1b"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text
            x={getX(0)}
            y={padding.top - 12}
            textAnchor="middle"
            className="text-[10px] font-extrabold font-mono fill-rose-600 dark:fill-rose-400 uppercase tracking-wider"
          >
            ▲ Sommet (T = 0)
          </text>

          {/* Lines for each country */}
          {activeSeries.map((s) => {
            const color = COUNTRY_COLORS[s.countryCode] || '#3b82f6';
            const sorted = [...s.relativeQuarters].sort((a, b) => a.offset - b.offset);

            const path = sorted
              .map((q, idx) => {
                const x = getX(q.offset);
                const val = displayMode === 'drawdown' ? q.drawdownPercent : q.normalizedValue;
                const y = getY(val);
                return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ');

            return (
              <g key={s.countryCode}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.9}
                />

                {/* Marker at T=0 */}
                <circle
                  cx={getX(0)}
                  cy={getY(displayMode === 'drawdown' ? 0 : 100)}
                  r={4}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

          {/* X-axis ticks (Offset Quarters) */}
          {[-8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16].map((offset) => {
            const x = getX(offset);
            const isZero = offset === 0;
            return (
              <g key={offset}>
                <line
                  x1={x}
                  y1={chartHeight - padding.bottom}
                  x2={x}
                  y2={chartHeight - padding.bottom + 5}
                  stroke={isZero ? '#991b1b' : '#94a3b8'}
                  strokeWidth={isZero ? 2 : 1}
                />
                <text
                  x={x}
                  y={chartHeight - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    isZero ? 'fill-rose-600 dark:fill-rose-400 font-extrabold' : 'fill-slate-500'
                  }`}
                >
                  {isZero ? 'T = 0' : offset > 0 ? `+${offset}T` : `${offset}T`}
                </text>
              </g>
            );
          })}

          {/* Interactive Hover Vertical Guide Line */}
          {hoverOffset !== null && (
            <g>
              <line
                x1={getX(hoverOffset)}
                y1={padding.top}
                x2={getX(hoverOffset)}
                y2={chartHeight - padding.bottom}
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip at hover offset */}
        {hoverOffset !== null && (
          <div
            className="pointer-events-none absolute z-20 p-3 rounded-xl bg-slate-950/95 text-white border border-slate-700 shadow-xl backdrop-blur-md text-xs space-y-1.5"
            style={{
              left: `${Math.min(width - 200, Math.max(15, getX(hoverOffset) - 90))}px`,
              top: '20px',
              minWidth: '180px',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-extrabold font-mono text-blue-400">
                {hoverOffset === 0
                  ? 'Sommet (T = 0)'
                  : hoverOffset > 0
                  ? `+${hoverOffset} trimestres après sommet`
                  : `${Math.abs(hoverOffset)} trimestres avant sommet`}
              </span>
            </div>

            <div className="space-y-1 pt-0.5">
              {activeSeries.map((s) => {
                const color = COUNTRY_COLORS[s.countryCode] || '#3b82f6';
                const pt = s.relativeQuarters.find((q) => q.offset === hoverOffset);
                if (!pt) return null;
                const val = displayMode === 'drawdown' ? pt.drawdownPercent : pt.normalizedValue;

                return (
                  <div key={s.countryCode} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span>{s.flag}</span>
                      <span className="font-semibold text-slate-200">{s.countryName}</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        displayMode === 'drawdown'
                          ? val >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                          : 'text-slate-100'
                      }`}
                    >
                      {displayMode === 'drawdown' && val > 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Summary Cards */}
      {insights && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-500 font-bold">📉</span>
            <span className="text-slate-600 dark:text-slate-300">
              Plus forte correction observée :{' '}
              <strong className="text-slate-900 dark:text-white">
                {insights.worstCountry.countryName}
              </strong>{' '}
              ({insights.worstDrop.toFixed(1)}% depuis son pic de{' '}
              <span className="font-mono">{insights.worstCountry.peakPeriod}</span>).
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {metric === 'real' ? 'Calculé en HPI Réel' : 'Calculé en HPI Nominal'}
          </span>
        </div>
      )}
    </div>
  );
};
