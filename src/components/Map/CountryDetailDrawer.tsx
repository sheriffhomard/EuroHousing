/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Detailed Inspection Card / Panel for Selected Country on Map
 */

import React from 'react';
import {
  X,
  ExternalLink,
  Plus,
  Scale,
  Calculator,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  MapCountryGeo,
  CountryQuarterStats,
  getCountryQuarterData,
  MAP_TIMELINE_QUARTERS,
} from '../../data/europeMapGeo';
import { MetricType, ReferenceMode } from './MapTimeControls';

interface CountryDetailDrawerProps {
  country: MapCountryGeo | null;
  stats: CountryQuarterStats | null;
  selectedPeriod: string;
  metric: MetricType;
  referenceMode: ReferenceMode;
  rank: { position: number; total: number };
  onClose: () => void;
  onNavigateToObservatory: (countryCode: string) => void;
  onAddToComparator: (countryCode: string) => void;
  onNavigateToAffordability: (countryCode: string) => void;
}

export const CountryDetailDrawer: React.FC<CountryDetailDrawerProps> = ({
  country,
  stats,
  selectedPeriod,
  metric,
  referenceMode,
  rank,
  onClose,
  onNavigateToObservatory,
  onAddToComparator,
  onNavigateToAffordability,
}) => {
  if (!country || !stats) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <span className="text-3xl mb-2">🗺️</span>
        <div className="font-semibold text-xs text-slate-700 dark:text-slate-300">
          Aucun pays sélectionné
        </div>
        <p className="text-[11px] text-slate-400 max-w-xs mt-1">
          Survolez ou cliquez sur un pays de la carte d'Europe pour afficher sa fiche détaillée et ses séries temporelles.
        </p>
      </div>
    );
  }

  // Get recent 8 quarters for sparkline
  const fullStatsMap = getCountryQuarterData(country.code);
  const currentIdx = MAP_TIMELINE_QUARTERS.indexOf(selectedPeriod);
  const startSparklineIdx = Math.max(0, currentIdx - 7);
  const sparklinePeriods = MAP_TIMELINE_QUARTERS.slice(startSparklineIdx, currentIdx + 1);

  const sparklineData = sparklinePeriods.map((p) => {
    const s = fullStatsMap.get(p);
    return {
      period: p,
      val: metric === 'real' ? s?.realHpi ?? 100 : metric === 'nominal' ? s?.nominalHpi ?? 100 : s?.hicp ?? 100,
    };
  });

  const sparkVals = sparklineData.map((d) => d.val);
  const minSpark = Math.min(...sparkVals);
  const maxSpark = Math.max(...sparkVals);
  const sparkRange = Math.max(0.1, maxSpark - minSpark);

  // Active displayed variation value according to mode
  let primaryValue = 0;
  let primaryLabel = '';
  if (referenceMode === 'yoy') {
    primaryValue = metric === 'real' ? stats.yoyReal : metric === 'nominal' ? stats.yoyNominal : stats.yoyHicp;
    primaryLabel = 'Glissement Annuel (sur 1 an)';
  } else if (referenceMode === 'qoq') {
    primaryValue = metric === 'real' ? stats.qoqReal : stats.qoqNominal;
    primaryLabel = 'Variation Trimestrielle (sur 1 trimestre)';
  } else if (referenceMode === 'cumulative') {
    primaryValue = metric === 'real' ? stats.cumulativeReal : stats.cumulativeNominal;
    primaryLabel = 'Croissance Cumulée (depuis 2015)';
  } else {
    primaryValue = metric === 'real' ? stats.realHpi : metric === 'nominal' ? stats.nominalHpi : stats.hicp;
    primaryLabel = "Niveau de l'Indice (Base 2015=100)";
  }

  const isPositive = primaryValue >= 0;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between space-y-4">
      {/* Drawer Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl drop-shadow-xs">{country.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {country.nameFr}
              </h3>
              <span className="text-xs text-slate-400 font-mono">({country.code})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{country.isEU ? 'Union Européenne' : 'Europe hors-UE'}</span>
              <span>·</span>
              <span>Trimestre {selectedPeriod.replace('-Q', ' T')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          title="Fermer la fiche"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main KPI Display */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          {primaryLabel}
        </span>
        <div className="flex items-baseline justify-between mt-1">
          <div
            className={`text-3xl font-extrabold font-mono tracking-tight flex items-center gap-1.5 ${
              referenceMode === 'level'
                ? 'text-slate-900 dark:text-white'
                : isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {referenceMode !== 'level' && (isPositive ? '+' : '')}
            {primaryValue.toFixed(1)}
            {referenceMode !== 'level' && '%'}
          </div>

          {/* Ranking Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-blue-500" />
            <span>#{rank.position} / {rank.total}</span>
          </div>
        </div>
      </div>

      {/* 3 Metrics Tri-Grid: Nominal vs Real vs Inflation */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">HPI Réel</span>
          <div className="font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
            {stats.realHpi.toFixed(1)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {stats.yoyReal >= 0 ? `+${stats.yoyReal}%` : `${stats.yoyReal}%`} 1an
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">HPI Nominal</span>
          <div className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
            {stats.nominalHpi.toFixed(1)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {stats.yoyNominal >= 0 ? `+${stats.yoyNominal}%` : `${stats.yoyNominal}%`} 1an
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Inflation HICP</span>
          <div className="font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {stats.hicp.toFixed(1)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            +{stats.yoyHicp.toFixed(1)}% 1an
          </span>
        </div>
      </div>

      {/* Mini Trend Sparkline (last 8 quarters) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>Tendance récente (8 derniers trimestres) :</span>
          <span className="font-mono text-slate-500">
            {sparklinePeriods[0]?.replace('-Q', ' T')} → {selectedPeriod.replace('-Q', ' T')}
          </span>
        </div>
        <div className="h-10 w-full flex items-end gap-1.5 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          {sparklineData.map((d, i) => {
            const heightPercent = Math.max(15, ((d.val - minSpark) / sparkRange) * 100);
            const isLast = i === sparklineData.length - 1;
            return (
              <div
                key={d.period}
                className="flex-1 flex flex-col justify-end items-center group relative h-full"
              >
                <div
                  className={`w-full rounded-xs transition-all ${
                    isLast
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons to navigate across the app with this country */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onNavigateToObservatory(country.code)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-2xs"
        >
          <span>Consulter dans l'Observatoire</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToComparator(country.code)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>Comparateur</span>
          </button>

          <button
            onClick={() => onNavigateToAffordability(country.code)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-500" />
            <span>Accessibilité</span>
          </button>
        </div>
      </div>
    </div>
  );
};
