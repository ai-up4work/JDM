// lib/scent-lab.types.ts

// ─── Raw partner API response shape ──────────────────────────────────────────

export interface SLRawPerfume {
  id:          string;
  slug:        string;
  name:        string;
  tagline?:    string;
  description?: string;
  category:    string;            // 'Men' | 'Women' | 'Unisex'
  featured?:   boolean;
  inStock:     boolean;
  images?:     string[];
  orderUrl?:   string;

  // Pricing: sizes array with volume label + price in LKR
  // volume is a display string from the API, e.g. "5ml", "10ml", "Full Bottle"
  sizes: { volume: string; price: number }[];

  // Fragrance profile
  intensity?:  string;            // e.g. 'Intense', 'Moderate', 'Light'
  longevity?:  string;            // e.g. '8–12 hours'
  sillage?:    string;            // e.g. 'Heavy', 'Moderate', 'Soft'
  season?:     string[];          // e.g. ['Summer', 'Spring']
  occasion?:   string[];          // e.g. ['Casual', 'Evening', 'Office']

  notes?: {
    top?:   string[];
    heart?: string[];
    base?:  string[];
  };
}

// ─── Partner API envelope ─────────────────────────────────────────────────────

export interface SLListResponse {
  data:        SLRawPerfume[];
  total?:      number;
  fetchedAt?:  string;
}

export interface SLSingleResponse {
  data:        SLPerfume;
}

// ─── Normalised (= same shape used throughout the UI) ────────────────────────
// The partner API already returns clean data, so SLPerfume closely mirrors
// SLRawPerfume but with guaranteed non-optional arrays where needed.

export type SLPerfume = Omit<SLRawPerfume, 'images' | 'sizes' | 'season' | 'occasion' | 'notes'> & {
  images:   string[];
  sizes:    { volume: string; price: number }[];
  season:   string[];
  occasion: string[];
  notes:    { top: string[]; heart: string[]; base: string[] };
};

export interface SLApiListResponse {
  perfumes:  SLPerfume[];
  total:     number;
  fetchedAt: string;
}

export interface SLApiError {
  error:   string;
  detail?: string;
}