// app/api/giva/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type {
  GIVAShopifyProduct,
  GIVAProduct,
  GIVAApiError,
} from '@/lib/giva.types';
import { normalise } from '@/lib/giva.normalise';

const GIVA_BASE     = 'https://www.giva.lk';
const CACHE_SECONDS = 60 * 10;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

/**
 * GET /api/giva/[id]
 *
 * [id] can be either:
 *  - A Shopify numeric product ID  → hits /products/{id}.json
 *  - A product handle (slug)       → hits /products/{handle}.json
 *
 * Shopify's public product JSON endpoint supports both interchangeably
 * when the store doesn't password-protect it.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ product: GIVAProduct } | GIVAApiError>> {
  try {
    const { id } = await params;

    const res = await fetch(
      `${GIVA_BASE}/products/${encodeURIComponent(id)}.json`,
      { headers: HEADERS, next: { revalidate: CACHE_SECONDS } }
    );

    if (res.status === 404) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (!res.ok) throw new Error(`giva.lk returned ${res.status}`);

    const data: { product: GIVAShopifyProduct } = await res.json();
    const product = normalise(data.product);

    return NextResponse.json(
      { product },
      {
        headers: {
          'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30`,
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[giva single]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch product', detail: msg },
      { status: 502 }
    );
  }
}