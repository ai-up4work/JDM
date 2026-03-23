import { NextRequest, NextResponse } from 'next/server';
import type { ShopifyProduct, OMProduct, OMApiError } from '@/lib/oldmoney.types';

const OM_BASE       = 'https://old-money.com';
const CACHE_SECONDS = 60 * 10;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JDM-Store/1.0)',
  'Accept':     'application/json',
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s{2,}/g, ' ').trim();
}

function toCents(str: string | null): number {
  if (!str) return 0;
  return Math.round(parseFloat(str) * 100);
}

function detectGender(p: ShopifyProduct): 'men' | 'women' | 'unisex' {
  const h = [p.product_type, ...(Array.isArray(p.tags) ? p.tags : []), p.title].join(' ').toLowerCase();
  if (h.includes('women') || h.includes('lady')) return 'women';
  return 'men';
}

// Shopify Ajax API returns tags as a comma-separated string, not an array
function normaliseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === 'string' && tags.trim().length > 0) {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

function normalise(raw: ShopifyProduct): OMProduct {
  const v0          = raw.variants[0];
  const price       = toCents(v0?.price ?? '0');
  const compareAt   = toCents(v0?.compare_at_price ?? null);
  const originalPrice = compareAt > price ? compareAt : null;
  const sizeOpt  = raw.options.find(o => o.name.toLowerCase() === 'size');
  const colorOpt = raw.options.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');

  return {
    id: raw.id, title: raw.title, handle: raw.handle,
    permalink:    `${OM_BASE}/products/${raw.handle}`,
    description:  stripHtml(raw.body_html),
    vendor:       raw.vendor,
    productType:  raw.product_type,
    tags:         normaliseTags(raw.tags),   // ← fixed
    price, originalPrice,
    onSale:       !!originalPrice,
    inStock:      raw.available,
    image:        raw.images[0]?.src ?? '',
    images:       raw.images.map(i => i.src),
    sizes:        sizeOpt?.values ?? [],
    colors:       colorOpt?.values ?? [],
    options:      raw.options.map(o => ({ name: o.name, values: o.values })),
    variants:     raw.variants.map(v => ({
      id: v.id, title: v.title, price: toCents(v.price),
      available: v.available, options: [v.option1, v.option2, v.option3],
    })),
    gender:   detectGender(raw),
    category: raw.product_type ?? 'Clothing',
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
): Promise<NextResponse<{ product: OMProduct } | OMApiError>> {
  try {
    const { handle } = await params;

    const res = await fetch(`${OM_BASE}/products/${handle}.json`, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const data = await res.json();
    const product = normalise(data.product as ShopifyProduct);

    return NextResponse.json(
      { product },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30` } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[oldmoney single]', msg);
    return NextResponse.json({ error: 'Failed to fetch product', detail: msg }, { status: 502 });
  }
}