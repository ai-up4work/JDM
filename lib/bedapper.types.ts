// lib/bedapper.types.ts

// ─── Raw WooCommerce Store API shape ─────────────────────────────────────────
// /wp-json/wc/store/v1/products

export interface WCStoreImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface WCStorePrice {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: null | { min_amount: string; max_amount: string };
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WCStoreAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string; default?: boolean }[];
}

export interface WCStoreCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface WCStoreProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: WCStorePrice;
  on_sale: boolean;
  is_in_stock: boolean;
  images: WCStoreImage[];
  categories: WCStoreCategory[];
  attributes: WCStoreAttribute[];
  variations: number[];
  has_options: boolean;
  average_rating: string;
  review_count: number;
}

// ─── Normalised shape used by our UI ─────────────────────────────────────────

export interface BDProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  shortDescription: string;
  price: number;               // LKR integer
  originalPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  image: string;
  images: string[];
  category: string;            // first category slug
  categoryLabel: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
}

export interface BDApiResponse {
  products: BDProduct[];
  total: number;
  totalPages: number;
  page: number;
  cached: boolean;
  fetchedAt: string;
}

export interface BDApiError {
  error: string;
  detail?: string;
}