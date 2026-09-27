/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Calculator, Home, ShoppingCart, Scale, Sliders, ArrowRight, Coins, Percent } from 'lucide-react';

interface ContextualHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMethodology?: () => void;
}

export const ContextualHelpModal: React.FC<ContextualHelpModalProps> = ({
  isOpen,
  onClose,
  onNavigateToMethodology,
}) => {
  if (!isOpen) return null;

  const topics = [
    {
      icon: <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'HPI Nominal (House Price Index)',
      subtitle: 'Dataset Eurostat prc_hpi_q',
      content:
        "Mesure l'évolution globale des prix d'acquisition des logements résidentiels (maisons et appartements). Il reflète les prix bruts du marché sans tenir compte de la dépréciation monétaire.",
    },
    {
      icon: <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: 'Inflation HICP (Harmonised Index of Consumer Prices)',
      subtitle: 'Dataset Eurostat prc_hicp_midx (COICOP CP00)',
      content:
        "Indice officiel mesurant le coût d'un panier harmonisé de biens et services de consommation. Pour être comparé au HPI trimestriel, l'indice trimestriel est calculé comme la moyenne arithmétique des 3 mois civils du trimestre.",
    },
    {
      icon: <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'HPI Réel (Corrigé de l’Inflation)',
      subtitle: 'Formule : (HPI nominal / HICP) × 100',
      content:
        "Indicateur fondamental : mesure si l'immobilier gagne ou perd de la valeur en termes réels de pouvoir d'achat. Un indice supérieur à 100 (sur la base choisie) indique une surperformance des logements par rapport au coût de la vie général.",
    },
    {
      icon: <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'Rebasification Dynamique Base 100',
      subtitle: 'Base 2015, Base 2010 ou Début de Période',
      content:
        "Permet de réinitialiser instantanément l'indice de référence à 100 à une date clé. Cela facilite la comparaison directe entre pays et entre indicateurs sans altérer les données sources officielles d'Eurostat.",
    },
    {
      icon: <Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: 'Price-to-Income Ratio (PIR)',
      subtitle: 'Ratio Prix des Logements / Revenus des Ménages',
      content:
        "Indicateur d'accessibilité fondamental (OCDE / Eurostat). Il rapporte l'indice des prix d'acquisition au revenu disponible brut des ménages. Un ratio au-dessus de 100 signale que le logement s'éloigne du pouvoir d'achat des résidents.",
    },
    {
      icon: <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'Taux de Crédit & Capacité d’Emprunt',
      subtitle: 'Statistiques BCE MIR & Règle des 35% HCSF',
      content:
        "Chaque hausse de 1% des taux d'intérêt réduit le capital empruntable d'environ 8% à 10% pour une mensualité donnée. La règle prudentielle européenne recommande un taux d'effort ne dépassant pas 35% des revenus nets.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Aide Contextuelle & Glossaire Économique
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guide des concepts et méthodologies statistiques utilisés
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Topics */}
        <div className="p-6 overflow-y-auto space-y-4">
          {topics.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2.5">
                {t.icon}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t.title}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                    {t.subtitle}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {t.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
          {onNavigateToMethodology && (
            <button
              onClick={() => {
                onClose();
                onNavigateToMethodology();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Consulter la page Méthodologie complète</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
