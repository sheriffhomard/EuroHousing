/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  Home,
  Layers,
  Globe,
  Database,
  FileSpreadsheet,
  FileJson,
  BookOpen,
  Calculator,
  HelpCircle,
  Settings,
  RefreshCw,
  Download,
  Sun,
  Moon,
  Laptop,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Building,
} from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';
import { useTheme } from '../../hooks/useTheme';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { SystemUpdateState } from '../../hooks/useSystemUpdate';

interface HamburgerMenuProps {
  activeTab: 'dashboard' | 'compare' | 'affordability' | 'data' | 'methodology';
  onSelectTab: (tab: 'dashboard' | 'compare' | 'affordability' | 'data' | 'methodology') => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onOpenHelp: () => void;
  systemUpdate: SystemUpdateState;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenOnboarding,
  onOpenHelp,
  systemUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isInstallable, install } = usePWAInstall();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNav = (tab: 'dashboard' | 'compare' | 'affordability' | 'data' | 'methodology') => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 z-10"
        aria-label="Ouvrir le menu de fonctionnalités par catégorie"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Menu</span>
      </button>

      {/* Drawer & Backdrop portaled to document.body */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] transition-all duration-300 ${
              isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
            }`}
            aria-hidden={!isOpen}
          >
            {/* Drawer Overlay Backdrop */}
            <div
              className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-out Sidebar Drawer */}
            <div
              className={`fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <AppLogo size="sm" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

        {/* Drawer Scrollable Content Grouped by Categories */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* CATEGORY 1: Analyses & Observatoire */}
          <div className="space-y-1.5">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Analyses & Observatoire
            </div>

            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/60'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-blue-500" />
                <span>Observatoire Principal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('compare')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/60'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Comparateur Multi-Pays</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('affordability')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'affordability'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/60'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4 text-emerald-500" />
                <span>Accessibilité & Pouvoir d'Achat</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('dashboard')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Croissance Cumulée (« Depuis 2010 »)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">KPI</span>
            </button>

            <button
              onClick={() => handleNav('dashboard')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-teal-500" />
                <span>Segmentation Neufs vs Existants</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Dwellings</span>
            </button>
          </div>

          {/* CATEGORY 2: Données & Exportations */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Données & Exportations
            </div>

            <button
              onClick={() => handleNav('data')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/60'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Explorateur & Grille de Données</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('data')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportation CSV (Excel, Python, R)</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">CSV</span>
            </button>

            <button
              onClick={() => handleNav('data')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileJson className="w-4 h-4 text-amber-500" />
                <span>Exportation JSON (API Developers)</span>
              </div>
              <span className="text-[10px] text-amber-500 font-mono">JSON</span>
            </button>
          </div>

          {/* CATEGORY 3: Méthodologie & Références */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Méthodologie & Références
            </div>

            <button
              onClick={() => handleNav('methodology')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'methodology'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/60'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Méthodologie Complète & Sources</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenHelp();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4 text-purple-500" />
                <span>Formule du HPI Réel</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">[HPI/HICP]×100</span>
            </button>
          </div>

          {/* CATEGORY 4: Assistance & Guide */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Assistance & Guide
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenOnboarding();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span>Visite Guidée (Onboarding)</span>
              </div>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md font-semibold">
                Guide
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenHelp();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Aide Contextuelle & Glossaire</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* CATEGORY 5: Paramètres Système & Mises à Jour */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Système & Paramètres
            </div>

            {/* Open System Settings Modal */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-semibold text-slate-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <span>Paramètres Système</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                    v{systemUpdate.version} · Mises à jour auto
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Quick Update Button */}
            <button
              onClick={() => systemUpdate.checkForUpdates(false)}
              disabled={systemUpdate.isChecking}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${systemUpdate.isChecking ? 'animate-spin' : ''}`}
              />
              <span>
                {systemUpdate.isChecking
                  ? 'Vérification...'
                  : 'Vérifier les mises à jour'}
              </span>
            </button>

            {/* PWA Install Button if available */}
            {isInstallable && (
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installer l'application PWA</span>
              </button>
            )}

            {/* Quick Theme Switcher */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Mode d'affichage :</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Thème Clair"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Thème Sombre"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    theme === 'system'
                      ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Thème Système"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Version and Release Date */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 text-center text-[11px] text-slate-400">
          Euro Housing Data v{systemUpdate.version} ({systemUpdate.releaseDate})
        </div>
      </div>
    </div>,
    document.body
  )}
    </>
  );
};
