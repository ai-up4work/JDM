// app/api/scent-lab/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { SLRawPerfume, SLApiListResponse, SLApiError } from '@/lib/scent-lab.types';
import { normalise } from '@/lib/scent-lab.normalise';

const API_BASE   = 'https://ozscent.vercel.app/api/partner';
const CACHE_SECS = 60 * 10; // 10 min

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
  'x-api-key':  'OZ_SECRET_895_SAFNAS',
};

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export async function GET(
  req: NextRequest
): Promise<NextResponse<SLApiListResponse | SLApiError>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? '';   // 'Men' | 'Women' | 'Unisex' | ''
    const search   = searchParams.get('search')   ?? '';
    const sortBy   = (searchParams.get('sort') ?? 'featured') as SortKey;

    // Fetch all from upstream (partner API has no server-side filtering)
    const res = await fetch(`${API_BASE}/perfumes`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECS },
    });

    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const result = await res.json();
    const raw: SLRawPerfume[] = result.data ?? [];

    let perfumes = raw.map(normalise);

    // ── Filter ────────────────────────────────────────────────────────────────
    if (category) {
      perfumes = perfumes.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      perfumes = perfumes.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.notes.top.some(n => n.toLowerCase().includes(q)) ||
        p.notes.heart.some(n => n.toLowerCase().includes(q)) ||
        p.notes.base.some(n => n.toLowerCase().includes(q))
      );
    }

    // ── Sort ──────────────────────────────────────────────────────────────────
    if (sortBy === 'featured')   perfumes.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    if (sortBy === 'price-asc')  perfumes.sort((a, b) => Math.min(...a.sizes.map(s => s.price)) - Math.min(...b.sizes.map(s => s.price)));
    if (sortBy === 'price-desc') perfumes.sort((a, b) => Math.min(...b.sizes.map(s => s.price)) - Math.min(...a.sizes.map(s => s.price)));
    if (sortBy === 'name-asc')   perfumes.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      { perfumes, total: perfumes.length, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[scent-lab API list]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch from ozscent.vercel.app', detail: msg },
      { status: 502 }
    );
  }
}