'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Search, GridIcon, LayoutList } from 'lucide-react';

// ── Mock Data (mirrors your mockData structure) ───────────────────────────────

const PRODUCTS = Array.from({ length: 64 }, (_, i) => ({
  id: i + 1,
  name: [
    'Oud Al Layl', 'Rose Musk Attar', 'Ceylon Oud', 'Jasmine Absolute',
    'Amber Noir', 'Sandalwood Pure', 'White Musk', 'Saffron Blend',
    'Royal Oud', 'Henna Floral', 'Black Seed Oil', 'Frankincense',
  ][i % 12],
  seller: [
    'Al Haramain', 'Ceylon Scents', 'Colombo Oud', 'Lanka Attar House',
    'Spice Isle', 'Pure Ceylon', 'Island Musk', 'Heritage Blends',
  ][i % 8],
  price: parseFloat((800 + Math.random() * 4200).toFixed(0)),
  originalPrice: parseFloat((1200 + Math.random() * 5000).toFixed(0)),
  discount: [10, 15, 20, 25, 30, 35, 40][i % 7],
  image: `/garments/product${(i % 16) + 1}.jpeg`,
  rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
  reviews: Math.floor(4 + Math.random() * 80),
  isNew: i % 7 === 0,
  isBestseller: i % 5 === 0,
  volume: ['3ml', '6ml', '12ml', '25ml', '50ml'][i % 5],
  category: ['Oud', 'Floral', 'Musk', 'Attar', 'Henna'][i % 5],
  scent: ['Woody', 'Floral', 'Fresh', 'Oriental', 'Citrus'][i % 5],
  gender: ['Unisex', 'Women', 'Men'][i % 3],
}));

const SELLERS = [
  { name: 'Al Haramain',       slug: 'al-haramain',       products: 24, image: '/garments/product1.jpeg',  rating: 4.9 },
  { name: 'Ceylon Scents',     slug: 'ceylon-scents',     products: 18, image: '/garments/product2.jpeg',  rating: 4.8 },
  { name: 'Colombo Oud',       slug: 'colombo-oud',       products: 31, image: '/garments/product3.jpeg',  rating: 4.7 },
  { name: 'Lanka Attar House', slug: 'lanka-attar-house', products: 15, image: '/garments/product4.jpeg',  rating: 4.9 },
  { name: 'Spice Isle',        slug: 'spice-isle',        products: 22, image: '/garments/product5.jpeg',  rating: 4.6 },
  { name: 'Pure Ceylon',       slug: 'pure-ceylon',       products: 19, image: '/garments/product6.jpeg',  rating: 4.8 },
];

const FILTER_OPTIONS = {
  category: ['All', 'Oud', 'Floral', 'Musk', 'Attar', 'Henna'],
  scent:    ['All', 'Woody', 'Floral', 'Fresh', 'Oriental', 'Citrus'],
  gender:   ['All', 'Unisex', 'Women', 'Men'],
  volume:   ['All', '3ml', '6ml', '12ml', '25ml', '50ml'],
  price:    ['All', 'Under LKR 1,000', 'LKR 1,000–2,500', 'LKR 2,500–5,000', 'Over LKR 5,000'],
  sort:     ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Newest'],
};

// ── Types ─────────────────────────────────────────────────────────────────────

type Filters = {
  search: string;
  category: string;
  scent: string;
  gender: string;
  volume: string;
  price: string;
  sort: string;
};

