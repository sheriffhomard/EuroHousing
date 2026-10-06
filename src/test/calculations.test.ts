/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive Unit Tests for Statistical Verifiability
 * Formula: Real HPI(t) = 100 * ( HPI(t) / HICP(t) )
 *
 * Covers all five audit dimensions:
 * 1. Contrôle de la cohérence des périodes et des bases d'indices
 * 2. Tests sur les résultats attendus pour des séries connues (Eurostat benchmarks)
 * 3. Contrôles sur les valeurs manquantes, nulles ou invalides
 * 4. Documentation et tests des règles d'arrondi (half-up, 2 décimales)
 * 5. Tests spécifiques aux changements de base et aux données révisées
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRealHpi,
  calculateRealHpiAudit,
  calculateGrowthRate,
  computeSeriesVariations,
  rebaseSeries,
  validateSeriesConsistency,
  applySeriesRevision,
  roundHalfUp,
  ROUNDING_RULES,
} from '../services/calculations';
import {
  parseMonthToQuarter,
  aggregateMonthlyToQuarterlyHicp,
} from '../services/aggregation';
import { extractJsonStatValue } from '../api/eurostat';
import { JsonStatResponse, QuarterlyObservation } from '../data/types';

// ============================================================================
// 1. Contrôle de la cohérence des périodes et des bases d'indices
// ============================================================================
describe('1. Contrôle de la cohérence des périodes et des bases d\'indices', () => {
  it('valide l\'audit lorsque les périodes HPI et HICP sont rigoureusement identiques', () => {
    const audit = calculateRealHpiAudit({
      hpi: 120.0,
      hicp: 110.0,
      hpiPeriod: '2024-Q1',
      hicpPeriod: '2024-Q1',
      hpiBase: '2015=100',
      hicpBase: '2015=100',
    });

    expect(audit.isValid).toBe(true);
    expect(audit.checks.periodCheck.passed).toBe(true);
    expect(audit.checks.baseCheck.passed).toBe(true);
    expect(audit.value).toBe(109.09);
  });

  it('rejette le calcul en cas de discordance temporelle (périodes différentes)', () => {
    const audit = calculateRealHpiAudit({
      hpi: 130.0,
      hicp: 115.0,
      hpiPeriod: '2024-Q2',
      hicpPeriod: '2024-Q1', // Décalage temporel
      hpiBase: '2015=100',
      hicpBase: '2015=100',
    });

    expect(audit.isValid).toBe(false);
    expect(audit.value).toBeNull();
    expect(audit.errorCode).toBe('PERIOD_MISMATCH');
    expect(audit.checks.periodCheck.passed).toBe(false);
    expect(audit.checks.periodCheck.details).toContain('Incohérence temporelle');
  });

  it('rejette le calcul en cas de discordance de bases d\'indices', () => {
    const audit = calculateRealHpiAudit({
      hpi: 140.0,
      hicp: 110.0,
      hpiPeriod: '2023-Q4',
      hicpPeriod: '2023-Q4',
      hpiBase: '2015=100',
      hicpBase: '2010=100', // Bases d'indices incompatibles
    });

    expect(audit.isValid).toBe(false);
    expect(audit.value).toBeNull();
    expect(audit.errorCode).toBe('BASE_MISMATCH');
    expect(audit.checks.baseCheck.passed).toBe(false);
  });

  it('valide la cohérence globale d\'une série temporelle complète avec validateSeriesConsistency', () => {
    const validSeries: QuarterlyObservation[] = [
      {
        geo: 'FR',
        period: '2024-Q1',
        year: 2024,
        quarter: 1,
        hpi: { total: 130, new: 125, existing: 132 },
        hicp: 118,
        realHpi: 110.17,
      },
      {
        geo: 'FR',
        period: '2024-Q2',
        year: 2024,
        quarter: 2,
        hpi: { total: 131, new: 126, existing: 133 },
        hicp: 119,
        realHpi: 110.08,
      },
    ];

    const report = validateSeriesConsistency(validSeries);
    expect(report.isFullyConsistent).toBe(true);
    expect(report.validPairsCount).toBe(2);
    expect(report.anomalies).toHaveLength(0);
  });

  it('détecte les anomalies de couverture et périodes manquantes dans une série temporelle', () => {
    const flawedSeries: QuarterlyObservation[] = [
      {
        geo: 'FR',
        period: '2024-Q1',
        year: 2024,
        quarter: 1,
        hpi: { total: 130, new: 125, existing: 132 },
        hicp: 118,
        realHpi: 110.17,
      },
      {
        geo: 'FR',
        period: '2024-Q2',
        year: 2024,
        quarter: 2,
        hpi: { total: null, new: null, existing: null }, // HPI manquant
        hicp: 119,
        realHpi: null,
      },
    ];

    const report = validateSeriesConsistency(flawedSeries);
    expect(report.isFullyConsistent).toBe(false);
    expect(report.missingHpiCount).toBe(1);
    expect(report.anomalies[0].period).toBe('2024-Q2');
  });
});

