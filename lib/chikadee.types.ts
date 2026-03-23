// lib/chickadee.types.ts

export interface CKWCImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface CKWCPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface CKWCAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string }[];
}

export interface CKWCCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface CKWCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: CKWCPrice;
  on_sale: boolean;
  is_in_stock: boolean;
  images: CKWCImage[];
  categories: CKWCCategory[];
  attributes: CKWCAttribute[];
  average_rating: string;
  review_count: number;
  has_options: boolean;
}

// ─── Normalised ───────────────────────────────────────────────────────────────

export interface CKProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  image: string;
  images: string[];
  category: string;
  categoryLabel: string;
  sizes: string[];
  colors: string[];
  materials: string[];
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
}

export interface CKApiResponse {
  products: CKProduct[];
  total: number;
  totalPages: number;
  page: number;
  fetchedAt: string;
}

export interface CKApiError {
  error: string;
  detail?: string;
}