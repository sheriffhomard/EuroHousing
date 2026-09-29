/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive Housing Market Cycle Analysis Page
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Layers,
  TrendingDown,
  TrendingUp,
  Clock,
  RotateCcw,
  Sparkles,
  Download,
  Calendar,
  Award,
  ChevronRight,
  Info,
  Scale,
  Compass,
} from 'lucide-react';
import {
  analyzeCountryCycles,
  buildSynchronizedPeakSeries,
  CountryCycleAnalysis,
  CycleMetric,
} from '../services/cycleAnalysis';
import { CountryTimeSeries, CountryInfo } from '../data/types';
import { EUROPEAN_COUNTRIES } from '../data/countries';
import { normalizeCountryData } from '../services/normalization';
import { BOOTSTRAP_HICP_RAW, BOOTSTRAP_HPI_RAW } from '../data/bootstrapData';
import { CycleChart } from '../components/Cycles/CycleChart';
import { PeakComparisonChart } from '../components/Cycles/PeakComparisonChart';
import { CycleTimelineBar } from '../components/Cycles/CycleTimelineBar';
import { CycleHistoryTable } from '../components/Cycles/CycleHistoryTable';
import { CrossCountryCycleTable } from '../components/Cycles/CrossCountryCycleTable';
import { CycleEducationalCard } from '../components/Cycles/CycleEducationalCard';

interface CyclesPageProps {
  onNavigateToObservatory?: (countryCode: string) => void;
  onAddToComparator?: (countryCode: string) => void;
  onNavigateToAffordability?: (countryCode: string) => void;
  onNavigateToMap?: (countryCode: string) => void;
}

type CycleTab = 'diagnostic' | 'synchronized' | 'ranking' | 'guide';