// ============================================================================
// 2. Tests sur les résultats attendus pour des séries connues (Benchmarks Eurostat)
// ============================================================================
describe('2. Tests sur les résultats attendus pour des séries connues', () => {
  it('benchmark année de base Eurostat 2015 : HPI = 100.0, HICP = 100.0 => Real HPI = 100.00', () => {
    const realHpi = calculateRealHpi(100.0, 100.0);
    expect(realHpi).toBe(100.0);
  });

  it('benchmark France 2022-Q2 (données réelles Eurostat) : HPI = 135.2, HICP = 114.5 => Real HPI = 118.08', () => {
    // 100 * (135.2 / 114.5) = 118.0786026... arrondi demi-supérieur = 118.08
    const realHpi = calculateRealHpi(135.2, 114.5);
    expect(realHpi).toBe(118.08);
  });

  it('benchmark Allemagne 2021-Q4 (pic des prix) : HPI = 160.8, HICP = 110.2 => Real HPI = 145.92', () => {
    // 100 * (160.8 / 110.2) = 145.916515... arrondi = 145.92
    const realHpi = calculateRealHpi(160.8, 110.2);
    expect(realHpi).toBe(145.92);
  });

  it('benchmark Allemagne 2023-Q4 (correction immobilière + inflation) : HPI = 145.2, HICP = 122.4 => Real HPI = 118.63', () => {
    // 100 * (145.2 / 122.4) = 118.62745... arrondi = 118.63
    const realHpi = calculateRealHpi(145.2, 122.4);
    expect(realHpi).toBe(118.63);
  });

  it('benchmark cas d\'école : HPI = 150.0, HICP = 120.0 => Real HPI = 125.00', () => {
    expect(calculateRealHpi(150.0, 120.0)).toBe(125.0);
  });

  it('benchmark cas d\'érosion réelle : HPI = 80.0, HICP = 160.0 => Real HPI = 50.00', () => {
    expect(calculateRealHpi(80.0, 160.0)).toBe(50.0);
  });

  it('fournit la trace pas-à-pas complète avec substitution numérique exacte', () => {
    const audit = calculateRealHpiAudit({
      hpi: 150.0,
      hicp: 120.0,
      hpiPeriod: '2024-Q1',
      hicpPeriod: '2024-Q1',
    });

    expect(audit.stepByStep.formula).toBe('Real HPI(t) = 100 * ( HPI(t) / HICP(t) )');
    expect(audit.stepByStep.substituted).toContain('100 * ( 150 / 120 )');
    expect(audit.stepByStep.rawResult).toBe(125);
    expect(audit.stepByStep.roundedResult).toBe(125);
  });
});

