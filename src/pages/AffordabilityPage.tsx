/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Housing Affordability & Mortgage Observatory Page
 */

import React, { useState } from 'react';
import {
  Calculator,
  Coins,
  Key,
  Scissors,
  Percent,
  Download,
  Building,
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import {
  AFFORDABILITY_COUNTRIES,
  getCountryAffordability,
  CountryAffordabilityMetrics,
} from '../data/affordabilityData';
import { MortgageSimulator } from '../components/Affordability/MortgageSimulator';
import { PriceToIncomeSection } from '../components/Affordability/PriceToIncomeSection';
import { RentVsBuySection } from '../components/Affordability/RentVsBuySection';
import { WageVsHousingSection } from '../components/Affordability/WageVsHousingSection';
import { MortgageRatesHistorySection } from '../components/Affordability/MortgageRatesHistorySection';

type ActiveAffordabilityTab =
  | 'simulator'
  | 'price_to_income'
  | 'rents'
  | 'wages'
  | 'mortgage_rates';

export const AffordabilityPage: React.FC = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('FR');
  const [activeTab, setActiveTab] = useState<ActiveAffordabilityTab>('simulator');

  const country = getCountryAffordability(selectedCountryCode);

  // Export current country affordability series as CSV
  const handleExportCSV = () => {
    const headers = [
      'Trimestre',
      'Pays',
      'Taux_Credit_BCE_Pct',
      'Indice_Loyers_2015_100',
      'Indice_Salaires_2015_100',
      'Indice_Salaires_Reels',
      'Indice_PIR_Price_To_Income',
      'Indice_HPI_Prix_Logements',
    ];

    const rows = country.observations.map((o) => [
      o.period,
      country.nameFr,
      o.mortgageRate.toFixed(2),
      o.rentIndex.toFixed(1),
      o.wageIndex.toFixed(1),
      o.realWageIndex.toFixed(1),
      o.priceToIncomeIndex.toFixed(1),
      o.hpiIndex.toFixed(1),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `euro_housing_accessibilite_${country.countryCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Module Title & Country Selector */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Observatoire Macro-Financier
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500">Eurostat & BCE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Indicateur d'Accessibilité au Logement & Pouvoir d'Achat
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
              Une hausse des prix ne suffit pas à mesurer la difficulté d'achat. Ce module confronte les prix des logements aux <strong>revenus des ménages</strong>, à l'<strong>évolution des loyers</strong>, aux <strong>taux de crédit immobilier</strong> et à la <strong>progression réelle des salaires</strong>.
            </p>
          </div>

          {/* Country Switcher & Export */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            <div className="relative">
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {AFFORDABILITY_COUNTRIES.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.flag} {c.nameFr}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              title="Exporter les données d'accessibilité en CSV"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 5 Thematic Navigation Sub-tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Simulateur d'Emprunt & Scénarios</span>
          </button>

          <button
            onClick={() => setActiveTab('price_to_income')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'price_to_income'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Prix / Revenus (Effort d'Achat)</span>
          </button>

          <button
            onClick={() => setActiveTab('rents')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'rents'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Évolution des Loyers vs Achat</span>
          </button>

          <button
            onClick={() => setActiveTab('wages')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'wages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Salaires vs Prix (Effet Ciseau)</span>
          </button>

          <button
            onClick={() => setActiveTab('mortgage_rates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'mortgage_rates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Taux de Crédit BCE (2015-2026)</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {activeTab === 'simulator' && <MortgageSimulator country={country} />}

        {activeTab === 'price_to_income' && (
          <PriceToIncomeSection
            selectedCountry={country}
            onSelectCountry={(c) => setSelectedCountryCode(c)}
          />
        )}

        {activeTab === 'rents' && <RentVsBuySection country={country} />}

        {activeTab === 'wages' && <WageVsHousingSection country={country} />}

        {activeTab === 'mortgage_rates' && (
          <MortgageRatesHistorySection
            country={country}
            onSelectCountry={(c) => setSelectedCountryCode(c)}
          />
        )}
      </div>

      {/* Footer Methodology Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            Données calibrées selon les publications officielles d'Eurostat (LCI, HICP, HPI) et les statistiques MIR de la Banque Centrale Européenne. Formules financières normalisées aux standards de l'Autorité Bancaire Européenne (EBA).
          </span>
        </div>
      </div>
    </div>
  );
};
