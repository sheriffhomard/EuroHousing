/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ExternalLink, Calculator, RefreshCw, Database, Layers } from 'lucide-react';

interface MethodologyPageProps {
  lastUpdated: string;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ lastUpdated }) => {
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

      {/* Real HPI Calculation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
            04
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Calcul de l'Indice Immobilier Réel (Real HPI)
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              House Price Index adjusted for consumer-price inflation
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Le <strong>HPI réel</strong> mesure le pouvoir d'achat net du patrimoine immobilier une fois neutralisée la dépréciation monétaire générale (inflation). Lorsque les deux indices partagent la même année de référence (2015 = 100), la formule exacte appliquée est :
          </p>
          <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-center">
            <div className="text-sm font-semibold text-purple-400">
              HPI_réel(t) = [ HPI_nominal(t) / HICP(t) ] × 100
            </div>
          </div>
          <p>
            Une valeur du HPI réel supérieure à 100 (sur la base choisie) indique que le prix des logements a progressé plus vite que le coût de la vie général des ménages (gain réel de valeur). À l'inverse, une valeur inférieure à 100 indique une baisse du prix réel des logements.
          </p>
        </div>
      </div>

      {/* PWA & Offline Strategy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm shrink-0">
            05
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
    </div>
  );
};
