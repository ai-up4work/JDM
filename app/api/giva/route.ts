// app/api/giva/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type {
  GIVAShopifyProductsResponse,
  GIVAApiResponse,
  GIVAApiError,
} from '@/lib/giva.types';
import { normalise } from '@/lib/giva.normalise';

const GIVA_BASE     = 'https://www.giva.lk';
const CACHE_SECONDS = 60 * 10; // 10 min
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

/**
 * Shopify exposes a public /products.json and /collections/{handle}/products.json
 * endpoint that doesn't require auth — perfect for a read-only catalogue proxy.
 *
 * Pagination: Shopify's public API supports `page` + `limit` params.
 * Max 250 per page on the public endpoint.
 *
 * Usage:
 *   GET /api/giva                            → all products, page 1
 *   GET /api/giva?collection=pendants        → filtered by collection handle
 *   GET /api/giva?search=rose+gold+ring      → client-side filtered (see note)
 *   GET /api/giva?page=2&per_page=24
 *
 * Note: Shopify's public JSON API doesn't support server-side search,
 * so for search we fetch a larger batch and filter client-side here.
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<GIVAApiResponse | GIVAApiError>> {
  try {
    const { searchParams } = new URL(req.url);
    const page       = Math.max(1, parseInt(searchParams.get('page')      ?? '1',  10));
    const perPage    = Math.min(48, parseInt(searchParams.get('per_page') ?? '24', 10));
    const collection = searchParams.get('collection') ?? '';
    const search     = (searchParams.get('search') ?? '').toLowerCase().trim();

    // ── Build Shopify URL ───────────────────────────────────────────────────
    // When searching we over-fetch then filter, otherwise paginate normally
    const shopifyLimit = search ? 250 : perPage;
    const shopifyPage  = search ? 1   : page;

    const endpoint = collection
      ? `${GIVA_BASE}/collections/${encodeURIComponent(collection)}/products.json`
      : `${GIVA_BASE}/products.json`;

    const params = new URLSearchParams({
      limit: String(shopifyLimit),
      page:  String(shopifyPage),
    });

    const res = await fetch(`${endpoint}?${params}`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) throw new Error(`giva.lk returned ${res.status}`);

    const data: GIVAShopifyProductsResponse = await res.json();
    let products = data.products.map(p => normalise(p));

    // ── Search filter ───────────────────────────────────────────────────────
    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search)       ||
        p.description.toLowerCase().includes(search)||
        p.tags.some(t => t.toLowerCase().includes(search)) ||
        p.productType.toLowerCase().includes(search)
      );
    }

    const total      = products.length;
    const totalPages = search
      ? Math.max(1, Math.ceil(total / perPage))
      : Math.max(1, Math.ceil(total / perPage)); // approximate for non-search

    // Slice for pagination when search is involved
    const sliced = search
      ? products.slice((page - 1) * perPage, page * perPage)
      : products;

    return NextResponse.json(
      {
        products:   sliced,
        total:      search ? total : total,   // exact for search, approximate otherwise
        totalPages,
        page,
        collection: collection || null,
        fetchedAt:  new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30`,
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[giva API]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch from giva.lk', detail: msg },
      { status: 502 }
    );
  }
}