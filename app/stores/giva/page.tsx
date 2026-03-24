// app/stores/giva/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronLeft, ShoppingBag, Heart,
  X, ArrowUpDown, Truck, Zap, AlertCircle, Search,
  Sparkles, Gem,
} from 'lucide-react';
import type { GIVAProduct, GIVAApiResponse } from '@/lib/giva.types';

// ─── Collection filters ────────────────────────────────────────────────────────

const COLLECTION_FILTERS = [
  { key: '',                    label: 'All'           },
  { key: 'newly-arrival',       label: '\u2728 New In'      },
  { key: 'bestsellers',         label: '\uD83D\uDD25 Bestsellers' },
  { key: 'pendants',            label: 'Pendants'       },
  { key: 'rings',               label: 'Rings'          },
  { key: 'earrings',            label: 'Earrings'       },
  { key: 'bracelets',           label: 'Bracelets'      },
  { key: 'chains',              label: 'Chains'         },
  { key: 'anklets',             label: 'Anklets'        },
  { key: 'nose-pins',           label: 'Nose Pins'      },
  { key: 'toe-rings',           label: 'Toe Rings'      },
  { key: 'mens',                label: "Men's"          },
  { key: 'silver-jewellery',    label: 'Silver'         },
  { key: 'rose-gold-jewellery', label: 'Rose Gold'      },
  { key: 'gold-plated',         label: 'Gold'           },
  { key: 'gifting',             label: 'Gifting'        },
  { key: 'birthday',            label: 'Birthday'       },
  { key: 'anniversary',         label: 'Anniversary'    },
];

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'sale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(amount: number) {
  return 'LKR\u00a0' + (amount / 100).toLocaleString('en-LK', { maximumFractionDigits: 0 });
}

