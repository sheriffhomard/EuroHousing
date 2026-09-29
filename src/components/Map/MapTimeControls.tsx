/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Time, Indicator & Reference Controls for European Choropleth Map
 */

import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Palette,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { MAP_TIMELINE_QUARTERS } from '../../data/europeMapGeo';

export type MetricType = 'real' | 'nominal' | 'inflation';
export type ReferenceMode = 'yoy' | 'qoq' | 'cumulative' | 'level';
export type ColorPaletteType = 'divergent_green_red' | 'blue_amber' | 'thermal';

interface MapTimeControlsProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  metric: MetricType;
  onMetricChange: (metric: MetricType) => void;
  referenceMode: ReferenceMode;
  onReferenceModeChange: (mode: ReferenceMode) => void;
  palette: ColorPaletteType;
  onPaletteChange: (palette: ColorPaletteType) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MapTimeControls: React.FC<MapTimeControlsProps> = ({
  selectedPeriod,
  onPeriodChange,
  metric,
  onMetricChange,
  referenceMode,
  onReferenceModeChange,
  palette,
  onPaletteChange,
  isPlaying,
  onTogglePlay,
}) => {
  const currentIndex = MAP_TIMELINE_QUARTERS.indexOf(selectedPeriod);
  const safeIndex = currentIndex !== -1 ? currentIndex : MAP_TIMELINE_QUARTERS.length - 1;

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      const nextIndex = (safeIndex + 1) % MAP_TIMELINE_QUARTERS.length;
      onPeriodChange(MAP_TIMELINE_QUARTERS[nextIndex]);
    }, 900);

    return () => clearInterval(timer);
  }, [isPlaying, safeIndex, onPeriodChange]);

  const handlePrev = () => {
    if (safeIndex > 0) {
      onPeriodChange(MAP_TIMELINE_QUARTERS[safeIndex - 1]);
    }
  };

  const handleNext = () => {
    if (safeIndex < MAP_TIMELINE_QUARTERS.length - 1) {
      onPeriodChange(MAP_TIMELINE_QUARTERS[safeIndex + 1]);
    }
  };

  const handleResetToLatest = () => {
    onPeriodChange(MAP_TIMELINE_QUARTERS[MAP_TIMELINE_QUARTERS.length - 1]);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Top Row: Metric & Reference Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        {/* Metric Selector (Real vs Nominal vs Inflation) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Indicateur Cartographié</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => onMetricChange('real')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                metric === 'real'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              HPI Réel (Corrigé Inflation)
            </button>
            <button
              onClick={() => onMetricChange('nominal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                metric === 'nominal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              HPI Nominal (Prix Bruts)
            </button>
            <button
              onClick={() => onMetricChange('inflation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                metric === 'inflation'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Inflation (HICP)
            </button>
          </div>
        </div>

        {/* Reference Horizon Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-indigo-500" />
            <span>Période de Référence / Mode de Calcul</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => onReferenceModeChange('yoy')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                referenceMode === 'yoy'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Sur 1 an (YoY)
            </button>
            <button
              onClick={() => onReferenceModeChange('qoq')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                referenceMode === 'qoq'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Sur 1 trimestre (QoQ)
            </button>
            <button
              onClick={() => onReferenceModeChange('cumulative')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                referenceMode === 'cumulative'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Cumulé (Base 2015)
            </button>
            <button
              onClick={() => onReferenceModeChange('level')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                referenceMode === 'level'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Niveau Indice
            </button>
          </div>
        </div>

        {/* Palette Selector */}
        <div className="space-y-1 self-start md:self-auto">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-teal-500" />
            <span>Nuancier</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => onPaletteChange('divergent_green_red')}
              className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition cursor-pointer ${
                palette === 'divergent_green_red'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Vert (Hausse) / Rouge (Baisse)"
            >
              Vert/Rouge
            </button>
            <button
              onClick={() => onPaletteChange('blue_amber')}
              className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition cursor-pointer ${
                palette === 'blue_amber'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Bleu (Hausse) / Ambre (Baisse) - Adapté daltonisme"
            >
              Bleu/Ambre
            </button>
            <button
              onClick={() => onPaletteChange('thermal')}
              className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition cursor-pointer ${
                palette === 'thermal'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Spectre Thermique"
            >
              Thermique
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Timeline Slider & Interactive Time-Lapse Player */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {/* Controls: Play, Prev, Next, Reset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={isPlaying ? 'Mettre en pause' : 'Lancer le time-lapse historique'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Animation'}</span>
            </button>

            <button
              onClick={handlePrev}
              disabled={safeIndex <= 0}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Trimestre précédent"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              disabled={safeIndex >= MAP_TIMELINE_QUARTERS.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Trimestre suivant"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetToLatest}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              title="Revenir au trimestre le plus récent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Quarter Badge Display */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Trimestre affiché :</span>
            <div className="px-3.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-mono font-extrabold text-sm sm:text-base">
              {selectedPeriod.replace('-Q', ' T')}
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={MAP_TIMELINE_QUARTERS.length - 1}
            step={1}
            value={safeIndex}
            onChange={(e) => onPeriodChange(MAP_TIMELINE_QUARTERS[Number(e.target.value)])}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />

          {/* Key milestone ticks */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>2010</span>
            <span>2012</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">2015 (Base 100)</span>
            <span>2018</span>
            <span>2020 (Covid)</span>
            <span>2022 (Taux)</span>
            <span>2024</span>
            <span className="font-bold">2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
