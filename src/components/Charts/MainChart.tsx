/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Download, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { CountryTimeSeries, IndicatorMode } from '../../data/types';

interface MainChartProps {
  series: CountryTimeSeries;
  indicator: IndicatorMode;
  onIndicatorChange: (ind: IndicatorMode) => void;
}

interface SeriesDef {
  key: string;
  name: string;
  color: string;
  strokeDash?: string;
  getValue: (obs: CountryTimeSeries['observations'][0]) => number | null;
  enabled: boolean;
}

export const MainChart: React.FC<MainChartProps> = ({
  series,
  indicator,
  onIndicatorChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Series visibility state
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const observations = series.observations;

  // Define active series depending on indicator mode
  const seriesDefs = useMemo<SeriesDef[]>(() => {
    const list: SeriesDef[] = [];

    if (indicator === 'both' || indicator === 'hpi') {
      list.push({
        key: 'hpi',
        name: 'HPI Nominal (Prix Logements)',
        color: '#2563eb', // Blue 600
        getValue: (o) => o.hpi.total,
        enabled: !hiddenSeries['hpi'],
      });
    }

    if (indicator === 'both' || indicator === 'hicp') {
      list.push({
        key: 'hicp',
        name: 'HICP (Inflation Consommation)',
        color: '#f59e0b', // Amber 500
        strokeDash: '4 4',
        getValue: (o) => o.hicp,
        enabled: !hiddenSeries['hicp'],
      });
    }

    if (indicator === 'both' || indicator === 'real_hpi') {
      list.push({
        key: 'real_hpi',
        name: 'HPI Réel (Prix corrigés inflation)',
        color: '#059669', // Emerald 600
        getValue: (o) => o.realHpi,
        enabled: !hiddenSeries['real_hpi'],
      });
    }

    if (indicator === 'dwellings') {
      list.push({
        key: 'dw_total',
        name: 'Tous logements (Total)',
        color: '#2563eb',
        getValue: (o) => o.hpi.total,
        enabled: !hiddenSeries['dw_total'],
      });
      list.push({
        key: 'dw_new',
        name: 'Logements neufs (DW_NEW)',
        color: '#6366f1', // Indigo 500
        strokeDash: '5 3',
        getValue: (o) => o.hpi.new,
        enabled: !hiddenSeries['dw_new'],
      });
      list.push({
        key: 'dw_exst',
        name: 'Logements existants (DW_EXST)',
        color: '#0d9488', // Teal 600
        getValue: (o) => o.hpi.existing,
        enabled: !hiddenSeries['dw_exst'],
      });
    }

    return list;
  }, [indicator, hiddenSeries]);

  // Compute bounding box for Y scale
  const { yMin, yMax, yTicks } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const obs of observations) {
      for (const s of seriesDefs) {
        if (!s.enabled) continue;
        const v = s.getValue(obs);
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

    // Always include 100 as reference base line
    min = Math.min(min, 95);
    max = Math.max(max, 105);

    // Add padding
    const padding = (max - min) * 0.08;
    const finalMin = Math.floor((min - padding) / 10) * 10;
    const finalMax = Math.ceil((max + padding) / 10) * 10;

    // Generate nice ticks
    const step = finalMax - finalMin <= 60 ? 10 : 20;
    const ticks: number[] = [];
    for (let t = finalMin; t <= finalMax; t += step) {
      ticks.push(t);
    }

    return { yMin: finalMin, yMax: finalMax, yTicks: ticks };
  }, [observations, seriesDefs]);

  // SVG Geometry Dimensions
  const width = 800;
  const height = 380;
  const paddingLeft = 50;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (observations.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (index / (observations.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin);
    return height - paddingBottom - ratio * chartH;
  };

  // Generate SVG path strings
  const paths = useMemo(() => {
    return seriesDefs.map((s) => {
      if (!s.enabled) return { ...s, d: '', points: [] };

      let d = '';
      const points: { x: number; y: number; val: number; index: number }[] = [];

      observations.forEach((obs, idx) => {
        const val = s.getValue(obs);
        if (val !== null && !isNaN(val)) {
          const x = getX(idx);
          const y = getY(val);
          points.push({ x, y, val, index: idx });

          if (d === '') {
            d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          } else {
            d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }
        }
      });

      return {
        ...s,
        d,
        points,
      };
    });
  }, [observations, seriesDefs, yMin, yMax]);

  // X Axis Ticks (show ~6-8 labels evenly spaced)
  const xTicks = useMemo(() => {
    if (observations.length === 0) return [];
    const count = Math.min(8, observations.length);
    const step = Math.max(1, Math.floor(observations.length / (count - 1)));
    const ticks: { index: number; label: string; x: number }[] = [];

    for (let i = 0; i < observations.length; i += step) {
      ticks.push({
        index: i,
        label: observations[i].period,
        x: getX(i),
      });
    }

    // Always include last if not close
    const lastIdx = observations.length - 1;
    if (ticks[ticks.length - 1]?.index !== lastIdx) {
      ticks.push({
        index: lastIdx,
        label: observations[lastIdx].period,
        x: getX(lastIdx),
      });
    }

    return ticks;
  }, [observations]);

  // Mouse move handler for crosshair
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
    const closestIdx = Math.round(ratio * (observations.length - 1));
    const boundedIdx = Math.max(0, Math.min(observations.length - 1, closestIdx));
    setHoverIndex(boundedIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Download SVG
  const exportSvg = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eurostat-${series.country.code}-${indicator}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hoveredObs = hoverIndex !== null ? observations[hoverIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{series.country.flag}</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Évolution Temporelle — {series.country.nameFr}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Série trimestrielle Eurostat (Base 100 = 2015 ou rebasée).
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto no-scrollbar">
          <button
            onClick={() => onIndicatorChange('both')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              indicator === 'both'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI vs Inflation
          </button>
          <button
            onClick={() => onIndicatorChange('real_hpi')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              indicator === 'real_hpi'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI Réel
          </button>
          <button
            onClick={() => onIndicatorChange('hpi')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              indicator === 'hpi'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI Seul
          </button>
          <button
            onClick={() => onIndicatorChange('hicp')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              indicator === 'hicp'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inflation Seule
          </button>
          <button
            onClick={() => onIndicatorChange('dwellings')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              indicator === 'dwellings'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Neuf / Existant
          </button>
        </div>
      </div>

      {/* Interactive Legend & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-slate-400 text-[11px]">Séries (cliquer pour masquer) :</span>
          {seriesDefs.map((s) => {
            const isEnabled = s.enabled;
            return (
              <button
                key={s.key}
                onClick={() => toggleSeries(s.key)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  isEnabled
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    : 'border-dashed border-slate-300 dark:border-slate-700 opacity-50 line-through text-slate-400'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-medium">{s.name}</span>
                {isEnabled ? <Eye className="w-3 h-3 text-slate-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={exportSvg}
          className="flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title="Exporter le graphique vectoriel SVG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter SVG</span>
        </button>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[460px] overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Y Grid Lines & Labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            const isBase = tick === 100;
            return (
              <g key={`ytick-${tick}`}>
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

          {/* Base 100 watermark badge */}
          <text
            x={width - paddingRight}
            y={getY(100) - 4}
            textAnchor="end"
            className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold"
          >
            BASE 100
          </text>

          {/* X Axis Line */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            className="stroke-slate-200 dark:stroke-slate-800 stroke-1"
          />

          {/* X Axis Ticks & Labels */}
          {xTicks.map((tick) => (
            <g key={`xtick-${tick.index}`}>
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

          {/* Data Lines */}
          {paths.map((p) => {
            if (!p.enabled || !p.d) return null;
            return (
              <g key={`path-${p.key}`}>
                <path
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth="2.5"
                  strokeDasharray={p.strokeDash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Endpoint circle indicator */}
                {p.points.length > 0 && (
                  <circle
                    cx={p.points[p.points.length - 1].x}
                    cy={p.points[p.points.length - 1].y}
                    r="4"
                    fill={p.color}
                    className="stroke-white dark:stroke-slate-900 stroke-2"
                  />
                )}
              </g>
            );
          })}

          {/* Crosshair on Hover */}
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

              {/* Data points along crosshair */}
              {seriesDefs.map((s) => {
                if (!s.enabled) return null;
                const val = s.getValue(observations[hoverIndex]);
                if (val === null) return null;
                return (
                  <circle
                    key={`hover-pt-${s.key}`}
                    cx={getX(hoverIndex)}
                    cy={getY(val)}
                    r="5"
                    fill={s.color}
                    className="stroke-white dark:stroke-slate-900 stroke-2 shadow-lg"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredObs && (
          <div
            className="absolute top-4 pointer-events-none z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xl backdrop-blur-xs text-xs space-y-1.5 transition-all max-w-xs"
            style={{
              left: `${Math.min(
                75,
                Math.max(10, (getX(hoverIndex!) / width) * 100)
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center justify-between gap-3">
              <span>{hoveredObs.period}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {series.country.flag} {series.country.code}
              </span>
            </div>

            <div className="space-y-1 font-mono">
              {seriesDefs.map((s) => {
                if (!s.enabled) return null;
                const val = s.getValue(hoveredObs);
                return (
                  <div key={s.key} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="truncate">{s.name.split(' ')[0]}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {val !== null ? val.toFixed(1) : '—'}
                    </span>
                  </div>
                );
              })}

              {hoveredObs.hpiYoY !== null && hoveredObs.hpiYoY !== undefined && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] flex items-center justify-between text-slate-500">
                  <span>HPI YoY :</span>
                  <span className={hoveredObs.hpiYoY > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                    {hoveredObs.hpiYoY > 0 ? `+${hoveredObs.hpiYoY}%` : `${hoveredObs.hpiYoY}%`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
