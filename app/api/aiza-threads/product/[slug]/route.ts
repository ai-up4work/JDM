// app/api/aiza-threads/product/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export interface LaamProductDetail {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  images: string[];
  rating: number | null;
  reviews: number | null;
  reviewList: { author: string; rating: number; comment: string; date: string }[];
  isNew: boolean;
  url: string;
  colors: string[];
  sizes: string[];
  category: string;
  description: string;
  fabric: string | null;
  sku: string | null;
  tags: string[];
  inStock: boolean;
}

// ── Per-product in-process cache ──────────────────────────────────────────────
const productCache = new Map<string, { data: LaamProductDetail; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchProductDetail(slug: string): Promise<LaamProductDetail> {
  const cached = productCache.get(slug);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const url = `https://laam.pk/products/${slug}`;
  const res = await fetch(url, {
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
  const detail = parseProductDetail(html, slug, url);

  if (detail) {
    productCache.set(slug, { data: detail, expiry: Date.now() + CACHE_TTL });
  }

  return detail;
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  // Laam injects JSON-LD structured data for products
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type'] === 'Product') return data;
    } catch {
      // not valid JSON, skip
    }
  }
  return null;
}

function extractShopifyProductJson(html: string): Record<string, unknown> | null {
  // Shopify often embeds window.ShopifyAnalytics or product JSON in a script tag
  const patterns = [
    /var\s+meta\s*=\s*({[\s\S]*?product[\s\S]*?});/,
    /window\.productData\s*=\s*({[\s\S]*?});/,
    /"product"\s*:\s*({[\s\S]*?"title"[\s\S]*?})\s*[,}]/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      try { return JSON.parse(m[1]); } catch { /* skip */ }
    }
  }
  return null;
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseProductDetail(html: string, slug: string, url: string): LaamProductDetail {
  // ── 1. Try JSON-LD first (most reliable) ─────────────────────────────────
  const ld = extractJsonLd(html);

  let name        = '';
  let brand       = '';
  let brandSlug   = '';
  let price       = 0;
  let originalPrice: number | null = null;
  let discount: number | null = null;
  let images: string[] = [];
  let rating: number | null = null;
  let reviews: number | null = null;
  let description = '';
  let sku: string | null = null;
  let inStock     = true;
  let fabric: string | null = null;
  let category    = 'Clothing';

  if (ld) {
    name        = String(ld['name'] ?? '');
    description = stripTags(String(ld['description'] ?? ''));
    sku         = String(ld['sku'] ?? '') || null;

    // Brand
    const ldBrand = ld['brand'] as Record<string, unknown> | undefined;
    brand = String(ldBrand?.['name'] ?? '');

    // Images
    const ldImg = ld['image'];
    if (Array.isArray(ldImg)) images = ldImg.map(String);
    else if (typeof ldImg === 'string') images = [ldImg];

    // Offers
    const offers = ld['offers'] as Record<string, unknown> | undefined;
    if (offers) {
      price     = parseFloat(String(offers['price'] ?? '0')) || 0;
      inStock   = String(offers['availability'] ?? '').toLowerCase().includes('instock');
      const currency = String(offers['priceCurrency'] ?? 'USD');
      // If price looks like a raw integer (e.g. 15000 for PKR), try to detect
      // Laam seems to use PKR internally, converted to USD on display
      // We leave it as-is and let the frontend format it.
      void currency;
    }

    // Aggregate rating
    const aggRating = ld['aggregateRating'] as Record<string, unknown> | undefined;
    if (aggRating) {
      rating  = parseFloat(String(aggRating['ratingValue'] ?? '')) || null;
      reviews = parseInt(String(aggRating['reviewCount'] ?? ''), 10) || null;
    }

    // Reviews
    const ldReviews = ld['review'] as unknown[];
    const reviewList = Array.isArray(ldReviews)
      ? ldReviews.slice(0, 10).map((r) => {
          const rv = r as Record<string, unknown>;
          return {
            author: String((rv['author'] as Record<string, unknown>)?.['name'] ?? 'Customer'),
            rating: parseFloat(String((rv['reviewRating'] as Record<string, unknown>)?.['ratingValue'] ?? '5')),
            comment: stripTags(String(rv['reviewBody'] ?? '')),
            date:   String(rv['datePublished'] ?? ''),
          };
        })
      : [];

    // Category
    const ldCategory = ld['category'];
    if (typeof ldCategory === 'string' && ldCategory) category = ldCategory.split('>').pop()?.trim() ?? category;

    // ── 2. Augment with HTML scraping for colors, sizes, extra images ─────
    // Gallery images
    const galleryRe = /<img[^>]+class="[^"]*(?:product[_-]image|gallery|zoom)[^"]*"[^>]+src="([^"]+)"/gi;
    let gm: RegExpExecArray | null;
    while ((gm = galleryRe.exec(html)) !== null) {
      if (!images.includes(gm[1])) images.push(gm[1]);
    }

    // Also grab srcset / data-src
    const srcsetRe = /data-src="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
    let sm: RegExpExecArray | null;
    while ((sm = srcsetRe.exec(html)) !== null) {
      const src = sm[1].split('?')[0];
      if (src.includes('cdn') && !images.includes(src)) images.push(src);
    }

    // Deduplicate & filter thumbnails
    images = [...new Set(images)].filter(i => !i.includes('_thumb') && !i.includes('_small'));

    // Brand slug from breadcrumbs / links
    const brandSlugRe = /href="\/brands\/([^"/?]+)"/i;
    const bsm = html.match(brandSlugRe);
    brandSlug = bsm?.[1] ?? brand.toLowerCase().replace(/\s+/g, '-');

    // Colors — Shopify variant buttons / swatches
    const colorRe = /data-value="([^"]+)"\s+data-option="[Cc]olor"/g;
    const colors: string[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = colorRe.exec(html)) !== null) colors.push(cm[1]);

    // Also try option labels
    const optionColorRe = /<option[^>]*value="([^"]+)"[^>]*>\s*([A-Za-z ]+)\s*<\/option>/g;
    let ocm: RegExpExecArray | null;
    while ((ocm = optionColorRe.exec(html)) !== null) {
      if (!colors.includes(ocm[2].trim())) colors.push(ocm[2].trim());
    }

    // Sizes
    const sizeRe = /data-value="([^"]+)"\s+data-option="[Ss]ize"/g;
    const sizes: string[] = [];
    let szm: RegExpExecArray | null;
    while ((szm = sizeRe.exec(html)) !== null) sizes.push(szm[1]);

    // Fabric from meta or description
    const fabricMatch = html.match(/[Ff]abric\s*[:\-]?\s*<\/?\w*>?\s*([A-Za-z ]+)/);
    fabric = fabricMatch?.[1]?.trim() ?? null;

    // Tags from meta keywords
    const metaKeywordsMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
    const tags = metaKeywordsMatch
      ? metaKeywordsMatch[1].split(',').map(t => t.trim()).filter(Boolean)
      : [];

    // Original price (sale price detection)
    const comparePriceRe = /compare.at.price["\s:]+([0-9]+(?:\.[0-9]+)?)/i;
    const cpm = html.match(comparePriceRe);
    if (cpm) {
      const rawCompare = parseFloat(cpm[1]);
      // Shopify stores prices in cents
      const compareDisplay = rawCompare > 1000 ? rawCompare / 100 : rawCompare;
      if (compareDisplay > price) {
        originalPrice = compareDisplay;
        discount = Math.round((1 - price / originalPrice) * 100);
      }
    }

    return {
      id: slug, slug, name, brand, brandSlug,
      price, originalPrice, discount, images,
      rating, reviews, reviewList,
      isNew: html.includes('"badge":"new"') || html.toLowerCase().includes('badge-new'),
      url, colors, sizes, category, description,
      fabric, sku, tags, inStock,
    };
  }

  // ── 3. Fallback: pure HTML scraping if no JSON-LD ────────────────────────
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  name = titleMatch ? stripTags(titleMatch[1]).replace(/\s*[\-|]\s*.*$/, '').trim() : slug;

  const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  description = metaDesc?.[1] ?? '';

  const imgMatches = [...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)];
  images = [...new Set(imgMatches.map(m => m[1]))].filter(i => !i.includes('logo') && !i.includes('icon')).slice(0, 10);

  const priceRe = /\$\s*([\d,]+(?:\.\d+)?)/g;
  const priceMatches = [...html.matchAll(priceRe)];
  const prices = priceMatches.map(p => parseFloat(p[1].replace(',', '')));
  price = prices[0] ?? 0;
  if (prices.length > 1 && prices[1] > price) {
    originalPrice = prices[1];
    discount = Math.round((1 - price / originalPrice) * 100);
  }

  const brandSlugRe2 = /href="\/brands\/([^"/?]+)"/i;
  const bsm2 = html.match(brandSlugRe2);
  brandSlug = bsm2?.[1] ?? '';

  return {
    id: slug, slug, name, brand, brandSlug,
    price, originalPrice, discount, images,
    rating: null, reviews: null, reviewList: [],
    isNew: false, url, colors: [], sizes: [],
    category, description, fabric: null, sku: null, tags: [], inStock: true,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await fetchProductDetail(slug);
    return NextResponse.json({ product });
  } catch (err) {
    console.error(`[product/${slug}] Fetch failed:`, err);
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}