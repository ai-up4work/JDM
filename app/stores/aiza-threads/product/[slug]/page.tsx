'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Star, ShoppingBag,
  Heart, Share2, ZoomIn, Package, RefreshCw, Shield,
  Tag, X
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import type { Product as GlobalProduct } from '@/lib/mockData';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReviewItem {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductDetail {
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
  reviewList: ReviewItem[];
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function proxyImg(url: string) {
  if (!url) return url;
  return `/api/aiza-threads/image-proxy?url=${encodeURIComponent(url)}`;
}

function toCartProduct(p: ProductDetail, qty: number): GlobalProduct {
  return {
    id:            p.id,
    name:          p.name,
    price:         p.price,
    originalPrice: p.originalPrice ?? undefined,
    image:         p.images[0] ?? '',
    category:      p.category,
    seller:        'aiza-threads',
    rating:        p.rating ?? 0,
    reviews:       p.reviews ?? 0,
    inStock:       p.inStock,
    sizes:         p.sizes,
    colors:        p.colors,
  };
}

// ── Image Gallery ──────────────────────────────────────────────────────────────

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive]   = useState(0);
  const [zoomed, setZoomed]   = useState(false);
  const [errored, setErrored] = useState<Set<number>>(new Set());

  const good = images.filter((_, i) => !errored.has(i));

  const prev = () => setActive(a => (a - 1 + good.length) % good.length);
  const next = () => setActive(a => (a + 1) % good.length);

  if (good.length === 0) {
    return (
      <div className="w-full aspect-[3/4] rounded-3xl bg-secondary flex items-center justify-center text-muted-foreground text-sm">
        No images available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-secondary group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxyImg(good[active])}
          alt={`${name} - image ${active + 1}`}
          onError={() => setErrored(e => new Set([...e, active]))}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />

        {/* Navigation arrows */}
        {good.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Zoom button */}
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
        >
          <ZoomIn size={15} />
        </button>

        {/* Dot indicators */}
        {good.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {good.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`rounded-full transition-all ${
                  i === active ? 'w-5 h-1.5 bg-foreground' : 'w-1.5 h-1.5 bg-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {good.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {good.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === active ? 'border-foreground' : 'border-border hover:border-foreground/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyImg(src)}
                alt={`thumb ${i + 1}`}
                className="w-full h-full object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxyImg(good[active])}
            alt={name}
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ── Star Rating ────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-border fill-border'}
        />
      ))}
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-secondary/20 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
            {review.author[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm font-medium text-foreground">{review.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size={12} />
          {review.date && <span className="text-xs text-muted-foreground">{review.date}</span>}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const { addToCart } = useCartStore();

  const [product,    setProduct]    = useState<ProductDetail | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);
  const [qty,        setQty]        = useState(1);
  const [addedToBag, setAddedToBag] = useState(false);
  const [wishlist,   setWishlist]   = useState(false);
  const [activeTab,  setActiveTab]  = useState<'description' | 'reviews' | 'details'>('description');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/aiza-threads/product/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(({ product }) => setProduct(product))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(toCartProduct(product, qty), qty);
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  }, [product, qty, addToCart]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-6">
        <div className="h-5 w-32 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="w-full aspect-[3/4] bg-muted rounded-3xl animate-pulse" />
          <div className="flex flex-col gap-4 pt-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-12 w-full bg-muted rounded-2xl animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-lg font-semibold text-foreground mb-2">Product not found</p>
        <p className="text-sm text-muted-foreground mb-6">We couldn&apos;t load this product from laam.pk</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  );

  const hasDiscount = product.discount && product.discount > 0 && product.originalPrice;

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-4 sm:py-8">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={15} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWishlist(w => !w)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                wishlist
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              <Heart size={16} className={wishlist ? 'fill-red-500' : ''} />
            </button>
            <button
              type="button"
              onClick={() => navigator.share?.({ title: product.name, url: product.url })}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/brands" className="hover:text-foreground transition-colors">Brands</Link>
          <ChevronRight size={11} />
          {product.brandSlug ? (
            <Link href={`/aiza-threads/${product.brandSlug}`} className="hover:text-foreground transition-colors">
              {product.brand}
            </Link>
          ) : (
            <span>{product.brand}</span>
          )}
          <ChevronRight size={11} />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* Left — Gallery */}
          <div className="w-full">
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* Right — Details */}
          <div className="flex flex-col gap-5 lg:pt-2">

            {/* Brand + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brandSlug ? (
                <Link
                  href={`/aiza-threads/${product.brandSlug}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {product.brand}
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">{product.brand}</span>
              )}
              {product.isNew && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">New</span>
              )}
              {hasDiscount && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">-{product.discount}%</span>
              )}
              {!product.inStock && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase">Out of stock</span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 flex-wrap">
                <StarRating rating={product.rating} size={15} />
                <span className="text-sm font-semibold text-foreground">{product.rating}</span>
                {product.reviews && (
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
              )}
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <span key={c} className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground bg-secondary/30 capitalize">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      type="button"
                      className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:border-foreground/60 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add to bag */}
            <div className="flex items-center gap-3 flex-wrap mt-1">
              {/* Quantity */}
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold text-foreground select-none">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to bag */}
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className={`flex-1 min-w-[140px] h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
                  addedToBag
                    ? 'bg-emerald-500 text-white'
                    : product.inStock
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {addedToBag ? (
                  <>✓ Added to bag</>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    {product.inStock ? 'Add to bag' : 'Out of stock'}
                  </>
                )}
              </button>
            </div>

            {/* View on laam.pk */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
            >
              View on laam.pk
              <ChevronRight size={14} />
            </a>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-1">
              {[
                { icon: Package,   label: 'Fast delivery' },
                { icon: RefreshCw, label: 'Easy returns' },
                { icon: Shield,    label: 'Secure checkout' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-secondary/30 border border-border text-center">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* SKU + fabric chips */}
            <div className="flex flex-wrap gap-2">
              {product.sku && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  <Tag size={10} /> SKU: {product.sku}
                </span>
              )}
              {product.fabric && (
                <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full capitalize">
                  Fabric: {product.fabric}
                </span>
              )}
              {product.category && (
                <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full capitalize">
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Reviews / Details ── */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-border mb-6">
            {(['description', 'reviews', 'details'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                {tab === 'reviews' && product.reviews ? ` (${product.reviews})` : ''}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="max-w-2xl">
              {product.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description available.</p>
              )}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-[11px] bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-2xl flex flex-col gap-3">
              {product.reviewList.length > 0 ? (
                product.reviewList.map((r, i) => <ReviewCard key={i} review={r} />)
              ) : (
                <p className="text-sm text-muted-foreground italic">No reviews yet.</p>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="max-w-2xl">
              <dl className="divide-y divide-border">
                {[
                  { label: 'Brand',    value: product.brand },
                  { label: 'Category', value: product.category },
                  { label: 'Fabric',   value: product.fabric },
                  { label: 'SKU',      value: product.sku },
                  { label: 'Colors',   value: product.colors.join(', ') || null },
                  { label: 'Sizes',    value: product.sizes.join(', ') || null },
                  { label: 'In stock', value: product.inStock ? 'Yes' : 'No' },
                ]
                  .filter(d => d.value)
                  .map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-4 py-3">
                      <dt className="w-28 shrink-0 text-sm font-medium text-foreground">{label}</dt>
                      <dd className="text-sm text-muted-foreground capitalize">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}