'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { categories, getProductsByCategory } from '@/lib/mockData';
import Link from 'next/link';
import Image from 'next/image';

// ── Filter Dropdown ───────────────────────────────────────────────────────────

function FilterDropdown({ label, options, value, onChange }: {
  label: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const active = value !== options[0].value;
  const activeLabel = options.find(o => o.value === value)?.label ?? label;
  return (
    <div ref={ref} className="relative shrink-0">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
          ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:bg-secondary'}`}
      >
        {active ? activeLabel : label}
        <ChevronRight size={13} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors
                ${value === opt.value ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >{opt.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sort options ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: 'Most Popular',       value: 'popular'    },
  { label: 'Newest',             value: 'newest'     },
  { label: 'Price: Low to High', value: 'price-low'  },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Highest Rated',      value: 'rating'     },
];

const PRICE_PRESETS = [
  { label: 'All Prices',       min: 0,    max: 100000 },
  { label: 'Under $25',        min: 0,    max: 25     },
  { label: '$25 – $75',        min: 25,   max: 75     },
  { label: '$75 – $125',       min: 75,   max: 125    },
  { label: 'Over $125',        min: 125,  max: 100000 },
];

// ── Mobile Filter Sheet ───────────────────────────────────────────────────────

function MobileFilterSheet({
  sortBy, setSortBy,
  pricePreset, setPricePreset,
  onClose,
}: {
  sortBy: string; setSortBy: (v: string) => void;
  pricePreset: number; setPricePreset: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="w-full bg-background rounded-t-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <span className="text-base font-semibold">Filters</span>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-5">
          {/* Sort */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sort By</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors
                    ${sortBy === opt.value ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
                >{opt.label}</button>
              ))}
            </div>
          </div>
          {/* Price */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Price Range</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map((p, i) => (
                <button key={p.label} type="button" onClick={() => setPricePreset(i)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors
                    ${pricePreset === i ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
                >{p.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 py-4 border-t border-border shrink-0">
          <button type="button" onClick={onClose}
            className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-semibold"
          >Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const params = useParams();
  const slug   = params.slug as string;

  const [sortBy,       setSortBy]       = useState('popular');
  const [pricePreset,  setPricePreset]  = useState(0);
  const [filterOpen,   setFilterOpen]   = useState(false);

  const category   = categories.find((c) => c.slug === slug);
  const allProducts = getProductsByCategory(slug);

  const { min: priceMin, max: priceMax } = PRICE_PRESETS[pricePreset];

  const filteredProducts = useMemo(() => {
    let products = allProducts.filter(p => p.price >= priceMin && p.price <= priceMax);
    switch (sortBy) {
      case 'price-low':  products = [...products].sort((a, b) => a.price - b.price);    break;
      case 'price-high': products = [...products].sort((a, b) => b.price - a.price);    break;
      case 'rating':     products = [...products].sort((a, b) => b.rating - a.rating);  break;
      case 'popular':    products = [...products].sort((a, b) => b.reviews - a.reviews); break;
    }
    return products;
  }, [allProducts, sortBy, priceMin, priceMax]);

  const activeFilterCount = (sortBy !== 'popular' ? 1 : 0) + (pricePreset !== 0 ? 1 : 0);

  if (!category) {
    return (
      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-20 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">Category not found</h1>
          <p className="text-muted-foreground text-sm">The category you're looking for doesn't exist.</p>
          <Link href="/" className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Back to home <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 min-w-0">

        {/* ── Header ── */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-1">{category.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{filteredProducts.length} products</p>
        </div>

        {/* ── Mobile: filter button ── */}
        <div className="flex sm:hidden items-center gap-2 mb-4">
          <button type="button" onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-colors
              ${activeFilterCount > 0 ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
          >
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <FilterDropdown
            label="Sort By"
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
          />
          {activeFilterCount > 0 && (
            <button type="button" onClick={() => { setSortBy('popular'); setPricePreset(0); }}
              className="px-3 py-2 rounded-full border border-red-300 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors shrink-0"
            >Clear</button>
          )}
        </div>

        {/* ── sm+: full filter bar ── */}
        <div className="hidden sm:flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button type="button"
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border shrink-0 transition-colors
              ${activeFilterCount > 0 ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-secondary'}`}
          >
            <SlidersHorizontal size={15} />
          </button>

          <FilterDropdown label="Sort By" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />

          {/* Price preset pills */}
          {PRICE_PRESETS.map((p, i) => (
            <button key={p.label} type="button" onClick={() => setPricePreset(i)}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                ${pricePreset === i && i !== 0
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-secondary'}`}
            >{p.label}</button>
          ))}

          {activeFilterCount > 0 && (
            <button type="button" onClick={() => { setSortBy('popular'); setPricePreset(0); }}
              className="px-3 sm:px-4 py-2 rounded-full border border-red-300 text-red-500 text-xs sm:text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
            >Clear ({activeFilterCount})</button>
          )}
        </div>

        {/* ── Products grid ── */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col gap-2 min-w-0">
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
                  <button type="button" onClick={e => e.preventDefault()}
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
                  <button type="button" onClick={e => e.preventDefault()}
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
        ) : (
          <div className="text-center py-20">
            <p className="text-base sm:text-lg text-muted-foreground mb-2">No products found in this price range.</p>
            <button type="button"
              onClick={() => { setSortBy('popular'); setPricePreset(0); }}
              className="mt-4 px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >Reset Filters</button>
          </div>
        )}

      </div>

      {/* Mobile filter sheet */}
      {filterOpen && (
        <MobileFilterSheet
          sortBy={sortBy} setSortBy={setSortBy}
          pricePreset={pricePreset} setPricePreset={setPricePreset}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}