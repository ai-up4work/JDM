// app/api/bedapper/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { WCStoreProduct, BDProduct, BDApiError } from '@/lib/bedapper.types';
import { normalise } from '@/app/api/bedapper/route';

const BD_BASE       = 'https://bedapper.lk';
const STORE_API     = `${BD_BASE}/wp-json/wc/store/v1`;
const CACHE_SECONDS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

// Also fetch WooCommerce product reviews via public REST (no auth needed for published reviews)
interface WCReview {
  id: number;
  date_created: string;
  review: string;
  rating: number;
  reviewer: string;
  reviewer_avatar_urls?: Record<string, string>;
}

async function fetchReviews(productId: number): Promise<WCReview[]> {
  try {
    const res = await fetch(
      `${BD_BASE}/wp-json/wc/v3/products/${productId}/reviews?per_page=5`,
      { headers: HEADERS, next: { revalidate: CACHE_SECONDS } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ product: BDProduct; reviews: WCReview[] } | BDApiError>> {
  try {
    const { id } = await params;

    // Try fetching by numeric ID first; fall back to slug search
    const isNumeric = /^\d+$/.test(id);

    let raw: WCStoreProduct | null = null;

    if (isNumeric) {
      const res = await fetch(`${STORE_API}/products/${id}`, {
        headers: HEADERS,
        next: { revalidate: CACHE_SECONDS },
      });
      if (res.ok) raw = await res.json();
    }

    // Fallback: search by slug
    if (!raw) {
      const res = await fetch(
        `${STORE_API}/products?slug=${encodeURIComponent(id)}&per_page=1`,
        { headers: HEADERS, next: { revalidate: CACHE_SECONDS } }
      );
      if (res.ok) {
        const arr: WCStoreProduct[] = await res.json();
        raw = arr[0] ?? null;
      }
    }

    if (!raw) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const [product, reviews] = await Promise.all([
      normalise(raw),
      fetchReviews(raw.id),
    ]);

    return NextResponse.json(
      { product, reviews },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[bedapper single]', msg);
    return NextResponse.json({ error: 'Failed to fetch product', detail: msg }, { status: 502 });
  }
}