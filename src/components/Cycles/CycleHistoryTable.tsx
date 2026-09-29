/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Historical Cycles Table for selected country
 * Displays peaks, troughs, expansion durations, max drawdowns, and recovery times.
 */

import React from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { HistoricalCycle, CountryCycleAnalysis } from '../../services/cycleAnalysis';

interface CycleHistoryTableProps {
  analysis: CountryCycleAnalysis;
}

export const CycleHistoryTable: React.FC<CycleHistoryTableProps> = ({ analysis }) => {
  const { cycles, country, metric } = analysis;

  if (cycles.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
        Aucun cycle complet détecté sur cette période pour {country.nameFr}.
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Historique Détaillé
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">{country.nameFr}</span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
            Tableau des Cycles Historiques & Durées de Recouvrement
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Décomposition chronologique de chaque pic cyclique : hausse préalable, creux atteint, baisse maximale et temps de retour au sommet.
          </p>
        </div>

        {/* Quick summary pill */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {analysis.averageRecoveryDurationQuarters
              ? `Temps moyen de recouvrement : ${analysis.averageRecoveryDurationQuarters} trimestres (${(analysis.averageRecoveryDurationQuarters / 4).toFixed(1)} ans)`
              : 'Dernier cycle en cours de recouvrement'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 font-bold">Cycle</th>
              <th className="py-2.5 px-3 font-bold">Creux initial</th>
              <th className="py-2.5 px-3 font-bold">Sommet (Pic)</th>
              <th className="py-2.5 px-3 font-bold">Durée Hausse</th>
              <th className="py-2.5 px-3 font-bold">Creux (Point bas)</th>
              <th className="py-2.5 px-3 font-bold">Baisse Max. (Drawdown)</th>
              <th className="py-2.5 px-3 font-bold">Durée Baisse</th>
              <th className="py-2.5 px-3 font-bold">Temps de Recouvrement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {cycles.map((c, idx) => {
              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  {/* Cycle Index */}
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>Cycle {c.peakPeriod.slice(0, 4)}</span>
                    </div>
                  </td>

                  {/* Prior Trough */}
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {c.priorTroughPeriod ? (
                      <div>
                        <span className="font-bold">{c.priorTroughPeriod.replace('-Q', ' T')}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Indice : {c.priorTroughValue?.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Origine</span>
                    )}
                  </td>

                  {/* Peak */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold">▲</span>
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {c.peakPeriod.replace('-Q', ' T')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Indice : {c.peakValue.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Expansion Duration & Amplitude */}
                  <td className="py-3 px-3">
                    {c.expansionDurationQuarters ? (
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {c.expansionDurationQuarters} T ({c.expansionDurationYears} ans)
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                          +{c.expansionAmplitudePercent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Trough */}
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {c.troughPeriod ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">▼</span>
                        <div>
                          <span className="font-bold">{c.troughPeriod.replace('-Q', ' T')}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Indice : {c.troughValue?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">En cours</span>
                    )}
                  </td>

                  {/* Max Drawdown */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-extrabold text-sm ${
                        c.maxDrawdownPercent < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {c.maxDrawdownPercent}%
                    </span>
                  </td>

                  {/* Contraction Duration */}
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-semibold">
                    {c.contractionDurationQuarters} T ({c.contractionDurationYears} ans)
                  </td>

                  {/* Recovery Status & Time */}
                  <td className="py-3 px-3">
                    {c.isRecovered ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {c.recoveryDurationQuarters} T ({c.recoveryDurationYears} ans)
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            Atteint en {c.recoveryPeriod?.replace('-Q', ' T')}
                          </span>
                        </div>
                      </div>
                    ) : c.status === 'ongoing_recovery' ? (
                      <div className="flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-amber-500 shrink-0 animate-spin-slow" />
                        <div>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            En reprise ({c.currentRecoveryPercent}% effacé)
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            Non encore recouvré
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            En correction
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            Sommet non dépassé
                          </span>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Averages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 text-[11px] block">Durée moyenne de hausse</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {analysis.averageExpansionDurationQuarters} trimestres (
            {(analysis.averageExpansionDurationQuarters / 4).toFixed(1)} ans)
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[11px] block">Durée moyenne de baisse</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {analysis.averageContractionDurationQuarters} trimestres (
            {(analysis.averageContractionDurationQuarters / 4).toFixed(1)} ans)
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[11px] block">Baisse maximale historique</span>
          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
            {analysis.historicalMaxDrawdownPercent}% (
            {analysis.historicalMaxDrawdownPeriod.peak.replace('-Q', ' T')} →{' '}
            {analysis.historicalMaxDrawdownPeriod.trough.replace('-Q', ' T')})
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[11px] block">Ratio Hausse / Baisse</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {analysis.ratioExpansionToContractionDuration}x plus long à monter qu'à baisser
          </span>
        </div>
      </div>
    </div>
  );
};
