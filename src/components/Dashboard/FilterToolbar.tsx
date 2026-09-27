/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Layers, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { DwellingType, IndicatorMode, RebaseMode } from '../../data/types';
import { CountrySelector } from '../CountrySelector/CountrySelector';
import { PeriodSlider } from '../PeriodSelector/PeriodSlider';
import { Tooltip } from '../Common/Tooltip';

interface FilterToolbarProps {
  selectedCountry: string;
  onCountryChange: (code: string) => void;
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

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Country Selector */}
        <div>
          <CountrySelector
            value={selectedCountry}
            onChange={onCountryChange}
            label="Pays analysé"
          />
        </div>

        {/* Period Selector */}
        <div className="lg:col-span-1">
          <PeriodSlider
            availablePeriods={availablePeriods}
            startPeriod={startPeriod}
            endPeriod={endPeriod}
            onStartChange={onStartPeriodChange}
            onEndChange={onEndPeriodChange}
          />
        </div>

        {/* Indicator Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Indicateur principal</span>
            </span>
            <Tooltip
              title="Sélection de la vue d'analyse"
              content="Basculez entre le HPI nominal brut, l'inflation HICP, la vue comparée, le HPI Réel corrigé de l'inflation ou la segmentation neufs/existants."
            />
          </label>
          <select
            value={indicator}
            onChange={(e) => onIndicatorChange(e.target.value as IndicatorMode)}
            className="w-full text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="both">HPI vs Inflation (Vue comparée)</option>
            <option value="hpi">HPI nominal uniquement</option>
            <option value="hicp">HICP Inflation uniquement</option>
            <option value="real_hpi">HPI réel (Corrigé de l'inflation)</option>
            <option value="dwellings">Neufs vs Existants (Dwellings)</option>
          </select>
        </div>

        {/* Base Reference & Dwelling Type */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                <span>Base 100</span>
              </span>
              <Tooltip
                title="Rebasification Dynamique"
                content="Recalcule instantanément l'indice pour fixer la valeur 100 soit en 2015 (standard Eurostat), en 2010-Q1, ou au début exact de la plage sélectionnée."
              />
            </label>
            <select
              value={rebaseMode}
              onChange={(e) => onRebaseModeChange(e.target.value as RebaseMode)}
              className="w-full text-xs py-2 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="2015">2015 = 100 (Eurostat)</option>
              <option value="2010">2010-Q1 = 100</option>
              <option value="period_start">Début période = 100</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-blue-500" />
                <span>Logements</span>
              </span>
              <Tooltip
                title="Type de logement (Purchase)"
                content="Permet de restreindre l'indice au marché global (TOTAL), aux logements neufs (DW_NEW) ou aux logements anciens (DW_EXST)."
              />
            </label>
            <select
              value={dwellingType}
              onChange={(e) => onDwellingTypeChange(e.target.value as DwellingType)}
              className="w-full text-xs py-2 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TOTAL">Tous types</option>
              <option value="DW_NEW">Neufs</option>
              <option value="DW_EXST">Existants</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
