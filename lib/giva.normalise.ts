// lib/giva.normalise.ts
import type { GIVAShopifyProduct, GIVAProduct, GIVAVariant } from './giva.types';

const GIVA_BASE = 'https://www.giva.lk';

/** Strip HTML tags and decode basic entities */
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

/**
 * Convert Shopify price string ("3900.00") → LKR minor units (×100)
 * So Rs. 3,900 becomes 390000
 */
function toMinorUnits(price: string | null | undefined): number {
  if (!price) return 0;
  return Math.round(parseFloat(price) * 100);
}

/** Find option values for a given option name (case-insensitive) */
function findOptionValues(
  options: GIVAShopifyProduct['options'],
  ...names: string[]
): string[] {
  const lower = names.map(n => n.toLowerCase());
  const opt = options.find(o => lower.includes(o.name.toLowerCase()));
  return opt?.values ?? [];
}

export function normalise(
  raw: GIVAShopifyProduct,
  collectionLabel = ''
): GIVAProduct {
  // ── Variants ──────────────────────────────────────────────────────────────
  const variants: GIVAVariant[] = raw.variants.map(v => ({
    id:             v.id,
    title:          v.title,
    price:          toMinorUnits(v.price),
    compareAtPrice: v.compare_at_price ? toMinorUnits(v.compare_at_price) : null,
    option1:        v.option1,
    option2:        v.option2,
    option3:        v.option3,
    available:      v.available,
    sku:            v.sku,
    imageId:        v.image_id,
  }));

  // ── Pricing from cheapest available variant (fallback to first) ───────────
  const available = variants.filter(v => v.available);
  const base      = available.length > 0 ? available[0] : variants[0];
  const price     = base?.price          ?? 0;
  const compareAt = base?.compareAtPrice ?? null;
  const onSale    = compareAt !== null && compareAt > price;
  const inStock   = variants.some(v => v.available);

  // ── Images ────────────────────────────────────────────────────────────────
  const images = raw.images.map(img => img.src);
  const image  = raw.image?.src ?? images[0] ?? '';

  // ── Options ───────────────────────────────────────────────────────────────
  const options = raw.options
    // Skip the default "Title" option that Shopify adds for single-variant products
    .filter(o => !(o.values.length === 1 && o.values[0] === 'Default Title'))
    .map(o => ({ name: o.name, values: o.values }));

  const metalColours = findOptionValues(
    raw.options,
    'metal colour', 'metal color', 'color', 'colour', 'finish', 'metal'
  );

  const sizes = findOptionValues(raw.options, 'size', 'ring size');

  // ── Collection label ──────────────────────────────────────────────────────
  // Prefer passed-in label; fall back to product_type or first matching tag
  const CATEGORY_TAGS = [
    'pendant', 'ring', 'earring', 'bracelet', 'chain',
    'anklet', 'nose pin', 'toe ring', 'men',
  ];
  let resolvedLabel = collectionLabel;
  if (!resolvedLabel && raw.product_type) resolvedLabel = raw.product_type;
  if (!resolvedLabel) {
    const tagMatch = raw.tags.find(t =>
      CATEGORY_TAGS.some(c => t.toLowerCase().includes(c))
    );
    if (tagMatch) resolvedLabel = tagMatch;
  }
  if (!resolvedLabel) resolvedLabel = 'Jewellery';

  return {
    id:              raw.id,
    handle:          raw.handle,
    name:            raw.title,
    description:     stripHtml(raw.body_html),
    descriptionHtml: raw.body_html,
    productType:     raw.product_type,
    vendor:          raw.vendor,
    tags:            raw.tags,

    price,
    compareAtPrice: compareAt,
    onSale,
    inStock,

    image,
    images,

    variants,
    options,
    metalColours,
    sizes,

    collectionLabel: resolvedLabel,
    permalink:       `${GIVA_BASE}/products/${raw.handle}`,

    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}