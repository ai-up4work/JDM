// lib/cherie.types.ts

// ─── Raw Shopify product shape (from /products.json) ─────────────────────────

export interface CherieShopifyImage {
  id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
  position: number;
  variant_ids: number[];
}

export interface CherieShopifyOption {
  id: number;
  name: string;
  position: number;
  values: string[];
}

export interface CherieShopifyVariant {
  id: number;
  title: string;
  price: string;           // e.g. "4500.00"
  compare_at_price: string | null;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string;
  inventory_quantity: number;
  weight: number;
  weight_unit: string;
  image_id: number | null;
}

export interface CherieShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  options: CherieShopifyOption[];
  images: CherieShopifyImage[];
  variants: CherieShopifyVariant[];
}

// ─── Normalised shape used by the UI ─────────────────────────────────────────

export interface CherieVariant {
  id: number;
  title: string;
  /** price in LKR cents (amount × 100) */
  price: number;
  /** original price in LKR cents if on sale */
  compareAtPrice: number | null;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string;
  imageId: number | null;
}

export interface CherieProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  /** primary image URL */
  image: string;
  /** all image URLs */
  images: string[];
  /** image id → URL map for variant-specific images */
  imageMap: Record<number, string>;
  variants: CherieVariant[];
  /** lowest available variant price, LKR cents */
  price: number;
  /** lowest compare-at price across variants, or null */
  compareAtPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  /** option names, e.g. ["Size", "Color"] */
  optionNames: string[];
  /** values per option, e.g. [["S","M","L"], ["Gold","Silver"]] */
  optionValues: string[][];
  description: string;
  shortDescription: string;
  permalink: string;
  collection: string;
  publishedAt: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface CherieApiResponse {
  products: CherieProduct[];
  /** total available via pagination header */
  total: number;
  page: number;
  /** whether more pages exist (Shopify doesn't give totalPages directly) */
  hasMore: boolean;
  fetchedAt: string;
}

export interface CherieApiError {
  error: string;
  detail?: string;
}