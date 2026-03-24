// app/stores/buckley-london/[slug]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon,
  ShoppingBag, Heart, Star, Check, Truck, Award, Sparkles,
  ExternalLink, ArrowLeft, AlertCircle, Share2, ZoomIn,
  Minus, Plus, Gem,
} from 'lucide-react';
import type { BKLProduct } from '@/lib/buckly.types';

function fmtPrice(lkr: number) { return `රු${lkr.toLocaleString('en-LK')}`; }

const CART_KEY = 'buckley_cart';
type CartItem = BKLProduct & { selectedSize?: string | null; qty: number };

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('buckley_cart_updated'));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PDPSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 animate-pulse">
      <div>
        <div className="aspect-square rounded-2xl bg-muted mb-3" />
        <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="w-16 h-16 rounded-xl bg-muted" />)}</div>
      </div>
      <div className="space-y-4 py-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-10 w-40 rounded bg-muted" />
        <div className="h-px bg-muted" />
        <div className="h-12 rounded-xl bg-muted mt-4" />
      </div>
    </div>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive]   = useState(0);
  const [zoomed, setZoomed]   = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  if (!images.length) return (
    <div className="aspect-square rounded-2xl bg-secondary/40 flex items-center justify-center text-muted-foreground/20">
      <Gem size={48} />
    </div>
  );

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24 self-start">
      <div
        ref={ref}
        className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30 cursor-zoom-in group"
        onMouseMove={e => {
          if (!ref.current) return;
          const r = ref.current.getBoundingClientRect();
          setZoomPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          src={images[active]}
          alt={`${title} — ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-cover transition-transform duration-200 ${zoomed ? 'scale-[1.8]' : 'scale-100'}`}
          style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
          draggable={false}
          priority
        />
        <div className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={11} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Hover to zoom</span>
        </div>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => setActive(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm">
              <ChevronLeft size={14} />
            </button>
            <button type="button" onClick={() => setActive(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm">
              <ChevronRightIcon size={14} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-semibold text-foreground">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all relative ${active === i ? 'border-foreground' : 'border-transparent hover:border-foreground/30'}`}>
              <Image src={src} alt="" fill sizes="64px" className="object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: { id: number; reviewer: string; date_created: string; review: string; rating: number } }) {
  const clean = review.review.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold text-foreground">{review.reviewer}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(review.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={11} className={s <= review.rating ? 'fill-foreground text-foreground' : 'fill-none text-border'} />
          ))}
        </div>
      </div>
      {clean && <p className="text-xs text-muted-foreground leading-relaxed">{clean}</p>}
    </div>
  );
}

// ─── Main PDP ─────────────────────────────────────────────────────────────────

