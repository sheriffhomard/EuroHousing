/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive European Choropleth Map Page
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Layers,
  Search,
  Filter,
  Download,
  Info,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  EUROPE_MAP_GEOMETRY,
  MAP_COUNTRIES_MAP,
  MapCountryGeo,
  getStatsForCountryQuarter,
} from '../data/europeMapGeo';
import { EuropeChoroplethMap } from '../components/Map/EuropeChoroplethMap';
import {
  MapTimeControls,
  MetricType,
  ReferenceMode,
  ColorPaletteType,
} from '../components/Map/MapTimeControls';
import { CountryDetailDrawer } from '../components/Map/CountryDetailDrawer';

interface MapPageProps {
  onNavigateToObservatory: (countryCode: string) => void;
  onAddToComparator: (countryCode: string) => void;
  onNavigateToAffordability: (countryCode: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  onNavigateToObservatory,
  onAddToComparator,
  onNavigateToAffordability,
}) => {
  // Controls state
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-Q3');
  const [metric, setMetric] = useState<MetricType>('real');
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>('yoy');
  const [palette, setPalette] = useState<ColorPaletteType>('divergent_green_red');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Selected country on map
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('FR');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedCountryGeo = MAP_COUNTRIES_MAP.get(selectedCountryCode) || null;
  const selectedStats = selectedCountryGeo
    ? getStatsForCountryQuarter(selectedCountryGeo.code, selectedPeriod)
    : null;

  // Compute leaderboard and ranking of all countries for current view
  const countryRankings = useMemo(() => {
    const list = EUROPE_MAP_GEOMETRY.map((geo) => {
      const stats = getStatsForCountryQuarter(geo.code, selectedPeriod);
      let val = 0;
      if (referenceMode === 'yoy') {
        val = metric === 'real' ? stats.yoyReal : metric === 'nominal' ? stats.yoyNominal : stats.yoyHicp;
      } else if (referenceMode === 'qoq') {
        val = metric === 'real' ? stats.qoqReal : stats.qoqNominal;
      } else if (referenceMode === 'cumulative') {
        val = metric === 'real' ? stats.cumulativeReal : stats.cumulativeNominal;
      } else {
        val = metric === 'real' ? stats.realHpi : metric === 'nominal' ? stats.nominalHpi : stats.hicp;
      }

      return {
        geo,
        stats,
        value: val,
      };
    });

    list.sort((a, b) => b.value - a.value);
    return list;
  }, [selectedPeriod, metric, referenceMode]);

  // Current rank of selected country
  const selectedRank = useMemo(() => {
    const index = countryRankings.findIndex((r) => r.geo.code === selectedCountryCode);
    return {
      position: index !== -1 ? index + 1 : 1,
      total: countryRankings.length,
    };
  }, [countryRankings, selectedCountryCode]);

  // Top 3 best performers & Top 3 lowest performers
  const topPerformers = countryRankings.slice(0, 3);
  const bottomPerformers = [...countryRankings].reverse().slice(0, 3);

  // European Average computation
  const europeanAvg = useMemo(() => {
    if (countryRankings.length === 0) return 0;
    const sum = countryRankings.reduce((acc, curr) => acc + curr.value, 0);
    return sum / countryRankings.length;
  }, [countryRankings]);

  // Filter countries for search dropdown
  const filteredSearchCountries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return EUROPE_MAP_GEOMETRY.filter(
      (c) =>
        c.nameFr.toLowerCase().includes(query) ||
        c.nameEn.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Export CSV of map data for selected quarter
  const handleExportCSV = () => {
    const headers = [
      'Code_Pays',
      'Pays_FR',
      'Trimestre',
      'Valeur_Affichee',
      'HPI_Real',
      'HPI_Nominal',
      'Inflation_HICP',
      'YoY_Real',
      'YoY_Nominal',
      'QoQ_Real',
      'QoQ_Nominal',
    ];

    const rows = countryRankings.map((r) => [
      r.geo.code,
      r.geo.nameFr,
      selectedPeriod,
      r.value.toFixed(2),
      r.stats.realHpi.toFixed(2),
      r.stats.nominalHpi.toFixed(2),
      r.stats.hicp.toFixed(2),
      r.stats.yoyReal.toFixed(2),
      r.stats.yoyNominal.toFixed(2),
      r.stats.qoqReal.toFixed(2),
      r.stats.qoqNominal.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `carte_europe_hpi_${selectedPeriod}.csv`);
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
                Cartographie Choroplèthe Interactive
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500">Eurostat & BCE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Carte Choroplèthe des Prix Immobiliers en Europe
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
              Visualisez instantanément la dynamique géographique des marchés résidentiels européens. Confrontez le <strong>HPI Réel</strong> (corrigé de l'inflation) et le <strong>HPI Nominal</strong>, déplacez-vous dans le temps ou lancez l'animation historique de 2010 à 2026.
            </p>
          </div>

          {/* Search bar & Export */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            {/* Quick Country Search Input */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un pays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>

              {/* Autocomplete dropdown */}
              {filteredSearchCountries.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredSearchCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSelectedCountryCode(c.code);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <span>{c.flag}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.nameFr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.code})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              title="Exporter les données de la carte en CSV"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Moyenne Européenne</span>
            <span
              className={`font-mono font-extrabold text-sm ${
                europeanAvg >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {referenceMode !== 'level' && (europeanAvg >= 0 ? '+' : '')}
              {europeanAvg.toFixed(1)}
              {referenceMode !== 'level' && '%'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Plus Forte Hausse</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <span>{topPerformers[0]?.geo.flag}</span>
              <span>{topPerformers[0]?.geo.code}</span>
              <span>(+{topPerformers[0]?.value.toFixed(1)}%)</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Plus Forte Baisse / Retrait</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-rose-600 dark:text-rose-400">
              <span>{bottomPerformers[0]?.geo.flag}</span>
              <span>{bottomPerformers[0]?.geo.code}</span>
              <span>({bottomPerformers[0]?.value.toFixed(1)}%)</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Pays en Hausse</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {countryRankings.filter((c) => c.value > 0).length} / {countryRankings.length} marchés
            </span>
          </div>
        </div>
      </div>

      {/* Main Time, Metric & Mode Controls */}
      <MapTimeControls
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        metric={metric}
        onMetricChange={setMetric}
        referenceMode={referenceMode}
        onReferenceModeChange={setReferenceMode}
        palette={palette}
        onPaletteChange={setPalette}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
      />

      {/* Map Layout: Left Side SVG Map vs Right Side Country Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map Canvas (8 cols) */}
        <div className="lg:col-span-8">
          <EuropeChoroplethMap
            selectedPeriod={selectedPeriod}
            metric={metric}
            referenceMode={referenceMode}
            palette={palette}
            selectedCountryCode={selectedCountryCode}
            onSelectCountry={(code) => setSelectedCountryCode(code)}
          />
        </div>

        {/* Selected Country Inspection Drawer (4 cols) */}
        <div className="lg:col-span-4">
          <CountryDetailDrawer
            country={selectedCountryGeo}
            stats={selectedStats}
            selectedPeriod={selectedPeriod}
            metric={metric}
            referenceMode={referenceMode}
            rank={selectedRank}
            onClose={() => setSelectedCountryCode('')}
            onNavigateToObservatory={onNavigateToObservatory}
            onAddToComparator={onAddToComparator}
            onNavigateToAffordability={onNavigateToAffordability}
          />
        </div>
      </div>

      {/* European Leaderboard Table of the Quarter */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Palmarès Européen : {selectedPeriod.replace('-Q', ' T')} (
            {metric === 'real'
              ? 'HPI Réel'
              : metric === 'nominal'
              ? 'HPI Nominal'
              : 'Inflation HICP'}
            )
          </div>
          <span className="text-[11px] text-slate-400">
            Cliquez sur un pays pour le localiser sur la carte
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {countryRankings.map((item, idx) => {
            const isSelected = item.geo.code === selectedCountryCode;
            return (
              <button
                key={item.geo.code}
                onClick={() => setSelectedCountryCode(item.geo.code)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm font-bold text-slate-400 font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-base">{item.geo.flag}</span>
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                    {item.geo.code}
                  </span>
                </div>

                <span
                  className={`font-mono font-bold text-xs ${
                    item.value >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {referenceMode !== 'level' && (item.value >= 0 ? '+' : '')}
                  {item.value.toFixed(1)}
                  {referenceMode !== 'level' && '%'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
