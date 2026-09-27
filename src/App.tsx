/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { OfflineBanner } from './components/Layout/OfflineBanner';
import { DashboardPage } from './pages/DashboardPage';
import { ComparePage } from './pages/ComparePage';
import { DataPage } from './pages/DataPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { useHousingData } from './hooks/useHousingData';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compare' | 'data' | 'methodology'>('dashboard');

  const {
    selectedCountry,
    setSelectedCountry,
    comparisonCountries,
    toggleComparisonCountry,
    startPeriod,
    setStartPeriod,
    endPeriod,
    setEndPeriod,
    dwellingType,
    setDwellingType,
    indicator,
    setIndicator,
    rebaseMode,
    setRebaseMode,
    allAvailablePeriods,
    activeCountrySeries,
    comparisonSeries,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refreshData,
  } = useHousingData();

  const comparisonList = Array.from(comparisonSeries.values());

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRefreshing={isRefreshing}
        onRefresh={() => refreshData()}
        lastUpdated={lastUpdated}
      />

      <OfflineBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error notification if Eurostat API returned an error */}
        {error && (
          <aside aria-label="Avertissement réseau" className="mb-6 p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refreshData()}
              className="px-2.5 py-1 rounded-md bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 font-semibold cursor-pointer shrink-0"
            >
              Réessayer
            </button>
          </aside>
        )}

        {/* Tab Routing */}
        {activeTab === 'dashboard' && (
          <DashboardPage
            series={activeCountrySeries}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            startPeriod={startPeriod}
            endPeriod={endPeriod}
            availablePeriods={allAvailablePeriods}
            onStartPeriodChange={setStartPeriod}
            onEndPeriodChange={setEndPeriod}
            dwellingType={dwellingType}
            onDwellingTypeChange={setDwellingType}
            indicator={indicator}
            onIndicatorChange={setIndicator}
            rebaseMode={rebaseMode}
            onRebaseModeChange={setRebaseMode}
          />
        )}

        {activeTab === 'compare' && (
          <ComparePage
            seriesMap={comparisonSeries}
            comparisonCountries={comparisonCountries}
            onToggleCountry={toggleComparisonCountry}
            startPeriod={startPeriod}
            endPeriod={endPeriod}
            availablePeriods={allAvailablePeriods}
            onStartPeriodChange={setStartPeriod}
            onEndPeriodChange={setEndPeriod}
            indicator={indicator === 'both' ? 'hpi' : indicator}
            onIndicatorChange={setIndicator}
            rebaseMode={rebaseMode}
            onRebaseModeChange={setRebaseMode}
          />
        )}

        {activeTab === 'data' && (
          <DataPage
            seriesList={comparisonList.length > 0 ? comparisonList : [activeCountrySeries]}
            totalObservationsCount={activeCountrySeries.observations.length}
          />
        )}

        {activeTab === 'methodology' && (
          <MethodologyPage lastUpdated={lastUpdated} />
        )}
      </main>

      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
