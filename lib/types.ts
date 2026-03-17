/**
 * lib/phoneCases/types.ts
 * Shared types, helpers, and template definitions.
 */

// ─── Core types ───────────────────────────────────────────────────────────────

export type CaseSeries  = 'tough-phone-cases' | 'toughcases';
export type BrandId     = 'iphone' | 'samsung' | 'google';
export type TemplateId  = 'full' | 'centered' | 'top';

export interface CaseModel {
  label:    string;
  file:     string;
  series:   CaseSeries;
  priceLKR: number;
}

export interface Brand {
  id:     BrandId;
  label:  string;
  /** Display name shown in UI (e.g. "Apple", "Samsung", "Google") */
  vendor: string;
  models: CaseModel[];
}

export interface CaseTemplate {
  id:    TemplateId;
  label: string;
  desc:  string;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export function getPriceLKR(label: string): number {
  if (/pro max|ultra/i.test(label)) return 3200;
  if (/plus/i.test(label))          return 2900;
  if (/pro|max/i.test(label))       return 2800;
  return 2400;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const TEMPLATES: CaseTemplate[] = [
  { id: 'full',     label: 'Full cover', desc: 'Edge-to-edge print'  },
  { id: 'centered', label: 'Centered',   desc: 'Framed with border'  },
  { id: 'top',      label: 'Top half',   desc: 'Upper panel only'    },
];

export const getTemplate = (id: TemplateId): CaseTemplate =>
  TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];