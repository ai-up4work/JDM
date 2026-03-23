// lib/otaku.normalise.ts
import type { OTKWCProduct, OTKProduct } from '@/lib/otaku.types';

// ─── Franchise (series) category slugs → display labels ──────────────────────
const FRANCHISE_MAP: Record<string, string> = {
  'attack-on-titan':    'Attack on Titan',
  'demon-slayer':       'Demon Slayer',
  'naruto':             'Naruto',
  'one-piece':          'One Piece',
  'jujutsu-kaisen':     'Jujutsu Kaisen',
  'dragon-ball':        'Dragon Ball',
  'my-hero-academia':   'My Hero Academia',
  'bleach':             'Bleach',
  'death-note':         'Death Note',
  'chainsaw-man':       'Chainsaw Man',
  'tokyo-revengers':    'Tokyo Revengers',
  'spy-x-family':       'Spy × Family',
  'vinland-saga':       'Vinland Saga',
  'hunter-x-hunter':    'Hunter × Hunter',
  'fullmetal-alchemist':'Fullmetal Alchemist',
  'solo-leveling':      'Solo Leveling',
  'haikyuu':            'Haikyuu!!',
  'black-clover':       'Black Clover',
  'fairy-tail':         'Fairy Tail',
  'sword-art-online':   'Sword Art Online',
};

// ─── Product-type slugs → display labels ─────────────────────────────────────
const TYPE_MAP: Record<string, string> = {
  'hoodies':        'Hoodie',
  'hoodie':         'Hoodie',
  't-shirts':       'T-Shirt',
  't-shirt':        'T-Shirt',
  'tshirts':        'T-Shirt',
  'oversized':      'Oversized Tee',
  'oversized-tees': 'Oversized Tee',
  'zip-hoodies':    'Zip Hoodie',
  'zip-hoodie':     'Zip Hoodie',
  'shorts':         'Shorts',
  'accessories':    'Accessories',
  'collectibles':   'Collectibles',
  'caps':           'Caps',
  'bags':           'Bags',
};

// Category slugs that are neither franchise nor type (skip for display)
const SKIP = new Set(['uncategorized', 'sale', 'new-arrivals', 'featured', 'clothing', 'anime']);

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s{2,}/g, ' ').trim();
}

function toInt(priceStr: string, minorUnit: number): number {
  const val = parseFloat(priceStr);
  if (isNaN(val)) return 0;
  return Math.round(val * Math.pow(10, minorUnit));
}

export function normalise(raw: OTKWCProduct): OTKProduct {
  const { prices } = raw;
  const mu            = prices.currency_minor_unit ?? 2;
  const price         = toInt(prices.price, mu);
  const regular       = toInt(prices.regular_price, mu);
  const originalPrice = raw.on_sale && regular > price ? regular : null;

  // Separate franchise vs type categories
  const cats = raw.categories.filter(c => !SKIP.has(c.slug));

  const franchiseCat = cats.find(c => FRANCHISE_MAP[c.slug]);
  const typeCat      = cats.find(c => TYPE_MAP[c.slug]);
  // fallback: first non-skipped category
  const fallbackCat  = cats[0] ?? { slug: 'anime', name: 'Anime' };

  const franchise      = franchiseCat?.slug  ?? 'anime';
  const franchiseLabel = franchiseCat ? FRANCHISE_MAP[franchiseCat.slug] : (fallbackCat.name ?? 'Anime');

  const productType      = typeCat?.slug ?? 'clothing';
  const productTypeLabel = typeCat ? (TYPE_MAP[typeCat.slug] ?? typeCat.name) : 'Clothing';

  const sizeAttr  = raw.attributes.find(a => a.name.toLowerCase().includes('size'));
  const colorAttr = raw.attributes.find(a =>
    a.name.toLowerCase().includes('color') || a.name.toLowerCase().includes('colour')
  );

  return {
    id:               raw.id,
    name:             raw.name,
    slug:             raw.slug,
    permalink:        raw.permalink,
    description:      stripHtml(raw.description),
    shortDescription: stripHtml(raw.short_description),
    price,
    originalPrice,
    onSale:           raw.on_sale,
    inStock:          raw.is_in_stock,
    image:            raw.images[0]?.src ?? '',
    images:           raw.images.map(i => i.src),
    franchise,
    franchiseLabel,
    productType,
    productTypeLabel,
    sizes:            sizeAttr?.terms.map(t => t.name) ?? [],
    colors:           colorAttr?.terms.map(t => t.name) ?? [],
    rating:           parseFloat(raw.average_rating) || 0,
    reviewCount:      raw.review_count,
    hasVariants:      raw.has_options,
  };
}