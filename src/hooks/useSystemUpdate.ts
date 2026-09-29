/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

export const APP_VERSION = '2.4.0';
export const RELEASE_DATE = '27 septembre 2026';
export const STORAGE_LAST_CHECK_KEY = 'euro_housing_last_update_check';
export const STORAGE_AUTO_UPDATE_KEY = 'euro_housing_auto_update_enabled';
export const STORAGE_CHECK_FREQ_KEY = 'euro_housing_check_frequency_minutes';

export interface SystemUpdateState {
  version: string;
  releaseDate: string;
  lastCheckDate: Date | null;
  isChecking: boolean;
  isUpdating: boolean;
  isAutoUpdateEnabled: boolean;
  checkFrequencyMinutes: number;
  updateStatusMessage: string | null;
  hasBackgroundUpdated: boolean;
  checkForUpdates: (silent?: boolean) => Promise<{ success: boolean; message: string }>;
  forceUpdate: () => Promise<void>;
  setAutoUpdateEnabled: (enabled: boolean) => void;
  setCheckFrequencyMinutes: (minutes: number) => void;
  clearNotification: () => void;
}

export function useSystemUpdate(onRefreshData?: () => Promise<void>): SystemUpdateState {
  const isOnline = useOnlineStatus();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatusMessage, setUpdateStatusMessage] = useState<string | null>(null);
  const [hasBackgroundUpdated, setHasBackgroundUpdated] = useState(false);

  // Settings
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_AUTO_UPDATE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [checkFrequencyMinutes, setCheckFrequencyMinutesState] = useState<number>(() => {
    if (typeof window === 'undefined') return 15;
    const saved = localStorage.getItem(STORAGE_CHECK_FREQ_KEY);
    return saved ? parseInt(saved, 10) : 15;
  });

  const [lastCheckDate, setLastCheckDate] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_LAST_CHECK_KEY);
    return saved ? new Date(parseInt(saved, 10)) : new Date();
  });

  const onRefreshRef = useRef(onRefreshData);
  useEffect(() => {
    onRefreshRef.current = onRefreshData;
  }, [onRefreshData]);

  const setAutoUpdateEnabled = (enabled: boolean) => {
    setIsAutoUpdateEnabledState(enabled);
    localStorage.setItem(STORAGE_AUTO_UPDATE_KEY, String(enabled));
  };

  const setCheckFrequencyMinutes = (minutes: number) => {
    setCheckFrequencyMinutesState(minutes);
    localStorage.setItem(STORAGE_CHECK_FREQ_KEY, String(minutes));
  };

  const recordCheckTimestamp = () => {
    const now = new Date();
    setLastCheckDate(now);
    localStorage.setItem(STORAGE_LAST_CHECK_KEY, String(now.getTime()));
  };

  // Check for updates (Service Worker + Eurostat data)
  const checkForUpdates = useCallback(
    async (silent = false): Promise<{ success: boolean; message: string }> => {
      if (!isOnline) {
        const msg = 'Mode hors-ligne : impossible de vérifier les mises à jour.';
        if (!silent) setUpdateStatusMessage(msg);
        return { success: false, message: msg };
      }

      setIsChecking(true);
      if (!silent) setUpdateStatusMessage('Vérification des mises à jour en cours...');

      try {
        // 1. Service Worker update check (production only, avoiding dev HTML fallback errors)
        if ('serviceWorker' in navigator && !import.meta.env.DEV) {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
              await registration.update();
              if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          } catch {
            // Silently ignore service worker update errors
          }
        }

        // 2. Refresh Eurostat data if handler provided
        if (onRefreshRef.current) {
          await onRefreshRef.current();
        }

        recordCheckTimestamp();
        const successMsg = 'Système à jour. Données Eurostat et application synchronisées.';
        setUpdateStatusMessage(successMsg);

        if (silent) {
          setHasBackgroundUpdated(true);
        }

        return { success: true, message: successMsg };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur réseau';
        const msg = `Vérification terminée (${errorMsg}). Version locale active.`;
        setUpdateStatusMessage(msg);
        recordCheckTimestamp();
        return { success: false, message: msg };
      } finally {
        setIsChecking(false);
      }
    },
    [isOnline]
  );

  // Force update: purges caches, unregisters SW, refetches fresh datasets
  const forceUpdate = useCallback(async () => {
    setIsUpdating(true);
    setUpdateStatusMessage('Mise à jour forcée en cours : réinitialisation des caches...');

    try {
      // 1. Purge CacheStorage
      if ('caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((k) => window.caches.delete(k)));
      }

      // 2. Clear IndexedDB cache
      if (typeof window !== 'undefined' && window.indexedDB) {
        try {
          window.indexedDB.deleteDatabase('euro_housing_db');
        } catch {
          // ignore
        }
      }

      // 3. Clear localStorage cache keys
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('euro_cache_') || key.startsWith('eurostat_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore
      }

      // 4. Update Service Worker (production only)
      if ('serviceWorker' in navigator && !import.meta.env.DEV) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
          }
        } catch {
          // ignore
        }
      }

      // 5. Fetch fresh data
      if (onRefreshRef.current) {
        await onRefreshRef.current();
      }

      recordCheckTimestamp();
      setUpdateStatusMessage('Mise à jour forcée réussie ! Données et caches réinitialisés.');
      setHasBackgroundUpdated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setUpdateStatusMessage(`Échec de la mise à jour forcée : ${msg}`);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Background Auto-Update Interval Runner
  useEffect(() => {
    if (!isAutoUpdateEnabled || !isOnline) return;

    // Run periodic background check
    const intervalMs = Math.max(1, checkFrequencyMinutes) * 60 * 1000;
    const intervalId = setInterval(() => {
      // Only run if document is visible or in background
      checkForUpdates(true);
    }, intervalMs);

    // Also run when user returns to tab after a while
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const last = lastCheckDate ? lastCheckDate.getTime() : 0;
        const elapsed = Date.now() - last;
        // If more than interval has elapsed, check now
        if (elapsed > intervalMs) {
          checkForUpdates(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAutoUpdateEnabled, isOnline, checkFrequencyMinutes, checkForUpdates, lastCheckDate]);

  const clearNotification = () => {
    setHasBackgroundUpdated(false);
    setUpdateStatusMessage(null);
  };

  return {
    version: APP_VERSION,
    releaseDate: RELEASE_DATE,
    lastCheckDate,
    isChecking,
    isUpdating,
    isAutoUpdateEnabled,
    checkFrequencyMinutes,
    updateStatusMessage,
    hasBackgroundUpdated,
    checkForUpdates,
    forceUpdate,
    setAutoUpdateEnabled,
    setCheckFrequencyMinutes,
    clearNotification,
  };
}
