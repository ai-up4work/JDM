'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/lib/mockData';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';

const PAGE_SIZE = 8;

const FILTER_OPTIONS = {
  sortBy:   ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Most Popular'],
  category: ['All', 'Women', 'Men', 'Kids', 'Beauty'],
  fabric:   ['All', 'Cotton', 'Silk', 'Lawn', 'Chiffon', 'Linen'],
  price:    ['All', 'Under $25', '$25–$75', '$75–$125', 'Over $125'],
  size:     ['All', 'XS', 'S', 'M', 'L', 'XL'],
  color:    ['All', 'White', 'Black', 'Green', 'Blue', 'Pink'],
  brand:    ['All', 'Khussa Darbar', 'Malhaar', 'Haseens Official', 'Fozia Khalid', 'Sana Safinaz', 'Maria B', 'Khaadi', 'Qalamkar'],
};

type Filters = {
  sortBy: string; category: string; inStock: boolean;
  fabric: string; price: string; size: string; color: string; brand: string;
};

const DEFAULT_FILTERS: Filters = {
  sortBy: 'Recommended', category: 'All', inStock: false,
  fabric: 'All', price: 'All', size: 'All', color: 'All', brand: 'All',
};

// ── Filter Dropdown ───────────────────────────────────────────────────────────

function FilterDropdown({ label, options, value, onChange }: {
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
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
          ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:bg-secondary'}`}
      >
        {active ? value : label}
        <ChevronRight size={13} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[150px] sm:min-w-[180px]">
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors
                ${value === opt ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile Filter Sheet ───────────────────────────────────────────────────────

function MobileFilterSheet({
  filters,
  setFilter,
  onClose,
  onClear,
  activeCount,
}: {
  filters: Filters;
  setFilter: (key: keyof Filters) => (val: string | boolean) => void;
  onClose: () => void;
  onClear: () => void;
  activeCount: number;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <span className="text-base font-semibold">Filters</span>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button type="button" onClick={onClear} className="text-sm text-red-500 font-medium">Clear all</button>
            )}
            <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter groups */}
        <div className="overflow-y-auto p-4 space-y-5">
          {(Object.keys(FILTER_OPTIONS) as (keyof typeof FILTER_OPTIONS)[]).map(key => (
            <div key={key}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </p>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS[key].map(opt => {
                  const val = filters[key as keyof Filters] as string;
                  const isActive = val === opt;
                  return (
                    <button key={opt} type="button"
                      onClick={() => setFilter(key as keyof Filters)(opt)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors
                        ${isActive ? 'bg-foreground text-background border-foreground' : 'border-border text-foreground hover:bg-secondary'}`}
                    >{opt}</button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* In-stock toggle */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Availability</p>
            <button type="button" onClick={() => setFilter('inStock')(!filters.inStock)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-border bg-background text-sm font-medium hover:bg-secondary transition-colors"
            >
              In-stock only
              <div className={`relative w-9 h-5 rounded-full transition-colors ${filters.inStock ? 'bg-green-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Apply button */}
        <div className="px-4 py-4 border-t border-border shrink-0">
          <button type="button" onClick={onClose}
            className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-semibold"
          >Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

// ── Search Content ────────────────────────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const setFilter = (key: keyof Filters) => (val: string | boolean) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const baseResults = useMemo(() => searchProducts(query), [query]);

  const filtered = useMemo(() => {
    let products = [...baseResults];
    if (filters.category !== 'All') products = products.filter((p) => (p as any).category === filters.category);
    if (filters.fabric   !== 'All') products = products.filter((p) => (p as any).fabric   === filters.fabric);
    if (filters.size     !== 'All') products = products.filter((p) => (p as any).size     === filters.size);
    if (filters.color    !== 'All') products = products.filter((p) => (p as any).color    === filters.color);
    if (filters.brand    !== 'All') products = products.filter((p) => (p as any).brand    === filters.brand);
    if (filters.price !== 'All') {
      products = products.filter((p) => {
        if (filters.price === 'Under $25')  return p.price < 25;
        if (filters.price === '$25–$75')    return p.price >= 25  && p.price <= 75;
        if (filters.price === '$75–$125')   return p.price >= 75  && p.price <= 125;
        if (filters.price === 'Over $125')  return p.price > 125;
        return true;
      });
    }
    switch (filters.sortBy) {
      case 'Price: Low to High': products.sort((a, b) => a.price - b.price); break;
      case 'Price: High to Low': products.sort((a, b) => b.price - a.price); break;
      case 'Top Rated':          products.sort((a, b) => b.rating - a.rating); break;
      case 'Most Popular':       products.sort((a, b) => b.reviews - a.reviews); break;
    }
    return products;
  }, [baseResults, filters]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => { setPage(1); }, [query, filters]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setLoading(true);
        setTimeout(() => { setPage((p) => p + 1); setLoading(false); }, 400);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'sortBy' && v !== 'All' && v !== false
  ).length;

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">

        {/* Header */}
        <div className="mb-5 sm:mb-6">
          {query ? (
            <>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">{filtered.length} results for</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">"{query}"</h1>
            </>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">All Products</h1>
          )}
        </div>

        {/* Mobile: filter button + sort */}
        <div className="flex sm:hidden items-center gap-2 mb-4">
          <button type="button" onClick={() => setMobileFilterOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-colors
              ${activeFilterCount > 0 ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
          >
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <FilterDropdown label="Sort By" options={FILTER_OPTIONS.sortBy} value={filters.sortBy} onChange={setFilter('sortBy')} />
          {activeFilterCount > 0 && (
            <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}
              className="px-3 py-2 rounded-full border border-red-300 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors shrink-0"
            >Clear</button>
          )}
        </div>

        {/* sm+: full filter bar */}
        <div className="hidden sm:flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <FilterDropdown label="Category" options={FILTER_OPTIONS.category} value={filters.category} onChange={setFilter('category')} />
          <button type="button"
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border shrink-0 transition-colors
              ${activeFilterCount > 0 ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-secondary'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
              <circle cx="8"  cy="6"  r="2" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
              <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
            </svg>
          </button>
          <FilterDropdown label="Sort By" options={FILTER_OPTIONS.sortBy} value={filters.sortBy} onChange={setFilter('sortBy')} />
          <button type="button" onClick={() => setFilter('inStock')(!filters.inStock)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-border bg-background text-xs sm:text-sm font-medium hover:bg-secondary transition-colors shrink-0"
          >
            In-stock
            <div className={`relative w-8 sm:w-9 h-4 sm:h-5 rounded-full transition-colors ${filters.inStock ? 'bg-green-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-3 sm:w-4 h-3 sm:h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
          <FilterDropdown label="Fabric" options={FILTER_OPTIONS.fabric} value={filters.fabric} onChange={setFilter('fabric')} />
          <FilterDropdown label="Price"  options={FILTER_OPTIONS.price}  value={filters.price}  onChange={setFilter('price')}  />
          <FilterDropdown label="Size"   options={FILTER_OPTIONS.size}   value={filters.size}   onChange={setFilter('size')}   />
          <FilterDropdown label="Color"  options={FILTER_OPTIONS.color}  value={filters.color}  onChange={setFilter('color')}  />
          <FilterDropdown label="Brands" options={FILTER_OPTIONS.brand}  value={filters.brand}  onChange={setFilter('brand')}  />
          {activeFilterCount > 0 && (
            <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}
              className="px-3 sm:px-4 py-2 rounded-full border border-red-300 text-red-500 text-xs sm:text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
            >Clear ({activeFilterCount})</button>
          )}
        </div>

        {/* Results */}
        {visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-base sm:text-lg text-muted-foreground mb-2">
              {query ? `No results for "${query}"` : 'No products match your filters.'}
            </p>
            <p className="text-sm text-muted-foreground">Try different keywords or adjust your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {visible.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="group flex flex-col gap-2 min-w-0">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={(product as any).image || `/garments/product${(Number(product.id) % 16) + 1}.jpeg`}
                    alt={product.name} fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  {(product as any).discount && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        -{(product as any).discount}%
                      </span>
                    </div>
                  )}
                  <button type="button" onClick={(e) => e.preventDefault()}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>

                <div className="flex items-start justify-between gap-1 sm:gap-2 px-0.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-foreground">$ {product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through hidden sm:inline">$ {product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{product.brand} • {product.name}</p>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-1.5 flex-wrap">
                      {(product as any).express ? (
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200">⚡ Express</span>
                      ) : (
                        <span className="flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-gray-200">➜ 7 Days</span>
                      )}
                      <span className="text-xs text-muted-foreground hidden sm:inline">★ {product.rating} ({product.reviews})</span>
                    </div>
                  </div>
                  <button type="button" onClick={(e) => e.preventDefault()}
                    className="shrink-0 p-1.5 sm:p-2 rounded-xl border border-border hover:bg-secondary transition-colors mt-0.5 hidden xs:flex"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mt-3 sm:mt-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 animate-pulse">
                <div className="w-full aspect-[3/4] rounded-2xl bg-muted" />
                <div className="px-0.5 flex flex-col gap-1.5">
                  <div className="h-4 w-16 rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-5 w-20 rounded-full bg-muted mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="mt-8 flex justify-center">
          {!hasMore && visible.length > 0 && (
            <p className="text-sm text-muted-foreground">
              You've seen all {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFilterOpen && (
        <MobileFilterSheet
          filters={filters}
          setFilter={setFilter}
          onClose={() => setMobileFilterOpen(false)}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          activeCount={activeFilterCount}
        />
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">
        <div className="h-4 w-28 bg-muted rounded animate-pulse mb-2" />
        <div className="h-8 w-56 bg-muted rounded-lg animate-pulse mb-6" />
        <div className="flex gap-2 mb-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-20 sm:w-24 bg-muted rounded-full animate-pulse shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}