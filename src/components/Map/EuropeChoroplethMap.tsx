/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Vector Choropleth Map of Europe
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  EUROPE_MAP_GEOMETRY,
  MapCountryGeo,
  CountryQuarterStats,
  getStatsForCountryQuarter,
} from '../../data/europeMapGeo';
import { MetricType, ReferenceMode, ColorPaletteType } from './MapTimeControls';

interface EuropeChoroplethMapProps {
  selectedPeriod: string;
  metric: MetricType;
  referenceMode: ReferenceMode;
  palette: ColorPaletteType;
  selectedCountryCode: string | null;
  onSelectCountry: (countryCode: string) => void;
}

export const EuropeChoroplethMap: React.FC<EuropeChoroplethMapProps> = ({
  selectedPeriod,
  metric,
  referenceMode,
  palette,
  selectedCountryCode,
  onSelectCountry,
}) => {
  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<MapCountryGeo | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute stats for all countries for this period
  const countryStatsMap = useMemo(() => {
    const map = new Map<string, CountryQuarterStats>();
    EUROPE_MAP_GEOMETRY.forEach((geo) => {
      map.set(geo.code, getStatsForCountryQuarter(geo.code, selectedPeriod));
    });
    return map;
  }, [selectedPeriod]);

  // Extract values according to active metric and reference mode
  const getCountryValue = (countryCode: string): number => {
    const stats = countryStatsMap.get(countryCode);
    if (!stats) return 0;
    if (referenceMode === 'yoy') {
      return metric === 'real' ? stats.yoyReal : metric === 'nominal' ? stats.yoyNominal : stats.yoyHicp;
    } else if (referenceMode === 'qoq') {
      return metric === 'real' ? stats.qoqReal : stats.qoqNominal;
    } else if (referenceMode === 'cumulative') {
      return metric === 'real' ? stats.cumulativeReal : stats.cumulativeNominal;
    } else {
      return metric === 'real' ? stats.realHpi : metric === 'nominal' ? stats.nominalHpi : stats.hicp;
    }
  };

  // Find min and max for color scale
  const allValues = useMemo(() => {
    return EUROPE_MAP_GEOMETRY.map((g) => getCountryValue(g.code));
  }, [countryStatsMap, metric, referenceMode]);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  // Choropleth color interpolator
  const getChoroplethColor = (val: number): string => {
    if (palette === 'divergent_green_red') {
      // Divergent Green (Positive) / Red (Negative)
      if (val >= 12) return '#047857'; // Vert foncé intense
      if (val >= 6) return '#10b981'; // Vert vif
      if (val >= 2) return '#6ee7b7'; // Vert clair
      if (val >= -1) return '#cbd5e1'; // Gris ardoise neutre (-1 à +2)
      if (val >= -5) return '#fca5a5'; // Rouge pastel
      if (val >= -10) return '#ef4444'; // Rouge soutenu
      return '#991b1b'; // Rouge très sombre
    } else if (palette === 'blue_amber') {
      // Blue (Positive) / Amber (Negative) - Colorblind friendly
      if (val >= 12) return '#1e40af'; // Bleu marine
      if (val >= 6) return '#3b82f6'; // Bleu royal
      if (val >= 2) return '#93c5fd'; // Bleu clair
      if (val >= -1) return '#e2e8f0'; // Neutre
      if (val >= -5) return '#fde68a'; // Jaune ambré
      if (val >= -10) return '#f59e0b'; // Ambre vif
      return '#b45309'; // Ambre sombre
    } else {
      // Thermal Spectrum (Froid vers Chaud)
      if (val >= 12) return '#be123c'; // Magenta chaud
      if (val >= 6) return '#f97316'; // Orange
      if (val >= 2) return '#fbbf24'; // Jaune
      if (val >= -1) return '#e2e8f0'; // Neutre
      if (val >= -5) return '#38bdf8'; // Cyan
      if (val >= -10) return '#2563eb'; // Bleu
      return '#1e1b4b'; // Indigo profond
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(3, z + 0.3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.8, z - 0.3));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Micro-states and islands quick chips
  const islandMicroStates = ['LU', 'MT', 'CY'];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden select-none"
      style={{ minHeight: '520px' }}
    >
      {/* Top Map Toolbar: Zoom, Reset & Indicator info */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          title="Zoom avant (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          title="Zoom arrière (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          title="Réinitialiser la vue"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-slate-400 font-mono px-1">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>

      {/* Floating Interactive Tooltip following mouse */}
      {hoveredCountry && (
        <div
          className="pointer-events-none absolute z-40 p-3 rounded-xl bg-slate-950/95 border border-slate-700 text-white shadow-2xl text-xs space-y-1 backdrop-blur-md transform -translate-x-1/2 -translate-y-full -mt-3 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            minWidth: '180px',
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{hoveredCountry.flag}</span>
              <span className="font-extrabold text-sm">{hoveredCountry.nameFr}</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">{hoveredCountry.code}</span>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">
              {referenceMode === 'yoy'
                ? 'Variation 1 an :'
                : referenceMode === 'qoq'
                ? 'Variation trim. :'
                : referenceMode === 'cumulative'
                ? 'Cumul vs 2015 :'
                : 'Indice :'}
            </span>
            <span
              className={`font-mono font-bold text-sm ${
                getCountryValue(hoveredCountry.code) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {referenceMode !== 'level' && (getCountryValue(hoveredCountry.code) >= 0 ? '+' : '')}
              {getCountryValue(hoveredCountry.code).toFixed(1)}
              {referenceMode !== 'level' && '%'}
            </span>
          </div>

          {countryStatsMap.get(hoveredCountry.code) && (
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
              <span>HPI Réel : {countryStatsMap.get(hoveredCountry.code)?.realHpi.toFixed(1)}</span>
              <span>Nominal : {countryStatsMap.get(hoveredCountry.code)?.nominalHpi.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}

      {/* Main SVG Vector Canvas */}
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-auto max-h-[640px] transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Soft Ocean Grid Background Filter */}
            <pattern id="seaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
            </pattern>

            {/* Glowing selected stroke effect */}
            <filter id="countryGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sea / Ocean Background */}
          <rect width="1000" height="800" fill="#0b1329" />
          <rect width="1000" height="800" fill="url(#seaGrid)" />

          {/* European Country Polygons */}
          <g className="cursor-pointer">
            {EUROPE_MAP_GEOMETRY.map((country) => {
              const val = getCountryValue(country.code);
              const fillColor = getChoroplethColor(val);
              const isSelected = country.code === selectedCountryCode;
              const isHovered = country.code === hoveredCountry?.code;

              return (
                <g key={country.code}>
                  <path
                    d={country.svgPath}
                    fill={fillColor}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#334155'}
                    strokeWidth={isSelected ? 3.5 : isHovered ? 2.0 : 1.0}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="transition-all duration-150"
                    style={{
                      filter: isSelected ? 'drop-shadow(0px 0px 8px #38bdf8)' : undefined,
                      opacity: isHovered || isSelected ? 1 : 0.92,
                    }}
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => onSelectCountry(country.code)}
                  />

                  {/* Centroid Country Code Label (if large enough) */}
                  <text
                    x={country.centroid[0]}
                    y={country.centroid[1]}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="pointer-events-none text-[11px] font-bold font-mono fill-white drop-shadow-sm select-none"
                    style={{
                      fill: isSelected ? '#ffffff' : '#f8fafc',
                      fontWeight: 800,
                      opacity: isHovered || isSelected ? 1 : 0.85,
                    }}
                  >
                    {country.code}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Inset Shortcut Badges for Micro-States / Tiny Islands (Luxembourg, Malta, Cyprus) */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-xs shadow-lg">
        <span className="text-[10px] uppercase font-bold text-slate-400">
          Micro-États & Îles :
        </span>
        <div className="flex items-center gap-1.5">
          {islandMicroStates.map((code) => {
            const geo = EUROPE_MAP_GEOMETRY.find((g) => g.code === code);
            if (!geo) return null;
            const val = getCountryValue(code);
            const isSelected = code === selectedCountryCode;
            return (
              <button
                key={code}
                onClick={() => onSelectCountry(code)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span>{geo.flag}</span>
                <span>{geo.code}</span>
                <span
                  className="w-2 h-2 rounded-full inline-block ml-0.5"
                  style={{ backgroundColor: getChoroplethColor(val) }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Choropleth Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs shadow-lg max-w-xs space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Échelle Choroplèthe</span>
          <span>{referenceMode !== 'level' ? '(%)' : '(Base 100)'}</span>
        </div>

        {/* Color Gradient Bar */}
        <div className="w-48 h-3 rounded-full flex overflow-hidden border border-slate-700">
          {palette === 'divergent_green_red' ? (
            <>
              <div className="flex-1 bg-[#991b1b]" title="< -10%" />
              <div className="flex-1 bg-[#ef4444]" title="-10% à -5%" />
              <div className="flex-1 bg-[#fca5a5]" title="-5% à -1%" />
              <div className="flex-1 bg-[#cbd5e1]" title="-1% à +2%" />
              <div className="flex-1 bg-[#6ee7b7]" title="+2% à +6%" />
              <div className="flex-1 bg-[#10b981]" title="+6% à +12%" />
              <div className="flex-1 bg-[#047857]" title="> +12%" />
            </>
          ) : palette === 'blue_amber' ? (
            <>
              <div className="flex-1 bg-[#b45309]" />
              <div className="flex-1 bg-[#f59e0b]" />
              <div className="flex-1 bg-[#fde68a]" />
              <div className="flex-1 bg-[#e2e8f0]" />
              <div className="flex-1 bg-[#93c5fd]" />
              <div className="flex-1 bg-[#3b82f6]" />
              <div className="flex-1 bg-[#1e40af]" />
            </>
          ) : (
            <>
              <div className="flex-1 bg-[#1e1b4b]" />
              <div className="flex-1 bg-[#2563eb]" />
              <div className="flex-1 bg-[#38bdf8]" />
              <div className="flex-1 bg-[#e2e8f0]" />
              <div className="flex-1 bg-[#fbbf24]" />
              <div className="flex-1 bg-[#f97316]" />
              <div className="flex-1 bg-[#be123c]" />
            </>
          )}
        </div>

        {/* Legend Numbers */}
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>&lt; -10%</span>
          <span>-5%</span>
          <span>0%</span>
          <span>+5%</span>
          <span>&gt; +12%</span>
        </div>
      </div>
    </div>
  );
};
