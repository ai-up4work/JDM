// app/api/oldmoney/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type {
  ShopifyProduct,
  OMProduct,
  OMApiResponse,
  OMApiError,
} from '@/lib/oldmoney.types';

// ─── Config ───────────────────────────────────────────────────────────────────

const OM_BASE       = 'https://old-money.com';
const CACHE_SECONDS = 60 * 10; // 10 min

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

// Map Shopify collection handles → our UI labels
const COLLECTION_MAP: Record<string, string> = {
  'all-products':       'All',
  'tops':               'Tops',
  'bestsellers':        'Bestsellers',
  'old-money-polos':    'Polos',
  'old-money-cashmere': 'Cashmere',
  'linen':              'Linen',
  'fw25':               'FW25',
  'old-money-shoes':    'Shoes',
  'accessories':        'Accessories',
  'women':              'Women',
  'women-shoes':        'Women Shoes',
  'women-handbags':     'Handbags',
  'women-accessories':  'Women Accessories',
};

// Tag/type → gender heuristic
function detectGender(p: ShopifyProduct): 'men' | 'women' | 'unisex' {
  const haystack = [p.product_type, ...p.tags, p.title].join(' ').toLowerCase();
  if (haystack.includes('women') || haystack.includes('lady') || haystack.includes('ladies')) return 'women';
  if (haystack.includes('men') || haystack.includes('unisex')) return 'men';
  return 'men'; // Old Money is primarily menswear
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Shopify prices are strings like "89.00" (USD)
function toCents(str: string | null): number {
  if (!str) return 0;
  return Math.round(parseFloat(str) * 100);
}

function normalise(raw: ShopifyProduct, collection = ''): OMProduct {
  const variant0    = raw.variants[0];
  const price       = toCents(variant0?.price ?? '0');
  const compareAt   = toCents(variant0?.compare_at_price ?? null);
  const originalPrice = compareAt > price ? compareAt : null;

  // Sizes = any option named "Size"
  const sizeOpt  = raw.options.find(o => o.name.toLowerCase() === 'size');
  const colorOpt = raw.options.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');

  return {
    id:           raw.id,
    title:        raw.title,
    handle:       raw.handle,
    permalink:    `${OM_BASE}/products/${raw.handle}`,
    description:  stripHtml(raw.body_html),
    vendor:       raw.vendor,
    productType:  raw.product_type,
    tags:         raw.tags,
    price,
    originalPrice,
    onSale:       !!originalPrice,
    inStock:      raw.available,
    image:        raw.images[0]?.src ?? '',
    images:       raw.images.map(i => i.src),
    sizes:        sizeOpt?.values ?? [],
    colors:       colorOpt?.values ?? [],
    options:      raw.options.map(o => ({ name: o.name, values: o.values })),
    variants:     raw.variants.map(v => ({
      id:        v.id,
      title:     v.title,
      price:     toCents(v.price),
      available: v.available,
      options:   [v.option1, v.option2, v.option3],
    })),
    gender:       detectGender(raw),
    category:     COLLECTION_MAP[collection] ?? raw.product_type ?? 'Clothing',
  };
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchCollection(
  collection: string,
  page: number,
  limit: number
): Promise<ShopifyProduct[]> {
  // Shopify Ajax API: /collections/{handle}/products.json
  // Falls back to /products.json for "all"
  const endpoint = collection && collection !== 'all-products'
    ? `${OM_BASE}/collections/${collection}/products.json`
    : `${OM_BASE}/products.json`;

  const url = `${endpoint}?limit=${limit}&page=${page}`;

  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: CACHE_SECONDS },
  });

  if (!res.ok) throw new Error(`old-money.com returned ${res.status} for ${url}`);

  const data = await res.json();
  return (data.products ?? []) as ShopifyProduct[];
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest
): Promise<NextResponse<OMApiResponse | OMApiError>> {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get('collection') ?? 'all-products';
    const page       = Math.max(1, parseInt(searchParams.get('page')      ?? '1',  10));
    const perPage    = Math.min(48, parseInt(searchParams.get('per_page') ?? '24', 10));

    const raw      = await fetchCollection(collection, page, perPage);
    const products = raw.map(p => normalise(p, collection));

    return NextResponse.json(
      {
        products,
        page,
        perPage,
        hasMore: raw.length === perPage, // if we got a full page, there might be more
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30`,
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[oldmoney API]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch products from old-money.com', detail: msg },
      { status: 502 }
    );
  }
}