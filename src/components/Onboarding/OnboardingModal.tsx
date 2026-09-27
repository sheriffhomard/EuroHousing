/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Home, Scale, Globe, Wifi } from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'compare' | 'data' | 'methodology') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'Observatoire Officiel Eurostat',
      icon: <Home className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: 'Bienvenue sur Euro Housing Data',
      description:
        "Explorez l'évolution des prix résidentiels et du coût de la vie à travers l'Europe depuis 2010 jusqu'aux derniers trimestres publiés par Eurostat.",
      highlights: [
        'Données officielles des 27 pays de l’UE et de la Zone Euro',
        'Indices trimestriels actualisés en continu sans limite de date',
        'Segmentation par type de logement : Neufs vs Existants',
      ],
    },
    {
      badge: 'Le Concept Clé',
      icon: <Scale className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      title: 'Le HPI Réel : Corriger l’Inflation',
      description:
        "La hausse nominale des prix masque souvent la réalité de la dépréciation monétaire. Le HPI Réel neutralise l'inflation pour révéler le gain ou la perte de pouvoir d'achat net.",
      formula: 'Real HPI = ( HPI nominal / Inflation HICP ) × 100',
      highlights: [
        'Indice > 100 : L’immobilier progresse plus vite que l’inflation',
        'Indice < 100 : Perte de pouvoir d’achat immobilier en valeur réelle',
        'Agrégation HICP trimestrielle conforme aux règles de la statistique européenne',
      ],
    },
    {
      badge: 'Analyse Internationale',
      icon: <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: 'Comparateur Multi-Pays & Export',
      description:
        'Comparez instantanément les trajectoires de la France, l’Allemagne, l’Espagne, l’Italie ou des moyennes de l’Union Européenne sur le même repère.',
      highlights: [
        'Superposition des séries temporelles avec réticule interactif',
        'Rebasification à la volée : Base 2015=100, Base 2010 ou Début de période',
        'Exportation immédiate des données au format CSV et JSON',
      ],
    },
    {
      badge: 'PWA Moderne & Autonome',
      icon: <Wifi className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      title: 'Fonctionnement Hors-Ligne & Mises à Jour',
      description:
        'Cette application est une PWA installable sur ordinateur et mobile. Elle fonctionne en toute autonomie même sans connexion réseau.',
      highlights: [
        'Mise en cache automatique IndexedDB des données déjà consultées',
        'Vérification et installation automatique des mises à jour en arrière-plan',
        'Installation directe sur écran d’accueil (Desktop & Mobile)',
      ],
    },
  ];

  const current = steps[currentStep];

  const handleFinish = () => {
    localStorage.setItem('euro_housing_onboarding_completed', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top bar with Logo & Close */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <AppLogo size="sm" />
          <button
            onClick={handleFinish}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            title="Passer le guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
              {current.icon}
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                {current.badge}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {current.title}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>

          {current.formula && (
            <div className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-center text-xs shadow-inner">
              {current.formula}
            </div>
          )}

          <div className="space-y-2 pt-1">
            {current.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stepper Indicators & Navigation */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-4">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-blue-600 dark:bg-blue-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                aria-label={`Étape ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? 'Commencer l’exploration' : 'Suivant'}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
