/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Check, Plus, X, Globe, Sparkles, RotateCcw } from 'lucide-react';
import { EUROPEAN_COUNTRIES, DEFAULT_COMPARISON_COUNTRIES } from '../../data/countries';
import { CountryInfo } from '../../data/types';

interface CountryMultiSelectProps {
  selectedCountries: string[];
  onToggleCountry: (code: string) => void;
  onSetCountries: (codes: string[]) => void;
}

interface CountryPreset {
  id: string;
  name: string;
  icon: string;
  codes: string[];
}

const COUNTRY_PRESETS: CountryPreset[] = [
  {
    id: 'eu_and_majors',
    name: '🇪🇺 UE & Principaux',
    icon: '🇪🇺',
    codes: ['EU27_2020', 'FR', 'DE', 'ES', 'IT', 'NL'],
  },
  {
    id: 'top5',
    name: 'Top 5 Économies',
    icon: '🏛️',
    codes: ['DE', 'FR', 'IT', 'ES', 'NL'],
  },
  {
    id: 'south',
    name: 'Europe du Sud',
    icon: '☀️',
    codes: ['ES', 'IT', 'PT', 'CY', 'MT'],
  },
  {
    id: 'west_north',
    name: 'Ouest & Nord',
    icon: '🌲',
    codes: ['FR', 'DE', 'BE', 'NL', 'AT', 'DK', 'SE', 'FI'],
  },
  {
    id: 'east_central',
    name: 'Centrale & Est',
    icon: '🏰',
    codes: ['PL', 'CZ', 'HU', 'SK', 'RO', 'BG', 'HR', 'EE', 'LV', 'LT'],
  },
  {
    id: 'eu_aggregates',
    name: 'Union Européenne seule',
    icon: '🇪🇺',
    codes: ['EU27_2020', 'EA20'],
  },
];

export const CountryMultiSelect: React.FC<CountryMultiSelectProps> = ({
  selectedCountries,
  onToggleCountry,
  onSetCountries,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'aggregates' | 'eu'>('all');

  const filteredCountries = useMemo(() => {
    return EUROPEAN_COUNTRIES.filter((c) => {
      const matchesSearch =
        c.nameFr.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'aggregates') return c.isAggregate;
      if (activeTab === 'eu') return !c.isAggregate;
      return true;
    });
  }, [search, activeTab]);

  const handleSelectPreset = (codes: string[]) => {
    onSetCountries(codes);
  };

  const handleSelectAll = () => {
    onSetCountries(EUROPEAN_COUNTRIES.map((c) => c.code));
  };

  const handleResetDefault = () => {
    onSetCountries(DEFAULT_COMPARISON_COUNTRIES);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title and Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Sélection des pays et agrégats européens</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
              {selectedCountries.length} sélectionnés
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comparez plusieurs pays simultanément ou référencez l'ensemble de l'Union Européenne (UE-27).
          </p>
        </div>

        {/* Quick actions: Reset & Select All */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Revenir à la sélection par défaut (FR, DE, ES, IT, UE-27)"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Défaut</span>
          </button>
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer"
          >
            Tout cocher
          </button>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Sélections thématiques rapides</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRY_PRESETS.map((p) => {
            const isFullySelected =
              p.codes.every((code) => selectedCountries.includes(code)) &&
              selectedCountries.length === p.codes.length;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.codes)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                  isFullySelected
                    ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Scope Filters */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer un pays (ex: France, Espagne, UE-27, Allemagne...)"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 font-semibold text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tous ({EUROPEAN_COUNTRIES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aggregates')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              activeTab === 'aggregates'
                ? 'bg-white dark:bg-slate-700 font-semibold text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🇪🇺 Agrégats UE (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('eu')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              activeTab === 'eu'
                ? 'bg-white dark:bg-slate-700 font-semibold text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pays individuels
          </button>
        </div>
      </div>

      {/* Country Pills List */}
      <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800/80 rounded-lg bg-slate-50/40 dark:bg-slate-950/20">
        {filteredCountries.map((c) => {
          const isSelected = selectedCountries.includes(c.code);
          const isEU = c.isAggregate;

          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onToggleCountry(c.code)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? isEU
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-200 font-semibold ring-1 ring-indigo-400/50'
                    : 'border-blue-600 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                  : isEU
                  ? 'border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 hover:border-indigo-300 font-medium'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.nameFr}</span>
              <span className="text-[10px] opacity-60 font-mono">({c.code})</span>
              {isSelected ? (
                <Check className={`w-3 h-3 ${isEU ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600'}`} />
              ) : (
                <Plus className="w-3 h-3 text-slate-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
