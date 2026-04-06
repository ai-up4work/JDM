// app/brands/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type BrandType = 'featured' | 'standard';
type FilterKey = 'all' | 'featured' | 'new' | 'women' | 'men' | 'kids';

interface Brand {
  slug: string;
  name: string;
  type: BrandType;
  isNew?: boolean;
  logo: string;
  bannerStyle: React.CSSProperties;
  categories: FilterKey[];
  description: string;
  origin: string;
  tags: string[];
  itemCount: number;
  discount?: string;
}

interface BrandsResponse {
  total: number;
  brands: Brand[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'featured', label: 'Featured' },
  { key: 'women',    label: 'Women'    },
  { key: 'men',      label: 'Men'      },
  { key: 'kids',     label: 'Kids'     },
  { key: 'new',      label: 'New'      },
];

const ALPHABET = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchBrands(params: {
  filter?: FilterKey;
  search?: string;
  letter?: string;
  featured?: boolean;
}): Promise<BrandsResponse> {
  const qs = new URLSearchParams();
  if (params.filter)             qs.set('filter',   params.filter);
  if (params.search)             qs.set('search',   params.search);
  if (params.letter)             qs.set('letter',   params.letter);
  if (params.featured != null)   qs.set('featured', String(params.featured));

  const res = await fetch(`/api/laam/brands?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
}

// ─── BrandLogo — image with initials fallback ─────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// Deterministic pastel background from brand name
const LOGO_PALETTES = [
  { bg: '#1a0a2e', text: '#c4b5fd' },
  { bg: '#0d1f0d', text: '#86efac' },
  { bg: '#1a1205', text: '#fde68a' },
  { bg: '#1c0a0a', text: '#fca5a5' },
  { bg: '#0a1a12', text: '#6ee7b7' },
  { bg: '#0d1219', text: '#93c5fd' },
  { bg: '#190a0a', text: '#fdba74' },
  { bg: '#12191a', text: '#67e8f9' },
  { bg: '#0a0f19', text: '#818cf8' },
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LOGO_PALETTES[Math.abs(hash) % LOGO_PALETTES.length];
}

interface BrandLogoProps {
  src: string;
  name: string;
  bannerStyle: React.CSSProperties;
  className?: string;
  size?: 'sm' | 'lg';   // sm = list row, lg = carousel
}

function BrandLogo({ src, name, bannerStyle, className = '', size = 'sm' }: BrandLogoProps) {
  const [errored, setErrored] = useState(false);
  const palette = getPalette(name);
  const initials = getInitials(name);
  const fontSize = size === 'lg' ? '1.25rem' : '0.8rem';

  return (
    <div
      className={`w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={errored ? { background: palette.bg } : bannerStyle}
    >
      {!errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setErrored(true)}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <span
          style={{
            color: palette.text,
            fontSize,
            fontWeight: 600,
            letterSpacing: '0.05em',
            userSelect: 'none',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CarouselCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full aspect-square rounded-2xl bg-muted animate-pulse" />
      <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3.5 px-2">
      <div className="w-11 h-11 rounded-xl bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">
        {/* Carousel skeleton */}
        <div className="mb-5 flex items-center justify-between">
          <div className="h-7 w-44 rounded-lg bg-muted animate-pulse" />
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3 mb-10 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[28vw] sm:w-[18vw] lg:w-32">
              <CarouselCardSkeleton />
            </div>
          ))}
        </div>
        {/* List skeleton */}
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 w-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-48 sm:w-72 rounded-lg bg-muted animate-pulse" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    </div>
  );
}

// ─── Featured Brands Carousel ─────────────────────────────────────────────────

function FeaturedBrandsCarousel({ activeFilter }: { activeFilter: FilterKey }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);
  const [brands,  setBrands]  = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBrands({ featured: true, filter: activeFilter === 'new' ? 'new' : activeFilter })
      .then(data => setBrands(data.brands))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeFilter]);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    setAtStart(t.scrollLeft <= 4);
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
  }, [brands]);

  const scroll = (dir: 'prev' | 'next') => {
    const t = trackRef.current;
    if (!t) return;
    const card = t.querySelector('a') as HTMLElement | null;
    const step = card ? card.offsetWidth + 12 : 160;
    t.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  const onScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    setAtStart(t.scrollLeft <= 4);
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
  };

  const items = loading
    ? Array.from({ length: 6 })
    : brands;

  if (!loading && brands.length === 0) return null;

  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Featured Brands</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('prev')}
            disabled={atStart}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('next')}
            disabled={atEnd}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-10 lg:mx-0 lg:px-0 pb-1"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 snap-start w-[28vw] sm:w-[18vw] lg:w-32">
                <CarouselCardSkeleton />
              </div>
            ))
          : brands.map(brand => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="shrink-0 snap-start flex flex-col items-center gap-2.5 group w-[28vw] sm:w-[18vw] lg:w-32"
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-border group-hover:border-primary transition-colors">
                  <BrandLogo
                    src={brand.logo}
                    name={brand.name}
                    bannerStyle={brand.bannerStyle}
                    size="lg"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  {brand.discount && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-400/90 text-amber-900 backdrop-blur-sm">
                      {brand.discount}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-snug line-clamp-2 px-1">
                  {brand.name}
                </span>
              </Link>
            ))
        }
      </div>
    </section>
  );
}