type Product = typeof PRODUCTS[0];

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterPill({
  label, options, value, onChange,
}: {
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
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap
          ${active
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-background text-foreground hover:border-foreground/40'
          }`}
      >
        {active ? value : label}
        <ChevronRight size={12} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-2xl shadow-xl py-2 min-w-[160px] overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-secondary
                ${value === opt ? 'font-semibold text-foreground bg-secondary/50' : 'text-muted-foreground'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCardGrid({ product }: { product: Product }) {
  const [wished, setWished] = useState(false);

  return (
    <Link href={`/shop/${product.id}`} className="group flex flex-col gap-2 min-w-0">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">NEW</span>
          )}
          {product.isBestseller && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">BESTSELLER</span>
          )}
          {!product.isNew && !product.isBestseller && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
          className="absolute top-2.5 right-2.5 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <svg viewBox="0 0 24 24" fill={wished ? '#ef4444' : 'none'} stroke={wished ? '#ef4444' : 'currentColor'} strokeWidth={1.5} className="w-4 h-4">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Volume pill */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">{product.volume}</span>
        </div>
      </div>

      <div className="px-0.5">
        <p className="text-xs text-muted-foreground truncate">{product.seller}</p>
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-1 mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-sm font-bold text-foreground">LKR {product.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground line-through">LKR {product.originalPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-amber-500">★ {product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
      </div>
    </Link>
  );
}

function ProductCardList({ product }: { product: Product }) {
  const [wished, setWished] = useState(false);

  return (
    <Link href={`/shop/${product.id}`} className="group flex gap-4 p-3 rounded-2xl border border-border hover:border-foreground/20 hover:bg-secondary/30 transition-all">
      <div className="relative w-24 h-32 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image src={product.image} alt={product.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        {product.isNew && (
          <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{product.seller}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{product.name}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
              className="shrink-0 p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <svg viewBox="0 0 24 24" fill={wished ? '#ef4444' : 'none'} stroke={wished ? '#ef4444' : 'currentColor'} strokeWidth={1.5} className="w-4 h-4">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{product.category}</span>
            <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{product.volume}</span>
            <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{product.gender}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-foreground">LKR {product.price.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground line-through">LKR {product.originalPrice.toLocaleString()}</span>
              <span className="text-xs font-semibold text-red-500">-{product.discount}%</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-amber-500">★ {product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-foreground bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Featured Sellers Strip ─────────────────────────────────────────────────

function FeaturedSellers({ activeSeller, onSelect }: {
  activeSeller: string; onSelect: (name: string) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">Featured Sellers</h2>
        <Link href="/sellers" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          type="button"
          onClick={() => onSelect('All')}
          className={`shrink-0 flex flex-col items-center gap-1.5 transition-all ${activeSeller === 'All' ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
        >
          <div className="w-14 h-14 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-lg">
            🛍️
          </div>
          <span className="text-[10px] font-medium text-foreground whitespace-nowrap">All</span>
        </button>
        {SELLERS.map((seller) => (
          <button
            key={seller.slug}
            type="button"
            onClick={() => onSelect(seller.name)}
            className={`shrink-0 flex flex-col items-center gap-1.5 transition-all ${activeSeller === seller.name ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
          >
            <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-colors ${activeSeller === seller.name ? 'border-foreground' : 'border-transparent'}`}>
              <Image src={seller.image} alt={seller.name} fill className="object-cover" />
            </div>
            <span className="text-[10px] font-medium text-foreground whitespace-nowrap max-w-[60px] truncate">{seller.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Active Filter Tags ────────────────────────────────────────────────────────

function ActiveFilters({ filters, onRemove, onClear }: {
  filters: Filters;
  onRemove: (key: keyof Filters) => void;
  onClear: () => void;
}) {
  const active = Object.entries(filters).filter(([k, v]) =>
    k !== 'sort' && k !== 'search' && v !== 'All' && v !== ''
  );
  if (active.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="text-xs text-muted-foreground">Filters:</span>
      {active.map(([key, val]) => (
        <button
          key={key}
          type="button"
          onClick={() => onRemove(key as keyof Filters)}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors"
        >
          {val} <X size={10} />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: Filters = {
  search: '', category: 'All', scent: 'All',
  gender: 'All', volume: 'All', price: 'All', sort: 'Recommended',
};

export default function ShopPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [activeSeller, setActiveSeller] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const setFilter = (key: keyof Filters) => (val: string) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const removeFilter = (key: keyof Filters) =>
    setFilters((f) => ({ ...f, [key]: DEFAULT_FILTERS[key] }));

  const clearFilters = () => { setFilters(DEFAULT_FILTERS); setActiveSeller('All'); };

  // Apply filters
  const filtered = PRODUCTS.filter((p) => {
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !p.seller.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== 'All' && p.category !== filters.category) return false;
    if (filters.scent    !== 'All' && p.scent    !== filters.scent)    return false;
    if (filters.gender   !== 'All' && p.gender   !== filters.gender)   return false;
    if (filters.volume   !== 'All' && p.volume   !== filters.volume)   return false;
    if (activeSeller     !== 'All' && p.seller   !== activeSeller)     return false;
    if (filters.price !== 'All') {
      if (filters.price === 'Under LKR 1,000'      && p.price >= 1000)                    return false;
      if (filters.price === 'LKR 1,000–2,500'      && (p.price < 1000 || p.price > 2500)) return false;
      if (filters.price === 'LKR 2,500–5,000'      && (p.price < 2500 || p.price > 5000)) return false;
      if (filters.price === 'Over LKR 5,000'        && p.price <= 5000)                    return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sort === 'Price: Low to High')  return a.price - b.price;
    if (filters.sort === 'Price: High to Low')  return b.price - a.price;
    if (filters.sort === 'Top Rated')           return b.rating - a.rating;
    if (filters.sort === 'Newest')              return b.id - a.id;
    return 0;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => { setPage(1); }, [filters, activeSeller]);

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

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k !== 'sort' && k !== 'search' && v !== 'All' && v !== ''
  ).length + (activeSeller !== 'All' ? 1 : 0);

  return (
    <div className="w-full min-w-0 overflow-x-hidden max-w-7xl sm:px-6 lg:px-40 px-4">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 min-w-0">

        {/* ── Page Header ── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium">Shop</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">All Products</h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} products</p>
            </div>
            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 border border-border rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <GridIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search perfumes, attars, sellers..."
            value={filters.search}
            onChange={(e) => setFilter('search')(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilter('search')('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Featured Sellers ── */}
        <FeaturedSellers activeSeller={activeSeller} onSelect={setActiveSeller} />

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all shrink-0
              ${activeFilterCount > 0
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-foreground hover:border-foreground/40'
              }`}
          >
            <SlidersHorizontal size={12} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <FilterPill label="Category" options={FILTER_OPTIONS.category} value={filters.category} onChange={setFilter('category')} />
          <FilterPill label="Scent"    options={FILTER_OPTIONS.scent}    value={filters.scent}    onChange={setFilter('scent')}    />
          <FilterPill label="Gender"   options={FILTER_OPTIONS.gender}   value={filters.gender}   onChange={setFilter('gender')}   />
          <FilterPill label="Volume"   options={FILTER_OPTIONS.volume}   value={filters.volume}   onChange={setFilter('volume')}   />
          <FilterPill label="Price"    options={FILTER_OPTIONS.price}    value={filters.price}    onChange={setFilter('price')}    />
          <FilterPill label="Sort by"  options={FILTER_OPTIONS.sort}     value={filters.sort}     onChange={setFilter('sort')}     />

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors shrink-0"
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>

        {/* ── Active filter tags ── */}
        <ActiveFilters
          filters={filters}
          onRemove={removeFilter}
          onClear={clearFilters}
        />

        {/* ── Category quick-tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_OPTIONS.category.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter('category')(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all
                ${filters.category === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Product Grid / List ── */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-4xl mb-4">🧴</p>
            <p className="text-lg font-medium text-foreground mb-1">No products found</p>
            <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {visible.map((product) => (
              <ProductCardGrid key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((product) => (
              <ProductCardList key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* ── Skeleton loader ── */}
        {loading && (
          <div className={`mt-4 ${viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'
            : 'flex flex-col gap-3'
          }`}>
            {Array.from({ length: 4 }).map((_, i) =>
              viewMode === 'grid' ? (
                <div key={i} className="flex flex-col gap-2 animate-pulse">
                  <div className="w-full aspect-[3/4] rounded-2xl bg-muted" />
                  <div className="px-0.5 flex flex-col gap-1.5">
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-4 p-3 rounded-2xl border border-border animate-pulse">
                  <div className="w-24 h-32 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 py-1">
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                    <div className="h-4 w-1/4 rounded bg-muted mt-auto" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ── Infinite scroll sentinel ── */}
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          {!hasMore && visible.length > 0 && (
            <p className="text-sm text-muted-foreground">You&apos;ve seen all {filtered.length} products</p>
          )}
        </div>

      </div>
    </div>
  );
}