// ============================================================================
// 3. Contrôles sur les valeurs manquantes, nulles ou invalides
// ============================================================================
describe('3. Contrôles sur les valeurs manquantes, nulles ou invalides', () => {
  it('rejette les valeurs manquantes (null et undefined)', () => {
    expect(calculateRealHpi(null, 120)).toBeNull();
    expect(calculateRealHpi(150, null)).toBeNull();
    expect(calculateRealHpi(undefined, 120)).toBeNull();
    expect(calculateRealHpi(150, undefined)).toBeNull();

    const audit = calculateRealHpiAudit({ hpi: null, hicp: 120 });
    expect(audit.isValid).toBe(false);
    expect(audit.errorCode).toBe('MISSING_INPUT');
  });

  it('rejette la division par zéro lorsque HICP est nul (hicp = 0)', () => {
    expect(calculateRealHpi(150, 0)).toBeNull();

    const audit = calculateRealHpiAudit({ hpi: 150, hicp: 0 });
    expect(audit.isValid).toBe(false);
    expect(audit.errorCode).toBe('ZERO_DENOMINATOR');
    expect(audit.message).toContain('division par zéro');
  });

  it('rejette les indices négatifs économiquement impossibles', () => {
    // Dénominateur négatif
    expect(calculateRealHpi(150, -10)).toBeNull();
    const auditDenom = calculateRealHpiAudit({ hpi: 150, hicp: -10 });
    expect(auditDenom.isValid).toBe(false);
    expect(auditDenom.errorCode).toBe('NEGATIVE_INDEX');

    // Numérateur négatif
    expect(calculateRealHpi(-20, 110)).toBeNull();
    const auditNum = calculateRealHpiAudit({ hpi: -20, hicp: 110 });
    expect(auditNum.isValid).toBe(false);
    expect(auditNum.errorCode).toBe('NEGATIVE_INDEX');
  });

  it('rejette les valeurs non finies (NaN, Infinity, -Infinity)', () => {
    expect(calculateRealHpi(NaN, 120)).toBeNull();
    expect(calculateRealHpi(150, NaN)).toBeNull();
    expect(calculateRealHpi(Infinity, 120)).toBeNull();
    expect(calculateRealHpi(150, Infinity)).toBeNull();
    expect(calculateRealHpi(-Infinity, 120)).toBeNull();

    const audit = calculateRealHpiAudit({ hpi: NaN, hicp: 120 });
    expect(audit.isValid).toBe(false);
  });

  it('signale un avertissement pour les valeurs aberrantes (outliers atypiques)', () => {
    // Indice de 25 000
    const audit = calculateRealHpiAudit({ hpi: 30000, hicp: 120 });
    expect(audit.isValid).toBe(true);
    expect(audit.errorCode).toBe('OUTLIER_WARNING');
  });
});

// ============================================================================
// 4. Documentation des règles d'arrondi
// ============================================================================
describe('4. Documentation et validation des règles d\'arrondi', () => {
  it('respecte la norme Eurostat documentée (arrondi demi-supérieur à 2 décimales)', () => {
    expect(ROUNDING_RULES.INDEX_DECIMALS).toBe(2);
    expect(ROUNDING_RULES.GROWTH_RATE_DECIMALS).toBe(2);
    expect(ROUNDING_RULES.METHOD).toBe('half-up');
  });

  it('arrondit rigoureusement selon la règle demi-supérieur (half-up) aux valeurs charnières', () => {
    // 100.004 -> 100.00
    expect(roundHalfUp(100.004, 2)).toBe(100.0);
    // 100.005 -> 100.01 (demi au supérieur)
    expect(roundHalfUp(100.005, 2)).toBe(100.01);
    // 100.006 -> 100.01
    expect(roundHalfUp(100.006, 2)).toBe(100.01);
    // 123.455 -> 123.46
    expect(roundHalfUp(123.455, 2)).toBe(123.46);
  });

  it('élimine les artefacts de calcul en virgule flottante IEEE-754', () => {
    // Dans les calculs JS standard : 1.005 * 100 donne 100.49999999999999
    // Notre fonction roundHalfUp garantit la valeur exacte
    const trickyFloat = 1.005;
    expect(roundHalfUp(trickyFloat, 2)).toBe(1.01);

    const trickyFraction = 14 / 3; // 4.666666666666667
    expect(roundHalfUp(trickyFraction, 2)).toBe(4.67);
  });

  it('applique l\'arrondi sélectionné de manière configurable', () => {
    const rawVal = 100 * (135.2 / 114.5); // 118.0786026...
    expect(roundHalfUp(rawVal, 1)).toBe(118.1);
    expect(roundHalfUp(rawVal, 2)).toBe(118.08);
    expect(roundHalfUp(rawVal, 3)).toBe(118.079);
    expect(roundHalfUp(rawVal, 4)).toBe(118.0786);
  });
});

