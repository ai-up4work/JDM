// lib/muizza.types.ts
// Shared types for Muizza Fashion store — used by the API route,
// listing page, and slug page.

export interface MFProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  image: string | null;
  basePrice: number;        // starting price for this style (LKR)
  estimatedDays: number;    // typical tailoring turnaround
  fabric?: string;          // comma-separated, e.g. "Cotton, Silk, Georgette"
  occasion?: string;        // comma-separated, e.g. "Wedding, Party, Casual"
  description?: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  tags?: string[];
}

export interface MFApiResponse {
  products: MFProduct[];
  total: number;
  totalPages: number;
}

// Cart item stored in sessionStorage under 'mf_cart'
export interface MFCartItem extends MFProduct {
  selectedColour: string;
  selectedFabric: string;
  selectedSize: string;       // standard size label OR 'Custom'
  customMeasurements: string; // human-readable measurement string
  qty: number;
}