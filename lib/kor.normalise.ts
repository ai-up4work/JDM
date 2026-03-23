// lib/kor.normalise.ts
import type { KORWCProduct, KORProduct } from '@/lib/kor.types';

const CATEGORY_MAP: Record<string, string> = {
  'chains':    'Chains',
  'bracelets': 'Bracelets',
  'rings':     'Rings',
  'bridal':    'Bridal',
  'bangles':   'Bangles',
  'earrings':  'Earrings',
  'pendants':  'Pendants',
  'necklaces': 'Necklaces',
};

const SKIP = new Set(['uncategorized', 'sale', 'featured']);

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

export function normalise(raw: KORWCProduct): KORProduct {
  const { prices } = raw;
  const mu          = prices.currency_minor_unit;
  const price       = toInt(prices.price, mu);
  const regular     = toInt(prices.regular_price, mu);
  const originalPrice = raw.on_sale && regular > price ? regular : null;

  const specificCat = raw.categories.find(c => !SKIP.has(c.slug))
    ?? raw.categories[0]
    ?? { slug: 'jewellery', name: 'Jewellery' };

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
    category:         specificCat.slug,
    categoryLabel:    CATEGORY_MAP[specificCat.slug] ?? specificCat.name,
    sizes:            sizeAttr?.terms.map(t => t.name) ?? [],
    colors:           colorAttr?.terms.map(t => t.name) ?? [],
    rating:           parseFloat(raw.average_rating) || 0,
    reviewCount:      raw.review_count,
    hasVariants:      raw.has_options,
  };
}