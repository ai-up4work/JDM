// app/stores/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreType = 'custom' | 'template';
type FilterKey = 'all' | 'custom' | 'template' | 'new';

interface Store {
  slug: string;
  name: string;
  type: StoreType;
  isNew?: boolean;
  logo: string;
  bannerStyle: React.CSSProperties;
  category: string;
  description: string;
  shipping: string;
  payment: string;
  tags: string[];
  itemCount: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_STORES: Store[] = [
  {
    slug: 'casecraft',
    name: 'CaseCraft',
    type: 'custom',
    isNew: true,
    logo: '/store-icon/case-craft.png',
    bannerStyle: { background: '#1a1a1a' },
    category: 'Phone Cases',
    description: 'Design your own printed phone case — pick your model, upload your photo, preview it live.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Custom print', 'iPhone', 'Samsung'],
    itemCount: 24,
  },
  {
    slug: 'bloom-and-co',
    name: 'Bloom & Co.',
    type: 'template',
    logo: '/store-icon/bloom-and-co.png',
    bannerStyle: { background: '#f5f0e8' },
    category: 'Flowers',
    description: 'Fresh flower arrangements and bouquets for every occasion, delivered same-day in Colombo.',
    shipping: 'Colombo only',
    payment: 'COD',
    tags: ['Bouquets', 'Gifting', 'Same-day'],
    itemCount: 18,
  },
    {
    slug: 'muizza-fashion',
    name: 'Muizza Fashion',
    type: 'custom',
    isNew: true,
    logo: '/store-icon/muizza-fashion.png',
    bannerStyle: { background: '#f5f0e8' },
    category: 'Clothing',
    description: 'Trendy and affordable fashion for men and women. From casual wear to formal attire, we have something for everyone.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Fashion', 'Gifting', 'Custom tailoring'],
    itemCount: 18,
  },
  {
    slug: 'scent-lab',
    name: 'Scent Lab',
    type: 'custom',
    isNew: true,
    logo: '/store-icon/scent-lab.png',
    bannerStyle: { background: '#1b3a2f' },
    category: 'Fragrance',
    description: 'Build your own attar blend — choose base, heart and top notes, name your scent, order it bottled.',
    shipping: 'Ships island-wide',
    payment: 'Bank transfer',
    tags: ['Attar', 'Custom blend', 'Artisan'],
    itemCount: 12,
  },
  {
    slug: 'be-dapper',
    name: 'Be Dapper',
    type: 'template',
    isNew: true,
    logo: '/store-icon/be-dapper.png',
    bannerStyle: { background: '#0f2027' },
    category: 'Clothing',
    description: 'Minimal streetwear made in Sri Lanka. Small-batch drops, direct from the designer.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Streetwear', 'Unisex', 'Local brand'],
    itemCount: 41,
  },
  {
    slug: 'old-money',
    name: 'Old Money',
    type: 'template',
    isNew: true,
    logo: '/store-icon/old-money.png',
    bannerStyle: { background: '#0f2027' },
    category: 'Clothing',
    description: 'Minimal streetwear made in Sri Lanka. Small-batch drops, direct from the designer.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Streetwear', 'Unisex', 'Local brand'],
    itemCount: 41,
  },
  {
    slug: 'skye-clothing',
    name: 'Skye Clothing',
    type: 'template',
    logo: '/store-icon/skye-clothing.png',
    bannerStyle: { background: '#faf5f0' },
    category: 'Handmade',
    description: 'Ethically made, timeless garments for conscious consumers.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Ethical fashion', 'Sustainable materials', 'Made in Sri Lanka'],
    itemCount: 67,
  },
  {
    slug: 'chickadee',
    name: 'Chickadee',
    type: 'template',
    // isNew: true,
    logo: '/store-icon/chickadee.png',
    bannerStyle: { background: '#f5ede8' },
    category: 'Jewellery',
    description: '18K gold plated jewellery — earrings, necklaces, rings, bracelets and more. Water-resistant & tarnish-free.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Gold plated', 'Earrings', 'Necklaces', 'Rings'],
    itemCount: 421,
    },
    {
    slug: 'cherie-lueur',
    name: 'Cherie Lueur',
    type: 'template',
    // isNew: true,
    logo: '/store-icon/cherie-lueur.png',
    bannerStyle: { background: '#f5ede8' },
    category: 'Jewellery',
    description: '18K gold plated jewellery — earrings, necklaces, rings, bracelets and more. Water-resistant & tarnish-free.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Gold plated', 'Earrings', 'Necklaces', 'Rings'],
    itemCount: 421,
  },
  {
    slug: 'kingdom-of-rings',
    name: 'Kingdom of Rings',
    type: 'template',
    logo: '/store-icon/kingdom-of-rings.png',
    bannerStyle: { background: '#1a1400' },
    category: 'Jewellery',
    description: "Sri Lanka's most trusted gold plated jewellery store. Chains, bracelets, rings and bridal sets with a 1-year warranty.",
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Gold plated', 'Chains', 'Bridal', 'Rings'],
    itemCount: 36,
  },
  {
    slug: 'enzayn-ceylon',
    name: 'Enzayn Ceylon',
    type: 'template',
    logo: '/store-icon/enzayn-ceylon.png',
    bannerStyle: { background: '#faf5f0' },
    category: 'Handmade',
    description: 'Ethically made, timeless garments for conscious consumers.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Ethical fashion', 'Sustainable materials', 'Made in Sri Lanka'],
    itemCount: 67,
  },
  {
    slug: 'otaku-clothing',
    name: 'OTAKU CLOTHING SL',
    type: 'template',
    isNew: true,
    logo: '/store-icon/otaku.png',
    bannerStyle: { background: '#faf5f0' },
    category: 'Clothing',
    description: 'Ethically made, timeless garments for conscious consumers.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Ethical fashion', 'Sustainable materials', 'Made in Sri Lanka'],
    itemCount: 67,
  },
    {
    slug: 'giva',
    name: 'GIVA',
    type: 'template',
    isNew: true,
    logo: '/store-icon/giva.png',
    bannerStyle: { background: '#1a1400' },
    category: 'Jewellery',
    description: "Sri Lanka's most trusted gold plated jewellery store. Chains, bracelets, rings and bridal sets with a 1-year warranty.",
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Gold plated', 'Rose Gold', 'Bridal', 'Rings'],
    itemCount: 36,
  },
  {
    slug: 'buckley-london',
    name: 'Buckley London',
    type: 'template',
    isNew: true,
    logo: '/store-icon/buckley-london.png',
    bannerStyle: { background: '#0f172a' },
    category: 'Jewellery',
    description: "Elegant British-designed jewellery brand known for crystal-studded pieces, timeless bracelets, necklaces, and gift-ready collections.",
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Crystal', 'Luxury', 'Bracelets', 'Necklaces', 'Gifts'],
    itemCount: 28,
  }
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All'           },
  { key: 'custom',   label: 'Custom builds' },
  { key: 'template', label: 'Templates'     },
  { key: 'new',      label: 'New arrivals'  },
];

