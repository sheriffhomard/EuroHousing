/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import { EUROPEAN_COUNTRIES, getCountryInfo } from '../../data/countries';
import { CountryInfo } from '../../data/types';

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  countries?: CountryInfo[];
  highlightGeos?: string[];
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  label = 'Pays sélectionné',
  countries = EUROPEAN_COUNTRIES,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = getCountryInfo(value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(
    (c) =>
      c.nameFr.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs hover:border-slate-400 dark:hover:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors text-left cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate font-medium text-slate-900 dark:text-slate-100">
          <span className="text-base shrink-0">{selected.flag}</span>
          <span className="truncate">{selected.nameFr}</span>
          <span className="text-xs text-slate-500 font-mono">({selected.code})</span>
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border-0 rounded-md focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800/40">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-xs text-center text-slate-500">Aucun pays trouvé</div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">{c.flag}</span>
                      <span className="truncate">{c.nameFr}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({c.code})</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const QuickCountryPills: React.FC<{
  current: string;
  onSelect: (code: string) => void;
}> = ({ current, onSelect }) => {
  const quickList = ['FR', 'DE', 'ES', 'IT', 'BE', 'NL', 'PT', 'EU27_2020'];

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {quickList.map((code) => {
        const info = getCountryInfo(code);
        const isActive = current === code;
        return (
          <button
            key={code}
            onClick={() => onSelect(code)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white font-medium shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{info.flag}</span>
            <span>{info.nameFr}</span>
          </button>
        );
      })}
    </div>
  );
};
