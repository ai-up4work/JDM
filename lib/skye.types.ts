// lib/skye.types.ts

// ─── Raw WooCommerce Store API shapes ─────────────────────────────────────────

export interface SkyeWCImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface SkyeWCPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface SkyeWCAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string }[];
}

export interface SkyeWCCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface SkyeWCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: SkyeWCPrice;
  on_sale: boolean;
  is_in_stock: boolean;
  images: SkyeWCImage[];
  categories: SkyeWCCategory[];
  attributes: SkyeWCAttribute[];
  average_rating: string;
  review_count: number;
  has_options: boolean;
}

// ─── Normalised shape ─────────────────────────────────────────────────────────

export interface SkyeProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  shortDescription: string;
  price: number;           // LKR integer
  originalPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  image: string;
  images: string[];
  category: string;        // slug
  categoryLabel: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
}

export interface SkyeApiResponse {
  products: SkyeProduct[];
  total: number;
  totalPages: number;
  page: number;
  fetchedAt: string;
}

export interface SkyeApiError {
  error: string;
  detail?: string;
}