const CART_KEY = 'giva_cart';
type CartItem = GIVAProduct & {
  selectedVariantId: number | null;
  selectedOptions: Record<string, string>;
  qty: number;
};

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('giva_cart_updated'));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-muted mb-3" />
      <div className="h-2.5 w-20 rounded bg-muted mb-1.5" />
      <div className="h-3.5 w-3/4 rounded bg-muted mb-2" />
      <div className="h-3 w-1/3 rounded bg-muted" />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: GIVAProduct }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIndex,   setImgIndex]   = useState(0);

  const discount = product.compareAtPrice && product.onSale
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col">
      <Link
        href={'/stores/giva/' + product.handle}
        className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-square mb-3 block"
        onMouseEnter={() => product.images.length > 1 && setImgIndex(1)}
        onMouseLeave={() => setImgIndex(0)}
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[imgIndex] ?? product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Gem size={32} />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500 text-white">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
              Sold out
            </span>
          )}
        </div>

        {product.collectionLabel && (
          <div className="absolute top-3 right-3">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground/70 whitespace-nowrap">
              {product.collectionLabel}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={e => { e.preventDefault(); setWishlisted(v => !v); }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
            hover:bg-white dark:hover:bg-background z-10"
        >
          <Heart size={14} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-foreground'} />
        </button>

        <div className="absolute bottom-3 left-3 right-12 py-2 bg-white/90 dark:bg-background/90
          backdrop-blur-sm text-foreground text-xs font-bold rounded-xl text-center pointer-events-none
          translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          View details
        </div>
      </Link>

      <Link href={'/stores/giva/' + product.handle} className="flex flex-col flex-1 hover:opacity-75 transition-opacity">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
          {product.collectionLabel}
        </p>
        <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2">
          {product.name}
        </p>

        {product.metalColours.length > 0 && (
          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
            {product.metalColours.slice(0, 4).map(c => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
                {c}
              </span>
            ))}
            {product.metalColours.length > 4 && (
              <span className="text-[9px] text-muted-foreground">+{product.metalColours.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">{fmtPrice(product.price)}</span>
            {product.compareAtPrice && product.onSale && (
              <span className="text-[10px] text-muted-foreground line-through">{fmtPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Mini Cart ────────────────────────────────────────────────────────────────

function MiniCart({ items, onClose, onClear }: { items: CartItem[]; onClose: () => void; onClear: () => void }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const WA    = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+94755354830').replace(/\D/g, '');

  const lines = items.map(i => {
    const opts = Object.entries(i.selectedOptions).map(([k, v]) => k + ': ' + v).join(', ');
    return '\u2022 ' + i.name + (opts ? ' (' + opts + ')' : '') + ' x' + i.qty + ' \u2014 ' + fmtPrice(i.price * i.qty);
  }).join('\n');

  const whatsappText = encodeURIComponent(
    'Hi! I\'d like to order from GIVA Sri Lanka\n\n' + lines +
    '\n\nTotal: ' + fmtPrice(total) + '\n\nPlease confirm availability and delivery. Thank you!'
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">
            Your bag <span className="text-muted-foreground font-normal">({items.reduce((s, i) => s + i.qty, 0)})</span>
          </h3>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Gem size={32} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Your bag is empty</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add some sparkle</p>
            </div>
          ) : items.map((item, idx) => (
            <div key={item.id + '-' + idx} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-secondary/40" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">{item.collectionLabel}</p>
                <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                {Object.keys(item.selectedOptions).length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {Object.entries(item.selectedOptions).map(([k, v]) => k + ': ' + v).join(' · ')}
                  </p>
                )}
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {fmtPrice(item.price)} x {item.qty}
                </p>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-bold text-foreground">{fmtPrice(total)}</span>
            </div>
            <a href={'https://wa.me/' + WA + '?text=' + whatsappText}
              target="_blank" rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1ebe5d] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order via WhatsApp
            </a>
            <button type="button" onClick={onClear}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear bag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
// Shopify's public /products.json does not return total-count headers,
// so we detect "has next page" by fetching PER_PAGE + 1 items and checking
// whether we got the extra one back.

const PER_PAGE = 24;

function Pagination({
  page,
  hasMore,
  onPrev,
  onNext,
  onGoto,
}: {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoto: (pg: number) => void;
}) {
  if (page === 1 && !hasMore) return null;

  // Show a small window: up to 2 before current, current, and next if it exists
  const buttons: number[] = [];
  for (let i = Math.max(1, page - 2); i <= page; i++) buttons.push(i);
  if (hasMore) buttons.push(page + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button type="button" disabled={page <= 1} onClick={onPrev}
        className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-1">
        {page > 3 && (
          <>
            <button type="button" onClick={() => onGoto(1)}
              className="w-9 h-9 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
              1
            </button>
            <span className="text-muted-foreground text-sm px-1">&hellip;</span>
          </>
        )}
        {buttons.map(pg => (
          <button key={pg} type="button" onClick={() => onGoto(pg)}
            className={
              'w-9 h-9 rounded-xl text-sm font-medium transition-all ' +
              (page === pg ? 'bg-foreground text-background' : 'hover:bg-secondary text-muted-foreground')
            }>
            {pg}
          </button>
        ))}
        {hasMore && <span className="text-muted-foreground text-sm px-1">&hellip;</span>}
      </div>

      <button type="button" disabled={!hasMore} onClick={onNext}
        className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GIVAPage() {
  const [collection,  setCollection]  = useState('');
  const [sortBy,      setSortBy]      = useState<SortKey>('newest');
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [products,   setProducts]     = useState<GIVAProduct[]>([]);
  const [hasMore,    setHasMore]      = useState(false);
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState<string | null>(null);

  const [cart,       setCart]         = useState<CartItem[]>([]);
  const [cartOpen,   setCartOpen]     = useState(false);
  const [showSort,   setShowSort]     = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setCart(readCart());
    const sync = () => setCart(readCart());
    window.addEventListener('giva_cart_updated', sync);
    return () => window.removeEventListener('giva_cart_updated', sync);
  }, []);

  const clearCart = () => { writeCart([]); setCart([]); };

  const fetchProducts = useCallback(async (col: string, pg: number, q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);

    try {
      // Request one extra item so we can detect whether there is a next page
      const params = new URLSearchParams({ page: String(pg), per_page: String(PER_PAGE + 1) });
      if (col) params.set('collection', col);
      if (q)   params.set('search', q);

      const res = await fetch('/api/giva?' + params.toString(), { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? 'HTTP ' + res.status);
      }
      const data = await res.json() as GIVAApiResponse;

      const more    = data.products.length > PER_PAGE;
      const trimmed = more ? data.products.slice(0, PER_PAGE) : data.products;

      let sorted = [...trimmed];
      if (sortBy === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
      if (sortBy === 'sale')       sorted.sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0));

      setProducts(sorted);
      setHasMore(more);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => { fetchProducts(collection, page, search); }, [collection, page, search, fetchProducts]);

  const handleCollection = (col: string) => { setCollection(col); setPage(1); };
  const handleSearch     = () => { setSearch(searchInput); setPage(1); };
  const goToPage         = (pg: number) => { setPage(pg); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const cartQty = cart.reduce((s, i) => s + i.qty, 0);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'newest',     label: 'Newest'         },
    { key: 'sale',       label: 'On sale first'   },
    { key: 'price-asc',  label: 'Price: low-high' },
    { key: 'price-desc', label: 'Price: high-low' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">GIVA Sri Lanka</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {COLLECTION_FILTERS.slice(0, 10).map(c => (
              <button key={c.key} type="button" onClick={() => handleCollection(c.key)}
                className={
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ' +
                  (collection === c.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary')
                }>
                {c.label}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors shrink-0">
            <ShoppingBag size={13} />
            <span className="text-xs font-semibold text-foreground">Bag</span>
            {cartQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                {cartQty}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* ── Hero ── */}
          <div className="mb-10 sm:mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/store-icon/giva.png" alt="GIVA Sri Lanka" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-foreground tracking-tight">GIVA SRI LANKA</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground uppercase tracking-wider">
                    Live inventory
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Real-time stock · Free island-wide shipping</p>
              </div>
            </div>

            <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3 max-w-lg">
              Fine jewellery for<br />every occasion.
            </p>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              925 silver, rose gold and gold-plated pendants, rings, earrings, bracelets and more.
              Live catalogue from GIVA Sri Lanka.
            </p>

            <div className="flex items-center gap-6 flex-wrap">
              {[
                { icon: <Sparkles size={13} />, label: 'New arrivals weekly'       },
                { icon: <Gem size={13} />,      label: '925 silver and gold plated' },
                { icon: <Truck size={13} />,    label: 'Free island-wide delivery' },
                { icon: <Zap size={13} />,      label: 'COD available'             },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-foreground">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile collection scroll ── */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 sm:-mx-10 sm:px-10 pb-1">
            {COLLECTION_FILTERS.map(c => (
              <button key={c.key} type="button" onClick={() => handleCollection(c.key)}
                className={
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ' +
                  (collection === c.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground')
                }>
                {c.label}
              </button>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input type="text" placeholder="Search rings, pendants, silver..." value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background
                    placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all" />
              </div>
              <button type="button" onClick={handleSearch}
                className="px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors shrink-0">
                Search
              </button>
              {search && (
                <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-sm text-muted-foreground hidden sm:block">
                <span className="text-foreground font-semibold">{products.length}</span>
                {hasMore ? '+ items' : ' items'}
              </p>
              <div className="relative">
                <button type="button" onClick={() => setShowSort(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors">
                  <ArrowUpDown size={12} />{SORT_OPTIONS.find(s => s.key === sortBy)?.label}
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1.5 bg-background border border-border rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                    {SORT_OPTIONS.map(s => (
                      <button key={s.key} type="button"
                        onClick={() => { setSortBy(s.key); setShowSort(false); }}
                        className={'w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-secondary ' + (sortBy === s.key ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Could not load products</p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <button type="button" onClick={() => fetchProducts(collection, page, search)}
                  className="mt-2 text-xs font-semibold text-foreground underline hover:no-underline">Try again</button>
              </div>
            </div>
          )}

          {/* ── Product grid ── */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 && !error ? (
            <div className="py-20 text-center text-muted-foreground">
              <Gem size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">No products found.</p>
              {(collection || search) && (
                <button type="button" onClick={() => { handleCollection(''); setSearch(''); setSearchInput(''); }}
                  className="mt-3 text-xs font-semibold text-foreground underline hover:no-underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && !error && products.length > 0 && (
            <Pagination
              page={page}
              hasMore={hasMore}
              onPrev={() => goToPage(Math.max(1, page - 1))}
              onNext={() => goToPage(page + 1)}
              onGoto={goToPage}
            />
          )}

          {/* ── Footer ── */}
          <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: 'About GIVA Sri Lanka',
                body:  'Sri Lanka\'s destination for fine silver and gold-plated jewellery. Pendants, rings, earrings, bracelets and more. Trusted quality for every occasion.',
              },
              {
                title: 'Free Delivery & COD',
                body:  'Free island-wide shipping on all orders. Cash on delivery accepted. Most orders dispatched within 2-3 working days.',
              },
              {
                title: 'How it works',
                body:  'Browse here, add to bag, then order via WhatsApp. We confirm stock with GIVA and deliver to your door.',
              },
            ].map(s => (
              <div key={s.title}>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {cartOpen && <MiniCart items={cart} onClose={() => setCartOpen(false)} onClear={clearCart} />}
    </div>
  );
}