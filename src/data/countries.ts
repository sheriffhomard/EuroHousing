/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryInfo } from './types';

export const EUROPEAN_COUNTRIES: CountryInfo[] = [
  { code: 'FR', name: 'France', nameFr: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', nameFr: 'Allemagne', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', nameFr: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', nameFr: 'Italie', flag: '🇮🇹' },
  { code: 'BE', name: 'Belgium', nameFr: 'Belgique', flag: '🇧🇪' },
  { code: 'NL', name: 'Netherlands', nameFr: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'PT', name: 'Portugal', nameFr: 'Portugal', flag: '🇵🇹' },
  { code: 'AT', name: 'Austria', nameFr: 'Autriche', flag: '🇦🇹' },
  { code: 'IE', name: 'Ireland', nameFr: 'Irlande', flag: '🇮🇪' },
  { code: 'LU', name: 'Luxembourg', nameFr: 'Luxembourg', flag: '🇱🇺' },
  { code: 'EU27_2020', name: 'European Union (EU-27)', nameFr: 'Union Européenne (UE-27)', flag: '🇪🇺', isAggregate: true },
  { code: 'EA20', name: 'Euro Area (EA-20)', nameFr: 'Zone Euro (EA-20)', flag: '🇪🇺', isAggregate: true },
  { code: 'DK', name: 'Denmark', nameFr: 'Danemark', flag: '🇩🇰' },
  { code: 'SE', name: 'Sweden', nameFr: 'Suède', flag: '🇸🇪' },
  { code: 'FI', name: 'Finland', nameFr: 'Finlande', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', nameFr: 'Pologne', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czechia', nameFr: 'Tchéquie', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', nameFr: 'Hongrie', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', nameFr: 'Roumanie', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', nameFr: 'Bulgarie', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', nameFr: 'Croatie', flag: '🇭🇷' },
  { code: 'SK', name: 'Slovakia', nameFr: 'Slovaquie', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', nameFr: 'Slovénie', flag: '🇸🇮' },
  { code: 'EE', name: 'Estonia', nameFr: 'Estonie', flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia', nameFr: 'Lettonie', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', nameFr: 'Lituanie', flag: '🇱🇹' },
  { code: 'CY', name: 'Cyprus', nameFr: 'Chypre', flag: '🇨🇾' },
  { code: 'MT', name: 'Malta', nameFr: 'Malte', flag: '🇲🇹' },
  { code: 'NO', name: 'Norway', nameFr: 'Norvège', flag: '🇳🇴' },
  { code: 'IS', name: 'Iceland', nameFr: 'Islande', flag: '🇮🇸' },
  { code: 'CH', name: 'Switzerland', nameFr: 'Suisse', flag: '🇨🇭' },
  { code: 'UK', name: 'United Kingdom', nameFr: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'TR', name: 'Türkiye', nameFr: 'Turquie', flag: '🇹🇷' },
];

export const COUNTRY_MAP = new Map<string, CountryInfo>(
  EUROPEAN_COUNTRIES.map((c) => [c.code, c])
);

export function getCountryInfo(code: string, fallbackLabel?: string): CountryInfo {
  if (COUNTRY_MAP.has(code)) {
    return COUNTRY_MAP.get(code)!;
  }
  return {
    code,
    name: fallbackLabel || code,
    nameFr: fallbackLabel || code,
    flag: '🌍',
  };
}

export const DEFAULT_COUNTRY = 'FR';
export const DEFAULT_COMPARISON_COUNTRIES = ['FR', 'DE', 'ES', 'IT', 'EU27_2020'];
