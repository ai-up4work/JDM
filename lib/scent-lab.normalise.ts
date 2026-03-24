// lib/scent-lab.normalise.ts
import type { SLRawPerfume, SLPerfume } from '@/lib/scent-lab.types';

/**
 * Coerces the raw partner API object into the guaranteed SLPerfume shape
 * used throughout the UI (no undefined arrays, consistent defaults).
 */
export function normalise(raw: SLRawPerfume): SLPerfume {
  return {
    id:          raw.id,
    slug:        raw.slug,
    name:        raw.name,
    tagline:     raw.tagline  ?? '',
    description: raw.description ?? '',
    category:    raw.category,
    featured:    raw.featured  ?? false,
    inStock:     raw.inStock,
    images:      raw.images   ?? [],
    orderUrl:    raw.orderUrl ?? '',
    sizes:       raw.sizes    ?? [],
    intensity:   raw.intensity  ?? '',
    longevity:   raw.longevity  ?? '',
    sillage:     raw.sillage    ?? '',
    season:      raw.season   ?? [],
    occasion:    raw.occasion ?? [],
    notes: {
      top:   raw.notes?.top   ?? [],
      heart: raw.notes?.heart ?? [],
      base:  raw.notes?.base  ?? [],
    },
  };
}