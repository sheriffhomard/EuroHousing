/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Financial mortgage simulator & scenario comparison
 */

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Percent,
  Euro,
  Calendar,
  Building2,
  Scale,
} from 'lucide-react';
import {
  calculateMortgage,
  MortgageScenarioParams,
  CountryAffordabilityMetrics,
} from '../../data/affordabilityData';

interface MortgageSimulatorProps {
  country: CountryAffordabilityMetrics;
}

export const MortgageSimulator: React.FC<MortgageSimulatorProps> = ({ country }) => {
  // Simulator inputs
  const [propertyPrice, setPropertyPrice] = useState<number>(260000);
  const [downPayment, setDownPayment] = useState<number>(40000);
  const [durationYears, setDurationYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(country.currentMortgageRate);
  const [insuranceRate, setInsuranceRate] = useState<number>(0.32);
  const [householdIncome, setHouseholdIncome] = useState<number>(country.averageHouseholdIncomeMonthly);

  // Active current calculation
  const currentResult = useMemo(() => {
    return calculateMortgage({
      propertyPrice,
      downPayment,
      durationYears,
      interestRateAnnual: interestRate,
      insuranceRateAnnual: insuranceRate,
      householdIncomeMonthly: householdIncome,
    });
  }, [propertyPrice, downPayment, durationYears, interestRate, insuranceRate, householdIncome]);

  // Comparative scenarios at fixed duration and capital:
  // Scenario 1: Historic 2021 floor (1.2%)
  const scenario2021 = useMemo(() => {
    return calculateMortgage({
      propertyPrice,
      downPayment,
      durationYears,
      interestRateAnnual: 1.2,
      insuranceRateAnnual: insuranceRate,
      householdIncomeMonthly: householdIncome,
    });
  }, [propertyPrice, downPayment, durationYears, insuranceRate, householdIncome]);

  // Scenario 2: Current benchmark (e.g. 3.5%)
  const scenarioCurrent = useMemo(() => {
    return calculateMortgage({
      propertyPrice,
      downPayment,
      durationYears,
      interestRateAnnual: 3.5,
      insuranceRateAnnual: insuranceRate,
      householdIncomeMonthly: householdIncome,
    });
  }, [propertyPrice, downPayment, durationYears, insuranceRate, householdIncome]);

  // Scenario 3: High interest environment (4.5%)
  const scenarioHigh = useMemo(() => {
    return calculateMortgage({
      propertyPrice,
      downPayment,
      durationYears,
      interestRateAnnual: 4.5,
      insuranceRateAnnual: insuranceRate,
      householdIncomeMonthly: householdIncome,
    });
  }, [propertyPrice, downPayment, durationYears, insuranceRate, householdIncome]);

  // Loss of borrowing capacity calculation (for the exact same monthly payment of Scenario 2021)
  const targetMonthlyPayment = scenario2021.monthlyPaymentTotal;
  const borrowableTodayForTargetPayment = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = durationYears * 12;
    const netMonthlyForLoan = targetMonthlyPayment * 0.88; // after insurance
    if (monthlyRate <= 0) return netMonthlyForLoan * totalMonths;
    const capital =
      (netMonthlyForLoan * (1 - Math.pow(1 + monthlyRate, -totalMonths))) / monthlyRate;
    return Math.round(capital);
  }, [interestRate, durationYears, targetMonthlyPayment]);

  const capitalLoss = Math.max(0, currentResult.loanAmount - borrowableTodayForTargetPayment);
  const m2Loss = Math.round(capitalLoss / (country.averageSquareMeterPrice || 3000));

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Simulateur d'Emprunt & Choc des Taux d'Intérêt</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Évaluez l'impact direct de la hausse des taux de crédit sur la mensualité, le coût du prêt et la capacité d'achat en m².
          </p>
        </div>

        {/* Quick Rate Presets */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Préréglages de taux :</span>
          <button
            onClick={() => setInterestRate(1.2)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer border ${
              interestRate === 1.2
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
            }`}
          >
            Plancher 2021 (1.20%)
          </button>
          <button
            onClick={() => setInterestRate(country.currentMortgageRate)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer border ${
              interestRate === country.currentMortgageRate
                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
            }`}
          >
            Actuel ({country.currentMortgageRate.toFixed(2)}%)
          </button>
          <button
            onClick={() => setInterestRate(4.5)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer border ${
              interestRate === 4.5
                ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
            }`}
          >
            Taux haut (4.50%)
          </button>
        </div>
      </div>

      {/* Main Grid: Controls (Left) vs Results Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-5 space-y-4 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="font-semibold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Paramètres du Financement
          </div>

          {/* Property Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="prop-price" className="font-medium text-slate-700 dark:text-slate-300">
                Prix d'acquisition du bien
              </label>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatEuro(propertyPrice)}
              </span>
            </div>
            <input
              id="prop-price"
              type="range"
              min={80000}
              max={800000}
              step={5000}
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>80 000 €</span>
              <span>400 000 €</span>
              <span>800 000 €</span>
            </div>
          </div>

          {/* Down Payment */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="down-payment" className="font-medium text-slate-700 dark:text-slate-300">
                Apport personnel ({Math.round((downPayment / propertyPrice) * 100)}%)
              </label>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatEuro(downPayment)}
              </span>
            </div>
            <input
              id="down-payment"
              type="range"
              min={0}
              max={Math.min(propertyPrice, 300000)}
              step={5000}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 € (100% emprunté)</span>
              <span>Capital emprunté : {formatEuro(currentResult.loanAmount)}</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Durée du prêt immobilier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[12, 15, 20, 25].map((years) => (
                <button
                  key={years}
                  type="button"
                  onClick={() => setDurationYears(years)}
                  className={`py-2 text-xs rounded-xl border font-semibold transition cursor-pointer ${
                    durationYears === years
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  {years} ans
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate & Insurance Rate */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="interest-rate" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Taux nominal</span>
                <span className="text-[10px] text-slate-400">(%)</span>
              </label>
              <div className="relative">
                <input
                  id="interest-rate"
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="12.0"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full pl-3 pr-7 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Percent className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="insurance-rate" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Assurance</span>
                <span className="text-[10px] text-slate-400">(%)</span>
              </label>
              <div className="relative">
                <input
                  id="insurance-rate"
                  type="number"
                  step="0.02"
                  min="0.05"
                  max="2.0"
                  value={insuranceRate}
                  onChange={(e) => setInsuranceRate(Number(e.target.value))}
                  className="w-full pl-3 pr-7 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Percent className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Household Monthly Income */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <label htmlFor="household-income" className="font-medium text-slate-700 dark:text-slate-300">
                Revenus nets mensuels du ménage
              </label>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatEuro(householdIncome)}
              </span>
            </div>
            <input
              id="household-income"
              type="range"
              min={1500}
              max={12000}
              step={100}
              value={householdIncome}
              onChange={(e) => setHouseholdIncome(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 500 €</span>
              <span>Moyenne {country.nameFr} : {formatEuro(country.averageHouseholdIncomeMonthly)}</span>
              <span>12 000 €</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Results & Financial Gauges */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Key Metric Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Mensualité Totale Estimée (Crédit + Assurance)
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono tracking-tight">
                  {formatEuro(currentResult.monthlyPaymentTotal)}
                  <span className="text-sm font-normal text-slate-400 ml-1">/mois</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dont crédit : <strong>{formatEuro(currentResult.monthlyPaymentLoan)}</strong> · Dont assurance :{' '}
                  <strong>{formatEuro(currentResult.monthlyPaymentInsurance)}</strong>
                </div>
              </div>

              {/* Debt-to-Income / Taux d'effort Badge & Gauge */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 min-w-[190px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Taux d'endettement :</span>
                  <span
                    className={`font-mono font-bold ${
                      currentResult.isWithinRegulatoryLimit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {currentResult.debtToIncomeRatio}%
                  </span>
                </div>

                {/* Progress bar with 35% threshold marker */}
                <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentResult.isWithinRegulatoryLimit
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentResult.debtToIncomeRatio / 50) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                  {currentResult.isWithinRegulatoryLimit ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                        Conforme (Seuil légal $\le$ 35%)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="text-rose-700 dark:text-rose-300 font-medium">
                        Seuil de risque dépassé (&gt; 35%)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Capital emprunté</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatEuro(currentResult.loanAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Coût des intérêts</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatEuro(currentResult.totalLoanInterest)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Coût total crédit</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatEuro(currentResult.totalCostOfCredit)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reste à vivre</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatEuro(currentResult.residualIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Purchasing Power Impact Alert */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              <span>Chiffrage de la perte de pouvoir d'achat immobilier :</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Pour la <strong>même mensualité</strong> qu'en 2021 ({formatEuro(scenario2021.monthlyPaymentTotal)}/mois à 1.20%), vous ne pouvez emprunter que{' '}
              <strong>{formatEuro(borrowableTodayForTargetPayment)}</strong> au taux actuel de {interestRate}%.
              Soit une <strong>perte sèche de capacité d'emprunt de {formatEuro(capitalLoss)}</strong>, ce qui correspond à environ{' '}
              <strong>-{m2Loss} m²</strong> de surface habitable au prix moyen du mètre carré en {country.nameFr}.
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Scenarios Matrix */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Comparatif Multi-Scénarios : L'impact de la remontée des taux
          </div>
          <span className="text-[11px] text-slate-400">Pour un emprunt de {formatEuro(currentResult.loanAmount)} sur {durationYears} ans</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario 1: 2021 Historic Floor */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800/90 shadow-2xs relative">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Scénario 2021 (Taux d'Or)</span>
              <span className="font-mono bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-[11px]">1.20%</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
              {formatEuro(scenario2021.monthlyPaymentTotal)}
              <span className="text-xs font-normal text-slate-400">/m</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
              <div className="flex justify-between">
                <span>Coût total intérêts :</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatEuro(scenario2021.totalLoanInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taux d'effort ménage :</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {scenario2021.debtToIncomeRatio}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Capacité max (35%) :</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatEuro(scenario2021.maxBorrowingCapacityAt35)}
                </span>
              </div>
            </div>
          </div>

          {/* Scenario 2: Current Benchmark */}
          <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs relative">
            <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Scénario Marché Actuel</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </span>
              <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-[11px]">
                {interestRate.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-2">
              {formatEuro(currentResult.monthlyPaymentTotal)}
              <span className="text-xs font-normal text-slate-400">/m</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-blue-200/60 dark:border-blue-800/60 pt-2.5">
              <div className="flex justify-between">
                <span>Coût total intérêts :</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatEuro(currentResult.totalLoanInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taux d'effort ménage :</span>
                <span
                  className={`font-mono font-semibold ${
                    currentResult.isWithinRegulatoryLimit ? 'text-blue-600' : 'text-rose-600'
                  }`}
                >
                  {currentResult.debtToIncomeRatio}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Surcoût vs 2021 :</span>
                <span className="font-mono font-semibold text-rose-600">
                  +{formatEuro(currentResult.totalLoanInterest - scenario2021.totalLoanInterest)}
                </span>
              </div>
            </div>
          </div>

          {/* Scenario 3: High Rates (4.5%) */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800/90 shadow-2xs relative">
            <div className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center justify-between">
              <span>Scénario Taux Durci</span>
              <span className="font-mono bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded text-[11px]">4.50%</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
              {formatEuro(scenarioHigh.monthlyPaymentTotal)}
              <span className="text-xs font-normal text-slate-400">/m</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
              <div className="flex justify-between">
                <span>Coût total intérêts :</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatEuro(scenarioHigh.totalLoanInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taux d'effort ménage :</span>
                <span className="font-mono font-semibold text-rose-600">
                  {scenarioHigh.debtToIncomeRatio}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Surcoût vs 2021 :</span>
                <span className="font-mono font-semibold text-rose-600">
                  +{formatEuro(scenarioHigh.totalLoanInterest - scenario2021.totalLoanInterest)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
