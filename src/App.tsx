/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { OfflineBanner } from './components/Layout/OfflineBanner';
import { DashboardPage } from './pages/DashboardPage';
import { ComparePage } from './pages/ComparePage';
import { DataPage } from './pages/DataPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AffordabilityPage } from './pages/AffordabilityPage';
import { MapPage } from './pages/MapPage';
import { CyclesPage } from './pages/CyclesPage';
import { SystemSettingsModal } from './components/Settings/SystemSettingsModal';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { ContextualHelpModal } from './components/Common/ContextualHelpModal';
import { useHousingData } from './hooks/useHousingData';
import { useSystemUpdate } from './hooks/useSystemUpdate';
import { AlertCircle, CheckCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compare' | 'map' | 'cycles' | 'affordability' | 'data' | 'methodology'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const {
    selectedCountry,
    setSelectedCountry,
    comparisonCountries,
    setComparisonCountries,
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

  // Background auto-update and system update management
  const systemUpdate = useSystemUpdate(refreshData);

  // Check if first-time visitor for onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem('euro_housing_onboarding_completed');
    if (!hasCompleted) {
      // Gentle appearance on first visit
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const comparisonList = Array.from(comparisonSeries.values());

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRefreshing={isRefreshing}
        onRefresh={() => refreshData()}
        lastUpdated={lastUpdated}
        systemUpdate={systemUpdate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <OfflineBanner />

      {/* Floating Auto-Update background notification toast */}
      {systemUpdate.hasBackgroundUpdated && (
        <aside
          aria-label="Notification de mise à jour"
          className="fixed top-18 right-4 z-50 max-w-sm p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-2xl animate-in slide-in-from-top-4 fade-in"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-0.5">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Mise à jour installée</span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Une synchronisation en arrière-plan a actualisé les données Eurostat locales.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    systemUpdate.clearNotification();
                    setIsSettingsOpen(true);
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Voir les détails
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  onClick={() => systemUpdate.clearNotification()}
                  className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Ignorer
                </button>
              </div>
            </div>
            <button
              onClick={() => systemUpdate.clearNotification()}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

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
            onSetCountries={setComparisonCountries}
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

        {activeTab === 'map' && (
          <MapPage
            onNavigateToObservatory={(code) => {
              setSelectedCountry(code);
              setActiveTab('dashboard');
            }}
            onAddToComparator={(code) => {
              toggleComparisonCountry(code);
              setActiveTab('compare');
            }}
            onNavigateToAffordability={(code) => {
              setActiveTab('affordability');
            }}
          />
        )}

        {activeTab === 'cycles' && (
          <CyclesPage
            onNavigateToObservatory={(code) => {
              setSelectedCountry(code);
              setActiveTab('dashboard');
            }}
            onAddToComparator={(code) => {
              toggleComparisonCountry(code);
              setActiveTab('compare');
            }}
            onNavigateToAffordability={(code) => {
              setActiveTab('affordability');
            }}
            onNavigateToMap={(code) => {
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'affordability' && <AffordabilityPage />}

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

      {/* System Settings Modal */}
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemUpdate={systemUpdate}
        onOpenOnboarding={() => {
          setIsSettingsOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsOnboardingOpen(false);
        }}
      />

      {/* Contextual Help & Glossary Modal */}
      <ContextualHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onNavigateToMethodology={() => {
          setActiveTab('methodology');
          setIsHelpOpen(false);
        }}
      />
    </div>
  );
}
