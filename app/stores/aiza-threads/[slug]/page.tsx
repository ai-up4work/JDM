// app/brands/[slug]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Search, GridIcon, LayoutList } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Brand {
  slug: string;
  name: string;
  logo: string;
  itemCount: number;
  categories: string[];
  origin: string;
  featured: boolean;
  letter: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  rating: number | null;
  reviews: number | null;
  isNew: boolean;
  url: string;
  color: string;
  category: string;
}

type Filters = {
  search: string;
  category: string;
  sort: string;
};

const DEFAULT_FILTERS: Filters = {
  search: '', category: 'All', sort: 'Recommended',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const LOGO_PALETTES = [
  { bg: '#1a0a2e', text: '#c4b5fd' }, { bg: '#0d1f0d', text: '#86efac' },
  { bg: '#1a1205', text: '#fde68a' }, { bg: '#1c0a0a', text: '#fca5a5' },
  { bg: '#0a1a12', text: '#6ee7b7' }, { bg: '#0d1219', text: '#93c5fd' },
  { bg: '#190a0a', text: '#fdba74' }, { bg: '#12191a', text: '#67e8f9' },
  { bg: '#0a0f19', text: '#818cf8' },
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LOGO_PALETTES[Math.abs(hash) % LOGO_PALETTES.length];
}

// ── Filter Pill ───────────────────────────────────────────────────────────────

function FilterPill({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = value !== 'All' && value !== 'Recommended';

  return (
    <div ref={ref} className="relative shrink-0">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap
          ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:border-foreground/40'}`}>
        {active ? value : label}
        <ChevronRight size={12} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-2xl shadow-xl py-2 min-w-[160px]">
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-secondary
                ${value === opt ? 'font-semibold text-foreground bg-secondary/50' : 'text-muted-foreground'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Card Grid ─────────────────────────────────────────────────────────

function ProductCardGrid({ product }: { product: Product }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <a href={product.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2 min-w-0">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        {!imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}

        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
          )}
          {product.discount && product.discount > 0 && !product.isNew && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>
          )}
        </div>

        {product.color && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full capitalize">{product.color}</span>
          </div>
        )}
      </div>

      <div className="px-0.5">
        <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-sm font-bold text-foreground">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-amber-500">★ {product.rating}</span>
            {product.reviews && <span className="text-xs text-muted-foreground">({product.reviews})</span>}
          </div>
        )}
      </div>
    </a>
  );
}

// ── Product Card List ─────────────────────────────────────────────────────────

function ProductCardList({ product }: { product: Product }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <a href={product.url} target="_blank" rel="noopener noreferrer"
      className="group flex gap-4 p-3 rounded-2xl border border-border hover:border-foreground/20 hover:bg-secondary/30 transition-all">
      <div className="relative w-24 h-32 shrink-0 overflow-hidden rounded-xl bg-muted">
        {!imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} onError={() => setImgErr(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
        )}
        {product.isNew && (
          <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="text-xs text-muted-foreground">{product.brand}</p>
          <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-2">{product.name}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {product.category && (
              <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{product.category}</span>
            )}
            {product.color && (
              <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full capitalize">{product.color}</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.discount && product.discount > 0 && (
                <span className="text-xs font-semibold text-red-500">-{product.discount}%</span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-amber-500">★ {product.rating}</span>
                {product.reviews && <span className="text-xs text-muted-foreground">({product.reviews})</span>}
              </div>
            )}
          </div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-foreground bg-foreground text-background">
            View
          </span>
        </div>
      </div>
    </a>
  );
}

// ── Brand Header ──────────────────────────────────────────────────────────────

