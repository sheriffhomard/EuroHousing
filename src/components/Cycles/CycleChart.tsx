/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Cycle Chart with Peaks, Troughs, Phase Shading and Recovery Lines
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Maximize2,
  Info,
  Calendar,
  Compass,
} from 'lucide-react';
import {
  CountryCycleAnalysis,
  CycleMetric,
  CyclePoint,
  HistoricalCycle,
} from '../../services/cycleAnalysis';
import { QuarterlyObservation } from '../../data/types';

interface CycleChartProps {
  analysis: CountryCycleAnalysis;
  observations: QuarterlyObservation[];
  metric: CycleMetric;
  onMetricChange: (metric: CycleMetric) => void;
}

export const CycleChart: React.FC<CycleChartProps> = ({
  analysis,
  observations,
  metric,
  onMetricChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showPhases, setShowPhases] = useState<boolean>(true);
  const [showRecoveryLines, setShowRecoveryLines] = useState<boolean>(true);
  const [showPeakMarkers, setShowPeakMarkers] = useState<boolean>(true);

  // Extract valid points
  const points = useMemo(() => {
    return observations
      .map((obs) => {
        const val = metric === 'real' ? obs.realHpi : obs.hpi.total;
        return {
          period: obs.period,
          year: obs.year,
          quarter: obs.quarter,
          val: val ?? null,
        };
      })
      .filter((d): d is { period: string; year: number; quarter: number; val: number } => d.val !== null);
  }, [observations, metric]);

  // Chart bounds & scales
  const chartHeight = 360;
  const padding = { top: 40, right: 35, bottom: 45, left: 55 };

  const { minVal, maxVal, width } = useMemo(() => {
    if (points.length === 0) return { minVal: 80, maxVal: 150, width: 800 };
    const vals = points.map((p) => p.val);
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const pad = (rawMax - rawMin) * 0.12 || 10;
    return {
      minVal: Math.max(0, Math.floor(rawMin - pad)),
      maxVal: Math.ceil(rawMax + pad),
      width: Math.max(700, points.length * 20),
    };
  }, [points]);

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (index / (points.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return padding.top + innerHeight - ((val - minVal) / range) * innerHeight;
  };

  // SVG Path for price line
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, idx) => {
        const x = getX(idx);
        const y = getY(p.val);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points, minVal, maxVal]);

  // Area under price line
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const baseY = getY(minVal);
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    return `${linePath} L ${lastX.toFixed(1)} ${baseY.toFixed(1)} L ${firstX.toFixed(1)} ${baseY.toFixed(1)} Z`;
  }, [linePath, points, minVal]);

  // Phase segments coordinates
  const phaseShadings = useMemo(() => {
    if (!showPhases || points.length === 0) return [];

    return analysis.segments.map((seg, idx) => {
      const startIdx = points.findIndex((p) => p.period === seg.startPeriod);
      const endIdx = points.findIndex((p) => p.period === seg.endPeriod);

      if (startIdx === -1 || endIdx === -1) return null;

      const x1 = getX(startIdx);
      const x2 = getX(endIdx);
      const isExpansion = seg.type === 'expansion';

      return {
        id: `seg-${idx}`,
        x1,
        x2,
        width: Math.max(2, x2 - x1),
        isExpansion,
        segment: seg,
      };
    }).filter(Boolean);
  }, [analysis.segments, points, showPhases]);

  // Peak to recovery horizontal lines
  const recoveryLineElements = useMemo(() => {
    if (!showRecoveryLines || points.length === 0) return [];

    return analysis.cycles.map((cycle) => {
      const peakIdx = points.findIndex((p) => p.period === cycle.peakPeriod);
      if (peakIdx === -1) return null;

      const peakX = getX(peakIdx);
      const peakY = getY(cycle.peakValue);

      let endX = peakX;
      let isRecovered = cycle.isRecovered;

      if (isRecovered && cycle.recoveryPeriod) {
        const recIdx = points.findIndex((p) => p.period === cycle.recoveryPeriod);
        if (recIdx !== -1) {
          endX = getX(recIdx);
        }
      } else {
        // Line extends to the latest observation
        endX = getX(points.length - 1);
      }

      return {
        id: `rec-${cycle.id}`,
        startX: peakX,
        endX,
        y: peakY,
        peakPeriod: cycle.peakPeriod,
        recoveryPeriod: cycle.recoveryPeriod,
        isRecovered,
        maxDrawdown: cycle.maxDrawdownPercent,
        quarters: cycle.isRecovered ? cycle.recoveryDurationQuarters : analysis.quartersSinceLastPeak,
      };
    }).filter(Boolean);
  }, [analysis.cycles, analysis.quartersSinceLastPeak, points, showRecoveryLines]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const count = 5;
    const step = (maxVal - minVal) / count;
    const ticks: number[] = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(Math.round(minVal + i * step));
    }
    return ticks;
  }, [minVal, maxVal]);

  // Mouse move handler for crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    // Find nearest point
    let nearestIdx = 0;
    let minDistance = Infinity;
    points.forEach((p, idx) => {
      const px = getX(idx);
      const dist = Math.abs(px - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    setHoverIndex(nearestIdx);
  };

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{analysis.country.flag}</span>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Trajectoire & Points de Retournement — {analysis.country.nameFr}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identification des sommets (▲), des creux (▼) et des lignes de rattrapage depuis 2010.
          </p>
        </div>

        {/* Metric Switcher (Real vs Nominal) */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => onMetricChange('real')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                metric === 'real'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              HPI Réel (Net Inflation)
            </button>
            <button
              onClick={() => onMetricChange('nominal')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                metric === 'nominal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              HPI Nominal (Prix Bruts)
            </button>
          </div>
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 flex-wrap">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Affichage :
        </span>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white">
          <input
            type="checkbox"
            checked={showPhases}
            onChange={(e) => setShowPhases(e.target.checked)}
            className="rounded-sm text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/40 border border-emerald-500" />
            <span>Phases de Hausse / Baisse</span>
          </span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white">
          <input
            type="checkbox"
            checked={showRecoveryLines}
            onChange={(e) => setShowRecoveryLines(e.target.checked)}
            className="rounded-sm text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-t border-dashed border-amber-500" />
            <span>Lignes de Recouvrement (Peak-to-Recovery)</span>
          </span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white">
          <input
            type="checkbox"
            checked={showPeakMarkers}
            onChange={(e) => setShowPeakMarkers(e.target.checked)}
            className="rounded-sm text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1">
            <span className="text-emerald-500 font-bold">▲</span>
            <span className="text-rose-500 font-bold">▼</span>
            <span>Marqueurs Sommets & Creux</span>
          </span>
        </label>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800"
      >
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Gradient under curve */}
            <linearGradient id="cycleCurveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>

            {/* Pattern for contraction shading */}
            <pattern id="contractionStripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.1" />
            </pattern>
          </defs>

          {/* Phase Background Shading */}
          {phaseShadings.map((p) => {
            if (!p) return null;
            return (
              <g key={p.id}>
                <rect
                  x={p.x1}
                  y={padding.top}
                  width={p.width}
                  height={innerHeight}
                  fill={p.isExpansion ? '#10b981' : '#ef4444'}
                  fillOpacity={p.isExpansion ? 0.06 : 0.08}
                />
                {/* Subtle top indicator bar */}
                <rect
                  x={p.x1}
                  y={padding.top}
                  width={p.width}
                  height={3}
                  fill={p.isExpansion ? '#10b981' : '#ef4444'}
                  fillOpacity={0.8}
                />
              </g>
            );
          })}

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
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Base 100 Horizontal Highlight */}
          {minVal <= 100 && maxVal >= 100 && (
            <line
              x1={padding.left}
              y1={getY(100)}
              x2={width - padding.right}
              y2={getY(100)}
              stroke="#64748b"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              strokeOpacity="0.7"
            />
          )}

          {/* Area fill */}
          <path d={areaPath} fill="url(#cycleCurveGradient)" />

          {/* Peak-to-Recovery Horizontal Dashed Lines */}
          {recoveryLineElements.map((rec) => {
            if (!rec) return null;
            return (
              <g key={rec.id}>
                {/* Horizontal reference line */}
                <line
                  x1={rec.startX}
                  y1={rec.y}
                  x2={rec.endX}
                  y2={rec.y}
                  stroke={rec.isRecovered ? '#059669' : '#d97706'}
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                />
                {/* Badge showing recovery time or drop */}
                <rect
                  x={(rec.startX + rec.endX) / 2 - 45}
                  y={rec.y - 18}
                  width={90}
                  height={15}
                  rx="3"
                  fill="#0f172a"
                  fillOpacity="0.85"
                />
                <text
                  x={(rec.startX + rec.endX) / 2}
                  y={rec.y - 7}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-amber-300 font-bold"
                >
                  {rec.isRecovered
                    ? `Recouvré : ${rec.quarters} T`
                    : `Baisse : ${rec.maxDrawdown}% (${rec.quarters} T)`}
                </text>
              </g>
            );
          })}

          {/* Main Price Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="dark:stroke-blue-400"
          />

          {/* Peaks and Troughs Markers */}
          {showPeakMarkers && (
            <>
              {/* Peaks (▲) */}
              {analysis.peaks.map((peak) => {
                const idx = points.findIndex((p) => p.period === peak.period);
                if (idx === -1) return null;
                const px = getX(idx);
                const py = getY(peak.value);

                return (
                  <g key={`peak-${peak.period}`} className="cursor-pointer group">
                    <circle
                      cx={px}
                      cy={py}
                      r={peak.isAllTimeHigh ? 6 : 4.5}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    {/* Badge */}
                    <path
                      d={`M ${px} ${py - 8} L ${px - 5} ${py - 16} L ${px + 5} ${py - 16} Z`}
                      fill="#ef4444"
                    />
                    <rect
                      x={px - 34}
                      y={py - 30}
                      width={68}
                      height={14}
                      rx="3"
                      fill="#991b1b"
                      className="shadow-sm"
                    />
                    <text
                      x={px}
                      y={py - 20}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-white font-extrabold"
                    >
                      ▲ {peak.period.replace('-Q', 'T')}
                    </text>
                  </g>
                );
              })}

              {/* Troughs (▼) */}
              {analysis.troughs.map((trough) => {
                const idx = points.findIndex((p) => p.period === trough.period);
                if (idx === -1) return null;
                const tx = getX(idx);
                const ty = getY(trough.value);

                return (
                  <g key={`trough-${trough.period}`} className="cursor-pointer group">
                    <circle
                      cx={tx}
                      cy={ty}
                      r={4.5}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <rect
                      x={tx - 34}
                      y={ty + 14}
                      width={68}
                      height={14}
                      rx="3"
                      fill="#065f46"
                      className="shadow-sm"
                    />
                    <text
                      x={tx}
                      y={ty + 24}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-white font-extrabold"
                    >
                      ▼ {trough.period.replace('-Q', 'T')}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* X-axis ticks (Year marks) */}
          {points.map((p, idx) => {
            if (p.quarter !== 1) return null;
            const x = getX(idx);
            return (
              <g key={p.period}>
                <line
                  x1={x}
                  y1={chartHeight - padding.bottom}
                  x2={x}
                  y2={chartHeight - padding.bottom + 5}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartHeight - padding.bottom + 18}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-500 font-bold"
                >
                  {p.year}
                </text>
              </g>
            );
          })}

          {/* Interactive Hover Crosshair */}
          {hoveredPoint && hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={chartHeight - padding.bottom}
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(hoveredPoint.val)}
                r={5.5}
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip card */}
        {hoveredPoint && hoverIndex !== null && (
          <div
            className="pointer-events-none absolute z-20 p-2.5 rounded-xl bg-slate-950/90 text-white border border-slate-700 shadow-xl backdrop-blur-md text-xs space-y-1"
            style={{
              left: `${Math.min(width - 170, Math.max(10, getX(hoverIndex) - 80))}px`,
              top: '15px',
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
              <span className="font-extrabold font-mono text-blue-400">
                {hoveredPoint.period.replace('-Q', ' T')}
              </span>
              <span className="text-[10px] text-slate-400">
                {metric === 'real' ? 'HPI Réel' : 'HPI Nominal'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-slate-400">Indice :</span>
              <span className="font-mono font-bold text-sm text-white">
                {hoveredPoint.val.toFixed(1)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4 text-[11px]">
              <span className="text-slate-400">Écart au sommet :</span>
              <span
                className={`font-mono font-semibold ${
                  hoveredPoint.val >= analysis.allTimeHighValue
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {hoveredPoint.val >= analysis.allTimeHighValue
                  ? 'Record (0%)'
                  : `${(((hoveredPoint.val - analysis.allTimeHighValue) / analysis.allTimeHighValue) * 100).toFixed(1)}%`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Interpretive Guide */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500/20 border border-emerald-500" />
            <span>Phase de Hausse (Expansion)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500/20 border border-rose-500" />
            <span>Phase de Baisse (Correction)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-500 font-extrabold">▲</span>
            <span>Sommet de cycle (Pic)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-extrabold">▼</span>
            <span>Point bas (Creux)</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Base 2015 = 100 · Données trimestrielles Eurostat
        </div>
      </div>
    </div>
  );
};