const ALPHABET = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

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
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">
        <div className="mb-5 flex items-center justify-between">
          <div className="h-7 w-36 rounded-lg bg-muted animate-pulse" />
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
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 w-28 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-48 sm:w-72 rounded-lg bg-muted animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    </div>
  );
}

// ─── New Stores Carousel ──────────────────────────────────────────────────────

function NewStoresCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const newStores = ALL_STORES.filter(s => s.isNew);

  // Check bounds on mount so the Next button starts correctly disabled when
  // all cards are already visible (avoids the false-enabled bug from brands page)
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    setAtStart(t.scrollLeft <= 4);
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
  }, []);

  const scroll = (dir: 'prev' | 'next') => {
    const t = trackRef.current; if (!t) return;
    const card = t.querySelector('a') as HTMLElement | null;
    const step = card ? card.offsetWidth + 12 : 160;
    t.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  const onScroll = () => {
    const t = trackRef.current; if (!t) return;
    setAtStart(t.scrollLeft <= 4);
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
  };

  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">New Stores</h2>
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
        {newStores.map(store => (
          <Link
            key={store.slug}
            href={`/stores/${store.slug}`}
            className="shrink-0 snap-start flex flex-col items-center gap-2.5 group w-[28vw] sm:w-[18vw] lg:w-32"
          >
            <div
              className="relative w-full aspect-square overflow-hidden rounded-2xl border border-border group-hover:border-primary transition-colors"
              style={store.bannerStyle}
            >
              <Image
                src={store.logo}
                alt={store.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-snug line-clamp-2 px-1">
              {store.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── All Stores ───────────────────────────────────────────────────────────────

function AllStores({ activeFilter }: { activeFilter: FilterKey }) {
  const [search,       setSearch]       = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Reset letter when filter changes
  useEffect(() => { setActiveLetter(null); }, [activeFilter]);

  // 1. Apply filter + search
  const preFiltered = ALL_STORES.filter(s => {
    const matchesFilter =
      activeFilter === 'all'      ? true :
      activeFilter === 'new'      ? !!s.isNew :
      s.type === activeFilter;

    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // 2. Group by first letter
  const grouped: Record<string, Store[]> = {};
  preFiltered.forEach(s => {
    const first = s.name[0].toUpperCase();
    const key   = /[A-Z]/.test(first) ? first : '#';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  // Sort stores within each letter alphabetically
  Object.values(grouped).forEach(arr =>
    arr.sort((a, b) => a.name.localeCompare(b.name))
  );

  const availableLetters = Object.keys(grouped);

  // 3. If a letter is selected, only show that group
  const sortedLetters = activeLetter
    ? (grouped[activeLetter] ? [activeLetter] : [])
    : [...availableLetters].sort((a, b) => {
        if (a === '#') return -1;
        if (b === '#') return 1;
        return a.localeCompare(b);
      });

  return (
    <section className="mb-10 sm:mb-16">

      {/* Header row — mirrors AllBrands */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground shrink-0">All Stores</h2>
        <div className="relative flex-1 sm:flex-none sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stores"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Alphabet index — mirrors brands page */}
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

      {/* Store list */}
      {sortedLetters.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">No stores found</div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {sortedLetters.map(letter => (
            <div key={letter}>
              <h3 className="text-sm sm:text-base font-semibold text-muted-foreground mb-1 px-1">
                {letter}
              </h3>
              <div className="divide-y divide-border">
                {grouped[letter].map(store => (
                  <Link
                    key={store.slug}
                    href={`/stores/${store.slug}`}
                    className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 group hover:bg-secondary rounded-xl px-2 -mx-2 transition-colors"
                  >
                    <div
                      className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-border shrink-0"
                      style={store.bannerStyle}
                    >
                      <Image
                        src={store.logo}
                        alt={store.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {store.name}
                        </p>
                        {store.isNew && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300 uppercase tracking-wider shrink-0">
                            New
                          </span>
                        )}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0
                          ${store.type === 'custom'
                            ? 'bg-[#EEEDFE] text-[#3C3489]'
                            : 'bg-[#E1F5EE] text-[#085041]'
                          }`}
                        >
                          {store.type === 'custom' ? 'Custom build' : 'Template'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {store.category} · {store.itemCount} items · {store.shipping}
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

      {/* Apply CTA row */}
      <Link
        href="/stores/apply"
        className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 group hover:bg-secondary rounded-xl px-2 -mx-2 transition-colors mt-0 border-t border-border"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground text-xl leading-none">
          +
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            Open your store here
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Apply for a spot — we verify every seller</p>
        </div>
        <ChevronRight size={15} className="text-muted-foreground shrink-0" />
      </Link>

    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoresPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <>
      {/* ── Sticky Nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm mt-4 border-b border-border">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Stores</span>
          </div>

          {/* Desktop filter pills */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${activeFilter === key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground hidden sm:block shrink-0">
            <span className="text-foreground font-semibold">{ALL_STORES.length}</span> verified stores
          </p>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">

          {/* Mobile filter pills */}
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

          <NewStoresCarousel />
          <AllStores activeFilter={activeFilter} />

        </div>
      </div>
    </>
  );
}