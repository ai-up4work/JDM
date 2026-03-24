// app/api/scent-lab/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { SLRawPerfume, SLSingleResponse, SLApiError } from '@/lib/scent-lab.types';
import { normalise } from '@/lib/scent-lab.normalise';

const API_BASE   = 'https://ozscent.vercel.app/api/partner';
const CACHE_SECS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
  'x-api-key':  'OZ_SECRET_895_SAFNAS',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<SLSingleResponse | SLApiError>> {
  try {
    const { slug } = await params;

    // Fetch all then find by slug (partner API has no single-by-slug endpoint)
    const res = await fetch(`${API_BASE}/perfumes`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECS },
    });

    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const result = await res.json();
    const raw: SLRawPerfume[] = result.data ?? [];

    const match = raw.find(p => p.slug === slug);
    if (!match) {
      return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
    }

    return NextResponse.json(
      { data: normalise(match) },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[scent-lab single]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch perfume', detail: msg },
      { status: 502 }
    );
  }
}