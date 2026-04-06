// lib/aiza-threads/brands-data.ts

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  itemCount: number;
  featured: boolean;
  gender: 'all' | 'women' | 'men' | 'kids';
  letter: string;
  categories: string[];
  origin: string;
}

export function parseLaamBrands(html: string): Brand[] {
  const brands: Brand[] = [];
  const anchorRe = /<a\s+href="\/brands\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let anchorMatch: RegExpExecArray | null;

  while ((anchorMatch = anchorRe.exec(html)) !== null) {
    const slug  = anchorMatch[1];
    const inner = anchorMatch[2];

    const imgMatch = inner.match(/<img\s+[^>]*src="([^"]+)"/);
    const logo     = imgMatch?.[1] ?? '';

    const text       = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const itemsMatch = text.match(/^(.*?)\s+(\d+)\s+items?$/i);
    if (!itemsMatch) continue;

    const name      = itemsMatch[1].trim();
    const itemCount = parseInt(itemsMatch[2], 10);
    const letter    = name[0]?.toUpperCase() ?? '#';

    brands.push({
      id:         slug,
      name,
      slug,
      logo,
      itemCount,
      featured:   false,
      gender:     'all',
      letter,
      categories: ['women'],
      origin:     'Pakistan',
    });
  }

  return brands;
}

export const BRANDS_DATA: Brand[] = [];

export function filterBrands({
  brands = BRANDS_DATA,
  filter,
  search,
  letter,
  featured,
}: {
  brands?: Brand[];
  filter: string;
  search: string;
  letter: string;
  featured: boolean;
}): Brand[] {
  return brands.filter((b) => {
    if (featured && !b.featured) return false;
    if (filter !== 'all' && b.gender !== filter) return false;
    if (letter && b.letter !== letter.toUpperCase()) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

// ── Shared fetch + in-process cache ──────────────────────────────────────────

let cachedBrands: Brand[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function getLaamBrands(): Promise<Brand[]> {
  if (cachedBrands && Date.now() < cacheExpiry) return cachedBrands;

  const res = await fetch('https://laam.pk/brands', {
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

  const brands = parseLaamBrands(await res.text());

  if (brands.length > 0) {
    cachedBrands = brands;
    cacheExpiry  = Date.now() + CACHE_TTL_MS;
  }

  return brands;
}

/**
 * "New" brands heuristic:
 * laam.pk stores new brand logos on Google Cloud Storage (production_brand_logos)
 * whereas established brands use the Shopify CDN.
 */
export function isNewBrand(brand: Brand): boolean {
  return brand.logo.includes('storage.googleapis.com/production_brand_logos');
}