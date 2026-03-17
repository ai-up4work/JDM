/**
 * lib/phoneCases/index.ts
 *
 * Barrel export — import everything from here:
 *   import { BRANDS_TPC, BRANDS_TC, TEMPLATES, ... } from '@/lib/phoneCases'
 *
 * KEY ARCHITECTURE DECISION (based on visual confirmation):
 * ──────────────────────────────────────────────────────────
 * ToughPhoneCases and ToughCases are TWO SEPARATE PRODUCTS with
 * different physical moulds. The 24 models that appear in both
 * series use DIFFERENT cut templates. They are NOT interchangeable.
 *
 * Therefore the index exposes TWO brand lists — one per series.
 * The page selects which list to show based on which case type
 * (product) the customer picked in Step 1.
 *
 * File breakdown on disk:
 *   Tough Phone Cases: 32 files (8 exclusive + 24 shared models)
 *   ToughCases:        51 files (27 exclusive + 24 shared models)
 *   Total unique files: 83
 */

export type {
  CaseModel, Brand, BrandId, CaseSeries,
  TemplateId, CaseTemplate,
} from './types';
export { getPriceLKR, TEMPLATES, getTemplate } from './types';
export { SERIES_META } from './SeriesMeta';

import { TOUGH_PHONE_CASES } from './Toughphonecases.meta';
import { TOUGH_CASES        } from './Toughcases.meta';
import type { Brand, BrandId, CaseModel } from './types';

// ─── Sort helper ──────────────────────────────────────────────────────────────
function numSort(a: CaseModel, b: CaseModel) {
  const n = (s: string) => parseInt(s.match(/\d+/)?.[0] ?? '0', 10);
  return n(a.label) - n(b.label);
}

// ─── BRANDS for "Tough Phone Cases" (SPOKE) ───────────────────────────────────
// 32 models: iPhone (27) + Samsung (5)
// Google NOT available in this series.

const tpc_iphone  = TOUGH_PHONE_CASES.filter(m => m.label.startsWith('iPhone')).sort(numSort);
const tpc_samsung = TOUGH_PHONE_CASES.filter(m => m.label.startsWith('Galaxy')).sort(numSort);

export const BRANDS_TPC: Brand[] = [
  { id: 'iphone',  label: 'iPhone',  vendor: 'Apple',   models: tpc_iphone  },
  { id: 'samsung', label: 'Samsung', vendor: 'Samsung', models: tpc_samsung },
];

// ─── BRANDS for "ToughCases" (WOYC) ──────────────────────────────────────────
// 51 models: iPhone (24) + Samsung (21) + Google Pixel (6)

const tc_iphone  = TOUGH_CASES.filter(m => m.label.startsWith('iPhone')).sort(numSort);
const tc_samsung = TOUGH_CASES.filter(m => m.label.startsWith('Galaxy')).sort(numSort);
const tc_google  = TOUGH_CASES.filter(m => m.label.startsWith('Pixel')).sort(numSort);

export const BRANDS_TC: Brand[] = [
  { id: 'iphone',  label: 'iPhone',  vendor: 'Apple',   models: tc_iphone  },
  { id: 'samsung', label: 'Samsung', vendor: 'Samsung', models: tc_samsung },
  { id: 'google',  label: 'Google',  vendor: 'Google',  models: tc_google  },
];

// ─── Convenience: get the right brand list for a case type's mockupFolder ────
export function getBrandsForFolder(mockupFolder: string | null): Brand[] {
  if (mockupFolder === 'toughPhoneCases') return BRANDS_TPC;
  if (mockupFolder === 'toughCases')      return BRANDS_TC;
  return BRANDS_TC; // default to TC (larger set) for future types
}

export function getBrand(brands: Brand[], id: BrandId): Brand | undefined {
  return brands.find(b => b.id === id);
}

// ─── Flat lists for reference / admin ────────────────────────────────────────
export const ALL_TPC_MODELS: CaseModel[] = TOUGH_PHONE_CASES;
export const ALL_TC_MODELS:  CaseModel[] = TOUGH_CASES;

export const TPC_EXCLUSIVE = TOUGH_PHONE_CASES.filter(m => {
  const tcLabels = new Set(TOUGH_CASES.map(x => x.label));
  return !tcLabels.has(m.label);
});

export const TC_EXCLUSIVE = TOUGH_CASES.filter(m => {
  const tpcLabels = new Set(TOUGH_PHONE_CASES.map(x => x.label));
  return !tpcLabels.has(m.label);
});

export const SHARED_MODELS_COUNT = 24; // iPhone 11–15, X/XR/XS, Samsung S21–S24