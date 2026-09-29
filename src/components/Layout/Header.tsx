/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Moon, RefreshCw, Sun, Settings, HelpCircle, Bell } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { PWAInstallButton } from './PWAInstallButton';
import { HamburgerMenu } from './HamburgerMenu';
import { AppLogo } from '../Common/AppLogo';
import { SystemUpdateState } from '../../hooks/useSystemUpdate';

interface HeaderProps {
  activeTab: 'dashboard' | 'compare' | 'map' | 'cycles' | 'affordability' | 'data' | 'methodology';
  setActiveTab: (tab: 'dashboard' | 'compare' | 'map' | 'cycles' | 'affordability' | 'data' | 'methodology') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: string;
  systemUpdate: SystemUpdateState;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isRefreshing,
  onRefresh,
  lastUpdated,
  systemUpdate,
  onOpenSettings,
  onOpenOnboarding,
  onOpenHelp,
}) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
        {/* Zone 1: Logo & Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md cursor-pointer"
          >
            <AppLogo size="sm" showText={true} />
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Observatoire
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Comparateur
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'map'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Carte d'Europe
          </button>
          <button
            onClick={() => setActiveTab('cycles')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'cycles'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Cycles Immobiliers
          </button>
          <button
            onClick={() => setActiveTab('affordability')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'affordability'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Accessibilité & Crédit
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Données & Export
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'methodology'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Méthodologie
          </button>
        </nav>

        {/* Zone 3: Actions, Tools, Settings & Hamburger Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Background update indicator badge */}
          {systemUpdate.hasBackgroundUpdated && (
            <button
              onClick={() => onOpenSettings()}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-pulse cursor-pointer border border-emerald-300 dark:border-emerald-800"
              title="Nouvelle mise à jour synchronisée en arrière-plan !"
            >
              <Bell className="w-3 h-3 text-emerald-600" />
              <span>Mise à jour prête</span>
            </button>
          )}

          <PWAInstallButton />

          {/* Contextual Help trigger (Desktop/Tablet) */}
          <button
            onClick={onOpenHelp}
            className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Aide contextuelle & Glossaire"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Quick Refresh Eurostat button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            title="Rafraîchir les données Eurostat"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* System Settings button (Desktop/Tablet) */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer relative"
            title="Paramètres système & Mises à jour"
          >
            <Settings className="w-4 h-4" />
            {systemUpdate.hasBackgroundUpdated && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Hamburger Menu (Categories Drawer) */}
          <HamburgerMenu
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenSettings={onOpenSettings}
            onOpenOnboarding={onOpenOnboarding}
            onOpenHelp={onOpenHelp}
            systemUpdate={systemUpdate}
          />
        </div>
      </div>
    </header>
  );
};