// ============================================================================
// 5. Tests spécifiques aux changements de base et aux données révisées
// ============================================================================
describe('5. Tests spécifiques aux changements de base et aux données révisées', () => {
  const mockObservations: QuarterlyObservation[] = [
    {
      geo: 'FR',
      period: '2010-Q1',
      year: 2010,
      quarter: 1,
      hpi: { total: 80.0, new: 75.0, existing: 82.0 },
      hicp: 90.0,
      realHpi: 88.89,
    },
    {
      geo: 'FR',
      period: '2015-Q1',
      year: 2015,
      quarter: 1,
      hpi: { total: 100.0, new: 100.0, existing: 100.0 },
      hicp: 100.0,
      realHpi: 100.0,
    },
    {
      geo: 'FR',
      period: '2020-Q1',
      year: 2020,
      quarter: 1,
      hpi: { total: 120.0, new: 115.0, existing: 122.0 },
      hicp: 108.0,
      realHpi: 111.11,
    },
    {
      geo: 'FR',
      period: '2024-Q1',
      year: 2024,
      quarter: 1,
      hpi: { total: 140.0, new: 135.0, existing: 142.0 },
      hicp: 125.0,
      realHpi: 112.0,
    },
  ];

  it('rebase dynamiquement à 2010-Q1 = 100 avec alignement strict des deux indices', () => {
    const rebased = rebaseSeries(mockObservations, '2010');

    // Période de référence : 2010-Q1 doit valoir exactement 100
    expect(rebased[0].hpi.total).toBe(100.0);
    expect(rebased[0].hicp).toBe(100.0);
    expect(rebased[0].realHpi).toBe(100.0);

    // Période 2020-Q1 : HPI rebasé = (120 / 80) * 100 = 150.0
    expect(rebased[2].hpi.total).toBe(150.0);
    // HICP rebasé = (108 / 90) * 100 = 120.0
    expect(rebased[2].hicp).toBe(120.0);
    // HPI réel rebasé = 100 * (150 / 120) = 125.0
    expect(rebased[2].realHpi).toBe(125.0);
  });

  it('préserve la propriété de transitivité lors des rebasifications successives', () => {
    // Transitivité : la variation relative entre deux périodes t1 et t2 est invariante par changement de base
    const base2015 = mockObservations;
    const base2010 = rebaseSeries(mockObservations, '2010');

    // Ratio nominal entre 2024-Q1 et 2020-Q1 : 140 / 120
    const ratio2015 = base2015[3].hpi.total! / base2015[2].hpi.total!;
    const ratio2010 = base2010[3].hpi.total! / base2010[2].hpi.total!;

    expect(Number(ratio2015.toFixed(6))).toBe(Number(ratio2010.toFixed(6)));
  });

  it('intègre une révision statistique d\'un trimestre antérieur sans corrompre les données non révisées', () => {
    // Eurostat révise fréquemment le trimestre précédent (par ex. passage de provisoire 'p' à définitif)
    const initialSeries = computeSeriesVariations(mockObservations);

    // Révision du HPI de 2020-Q1 de 120.0 à 122.5
    const { updatedSeries, auditDelta } = applySeriesRevision(initialSeries, {
      period: '2020-Q1',
      revisedHpiTotal: 122.5,
    });

    // Vérifier l'audit delta
    expect(auditDelta.period).toBe('2020-Q1');
    expect(auditDelta.previousHpi).toBe(120.0);
    expect(auditDelta.newHpi).toBe(122.5);
    expect(auditDelta.hpiDelta).toBe(2.5);

    // Ancien Real HPI : 100 * (120 / 108) = 111.11
    // Nouveau Real HPI : 100 * (122.5 / 108) = 113.43
    expect(auditDelta.newRealHpi).toBe(113.43);

    // Vérifier que le trimestre 2010-Q1 n'a pas été altéré
    expect(updatedSeries[0].hpi.total).toBe(80.0);
    expect(updatedSeries[0].realHpi).toBe(88.89);

    // Vérifier que le trimestre révisé contient bien la nouvelle valeur
    const revisedObs = updatedSeries.find((o) => o.period === '2020-Q1');
    expect(revisedObs?.hpi.total).toBe(122.5);
    expect(revisedObs?.realHpi).toBe(113.43);
  });
});

