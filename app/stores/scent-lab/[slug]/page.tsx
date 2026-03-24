// app/stores/scent-lab/[slug]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon,
  ShoppingBag, Heart, Check, Truck, Package,
  ExternalLink, ArrowLeft, AlertCircle, Share2, ZoomIn,
  Minus, Plus, Sparkles, Wind,
} from 'lucide-react';
import type { SLPerfume, SLSingleResponse } from '@/lib/scent-lab.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(lkr: number) { return `LKR ${lkr.toLocaleString()}`; }

function categoryColor(cat: string) {
  if (cat === 'Men')   return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
  if (cat === 'Women') return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300';
  return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300';
}

const CART_KEY = 'scent_lab_cart';
type CartItem = SLPerfume & { selectedMl: string; selectedPrice: number; qty: number };

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('scent_lab_cart_updated'));
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
        <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-12 w-20 rounded-xl bg-muted" />)}</div>
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
      <Sparkles size={48} />
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
          src={`https://ozscent.vercel.app${images[active]}`}
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
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all relative ${active === i ? 'border-foreground' : 'border-transparent hover:border-foreground/30'}`}>
              <Image src={`https://ozscent.vercel.app${src}`} alt="" fill sizes="64px" className="object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Scent Pyramid ────────────────────────────────────────────────────────────

const PYRAMID_CONFIG = [
  {
    key:      'top'   as const,
    label:    'Top notes',
    sub:      'First impression · 15–30 min',
    // Indented most — visually narrows the top of the pyramid
    indent:   'mx-8',
    bg:       'bg-amber-50 dark:bg-amber-950/20',
    border:   'border-amber-200/70 dark:border-amber-800/40',
    dot:      'bg-amber-400',
    pill:     'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/50',
  },
  {
    key:      'heart' as const,
    label:    'Heart notes',
    sub:      'The soul · 2–4 hours',
    indent:   'mx-3',
    bg:       'bg-rose-50 dark:bg-rose-950/20',
    border:   'border-rose-200/70 dark:border-rose-800/40',
    dot:      'bg-rose-400',
    pill:     'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700/50',
  },
  {
    key:      'base'  as const,
    label:    'Base notes',
    sub:      'Lasting trail · 6–12+ hrs',
    indent:   'mx-0',
    bg:       'bg-stone-50 dark:bg-stone-950/20',
    border:   'border-stone-200/70 dark:border-stone-800/40',
    dot:      'bg-stone-500',
    pill:     'bg-stone-100 text-stone-800 border border-stone-200 dark:bg-stone-900/40 dark:text-stone-200 dark:border-stone-700/50',
  },
] as const;

