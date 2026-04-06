// app/api/aiza-threads/product/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export interface LaamProductDetail {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  images: string[];
  rating: number | null;
  reviews: number | null;
  reviewList: { author: string; rating: number; comment: string; date: string }[];
  isNew: boolean;
  url: string;
  colors: string[];
  sizes: string[];
  category: string;
  description: string;
  fabric: string | null;
  sku: string | null;
  tags: string[];
  inStock: boolean;
}

// ── Cache ─────────────────────────────────────────
const productCache = new Map<string, { data: LaamProductDetail; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000;

// ── Fetch ─────────────────────────────────────────
async function fetchProductDetail(slug: string): Promise<LaamProductDetail> {
  const cached = productCache.get(slug);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const url = `https://laam.pk/products/${slug}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Failed ${res.status}`);

  const html = await res.text();
  const data = parseProductDetail(html, slug, url);

  productCache.set(slug, {
    data,
    expiry: Date.now() + CACHE_TTL,
  });

  return data;
}

// ── Helpers ───────────────────────────────────────
function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// 🔥 STRONG image extractor (FIXED)
function extractImages(html: string): string[] {
  const matches = html.match(/https:\/\/cdn\.shopify\.com\/[^\s"'<>]+/g) || [];

  let images = [
    ...new Set(
      matches
        .map((url) => url.split('?')[0])
        .filter((url) => url.match(/\.(jpg|jpeg|png|webp)/i))
    ),
  ];

  // normalize protocol
  images = images.map((url) =>
    url.startsWith('//') ? `https:${url}` : url
  );

  // remove thumbnails/icons
  images = images.filter(
    (url) =>
      !url.includes('_small') &&
      !url.includes('_thumb') &&
      !url.includes('icon')
  );

  return images.slice(0, 10);
}

// ── Parser ───────────────────────────────────────
function parseProductDetail(
  html: string,
  slug: string,
  url: string
): LaamProductDetail {
  // JSON-LD
  const ldMatch = html.match(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
  );

  let name = slug;
  let brand = '';
  let price = 0;
  let description = '';
  let images: string[] = [];
  let inStock = true;
  let sku: string | null = null;

  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);

      name = ld.name ?? name;
      description = stripTags(ld.description ?? '');
      sku = ld.sku ?? null;

      if (ld.brand) brand = ld.brand.name ?? '';

      if (ld.offers) {
        price = parseFloat(ld.offers.price || '0');
        inStock = String(ld.offers.availability || '')
          .toLowerCase()
          .includes('instock');
      }
    } catch {}
  }

  // 🔥 ALWAYS extract images (main fix)
  images = extractImages(html);

  // Brand slug
  const brandSlug =
    brand?.toLowerCase().replace(/\s+/g, '-') || '';

  return {
    id: slug,
    slug,
    name,
    brand,
    brandSlug,
    price,
    originalPrice: null,
    discount: null,
    images,
    rating: null,
    reviews: null,
    reviewList: [],
    isNew: html.includes('badge-new'),
    url,
    colors: [],
    sizes: [],
    category: 'Clothing',
    description,
    fabric: null,
    sku,
    tags: [],
    inStock,
  };
}

// ── Route ─────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await fetchProductDetail(slug);

    // console.log('✅ Images found:', product.images.length);

    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }
}