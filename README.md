# Euro Housing Data — Observatoire Européen des Prix Immobiliers & de l'Inflation

**Euro Housing Data** est une application web progressive (PWA) de haute précision permettant d'explorer, de visualiser et de comparer l'évolution des **prix immobiliers résidentiels (HPI)** et de l'**inflation (HICP)** dans l'ensemble des pays européens, à partir des données officielles en libre accès fournies par **Eurostat**.

---

## 1. Caractéristiques Principales

- **Sources Officielles Eurostat** :
  - **HPI (House Price Index)** : Dataset `prc_hpi_q` (trimestriel, 2010 - présent).
  - **HICP (Harmonised Index of Consumer Prices)** : Dataset `prc_hicp_midx` (mensuel, COICOP CP00, 2010 - présent).
- **Indicateur HPI Réel** :
  $$\text{Real HPI}(t) = \frac{\text{HPI nominal}(t)}{\text{HICP}(t)} \times 100$$
  Mesure rigoureusement le pouvoir d'achat immobilier net de l'inflation générale.
- **Agrégation Trimestrielle HICP** :
  Transformation méthodologique conforme : moyenne arithmétique des 3 mois civils du trimestre ($Q_1 = \text{mean}(M_{01}, M_{02}, M_{03})$).
- **Segmentation Marché Résidentiel** :
  Comparaison entre logements neufs (`DW_NEW`), logements existants (`DW_EXST`) et ensemble du marché (`TOTAL`).
- **Graphiques Vectoriels Réactifs** :
  Visualisation SVG sur-mesure avec réticule interactif (crosshair), infobulle dynamique, sélection de séries et export vectoriel SVG.
- **Comparateur Multi-Pays** :
  Superposition instantanée de la France, l'Allemagne, l'Espagne, l'Italie, la Belgique, les Pays-Bas, le Portugal, etc.
- **Tableau de Données & Export** :
  Explorateur filtrable et triable avec export direct en **CSV** et **JSON**.
- **Progressive Web App (PWA)** :
  Installable sur ordinateur (Desktop Chrome / Edge) et smartphone (iOS Safari / Android), mise en cache IndexedDB, et autonomie complète hors ligne.
- **Dark Mode Intégré** :
  Prise en charge des thèmes Clair, Sombre et Système.

---

## 2. Architecture Technique

```text
Eurostat REST API (ec.europa.eu)
      │
      ▼
Data Access Layer (src/api/)
  ├── eurostat.ts (JSON-stat 2.0 multi-dimensional parser)
  ├── hpi.ts (prc_hpi_q client)
  └── hicp.ts (prc_hicp_midx client)
      │
      ▼
Cache Layer (src/services/cache.ts & src/data/bootstrapData.ts)
  ├── IndexedDB (`euro_housing_db`)
  └── Embedded bootstrap fallback (10 core EU countries)
      │
      ▼
Normalization & Calculation (src/services/)
  ├── aggregation.ts (Monthly to quarterly arithmetic mean)
  ├── calculations.ts (Real HPI, QoQ, YoY, cumulative growth)
  └── normalization.ts (Unified QuarterlyObservation time-series)
      │
      ▼
Application State (src/hooks/)
  ├── useHousingData.ts (State management & auto-refresh)
  ├── usePWAInstall.ts (In-app PWA install trigger)
  ├── useOnlineStatus.ts (Live connectivity detection)
  └── useTheme.ts (Theme persistence)
      │
      ▼
React UI (src/pages/ & src/components/)
  ├── Observatoire (Dashboard)
  ├── Comparateur (Multi-country overlay)
  ├── Données & Export (Data grid & CSV/JSON)
  └── Méthodologie (Documentation & sources)
```

---

## 3. Installation et Démarrage

### Prérequis
- Node.js >= 18
- npm

### Installation des dépendances
```bash
npm install
```

### Lancement du serveur de développement
```bash
npm run dev
```
Ouvrez ensuite l'application sur `http://localhost:3000`.

### Build de production
```bash
npm run build
```

### Exécution des tests unitaires
```bash
npm test
```

---

## 4. Datasets Eurostat Utilisés

| Indicateur | Code Dataset | Fréquence | Unités / Paramètres |
|---|---|---|---|
| **House Price Index** | `prc_hpi_q` | Trimestrielle (Q) | `unit=I15_Q` (Base 2015=100), `purchase=TOTAL,DW_NEW,DW_EXST` |
| **Consumer Prices (HICP)** | `prc_hicp_midx` | Mensuelle (M) | `unit=I15` (Base 2015=100), `coicop=CP00` (Ensemble) |

---

## 5. Pérennité & Données Post-2025

L'application n'impose aucune borne temporelle figée. Lors d'un rafraîchissement en direct via le bouton de synchronisation, les nouveaux trimestres publiés par Eurostat sont automatiquement intégrés, calculés et mis en cache local.
