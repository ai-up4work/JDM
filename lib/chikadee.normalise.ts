// lib/chickadee.normalise.ts
import type { CKWCProduct, CKProduct } from '@/lib/chikadee.types';

const CATEGORY_MAP: Record<string, string> = {
  'earrings':          'Earrings',
  'party-earrings':    'Party Earrings',
  'office-earrings':   'Office Earrings',
  'minimalist-hoop':   'Minimalist Hoops',
  'ear-stud':          'Ear Studs',
  'ear-cuff-earrings': 'Ear Cuffs',
  'necklaces':         'Necklaces',
  'pendant-necklace':  'Pendant Necklaces',
  'layered-chain':     'Layered Chains',
  'chain-necklace':    'Chain Necklaces',
  'rings':             'Rings',
  'bracelets':         'Bracelets',
  'bangle-bracelet':   'Bangles',
  'couple-bestie':     'Couple & Bestie',
  'anklets':           'Anklets',
  'nose-ring':         'Nose Rings',
  'mens-jewellery':    'Men\'s Jewellery',
  'jewelry-set':       'Jewellery Sets',
  'jewellery-gift-box':'Gift Boxes',
  'perfumes':          'Perfumes',
  'women-bags':        'Women Bags',
  'all-products':      'All',
  '925-sterling-silver': '925 Sterling Silver',
  'sale':              'Sale',
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s{2,}/g, ' ').trim();
}

function toInt(priceStr: string, minorUnit: number): number {
  return Math.round(parseFloat(priceStr) / Math.pow(10, minorUnit));
}

// Top-level parent categories to skip when finding the specific category
const SKIP_SLUGS = new Set(['uncategorized', 'all-products', 'for-her', 'for-him', 'unisex']);

export function normalise(raw: CKWCProduct): CKProduct {
  const { prices } = raw;
  const mu          = prices.currency_minor_unit;
  const price       = toInt(prices.price, mu);
  const regular     = toInt(prices.regular_price, mu);
  const originalPrice = raw.on_sale && regular > price ? regular : null;

  // Find most specific category
  const specificCat = raw.categories.find(c => !SKIP_SLUGS.has(c.slug))
    ?? raw.categories[0]
    ?? { slug: 'jewellery', name: 'Jewellery' };

  const sizeAttr     = raw.attributes.find(a => a.name.toLowerCase().includes('size'));
  const colorAttr    = raw.attributes.find(a =>
    a.name.toLowerCase().includes('color') || a.name.toLowerCase().includes('colour')
  );
  const materialAttr = raw.attributes.find(a => a.name.toLowerCase().includes('material'));

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
    category:         specificCat.slug,
    categoryLabel:    CATEGORY_MAP[specificCat.slug] ?? specificCat.name,
    sizes:            sizeAttr?.terms.map(t => t.name) ?? [],
    colors:           colorAttr?.terms.map(t => t.name) ?? [],
    materials:        materialAttr?.terms.map(t => t.name) ?? [],
    rating:           parseFloat(raw.average_rating) || 0,
    reviewCount:      raw.review_count,
    hasVariants:      raw.has_options,
  };
}