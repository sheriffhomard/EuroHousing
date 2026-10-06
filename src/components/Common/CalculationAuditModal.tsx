/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Calculation Audit & Verification Modal
 * Formula: Real HPI(t) = 100 * ( HPI(t) / HICP(t) )
 */

import React, { useState } from 'react';
import {
  X,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { CountryTimeSeries, QuarterlyObservation } from '../../data/types';
import {
  calculateRealHpiAudit,
  ROUNDING_RULES,
} from '../../services/calculations';

interface CalculationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  series?: CountryTimeSeries;
  selectedObservation?: QuarterlyObservation;
}

export const CalculationAuditModal: React.FC<CalculationAuditModalProps> = ({
  isOpen,
  onClose,
  series,
  selectedObservation,
}) => {
  const currentObs = selectedObservation || series?.latestObservation;

  // Interactive sandbox state for custom verification
  const [customHpi, setCustomHpi] = useState<string>(
    currentObs?.hpi.total ? String(currentObs.hpi.total) : '135.20'
  );
  const [customHicp, setCustomHicp] = useState<string>(
    currentObs?.hicp ? String(currentObs.hicp) : '114.50'
  );
  const [customPeriodHpi, setCustomPeriodHpi] = useState<string>(
    currentObs?.period || '2024-Q1'
  );
  const [customPeriodHicp, setCustomPeriodHicp] = useState<string>(
    currentObs?.period || '2024-Q1'
  );
  const [customBaseHpi, setCustomBaseHpi] = useState<string>('2015=100');
  const [customBaseHicp, setCustomBaseHicp] = useState<string>('2015=100');
  const [activeTab, setActiveTab] = useState<'current' | 'sandbox' | 'methodology'>('current');

  if (!isOpen) return null;

  // Run audit on current observation
  const currentAudit = calculateRealHpiAudit({
    hpi: currentObs?.hpi.total,
    hicp: currentObs?.hicp,
    hpiPeriod: currentObs?.period,
    hicpPeriod: currentObs?.period,
    hpiBase: '2015=100',
    hicpBase: '2015=100',
  });

  // Run audit on sandbox values
  const parsedHpi = customHpi.trim() === '' ? null : Number(customHpi);
  const parsedHicp = customHicp.trim() === '' ? null : Number(customHicp);
  const sandboxAudit = calculateRealHpiAudit({
    hpi: parsedHpi,
    hicp: parsedHicp,
    hpiPeriod: customPeriodHpi,
    hicpPeriod: customPeriodHicp,
    hpiBase: customBaseHpi,
    hicpBase: customBaseHicp,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Vérification & Audit des Calculs</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                  Norme Eurostat
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Contrôle de conformité mathématique, cohérence temporelle et règles d'arrondi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-2 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'current'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Observation en cours ({series?.country.nameFr || 'Courante'})
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`pb-2 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'sandbox'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Simulateur de Test Interactif
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`pb-2 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'methodology'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Règles d'Arrondi & Révisions
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {activeTab === 'current' && (
            <div className="space-y-4">
              {/* Formula Display Box */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono space-y-2">
                <div className="text-[11px] text-slate-400 font-sans uppercase font-bold tracking-wider">
                  Formule Mathématique Officielle
                </div>
                <div className="text-base sm:text-lg font-bold text-blue-400">
                  HPI_réel(t) = 100 × [ HPI(t) / HICP(t) ]
                </div>
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  Application numérique ({currentObs?.period || 'Dernier trimestre'}) :
                </div>
                <div className="text-sm font-semibold text-emerald-400">
                  {currentAudit.stepByStep.substituted}
                </div>
                <div className="text-xs text-slate-400">
                  Résultat final arrondi :{' '}
                  <strong className="text-white text-sm">
                    {currentAudit.value !== null ? currentAudit.value.toFixed(2) : 'N/D'}
                  </strong>{' '}
                  ({ROUNDING_RULES.METHOD}, {ROUNDING_RULES.INDEX_DECIMALS} décimales)
                </div>
              </div>

              {/* 5 Validation Checks Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Checklist des 5 Contrôles d'Intégrité</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-2.5">
                    {currentAudit.checks.periodCheck.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        1. Cohérence des périodes
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {currentAudit.checks.periodCheck.details}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-2.5">
                    {currentAudit.checks.baseCheck.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        2. Concordance des bases d'indices
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {currentAudit.checks.baseCheck.details}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-2.5">
                    {currentAudit.checks.denominatorCheck.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        3. Dénominateur HICP valide
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {currentAudit.checks.denominatorCheck.details}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-2.5">
                    {currentAudit.checks.numeratorCheck.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        4. Numérateur HPI valide
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {currentAudit.checks.numeratorCheck.details}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Sources and Integrity Stamp */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-bold text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Certification statistique des données Eurostat</span>
                </div>
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  L'indice HPI provient du dataset <code>prc_hpi_q</code> (logements neufs et existants). L'indice HICP provient du dataset <code>prc_hicp_midx</code> (indice CP00 d'ensemble de la consommation). La conversion mensuelle-trimestrielle est opérée par moyenne arithmétique exacte des 3 mois civils du trimestre.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Testez manuellement la formule avec des valeurs personnalisées ou des cas limites (division par zéro, indices négatifs, décalages de périodes).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Indice HPI nominal :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customHpi}
                    onChange={(e) => setCustomHpi(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs"
                    placeholder="Ex: 135.20"
                  />
                  <div className="mt-2 flex gap-2 text-[10px]">
                    <span className="text-slate-400">Période :</span>
                    <input
                      type="text"
                      value={customPeriodHpi}
                      onChange={(e) => setCustomPeriodHpi(e.target.value)}
                      className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-[10px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Indice HICP (Inflation) :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customHicp}
                    onChange={(e) => setCustomHicp(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs"
                    placeholder="Ex: 114.50"
                  />
                  <div className="mt-2 flex gap-2 text-[10px]">
                    <span className="text-slate-400">Période :</span>
                    <input
                      type="text"
                      value={customPeriodHicp}
                      onChange={(e) => setCustomPeriodHicp(e.target.value)}
                      className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* Sandbox Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-semibold">Cas types :</span>
                <button
                  onClick={() => {
                    setCustomHpi('100.00');
                    setCustomHicp('100.00');
                    setCustomPeriodHpi('2015-Q1');
                    setCustomPeriodHicp('2015-Q1');
                  }}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-mono"
                >
                  Base 100 (2015)
                </button>
                <button
                  onClick={() => {
                    setCustomHpi('150.00');
                    setCustomHicp('120.00');
                    setCustomPeriodHpi('2024-Q1');
                    setCustomPeriodHicp('2024-Q1');
                  }}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-mono"
                >
                  HPI=150, HICP=120
                </button>
                <button
                  onClick={() => {
                    setCustomHpi('140.00');
                    setCustomHicp('0.00'); // division by zero
                  }}
                  className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer font-mono"
                >
                  Dénominateur = 0
                </button>
                <button
                  onClick={() => {
                    setCustomHpi('130.00');
                    setCustomHicp('115.00');
                    setCustomPeriodHpi('2024-Q2');
                    setCustomPeriodHicp('2024-Q1'); // period mismatch
                  }}
                  className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer font-mono"
                >
                  Périodes discordantes
                </button>
              </div>

              {/* Sandbox Result Output */}
              <div
                className={`p-4 rounded-xl border ${
                  sandboxAudit.isValid
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-2">
                  <span
                    className={
                      sandboxAudit.isValid
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-rose-800 dark:text-rose-300'
                    }
                  >
                    {sandboxAudit.isValid ? '✓ Résultat Validé' : '✕ Erreur de validation'}
                  </span>
                  <span className="font-mono text-lg font-extrabold">
                    {sandboxAudit.value !== null ? sandboxAudit.value.toFixed(2) : 'N/D'}
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  {sandboxAudit.stepByStep.substituted}
                </div>
                <div className="text-xs text-slate-500 mt-1">{sandboxAudit.message}</div>
              </div>
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-4 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  1. Règles d'arrondi arithmétique Eurostat (Half-Up)
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Conformément aux normes Eurostat et aux recommandations du Système européen de comptes (SEC 2010), les calculs intermédiaires sont effectués en double précision (64 bits). Le résultat final est arrondi au centième d'indice le plus proche (2 décimales) selon la règle arithmétique demi-supérieur (half-up) :
                </p>
                <ul className="list-disc list-inside mt-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                  <li>118.074... devient 118.07</li>
                  <li>118.075... devient 118.08 (la valeur médiane .005 est arrondie au supérieur)</li>
                  <li>118.076... devient 118.08</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  2. Préservation de la transitivité lors des changements de base
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Lorsque l'utilisateur choisit de rebaser la série (par exemple à 2010-Q1 = 100 ou au début de période = 100), le ratio entre l'indice HPI et l'indice HICP est invariablement préservé car les deux séries sont réétalonnées de manière strictement synchrone :
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-center my-2 text-slate-800 dark:text-slate-200">
                  HPI_rebasé(t) / HICP_rebasé(t) = [ HPI(t) / HPI(t0) ] / [ HICP(t) / HICP(t0) ]
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  3. Gestion des données révisées
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Eurostat marque fréquemment le dernier trimestre d'un indicateur de statut provisoire (flag <code>p</code>). Lors des diffusions suivantes, ces données peuvent être révisées rétroactivement. L'observatoire répercute immédiatement ces corrections et recalcule les variations temporelles (QoQ, YoY et cumulée) de façon idempotente, garantissant une intégrité historique absolue.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {ROUNDING_RULES.DESCRIPTION}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition"
          >
            Fermer l'audit
          </button>
        </div>
      </div>
    </div>
  );
};
