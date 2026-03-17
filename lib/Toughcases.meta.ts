/**
 * lib/phoneCases/toughCases.meta.ts
 *
 * "ToughCases" — expanded / modern series
 * Mockup overlay style assets (thinner border, concentric camera ring, no port notch)
 *
 * Total: 51 models (Apple: 24 | Samsung: 21 | Google: 6)
 * Exclusive to this series: Google Pixel (all 6), Samsung S10/S20, FE/Plus/Ultra variants
 */

import { CaseModel, getPriceLKR } from './types';

const mk = (label: string, file: string): CaseModel => ({
  label,
  file,
  series: 'toughcases',
  priceLKR: getPriceLKR(label),
});

export const TOUGH_CASES: CaseModel[] = [
  // ── Google Pixel (exclusive to ToughCases) ────────────────────────────────────
  mk('Pixel 5',     'ToughCases Google Pixel 5.png'),
  mk('Pixel 6',     'ToughCases Google Pixel 6.png'),
  mk('Pixel 6 Pro', 'ToughCases Google Pixel 6 Pro.png'),
  mk('Pixel 7',     'ToughCases Google Pixel 7.png'),
  mk('Pixel 8',     'ToughCases Google Pixel 8.png'),
  mk('Pixel 8 Pro', 'ToughCases Google Pixel 8 Pro.png'),

  // ── Apple iPhone ──────────────────────────────────────────────────────────────
  // Individual models (not bundled like the TPC series)
  mk('iPhone 8',          'ToughCases iPhone 8.png'),
  mk('iPhone 8 Plus',     'ToughCases iPhone 8 Plus.png'),
  mk('iPhone X',          'ToughCases iPhone X.png'),
  mk('iPhone XR',         'ToughCases iPhone XR.png'),
  mk('iPhone XS',         'ToughCases iPhone XS.png'),
  mk('iPhone XS Max',     'ToughCases iPhone XS Max.png'),   // exclusive naming
  mk('iPhone 11',         'ToughCases iPhone 11.png'),
  mk('iPhone 11 Pro',     'ToughCases iPhone 11 Pro.png'),
  mk('iPhone 11 Pro Max', 'ToughCases iPhone 11 Pro Max.png'),
  mk('iPhone 12',         'ToughCases iPhone 12.png'),        // individual (TPC had bundled)
  mk('iPhone 12 Mini',    'ToughCases iPhone 12 Mini.png'),
  mk('iPhone 12 Pro',     'ToughCases iPhone 12 Pro.png'),    // individual (TPC had bundled)
  mk('iPhone 12 Pro Max', 'ToughCases iPhone 12 Pro Max.png'),
  mk('iPhone 13',         'ToughCases iPhone 13.png'),
  mk('iPhone 13 Mini',    'ToughCases iPhone 13 Mini.png'),
  mk('iPhone 13 Pro',     'ToughCases iPhone 13 Pro.png'),
  mk('iPhone 13 Pro Max', 'ToughCases iPhone 13 Pro Max.png'),
  mk('iPhone 14',         'ToughCases iPhone 14.png'),
  mk('iPhone 14 Plus',    'ToughCases iPhone 14 Plus.png'),
  mk('iPhone 14 Pro',     'ToughCases iPhone 14 Pro.png'),
  mk('iPhone 14 Pro Max', 'ToughCases iPhone 14 Pro Max.png'),
  mk('iPhone 15',         'ToughCases iPhone 15.png'),
  mk('iPhone 15 Plus',    'ToughCases iPhone 15 Plus.png'),
  mk('iPhone 15 Pro',     'ToughCases iPhone 15 Pro.png'),
  mk('iPhone 15 Pro Max', 'ToughCases iPhone 15 Pro Max.png'),

  // ── Samsung Galaxy ────────────────────────────────────────────────────────────
  // S10 (exclusive to ToughCases)
  mk('Galaxy S10',       'ToughCases Samsung S10.png'),
  mk('Galaxy S10 Plus',  'ToughCases Samsung S10 Plus.png'),
  mk('Galaxy S10 Edge',  'ToughCases Samsung S10 Edge.png'),
  // S20 (exclusive to ToughCases)
  mk('Galaxy S20',       'ToughCases Samsung S20.png'),
  mk('Galaxy S20 FE',    'ToughCases Samsung S20 FE.png'),
  mk('Galaxy S20 Plus',  'ToughCases Samsung S20 Plus.png'),
  mk('Galaxy S20 Ultra', 'ToughCases Samsung S20 Ultra.png'),
  // S21 variants
  mk('Galaxy S21',       'ToughCases Samsung S21.png'),
  mk('Galaxy S21 FE',    'ToughCases Samsung S21 FE.png'),
  mk('Galaxy S21 Plus',  'ToughCases Samsung S21 Plus.png'),
  mk('Galaxy S21 Ultra', 'ToughCases Samsung S21 Ultra.png'),
  // S22 variants
  mk('Galaxy S22',       'ToughCases Samsung S22.png'),
  mk('Galaxy S22 Plus',  'ToughCases Samsung S22 Plus.png'),
  mk('Galaxy S22 Ultra', 'ToughCases Samsung S22 Ultra.png'),
  // S23 variants
  mk('Galaxy S23',       'ToughCases Samsung S23.png'),
  mk('Galaxy S23 Plus',  'ToughCases Samsung S23 Plus.png'),
  mk('Galaxy S23 Ultra', 'ToughCases Samsung S23 Ultra.png'),
  // S24 variants
  mk('Galaxy S24',       'ToughCases Samsung S24.png'),
  mk('Galaxy S24 Plus',  'ToughCases Samsung S24 Plus.png'),
  mk('Galaxy S24 Ultra', 'ToughCases Samsung S24 Ultra.png'),
];