export default function BuckleyProductPage() {
  const { slug }                          = useParams<{ slug: string }>();
  const [product,    setProduct]          = useState<BKLProduct | null>(null);
  const [reviews,    setReviews]          = useState<any[]>([]);
  const [loading,    setLoading]          = useState(true);
  const [error,      setError]            = useState<string | null>(null);

  const [selectedSize, setSelectedSize]   = useState<string | null>(null);
  const [qty,          setQty]            = useState(1);
  const [wishlisted,   setWishlisted]     = useState(false);
  const [added,        setAdded]          = useState(false);
  const [cartCount,    setCartCount]      = useState(0);

  useEffect(() => {
    const update = () => setCartCount(readCart().reduce((s, i) => s + i.qty, 0));
    update();
    window.addEventListener('buckley_cart_updated', update);
    return () => window.removeEventListener('buckley_cart_updated', update);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setError(null);
    fetch(`/api/buckley/${encodeURIComponent(slug)}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => {
        setProduct(d.product);
        setReviews(d.reviews ?? []);
        if (d.product.sizes?.length) setSelectedSize(d.product.sizes[0]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) return;
    const cart = readCart();
    writeCart([...cart, ...Array(qty).fill({ ...product, selectedSize, qty: 1 })]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share && product) navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    else navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  const needsSize = !!product && product.sizes.length > 0;
  const canAdd    = !!product && (!needsSize || !!selectedSize);
  const discount  = product?.originalPrice && product.onSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  // Buckley London canonical URL
  const buckleyUrl = product
    ? `https://www.buckleylondon.com/search?q=${product.slug}`
    : 'https://www.buckleylondon.com';

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
            <Link href="/stores/buckley-london" className="hover:text-foreground transition-colors font-medium shrink-0">Buckley London</Link>
            {product && (
              <>
                <ChevronRight size={11} className="shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[140px]">{product.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleShare} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <Share2 size={14} className="text-muted-foreground" />
            </button>
            <Link href="/stores/buckley-london"
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

          <Link href="/stores/buckley-london"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Buckley London
          </Link>

          {loading && <PDPSkeleton />}

          {error && !loading && (
            <div className="flex items-start gap-3 p-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 max-w-lg">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Couldn't load product</p>
                <p className="text-xs text-muted-foreground mb-3">{error}</p>
                <Link href="/stores/buckley-london" className="text-xs font-semibold text-foreground underline hover:no-underline">← Back</Link>
              </div>
            </div>
          )}

          {product && !loading && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 items-start">
                <ImageGallery images={product.images} title={product.name} />

                <div className="flex flex-col gap-5 py-1">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {product.jewelleryTypeLabel}
                      </span>
                      {product.material && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {product.material}
                          </span>
                        </>
                      )}
                      {product.onSale && discount && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-foreground text-background uppercase">−{discount}%</span>
                      )}
                      {!product.inStock && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">Sold out</span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-1">{product.name}</h1>
                    <p className="text-xs text-muted-foreground font-medium">Buckley London</p>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={s <= Math.round(product.rating) ? 'fill-foreground text-foreground' : 'fill-none text-border'} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewCount})</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-foreground">{fmtPrice(product.price)}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-base text-muted-foreground line-through">{fmtPrice(product.originalPrice)}</span>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          Save {fmtPrice(product.originalPrice - product.price)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="h-px bg-border" />

                  {/* Size selector */}
                  {product.sizes.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                        Size{needsSize && !selectedSize && <span className="text-red-400 font-normal normal-case tracking-normal ml-2">— please select</span>}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map(s => {
                          const isActive = selectedSize === s;
                          return (
                            <button key={s} type="button" onClick={() => setSelectedSize(s)}
                              className={[
                                'min-w-[44px] px-3 py-2 rounded-xl border text-xs font-bold transition-all',
                                isActive
                                  ? 'border-foreground bg-foreground text-background shadow-sm'
                                  : 'border-border text-foreground hover:border-foreground/40 hover:bg-secondary/50',
                              ].join(' ')}>
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">Quantity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-xl overflow-hidden">
                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"><Minus size={13} /></button>
                        <span className="w-10 text-center text-sm font-bold text-foreground">{qty}</span>
                        <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"><Plus size={13} /></button>
                      </div>
                      <p className="text-xs text-muted-foreground">Max 10 per order</p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-3">
                    <button type="button" onClick={handleAdd} disabled={!canAdd}
                      className={[
                        'flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-[0.98]',
                        added
                          ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                          : canAdd
                            ? 'bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                            : 'bg-secondary text-muted-foreground cursor-not-allowed',
                      ].join(' ')}>
                      {added ? <><Check size={16} /> Added to bag</> : <><ShoppingBag size={16} /> Add to bag{qty > 1 ? ` (${qty})` : ''}</>}
                    </button>
                    <button type="button" onClick={() => setWishlisted(v => !v)}
                      className={[
                        'w-14 h-14 rounded-2xl border flex items-center justify-center transition-all',
                        wishlisted ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/30' : 'border-border hover:bg-secondary',
                      ].join(' ')}>
                      <Heart size={18} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-foreground'} />
                    </button>
                  </div>

                  {/* Trust bar */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Award size={14} />,    label: 'Award-winning',  sub: 'UK Jewellery Awards'   },
                      { icon: <Sparkles size={14} />, label: 'Authentic',      sub: 'Buckley London'        },
                      { icon: <Truck size={14} />,    label: 'Island-wide',    sub: 'COD available'         },
                    ].map(b => (
                      <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/30 border border-border">
                        <span className="text-foreground mb-1">{b.icon}</span>
                        <p className="text-[10px] font-bold text-foreground">{b.label}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{b.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* External link → Buckley London */}
                  <a
                    href={buckleyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink size={12} />
                    View on Buckley London
                  </a>
                </div>
              </div>

              {/* Description + Reviews */}
              <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Product details</h2>
                  {product.shortDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{product.shortDescription}</p>
                  )}
                  {product.description && product.description !== product.shortDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  )}
                  <div className="mt-5 rounded-2xl border border-border overflow-hidden">
                    {[
                      { label: 'Type',     value: product.jewelleryTypeLabel },
                      { label: 'Material', value: product.material           },
                      { label: 'Brand',    value: 'Buckley London'           },
                    ].filter(s => s.value).map((s, idx, arr) => (
                      <div key={s.label} className={['flex text-xs', idx < arr.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                        <span className="font-semibold text-foreground w-24 shrink-0 px-4 py-2.5 bg-secondary/30">{s.label}</span>
                        <span className="text-muted-foreground px-4 py-2.5">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Customer reviews</h2>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} className={s <= Math.round(product.rating) ? 'fill-foreground text-foreground' : 'fill-none text-border'} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                  {reviews.length > 0 ? (
                    <div>
                      {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                      <a
                        href={`${buckleyUrl}#reviews`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
                      >
                        <ExternalLink size={11} /> See all reviews on Buckley London
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No reviews yet.</p>
                  )}
                </div>
              </div>

              {/* How it works */}
              <div className="mt-14 p-5 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">How our reselling works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: '01', title: 'You order here',      body: 'Add to bag and place your order via WhatsApp. We confirm your piece availability.' },
                    { step: '02', title: 'We source for you',   body: 'We purchase authentic Buckley London pieces on your behalf and arrange shipment.' },
                    { step: '03', title: 'We deliver locally',  body: 'Your jewellery arrives with us and we deliver to your door the same or next day in your area.' },
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