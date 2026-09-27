/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Database,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Laptop,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SystemUpdateState } from '../../hooks/useSystemUpdate';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useTheme, ThemeMode } from '../../hooks/useTheme';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemUpdate: SystemUpdateState;
  onOpenOnboarding: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  systemUpdate,
  onOpenOnboarding,
}) => {
  const isOnline = useOnlineStatus();
  const { theme, setTheme } = useTheme();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckUpdates = async () => {
    setFeedback(null);
    const result = await systemUpdate.checkForUpdates(false);
    setFeedback(result.message);
  };

  const handleForceUpdate = async () => {
    setFeedback(null);
    await systemUpdate.forceUpdate();
    setFeedback('Mise à jour forcée appliquée avec succès.');
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Jamais vérifié';
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Paramètres Système & Mises à Jour
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configuration de la synchronisation Eurostat et gestion du cache PWA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Feedback message banner */}
          {(feedback || systemUpdate.updateStatusMessage) && (
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {feedback || systemUpdate.updateStatusMessage}
              </div>
            </div>
          )}

          {/* Section 1: Release & Status Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1. Informations de Version & Synchronisation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Release Version */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    Version de l'application
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    v{systemUpdate.version}
                  </span>
                </div>
              </div>

              {/* Release Date */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    Date de sortie
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {systemUpdate.releaseDate}
                  </span>
                </div>
              </div>

              {/* Last Check Timestamp */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3 sm:col-span-2">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    Date de la dernière vérification
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-900 dark:text-white">
                    {formatDateTime(systemUpdate.lastCheckDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      <Wifi className="w-3 h-3" />
                      <span>En ligne</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                      <WifiOff className="w-3 h-3" />
                      <span>Hors ligne</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Update Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. Actions de Mise à Jour
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button: Check for updates */}
              <button
                onClick={handleCheckUpdates}
                disabled={systemUpdate.isChecking || !isOnline}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${systemUpdate.isChecking ? 'animate-spin' : ''}`}
                />
                <span>
                  {systemUpdate.isChecking
                    ? 'Vérification en cours...'
                    : 'Vérifier les mises à jour'}
                </span>
              </button>

              {/* Button: Force update */}
              <button
                onClick={handleForceUpdate}
                disabled={systemUpdate.isUpdating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-98 text-xs font-semibold transition cursor-pointer"
                title="Supprime tous les caches et force le rechargement complet des données Eurostat"
              >
                <RotateCcw
                  className={`w-4 h-4 ${systemUpdate.isUpdating ? 'animate-spin' : ''}`}
                />
                <span>
                  {systemUpdate.isUpdating
                    ? 'Réinitialisation...'
                    : 'Forcer la mise à jour'}
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: Automatic Background Updates */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Mises à jour automatiques en arrière-plan
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Vérifie périodiquement les nouveaux trimestres Eurostat et met à jour le Service Worker.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemUpdate.isAutoUpdateEnabled}
                  onChange={(e) => systemUpdate.setAutoUpdateEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {systemUpdate.isAutoUpdateEnabled && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  Fréquence de vérification en tâche de fond :
                </span>
                <select
                  value={systemUpdate.checkFrequencyMinutes}
                  onChange={(e) => systemUpdate.setCheckFrequencyMinutes(Number(e.target.value))}
                  className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value={5}>Toutes les 5 minutes</option>
                  <option value={15}>Toutes les 15 minutes (Recommandé)</option>
                  <option value={30}>Toutes les 30 minutes</option>
                  <option value={60}>Toutes les 60 minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Section 4: Theme Mode */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              3. Thème de l'interface
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-5 h-5 mb-1.5 text-amber-500" />
                <span>Thème Clair</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-5 h-5 mb-1.5 text-indigo-400" />
                <span>Thème Sombre</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Laptop className="w-5 h-5 mb-1.5 text-slate-500" />
                <span>Système</span>
              </button>
            </div>
          </div>

          {/* Section 5: Guide & Assistance */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Revoir la visite guidée (Onboarding)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition cursor-pointer"
          >
            Fermer les paramètres
          </button>
        </div>
      </div>
    </div>
  );
};
