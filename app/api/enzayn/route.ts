// app/api/enzayn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { ENZWCProduct, ENZApiResponse, ENZApiError } from '@/lib/enzayn.types';
import { normalise } from '@/lib/enzayn.normalise';

const ENZ_BASE      = 'https://enzaynceylon.com';
const STORE_API     = `${ENZ_BASE}/wp-json/wc/store/v1`;
const CACHE_SECONDS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<ENZApiResponse | ENZApiError>> {
  try {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, parseInt(searchParams.get('page')      ?? '1',  10));
    const perPage  = Math.min(48, parseInt(searchParams.get('per_page') ?? '24', 10));
    const category = searchParams.get('category') ?? undefined;
    const search   = searchParams.get('search')   ?? undefined;

    const params = new URLSearchParams({
      page:     String(page),
      per_page: String(perPage),
      orderby:  'date',
      order:    'desc',
      status:   'publish',
    });
    if (category) params.set('category', category);
    if (search)   params.set('search', search);

    const res = await fetch(`${STORE_API}/products?${params}`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) throw new Error(`enzaynceylon.com returned ${res.status}`);

    const total      = parseInt(res.headers.get('X-WP-Total')      ?? '0', 10);
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
    const raw: ENZWCProduct[] = await res.json();

    return NextResponse.json(
      { products: raw.map(normalise), total, totalPages, page, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[enzayn API]', msg);
    return NextResponse.json({ error: 'Failed to fetch from enzaynceylon.com', detail: msg }, { status: 502 });
  }
}