export const CyclesPage: React.FC<CyclesPageProps> = ({
  onNavigateToObservatory,
  onAddToComparator,
  onNavigateToAffordability,
  onNavigateToMap,
}) => {
  // Page state
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('FR');
  const [metric, setMetric] = useState<CycleMetric>('real');
  const [activeTab, setActiveTab] = useState<CycleTab>('diagnostic');
  const [compareCountryCodes, setCompareCountryCodes] = useState<string[]>([
    'FR',
    'DE',
    'ES',
    'IT',
    'NL',
    'SE',
  ]);

  // Compute normalized series for all European countries
  const allCountriesAnalyses = useMemo<CountryCycleAnalysis[]>(() => {
    return EUROPEAN_COUNTRIES.map((c) => {
      const fullSeries = normalizeCountryData(c.code, BOOTSTRAP_HPI_RAW, BOOTSTRAP_HICP_RAW);
      return analyzeCountryCycles(c, fullSeries.observations, metric);
    });
  }, [metric]);

  // Active country analysis
  const currentAnalysis = useMemo(() => {
    const found = allCountriesAnalyses.find((a) => a.country.code === selectedCountryCode);
    if (found) return found;
    return allCountriesAnalyses[0];
  }, [allCountriesAnalyses, selectedCountryCode]);

  // Active country full observation list
  const currentObservations = useMemo(() => {
    const full = normalizeCountryData(currentAnalysis.country.code, BOOTSTRAP_HPI_RAW, BOOTSTRAP_HICP_RAW);
    return full.observations;
  }, [currentAnalysis]);

  // Synchronized peak series for multi-country overlay
  const synchronizedSeries = useMemo(() => {
    const countriesData = compareCountryCodes.map((code) => {
      const country = EUROPEAN_COUNTRIES.find((c) => c.code === code) || EUROPEAN_COUNTRIES[0];
      const full = normalizeCountryData(code, BOOTSTRAP_HPI_RAW, BOOTSTRAP_HICP_RAW);
      return {
        country,
        observations: full.observations,
      };
    });
    return buildSynchronizedPeakSeries(countriesData, metric, 'recent_2022');
  }, [compareCountryCodes, metric]);

  const toggleCompareCountry = (code: string) => {
    setCompareCountryCodes((prev) => {
      if (prev.includes(code)) {
        if (prev.length <= 1) return prev;
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Export CSV of cycles data
  const handleExportCSV = () => {
    const headers = [
      'Cycle_ID',
      'Pays',
      'Code_Pays',
      'Metrique',
      'Sommet_Periode',
      'Sommet_Indice',
      'Creux_Periode',
      'Creux_Indice',
      'Duree_Hausse_Trimestres',
      'Amplitude_Hausse_Pct',
      'Duree_Baisse_Trimestres',
      'Baisse_Max_Drawdown_Pct',
      'Recouvrement_Periode',
      'Duree_Recouvrement_Trimestres',
      'Statut',
    ];

    const rows = currentAnalysis.cycles.map((c) => [
      c.id,
      currentAnalysis.country.nameFr,
      currentAnalysis.country.code,
      metric === 'real' ? 'HPI_Real' : 'HPI_Nominal',
      c.peakPeriod,
      c.peakValue.toFixed(2),
      c.troughPeriod || 'N/A',
      c.troughValue ? c.troughValue.toFixed(2) : 'N/A',
      c.expansionDurationQuarters || 'N/A',
      c.expansionAmplitudePercent ? `+${c.expansionAmplitudePercent}%` : 'N/A',
      c.contractionDurationQuarters,
      `${c.maxDrawdownPercent}%`,
      c.recoveryPeriod || 'Non_recouvre',
      c.recoveryDurationQuarters || 'N/A',
      c.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `cycles_immobiliers_${currentAnalysis.country.code}_${metric}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Analyse Macroéconomique & Cycles Résidentiels
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500">Eurostat & BCE (2010 — 2026)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Cycles Immobiliers : Pics, Creux, Drawdowns & Recouvrement
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
              Exploitez les séries historiques pour diagnostiquer chaque phase des marchés résidentiels : détection automatique des <strong>pics</strong> et des <strong>creux</strong>, calcul des <strong>durées de hausse et de baisse</strong>, mesure de l'<strong>amplitude de la baisse maximale</strong> (drawdown) et du <strong>temps nécessaire pour retrouver l'ancien sommet</strong>.
            </p>
          </div>

          {/* Top Country Selector & Controls */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            {/* Country Selector */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-lg pl-1">{currentAnalysis.country.flag}</span>
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer pr-2"
              >
                {EUROPEAN_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="dark:bg-slate-900">
                    {c.nameFr} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setMetric('real')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  metric === 'real'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Prix corrigés de l'inflation (pouvoir d'achat immobilier)"
              >
                HPI Réel
              </button>
              <button
                onClick={() => setMetric('nominal')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  metric === 'nominal'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Prix bruts constatés sur les transactions"
              >
                HPI Nominal
              </button>
            </div>

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              title="Exporter l'historique des cycles en CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 High-Impact KPI Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Card 1: Current Phase */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Phase Actuelle du Marché
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    currentAnalysis.currentPhase === 'expansion'
                      ? 'bg-emerald-400'
                      : currentAnalysis.currentPhase === 'recovery'
                      ? 'bg-blue-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    currentAnalysis.currentPhase === 'expansion'
                      ? 'bg-emerald-500'
                      : currentAnalysis.currentPhase === 'recovery'
                      ? 'bg-blue-500'
                      : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                {currentAnalysis.currentPhase === 'expansion'
                  ? 'Expansion (Hausse)'
                  : currentAnalysis.currentPhase === 'peak'
                  ? 'Sommet de cycle'
                  : currentAnalysis.currentPhase === 'contraction'
                  ? 'Correction (Baisse)'
                  : currentAnalysis.currentPhase === 'trough'
                  ? 'Point bas (Creux)'
                  : 'Reprise / Rebond'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              En cours depuis {currentAnalysis.currentPhaseDurationQuarters} trimestres (
              {(currentAnalysis.currentPhaseDurationQuarters / 4).toFixed(1)} an)
            </span>
          </div>

          {/* Card 2: Maximum Drawdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Baisse Maximale du Cycle
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                {currentAnalysis.historicalMaxDrawdownPercent}%
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                Drawdown Max
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Du pic {currentAnalysis.historicalMaxDrawdownPeriod.peak.replace('-Q', ' T')} au creux{' '}
              {currentAnalysis.historicalMaxDrawdownPeriod.trough.replace('-Q', ' T')}
            </span>
          </div>

          {/* Card 3: Recovery Time */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Temps pour Retrouver le Pic
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {currentAnalysis.averageRecoveryDurationQuarters
                  ? `${currentAnalysis.averageRecoveryDurationQuarters} T`
                  : `${currentAnalysis.quartersSinceLastPeak} T`}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {currentAnalysis.averageRecoveryDurationQuarters ? 'Moyenne' : 'Écoulés'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {currentAnalysis.averageRecoveryDurationQuarters
                ? `Soit ~${(currentAnalysis.averageRecoveryDurationQuarters / 4).toFixed(1)} ans pour effacer une baisse`
                : `Dernier pic : ${currentAnalysis.lastPeakPeriod.replace('-Q', ' T')} (en cours)`}
            </span>
          </div>

          {/* Card 4: Record ATH and Current Distance */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sommet Historique (Record)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {currentAnalysis.allTimeHighValue.toFixed(1)}
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  currentAnalysis.distanceFromATHPercent >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {currentAnalysis.distanceFromATHPercent >= 0
                  ? 'Record absolu'
                  : `${currentAnalysis.distanceFromATHPercent}%`}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Atteint en {currentAnalysis.allTimeHighPeriod.replace('-Q', ' T')} (Base 2015 = 100)
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 max-w-fit">
        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'diagnostic'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Diagnostic Pays ({currentAnalysis.country.code})</span>
        </button>

        <button
          onClick={() => setActiveTab('synchronized')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'synchronized'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Comparateur & Superposition (T = 0)</span>
        </button>

        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'ranking'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Palmarès Européen</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Guide & Méthodologie</span>
        </button>
      </div>

      {/* Tab 1: Country Diagnostic */}
      {activeTab === 'diagnostic' && (
        <div className="space-y-6">
          {/* Main Cycle Chart */}
          <CycleChart
            analysis={currentAnalysis}
            observations={currentObservations}
            metric={metric}
            onMetricChange={setMetric}
          />

          {/* Historical Cycles Breakdown Table */}
          <CycleHistoryTable analysis={currentAnalysis} />
        </div>
      )}

      {/* Tab 2: Synchronized Cross-Country Comparison */}
      {activeTab === 'synchronized' && (
        <div className="space-y-6">
          {/* Superposition Chart centered at Peak T=0 */}
          <PeakComparisonChart
            seriesList={synchronizedSeries}
            metric={metric}
            onMetricChange={setMetric}
            selectedCountryCodes={compareCountryCodes}
            onToggleCountry={toggleCompareCountry}
            availableCountries={EUROPEAN_COUNTRIES.map((c) => ({
              code: c.code,
              name: c.nameFr,
              flag: c.flag,
            }))}
          />

          {/* Visual Gantt Bar Timeline */}
          <CycleTimelineBar
            analyses={allCountriesAnalyses}
            metric={metric}
            onSelectCountry={(code) => {
              setSelectedCountryCode(code);
              setActiveTab('diagnostic');
            }}
            selectedCountryCode={selectedCountryCode}
          />
        </div>
      )}

      {/* Tab 3: European Ranking Matrix */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <CrossCountryCycleTable
            analyses={allCountriesAnalyses}
            metric={metric}
            onSelectCountry={(code) => {
              setSelectedCountryCode(code);
              setActiveTab('diagnostic');
            }}
            selectedCountryCode={selectedCountryCode}
          />
        </div>
      )}

      {/* Tab 4: Educational Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <CycleEducationalCard />
        </div>
      )}
    </div>
  );
};
