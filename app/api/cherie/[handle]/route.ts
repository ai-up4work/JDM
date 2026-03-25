// app/api/cherie/[handle]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { CherieShopifyProduct, CherieProduct, CherieApiError } from '@/lib/cherie.types';
import { normalise } from '@/lib/cherie.normalise';

const CHERIE_BASE   = 'https://cherielueur.com';
const CACHE_SECONDS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

/**
 * Shopify exposes individual products at:
 *   /products/{handle}.json
 *
 * Shopify's public storefront API does not expose reviews natively.
 * If the store uses a reviews app (Judge.me, Yotpo, etc.) we can attempt
 * to hit Judge.me's public widget API as a best-effort.
 */

interface JudgeMeReview {
  id: number;
  title: string;
  body: string;
  rating: number;
  reviewer: { name: string; email: string };
  created_at: string;
}

async function fetchReviews(handle: string): Promise<JudgeMeReview[]> {
  try {
    // Judge.me public widget endpoint — works if the store uses Judge.me
    const res = await fetch(
      `https://judge.me/api/v1/reviews?shop_domain=cherielueur.com&handle=${encodeURIComponent(handle)}&per_page=5`,
      { headers: HEADERS, next: { revalidate: CACHE_SECONDS } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews ?? [];
  } catch { return []; }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
): Promise<NextResponse<{ product: CherieProduct; reviews: JudgeMeReview[] } | CherieApiError>> {
  try {
    const { handle } = await params;

    const res = await fetch(
      `${CHERIE_BASE}/products/${encodeURIComponent(handle)}.json`,
      { headers: HEADERS, next: { revalidate: CACHE_SECONDS } }
    );

    if (res.status === 404) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (!res.ok) throw new Error(`cherielueur.com returned ${res.status}`);

    const json: { product: CherieShopifyProduct } = await res.json();

    const [product, reviews] = await Promise.all([
      normalise(json.product),
      fetchReviews(handle),
    ]);

    return NextResponse.json(
      { product, reviews },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[cherie single]', msg);
    return NextResponse.json({ error: 'Failed to fetch product', detail: msg }, { status: 502 });
  }
}