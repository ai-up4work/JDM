// lib/otaku.types.ts

export interface OTKWCImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface OTKWCPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface OTKWCAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string }[];
}

export interface OTKWCCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface OTKWCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: OTKWCPrice;
  on_sale: boolean;
  is_in_stock: boolean;
  images: OTKWCImage[];
  categories: OTKWCCategory[];
  attributes: OTKWCAttribute[];
  average_rating: string;
  review_count: number;
  has_options: boolean;
}

// ─── Normalised ───────────────────────────────────────────────────────────────

export interface OTKProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  shortDescription: string;
  /** prices stored as integer minor units (LKR has 2 decimal places → stored as cents) */
  price: number;
  originalPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  image: string;
  images: string[];
  /** primary franchise / series category slug */
  franchise: string;
  franchiseLabel: string;
  /** product type slug (hoodie, t-shirt, etc.) */
  productType: string;
  productTypeLabel: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
}

export interface OTKApiResponse {
  products: OTKProduct[];
  total: number;
  totalPages: number;
  page: number;
  fetchedAt: string;
}

export interface OTKApiError {
  error: string;
  detail?: string;
}