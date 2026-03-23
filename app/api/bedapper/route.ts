// app/api/bedapper/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type {
  WCStoreProduct,
  BDProduct,
  BDApiResponse,
  BDApiError,
} from '@/lib/bedapper.types';

// ─── Config ───────────────────────────────────────────────────────────────────

const BD_BASE       = 'https://bedapper.lk';
const STORE_API     = `${BD_BASE}/wp-json/wc/store/v1`;
const CACHE_SECONDS = 60 * 10; // 10 min

const CATEGORY_MAP: Record<string, string> = {
  't-shirts':    'T-Shirts',
  'polos':       'Polos',
  'shirts':      'Shirts',
  'trousers':    'Trousers',
  'shorts':      'Shorts',
  'hoodies':     'Hoodies',
  'sweatshirts': 'Sweatshirts',
  'jackets':     'Jackets',
  'accessories': 'Accessories',
  'footwear':    'Footwear',
  'clothing':    'Clothing',
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function toInt(priceStr: string, minorUnit: number): number {
  return Math.round(parseFloat(priceStr) / Math.pow(10, minorUnit));
}

function extractSizes(product: WCStoreProduct): string[] {
  const attr = product.attributes.find(a => a.name.toLowerCase().includes('size'));
  return attr ? attr.terms.map(t => t.name) : [];
}

function extractColors(product: WCStoreProduct): string[] {
  const attr = product.attributes.find(
    a => a.name.toLowerCase().includes('color') || a.name.toLowerCase().includes('colour')
  );
  return attr ? attr.terms.map(t => t.name) : [];
}

export function normalise(raw: WCStoreProduct): BDProduct {
  const { prices } = raw;
  const mu          = prices.currency_minor_unit;
  const price       = toInt(prices.price, mu);
  const regular     = toInt(prices.regular_price, mu);
  const originalPrice = raw.on_sale && regular > price ? regular : null;

  const specificCat = raw.categories.find(
    c => c.slug !== 'clothing' && c.slug !== 'uncategorized'
  ) ?? raw.categories[0] ?? { slug: 'clothing', name: 'Clothing' };

  return {
    id:               raw.id,
    name:             raw.name,
    slug:             raw.slug,
    permalink:        raw.permalink,
    description:      stripHtml(raw.description),
    shortDescription: stripHtml(raw.short_description),
    price,
    originalPrice,
    onSale:           raw.on_sale,
    inStock:          raw.is_in_stock,
    image:            raw.images[0]?.src ?? '',
    images:           raw.images.map(i => i.src),
    category:         specificCat.slug,
    categoryLabel:    CATEGORY_MAP[specificCat.slug] ?? specificCat.name,
    sizes:            extractSizes(raw),
    colors:           extractColors(raw),
    rating:           parseFloat(raw.average_rating) || 0,
    reviewCount:      raw.review_count,
    hasVariants:      raw.has_options,
  };
}

// ─── Product list ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest
): Promise<NextResponse<BDApiResponse | BDApiError>> {
  try {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, parseInt(searchParams.get('page')      ?? '1',  10));
    const perPage  = Math.min(48, parseInt(searchParams.get('per_page') ?? '24', 10));
    const category = searchParams.get('category') ?? undefined;
    const search   = searchParams.get('search')   ?? undefined;

    const params = new URLSearchParams({
      page:     String(page),
      per_page: String(perPage),
      orderby:  'popularity',
      order:    'desc',
      status:   'publish',
    });
    if (category) params.set('category', category);
    if (search)   params.set('search', search);

    const res = await fetch(`${STORE_API}/products?${params}`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) throw new Error(`bedapper.lk returned ${res.status}`);

    const total      = parseInt(res.headers.get('X-WP-Total')      ?? '0', 10);
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
    const raw: WCStoreProduct[] = await res.json();

    return NextResponse.json(
      { products: raw.map(normalise), total, totalPages, page, cached: false, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[bedapper list]', msg);
    return NextResponse.json({ error: 'Failed to fetch products', detail: msg }, { status: 502 });
  }
}