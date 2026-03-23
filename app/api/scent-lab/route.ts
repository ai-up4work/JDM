import { NextRequest, NextResponse } from 'next/server';

const API_BASE    = 'https://ozscent.vercel.app/api';
const CACHE_SECS  = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category'); // Men | Women | Unisex
    const featured = searchParams.get('featured');  // ?featured=1

    let endpoint = `${API_BASE}/perfumes`;
    if (featured === '1') endpoint = `${API_BASE}/perfumes/featured`;
    else if (category)    endpoint = `${API_BASE}/perfumes/category/${encodeURIComponent(category)}`;

    const res = await fetch(endpoint, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECS },
    });

    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const data = await res.json();

    return NextResponse.json(data, {
      headers: { 'Cache-Control': `s-maxage=${CACHE_SECS}, stale-while-revalidate=30` },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[scent-lab list]', msg);
    return NextResponse.json({ error: 'Failed to fetch perfumes', detail: msg }, { status: 502 });
  }
}