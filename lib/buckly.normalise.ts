// lib/buckley.normalise.ts
import type { BKLWCProduct, BKLProduct } from '@/lib/buckly.types'

const TYPE_MAP: Record<string, string> = {
  'earrings':   'Earrings',
  'necklaces':  'Necklaces',
  'bracelets':  'Bracelets',
  'rings':      'Rings',
  'bangles':    'Bangles',
  'cufflinks':  'Cufflinks',
  'sets':       'Sets',
  'giftware':   'Giftware',
  'watches':    'Watches',
  'pendants':   'Pendants',
  'brooches':   'Brooches',
};

const SKIP = new Set([
  'uncategorized', 'sale', 'new-arrivals', 'featured',
  'jewelry', 'jewellery', 'buckley-london', 'buckley london',
]);

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
  // The Parfumerie uses LKR with 2 minor units → divide by 100 to get rupees
  return Math.round(val / Math.pow(10, minorUnit));
}

/** Infer material from product name */
function parseMaterial(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('rose gold') || n.includes('rose & rhd')) return 'Rose Gold';
  if (n.includes('two-tone') || n.includes('two tone'))   return 'Two-Tone';
  if (n.includes('gold'))    return 'Gold';
  if (n.includes('silver'))  return 'Silver';
  if (n.includes('crystal')) return 'Crystal';
  if (n.includes('sapphire'))return 'Sapphire';
  if (n.includes('pave') || n.includes('pavé')) return 'Pavé';
  return '';
}

export function normalise(raw: BKLWCProduct): BKLProduct {
  const { prices } = raw;
  const mu            = prices.currency_minor_unit ?? 2;
  const price         = toInt(prices.price, mu);
  const regular       = toInt(prices.regular_price, mu);
  const originalPrice = raw.on_sale && regular > price ? regular : null;

  const cats    = raw.categories.filter(c => !SKIP.has(c.slug.toLowerCase()) && !SKIP.has(c.name.toLowerCase()));
  const typeCat = cats.find(c => TYPE_MAP[c.slug.toLowerCase()]) ?? cats[0];

  const jewelleryType      = typeCat?.slug.toLowerCase() ?? 'jewelry';
  const jewelleryTypeLabel = typeCat ? (TYPE_MAP[jewelleryType] ?? typeCat.name) : 'Jewellery';

  const sizeAttr = raw.attributes.find(a => a.name.toLowerCase().includes('size'));

  return {
    id:                raw.id,
    name:              raw.name,
    slug:              raw.slug,
    permalink:         raw.permalink,
    description:       stripHtml(raw.description),
    shortDescription:  stripHtml(raw.short_description),
    price,
    originalPrice,
    onSale:            raw.on_sale,
    inStock:           raw.is_in_stock,
    image:             raw.images[0]?.src ?? '',
    images:            raw.images.map(i => i.src),
    jewelleryType,
    jewelleryTypeLabel,
    material:          parseMaterial(raw.name),
    sizes:             sizeAttr?.terms.map(t => t.name) ?? [],
    rating:            parseFloat(raw.average_rating) || 0,
    reviewCount:       raw.review_count,
    hasVariants:       raw.has_options,
  };
}