/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Statut réseau" className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600/95 backdrop-blur-sm px-3.5 py-2 text-xs font-medium text-white shadow-xl border border-amber-400/30 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
      <span>Mode hors connexion · Consultation des données Eurostat en cache local</span>
    </aside>
  );
};
