/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Calculator,
  RefreshCw,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sliders,
} from 'lucide-react';
import { CalculationAuditModal } from '../components/Common/CalculationAuditModal';

interface MethodologyPageProps {
  lastUpdated: string;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ lastUpdated }) => {
  const [showAuditModal, setShowAuditModal] = useState(false);
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Introduction Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Méthodologie & Sources Officielles
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Cette application extrait, normalise et met en perspective les données statistiques officielles produites par l'Office statistique de l'Union européenne (<strong>Eurostat</strong>). Elle a pour but de fournir une analyse rigoureuse et transparente de l'évolution des prix résidentiels et de l'inflation en Europe depuis 2010.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dernière synchronisation des données : <strong>{lastUpdated}</strong></span>
          </span>
          <a
            href="https://ec.europa.eu/eurostat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            <span>Documentation Eurostat</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Dataset 1: HPI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            01
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Indice des Prix des Logements (HPI — House Price Index)
            </h2>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              Code dataset Eurostat : <code>prc_hpi_q</code> · Granularité trimestrielle
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            L'indice <strong>House Price Index (HPI)</strong> mesure l'évolution des prix de transaction de tous les logements résidentiels acquis par les ménages (appartements et maisons individuelles), neufs et anciens, qu'ils soient destinés à l'habitation propre ou à l'investissement locatif.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Dimensions Eurostat utilisées :</h4>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <li><code>purchase = TOTAL</code> : ensemble du marché résidentiel.</li>
              <li><code>purchase = DW_NEW</code> : logements neufs uniquement.</li>
              <li><code>purchase = DW_EXST</code> : logements anciens (existants).</li>
              <li><code>unit = I15_Q</code> : indice trimestriel avec base officielle 2015 = 100.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dataset 2: HICP */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
            02
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Indice des Prix à la Consommation Harmonisé (HICP / IPCH)
            </h2>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              Code dataset Eurostat : <code>prc_hicp_midx</code> · Granularité mensuelle
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            L'indice <strong>HICP (Harmonised Index of Consumer Prices)</strong> fournit la mesure officielle de l'inflation des prix à la consommation dans l'Union européenne et la zone euro. Il repose sur une nomenclature harmonisée (COICOP) permettant une comparabilité internationale rigoureuse.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Paramètres de requête :</h4>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <li><code>coicop = CP00</code> : Indice d'ensemble de tous les biens et services de consommation.</li>
              <li><code>unit = I15</code> : Indice mensuel standardisé sur base 2015 = 100.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Aggregation Method */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
            03
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Méthode d'Agrégation Trimestrielle de l'Inflation (HICP)
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Transformation statistiquement cohérente de la granularité mensuelle à trimestrielle
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Le HPI étant publié à une fréquence <strong>trimestrielle</strong> et le HICP à une fréquence <strong>mensuelle</strong>, une conversion mathématique est indispensable pour permettre une comparaison rigoureuse.
          </p>
          <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-center">
            <div className="text-sm font-semibold text-emerald-400">
              HICP_Q(y, q) = ( HICP_M1 + HICP_M2 + HICP_M3 ) / 3
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Moyenne arithmétique des indices des trois mois civils constituant le trimestre
            </div>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>Q1</strong> : moyenne des mois de janvier, février et mars.</li>
            <li><strong>Q2</strong> : moyenne des mois d'avril, mai et juin.</li>
            <li><strong>Q3</strong> : moyenne des mois de juillet, août et septembre.</li>
            <li><strong>Q4</strong> : moyenne des mois d'octobre, novembre et décembre.</li>
          </ul>
        </div>
      </div>

      {/* Dedicated Section: The 4 Distinct Indicators */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            ★
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Les Quatre Indicateurs Fondamentaux de l'Observatoire
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Définition précise et périmètre de mesure de chaque indicateur
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Indicateur</th>
                <th className="py-2.5 px-3">Ce qu'il mesure</th>
                <th className="py-2.5 px-3">Formule / Source</th>
                <th className="py-2.5 px-3">Interprétation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                  HPI nominal
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  Évolution des prix immobiliers
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                  Eurostat prc_hpi_q (base 100)
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Mesure brute des prix de transaction des logements neufs et existants.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                  HPI réel
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  Évolution des prix relativement à l'inflation générale
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                  (HPI / HICP) × 100
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Rapport entre prix des logements et panier général des biens de consommation.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                  Variation annuelle
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  Évolution sur les quatre derniers trimestres
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                  ((I_T - I_T-4) / I_T-4) × 100
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Rythme annuel glissant (YoY) filtrant la saisonnalité intra-annuelle.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                  Variation cumulée
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  Évolution depuis une date de référence
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                  ((I_T - I_base) / I_base) × 100
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Croissance globale accumulée depuis la date choisie (ex : 2010 ou 2015).
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Essential Methodological Warning on Real HPI */}
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>⚠️ Avertissement méthodologique sur le HPI réel :</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            Il convient d'éviter formellement d'assimiler le <strong>HPI réel</strong> à une mesure directe du patrimoine net ou du pouvoir d'achat immobilier d'un ménage. Le HPI réel mesure strictement l'évolution des prix immobiliers <em>relativement à l'inflation générale des biens et services</em> (déflateur IPCH/HICP). Il ne mesure pas la capacité réelle d'un ménage à acquérir un logement, laquelle dépend des revenus disponibles et des conditions de crédit (taux d'intérêt et durée d'emprunt, analysés dans la section Accessibilité).
          </p>
        </div>
      </div>

      {/* Real HPI Calculation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
            04
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Calcul du HPI Réel (Évolution des Prix Relativement à l'Inflation)
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              House Price Index deflated by Harmonised Index of Consumer Prices
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Le <strong>HPI réel</strong> mesure l'évolution des prix immobiliers relativement au coût du panier de consommation générale. Lorsque les deux indices partagent la même année de référence (2015 = 100), la formule appliquée est :
          </p>
          <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-center">
            <div className="text-sm font-semibold text-purple-400">
              HPI_réel(t) = [ HPI_nominal(t) / HICP(t) ] × 100
            </div>
          </div>
          <p>
            Une valeur du HPI réel supérieure à 100 (sur la base choisie) indique que le prix des logements a progressé plus vite que l'indice général des prix à la consommation. À l'inverse, une valeur inférieure à 100 indique que la hausse des prix immobiliers a été inférieure à l'inflation générale.
          </p>
        </div>
      </div>

      {/* Section 05: Calculation Verifiability, Integrity Controls & Rounding Rules */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
              05
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Vérifiabilité des Calculs, Contrôles d'Intégrité & Règles d'Arrondi
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Auditabilité des formules, élimination des artefacts flottants et robustesse statistique
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Ouvrir l'outil d'audit</span>
          </button>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
          <p>
            Pour garantir une fiabilité statistique absolue, chaque observation calculée fait l'objet de <strong>cinq vérifications algorithmiques préalables</strong> avant d'être restituée à l'écran :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Cohérence des périodes temporelles</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Interdiction absolue de calculer un ratio entre des trimestres différents. Le dénominateur HICP mensuel agrégé correspond exactement aux 3 mois civils du trimestre HPI (ex : <code>2024-Q1</code> avec <code>2024-Q1</code>).
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Concordance des bases d'indices</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Les séries doivent partager la même référence de base (ex: 2015 = 100). En cas de rebasification dynamique, les deux séries sont réétalonnées de manière strictement synchrone pour préserver la transitivité mathématique.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Contrôle des valeurs nulles ou division par zéro</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Le dénominateur HICP doit être strictement positif (<code>HICP &gt; 0</code>). Si le dénominateur est nul ou non disponible, le calcul retourne immédiatement une valeur nulle sécurisée avec code d'erreur explicite.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>4. Contrôle des valeurs manquantes ou négatives</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Un indice de prix économique ne pouvant être négatif, toute valeur <code>&lt; 0</code>, <code>NaN</code>, ou infinie est interceptée et signalée comme anomalie de données.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Règle d'arrondi officielle Eurostat (Half-Up) :</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Conformément aux standards de publication d'Eurostat, les calculs internes opèrent en double précision 64 bits (IEEE-754). Le résultat est ensuite arrondi par <strong>arrondi arithmétique demi-supérieur (*half-up*) à 2 décimales</strong>. Une normalisation exponentielle est systématiquement appliquée pour neutraliser les dérives de précision binaire propres aux processeurs.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Gestion des révisions statistiques ultérieures :</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Les données trimestrielles les plus récentes diffusées par Eurostat comportent souvent un statut provisoire (flag <code>p</code>). L'observatoire est conçu pour intégrer sans friction les révisions rétroactives lors de chaque cycle de dissémination, recalculant de façon idempotente les taux annuels et cumulés sans dégrader l'historique non révisé.
            </p>
          </div>
        </div>
      </div>

      {/* PWA & Offline Strategy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm shrink-0">
            06
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Architecture PWA & Disponibilité Hors Connexion
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Service Worker, Web App Manifest et mise en cache IndexedDB
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Cette application est une <strong>Progressive Web App (PWA)</strong> conforme aux spécifications du W3C :
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>Installation</strong> : installable directement sur bureau (Chrome, Edge) et mobile (iOS Safari via « Sur l'écran d'accueil », Android via prompt PWA).</li>
            <li><strong>Mise en cache IndexedDB</strong> : chaque requête de données réussie est enregistrée localement dans la base de données IndexedDB du navigateur.</li>
            <li><strong>Données de démarrage (Bootstrap)</strong> : un instantané pré-compilé des séries Eurostat est intégré au bundle pour garantir un premier affichage instantané et un fonctionnement 100% autonome hors ligne.</li>
            <li><strong>Pérennité post-2025</strong> : les requêtes d'actualisation interrogent dynamiquement Eurostat sans borne fixe, intégrant automatiquement les trimestres futurs dès leur publication officielle.</li>
          </ul>
        </div>
      </div>

      {/* Interactive Calculation Audit Modal */}
      <CalculationAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
      />
    </div>
  );
};