function BrandHeader({ brand, productCount }: { brand: Brand; productCount: number }) {
  const [errored, setErrored] = useState(false);
  const palette = getPalette(brand.name);

  return (
    <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl border border-border bg-secondary/20">
      <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden flex items-center justify-center border border-border"
        style={errored ? { background: palette.bg } : {}}>
        {!errored ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logo} alt={brand.name} onError={() => setErrored(true)}
            className="w-full h-full object-cover" />
        ) : (
          <span style={{ color: palette.text, fontSize: '1.25rem', fontWeight: 700 }}>
            {getInitials(brand.name)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-foreground">{brand.name}</h1>
          {brand.featured && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806] uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {productCount} products · {brand.origin}
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

export default function BrandProductsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [brand,       setBrand]       = useState<Brand | null>(null);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [filters,     setFilters]     = useState<Filters>(DEFAULT_FILTERS);
  const [viewMode,    setViewMode]    = useState<'grid' | 'list'>('grid');
  const [page,        setPage]        = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/aiza-threads/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(({ brand, products }) => { setBrand(brand); setProducts(products); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const setFilter = (key: keyof Filters) => (val: string) =>
    setFilters(f => ({ ...f, [key]: val }));

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  // Derive categories from real products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products.filter(p => {
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== 'All' && p.category !== filters.category) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === 'Price: Low to High')  return a.price - b.price;
    if (filters.sort === 'Price: High to Low')  return b.price - a.price;
    if (filters.sort === 'Top Rated')           return (b.rating ?? 0) - (a.rating ?? 0);
    if (filters.sort === 'Discount')            return (b.discount ?? 0) - (a.discount ?? 0);
    return 0;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => { setPage(1); }, [filters]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        setTimeout(() => { setPage(p => p + 1); setLoadingMore(false); }, 300);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  // ── Loading skeleton ──
  if (loading) return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-4 space-y-4">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-24 w-full bg-muted rounded-2xl animate-pulse" />
        <div className="flex gap-2">
          {[1,2,3].map(i => <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 animate-pulse">
              <div className="w-full aspect-[3/4] rounded-2xl bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error || !brand) return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-16 text-center">
        <p className="text-muted-foreground text-sm">Brand not found.</p>
        <Link href="/brands" className="mt-4 inline-block text-sm text-primary underline">Back to brands</Link>
      </div>
    </div>
  );

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 min-w-0">

        {/* Back */}
        <Link href="/brands" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ChevronLeft size={15} /> All Brands
        </Link>

        {/* Brand header */}
        <BrandHeader brand={brand} productCount={filtered.length} />

        {/* Header row */}
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Products</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} items</p>
          </div>
          <div className="hidden sm:flex items-center gap-1 border border-border rounded-xl p-1">
            <button type="button" onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
              <GridIcon size={16} />
            </button>
            <button type="button" onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutList size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={`Search ${brand.name} products...`}
            value={filters.search} onChange={e => setFilter('search')(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors" />
          {filters.search && (
            <button type="button" onClick={() => setFilter('search')('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          <FilterPill label="Category" options={categories}
            value={filters.category} onChange={setFilter('category')} />
          <FilterPill label="Sort by"
            options={['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Discount']}
            value={filters.sort} onChange={setFilter('sort')} />
          {(filters.category !== 'All' || filters.search) && (
            <button type="button" onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors shrink-0">
              <X size={10} /> Clear
            </button>
          )}
        </div>

        {/* Category quick-tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} type="button" onClick={() => setFilter('category')(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all
                ${filters.category === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid / List */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-lg font-medium text-foreground mb-1">No products found</p>
            <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters</p>
            <button type="button" onClick={clearFilters}
              className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
              Clear filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {visible.map(p => <ProductCardGrid key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map(p => <ProductCardList key={p.id} product={p} />)}
          </div>
        )}

        {/* Loading more skeleton */}
        {loadingMore && (
          <div className={`mt-4 ${viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'
            : 'flex flex-col gap-3'}`}>
            {Array.from({ length: 4 }).map((_, i) =>
              viewMode === 'grid' ? (
                <div key={i} className="flex flex-col gap-2 animate-pulse">
                  <div className="w-full aspect-[3/4] rounded-2xl bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </div>
              ) : (
                <div key={i} className="flex gap-4 p-3 rounded-2xl border border-border animate-pulse">
                  <div className="w-24 h-32 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 py-1">
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-4 w-1/4 rounded bg-muted mt-auto" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          {!hasMore && visible.length > 0 && (
            <p className="text-sm text-muted-foreground">All {filtered.length} products shown</p>
          )}
        </div>

      </div>
    </div>
  );
}