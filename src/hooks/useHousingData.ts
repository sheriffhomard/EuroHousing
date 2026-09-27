/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchHicpData } from '../api/hicp';
import { fetchHpiData } from '../api/hpi';
import { BOOTSTRAP_HICP_RAW, BOOTSTRAP_HPI_RAW } from '../data/bootstrapData';
import { DEFAULT_COMPARISON_COUNTRIES, DEFAULT_COUNTRY, EUROPEAN_COUNTRIES } from '../data/countries';
import {
  CountryTimeSeries,
  DwellingType,
  IndicatorMode,
  JsonStatResponse,
  RebaseMode,
} from '../data/types';
import { getCachedDataset, getCachedTimestamp, setCachedDataset } from '../services/cache';
import { rebaseSeries } from '../services/calculations';
import { normalizeCountryData } from '../services/normalization';
import { useOnlineStatus } from './useOnlineStatus';

export function useHousingData() {
  const isOnline = useOnlineStatus();

  // Filters & User selections
  const [selectedCountry, setSelectedCountry] = useState<string>(DEFAULT_COUNTRY);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>(DEFAULT_COMPARISON_COUNTRIES);
  const [startPeriod, setStartPeriod] = useState<string>('2010-Q1');
  const [endPeriod, setEndPeriod] = useState<string>('2025-Q3');
  const [dwellingType, setDwellingType] = useState<DwellingType>('TOTAL');
  const [indicator, setIndicator] = useState<IndicatorMode>('both');
  const [rebaseMode, setRebaseMode] = useState<RebaseMode>('2015');

  // Datasets
  const [hpiRaw, setHpiRaw] = useState<JsonStatResponse>(BOOTSTRAP_HPI_RAW);
  const [hicpRaw, setHicpRaw] = useState<JsonStatResponse>(BOOTSTRAP_HICP_RAW);

  // Status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Données Eurostat');

  // Load from cache on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCache() {
      try {
        const cachedHpi = await getCachedDataset('hpi');
        const cachedHicp = await getCachedDataset('hicp');
        const ts = await getCachedTimestamp('hpi');

        if (isMounted) {
          if (cachedHpi) setHpiRaw(cachedHpi);
          if (cachedHicp) setHicpRaw(cachedHicp);
          if (ts) {
            setLastUpdated(new Date(ts).toLocaleString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }));
          }
        }
      } catch (err) {
        console.warn('Cache read error:', err);
      }
    }

    loadCache();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch fresh data from Eurostat
  const refreshData = useCallback(async (customGeos?: string[]) => {
    if (!isOnline) {
      setError('Mode hors-ligne : impossible de contacter Eurostat.');
      return;
    }

    setIsRefreshing(true);
    setError(null);

    const geosToFetch = Array.from(new Set([
      selectedCountry,
      ...comparisonCountries,
      ...(customGeos || []),
      'FR', 'DE', 'ES', 'IT', 'BE', 'NL', 'PT', 'AT', 'IE', 'EU27_2020',
    ]));

    try {
      const [freshHpi, freshHicp] = await Promise.all([
        fetchHpiData(geosToFetch, '2010-Q1'),
        fetchHicpData(geosToFetch, '2010-01'),
      ]);

      setHpiRaw(freshHpi);
      setHicpRaw(freshHicp);

      const now = Date.now();
      await setCachedDataset('hpi', freshHpi);
      await setCachedDataset('hicp', freshHicp);

      setLastUpdated(new Date(now).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion à Eurostat';
      console.error('Eurostat fetch failed:', err);
      setError(`Eurostat temporairement indisponible (${msg}). Affichage des données en cache.`);
    } finally {
      setIsRefreshing(false);
    }
  }, [isOnline, selectedCountry, comparisonCountries]);

  // If user selects a country not present in current raw dataset, fetch it automatically
  useEffect(() => {
    const hpiGeos = hpiRaw?.dimension?.geo?.category?.index;
    const hasHpi = hpiGeos && (Array.isArray(hpiGeos) ? hpiGeos.includes(selectedCountry) : selectedCountry in hpiGeos);

    if (!hasHpi && isOnline) {
      setIsLoading(true);
      refreshData([selectedCountry]).finally(() => setIsLoading(false));
    }
  }, [selectedCountry, hpiRaw, isOnline, refreshData]);

  // Extract all available periods from datasets
  const allAvailablePeriods = useMemo(() => {
    const periodsSet = new Set<string>();
    const hpiTimes = hpiRaw?.dimension?.time?.category?.index;
    if (hpiTimes) {
      const keys = Array.isArray(hpiTimes) ? hpiTimes : Object.keys(hpiTimes);
      for (const k of keys) {
        if (/^\d{4}-Q[1-4]$/.test(k)) periodsSet.add(k);
      }
    }
    return Array.from(periodsSet).sort();
  }, [hpiRaw]);

  // Adjust default endPeriod to available max if necessary
  useEffect(() => {
    if (allAvailablePeriods.length > 0) {
      const maxPeriod = allAvailablePeriods[allAvailablePeriods.length - 1];
      // If current endPeriod is beyond available or empty, adjust
      if (endPeriod > maxPeriod) {
        setEndPeriod(maxPeriod);
      }
    }
  }, [allAvailablePeriods, endPeriod]);

  // Normalize single country time series
  const fullCountrySeries = useMemo<CountryTimeSeries>(() => {
    return normalizeCountryData(selectedCountry, hpiRaw, hicpRaw);
  }, [selectedCountry, hpiRaw, hicpRaw]);

  // Filtered and rebased series for single country view
  const activeCountrySeries = useMemo<CountryTimeSeries>(() => {
    const filteredObs = fullCountrySeries.observations.filter(
      (o) => o.period >= startPeriod && o.period <= endPeriod
    );

    const rebasedObs = rebaseSeries(filteredObs, rebaseMode);
    const latest = rebasedObs.length > 0 ? rebasedObs[rebasedObs.length - 1] : undefined;

    return {
      country: fullCountrySeries.country,
      observations: rebasedObs,
      latestObservation: latest,
      updatedAt: fullCountrySeries.updatedAt,
    };
  }, [fullCountrySeries, startPeriod, endPeriod, rebaseMode]);

  // Multi-country normalized series
  const comparisonSeries = useMemo<Map<string, CountryTimeSeries>>(() => {
    const map = new Map<string, CountryTimeSeries>();

    for (const code of comparisonCountries) {
      const full = normalizeCountryData(code, hpiRaw, hicpRaw);
      const filtered = full.observations.filter(
        (o) => o.period >= startPeriod && o.period <= endPeriod
      );
      const rebased = rebaseSeries(filtered, rebaseMode);
      map.set(code, {
        country: full.country,
        observations: rebased,
        latestObservation: rebased.length > 0 ? rebased[rebased.length - 1] : undefined,
        updatedAt: full.updatedAt,
      });
    }

    return map;
  }, [comparisonCountries, hpiRaw, hicpRaw, startPeriod, endPeriod, rebaseMode]);

  // Country multi-select toggle
  const toggleComparisonCountry = useCallback((code: string) => {
    setComparisonCountries((prev) => {
      if (prev.includes(code)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  }, []);

  return {
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
    fullCountrySeries,
    comparisonSeries,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refreshData,
    countriesList: EUROPEAN_COUNTRIES,
  };
}
