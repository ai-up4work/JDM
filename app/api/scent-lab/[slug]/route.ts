import { NextRequest, NextResponse } from 'next/server';

const API_BASE   = 'https://ozscent.vercel.app/api';
const CACHE_SECS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const res = await fetch(`${API_BASE}/perfumes/${encodeURIComponent(slug)}`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECS },
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
    }
    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const data = await res.json();

    return NextResponse.json(data, {
      headers: { 'Cache-Control': `s-maxage=${CACHE_SECS}, stale-while-revalidate=30` },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[scent-lab slug]', msg);
    return NextResponse.json({ error: 'Failed to fetch perfume', detail: msg }, { status: 502 });
  }
}