// lib/kor.types.ts

export interface KORWCImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface KORWCPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface KORWCAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string }[];
}

export interface KORWCCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface KORWCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  prices: KORWCPrice;
  on_sale: boolean;
  is_in_stock: boolean;
  images: KORWCImage[];
  categories: KORWCCategory[];
  attributes: KORWCAttribute[];
  average_rating: string;
  review_count: number;
  has_options: boolean;
}

export interface KORProduct {
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
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
}

export interface KORApiResponse {
  products: KORProduct[];
  total: number;
  totalPages: number;
  page: number;
  fetchedAt: string;
}

export interface KORApiError {
  error: string;
  detail?: string;
}