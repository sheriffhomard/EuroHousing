/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Download, Search, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet, FileJson } from 'lucide-react';
import { CountryTimeSeries, QuarterlyObservation } from '../../data/types';
import { getCountryInfo } from '../../data/countries';

interface DataTableProps {
  seriesList: CountryTimeSeries[];
}

interface FlattenedRow {
  geo: string;
  countryName: string;
  flag: string;
  period: string;
  year: number;
  quarter: number;
  hpiTotal: number | null;
  hpiNew: number | null;
  hpiExst: number | null;
  hicp: number | null;
  realHpi: number | null;
  hpiYoY: number | null;
  hicpYoY: number | null;
}

export const DataTable: React.FC<DataTableProps> = ({ seriesList }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof FlattenedRow>('period');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Flatten observations across all provided country series
  const allRows = useMemo<FlattenedRow[]>(() => {
    const rows: FlattenedRow[] = [];
    for (const s of seriesList) {
      for (const obs of s.observations) {
        rows.push({
          geo: obs.geo,
          countryName: s.country.nameFr,
          flag: s.country.flag,
          period: obs.period,
          year: obs.year,
          quarter: obs.quarter,
          hpiTotal: obs.hpi.total,
          hpiNew: obs.hpi.new,
          hpiExst: obs.hpi.existing,
          hicp: obs.hicp,
          realHpi: obs.realHpi,
          hpiYoY: obs.hpiYoY ?? null,
          hicpYoY: obs.hicpYoY ?? null,
        });
      }
    }
    return rows;
  }, [seriesList]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      const q = search.toLowerCase();
      return (
        r.countryName.toLowerCase().includes(q) ||
        r.geo.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q)
      );
    });
  }, [allRows, search]);

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortKey, sortOrder]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  const handleSort = (key: keyof FlattenedRow) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // CSV Export
  const exportCsv = () => {
    const headers = [
      'Pays (Code)',
      'Pays (Nom)',
      'Période',
      'HPI Nominal',
      'HPI Neuf',
      'HPI Existant',
      'Inflation HICP',
      'HPI Réel',
      'HPI YoY (%)',
      'Inflation YoY (%)',
    ];

    const lines = sortedRows.map((r) => [
      r.geo,
      `"${r.countryName}"`,
      r.period,
      r.hpiTotal ?? '',
      r.hpiNew ?? '',
      r.hpiExst ?? '',
      r.hicp ?? '',
      r.realHpi ?? '',
      r.hpiYoY ?? '',
      r.hicpYoY ?? '',
    ]);

    const csvContent = [headers.join(','), ...lines.map((l) => l.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eurostat-housing-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // JSON Export
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(sortedRows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eurostat-housing-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderDelta = (v: number | null) => {
    if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
    const isPos = v > 0;
    return (
      <span className={isPos ? 'text-emerald-600 font-semibold' : v < 0 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
        {isPos ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      {/* Top Filter and Actions Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filtrer par pays ou trimestre..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('countryName')}>
                <div className="flex items-center gap-1">
                  <span>Pays</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('period')}>
                <div className="flex items-center gap-1">
                  <span>Période</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-blue-600" onClick={() => handleSort('hpiTotal')}>
                <div className="flex items-center justify-end gap-1">
                  <span>HPI Nominal</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-blue-600" onClick={() => handleSort('hicp')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Inflation HICP</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-blue-600" onClick={() => handleSort('realHpi')}>
                <div className="flex items-center justify-end gap-1">
                  <span>HPI Réel</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-blue-600" onClick={() => handleSort('hpiYoY')}>
                <div className="flex items-center justify-end gap-1">
                  <span>HPI YoY</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-blue-600" onClick={() => handleSort('hicpYoY')}>
                <div className="flex items-center justify-end gap-1">
                  <span>HICP YoY</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Neuf / Existant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
            {currentPageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                  Aucune donnée trouvée.
                </td>
              </tr>
            ) : (
              currentPageRows.map((r, idx) => (
                <tr
                  key={`${r.geo}-${r.period}-${idx}`}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{r.flag}</span>
                    <span>{r.countryName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({r.geo})</span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {r.period}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {r.hpiTotal !== null ? r.hpiTotal.toFixed(1) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300">
                    {r.hicp !== null ? r.hicp.toFixed(1) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                    {r.realHpi !== null ? r.realHpi.toFixed(1) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {renderDelta(r.hpiYoY)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {renderDelta(r.hicpYoY)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-[11px] text-slate-500">
                    {r.hpiNew !== null ? `N: ${r.hpiNew.toFixed(1)}` : 'N: —'} ·{' '}
                    {r.hpiExst !== null ? `E: ${r.hpiExst.toFixed(1)}` : 'E: —'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div>
          Affichage de {(page - 1) * pageSize + 1} à{' '}
          {Math.min(page * pageSize, sortedRows.length)} sur {sortedRows.length} lignes
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
