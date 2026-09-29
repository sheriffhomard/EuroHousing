/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Educational guide on housing market cycles, phases, drawdowns and recovery dynamics.
 */

import React from 'react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Scale,
  Sparkles,
  Info,
  Calculator,
} from 'lucide-react';

export const CycleEducationalCard: React.FC = () => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
            Comprendre la Dynamique des Cycles Immobiliers
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fondements macroéconomiques, asymétrie temporelle et mécanisme de recouvrement des prix.
          </p>
        </div>
      </div>

      {/* 4 Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Phase 1: Expansion */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>1. Phase d'Expansion</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Durée typique : <strong>12 à 28 trimestres (3 à 7 ans)</strong>. Période portée par des conditions de crédit favorables, une croissance des revenus et une demande soutenue. Les prix montent progressivement et durablement.
          </p>
        </div>

        {/* Phase 2: Peak */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
            <span className="text-base font-extrabold">▲</span>
            <span>2. Sommet (Pic)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Moment où le marché atteint son paroxysme de valorisation. Les volumes de transactions commencent à s'essouffler avant que les prix ne basculent, souvent déclenché par un resserrement monétaire (ex : hausse des taux directeurs en 2022).
          </p>
        </div>

        {/* Phase 3: Contraction */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
            <TrendingDown className="w-4 h-4" />
            <span>3. Phase de Correction</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Durée typique : <strong>4 à 12 trimestres (1 à 3 ans)</strong>. Baisse des prix nominaux ou réels. C'est durant cette phase qu'est mesuré le <em>Max Drawdown</em> (perte maximale depuis le sommet).
          </p>
        </div>

        {/* Phase 4: Recovery */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
            <RotateCcw className="w-4 h-4" />
            <span>4. Phase de Reprise</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Rebond à partir du creux (trough). La durée de recouvrement correspond au nombre de trimestres nécessaires pour que l'indice dépasse à nouveau son sommet précédent.
          </p>
        </div>
      </div>

      {/* Two deep-dive callout blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Callout 1: Asymétrie des durées */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Scale className="w-4 h-4 text-indigo-500" />
            <span>L'asymétrie temporelle : Hausse lente vs Ajustement rapide</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            En Europe, les phases de hausse durent en moyenne <strong>2 à 3 fois plus longtemps</strong> que les phases de contraction. L'ajustement des prix résidentiels se fait souvent sous la forme d'un choc concentré sur 6 à 10 trimestres consécutifs, alors que la phase de hausse précédente s'était étalée sur 20 à 30 trimestres.
          </p>
        </div>

        {/* Callout 2: Mathématiques du recouvrement */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Calculator className="w-4 h-4 text-amber-500" />
            <span>La règle mathématique du rattrapage (Drawdown vs Recovery)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            L'effort requis pour effacer une baisse est toujours supérieur au pourcentage de la baisse elle-même :
            <br />
            • Une baisse de <strong>-10%</strong> requiert une hausse de <strong>+11,1%</strong>.
            <br />
            • Une baisse de <strong>-20%</strong> requiert une hausse de <strong>+25,0%</strong>.
            <br />
            • Une baisse de <strong>-30%</strong> requiert une hausse de <strong>+42,9%</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
