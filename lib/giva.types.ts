// lib/giva.types.ts

// ─── Raw Shopify shapes ────────────────────────────────────────────────────────

export interface GIVAShopifyImage {
  id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
  variant_ids: number[];
}

export interface GIVAShopifyOption {
  id: number;
  name: string;       // e.g. "Metal Colour", "Size"
  position: number;
  values: string[];
}

export interface GIVAShopifyVariant {
  id: number;
  title: string;           // e.g. "Silver / S"
  price: string;           // "3900.00"
  compare_at_price: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  available: boolean;
  sku: string;
  image_id: number | null;
  weight: number;
  weight_unit: string;
}

export interface GIVAShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  options: GIVAShopifyOption[];
  variants: GIVAShopifyVariant[];
  images: GIVAShopifyImage[];
  image: GIVAShopifyImage | null;
}

export interface GIVAShopifyProductsResponse {
  products: GIVAShopifyProduct[];
}

// ─── Normalised internal shape ─────────────────────────────────────────────────

export interface GIVAVariant {
  id: number;
  title: string;
  price: number;           // in LKR minor units (×100)
  compareAtPrice: number | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  available: boolean;
  sku: string;
  imageId: number | null;
}

export interface GIVAProduct {
  id: number;
  handle: string;
  name: string;
  description: string;       // stripped HTML
  descriptionHtml: string;   // raw HTML for rich rendering
  productType: string;
  vendor: string;
  tags: string[];

  // Pricing (from cheapest available variant)
  price: number;             // LKR minor units (×100)
  compareAtPrice: number | null;
  onSale: boolean;
  inStock: boolean;

  // Media
  image: string;             // primary image URL
  images: string[];          // all image URLs

  // Variants & options
  variants: GIVAVariant[];
  options: { name: string; values: string[] }[];

  // Convenience flags derived from options
  metalColours: string[];    // from option named "Metal Colour" / "Color" etc.
  sizes: string[];           // from option named "Size"

  // Collection / category label (enriched from collection context)
  collectionLabel: string;

  // Permalink
  permalink: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ─── API response shapes ───────────────────────────────────────────────────────

export interface GIVAApiResponse {
  products: GIVAProduct[];
  total: number;
  totalPages: number;
  page: number;
  collection: string | null;
  fetchedAt: string;
}

export interface GIVAApiError {
  error: string;
  detail?: string;
}