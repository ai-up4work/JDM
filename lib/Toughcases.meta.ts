/**
 * lib/phoneCases/toughCases.meta.ts
 *
 * "ToughCases" series — WOYC
 * Files: /public/phoneCases/ToughCases *.png
 *
 * Total on disk: 51 files
 *   Exclusive to this series (27): Google Pixel (all), Samsung S10/S20/variants,
 *                                  iPhone 8, 12, 12 Pro, XS Max + Samsung FE/Plus/Ultra
 *   Also in ToughPhoneCases (24):  iPhone 11–15, X/XR/XS, Samsung S21–S24
 *
 * ⚠️  The 24 overlapping models are KEPT here intentionally.
 *     Both series exist on disk and have DIFFERENT physical cuts
 *     (camera hole, border thickness, port notch) — confirmed visually.
 */

import { CaseModel, getPriceLKR } from './types';

const mk = (label: string, file: string): CaseModel => ({
  label,
  file,
  series:   'toughcases',
  priceLKR: getPriceLKR(label),
});

export const TOUGH_CASES: CaseModel[] = [

  // ── Google Pixel — EXCLUSIVE to this series ───────────────────────────────
  mk('Pixel 5',     'ToughCases Google Pixel 5.png'),
  mk('Pixel 6',     'ToughCases Google Pixel 6.png'),
  mk('Pixel 6 Pro', 'ToughCases Google Pixel 6 Pro.png'),
  mk('Pixel 7',     'ToughCases Google Pixel 7.png'),
  mk('Pixel 8',     'ToughCases Google Pixel 8.png'),
  mk('Pixel 8 Pro', 'ToughCases Google Pixel 8 Pro.png'),

  // ── Apple iPhone — EXCLUSIVE to this series ───────────────────────────────
  mk('iPhone 8',        'ToughCases iPhone 8.png'),
  mk('iPhone 8 Plus',   'ToughCases iPhone 8 Plus.png'),
  mk('iPhone XS Max',   'ToughCases iPhone XS Max.png'),
  mk('iPhone 12',       'ToughCases iPhone 12.png'),
  mk('iPhone 12 Pro',   'ToughCases iPhone 12 Pro.png'),

  // ── Apple iPhone — ALSO in ToughPhoneCases (different cuts, kept both) ────
  mk('iPhone X',            'ToughCases iPhone X.png'),
  mk('iPhone XR',           'ToughCases iPhone XR.png'),
  mk('iPhone XS',           'ToughCases iPhone XS.png'),
  mk('iPhone 11',           'ToughCases iPhone 11.png'),
  mk('iPhone 11 Pro',       'ToughCases iPhone 11 Pro.png'),
  mk('iPhone 11 Pro Max',   'ToughCases iPhone 11 Pro Max.png'),
  mk('iPhone 12 Mini',      'ToughCases iPhone 12 Mini.png'),
  mk('iPhone 12 Pro Max',   'ToughCases iPhone 12 Pro Max.png'),
  mk('iPhone 13',           'ToughCases iPhone 13.png'),
  mk('iPhone 13 Mini',      'ToughCases iPhone 13 Mini.png'),
  mk('iPhone 13 Pro',       'ToughCases iPhone 13 Pro.png'),
  mk('iPhone 13 Pro Max',   'ToughCases iPhone 13 Pro Max.png'),
  mk('iPhone 14',           'ToughCases iPhone 14.png'),
  mk('iPhone 14 Plus',      'ToughCases iPhone 14 Plus.png'),
  mk('iPhone 14 Pro',       'ToughCases iPhone 14 Pro.png'),
  mk('iPhone 14 Pro Max',   'ToughCases iPhone 14 Pro Max.png'),
  mk('iPhone 15',           'ToughCases iPhone 15.png'),
  mk('iPhone 15 Plus',      'ToughCases iPhone 15 Plus.png'),
  mk('iPhone 15 Pro',       'ToughCases iPhone 15 Pro.png'),
  mk('iPhone 15 Pro Max',   'ToughCases iPhone 15 Pro Max.png'),

  // ── Samsung — EXCLUSIVE to this series ───────────────────────────────────
  mk('Galaxy S10',       'ToughCases Samsung S10.png'),
  mk('Galaxy S10 Plus',  'ToughCases Samsung S10 Plus.png'),
  mk('Galaxy S10 Edge',  'ToughCases Samsung S10 Edge.png'),
  mk('Galaxy S20',       'ToughCases Samsung S20.png'),
  mk('Galaxy S20 FE',    'ToughCases Samsung S20 FE.png'),
  mk('Galaxy S20 Plus',  'ToughCases Samsung S20 Plus.png'),
  mk('Galaxy S20 Ultra', 'ToughCases Samsung S20 Ultra.png'),
  mk('Galaxy S21 FE',    'ToughCases Samsung S21 FE.png'),
  mk('Galaxy S21 Plus',  'ToughCases Samsung S21 Plus.png'),
  mk('Galaxy S21 Ultra', 'ToughCases Samsung S21 Ultra.png'),
  mk('Galaxy S22 Plus',  'ToughCases Samsung S22 Plus.png'),
  mk('Galaxy S22 Ultra', 'ToughCases Samsung S22 Ultra.png'),
  mk('Galaxy S23 Plus',  'ToughCases Samsung S23 Plus.png'),
  mk('Galaxy S23 Ultra', 'ToughCases Samsung S23 Ultra.png'),
  mk('Galaxy S24 Plus',  'ToughCases Samsung S24 Plus.png'),
  mk('Galaxy S24 Ultra', 'ToughCases Samsung S24 Ultra.png'),

  // ── Samsung — ALSO in ToughPhoneCases (different cuts, kept both) ─────────
  mk('Galaxy S21',       'ToughCases Samsung S21.png'),
  mk('Galaxy S22',       'ToughCases Samsung S22.png'),
  mk('Galaxy S23',       'ToughCases Samsung S23.png'),
  mk('Galaxy S24',       'ToughCases Samsung S24.png'),
];