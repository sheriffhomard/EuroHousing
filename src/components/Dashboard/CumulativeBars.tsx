/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CountryTimeSeries } from '../../data/types';
import { calculateGrowthRate } from '../../services/calculations';

interface CumulativeBarsProps {
  series: CountryTimeSeries;
  baselinePeriod?: string;
}

export const CumulativeBars: React.FC<CumulativeBarsProps> = ({
  series,
  baselinePeriod = '2010-Q1',
}) => {
  const observations = series.observations;
  if (observations.length === 0) return null;

  // Find baseline observation (closest to baselinePeriod, e.g. 2010-Q1)
  const baseObs = observations.find((o) => o.period >= baselinePeriod) || observations[0];
  const latestObs = observations[observations.length - 1];

  const hpiGrowth = calculateGrowthRate(latestObs?.hpi.total, baseObs?.hpi.total);
  const hicpGrowth = calculateGrowthRate(latestObs?.hicp, baseObs?.hicp);
  const realGrowth = calculateGrowthRate(latestObs?.realHpi, baseObs?.realHpi);

  const items = [
    {
      label: 'Prix Immobiliers (HPI nominal)',
      growth: hpiGrowth,
      color: 'bg-blue-600',
      trackColor: 'bg-blue-100 dark:bg-blue-950/40',
      description: 'Hausse brute des prix des logements constatée sur le marché.',
    },
    {
      label: 'Prix à la Consommation (Inflation HICP)',
      growth: hicpGrowth,
      color: 'bg-amber-500',
      trackColor: 'bg-amber-100 dark:bg-amber-950/40',
      description: "Évolution globale du coût de la vie et de l'indice des prix à la consommation.",
    },
    {
      label: 'Prix Immobiliers Réels (Corrigés de l’inflation)',
      growth: realGrowth,
      color: 'bg-emerald-600',
      trackColor: 'bg-emerald-100 dark:bg-emerald-950/40',
      description: 'Pouvoir d’achat immobilier réel : hausse des prix nets de l’inflation.',
    },
  ];

  // Scale max width relative to largest absolute growth
  const maxAbs = Math.max(
    Math.abs(hpiGrowth ?? 0),
    Math.abs(hicpGrowth ?? 0),
    Math.abs(realGrowth ?? 0),
    20
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Évolution Cumulée depuis {baseObs?.period}</span>
            <span className="text-xs font-normal text-slate-500">
              ({series.country.flag} {series.country.nameFr})
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparaison directe de la croissance des prix nominaux, de l’inflation et de la valorisation réelle jusqu’en {latestObs?.period}.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 whitespace-nowrap">
          {baseObs?.period} → {latestObs?.period}
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {items.map((item, idx) => {
          const val = item.growth ?? 0;
          const isPos = val >= 0;
          const widthPct = Math.min(100, Math.max(3, (Math.abs(val) / maxAbs) * 100));

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isPos
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPos ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`}
                </span>
              </div>

              {/* Graphical bar */}
              <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center p-1">
                <div
                  className={`h-full rounded-md ${item.color} transition-all duration-700 ease-out shadow-xs`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
