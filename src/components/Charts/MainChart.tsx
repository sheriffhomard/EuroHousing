/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Main Time Series Chart
 * Supports the four distinct indicators:
 * - HPI nominal : Évolution des prix immobiliers
 * - HPI réel : Évolution des prix relativement à l'inflation générale
 * - Variation annuelle : Évolution sur les quatre derniers trimestres
 * - Variation cumulée : Évolution depuis une date de référence
 */

import React, { useState, useMemo, useRef } from 'react';
import { Download, Eye, EyeOff, Maximize2, Info } from 'lucide-react';
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
  unit?: string;
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
  const isPercentageMode = indicator === 'yoy' || indicator === 'cumulative';

  // Define active series depending on indicator mode
  const seriesDefs = useMemo<SeriesDef[]>(() => {
    const list: SeriesDef[] = [];

    if (indicator === 'hpi') {
      list.push({
        key: 'hpi',
        name: 'HPI nominal (Prix Immobiliers)',
        color: '#2563eb', // Blue 600
        getValue: (o) => o.hpi.total,
        enabled: !hiddenSeries['hpi'],
        unit: 'pts',
      });
    } else if (indicator === 'real_hpi') {
      list.push({
        key: 'real_hpi',
        name: 'HPI réel (Prix relatif à l\'inflation)',
        color: '#059669', // Emerald 600
        getValue: (o) => o.realHpi,
        enabled: !hiddenSeries['real_hpi'],
        unit: 'pts',
      });
    } else if (indicator === 'yoy') {
      list.push({
        key: 'hpi_yoy',
        name: 'Variation annuelle nominale (HPI YoY)',
        color: '#2563eb',
        getValue: (o) => o.hpiYoY ?? null,
        enabled: !hiddenSeries['hpi_yoy'],
        unit: '%',
      });
      list.push({
        key: 'real_hpi_yoy',
        name: 'Variation annuelle réelle (Net inflation YoY)',
        color: '#059669',
        strokeDash: '4 3',
        getValue: (o) => o.realHpiYoY ?? null,
        enabled: !hiddenSeries['real_hpi_yoy'],
        unit: '%',
      });
      list.push({
        key: 'hicp_yoy',
        name: 'Inflation annuelle (HICP YoY)',
        color: '#f59e0b',
        strokeDash: '2 2',
        getValue: (o) => o.hicpYoY ?? null,
        enabled: !hiddenSeries['hicp_yoy'],
        unit: '%',
      });
    } else if (indicator === 'cumulative') {
      list.push({
        key: 'hpi_cum',
        name: 'Variation cumulée nominale (HPI)',
        color: '#2563eb',
        getValue: (o) => o.cumulativeHpiGrowth ?? null,
        enabled: !hiddenSeries['hpi_cum'],
        unit: '%',
      });
      list.push({
        key: 'real_cum',
        name: 'Variation cumulée réelle (Net inflation)',
        color: '#059669',
        strokeDash: '4 3',
        getValue: (o) => o.cumulativeRealGrowth ?? null,
        enabled: !hiddenSeries['real_cum'],
        unit: '%',
      });
      list.push({
        key: 'hicp_cum',
        name: 'Inflation cumulée (HICP)',
        color: '#f59e0b',
        strokeDash: '2 2',
        getValue: (o) => o.cumulativeHicpGrowth ?? null,
        enabled: !hiddenSeries['hicp_cum'],
        unit: '%',
      });
    } else if (indicator === 'both') {
      list.push({
        key: 'hpi',
        name: 'HPI nominal (Prix Logements)',
        color: '#2563eb',
        getValue: (o) => o.hpi.total,
        enabled: !hiddenSeries['hpi'],
        unit: 'pts',
      });
      list.push({
        key: 'hicp',
        name: 'HICP (Inflation Consommation)',
        color: '#f59e0b',
        strokeDash: '4 4',
        getValue: (o) => o.hicp,
        enabled: !hiddenSeries['hicp'],
        unit: 'pts',
      });
      list.push({
        key: 'real_hpi',
        name: 'HPI réel (Prix relatif à l\'inflation)',
        color: '#059669',
        strokeDash: '2 2',
        getValue: (o) => o.realHpi,
        enabled: !hiddenSeries['real_hpi'],
        unit: 'pts',
      });
    } else if (indicator === 'hicp') {
      list.push({
        key: 'hicp',
        name: 'HICP (Inflation Consommation)',
        color: '#f59e0b',
        getValue: (o) => o.hicp,
        enabled: !hiddenSeries['hicp'],
        unit: 'pts',
      });
    } else if (indicator === 'dwellings') {
      list.push({
        key: 'dw_total',
        name: 'Tous logements (Total)',
        color: '#2563eb',
        getValue: (o) => o.hpi.total,
        enabled: !hiddenSeries['dw_total'],
        unit: 'pts',
      });
      list.push({
        key: 'dw_new',
        name: 'Logements neufs (DW_NEW)',
        color: '#6366f1',
        strokeDash: '5 3',
        getValue: (o) => o.hpi.new,
        enabled: !hiddenSeries['dw_new'],
        unit: 'pts',
      });
      list.push({
        key: 'dw_exst',
        name: 'Logements existants (DW_EXST)',
        color: '#0d9488',
        getValue: (o) => o.hpi.existing,
        enabled: !hiddenSeries['dw_exst'],
        unit: 'pts',
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
      min = isPercentageMode ? -5 : 80;
      max = isPercentageMode ? 15 : 140;
    }

    if (isPercentageMode) {
      // Percentage scaling (anchor around 0%)
      min = Math.min(min, -2);
      max = Math.max(max, 5);
      const span = max - min;
      const pad = Math.max(2, span * 0.1);
      const finalMin = Math.floor((min - pad) / 5) * 5;
      const finalMax = Math.ceil((max + pad) / 5) * 5;
      const step = Math.max(2, Math.ceil((finalMax - finalMin) / 6));
      const ticks: number[] = [];
      for (let t = finalMin; t <= finalMax; t += step) {
        ticks.push(t);
      }
      return { yMin: finalMin, yMax: finalMax, yTicks: ticks };
    } else {
      // Index scaling (anchor around 100)
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
    }
  }, [observations, seriesDefs, isPercentageMode]);

  // SVG Geometry Dimensions
  const width = 800;
  const height = 380;
  const paddingLeft = 55;
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
    const range = yMax - yMin;
    if (range <= 0) return paddingTop + chartH / 2;
    const ratio = (val - yMin) / range;
    return paddingTop + chartH - ratio * chartH;
  };

  // Build SVG Paths for active series
  const paths = useMemo(() => {
    return seriesDefs.map((s) => {
      if (!s.enabled) return { ...s, d: '', points: [] };

      const pts: { x: number; y: number; val: number; obs: (typeof observations)[0] }[] = [];
      let d = '';

      observations.forEach((obs, idx) => {
        const val = s.getValue(obs);
        if (val !== null && !isNaN(val)) {
          const x = getX(idx);
          const y = getY(val);
          pts.push({ x, y, val, obs });

          if (d === '') {
            d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          } else {
            d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }
        }
      });

      return {
        ...s,
        d,
        points: pts,
      };
    });
  }, [observations, seriesDefs, yMin, yMax]);

  // X Axis Ticks
  const xTicks = useMemo(() => {
    if (observations.length === 0) return [];

    const ticks: { index: number; label: string; x: number }[] = [];
    const interval = Math.max(1, Math.floor(observations.length / 8));

    for (let i = 0; i < observations.length; i += interval) {
      ticks.push({
        index: i,
        label: observations[i].period,
        x: getX(i),
      });
    }

    const lastIdx = observations.length - 1;
    if (ticks.length > 0 && ticks[ticks.length - 1].index !== lastIdx) {
      ticks.push({
        index: lastIdx,
        label: observations[lastIdx].period,
        x: getX(lastIdx),
      });
    }

    return ticks;
  }, [observations]);

  // Mouse Move Interaction for Tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || observations.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    let closestIdx = 0;
    let minDiff = Infinity;

    for (let i = 0; i < observations.length; i++) {
      const px = getX(i);
      const diff = Math.abs(px - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const hoveredObs = hoverIndex !== null ? observations[hoverIndex] : null;

  // Export SVG to PNG
  const exportChart = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.download = `graphique_${series.country.code}_${indicator}_${Date.now()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header: Title, Distinct Indicators Tabs & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{series.country.flag}</span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Évolution Temporelle — {series.country.nameFr}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {indicator === 'hpi' && 'HPI nominal : Évolution des prix immobiliers bruts de transaction.'}
            {indicator === 'real_hpi' && 'HPI réel : Évolution des prix relativement à l\'inflation générale.'}
            {indicator === 'yoy' && 'Variation annuelle : Évolution sur les quatre derniers trimestres (YoY en %).'}
            {indicator === 'cumulative' && 'Variation cumulée : Évolution en % depuis la date de référence.'}
            {indicator === 'both' && 'Vue comparée : HPI nominal, Inflation HICP et HPI réel sur la même échelle.'}
            {indicator === 'dwellings' && 'Marché segmenté : Logements neufs vs Logements existants.'}
            {indicator === 'hicp' && 'Inflation générale : Indice harmonisé des prix à la consommation (IPCH/HICP).'}
          </p>
        </div>

        {/* View Switcher Tabs - The Four Distinct Indicators + Secondary Views */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onIndicatorChange('hpi')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              indicator === 'hpi'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI nominal
          </button>
          <button
            onClick={() => onIndicatorChange('real_hpi')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              indicator === 'real_hpi'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HPI réel
          </button>
          <button
            onClick={() => onIndicatorChange('yoy')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              indicator === 'yoy'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Variation annuelle
          </button>
          <button
            onClick={() => onIndicatorChange('cumulative')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              indicator === 'cumulative'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Variation cumulée
          </button>
          <button
            onClick={() => onIndicatorChange('both')}
            className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              indicator === 'both'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Comparée
          </button>
        </div>
      </div>

      {/* Interactive Legend & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-slate-400 text-[11px]">Séries actives :</span>
          {seriesDefs.map((s) => {
            const isEnabled = s.enabled;
            return (
              <button
                key={s.key}
                onClick={() => toggleSeries(s.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                  isEnabled
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    : 'border-dashed border-slate-300 dark:border-slate-700 opacity-50 line-through text-slate-400'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-semibold">{s.name}</span>
                {isEnabled ? <Eye className="w-3 h-3 text-slate-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={exportChart}
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title="Exporter le graphique au format PNG haute résolution"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Image PNG</span>
        </button>
      </div>

      {/* SVG Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{ minHeight: `${height}px` }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Horizontal Grid Lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={`ytick-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="stroke-slate-100 dark:stroke-slate-800/80 stroke-1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 tabular-nums"
                >
                  {isPercentageMode ? (tick > 0 ? `+${tick}%` : `${tick}%`) : tick}
                </text>
              </g>
            );
          })}

          {/* Reference Line: 0% in percentage mode or 100 in index mode */}
          {isPercentageMode ? (
            yMin <= 0 && yMax >= 0 && (
              <g>
                <line
                  x1={paddingLeft}
                  y1={getY(0)}
                  x2={width - paddingRight}
                  y2={getY(0)}
                  className="stroke-slate-400 dark:stroke-slate-500 stroke-1"
                  strokeDasharray="4 2"
                />
                <text
                  x={width - paddingRight}
                  y={getY(0) - 4}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-bold"
                >
                  0.0% (LIGNE NEUTRE)
                </text>
              </g>
            )
          ) : (
            yMin <= 100 && yMax >= 100 && (
              <g>
                <line
                  x1={paddingLeft}
                  y1={getY(100)}
                  x2={width - paddingRight}
                  y2={getY(100)}
                  className="stroke-slate-400 dark:stroke-slate-500 stroke-1"
                  strokeDasharray="4 2"
                />
                <text
                  x={width - paddingRight}
                  y={getY(100) - 4}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold"
                >
                  BASE 100
                </text>
              </g>
            )
          )}

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

          {/* Hover Guides */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={height - paddingBottom}
                className="stroke-slate-400 dark:stroke-slate-500 stroke-1"
                strokeDasharray="3 3"
              />
              {seriesDefs.map((s) => {
                if (!s.enabled) return null;
                const val = s.getValue(observations[hoverIndex]);
                if (val === null || isNaN(val)) return null;
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
        {hoveredObs && hoverIndex !== null && (
          <div
            className="absolute top-4 pointer-events-none z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-xs text-xs space-y-1.5 transition-all max-w-xs"
            style={{
              left: `${Math.min(
                75,
                Math.max(12, (getX(hoverIndex) / width) * 100)
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center justify-between gap-3">
              <span className="font-mono">{hoveredObs.period.replace('-Q', ' T')}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {series.country.flag} {series.country.code}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              {seriesDefs.map((s) => {
                if (!s.enabled) return null;
                const val = s.getValue(hoveredObs);
                return (
                  <div key={s.key} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="truncate max-w-[130px]">{s.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {val !== null
                        ? isPercentageMode
                          ? val > 0
                            ? `+${val.toFixed(1)}%`
                            : `${val.toFixed(1)}%`
                          : val.toFixed(1)
                        : '—'}
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
