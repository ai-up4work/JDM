'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/lib/mockData';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const PAGE_SIZE = 8;

const FILTER_OPTIONS = {
  sortBy:    ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Most Popular'],
  category:  ['All', 'Women', 'Men', 'Kids', 'Beauty'],
  fabric:    ['All', 'Cotton', 'Silk', 'Lawn', 'Chiffon', 'Linen'],
  price:     ['All', 'Under $25', '$25–$75', '$75–$125', 'Over $125'],
  size:      ['All', 'XS', 'S', 'M', 'L', 'XL'],
  color:     ['All', 'White', 'Black', 'Green', 'Blue', 'Pink'],
  brand:     ['All', 'Khussa Darbar', 'Malhaar', 'Haseens Official', 'Fozia Khalid', 'Sana Safinaz', 'Maria B', 'Khaadi', 'Qalamkar'],
};

type Filters = {
  sortBy: string;
  category: string;
  inStock: boolean;
  fabric: string;
  price: string;
  size: string;
  color: string;
  brand: string;
};

const DEFAULT_FILTERS: Filters = {
  sortBy: 'Recommended', category: 'All', inStock: false,
  fabric: 'All', price: 'All', size: 'All', color: 'All', brand: 'All',
};

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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap
          ${active
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-background text-foreground hover:bg-muted'}`}
      >
        {active ? value : label}
        <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[180px]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors
                ${value === opt ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const setFilter = (key: keyof Filters) => (val: string | boolean) =>
    setFilters((f) => ({ ...f, [key]: val }));

  // Get base results from search
  const baseResults = useMemo(() => searchProducts(query), [query]);

  // Apply filters + sort
  const filtered = useMemo(() => {
    let products = [...baseResults];

    if (filters.category !== 'All') products = products.filter((p) => (p as any).category === filters.category);
    if (filters.fabric !== 'All')   products = products.filter((p) => (p as any).fabric   === filters.fabric);
    if (filters.size !== 'All')     products = products.filter((p) => (p as any).size     === filters.size);
    if (filters.color !== 'All')    products = products.filter((p) => (p as any).color    === filters.color);
    if (filters.brand !== 'All')    products = products.filter((p) => (p as any).brand    === filters.brand);

    if (filters.price !== 'All') {
      products = products.filter((p) => {
        if (filters.price === 'Under $25')   return p.price < 25;
        if (filters.price === '$25–$75')     return p.price >= 25  && p.price <= 75;
        if (filters.price === '$75–$125')    return p.price >= 75  && p.price <= 125;
        if (filters.price === 'Over $125')   return p.price > 125;
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

  // Reset page on query/filter change
  useEffect(() => { setPage(1); }, [query, filters]);

  // Infinite scroll
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
    <div className="w-full px-10 py-8">

      {/* ── Header ── */}
      <div className="mb-6">
        {query ? (
          <>
            <p className="text-sm text-muted-foreground mb-1">
              {filtered.length} results for
            </p>
            <h1 className="text-3xl font-semibold text-foreground">"{query}"</h1>
          </>
        ) : (
          <h1 className="text-3xl font-semibold text-foreground">All Products</h1>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>

        {/* Category */}
        <FilterDropdown label="Category" options={FILTER_OPTIONS.category} value={filters.category} onChange={setFilter('category')} />

        {/* Tune icon */}
        <button
          type="button"
          className={`flex items-center justify-center w-10 h-10 rounded-full border shrink-0 transition-colors
            ${activeFilterCount > 0 ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-muted'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8"  cy="6"  r="2" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
          </svg>
        </button>

        <FilterDropdown label="Sort By" options={FILTER_OPTIONS.sortBy} value={filters.sortBy} onChange={setFilter('sortBy')} />

        {/* In-stock toggle */}
        <button
          type="button"
          onClick={() => setFilter('inStock')(!filters.inStock)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-colors shrink-0"
        >
          In-stock
          <div className={`relative w-9 h-5 rounded-full transition-colors ${filters.inStock ? 'bg-green-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>

        <FilterDropdown label="Fabric"  options={FILTER_OPTIONS.fabric}  value={filters.fabric}  onChange={setFilter('fabric')}  />
        <FilterDropdown label="Price"   options={FILTER_OPTIONS.price}   value={filters.price}   onChange={setFilter('price')}   />
        <FilterDropdown label="Size"    options={FILTER_OPTIONS.size}    value={filters.size}    onChange={setFilter('size')}    />
        <FilterDropdown label="Color"   options={FILTER_OPTIONS.color}   value={filters.color}   onChange={setFilter('color')}   />
        <FilterDropdown label="Brands"  options={FILTER_OPTIONS.brand}   value={filters.brand}   onChange={setFilter('brand')}   />

        {/* Clear */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="px-4 py-2 rounded-full border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* ── Results ── */}
      {visible.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-lg text-muted-foreground mb-2">
            {query ? `No results for "${query}"` : 'No products match your filters.'}
          </p>
          <p className="text-sm text-muted-foreground">Try different keywords or adjust your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {visible.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col gap-2">
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={(product as any).image || `/garments/product${(Number(product.id) % 16) + 1}.jpeg`}
                  alt={product.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                {/* Discount badge */}
                {(product as any).discount && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      -{(product as any).discount}%
                    </span>
                  </div>
                )}
                {/* Wishlist */}
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="flex items-start justify-between gap-2 px-0.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">$ {product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">$ {product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {product.brand} • {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {(product as any).express ? (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                        ⚡ Express
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
                        ➜ 7 Days
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">★ {product.rating} ({product.reviews})</span>
                  </div>
                </div>
                {/* Add to bag */}
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="shrink-0 p-2 rounded-xl border border-border hover:bg-muted transition-colors mt-0.5"
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

      {/* ── Infinite scroll sentinel ── */}
      <div ref={sentinelRef} className="mt-10 flex justify-center min-h-[40px]">
        {loading && (
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <div className="w-5 h-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
            Loading more results…
          </div>
        )}
        {!hasMore && visible.length > 0 && (
          <p className="text-sm text-muted-foreground">
            You've seen all {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

    </div>
  );
}