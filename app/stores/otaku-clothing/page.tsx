'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronLeft, Heart,
  X, ArrowUpDown, Truck, Zap, AlertCircle, Search, Shirt,
  Flame, Sparkles,
} from 'lucide-react';
import type { OTKProduct, OTKApiResponse } from '@/lib/otaku.types';
import type { Product } from '@/lib/mockData';
import { useCartStore } from '@/lib/store';
import { StoreBagButton } from '@/components/StoreBagButton';

// ─── Categories ───────────────────────────────────────────────────────────────

const FRANCHISE_FILTERS = [
  { key: '',                   label: 'All'               },
  { key: 'attack-on-titan',    label: 'Attack on Titan'   },
  { key: 'demon-slayer',       label: 'Demon Slayer'      },
  { key: 'naruto',             label: 'Naruto'            },
  { key: 'one-piece',          label: 'One Piece'         },
  { key: 'jujutsu-kaisen',     label: 'Jujutsu Kaisen'   },
  { key: 'dragon-ball',        label: 'Dragon Ball'       },
  { key: 'my-hero-academia',   label: 'My Hero Academia'  },
  { key: 'bleach',             label: 'Bleach'            },
  { key: 'death-note',         label: 'Death Note'        },
  { key: 'chainsaw-man',       label: 'Chainsaw Man'      },
  { key: 'tokyo-revengers',    label: 'Tokyo Revengers'   },
  { key: 'solo-leveling',      label: 'Solo Leveling'     },
  { key: 'hoodies',            label: '🧥 Hoodies'       },
  { key: 't-shirts',           label: '👕 T-Shirts'      },
  { key: 'oversized',          label: '🗿 Oversized'      },
  { key: 'accessories',        label: '🎒 Accessories'    },
];

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'sale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** LKR stored as minor units (×10000). Display as Rs. X,XXX */
function fmtPrice(amount: number) {
  return `Rs.\u00a0${(amount / 10000).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
}

/** Maps an OTKProduct to the global Product shape for the cart store */
function otkToProduct(p: OTKProduct): Product {
  return {
    id:            p.id,
    name:          p.name,
    price:         p.price / 10000,
    originalPrice: p.originalPrice ? p.originalPrice / 10000 : undefined,
    image:         p.image ?? '',
    category:      p.productTypeLabel,
    seller:        'otaku-clothing',
    rating:        p.rating,
    reviews:       0,
    inStock:       p.inStock,
    sizes:         p.sizes  ?? [],
    colors:        (p as any).colors ?? [],
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-muted mb-3" />
      <div className="h-2.5 w-20 rounded bg-muted mb-1.5" />
      <div className="h-3.5 w-3/4 rounded bg-muted mb-2" />
      <div className="h-3 w-1/3 rounded bg-muted" />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: OTKProduct }) {
  const { addToCart } = useCartStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.originalPrice && product.onSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(otkToProduct(product), 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col">
      <Link
        href={`/stores/otaku-clothing/${product.slug}`}
        className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-[3/4] mb-3 block"
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Shirt size={32} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500 text-white">
              −{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
              Sold out
            </span>
          )}
        </div>

        {/* Franchise tag */}
        {product.franchise !== 'anime' && (
          <div className="absolute top-3 right-3">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground/70 whitespace-nowrap">
              {product.franchiseLabel}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={e => { e.preventDefault(); setWishlisted(v => !v); }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
            hover:bg-white dark:hover:bg-background z-10"
        >
          <Heart size={14} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'} />
        </button>

        {/* Add to cart overlay */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`absolute bottom-3 left-3 right-12 py-2 backdrop-blur-sm text-xs font-bold rounded-xl
            text-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
            transition-all duration-200 z-10
            ${added
              ? 'bg-green-500/90 text-white'
              : 'bg-white/90 dark:bg-background/90 text-foreground hover:bg-white dark:hover:bg-background'
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? '✓ Added' : 'Add to bag'}
        </button>
      </Link>

      <Link
        href={`/stores/otaku-clothing/${product.slug}`}
        className="flex flex-col flex-1 hover:opacity-75 transition-opacity"
      >
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
          {product.productTypeLabel}
        </p>
        <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2">
          {product.name}
        </p>

        {/* Size pills */}
        {product.sizes.length > 0 && (
          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
            {product.sizes.slice(0, 5).map(s => (
              <span key={s} className="text-[9px] px-1 py-0.5 rounded border border-border text-muted-foreground">
                {s}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-[9px] text-muted-foreground">+{product.sizes.length - 5}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">{fmtPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">
                {fmtPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <span className="text-amber-400 text-[10px]">★</span>
              <span className="text-[10px] text-muted-foreground">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OtakuClothingPage() {
  const [category,    setCategory]    = useState('');
  const [sortBy,      setSortBy]      = useState<SortKey>('newest');
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [products,   setProducts]   = useState<OTKProduct[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [showSort, setShowSort] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (cat: string, pg: number, q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(pg), per_page: '24' });
      if (cat) params.set('category', cat);
      if (q)   params.set('search', q);

      const res = await fetch(`/api/otaku?${params}`, { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: OTKApiResponse = await res.json();

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

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'newest',     label: 'Newest'          },
    { key: 'sale',       label: 'On sale first'   },
    { key: 'price-asc',  label: 'Price: low–high' },
    { key: 'price-desc', label: 'Price: high–low' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Otaku Clothing</span>
          </div>

          {/* Desktop franchise pill nav */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {FRANCHISE_FILTERS.slice(0, 10).map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => handleCategory(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${category === c.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Global bag button */}
          <StoreBagButton />
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* ── Hero ── */}
          <div className="mb-10 sm:mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/store-icon/otaku.png" alt="OTAKU CLOTHING SL" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-foreground tracking-tight">OTAKU CLOTHING SL</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground uppercase tracking-wider">
                    Live inventory
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Real-time stock · Ships island-wide</p>
              </div>
            </div>

            <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3 max-w-lg">
              Anime streetwear<br />for Sri Lankan fans.
            </p>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Hoodies, tees &amp; oversized fits from your favourite anime — Attack on Titan, Demon Slayer, One Piece and more. Official live catalogue from Otaku Clothing SL.
            </p>

            <div className="flex items-center gap-6 flex-wrap">
              {[
                { icon: <Flame size={13} />,    label: 'New drops weekly'         },
                { icon: <Sparkles size={13} />, label: 'Custom designs available' },
                { icon: <Truck size={13} />,    label: 'Island-wide delivery'     },
                { icon: <Zap size={13} />,      label: 'COD available'            },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-foreground">{b.icon}</span>{b.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile franchise scroll ── */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 sm:-mx-10 sm:px-10 pb-1">
            {FRANCHISE_FILTERS.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => handleCategory(c.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all
                  ${category === c.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search anime, character…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background
                    placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10
                    focus:border-foreground/30 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors shrink-0"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <p className="text-sm text-muted-foreground hidden sm:block">
                <span className="text-foreground font-semibold">{total}</span> items
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSort(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <ArrowUpDown size={12} />
                  {SORT_OPTIONS.find(s => s.key === sortBy)?.label}
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1.5 bg-background border border-border rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                    {SORT_OPTIONS.map(s => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => { setSortBy(s.key); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-secondary
                          ${sortBy === s.key ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                      >
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
                <button
                  type="button"
                  onClick={() => fetchProducts(category, page, search)}
                  className="mt-2 text-xs font-semibold text-foreground underline hover:no-underline"
                >
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
              <Shirt size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">No products found.</p>
              {(category || search) && (
                <button
                  type="button"
                  onClick={() => { handleCategory(''); setSearch(''); setSearchInput(''); }}
                  className="mt-3 text-xs font-semibold text-foreground underline hover:no-underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setPage(pg)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                        ${page === pg ? 'bg-foreground text-background' : 'hover:bg-secondary text-muted-foreground'}`}
                    >
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && <span className="text-muted-foreground px-1">…</span>}
              </div>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: 'About Otaku Clothing SL',
                body:  "Sri Lanka's home for anime streetwear — hoodies, tees and oversized fits featuring your favourite characters from Attack on Titan, Demon Slayer, One Piece and more.",
              },
              {
                title: 'Delivery & COD',
                body:  'Island-wide delivery available. Cash on delivery accepted. Most orders dispatched within 1–3 working days.',
              },
              {
                title: 'How it works',
                body:  'Browse here, add to bag, then checkout. We confirm stock and deliver locally — same or next day in your area.',
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
    </div>
  );
}