function NotesPyramid({ notes }: { notes: SLPerfume['notes'] }) {
  if (!notes) return null;
  const rows = PYRAMID_CONFIG.map(c => ({ ...c, items: notes[c.key] ?? [] })).filter(r => r.items.length > 0);
  if (!rows.length) return <p className="text-xs text-muted-foreground italic">Note information not available.</p>;

  return (
    <div className="space-y-2">
      {rows.map((row, idx) => (
        <div key={row.key} className={`${row.indent} rounded-2xl border ${row.border} ${row.bg} overflow-hidden`}>
          {/* Header row */}
          <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`} />
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest whitespace-nowrap">
                {row.label}
              </span>
              <span className="text-[9px] text-muted-foreground hidden sm:block truncate">{row.sub}</span>
            </div>
          </div>

          {/* Note pills */}
          <div className="flex flex-wrap gap-1.5 px-4 pb-3.5">
            {row.items.map(note => (
              <span key={note} className={`text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${row.pill}`}>
                {note}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Evaporation legend */}
      <div className="flex items-center gap-2 pt-1 pl-1">
        <Wind size={10} className="text-muted-foreground shrink-0" />
        <span className="text-[9px] text-muted-foreground">
          Top notes evaporate fastest · base notes linger longest
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScentLabProductPage() {
  const { slug }                         = useParams<{ slug: string }>();
  const [perfume,    setPerfume]         = useState<SLPerfume | null>(null);
  const [loading,    setLoading]         = useState(true);
  const [error,      setError]           = useState<string | null>(null);

  /**
   * Store only the volume string as the selection key.
   * Active check: selectedVolume === s.volume — plain string equality,
   * no object-reference drift, no type-coercion risk.
   */
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [qty,            setQty]            = useState(1);
  const [wishlisted,     setWishlisted]     = useState(false);
  const [added,          setAdded]          = useState(false);
  const [cartCount,      setCartCount]      = useState(0);

  useEffect(() => {
    const update = () => setCartCount(readCart().reduce((s, i) => s + i.qty, 0));
    update();
    window.addEventListener('scent_lab_cart_updated', update);
    return () => window.removeEventListener('scent_lab_cart_updated', update);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setError(null);
    fetch(`/api/scent-lab/${encodeURIComponent(slug)}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: SLSingleResponse) => {
        setPerfume(d.data);
        if (d.data.sizes?.length) setSelectedVolume(d.data.sizes[0].volume);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Derive full size object from the stable volume key on every render
  const selectedSize = perfume?.sizes.find(s => s.volume === selectedVolume) ?? null;

  const handleAdd = () => {
    if (!perfume || !selectedSize) return;
    const cart = readCart();
    writeCart([
      ...cart,
      ...Array(qty).fill({
        ...perfume,
        selectedMl:    selectedSize.volume,
        selectedPrice: selectedSize.price,
        qty:           1,
      }),
    ]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share && perfume) navigator.share({ title: perfume.name, url: window.location.href }).catch(() => {});
    else navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  const canAdd    = !!perfume && !!selectedSize && perfume.inStock;
  const totalCost = selectedSize ? selectedSize.price * qty : 0;

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
            <Link href="/stores/scent-lab" className="hover:text-foreground transition-colors font-medium shrink-0">Scent Lab</Link>
            {perfume && (
              <>
                <ChevronRight size={11} className="shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[140px]">{perfume.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleShare} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <Share2 size={14} className="text-muted-foreground" />
            </button>
            <Link href="/stores/scent-lab"
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

          <Link href="/stores/scent-lab"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Scent Lab
          </Link>

          {loading && <PDPSkeleton />}

          {error && !loading && (
            <div className="flex items-start gap-3 p-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 max-w-lg">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Couldn't load fragrance</p>
                <p className="text-xs text-muted-foreground mb-3">{error}</p>
                <Link href="/stores/scent-lab" className="text-xs font-semibold text-foreground underline hover:no-underline">← Back</Link>
              </div>
            </div>
          )}

          {perfume && !loading && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 items-start">

                <ImageGallery images={perfume.images ?? []} title={perfume.name} />

                <div className="flex flex-col gap-5 py-1">

                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${categoryColor(perfume.category)}`}>
                        {perfume.category}
                      </span>
                      {perfume.featured && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 uppercase">
                          Featured
                        </span>
                      )}
                      {!perfume.inStock && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/80 text-background uppercase">
                          Sold out
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-2">{perfume.name}</h1>
                    <p className="text-sm text-muted-foreground">{perfume.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    {selectedSize ? (
                      <>
                        <span className="text-3xl font-bold text-foreground">{fmtPrice(selectedSize.price)}</span>
                        <span className="text-sm text-muted-foreground">for {selectedSize.volume}</span>
                      </>
                    ) : (
                      perfume.sizes?.length > 0 && (
                        <span className="text-3xl font-bold text-foreground">
                          From {fmtPrice(Math.min(...perfume.sizes.map(s => s.price)))}
                        </span>
                      )
                    )}
                  </div>

                  <div className="h-px bg-border" />

                  {/* ── Size selector ── */}
                  {(perfume.sizes ?? []).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">Choose size</p>
                      <div className="flex flex-wrap gap-2">
                        {perfume.sizes.map(s => {
                          const isActive = selectedVolume === s.volume;
                          return (
                            <button
                              key={s.volume}
                              type="button"
                              onClick={() => setSelectedVolume(s.volume)}
                              className={[
                                'flex flex-col items-center px-4 py-3 rounded-xl border font-bold transition-all min-w-[72px]',
                                isActive
                                  ? 'border-foreground bg-foreground text-background shadow-sm'
                                  : 'border-border text-foreground hover:border-foreground/40 hover:bg-secondary/50',
                              ].join(' ')}
                            >
                              <span className="text-sm font-black">{s.volume}</span>
                              <span className={['text-[10px] mt-0.5 font-medium', isActive ? 'text-background/70' : 'text-muted-foreground'].join(' ')}>
                                {fmtPrice(s.price)}
                              </span>
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
                          className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Minus size={13} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-foreground">{qty}</span>
                        <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Plus size={13} />
                        </button>
                      </div>
                      {totalCost > 0 && (
                        <p className="text-xs text-muted-foreground">Total: {fmtPrice(totalCost)}</p>
                      )}
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
                      {added
                        ? <><Check size={16} /> Added to bag</>
                        : <><ShoppingBag size={16} /> Add to bag{qty > 1 ? ` (${qty})` : ''}</>}
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
                      { icon: <Truck size={14} />,    label: 'Island-wide', sub: 'COD accepted'       },
                      { icon: <Package size={14} />,  label: '3 sizes',     sub: '5ml · 10ml · Full'  },
                      { icon: <Sparkles size={14} />, label: 'Authentic',   sub: 'Genuine fragrances' },
                    ].map(b => (
                      <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/30 border border-border">
                        <span className="text-foreground mb-1">{b.icon}</span>
                        <p className="text-[10px] font-bold text-foreground">{b.label}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{b.sub}</p>
                      </div>
                    ))}
                  </div>

                  {perfume.orderUrl && (
                    <a href={perfume.orderUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {/* <ExternalLink size={12} />
                      View original listing on ozscent.vercel.app */}
                    </a>
                  )}
                </div>
              </div>

              {/* ── Details + Pyramid ── */}
              <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: description + specs table */}
                <div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">About this fragrance</h2>
                  {perfume.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{perfume.description}</p>
                  )}

                  <div className="rounded-2xl border border-border overflow-hidden">
                    {[
                      { label: 'Category',  value: perfume.category  },
                      { label: 'Intensity', value: perfume.intensity },
                      { label: 'Longevity', value: perfume.longevity },
                      { label: 'Sillage',   value: perfume.sillage   },
                      ...(perfume.season?.length   ? [{ label: 'Season',    value: perfume.season.join(', ')   }] : []),
                      ...(perfume.occasion?.length ? [{ label: 'Occasions', value: perfume.occasion.join(', ') }] : []),
                    ].filter(s => s.value).map((s, idx, arr) => (
                      <div
                        key={s.label}
                        className={['flex text-xs', idx < arr.length - 1 ? 'border-b border-border' : ''].join(' ')}
                      >
                        <span className="font-semibold text-foreground w-28 shrink-0 px-4 py-2.5 bg-secondary/30">
                          {s.label}
                        </span>
                        <span className="text-muted-foreground px-4 py-2.5">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: scent pyramid */}
                <div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Scent pyramid</h2>
                  <NotesPyramid notes={perfume.notes} />
                </div>
              </div>

              {/* How it works */}
              <div className="mt-14 p-5 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">How to order</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: '01', title: 'Choose your size',  body: 'Pick from 5ml decant, 10ml decant, or full bottle. Perfect for sampling before committing.' },
                    { step: '02', title: 'Add to bag',        body: 'Add your fragrance to the bag, then order via WhatsApp. We confirm availability immediately.' },
                    { step: '03', title: 'We deliver',        body: 'Cash on delivery or bank transfer. Delivered island-wide within 2–4 working days.' },
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