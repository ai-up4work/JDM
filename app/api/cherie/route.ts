// app/api/cherie/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { CherieShopifyProduct, CherieApiResponse, CherieApiError } from '@/lib/cherie.types';
import { normalise } from '@/lib/cherie.normalise';

const CHERIE_BASE   = 'https://cherielueur.com';
const CACHE_SECONDS = 60 * 10; // 10 min

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

/**
 * Shopify /products.json supports:
 *   limit    – 1-250 (default 50)
 *   page     – 1-based, deprecated but still works for simple stores
 *   collection_id – filter by collection (requires a separate lookup)
 *   product_type  – filter by product type string
 *   vendor        – filter by vendor
 *   title         – exact title match (not useful for search)
 *
 * For collection filtering we map slug → handle and use
 *   /collections/{handle}/products.json
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<CherieApiResponse | CherieApiError>> {
  try {
    const { searchParams } = new URL(req.url);
    const page       = Math.max(1,  parseInt(searchParams.get('page')      ?? '1',  10));
    const perPage    = Math.min(48, parseInt(searchParams.get('per_page')  ?? '24', 10));
    const collection = searchParams.get('collection') ?? ''; // e.g. "rings", "earrings"
    const search     = searchParams.get('search')     ?? '';

    // Build the Shopify endpoint
    // If a collection handle is given use /collections/{handle}/products.json
    // Otherwise use /products.json
    const endpoint = collection
      ? `${CHERIE_BASE}/collections/${encodeURIComponent(collection)}/products.json`
      : `${CHERIE_BASE}/products.json`;

    const params = new URLSearchParams({
      limit: String(Math.min(perPage * 2, 250)), // over-fetch so client-side search/sort works
      page:  String(page),
    });

    const res = await fetch(`${endpoint}?${params}`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) throw new Error(`cherielueur.com returned ${res.status}`);

    const json: { products: CherieShopifyProduct[] } = await res.json();
    let products = json.products.map(normalise);

    // Client-side search filter (Shopify public API has no free-text search)
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.productType.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Paginate after filtering
    const total    = products.length;
    const start    = (page - 1) * perPage;
    const paged    = products.slice(start, start + perPage);
    const hasMore  = start + perPage < total || json.products.length === Math.min(perPage * 2, 250);

    return NextResponse.json(
      {
        products:  paged,
        total,
        page,
        hasMore,
        fetchedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[cherie API]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch from cherielueur.com', detail: msg },
      { status: 502 }
    );
  }
}