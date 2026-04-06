// app/stores/old-money/[handle]/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon,
  ShoppingBag, Heart, Check, Truck, RefreshCw, Shield,
  ArrowLeft, AlertCircle, Share2, ZoomIn,
  Minus, Plus,
} from 'lucide-react';
import type { OMProduct } from '@/lib/oldmoney.types';
import type { Product } from '@/lib/mockData';
import { useCartStore } from '@/lib/store';
import { StoreBagButton } from '@/components/StoreBagButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Maps an OMProduct to the global Product shape */
function omToProduct(p: OMProduct): Product {
  return {
    id:            p.id,
    name:          p.title,
    price:         p.price / 100,
    originalPrice: p.originalPrice ? p.originalPrice / 100 : undefined,
    image:         p.image ?? '',
    category:      p.category,
    seller:        'old-money',
    rating:        0,
    reviews:       0,
    inStock:       p.inStock,
    sizes:         p.sizes  ?? [],
    colors:        p.colors ?? [],
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PDPSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 animate-pulse">
      <div>
        <div className="aspect-square rounded-2xl bg-muted mb-3" />
        <div className="flex gap-2">{[1,2,3,4].map(i => <div key={i} className="w-16 h-16 rounded-xl bg-muted" />)}</div>
      </div>
      <div className="space-y-4 py-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-10 w-40 rounded bg-muted" />
        <div className="h-px bg-muted" />
        <div className="flex gap-2">{[1,2,3,4].map(i => <div key={i} className="h-9 w-14 rounded-lg bg-muted" />)}</div>
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

  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  if (!images.length) return (
    <div className="aspect-square rounded-2xl bg-secondary/40 flex items-center justify-center text-muted-foreground/20">
      <ShoppingBag size={48} />
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${title} — ${active + 1}`}
          className={`w-full h-full object-cover transition-transform duration-200 ${zoomed ? 'scale-[1.6]' : 'scale-100'}`}
          style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
          draggable={false}
        />

        <div className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={11} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Hover to zoom</span>
        </div>

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
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${active === i ? 'border-foreground' : 'border-transparent hover:border-foreground/30'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OldMoneyProductPage() {
  const { handle }                        = useParams<{ handle: string }>();
  const { addToCart }                     = useCartStore();

  const [product,      setProduct]        = useState<OMProduct | null>(null);
  const [loading,      setLoading]        = useState(true);
  const [error,        setError]          = useState<string | null>(null);

  const [selectedSize,  setSelectedSize]  = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty,           setQty]           = useState(1);
  const [wishlisted,    setWishlisted]    = useState(false);
  const [added,         setAdded]         = useState(false);

  useEffect(() => {
    if (!handle) return;
    setLoading(true); setError(null);
    fetch(`/api/oldmoney/${encodeURIComponent(handle)}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => {
        setProduct(d.product);
        if (d.product.colors?.length) setSelectedColor(d.product.colors[0]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [handle]);

  const handleAdd = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) return;
    addToCart(omToProduct(product), qty, selectedSize ?? undefined, selectedColor ?? undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share && product) navigator.share({ title: product.title, url: window.location.href }).catch(() => {});
    else navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  const needsSize = !!product && product.sizes.length > 0;
  const canAdd    = !!product && product.inStock !== false && (!needsSize || !!selectedSize);
  const discount  = product?.originalPrice && product.onSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;
  const tags = Array.isArray(product?.tags) ? product.tags : [];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 min-w-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium shrink-0">Home</Link>
            <ChevronRight size={11} className="shrink-0" />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium shrink-0">Stores</Link>
            <ChevronRight size={11} className="shrink-0" />
            <Link href="/stores/old-money" className="hover:text-foreground transition-colors font-medium shrink-0">Old Money</Link>
            {product && (
              <>
                <ChevronRight size={11} className="shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[140px]">{product.title}</span>
              </>
            )}
          </div>

          {/* Share + global bag */}
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleShare}
              className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <Share2 size={14} className="text-muted-foreground" />
            </button>
            {/* <StoreBagButton /> */}
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          <Link href="/stores/old-money"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Old Money
          </Link>

          {loading && <PDPSkeleton />}

          {error && !loading && (
            <div className="flex items-start gap-3 p-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 max-w-lg">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Couldn't load product</p>
                <p className="text-xs text-muted-foreground mb-3">{error}</p>
                <Link href="/stores/old-money" className="text-xs font-semibold text-foreground underline hover:no-underline">← Back</Link>
              </div>
            </div>
          )}

          {product && !loading && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 items-start">

                <ImageGallery images={product.images} title={product.title} />

                <div className="flex flex-col gap-5 py-1">

                  {/* Badges + title */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {product.category}
                      </span>
                      {product.onSale && discount && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-foreground text-background uppercase">
                          −{discount}% sale
                        </span>
                      )}
                      {product.inStock === false && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 uppercase">
                          Sold out
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-1">
                      {product.title}
                    </h1>
                    {product.vendor && product.vendor !== 'Old Money' && (
                      <p className="text-xs text-muted-foreground">{product.vendor}</p>
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

                  {/* Dynamic options */}
                  {product.options.map(opt => {
                    const isSize  = opt.name.toLowerCase() === 'size';
                    const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour';
                    const current = isSize ? selectedSize : isColor ? selectedColor : null;
                    const setter  = isSize ? setSelectedSize : isColor ? setSelectedColor : null;
                    if (!setter) return null;

                    return (
                      <div key={opt.name}>
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                          {opt.name}
                          {isSize && needsSize && !selectedSize && (
                            <span className="text-red-400 font-normal normal-case tracking-normal ml-2">— please select</span>
                          )}
                          {current && (
                            <span className="font-normal normal-case tracking-normal text-muted-foreground ml-2">— {current}</span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {opt.values.map(v => (
                            <button key={v} type="button" onClick={() => setter(v)}
                              className={`min-w-[44px] px-3 py-2 rounded-xl border text-xs font-bold transition-all
                                ${current === v
                                  ? 'border-foreground bg-foreground text-background shadow-sm'
                                  : 'border-border text-foreground hover:border-foreground/40 hover:bg-secondary/50'}`}>
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

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
                    <button type="button" onClick={handleAdd} disabled={!canAdd}
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
                      { icon: <Truck size={14} />,     label: 'Island-wide', sub: '2–4 working days' },
                      { icon: <RefreshCw size={14} />, label: 'Live stock',  sub: 'Real-time sync'   },
                      { icon: <Shield size={14} />,    label: 'Authentic',   sub: '100% original'    },
                    ].map(b => (
                      <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/30 border border-border">
                        <span className="text-foreground mb-1">{b.icon}</span>
                        <p className="text-[10px] font-bold text-foreground">{b.label}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{b.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-14 max-w-2xl">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Product details</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* How it works */}
              <div className="mt-14 p-5 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">How our reselling works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: '01', title: 'You order here',      body: 'Add to bag and complete checkout. We confirm availability with Old Money.' },
                    { step: '02', title: 'We bulk-buy for you', body: 'We collect orders and purchase from Old Money in bulk — no international shipping costs passed on.' },
                    { step: '03', title: 'We deliver locally',  body: 'Your item arrives with us and we deliver to your door, same day or next day in your area.' },
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