/**
 * lib/phoneCases/toughPhoneCases.meta.ts
 *
 * "Tough Phone Cases" series — SPOKE Custom Products
 * Files: /public/phoneCases/Tough Phone Cases *.png
 *
 * Total on disk: 32 files
 *   Exclusive to this series (8):  legacy bundled iPhones + Samsung S6
 *   Also in ToughCases (24):       iPhone 11–15, X/XR/XS, Samsung S21–S24
 *
 * ⚠️  The 24 overlapping models are KEPT here intentionally.
 *     Both series exist on disk and have DIFFERENT physical cuts
 *     (camera hole, border thickness, port notch) — confirmed visually.
 *     Do NOT remove them or point to ToughCases files instead.
 */

import { CaseModel, getPriceLKR } from './types';

const mk = (label: string, file: string): CaseModel => ({
  label,
  file,
  series:   'tough-phone-cases',
  priceLKR: getPriceLKR(label),
});

export const TOUGH_PHONE_CASES: CaseModel[] = [

  // ── Apple iPhone — EXCLUSIVE to this series (legacy / bundled) ────────────
  mk('iPhone 5 & 5s & 5se', 'Tough Phone Cases iPhone 5 & 5s & 5se.png'),
  mk('iPhone 6 & 6s',       'Tough Phone Cases iPhone 6 & 6s.png'),
  mk('iPhone 6 & 6s Plus',  'Tough Phone Cases iPhone 6 & 6s Plus.png'),
  mk('iPhone 7 & 8',        'Tough Phone Cases iPhone 7 & 8.png'),
  mk('iPhone 7 & 8 Plus',   'Tough Phone Cases iPhone 7 & 8 Plus.png'),
  mk('iPhone 12 & 12 Pro',  'Tough Phone Cases iPhone 12 & 12 Pro.png'),
  mk('iPhone X MAX',        'Tough Phone Cases iPhone X MAX.png'),

  // ── Apple iPhone — ALSO in ToughCases (different cuts, kept both) ─────────
  mk('iPhone X',            'Tough Phone Cases iPhone X.png'),
  mk('iPhone XR',           'Tough Phone Cases iPhone XR.png'),
  mk('iPhone XS',           'Tough Phone Cases iPhone XS.png'),
  mk('iPhone 11',           'Tough Phone Cases iPhone 11.png'),
  mk('iPhone 11 Pro',       'Tough Phone Cases iPhone 11 Pro.png'),
  mk('iPhone 11 Pro Max',   'Tough Phone Cases iPhone 11 Pro Max.png'),
  mk('iPhone 12 Mini',      'Tough Phone Cases iPhone 12 Mini.png'),
  mk('iPhone 12 Pro Max',   'Tough Phone Cases iPhone 12 Pro Max.png'),
  mk('iPhone 13',           'Tough Phone Cases iPhone 13.png'),
  mk('iPhone 13 Mini',      'Tough Phone Cases iPhone 13 Mini.png'),
  mk('iPhone 13 Pro',       'Tough Phone Cases iPhone 13 Pro.png'),
  mk('iPhone 13 Pro Max',   'Tough Phone Cases iPhone 13 Pro Max.png'),
  mk('iPhone 14',           'Tough Phone Cases iPhone 14.png'),
  mk('iPhone 14 Plus',      'Tough Phone Cases iPhone 14 Plus.png'),
  mk('iPhone 14 Pro',       'Tough Phone Cases iPhone 14 Pro.png'),
  mk('iPhone 14 Pro Max',   'Tough Phone Cases iPhone 14 Pro Max.png'),
  mk('iPhone 15',           'Tough Phone Cases iPhone 15.png'),
  mk('iPhone 15 Plus',      'Tough Phone Cases iPhone 15 Plus.png'),
  mk('iPhone 15 Pro',       'Tough Phone Cases iPhone 15 Pro.png'),
  mk('iPhone 15 Pro Max',   'Tough Phone Cases iPhone 15 Pro Max.png'),

  // ── Samsung — EXCLUSIVE to this series ────────────────────────────────────
  mk('Galaxy S6',           'Tough Phone Cases Samsung S6.png'),

  // ── Samsung — ALSO in ToughCases (different cuts, kept both) ─────────────
  mk('Galaxy S21',          'Tough Phone Cases Samsung S21.png'),
  mk('Galaxy S22',          'Tough Phone Cases Samsung S22.png'),
  mk('Galaxy S23',          'Tough Phone Cases Samsung S23.png'),
  mk('Galaxy S24',          'Tough Phone Cases Samsung S24.png'),
];