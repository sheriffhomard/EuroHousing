/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cross-country cycle comparison matrix
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Search,
  ExternalLink,
  Award,
  TrendingDown,
  TrendingUp,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { CountryCycleAnalysis, MarketPhase, CycleMetric } from '../../services/cycleAnalysis';

interface CrossCountryCycleTableProps {
  analyses: CountryCycleAnalysis[];
  metric: CycleMetric;
  onSelectCountry: (countryCode: string) => void;
  selectedCountryCode: string;
}

type SortField =
  | 'country'
  | 'phase'
  | 'distanceFromATH'
  | 'maxDrawdown'
  | 'expansionDuration'
  | 'recoveryDuration';

export const CrossCountryCycleTable: React.FC<CrossCountryCycleTableProps> = ({
  analyses,
  metric,
  onSelectCountry,
  selectedCountryCode,
}) => {
  const [search, setSearch] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('maxDrawdown');
  const [sortAsc, setSortAsc] = useState<boolean>(true); // Ascending: worst drawdown first

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'maxDrawdown' || field === 'distanceFromATH');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...analyses];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.country.nameFr.toLowerCase().includes(q) ||
          a.country.name.toLowerCase().includes(q) ||
          a.country.code.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let diff = 0;
      switch (sortField) {
        case 'country':
          diff = a.country.nameFr.localeCompare(b.country.nameFr);
          break;
        case 'phase':
          diff = a.currentPhase.localeCompare(b.currentPhase);
          break;
        case 'distanceFromATH':
          diff = a.distanceFromATHPercent - b.distanceFromATHPercent;
          break;
        case 'maxDrawdown':
          diff = a.historicalMaxDrawdownPercent - b.historicalMaxDrawdownPercent;
          break;
        case 'expansionDuration':
          diff = a.averageExpansionDurationQuarters - b.averageExpansionDurationQuarters;
          break;
        case 'recoveryDuration':
          diff = (a.averageRecoveryDurationQuarters || 999) - (b.averageRecoveryDurationQuarters || 999);
          break;
      }
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [analyses, search, sortField, sortAsc]);

  const getPhaseBadge = (phase: MarketPhase) => {
    switch (phase) {
      case 'expansion':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Expansion (Hausse)
          </span>
        );
      case 'peak':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            Sommet (Pic)
          </span>
        );
      case 'contraction':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            Correction (Baisse)
          </span>
        );
      case 'trough':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Point bas (Creux)
          </span>
        );
      case 'recovery':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Reprise / Rebond
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Table Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Palmarès Comparatif Européen
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">Cycles & Résilience</span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
            Tableau Comparatif des Marchés Immobiliers Européens
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classement selon l'amplitude de la correction maximale, la phase en cours et le temps nécessaire pour effacer les baisses.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative self-start sm:self-auto">
          <input
            type="text"
            placeholder="Filtrer un pays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider select-none">
              <th
                onClick={() => handleSort('country')}
                className="py-2.5 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Pays</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('phase')}
                className="py-2.5 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Phase Actuelle</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('distanceFromATH')}
                className="py-2.5 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Écart au Record</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('maxDrawdown')}
                className="py-2.5 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Baisse Max. (Drawdown)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('expansionDuration')}
                className="py-2.5 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Durée Moy. Hausse</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('recoveryDuration')}
                className="py-2.5 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Temps Moyen Recouvrement</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {filteredAndSorted.map((a) => {
              const isSelected = a.country.code === selectedCountryCode;
              return (
                <tr
                  key={a.country.code}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                  }`}
                  onClick={() => onSelectCountry(a.country.code)}
                >
                  {/* Country */}
                  <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.country.flag}</span>
                      <span>{a.country.nameFr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({a.country.code})
                      </span>
                    </div>
                  </td>

                  {/* Current Phase */}
                  <td className="py-3 px-3 font-sans">
                    {getPhaseBadge(a.currentPhase)}
                  </td>

                  {/* Distance from ATH */}
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-extrabold ${
                        a.distanceFromATHPercent >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {a.distanceFromATHPercent >= 0
                        ? 'Nouveau Record'
                        : `${a.distanceFromATHPercent}%`}
                    </span>
                  </td>

                  {/* Historical Max Drawdown */}
                  <td className="py-3 px-3 text-right">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">
                      {a.historicalMaxDrawdownPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Pic : {a.historicalMaxDrawdownPeriod.peak.replace('-Q', ' T')}
                    </span>
                  </td>

                  {/* Avg Expansion Duration */}
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                    <span className="font-bold">
                      {a.averageExpansionDurationQuarters} trim.
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {(a.averageExpansionDurationQuarters / 4).toFixed(1)} ans
                    </span>
                  </td>

                  {/* Avg Recovery Duration */}
                  <td className="py-3 px-3 text-right">
                    {a.averageRecoveryDurationQuarters ? (
                      <div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {a.averageRecoveryDurationQuarters} trim.
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal text-slate-400">
                          {(a.averageRecoveryDurationQuarters / 4).toFixed(1)} ans
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-sans">
                        En cours
                      </span>
                    )}
                  </td>

                  {/* Action button */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCountry(a.country.code);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition cursor-pointer"
                    >
                      Analyser
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
