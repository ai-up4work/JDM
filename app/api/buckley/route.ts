// app/api/buckley/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { BKLWCProduct, BKLApiResponse, BKLApiError } from '@/lib/buckly.types';
import { normalise } from '@/lib/buckly.normalise';

const BKL_BASE      = 'https://theparfumerie.lk';
const STORE_API     = `${BKL_BASE}/wp-json/wc/store/v1`;
const CACHE_SECONDS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<BKLApiResponse | BKLApiError>> {
  try {
    const { searchParams } = new URL(req.url);
    const page    = Math.max(1, parseInt(searchParams.get('page')      ?? '1',  10));
    const perPage = Math.min(48, parseInt(searchParams.get('per_page') ?? '24', 10));
    const type    = searchParams.get('type')   ?? '';
    const search  = searchParams.get('search') ?? '';

    // Fetch all Buckley London products in one go (small catalogue, ≤48).
    // The WC Store API only accepts a single category slug at a time, so we
    // scope to the brand and post-filter by jewellery type here in the proxy.
    const params = new URLSearchParams({
      page:     '1',
      per_page: '48',
      orderby:  'date',
      order:    'desc',
      status:   'publish',
      category: 'buckley-london',
    });
    if (search) params.set('search', search);

    const res = await fetch(`${STORE_API}/products?${params}`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) throw new Error(`theparfumerie.lk returned ${res.status}`);

    const raw: BKLWCProduct[] = await res.json();
    let products = raw.map(normalise);

    // Post-filter by jewellery type if requested
    if (type) {
      products = products.filter(p => p.jewelleryType === type);
    }

    // Manual pagination after filtering
    const total      = products.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start      = (page - 1) * perPage;
    const paged      = products.slice(start, start + perPage);

    return NextResponse.json(
      { products: paged, total, totalPages, page, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[buckley API]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch from theparfumerie.lk', detail: msg },
      { status: 502 }
    );
  }
}