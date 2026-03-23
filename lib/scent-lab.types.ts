export interface SLSize {
  ml:    number;
  price: number;
}

export interface SLNotes {
  top:   string[];
  heart: string[];
  base:  string[];
}

export type SLCategory = 'Men' | 'Women' | 'Unisex';

export interface SLPerfume {
  slug:        string;
  name:        string;
  tagline:     string;
  description: string;
  currency:    string;
  category:    SLCategory;
  intensity:   string;
  longevity:   string;
  sillage:     string;
  occasion:    string[];
  season:      string[];
  notes:       SLNotes;
  sizes:       SLSize[];
  images:      string[];
  featured:    boolean;
  inStock:     boolean;
  orderUrl?:   string;
}

export interface SLListResponse {
  count: number;
  data:  SLPerfume[];
}

export interface SLSingleResponse {
  data: SLPerfume;
}

export interface SLError {
  error:   string;
  detail?: string;
}