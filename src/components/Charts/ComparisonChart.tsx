/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Download, Eye, EyeOff, X, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { CountryTimeSeries, IndicatorMode } from '../../data/types';
import { getCountryInfo } from '../../data/countries';

export type ExtendedIndicatorMode = IndicatorMode | 'spread';

interface ComparisonChartProps {
  seriesMap: Map<string, CountryTimeSeries>;
  indicator: ExtendedIndicatorMode;
  onIndicatorChange: (ind: IndicatorMode) => void;
  onRemoveCountry: (code: string) => void;
  onAddCountry?: () => void;
  // Curve management & ordering
  curveOrder?: string[];
  hiddenCurves?: Set<string>;
  highlightedCountry?: string | null;
  countryColors?: Record<string, string>;
  onMoveCurve?: (code: string, direction: 'up' | 'down') => void;
  onToggleCurveVisibility?: (code: string) => void;
  onHoverCountry?: (code: string | null) => void;
}

export const DEFAULT_COUNTRY_COLORS: Record<string, string> = {
  FR: '#2563eb', // France: Blue
  DE: '#0f172a', // Germany: Slate / Dark
  ES: '#ea580c', // Spain: Orange
  IT: '#16a34a', // Italy: Green
  BE: '#9333ea', // Belgium: Purple
  NL: '#d97706', // Netherlands: Amber
  PT: '#059669', // Portugal: Emerald
  AT: '#dc2626', // Austria: Red
  IE: '#0284c7', // Ireland: Sky
  LU: '#4f46e5', // Luxembourg: Indigo
  EU27_2020: '#6366f1', // EU: Indigo
  EA20: '#8b5cf6', // Euro Area: Violet
  DK: '#e11d48', // Denmark: Rose
  SE: '#0891b2', // Sweden: Cyan
  FI: '#2563eb', // Finland: Blue
  PL: '#db2777', // Poland: Pink
  CZ: '#7c3aed', // Czechia: Violet
  HU: '#059669', // Hungary: Emerald
  RO: '#d97706', // Romania: Amber
  BG: '#16a34a', // Bulgaria: Green
  HR: '#dc2626', // Croatia: Red
  SK: '#4f46e5', // Slovakia: Indigo
  SI: '#0d9488', // Slovenia: Teal
  EE: '#0284c7', // Estonia: Sky
  LV: '#991b1b', // Latvia: Dark Red
  LT: '#ca8a04', // Lithuania: Yellow/Olive
  CY: '#f59e0b', // Cyprus: Amber
  MT: '#dc2626', // Malta: Red
  NO: '#e11d48', // Norway: Rose
  IS: '#2563eb', // Iceland: Blue
  CH: '#dc2626', // Switzerland: Red
  UK: '#1e3a8a', // UK: Navy
  TR: '#ef4444', // Turkey: Red
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  seriesMap,
  indicator,
  onIndicatorChange,
  onRemoveCountry,
  curveOrder,
  hiddenCurves = new Set<string>(),
  highlightedCountry = null,
  countryColors = DEFAULT_COUNTRY_COLORS,
  onMoveCurve,
  onToggleCurveVisibility,
  onHoverCountry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Ordered list of countries based on curveOrder
  const orderedCodes = useMemo(() => {
    if (curveOrder && curveOrder.length > 0) {
      // Include any new codes from seriesMap not yet in curveOrder
      const present = new Set(seriesMap.keys());
      const filtered = curveOrder.filter((c) => present.has(c));
      present.forEach((c) => {
        if (!filtered.includes(c)) filtered.push(c);
      });
      return filtered;
    }
    return Array.from(seriesMap.keys());
  }, [curveOrder, seriesMap]);

  const countries = useMemo(() => {
    return orderedCodes
      .map((code) => seriesMap.get(code))
      .filter((s): s is CountryTimeSeries => !!s);
  }, [orderedCodes, seriesMap]);

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
    if (indicator === 'spread') {
      if (c.hpi.total !== null && c.hicp !== null) {
        return c.hpi.total - c.hicp;
      }
      return null;
    }
    return c.hpi.total; // Default to nominal HPI
  };

  // Compute Y Min and Y Max considering only visible countries
  const { yMin, yMax, yTicks } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const c of countries) {
      if (hiddenCurves.has(c.country.code)) continue;

      for (const obs of c.observations) {
        const v = getValue(obs);
        if (v !== null && !isNaN(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }

    if (!isFinite(min) || !isFinite(max)) {
      min = indicator === 'spread' ? -20 : 80;
      max = indicator === 'spread' ? 40 : 140;
    }

    if (indicator !== 'spread') {
      min = Math.min(min, 95);
      max = Math.max(max, 105);
    } else {
      min = Math.min(min, -5);
      max = Math.max(max, 10);
    }

    const padding = (max - min) * 0.08;
    const finalMin = Math.floor((min - padding) / 10) * 10;
    const finalMax = Math.ceil((max + padding) / 10) * 10;

    const span = finalMax - finalMin;
    const step = span <= 40 ? 5 : span <= 80 ? 10 : 20;
    const ticks: number[] = [];
    for (let t = finalMin; t <= finalMax; t += step) {
      ticks.push(t);
    }

    return { yMin: finalMin, yMax: finalMax, yTicks: ticks };
  }, [countries, indicator, hiddenCurves]);

  // SVG dimensions
  const width = 850;
  const height = 420;
  const paddingLeft = 55;
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
    const range = yMax - yMin;
    if (range <= 0) return height / 2;
    const ratio = (val - yMin) / range;
    return height - paddingBottom - ratio * chartH;
  };

  // Paths calculations
  const countryPaths = useMemo(() => {
    return countries.map((c, cIdx) => {
      const code = c.country.code;
      const isHidden = hiddenCurves.has(code);
      const color = countryColors[code] || `hsl(${(cIdx * 55) % 360}, 70%, 45%)`;
      let d = '';
      const points: { x: number; y: number; val: number; period: string }[] = [];

      if (!isHidden) {
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
      }

      // Compute last available observation for display badge
      const lastObs = c.observations.length > 0 ? c.observations[c.observations.length - 1] : null;
      const latestVal = lastObs ? getValue(lastObs) : null;

      return {
        country: c.country,
        color,
        d,
        points,
        latestVal,
        isHidden,
      };
    });
  }, [countries, periods, yMin, yMax, indicator, hiddenCurves, countryColors]);

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
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Graphique Comparatif Multi-Pays</span>
            <span className="text-xs font-mono font-medium text-slate-400">
              ({periods.length} trimestres)
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Superposition synchronisée des trajectoires nationales. Comparez directement les prix nominaux et corrigés de l'inflation.
          </p>
        </div>

        {/* Indicator Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => onIndicatorChange('hpi')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              indicator === 'hpi' || indicator === 'both'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI Nominal
          </button>
          <button
            onClick={() => onIndicatorChange('real_hpi')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              indicator === 'real_hpi'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI Réel (Inflation Déduite)
          </button>
          <button
            onClick={() => onIndicatorChange('hicp')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              indicator === 'hicp'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inflation (HICP)
          </button>
        </div>
      </div>

      {/* Selected Countries Badges with Move, Visibility & Exclude Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {countryPaths.map((cp) => {
            const isHidden = cp.isHidden;
            const isHighlighted = highlightedCountry === cp.country.code;

            return (
              <div
                key={cp.country.code}
                onMouseEnter={() => onHoverCountry && onHoverCountry(cp.country.code)}
                onMouseLeave={() => onHoverCountry && onHoverCountry(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs font-medium ${
                  isHidden
                    ? 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-850 text-slate-500'
                    : isHighlighted
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-100 ring-1 ring-blue-400/50 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cp.color }}
                />
                <span>{cp.country.flag}</span>
                <span className="font-semibold">{cp.country.nameFr}</span>

                {cp.latestVal !== null && !isHidden && (
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums ml-0.5">
                    {cp.latestVal.toFixed(1)}
                  </span>
                )}

                {/* Visibility Toggle */}
                {onToggleCurveVisibility && (
                  <button
                    type="button"
                    onClick={() => onToggleCurveVisibility(cp.country.code)}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5 ml-0.5 cursor-pointer"
                    title={isHidden ? 'Afficher la courbe' : 'Masquer la courbe'}
                  >
                    {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                )}

                {/* Exclude Country */}
                {countries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveCountry(cp.country.code)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                    title={`Exclure ${cp.country.nameFr}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={exportSvg}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter SVG</span>
        </button>
      </div>

      {/* Chart Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[480px] overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Y Ticks */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            const isBase = tick === 100 || (indicator === 'spread' && tick === 0);
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

          {/* Base Reference label */}
          <text
            x={width - paddingRight}
            y={getY(indicator === 'spread' ? 0 : 100) - 4}
            textAnchor="end"
            className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold"
          >
            {indicator === 'spread' ? 'ÉQUILIBRE 0' : 'BASE 100'}
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

          {/* Lines (rendered in order: curves later in the array appear on top) */}
          {countryPaths.map((cp) => {
            if (cp.isHidden) return null;
            const isHighlighted = highlightedCountry === cp.country.code;
            const hasAnyHighlight = highlightedCountry !== null;
            const strokeOpacity = hasAnyHighlight ? (isHighlighted ? 1 : 0.22) : 1;
            const strokeWidth = isHighlighted ? 3.8 : cp.country.isAggregate ? 2.8 : 2.2;

            return (
              <g
                key={`cmp-line-${cp.country.code}`}
                style={{ opacity: strokeOpacity }}
                className="transition-opacity duration-150"
              >
                <path
                  d={cp.d}
                  fill="none"
                  stroke={cp.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={cp.country.isAggregate ? '5 3' : undefined}
                />
                {cp.points.length > 0 && (
                  <circle
                    cx={cp.points[cp.points.length - 1].x}
                    cy={cp.points[cp.points.length - 1].y}
                    r={isHighlighted ? 4.5 : 3.2}
                    fill={cp.color}
                    className="stroke-white dark:stroke-slate-900 stroke-1"
                  />
                )}
              </g>
            );
          })}

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
            className="absolute top-4 pointer-events-none z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-xs text-xs space-y-2 transition-all w-64"
            style={{
              left: `${Math.min(75, Math.max(18, (getX(hoverIndex!) / width) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span>Trimestre : {hoveredPeriod}</span>
              <span className="text-[10px] font-mono text-slate-400">
                {indicator === 'real_hpi'
                  ? 'HPI Réel'
                  : indicator === 'hicp'
                  ? 'Inflation HICP'
                  : indicator === 'spread'
                  ? 'Écart'
                  : 'HPI Nominal'}
              </span>
            </div>

            <div className="space-y-1 font-mono max-h-52 overflow-y-auto pr-1">
              {countries
                .filter((c) => !hiddenCurves.has(c.country.code))
                .map((c) => {
                  const obs = c.observations.find((o) => o.period === hoveredPeriod);
                  const val = obs ? getValue(obs) : null;
                  const color = countryColors[c.country.code] || '#64748b';
                  const isHighlighted = highlightedCountry === c.country.code;

                  return (
                    <div
                      key={c.country.code}
                      className={`flex items-center justify-between gap-2 p-0.5 rounded ${
                        isHighlighted ? 'bg-blue-50 dark:bg-blue-950 font-bold' : ''
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span>{c.country.flag}</span>
                        <span className="truncate">{c.country.nameFr}</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
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
