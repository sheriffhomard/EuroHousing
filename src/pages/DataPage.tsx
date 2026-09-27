/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DataTable } from '../components/DataTable/DataTable';
import { CountryTimeSeries } from '../data/types';
import { Database, Info } from 'lucide-react';

interface DataPageProps {
  seriesList: CountryTimeSeries[];
  totalObservationsCount: number;
}

export const DataPage: React.FC<DataPageProps> = ({ seriesList }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Explorateur et Export des Données
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Table complète des séries temporelles trimestrielles normalisées issues des API Eurostat <code>prc_hpi_q</code> et <code>prc_hicp_midx</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>{seriesList.length} pays chargés</span>
            <span>·</span>
            <span>Tri et recherche en direct</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-lg flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <p>
            Vous pouvez rechercher n'importe quel trimestre (ex: <code>2024-Q1</code>) ou pays, trier par n'importe quelle colonne en cliquant sur son en-tête, et exporter les données filtrées au format <strong>CSV</strong> (compatible Excel / Python / R) ou <strong>JSON</strong>.
          </p>
        </div>
      </div>

      <DataTable seriesList={seriesList} />
    </div>
  );
};