// ============================================================================
// Tests Utilitaires Complémentaires (JSON-stat & Agrégration Mensuelle/Trimestrielle)
// ============================================================================
describe('Utilitaires : Agrégation & Décodeur JSON-stat 2.0', () => {
  it('convertit les chaînes mensuelles en trimestres conformes', () => {
    expect(parseMonthToQuarter('2024-01')).toEqual({ year: 2024, quarter: 1, period: '2024-Q1' });
    expect(parseMonthToQuarter('2024-06')).toEqual({ year: 2024, quarter: 2, period: '2024-Q2' });
    expect(parseMonthToQuarter('2024-09')).toEqual({ year: 2024, quarter: 3, period: '2024-Q3' });
    expect(parseMonthToQuarter('2024-12')).toEqual({ year: 2024, quarter: 4, period: '2024-Q4' });
    expect(parseMonthToQuarter('invalide')).toBeNull();
  });

  it('agrège 3 mois consécutifs en moyenne arithmétique trimestrielle', () => {
    const monthlyMap = new Map<string, number>([
      ['2024-01', 120.0],
      ['2024-02', 121.0],
      ['2024-03', 122.0],
    ]);

    const quarterly = aggregateMonthlyToQuarterlyHicp(monthlyMap);
    expect(quarterly.get('2024-Q1')).toBe(121.0);
  });

  it('décode correctement les coordonnées multi-dimensionnelles JSON-stat', () => {
    const mockDataset: JsonStatResponse = {
      version: '2.0',
      class: 'dataset',
      label: 'Test dataset',
      source: 'Eurostat',
      updated: '2026-01-01',
      id: ['geo', 'time'],
      size: [2, 2],
      dimension: {
        geo: {
          label: 'Country',
          category: {
            index: { FR: 0, DE: 1 },
          },
        },
        time: {
          label: 'Quarter',
          category: {
            index: { '2024-Q1': 0, '2024-Q2': 1 },
          },
        },
      },
      value: {
        '0': 100, // FR, 2024-Q1
        '1': 105, // FR, 2024-Q2
        '2': 95, // DE, 2024-Q1
        '3': 98, // DE, 2024-Q2
      },
    };

    expect(extractJsonStatValue(mockDataset, { geo: 'FR', time: '2024-Q1' })).toBe(100);
    expect(extractJsonStatValue(mockDataset, { geo: 'FR', time: '2024-Q2' })).toBe(105);
    expect(extractJsonStatValue(mockDataset, { geo: 'DE', time: '2024-Q1' })).toBe(95);
    expect(extractJsonStatValue(mockDataset, { geo: 'ES', time: '2024-Q1' })).toBeNull();
  });
});