// ─── All Brands List ──────────────────────────────────────────────────────────

function AllBrands({ activeFilter }: { activeFilter: FilterKey }) {
  const [search,        setSearch]        = useState('');
  const [activeLetter,  setActiveLetter]  = useState<string | null>(null);
  const [brands,        setBrands]        = useState<Brand[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset letter when filter or search changes
  useEffect(() => { setActiveLetter(null); }, [activeFilter, debouncedSearch]);

  // Fetch from API
  useEffect(() => {
    setLoading(true);
    fetchBrands({
      filter: activeFilter,
      search: debouncedSearch,
      letter: activeLetter ?? '',
    })
      .then(data => {
        setBrands(data.brands);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeFilter, debouncedSearch, activeLetter]);

  // Group by first letter (client-side grouping of API results)
  const grouped: Record<string, Brand[]> = {};
  brands.forEach(b => {
    const first = b.name[0].toUpperCase();
    const key   = /[A-Z]/.test(first) ? first : '#';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(b);
  });

  const availableLetters = Object.keys(grouped);

  const sortedLetters = activeLetter
    ? (grouped[activeLetter] ? [activeLetter] : [])
    : [...availableLetters].sort((a, b) => {
        if (a === '#') return -1;
        if (b === '#') return 1;
        return a.localeCompare(b);
      });

  return (
    <section className="mb-10 sm:mb-16">

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground shrink-0">
          All Brands
          {!loading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({total})</span>
          )}
        </h2>
        <div className="relative flex-1 sm:flex-none sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search brands"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Alphabet index */}
      <div className="flex items-center gap-0.5 mb-6 sm:mb-8 flex-wrap">
        {ALPHABET.map(letter => {
          const hasData = availableLetters.includes(letter);
          const isActive = activeLetter === letter;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => hasData && setActiveLetter(l => l === letter ? null : letter)}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-foreground text-background'
                  : hasData
                    ? 'text-foreground hover:bg-secondary cursor-pointer'
                    : 'text-muted-foreground/30 cursor-default'
                }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Brand rows */}
      {loading ? (
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : sortedLetters.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">No brands found</div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {sortedLetters.map(letter => (
            <div key={letter}>
              <h3 className="text-sm sm:text-base font-semibold text-muted-foreground mb-1 px-1">
                {letter}
              </h3>
              <div className="divide-y divide-border">
                {grouped[letter].map(brand => (
                  <Link
                    key={brand.slug}
                    href={`/brands/${brand.slug}`}
                    className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 group hover:bg-secondary rounded-xl px-2 -mx-2 transition-colors"
                  >
                    {/* Logo tile */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-border shrink-0">
                      <BrandLogo
                        src={brand.logo}
                        name={brand.name}
                        bannerStyle={brand.bannerStyle}
                        size="sm"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {brand.name}
                        </p>
                        {brand.isNew && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300 uppercase tracking-wider shrink-0">
                            New
                          </span>
                        )}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0
                          ${brand.type === 'featured'
                            ? 'bg-[#FAEEDA] text-[#633806]'
                            : 'bg-[#E1F5EE] text-[#085041]'
                          }`}
                        >
                          {brand.type === 'featured' ? 'Featured' : 'Standard'}
                        </span>
                        {brand.discount && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0">
                            {brand.discount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {brand.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
                        {' · '}{brand.itemCount} items{' · '}{brand.origin}
                      </p>
                    </div>

                    <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply / list your brand CTA — mirrors stores page */}
      <Link
        href="/brands/apply"
        className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 group hover:bg-secondary rounded-xl px-2 -mx-2 transition-colors mt-0 border-t border-border"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground text-xl leading-none">
          +
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            List your brand here
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Apply for a spot — we verify every seller</p>
        </div>
        <ChevronRight size={15} className="text-muted-foreground shrink-0" />
      </Link>

    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">

        {/* Mobile filter pills — identical pattern to stores page */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4 sm:-mx-10 sm:px-10 border-b border-border mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border
                ${activeFilter === key
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Desktop filter tabs — shown on md+ where sidebar may handle nav */}
        <div className="hidden md:flex items-center gap-1 mb-8 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border
                ${activeFilter === key
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <FeaturedBrandsCarousel activeFilter={activeFilter} />
        <AllBrands             activeFilter={activeFilter} />

      </div>
    </div>
  );
}