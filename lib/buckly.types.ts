// lib/buckley.types.ts

// ─── Raw WooCommerce Store API ────────────────────────────────────────────────

export interface BKLWCImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface BKLWCPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface BKLWCAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string }[];
}

export interface BKLWCCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface BKLWCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: BKLWCPrice;
  on_sale: boolean;
  is_in_stock: boolean;
  images: BKLWCImage[];
  categories: BKLWCCategory[];
  attributes: BKLWCAttribute[];
  average_rating: string;
  review_count: number;
  has_options: boolean;
}

// ─── Normalised ───────────────────────────────────────────────────────────────

export interface BKLProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  shortDescription: string;
  /** Price stored as LKR integer (minor units ÷ 100 → display rupees) */
  price: number;
  originalPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  image: string;
  images: string[];
  /** jewellery type slug: earrings, necklaces, bracelets, rings, bangles, sets … */
  jewelleryType: string;
  jewelleryTypeLabel: string;
  /** material / finish hint parsed from name/attributes */
  material: string;
  sizes: string[];
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
}

export interface BKLApiResponse {
  products: BKLProduct[];
  total: number;
  totalPages: number;
  page: number;
  fetchedAt: string;
}

export interface BKLApiError {
  error: string;
  detail?: string;
}