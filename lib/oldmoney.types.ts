// lib/oldmoney.types.ts

// ─── Raw Shopify Ajax API shapes ──────────────────────────────────────────────

export interface ShopifyImage {
  id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface ShopifyOption {
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;          // e.g. "89.00"
  compare_at_price: string | null;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string;
  inventory_quantity: number;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  images: ShopifyImage[];
  options: ShopifyOption[];
  variants: ShopifyVariant[];
  available: boolean;
}

// ─── Normalised shape used by our UI ─────────────────────────────────────────

export interface OMProduct {
  id: number;
  title: string;
  handle: string;
  permalink: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];

  price: number;            // USD cents → display as $X.XX
  originalPrice: number | null;
  onSale: boolean;
  inStock: boolean;

  image: string;
  images: string[];

  sizes: string[];
  colors: string[];
  options: { name: string; values: string[] }[];
  variants: {
    id: number;
    title: string;
    price: number;
    available: boolean;
    options: (string | null)[];
  }[];

  gender: 'men' | 'women' | 'unisex';
  category: string;
}

export interface OMApiResponse {
  products: OMProduct[];
  page: number;
  perPage: number;
  hasMore: boolean;
  fetchedAt: string;
}

export interface OMApiError {
  error: string;
  detail?: string;
}