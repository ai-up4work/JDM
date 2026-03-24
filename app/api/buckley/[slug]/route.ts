// app/api/buckley/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { BKLWCProduct, BKLProduct, BKLApiError } from '@/lib/buckly.types';
import { normalise } from '@/lib/buckly.normalise';

const BKL_BASE      = 'https://theparfumerie.lk';
const STORE_API     = `${BKL_BASE}/wp-json/wc/store/v1`;
const CACHE_SECONDS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

interface WCReview {
  id: number;
  date_created: string;
  review: string;
  rating: number;
  reviewer: string;
}

async function fetchReviews(productId: number): Promise<WCReview[]> {
  try {
    const res = await fetch(
      `${BKL_BASE}/wp-json/wc/v3/products/${productId}/reviews?per_page=5`,
      { headers: HEADERS, next: { revalidate: CACHE_SECONDS } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<{ product: BKLProduct; reviews: WCReview[] } | BKLApiError>> {
  try {
    const { slug } = await params;
    const isNumeric = /^\d+$/.test(slug);
    let raw: BKLWCProduct | null = null;

    if (isNumeric) {
      const res = await fetch(`${STORE_API}/products/${slug}`, {
        headers: HEADERS, next: { revalidate: CACHE_SECONDS },
      });
      if (res.ok) raw = await res.json();
    }

    if (!raw) {
      const res = await fetch(
        `${STORE_API}/products?slug=${encodeURIComponent(slug)}&per_page=1`,
        { headers: HEADERS, next: { revalidate: CACHE_SECONDS } }
      );
      if (res.ok) {
        const arr: BKLWCProduct[] = await res.json();
        raw = arr[0] ?? null;
      }
    }

    if (!raw) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const [product, reviews] = await Promise.all([normalise(raw), fetchReviews(raw.id)]);

    // Always point external link to Buckley London's own website
    product.permalink = `https://www.buckleylondon.com/products/${raw.slug}`;

    return NextResponse.json(
      { product, reviews },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[buckley single]', msg);
    return NextResponse.json({ error: 'Failed to fetch product', detail: msg }, { status: 502 });
  }
}