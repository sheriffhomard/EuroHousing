/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Four Distinct Indicators Grid
 * - HPI nominal : Évolution des prix immobiliers
 * - HPI réel : Évolution des prix relativement à l'inflation générale
 * - Variation annuelle : Évolution sur les quatre derniers trimestres
 * - Variation cumulée : Évolution depuis une date de référence
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  Scale,
  Calendar,
  Layers,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Calculator,
} from 'lucide-react';
import { CountryTimeSeries, IndicatorMode } from '../../data/types';
import { Tooltip } from '../Common/Tooltip';
import { CalculationAuditModal } from '../Common/CalculationAuditModal';

interface StatCardsGridProps {
  series: CountryTimeSeries;
  activeIndicator?: IndicatorMode;
  onSelectIndicator?: (indicator: IndicatorMode) => void;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = ({
  series,
  activeIndicator,
  onSelectIndicator,
}) => {
  const [showAuditModal, setShowAuditModal] = useState(false);
  const latest = series.latestObservation;
  const observations = series.observations;
  const first = observations.length > 0 ? observations[0] : undefined;

  const hpiVal = latest?.hpi.total ?? null;
  const realVal = latest?.realHpi ?? null;
  const yoyVal = latest?.hpiYoY ?? null;
  const realYoyVal = latest?.realHpiYoY ?? null;

  // Cumulative growth over the currently displayed observations
  const hpiGrowth =
    first?.hpi.total && latest?.hpi.total
      ? Number((((latest.hpi.total - first.hpi.total) / first.hpi.total) * 100).toFixed(1))
      : null;

  const realGrowth =
    first?.realHpi && latest?.realHpi
      ? Number((((latest.realHpi - first.realHpi) / first.realHpi) * 100).toFixed(1))
      : null;

  const periodLabel = first && latest ? `${first.period} → ${latest.period}` : '';

  const renderDelta = (val: number | null, suffix = '%') => {
    if (val === null || val === undefined) return <span className="text-slate-400">N/D</span>;
    const isPos = val > 0;
    const isZero = val === 0;

    return (
      <span
        className={`inline-flex items-center gap-0.5 font-mono text-xs font-semibold tabular-nums ${
          isPos
            ? 'text-emerald-700 dark:text-emerald-400'
            : isZero
            ? 'text-slate-500'
            : 'text-rose-700 dark:text-rose-400'
        }`}
      >
        {isPos ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : isZero ? (
          <Minus className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        <span>{isPos ? `+${val}${suffix}` : `${val}${suffix}`}</span>
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {/* 4 Distinct Indicators Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. HPI Nominal */}
        <div
          onClick={() => onSelectIndicator && onSelectIndicator('hpi')}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 shadow-xs transition-all relative flex flex-col justify-between ${
            onSelectIndicator ? 'cursor-pointer hover:border-blue-400' : ''
          } ${
            activeIndicator === 'hpi'
              ? 'border-blue-600 ring-2 ring-blue-500/20 dark:border-blue-500'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-4 h-4 text-blue-600" />
                <span>HPI nominal</span>
                <Tooltip
                  title="Indicateur 1 : HPI nominal"
                  content="Ce qu'il mesure : Évolution des prix immobiliers bruts constatés sur les transactions de logements (neufs et existants). Base 100 = 2015 ou rebasée."
                />
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {latest?.period ?? '—'}
              </span>
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              Évolution des prix immobiliers
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {hpiVal !== null ? hpiVal.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono">indice</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Taux trimestriel (QoQ) :</span>
            {renderDelta(latest?.hpiQoQ ?? null)}
          </div>
        </div>

        {/* 2. HPI Réel */}
        <div
          onClick={() => onSelectIndicator && onSelectIndicator('real_hpi')}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 shadow-xs transition-all relative flex flex-col justify-between ${
            onSelectIndicator ? 'cursor-pointer hover:border-emerald-400' : ''
          } ${
            activeIndicator === 'real_hpi'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 dark:border-emerald-500'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>HPI réel</span>
                <Tooltip
                  title="Indicateur 2 : HPI réel"
                  content="Ce qu'il mesure : Évolution des prix relativement à l'inflation générale (HPI nominal déflaté par l'indice HICP). Attention : ce n'est pas une mesure directe du patrimoine net ou de la capacité d'un ménage à acheter un logement."
                />
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {latest?.period ?? '—'}
              </span>
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              Évolution relative à l'inflation
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {realVal !== null ? realVal.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono">indice déflaté</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Déflateur IPCH :</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {latest?.hicp ? latest.hicp.toFixed(1) : '—'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAuditModal(true);
                }}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline cursor-pointer"
                title="Vérifier le calcul de cette observation (formule, arrondi, cohérence)"
              >
                <Calculator className="w-3 h-3" />
                <span>Audit</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Variation Annuelle */}
        <div
          onClick={() => onSelectIndicator && onSelectIndicator('yoy')}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 shadow-xs transition-all relative flex flex-col justify-between ${
            onSelectIndicator ? 'cursor-pointer hover:border-indigo-400' : ''
          } ${
            activeIndicator === 'yoy'
              ? 'border-indigo-600 ring-2 ring-indigo-500/20 dark:border-indigo-500'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Variation annuelle</span>
                <Tooltip
                  title="Indicateur 3 : Variation annuelle"
                  content="Ce qu'il mesure : Évolution sur les quatre derniers trimestres (T vs T-4), soit le rythme de variation sur un an glissant."
                />
              </span>
              <span className="text-[10px] font-mono text-slate-400">1 an glissant</span>
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              Sur les quatre derniers trimestres
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
                  yoyVal && yoyVal > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : yoyVal && yoyVal < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {yoyVal !== null ? (yoyVal > 0 ? `+${yoyVal}%` : `${yoyVal}%`) : '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono">nominale</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Taux réel annuel :</span>
            {renderDelta(realYoyVal)}
          </div>
        </div>

        {/* 4. Variation Cumulée */}
        <div
          onClick={() => onSelectIndicator && onSelectIndicator('cumulative')}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 shadow-xs transition-all relative flex flex-col justify-between ${
            onSelectIndicator ? 'cursor-pointer hover:border-amber-400' : ''
          } ${
            activeIndicator === 'cumulative'
              ? 'border-amber-600 ring-2 ring-amber-500/20 dark:border-amber-500'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Variation cumulée</span>
                <Tooltip
                  title="Indicateur 4 : Variation cumulée"
                  content="Ce qu'il mesure : Évolution totale accumulée depuis la date de référence sélectionnée (ex : 2010 ou 2015) jusqu'au dernier trimestre disponible."
                />
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[90px]">
                {periodLabel || 'Depuis base'}
              </span>
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              Depuis la date de référence
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
                  hpiGrowth && hpiGrowth > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : hpiGrowth && hpiGrowth < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {hpiGrowth !== null ? (hpiGrowth > 0 ? `+${hpiGrowth}%` : `${hpiGrowth}%`) : '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono">nominale</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Cumulé réel :</span>
            {renderDelta(realGrowth)}
          </div>
        </div>
      </div>

      {/* Methodological Guidance Banner with Audit Trigger */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-slate-900 dark:text-white font-semibold">
              Distinction méthodologique :
            </strong>{' '}
            Le <strong>HPI réel</strong> mesure l'évolution des prix immobiliers <em>relativement à l'inflation générale</em> (panier de consommation HICP). Il ne mesure ni le patrimoine net ni le pouvoir d'achat immobilier des ménages (qui dépend de l'évolution des salaires et des taux de crédit).
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAuditModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 shrink-0 shadow-2xs transition cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Vérifier & Auditer les Calculs</span>
        </button>
      </div>

      {/* Interactive Calculation Audit Modal */}
      <CalculationAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        series={series}
        selectedObservation={latest}
      />
    </div>
  );
};
