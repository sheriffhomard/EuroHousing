/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Multi-country cycle phases timeline (Gantt style) across Europe 2010-2026
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { CountryCycleAnalysis, CycleMetric } from '../../services/cycleAnalysis';

interface CycleTimelineBarProps {
  analyses: CountryCycleAnalysis[];
  metric: CycleMetric;
  onSelectCountry: (countryCode: string) => void;
  selectedCountryCode: string;
}

export const CycleTimelineBar: React.FC<CycleTimelineBarProps> = ({
  analyses,
  metric,
  onSelectCountry,
  selectedCountryCode,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    countryCode: string;
    countryName: string;
    period: string;
    phase: string;
  } | null>(null);

  // Generate 2010 to 2025 quarters list
  const quarters = useMemo(() => {
    const list: string[] = [];
    for (let y = 2010; y <= 2025; y++) {
      for (let q = 1; q <= 4; q++) {
        list.push(`${y}-Q${q}`);
      }
    }
    return list;
  }, []);

  // Determine each country's state for each quarter
  const timelineData = useMemo(() => {
    return analyses.map((a) => {
      const quarterStates = quarters.map((q) => {
        // Is it a peak?
        const isPeak = a.peaks.some((p) => p.period === q);
        const isTrough = a.troughs.some((t) => t.period === q);

        if (isPeak) return { period: q, phase: 'peak', label: 'Sommet' };
        if (isTrough) return { period: q, phase: 'trough', label: 'Creux' };

        // Check if inside a contraction segment
        const contraction = a.segments.find(
          (s) => s.type === 'contraction' && q >= s.startPeriod && q <= s.endPeriod
        );
        if (contraction) return { period: q, phase: 'contraction', label: 'Baisse' };

        // Check expansion
        const expansion = a.segments.find(
          (s) => s.type === 'expansion' && q >= s.startPeriod && q <= s.endPeriod
        );
        if (expansion) return { period: q, phase: 'expansion', label: 'Hausse' };

        // Fallback: look at last peak
        if (q > a.lastPeakPeriod) {
          return { period: q, phase: 'contraction', label: 'Baisse / Ajustement' };
        }

        return { period: q, phase: 'expansion', label: 'Hausse' };
      });

      return {
        country: a.country,
        states: quarterStates,
      };
    });
  }, [analyses, quarters]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Synchronisme Européen
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">2010 — 2025</span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
            Frise Chronologique des Cycles en Europe
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualisez les vagues d'expansion et de contraction d'un pays à l'autre. Cliquez sur un pays pour ouvrir son analyse détaillée.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">Hausse</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-300">Baisse</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-400" />
            <span className="text-slate-600 dark:text-slate-300">Point pivot</span>
          </div>
        </div>
      </div>

      {/* Grid Timeline Scrollable */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px] space-y-1.5">
          {/* Header row: Years */}
          <div className="flex items-center text-[10px] font-mono text-slate-400 pb-1">
            <div className="w-28 shrink-0 font-bold uppercase">Pays</div>
            <div className="flex-1 grid grid-cols-16 gap-1 text-center">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={2010 + i} className="font-bold">
                  {2010 + i}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {timelineData.map((row) => {
            const isSelected = row.country.code === selectedCountryCode;
            return (
              <div
                key={row.country.code}
                onClick={() => onSelectCountry(row.country.code)}
                className={`flex items-center p-1 rounded-xl transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Country Name */}
                <div className="w-28 shrink-0 flex items-center gap-2">
                  <span className="text-sm">{row.country.flag}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {row.country.nameFr}
                  </span>
                </div>

                {/* Quarter Blocks */}
                <div className="flex-1 flex gap-0.5 h-5">
                  {row.states.map((st) => {
                    let bg = 'bg-emerald-500';
                    if (st.phase === 'contraction') bg = 'bg-rose-500';
                    else if (st.phase === 'peak' || st.phase === 'trough') bg = 'bg-amber-400';

                    return (
                      <div
                        key={st.period}
                        onMouseEnter={() =>
                          setHoveredCell({
                            countryCode: row.country.code,
                            countryName: row.country.nameFr,
                            period: st.period,
                            phase: st.label,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`flex-1 rounded-xs transition-opacity hover:opacity-100 ${bg} ${
                          st.phase === 'peak' || st.phase === 'trough'
                            ? 'opacity-100 ring-1 ring-amber-300'
                            : 'opacity-75'
                        }`}
                        title={`${row.country.nameFr} (${st.period}) : ${st.label}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Info bar */}
      <div className="h-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
        {hoveredCell ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {hoveredCell.countryName}
            </span>
            <span>·</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
              {hoveredCell.period.replace('-Q', ' T')}
            </span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
              Phase : {hoveredCell.phase}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            Survolez un segment pour voir le détail ou cliquez sur une ligne pour sélectionner le pays.
          </span>
        )}
      </div>
    </div>
  );
};
