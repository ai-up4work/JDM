// lib/cherie.normalise.ts

import type { CherieShopifyProduct, CherieProduct, CherieVariant } from './cherie.types';

const BASE = 'https://cherielueur.com';

/** Convert Shopify price string "4500.00" → LKR cents (integer) */
function toCents(price: string | null | undefined): number {
  if (!price) return 0;
  return Math.round(parseFloat(price) * 100);
}

/** Strip HTML tags and decode basic entities from body_html */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Build a short description from first ~200 chars of stripped HTML */
function shortDesc(text: string, max = 200): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max);
  return text.slice(0, cut > 80 ? cut : max) + '…';
}

/** Derive a human-readable collection label from the product type / tags */
function collectionLabel(raw: CherieShopifyProduct): string {
  if (raw.product_type) return raw.product_type;
  const tagOrder = ['rings', 'earrings', 'necklaces', 'bracelets', 'bangles', 'anklets', 'pendant'];
  for (const t of tagOrder) {
    if (raw.tags.some(tag => tag.toLowerCase().includes(t))) return t.charAt(0).toUpperCase() + t.slice(1);
  }
  return 'Jewellery';
}

export function normalise(raw: CherieShopifyProduct): CherieProduct {
  // Image map: id → src
  const imageMap: Record<number, string> = {};
  for (const img of raw.images) {
    imageMap[img.id] = img.src;
  }

  const allImages = raw.images
    .sort((a, b) => a.position - b.position)
    .map(img => img.src);

  const primaryImage = allImages[0] ?? '';

  // Normalise variants
  const variants: CherieVariant[] = raw.variants.map(v => ({
    id: v.id,
    title: v.title,
    price: toCents(v.price),
    compareAtPrice: v.compare_at_price ? toCents(v.compare_at_price) : null,
    available: v.available,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    sku: v.sku,
    imageId: v.image_id,
  }));

  // Cheapest available variant price for display
  const availableVariants = variants.filter(v => v.available);
  const priceVariants = availableVariants.length ? availableVariants : variants;
  const price = Math.min(...priceVariants.map(v => v.price));

  // Compare-at price: highest compare_at among variants that are on sale
  const saleVariants = priceVariants.filter(v => v.compareAtPrice && v.compareAtPrice > v.price);
  const compareAtPrice = saleVariants.length
    ? Math.max(...saleVariants.map(v => v.compareAtPrice!))
    : null;

  const onSale = !!compareAtPrice;
  const inStock = variants.some(v => v.available);

  // Options
  const optionNames = raw.options.map(o => o.name);
  const optionValues = raw.options.map(o => o.values);

  const description = stripHtml(raw.body_html);
  const short = shortDesc(description);

  return {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    vendor: raw.vendor,
    productType: raw.product_type,
    tags: raw.tags,
    image: primaryImage,
    images: allImages,
    imageMap,
    variants,
    price,
    compareAtPrice,
    onSale,
    inStock,
    optionNames,
    optionValues,
    description,
    shortDescription: short,
    permalink: `${BASE}/products/${raw.handle}`,
    collection: collectionLabel(raw),
    publishedAt: raw.published_at,
  };
}