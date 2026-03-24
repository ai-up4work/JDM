// app/stores/kingdom-of-rings/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronLeft, ShoppingBag, Heart, Star,
  X, ArrowUpDown, Truck, Shield, AlertCircle, Search, Crown, Gem,
} from 'lucide-react';
import type { KORProduct, KORApiResponse } from '@/lib/kor.types';

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: '',          label: 'All'       },
  { key: 'chains',    label: 'Chains'    },
  { key: 'bracelets', label: 'Bracelets' },
  { key: 'rings',     label: 'Rings'     },
  { key: 'bridal',    label: 'Bridal'    },
  { key: 'bangles',   label: 'Bangles'   },
  { key: 'earrings',  label: 'Earrings'  },
  { key: 'pendants',  label: 'Pendants'  },
  { key: 'necklaces', label: 'Necklaces' },
];

type SortKey = 'popularity' | 'price-asc' | 'price-desc' | 'sale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(lkr: number) {
  return `Rs. ${lkr.toLocaleString()}`;
}

const CART_KEY = 'kor_cart';
type CartItem = KORProduct & { selectedSize?: string | null; selectedColor?: string | null; qty: number };

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('kor_cart_updated'));
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

function ProductCard({ product }: { product: KORProduct }) {
  const [wishlisted, setWishlisted] = useState(false);
  const discount = product.originalPrice && product.onSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col">
      <Link href={`/stores/kingdom-of-rings/${product.slug}`}
        className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-square mb-3 block">

        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Crown size={32} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
              −{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/80 text-background">
              Sold out
            </span>
          )}
          {product.category === 'bridal' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
              Bridal
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button type="button" onClick={e => { e.preventDefault(); setWishlisted(v => !v); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
            hover:bg-white dark:hover:bg-background z-10">
          <Heart size={14} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-foreground'} />
        </button>

        {/* Hover CTA */}
        <div className="absolute bottom-3 left-3 right-3 py-2.5 bg-white/90 dark:bg-background/90
          backdrop-blur-sm text-foreground text-xs font-bold rounded-xl text-center pointer-events-none
          translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          View details →
        </div>
      </Link>

      <Link href={`/stores/kingdom-of-rings/${product.slug}`} className="flex flex-col flex-1 hover:opacity-75 transition-opacity">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
          {product.categoryLabel}
        </p>
        <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">{fmtPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">{fmtPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-muted-foreground">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

// ─── Mini Cart ────────────────────────────────────────────────────────────────

function MiniCart({ items, onClose, onClear }: { items: CartItem[]; onClose: () => void; onClear: () => void }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const WA    = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+94755354830').replace(/\D/g, '');

  const whatsappText = encodeURIComponent(
    `Hi Kingdom of Rings! 👑 I'd like to order:\n\n` +
    items.map(i =>
      `• ${i.name}${i.selectedSize ? ` (${i.selectedSize})` : ''}${i.selectedColor ? ` — ${i.selectedColor}` : ''} × ${i.qty} — ${fmtPrice(i.price * i.qty)}`
    ).join('\n') +
    `\n\nTotal: ${fmtPrice(total)}\n\nPlease confirm availability and delivery. Thank you!`
  );

  const freeShipRemaining = Math.max(0, 8900 - total);

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

        {/* Free shipping progress */}
        {freeShipRemaining > 0 ? (
          <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-1.5">
              Add <strong>{fmtPrice(freeShipRemaining)}</strong> more for free delivery 🚚
            </p>
            <div className="h-1.5 rounded-full bg-amber-200 dark:bg-amber-900/40 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (total / 8900) * 100)}%` }} />
            </div>
          </div>
        ) : total > 0 ? (
          <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/40">
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">🎉 Free island-wide delivery unlocked!</p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Crown size={32} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Your bag is empty</p>
            </div>
          ) : items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-secondary/40" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">{item.categoryLabel}</p>
                <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
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
            <a href={`https://wa.me/${WA}?text=${whatsappText}`}
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

export default function KingdomOfRingsPage() {
  const [category,    setCategory]    = useState('');
  const [sortBy,      setSortBy]      = useState<SortKey>('popularity');
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [products,    setProducts]    = useState<KORProduct[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [showSort,    setShowSort]    = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setCart(readCart());
    const sync = () => setCart(readCart());
    window.addEventListener('kor_cart_updated', sync);
    return () => window.removeEventListener('kor_cart_updated', sync);
  }, []);

  const clearCart = () => { writeCart([]); setCart([]); };

  const fetchProducts = useCallback(async (cat: string, pg: number, q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);

    try {
      const params = new URLSearchParams({ page: String(pg), per_page: '24' });
      if (cat) params.set('category', cat);
      if (q)   params.set('search', q);

      const res = await fetch(`/api/kor?${params}`, { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: KORApiResponse = await res.json();

      let sorted = [...data.products];
      if (sortBy === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
      if (sortBy === 'sale')       sorted.sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0));

      setProducts(sorted);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => { fetchProducts(category, page, search); }, [category, page, search, fetchProducts]);

  const handleCategory = (cat: string) => { setCategory(cat); setPage(1); };
  const handleSearch   = () => { setSearch(searchInput); setPage(1); };
  const cartQty = cart.reduce((s, i) => s + i.qty, 0);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'popularity', label: 'Popularity'      },
    { key: 'sale',       label: 'On sale first'   },
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
            <span className="text-foreground font-medium">Kingdom of Rings</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button" onClick={() => handleCategory(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${category === c.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
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
                <img src="/store-icon/kingdom-of-rings.png" alt="Kingdom of Rings" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-foreground tracking-tight">KINGDOM OF RINGS</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground uppercase tracking-wider">Live inventory</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Real-time stock · Ships island-wide</p>
              </div>
            </div>

            <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3 max-w-lg">
              22K gold plated jewellery<br />with 1-year warranty.
            </p>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Sri Lanka's most trusted gold plated imitation jewellery store — chains, rings, bridal sets, bracelets and more. Based in Balapitiya.
            </p>

            <div className="flex items-center gap-6 flex-wrap">
              {[
                { icon: <Crown size={13} />,  label: '22K gold plated'        },
                { icon: <Shield size={13} />, label: '1-year warranty'        },
                { icon: <Truck size={13} />,  label: 'Free ship over Rs. 8,900'},
                { icon: <Gem size={13} />,    label: 'Bridal collections'     },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-foreground">{b.icon}</span>{b.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile category scroll ── */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 sm:-mx-10 sm:px-10 pb-1">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button" onClick={() => handleCategory(c.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all
                  ${category === c.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input type="text" placeholder="Search Kingdom of Rings…" value={searchInput}
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
                <span className="text-foreground font-semibold">{total}</span> items
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
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-secondary ${sortBy === s.key ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
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
                <button type="button" onClick={() => fetchProducts(category, page, search)}
                  className="mt-2 text-xs font-semibold text-foreground underline hover:no-underline">Try again</button>
              </div>
            </div>
          )}

          {/* ── Product grid ── */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
              {Array.from({ length: 15 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 && !error ? (
            <div className="py-20 text-center text-muted-foreground">
              <Crown size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">No products found.</p>
              {(category || search) && (
                <button type="button" onClick={() => { handleCategory(''); setSearch(''); setSearchInput(''); }}
                  className="mt-3 text-xs font-semibold text-foreground underline hover:no-underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button key={pg} type="button" onClick={() => setPage(pg)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === pg ? 'bg-foreground text-background' : 'hover:bg-secondary text-muted-foreground'}`}>
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && <span className="text-muted-foreground px-1">…</span>}
              </div>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'About Kingdom of Rings', body: 'Original Kingdom of Rings pieces resold locally. Sri Lanka\'s most trusted gold plated imitation jewellery — 22K gold plated chains, bracelets, rings and bridal sets with 1-year warranty.' },
              { title: 'Free delivery',           body: 'Free island-wide delivery on orders over Rs. 8,900. All orders dispatched within 1–2 working days. Cash on delivery available.' },
              { title: 'How it works',            body: 'Browse here, add to bag, order via WhatsApp. We confirm stock with Kingdom of Rings and deliver locally — fast.' },
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