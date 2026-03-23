// app/stores/old-money/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronLeft, ShoppingBag, Heart, Star,
  X, ArrowUpDown, Truck, RefreshCw, Shield, AlertCircle, Search,
} from 'lucide-react';
import type { OMProduct, OMApiResponse } from '@/lib/oldmoney.types';

// ─── Collections ──────────────────────────────────────────────────────────────

const COLLECTIONS = [
  { key: 'all-products',       label: 'All',        gender: 'all'   },
  { key: 'bestsellers',        label: 'Bestsellers', gender: 'all'  },
  { key: 'tops',               label: 'Tops',        gender: 'men'  },
  { key: 'old-money-polos',    label: 'Polos',       gender: 'men'  },
  { key: 'old-money-cashmere', label: 'Cashmere',    gender: 'men'  },
  { key: 'linen',              label: 'Linen',       gender: 'men'  },
  { key: 'fw25',               label: 'FW25',        gender: 'men'  },
  { key: 'old-money-shoes',    label: 'Shoes',       gender: 'men'  },
  { key: 'accessories',        label: 'Accessories', gender: 'men'  },
  { key: 'women',              label: 'Women',       gender: 'women'},
  { key: 'women-shoes',        label: 'Women Shoes', gender: 'women'},
  { key: 'women-handbags',     label: 'Handbags',    gender: 'women'},
];

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'sale';
type GenderFilter = 'all' | 'men' | 'women';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Prices are stored as cents, display as USD
function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const CART_KEY = 'om_cart';
type CartItem = OMProduct & { selectedSize?: string | null; selectedColor?: string | null; qty: number };

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('om_cart_updated'));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-muted mb-3" />
      <div className="h-2.5 w-16 rounded bg-muted mb-1.5" />
      <div className="h-3.5 w-3/4 rounded bg-muted mb-2" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: OMProduct }) {
  const [wishlisted, setWishlisted] = useState(false);
  const discount = product.originalPrice && product.onSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col">
      <Link href={`/stores/old-money/${product.handle}`}
        className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-[3/4] mb-3 block">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <ShoppingBag size={32} />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-foreground text-background">
              −{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
              Sold out
            </span>
          )}
        </div>

        <button type="button" onClick={e => { e.preventDefault(); setWishlisted(v => !v); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
            hover:bg-white dark:hover:bg-background z-10">
          <Heart size={14} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 py-2.5 bg-white/90 dark:bg-background/90
          backdrop-blur-sm text-foreground text-xs font-bold rounded-xl text-center pointer-events-none
          translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          View details →
        </div>
      </Link>

      <Link href={`/stores/old-money/${product.handle}`} className="flex flex-col flex-1 hover:opacity-75 transition-opacity">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">{product.category}</p>
        <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2">{product.title}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">{fmtPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">{fmtPrice(product.originalPrice)}</span>
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

  const whatsappText = encodeURIComponent(
    `Hi, I'd like to order the following from Old Money:\n\n` +
    items.map(i =>
      `• ${i.title}${i.selectedSize ? ` (${i.selectedSize})` : ''}${i.selectedColor ? ` — ${i.selectedColor}` : ''} × ${i.qty} — ${fmtPrice(i.price * i.qty)}`
    ).join('\n') +
    `\n\nTotal: ${fmtPrice(total)}\n\nPlease confirm availability and delivery. Thank you!`
  );
  const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+94755354830').replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Your bag ({items.reduce((s, i) => s + i.qty, 0)})</h3>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={32} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Your bag is empty</p>
            </div>
          ) : items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-secondary/40" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">{item.category}</p>
                <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                {(item.selectedSize || item.selectedColor) && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {fmtPrice(item.price)} × {item.qty}
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
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OldMoneyPage() {
  const [collection, setCollection] = useState('all-products');
  const [sortBy,     setSortBy]     = useState<SortKey>('default');
  const [page,       setPage]       = useState(1);

  const [products,   setProducts]   = useState<OMProduct[]>([]);
  const [hasMore,    setHasMore]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [cart,       setCart]       = useState<CartItem[]>([]);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [showSort,   setShowSort]   = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setCart(readCart());
    const sync = () => setCart(readCart());
    window.addEventListener('om_cart_updated', sync);
    return () => window.removeEventListener('om_cart_updated', sync);
  }, []);

  const clearCart = () => { writeCart([]); setCart([]); };

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (col: string, pg: number) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ collection: col, page: String(pg), per_page: '24' });
      const res = await fetch(`/api/oldmoney?${params}`, { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: OMApiResponse = await res.json();

      let sorted = [...data.products];
      if (sortBy === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
      if (sortBy === 'sale')       sorted.sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0));

      setProducts(sorted);
      setHasMore(data.hasMore);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => { fetchProducts(collection, page); }, [collection, page, fetchProducts]);

  const handleCollection = (col: string) => { setCollection(col); setPage(1); };

  const cartQty = cart.reduce((s, i) => s + i.qty, 0);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'default',    label: 'Default'        },
    { key: 'sale',       label: 'On sale first'  },
    { key: 'price-asc',  label: 'Price: low–high' },
    { key: 'price-desc', label: 'Price: high–low' },
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
            <span className="text-foreground font-medium">Old Money</span>
          </div>

          {/* Collection pills — desktop */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {COLLECTIONS.map(c => (
              <button key={c.key} type="button" onClick={() => handleCollection(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${collection === c.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Cart */}
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
            <img 
                src="/store-icon/old-money.png" 
                alt="Old Money" 
                className="w-full h-full object-cover" 
            />
            </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-foreground tracking-tight">OLD MONEY</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground uppercase tracking-wider">
                    Live inventory
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Real-time stock from old-money.com · Ships island-wide</p>
              </div>
            </div>

            <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3 max-w-lg">
              Dress with class,<br />for less.
            </p>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Timeless classy clothing for men and women. Cashmere, linen, polos, loafers and more — pulled live from Old Money's full catalogue.
            </p>

            <div className="flex items-center gap-6 flex-wrap">
              {[
                { icon: <Truck size={13} />,    label: 'Island-wide delivery' },
                { icon: <RefreshCw size={13} />, label: 'Live inventory'       },
                { icon: <Shield size={13} />,   label: '100% authentic'       },
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
            {COLLECTIONS.map(c => (
              <button key={c.key} type="button" onClick={() => handleCollection(c.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all
                  ${collection === c.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{products.length}</span> items
              {hasMore && <span> (more available)</span>}
            </p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button type="button" onClick={() => setShowSort(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors">
                  <ArrowUpDown size={12} />
                  {SORT_OPTIONS.find(s => s.key === sortBy)?.label}
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1.5 bg-background border border-border rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                    {SORT_OPTIONS.map(s => (
                      <button key={s.key} type="button"
                        onClick={() => { setSortBy(s.key); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-secondary
                          ${sortBy === s.key ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
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
                <p className="text-sm font-semibold text-foreground mb-0.5">Couldn't load products</p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <button type="button" onClick={() => fetchProducts(collection, page)}
                  className="mt-2 text-xs font-semibold text-foreground underline hover:no-underline">
                  Try again
                </button>
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
              <ShoppingBag size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">No products found.</p>
              <button type="button" onClick={() => handleCollection('all-products')}
                className="mt-3 text-xs font-semibold text-foreground underline hover:no-underline">
                View all
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && (page > 1 || hasMore) && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted-foreground px-2">Page {page}</span>
              <button type="button" disabled={!hasMore} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'About Old Money',  body: 'Original Old Money pieces resold locally. Cashmere, linen, polos and timeless staples — same authentic quality, delivered to your door without the international wait.' },
              { title: 'Delivery',         body: 'Island-wide delivery in 2–4 working days. Local same-day available. Cash on delivery accepted.' },
              { title: 'How it works',     body: 'Browse here, add to bag, order via WhatsApp. We bulk-buy from Old Money and deliver locally — passing on savings to you.' },
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