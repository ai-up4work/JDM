// app/api/aiza-threads/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLaamBrands, BRANDS_DATA, type Brand } from '@/lib/aiza-threads/brands-data';

export interface LaamProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  rating: number | null;
  reviews: number | null;
  isNew: boolean;
  url: string;
  color: string;
  category: string;
}

// ── In-process product cache per brand slug ───────────────────────────────────
const productCache = new Map<string, { data: LaamProduct[]; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000;

async function fetchBrandProducts(slug: string, brandName: string): Promise<LaamProduct[]> {
  const cached = productCache.get(slug);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const res = await fetch(`https://laam.pk/brands/${slug}`, {
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

  const html = await res.text();
  const products = parseBrandProducts(html, brandName);

  if (products.length > 0) {
    productCache.set(slug, { data: products, expiry: Date.now() + CACHE_TTL });
  }

  return products;
}

function parseBrandProducts(html: string, brandName: string): LaamProduct[] {
  const products: LaamProduct[] = [];

  // Each product: <a href="/products/SLUG">...</a>
  const anchorRe = /<a\s+[^>]*href="(\/products\/([^"]+))"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;

  while ((m = anchorRe.exec(html)) !== null) {
    const url   = `https://laam.pk${m[1]}`;
    const slug  = m[2];
    const inner = m[3];

    // Image
    const imgMatch = inner.match(/<img[^>]+src="([^"]+)"/);
    if (!imgMatch) continue;
    const image = imgMatch[1];

    // Strip tags → plain text
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Detect "New" badge
    const isNew = /\bNew\b/i.test(text);

    // Extract prices — laam shows prices like "$ 19.99" or "$ 10.62 $ 25.99"
    const priceMatches = [...text.matchAll(/\$\s*([\d,]+(?:\.\d+)?)/g)];
    if (priceMatches.length === 0) continue;

    const prices = priceMatches.map(p => parseFloat(p[1].replace(',', '')));
    // If two prices: first is sale, second is original
    const price         = prices[0];
    const originalPrice = prices.length > 1 ? prices[1] : null;
    const discount      = originalPrice
      ? Math.round((1 - price / originalPrice) * 100)
      : null;

    // Rating: "4.0 (1)" or "4.5 (2)"
    const ratingMatch = text.match(/(\d+\.\d+)\s*\((\d+)\)/);
    const rating  = ratingMatch ? parseFloat(ratingMatch[1]) : null;
    const reviews = ratingMatch ? parseInt(ratingMatch[2], 10) : null;

    // Color hint from alt text: "Mint green Unstitched for Women"
    const altMatch = inner.match(/alt="([^"]+)"/);
    const altText  = altMatch?.[1] ?? '';
    const colorMatch = altText.match(/^([A-Za-z ,]+?)\s+(?:for\s+|Unstitched|Stitched|Kurti|Co Ord)/i);
    const color = colorMatch ? colorMatch[1].trim() : '';

    // Category from alt text
    const categoryMatch = altText.match(/\b(Kurti|Unstitched|Co Ord Sets?|Kurta Set|Dupatta|Shawl|Shirt|Dress)\b/i);
    const category = categoryMatch ? categoryMatch[1] : 'Clothing';

    // Product name: last meaningful chunk of text (after price/rating noise)
    // The name typically appears after the brand in the text
    const nameMatch = text.match(/(?:Express|New)?\s*\$[\d\s.,]+(?:\$[\d\s.,]+)?\s*([A-Za-z][^$\d(]{8,80?}?)(?:\s+Express|\s+\d+\.\d+|\s*$)/);
    const name = nameMatch
      ? nameMatch[1].trim()
      : altText.replace(/\s+for\s+(Women|Men|Kids)/i, '').trim();

    products.push({
      id:   slug,
      slug,
      name: name || altText,
      brand: brandName,
      price,
      originalPrice,
      discount,
      image,
      rating,
      reviews,
      isNew,
      url,
      color,
      category,
    });
  }

  return products;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Resolve brand metadata
  let brands: Brand[];
  try {
    brands = await getLaamBrands();
  } catch {
    brands = BRANDS_DATA;
  }

  const brand = brands.find(b => b.slug === slug);
  if (!brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  }

  // Fetch products
  let products: LaamProduct[] = [];
  try {
    products = await fetchBrandProducts(slug, brand.name);
  } catch (err) {
    console.warn(`[brands/${slug}] Product fetch failed:`, err);
  }

  return NextResponse.json({ brand, products });
}