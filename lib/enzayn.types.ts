// lib/enzayn.types.ts

export interface ENZWCImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface ENZWCPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface ENZWCAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string }[];
}

export interface ENZWCCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface ENZWCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: ENZWCPrice;
  on_sale: boolean;
  is_in_stock: boolean;
  images: ENZWCImage[];
  categories: ENZWCCategory[];
  attributes: ENZWCAttribute[];
  average_rating: string;
  review_count: number;
  has_options: boolean;
}

// ─── Normalised ───────────────────────────────────────────────────────────────

export interface ENZProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  shortDescription: string;
  // prices stored as USD cents (e.g. $8.00 → 800)
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
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
}

export interface ENZApiResponse {
  products: ENZProduct[];
  total: number;
  totalPages: number;
  page: number;
  fetchedAt: string;
}

export interface ENZApiError {
  error: string;
  detail?: string;
}