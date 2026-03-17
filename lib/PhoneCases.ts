/**
 * lib/phoneCases/index.ts
 *
 * Barrel export — import everything from here:
 *   import { BRANDS, TEMPLATES, getTemplate, ... } from '@/lib/phoneCases'
 *
 * Architecture:
 *   types.ts              → shared types + helpers
 *   toughPhoneCases.meta  → original series (32 models, print-template assets)
 *   toughCases.meta       → expanded series (51 models, mockup overlay assets)
 *   index.ts (this file)  → assembles brands, exposes unified API
 *
 * The two series use DIFFERENT case templates (confirmed visually):
 *   - Camera cutout position, size, and border style differ
 *   - "Tough Phone Cases" has a port notch; "ToughCases" does not
 *   → Never mix files across series for the same model
 */

export type { CaseModel, Brand, BrandId, CaseSeries, TemplateId, CaseTemplate } from './types';
export { getPriceLKR, TEMPLATES, getTemplate } from './types';

import { TOUGH_PHONE_CASES } from './Toughphonecases.meta';
import { TOUGH_CASES        } from './Toughcases.meta';
import type { Brand, BrandId, CaseModel } from './types';

// ─── Brand assembly ──────────────────────────────────────────────────────────
//
// Each brand groups models from BOTH series so the UI can present them
// together while preserving which file/series each model belongs to.
// We use the ToughCases (modern) version wherever both exist, and fall
// back to ToughPhoneCases for legacy-only models.
//
// Series breakdown per brand:
//   iPhone  → TPC: 27 models | TC: 24 models | overlap: 23 (TC preferred)
//   Samsung → TPC:  5 models | TC: 21 models | overlap:  4 (TC preferred)
//   Google  → TPC:  0 models | TC:  6 models | TC only

const tcByLabel  = new Map(TOUGH_CASES.map(m => [m.label, m]));
const tpcByLabel = new Map(TOUGH_PHONE_CASES.map(m => [m.label, m]));

/** All unique models — TC preferred when overlap exists */
const ALL_TC_LABELS  = new Set(TOUGH_CASES.map(m => m.label));
const LEGACY_ONLY    = TOUGH_PHONE_CASES.filter(m => !ALL_TC_LABELS.has(m.label));

function iphoneModels(): CaseModel[] {
  const tc  = TOUGH_CASES.filter(m => !m.label.startsWith('Galaxy') && !m.label.startsWith('Pixel'));
  const leg = LEGACY_ONLY.filter(m => !m.label.startsWith('Galaxy'));
  // order: legacy bundles first (5/6/7 era), then modern by generation
  return [...leg, ...tc].sort((a, b) => generationSort(a.label, b.label));
}

function samsungModels(): CaseModel[] {
  const tc  = TOUGH_CASES.filter(m => m.label.startsWith('Galaxy'));
  const leg = LEGACY_ONLY.filter(m => m.label.startsWith('Galaxy'));
  return [...leg, ...tc].sort((a, b) => generationSort(a.label, b.label));
}

function googleModels(): CaseModel[] {
  return TOUGH_CASES.filter(m => m.label.startsWith('Pixel'))
    .sort((a, b) => generationSort(a.label, b.label));
}

/** Numeric sort on the first number found in the label */
function generationSort(a: string, b: string): number {
  const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
  const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
  return numA - numB;
}

export const BRANDS: Brand[] = [
  { id: 'iphone',  label: 'iPhone',  vendor: 'Apple',   models: iphoneModels()  },
  { id: 'samsung', label: 'Samsung', vendor: 'Samsung', models: samsungModels() },
  { id: 'google',  label: 'Google',  vendor: 'Google',  models: googleModels()  },
];

// ─── Convenience helpers ──────────────────────────────────────────────────────

export const ALL_MODELS: CaseModel[] =
  BRANDS.flatMap(b => b.models);

export const getBrand = (id: BrandId) =>
  BRANDS.find(b => b.id === id);

export const getModelByFile = (file: string) =>
  ALL_MODELS.find(m => m.file === file);

/** Models unique to the original "Tough Phone Cases" series */
export const LEGACY_MODELS = LEGACY_ONLY;

/** Models from the expanded "ToughCases" series */
export const EXPANDED_MODELS = TOUGH_CASES;

// ─── Series metadata (for UI badges, tooltips, etc.) ─────────────────────────

export const SERIES_META = {
  'tough-phone-cases': {
    label:   'Classic series',
    desc:    'Original print-template assets · heavy border · port notch',
    count:   TOUGH_PHONE_CASES.length,
  },
  'toughcases': {
    label:   'Modern series',
    desc:    'Mockup overlay assets · slim border · concentric camera ring',
    count:   TOUGH_CASES.length,
  },
} as const;