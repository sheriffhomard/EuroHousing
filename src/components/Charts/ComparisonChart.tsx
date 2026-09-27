/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Download, Plus, X } from 'lucide-react';
import { CountryTimeSeries, IndicatorMode } from '../../data/types';
import { getCountryInfo } from '../../data/countries';

interface ComparisonChartProps {
  seriesMap: Map<string, CountryTimeSeries>;
  indicator: IndicatorMode;
  onIndicatorChange: (ind: IndicatorMode) => void;
  onRemoveCountry: (code: string) => void;
  onAddCountry: () => void;
}

const COUNTRY_COLORS: Record<string, string> = {
  FR: '#2563eb', // France: Blue
  DE: '#0f172a', // Germany: Slate / Dark
  ES: '#ea580c', // Spain: Orange / Red
  IT: '#16a34a', // Italy: Green
  BE: '#9333ea', // Belgium: Purple
  NL: '#d97706', // Netherlands: Orange
  PT: '#059669', // Portugal: Emerald
  AT: '#dc2626', // Austria: Red
  IE: '#0284c7', // Ireland: Sky
  LU: '#4f46e5', // Luxembourg: Indigo
  EU27_2020: '#6366f1', // EU: Indigo
  EA20: '#8b5cf6', // Euro Area: Violet
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  seriesMap,
  indicator,
  onIndicatorChange,
  onRemoveCountry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const countries = Array.from(seriesMap.values());

  // Extract shared period array from the longest observations series
  const periods = useMemo(() => {
    let longest: string[] = [];
    for (const c of countries) {
      const p = c.observations.map((o) => o.period);
      if (p.length > longest.length) longest = p;
    }
    return longest;
  }, [countries]);

  // Which value accessor to use based on indicator
  const getValue = (c: CountryTimeSeries['observations'][0]): number | null => {
    if (!c) return null;
    if (indicator === 'hicp') return c.hicp;
    if (indicator === 'real_hpi') return c.realHpi;
    return c.hpi.total; // Default to nominal HPI
  };

  // Compute Y Min and Y Max
  const { yMin, yMax, yTicks } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const c of countries) {
      for (const obs of c.observations) {
        const v = getValue(obs);
        if (v !== null && !isNaN(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }

    if (!isFinite(min) || !isFinite(max)) {
      min = 80;
      max = 140;
    }

    min = Math.min(min, 95);
    max = Math.max(max, 105);

    const padding = (max - min) * 0.08;
    const finalMin = Math.floor((min - padding) / 10) * 10;
    const finalMax = Math.ceil((max + padding) / 10) * 10;

    const step = finalMax - finalMin <= 60 ? 10 : 20;
    const ticks: number[] = [];
    for (let t = finalMin; t <= finalMax; t += step) {
      ticks.push(t);
    }

    return { yMin: finalMin, yMax: finalMax, yTicks: ticks };
  }, [countries, indicator]);

  // SVG dimensions
  const width = 800;
  const height = 400;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (periods.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (index / (periods.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin);
    return height - paddingBottom - ratio * chartH;
  };

  // Paths
  const countryPaths = useMemo(() => {
    return countries.map((c, cIdx) => {
      const color = COUNTRY_COLORS[c.country.code] || `hsl(${(cIdx * 55) % 360}, 70%, 45%)`;
      let d = '';
      const points: { x: number; y: number; val: number; period: string }[] = [];

      const obsMap = new Map(c.observations.map((o) => [o.period, o]));

      periods.forEach((p, idx) => {
        const obs = obsMap.get(p);
        if (obs) {
          const val = getValue(obs);
          if (val !== null && !isNaN(val)) {
            const x = getX(idx);
            const y = getY(val);
            points.push({ x, y, val, period: p });
            if (d === '') d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
            else d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }
        }
      });

      return {
        country: c.country,
        color,
        d,
        points,
        latestVal: points.length > 0 ? points[points.length - 1].val : null,
      };
    });
  }, [countries, periods, yMin, yMax, indicator]);

  // X Axis Ticks
  const xTicks = useMemo(() => {
    if (periods.length === 0) return [];
    const count = Math.min(8, periods.length);
    const step = Math.max(1, Math.floor(periods.length / (count - 1)));
    const ticks: { index: number; label: string; x: number }[] = [];

    for (let i = 0; i < periods.length; i += step) {
      ticks.push({ index: i, label: periods[i], x: getX(i) });
    }
    const lastIdx = periods.length - 1;
    if (ticks[ticks.length - 1]?.index !== lastIdx) {
      ticks.push({ index: lastIdx, label: periods[lastIdx], x: getX(lastIdx) });
    }
    return ticks;
  }, [periods]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;
    if (svgX < paddingLeft || svgX > width - paddingRight) {
      setHoverIndex(null);
      return;
    }
    const relX = svgX - paddingLeft;
    const ratio = relX / chartW;
    const closestIdx = Math.round(ratio * (periods.length - 1));
    const boundedIdx = Math.max(0, Math.min(periods.length - 1, closestIdx));
    setHoverIndex(boundedIdx);
  };

  const exportSvg = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eurostat-comparatif-${indicator}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hoveredPeriod = hoverIndex !== null ? periods[hoverIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Comparateur Multi-Pays Européens
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Superposition des trajectoires économiques nationales sur la même échelle temporelle.
          </p>
        </div>

        {/* Indicator Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => onIndicatorChange('hpi')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              indicator === 'hpi' || indicator === 'both'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI Nominal
          </button>
          <button
            onClick={() => onIndicatorChange('real_hpi')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              indicator === 'real_hpi'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI Réel (Inflation Déduite)
          </button>
          <button
            onClick={() => onIndicatorChange('hicp')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              indicator === 'hicp'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inflation (HICP)
          </button>
        </div>
      </div>

      {/* Selected Countries Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {countryPaths.map((cp) => (
            <div
              key={cp.country.code}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cp.color }} />
              <span>{cp.country.flag}</span>
              <span>{cp.country.nameFr}</span>
              {cp.latestVal !== null && (
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {cp.latestVal.toFixed(1)}
                </span>
              )}
              {countries.length > 1 && (
                <button
                  onClick={() => onRemoveCountry(cp.country.code)}
                  className="text-slate-400 hover:text-rose-600 ml-1 p-0.5"
                  title={`Retirer ${cp.country.nameFr}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={exportSvg}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter SVG</span>
        </button>
      </div>

      {/* Chart Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[460px] overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Y Ticks */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            const isBase = tick === 100;
            return (
              <g key={`cmp-ytick-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className={
                    isBase
                      ? 'text-slate-400 dark:text-slate-500 stroke-[1.5]'
                      : 'text-slate-100 dark:text-slate-800/60 stroke-1'
                  }
                  strokeDasharray={isBase ? '4 3' : undefined}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className={`text-[10px] font-mono tabular-nums ${
                    isBase
                      ? 'fill-slate-700 dark:fill-slate-300 font-bold'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Base 100 label */}
          <text
            x={width - paddingRight}
            y={getY(100) - 4}
            textAnchor="end"
            className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold"
          >
            BASE 100
          </text>

          {/* X Axis */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            className="stroke-slate-200 dark:stroke-slate-800 stroke-1"
          />

          {xTicks.map((tick) => (
            <g key={`cmp-xtick-${tick.index}`}>
              <line
                x1={tick.x}
                y1={height - paddingBottom}
                x2={tick.x}
                y2={height - paddingBottom + 5}
                className="stroke-slate-300 dark:stroke-slate-700"
              />
              <text
                x={tick.x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Lines */}
          {countryPaths.map((cp) => (
            <g key={`cmp-line-${cp.country.code}`}>
              <path
                d={cp.d}
                fill="none"
                stroke={cp.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {cp.points.length > 0 && (
                <circle
                  cx={cp.points[cp.points.length - 1].x}
                  cy={cp.points[cp.points.length - 1].y}
                  r="3.5"
                  fill={cp.color}
                  className="stroke-white dark:stroke-slate-900 stroke-1"
                />
              )}
            </g>
          ))}

          {/* Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          )}
        </svg>

        {/* Hover inspection tooltip */}
        {hoveredPeriod && (
          <div
            className="absolute top-4 pointer-events-none z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xl backdrop-blur-xs text-xs space-y-2 transition-all w-60"
            style={{
              left: `${Math.min(75, Math.max(15, (getX(hoverIndex!) / width) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
              Trimestre : {hoveredPeriod}
            </div>

            <div className="space-y-1 font-mono">
              {countries.map((c) => {
                const obs = c.observations.find((o) => o.period === hoveredPeriod);
                const val = obs ? getValue(obs) : null;
                const color = COUNTRY_COLORS[c.country.code] || '#64748b';

                return (
                  <div key={c.country.code} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span>{c.country.flag}</span>
                      <span className="truncate">{c.country.nameFr}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {val !== null ? val.toFixed(1) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
