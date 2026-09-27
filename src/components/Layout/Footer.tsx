/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Database, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lastUpdated: string;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-8 mt-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
              <Database className="w-4 h-4 text-blue-500" />
              <span>Source officielle : Office statistique de l'Union européenne (Eurostat)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Datasets : <code>prc_hpi_q</code> (House price index - quarterly) · <code>prc_hicp_midx</code> (HICP - monthly index CP00)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{lastUpdated}</span>
            </div>
            <a
              href="https://ec.europa.eu/eurostat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Portail Eurostat</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500">
          <p>© Euro Housing Data · Données ouvertes de l'Union européenne sous licence CC BY 4.0.</p>
          <p>Application Progressive Web App (PWA) compatible hors connexion.</p>
        </div>
      </div>
    </footer>
  );
};
