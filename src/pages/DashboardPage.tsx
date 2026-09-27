/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CumulativeBars } from '../components/Dashboard/CumulativeBars';
import { DwellingBreakdown } from '../components/Dashboard/DwellingBreakdown';
import { FilterToolbar } from '../components/Dashboard/FilterToolbar';
import { StatCardsGrid } from '../components/Dashboard/StatCard';
import { MainChart } from '../components/Charts/MainChart';
import { QuickCountryPills } from '../components/CountrySelector/CountrySelector';
import {
  CountryTimeSeries,
  DwellingType,
  IndicatorMode,
  RebaseMode,
} from '../data/types';

interface DashboardPageProps {
  series: CountryTimeSeries;
  selectedCountry: string;
  onCountryChange: (c: string) => void;
  startPeriod: string;
  endPeriod: string;
  availablePeriods: string[];
  onStartPeriodChange: (p: string) => void;
  onEndPeriodChange: (p: string) => void;
  dwellingType: DwellingType;
  onDwellingTypeChange: (dt: DwellingType) => void;
  indicator: IndicatorMode;
  onIndicatorChange: (ind: IndicatorMode) => void;
  rebaseMode: RebaseMode;
  onRebaseModeChange: (rm: RebaseMode) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  series,
  selectedCountry,
  onCountryChange,
  startPeriod,
  endPeriod,
  availablePeriods,
  onStartPeriodChange,
  onEndPeriodChange,
  dwellingType,
  onDwellingTypeChange,
  indicator,
  onIndicatorChange,
  rebaseMode,
  onRebaseModeChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Country Shortcuts */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Accès rapide :
          </span>
          <QuickCountryPills current={selectedCountry} onSelect={onCountryChange} />
        </div>
      </div>

      {/* Primary Filter Toolbar */}
      <FilterToolbar
        selectedCountry={selectedCountry}
        onCountryChange={onCountryChange}
        startPeriod={startPeriod}
        endPeriod={endPeriod}
        availablePeriods={availablePeriods}
        onStartPeriodChange={onStartPeriodChange}
        onEndPeriodChange={onEndPeriodChange}
        dwellingType={dwellingType}
        onDwellingTypeChange={onDwellingTypeChange}
        indicator={indicator}
        onIndicatorChange={onIndicatorChange}
        rebaseMode={rebaseMode}
        onRebaseModeChange={onRebaseModeChange}
      />

      {/* KPI Cards Grid */}
      <StatCardsGrid series={series} />

      {/* Main Interactive Time Series Chart */}
      <MainChart
        series={series}
        indicator={indicator}
        onIndicatorChange={onIndicatorChange}
      />

      {/* Bottom Insights: Cumulative Growth ("Depuis 2010") + Dwellings breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CumulativeBars series={series} baselinePeriod={startPeriod} />
        <DwellingBreakdown series={series} />
      </div>
    </div>
  );
};
