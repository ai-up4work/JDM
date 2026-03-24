// app/stores/be-dapper/[slug]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, ShoppingBag, Heart, Star, Check,
  Truck, RefreshCw, Shield, ExternalLink, X,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  Minus, Plus, AlertCircle, ArrowLeft, Loader2,
  Share2, ZoomIn,
} from 'lucide-react';
import type { BDProduct } from '@/lib/bedapper.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: number;
  date_created: string;
  review: string;
  rating: number;
  reviewer: string;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function PDPSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 animate-pulse">
      <div>
        <div className="aspect-square rounded-2xl bg-muted mb-3" />
        <div className="flex gap-2">
          {[1,2,3,4].map(i => <div key={i} className="w-16 h-16 rounded-xl bg-muted" />)}
        </div>
      </div>
      <div className="space-y-4 py-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-10 w-40 rounded bg-muted" />
        <div className="h-px bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="flex gap-2">{[1,2,3,4].map(i => <div key={i} className="h-9 w-14 rounded-lg bg-muted" />)}</div>
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-9 w-16 rounded-lg bg-muted" />)}</div>
        <div className="h-12 rounded-xl bg-muted mt-4" />
      </div>
    </div>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [active, setActive]     = useState(0);
  const [zoomed, setZoomed]     = useState(false);
  const [zoomPos, setZoomPos]   = useState({ x: 50, y: 50 });
  const imgRef                  = useRef<HTMLDivElement>(null);

  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-secondary/40 flex items-center justify-center text-muted-foreground/20">
        <ShoppingBag size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24 self-start">
      {/* Main image */}
      <div
        ref={imgRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30 cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${productName} — view ${active + 1}`}
          className={`w-full h-full object-cover transition-transform duration-200 ${zoomed ? 'scale-[1.6]' : 'scale-100'}`}
          style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
          draggable={false}
        />

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={11} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Hover to zoom</span>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm">
              <ChevronLeft size={14} />
            </button>
            <button type="button" onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm">
              <ChevronRightIcon size={14} />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-semibold text-foreground">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                ${active === i ? 'border-foreground' : 'border-transparent hover:border-foreground/30'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Star row ─────────────────────────────────────────────────────────────────

function StarRow({ rating, count, size = 13 }: { rating: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={size}
            className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-none text-border'} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}{count != null ? ` (${count} reviews)` : ''}</span>
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const clean = review.review
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .trim();

  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold text-foreground">{review.reviewer}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(review.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <StarRow rating={review.rating} size={11} />
      </div>
      {clean && <p className="text-xs text-muted-foreground leading-relaxed">{clean}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BeDapperProductPage() {
  const { slug }                            = useParams<{ slug: string }>();
  const [product,   setProduct]             = useState<BDProduct | null>(null);
  const [reviews,   setReviews]             = useState<Review[]>([]);
  const [loading,   setLoading]             = useState(true);
  const [error,     setError]               = useState<string | null>(null);

  const [selectedSize,  setSelectedSize]    = useState<string | null>(null);
  const [selectedColor, setSelectedColor]   = useState<string | null>(null);
  const [qty,           setQty]             = useState(1);
  const [wishlisted,    setWishlisted]       = useState(false);
  const [added,         setAdded]           = useState(false);

  // Cart lives in sessionStorage so it persists across the PDP ↔ list navigation
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('bd_cart');
    if (stored) {
      try { setCartCount(JSON.parse(stored).length); } catch {}
    }
  }, []);

  // ── Fetch product ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetch(`/api/bedapper/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProduct(data.product);
        setReviews(data.reviews ?? []);
        if (data.product.colors.length > 0) setSelectedColor(data.product.colors[0]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Add to bag ─────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) return;

    const item = { ...product, selectedSize, selectedColor, qty };

    const stored = sessionStorage.getItem('bd_cart');
    const cart   = stored ? JSON.parse(stored) : [];
    const updated = [...cart, ...Array(qty).fill(item)];
    sessionStorage.setItem('bd_cart', JSON.stringify(updated));
    setCartCount(updated.length);

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // ── Share ──────────────────────────────────────────────────────────────────

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  const needsSize = !!product && product.sizes.length > 0;
  const canAdd    = !!product && (!needsSize || !!selectedSize);
  const discount  = product?.originalPrice && product.onSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 min-w-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium shrink-0">Home</Link>
            <ChevronRight size={11} className="shrink-0" />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium shrink-0">Stores</Link>
            <ChevronRight size={11} className="shrink-0" />
            <Link href="/stores/be-dapper" className="hover:text-foreground transition-colors font-medium shrink-0">Be Dapper</Link>
            {product && (
              <>
                <ChevronRight size={11} className="shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[140px]">{product.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleShare}
              className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <Share2 size={14} className="text-muted-foreground" />
            </button>
            <Link href="/stores/be-dapper"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors">
              <ShoppingBag size={13} />
              <span className="text-xs font-semibold text-foreground">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* Back link */}
          <Link href="/stores/be-dapper"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Be Dapper
          </Link>

          {/* ── Loading ── */}
          {loading && <PDPSkeleton />}

          {/* ── Error ── */}
          {error && !loading && (
            <div className="flex items-start gap-3 p-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 max-w-lg">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Couldn't load product</p>
                <p className="text-xs text-muted-foreground mb-3">{error}</p>
                <Link href="/stores/be-dapper"
                  className="text-xs font-semibold text-foreground underline hover:no-underline">
                  ← Back to Be Dapper
                </Link>
              </div>
            </div>
          )}

          {/* ── Product ── */}
          {product && !loading && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 items-start">

                {/* Left: image gallery */}
                <ImageGallery images={product.images} productName={product.name} />

                {/* Right: product info */}
                <div className="flex flex-col gap-5 py-1">

                  {/* Brand + category */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {product.categoryLabel}
                      </span>
                      {product.onSale && discount && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-foreground text-background uppercase">
                          −{discount}% sale
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 uppercase">
                          Sold out
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
                      {product.name}
                    </h1>

                    {product.rating > 0 && (
                      <StarRow rating={product.rating} count={product.reviewCount} />
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-foreground">
                      Rs {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-base text-muted-foreground line-through">
                        Rs {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {discount && (
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Save Rs {(product.originalPrice! - product.price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="h-px bg-border" />

                  {/* Colour selector */}
                  {product.colors.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                        Colour
                        {selectedColor && (
                          <span className="font-normal normal-case text-muted-foreground ml-2 tracking-normal">
                            — {selectedColor}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map(c => (
                          <button key={c} type="button" onClick={() => setSelectedColor(c)}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-150
                              ${selectedColor === c
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border text-foreground hover:border-foreground/40 hover:bg-secondary/50'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size selector */}
                  {product.sizes.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Size
                          {needsSize && !selectedSize && (
                            <span className="text-red-400 font-normal normal-case tracking-normal ml-2">
                              — please select
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map(s => (
                          <button key={s} type="button" onClick={() => setSelectedSize(s)}
                            className={`min-w-[44px] px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-150
                              ${selectedSize === s
                                ? 'border-foreground bg-foreground text-background shadow-sm'
                                : 'border-border text-foreground hover:border-foreground/40 hover:bg-secondary/50'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">Quantity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-xl overflow-hidden">
                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Minus size={13} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-foreground">{qty}</span>
                        <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Max 10 per order</p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-3">
                    <button type="button" onClick={handleAdd}
                      disabled={!canAdd}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold
                        transition-all duration-300 active:scale-[0.98]
                        ${added
                          ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                          : canAdd
                            ? 'bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                            : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}>
                      {added
                        ? <><Check size={16} /> Added to bag</>
                        : <><ShoppingBag size={16} /> Add to bag{qty > 1 ? ` (${qty})` : ''}</>}
                    </button>
                    <button type="button" onClick={() => setWishlisted(v => !v)}
                      className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all
                        ${wishlisted ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : 'border-border hover:bg-secondary'}`}>
                      <Heart size={18} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'} />
                    </button>
                  </div>

                  {/* Trust bar */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Truck size={14} />,    label: 'Island-wide', sub: '2–4 working days' },
                      { icon: <RefreshCw size={14} />, label: 'Live stock',  sub: 'synched' },
                      { icon: <Shield size={14} />,   label: 'Authentic',   sub: '100% original'  },
                    ].map(b => (
                      <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/30 border border-border">
                        <span className="text-foreground mb-1">{b.icon}</span>
                        <p className="text-[10px] font-bold text-foreground">{b.label}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{b.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* View on Be Dapper */}
                  <a href={product.permalink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {/* <ExternalLink size={12} /> */}
                    {/* View original listing on bedapper.lk */}
                  </a>

                </div>
              </div>

              {/* ── Description + Reviews ── */}
              <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Description */}
                <div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                    Product details
                  </h2>
                  {product.shortDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {product.shortDescription}
                    </p>
                  )}
                  {product.description && product.description !== product.shortDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Attributes table */}
                  {(product.sizes.length > 0 || product.colors.length > 0) && (
                    <div className="mt-6 space-y-2">
                      {product.sizes.length > 0 && (
                        <div className="flex gap-3 text-xs">
                          <span className="font-semibold text-foreground w-20 shrink-0">Sizes</span>
                          <span className="text-muted-foreground">{product.sizes.join(', ')}</span>
                        </div>
                      )}
                      {product.colors.length > 0 && (
                        <div className="flex gap-3 text-xs">
                          <span className="font-semibold text-foreground w-20 shrink-0">Colours</span>
                          <span className="text-muted-foreground">{product.colors.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex gap-3 text-xs">
                        <span className="font-semibold text-foreground w-20 shrink-0">Category</span>
                        <span className="text-muted-foreground">{product.categoryLabel}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Customer reviews
                    </h2>
                    {product.rating > 0 && (
                      <StarRow rating={product.rating} count={product.reviewCount} />
                    )}
                  </div>

                  {reviews.length > 0 ? (
                    <div>
                      {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                      <a href={`${product.permalink}#reviews`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-4">
                        <ExternalLink size={11} />
                        See all reviews on bedapper.lk
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No reviews yet.</p>
                  )}
                </div>
              </div>

              {/* ── How we work ── */}
              <div className="mt-14 p-5 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">How our reselling works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: '01', title: 'You order here',         body: 'Add to bag and place your order via WhatsApp. We confirm availability with Be Dapper.' },
                    { step: '02', title: 'We bulk-buy for you',    body: 'We collect orders and purchase from Be Dapper in bulk — saving on shipping and passing savings on.' },
                    { step: '03', title: 'We deliver locally',     body: 'Your item arrives with us and we deliver to your door in your area, same day or next day.' },
                  ].map(s => (
                    <div key={s.step} className="flex gap-3">
                      <span className="text-[10px] font-black text-muted-foreground/40 mt-0.5 w-5 shrink-0">{s.step}</span>
                      <div>
                        <p className="text-xs font-bold text-foreground mb-1">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{s.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

        </div>
      </div>
    </div>
  );
}