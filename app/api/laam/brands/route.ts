// app/api/laam/brands/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { filterBrands, parseLaamBrands, BRANDS_DATA, getLaamBrands, isNewBrand, type Brand } from '@/lib/laam/brands-data';


const LAAM_BRANDS_URL = 'https://laam.pk/brands';

let cachedBrands: Brand[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchLaamBrands(): Promise<Brand[]> {
  if (cachedBrands && Date.now() < cacheExpiry) {
    return cachedBrands;
  }

  const res = await fetch(LAAM_BRANDS_URL, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/124.0.0.0 Safari/537.36',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`laam.pk responded with ${res.status}`);

  const html   = await res.text();
  const brands = parseLaamBrands(html);

  if (brands.length > 0) {
    cachedBrands = brands;
    cacheExpiry  = Date.now() + CACHE_TTL_MS;
  }

  return brands;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filter   = searchParams.get('filter')   ?? 'all';
  const search   = searchParams.get('search')   ?? '';
  const letter   = searchParams.get('letter')   ?? '';
  const featured = searchParams.get('featured') === 'true';

  let brands: Brand[];
  try {
    brands = await getLaamBrands();
  } catch (err) {
    console.warn('[brands] Live fetch failed, falling back to local data:', err);
    brands = BRANDS_DATA;
  }

  const newBrands = brands.filter(isNewBrand);
  const filtered  = filterBrands({ brands, filter, search, letter, featured });

  return NextResponse.json({
    total:     filtered.length,
    brands:    filtered,
    newBrands,
  });
}
