'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const newBrands = [
  { id: 1, name: 'Khani Wears',       logo: '/garments/product1.jpeg',  href: '/brands/khani-wears'  },
  { id: 2, name: 'Afroz by Charcoal', logo: '/garments/product2.jpeg',  href: '/brands/afroz'        },
  { id: 3, name: 'Ayat Closet',       logo: '/garments/product3.jpeg',  href: '/brands/ayat-closet'  },
  { id: 4, name: 'Surmeen',           logo: '/garments/product4.jpeg',  href: '/brands/surmeen'      },
  { id: 5, name: 'Al-Bakhat',         logo: '/garments/product5.jpeg',  href: '/brands/al-bakhat'    },
  { id: 6, name: 'Mnar',              logo: '/garments/product6.jpeg',  href: '/brands/mnar'         },
  { id: 7, name: 'Rang-e-Haya',       logo: '/garments/product7.jpeg',  href: '/brands/rang-e-haya'  },
  { id: 8, name: 'Silk Leaf',         logo: '/garments/product8.jpeg',  href: '/brands/silk-leaf'    },
];

const CATEGORIES = ['Women', 'Men', 'Beauty', 'Kids'];

const SUBCATEGORIES = [
  'Eastern Ready To Wear', 'Eastern Unstitched', 'Modest Wear',
  'Fusion', 'Western', 'Activewear', 'Accessories', 'Footwear', 'Jewellery',
];

const ALPHABET = ['L','S','#','A','B','C','D','E','F','G','H','I','J','K',
                  'M','N','O','P','Q','R','T','U','V','W','X','Y','Z'];

const ALL_BRANDS_DATA: Record<string, Record<string, { name: string; logo: string; items: number }[]>> = {
  Women: {
    L: [
      { name: 'Libaas-e-Resham', logo: '/garments/product1.jpeg',  items: 44  },
      { name: 'Lulusar',         logo: '/garments/product2.jpeg',  items: 99  },
    ],
    S: [
      { name: 'Saheliyan Pret',  logo: '/garments/product3.jpeg',  items: 34  },
      { name: 'Sana Safinaz',    logo: '/garments/product4.jpeg',  items: 212 },
      { name: 'Silk & Stones',   logo: '/garments/product5.jpeg',  items: 18  },
      { name: 'Surmeen',         logo: '/garments/product6.jpeg',  items: 42  },
    ],
    A: [
      { name: 'Afroz by Charcoal', logo: '/garments/product7.jpeg',  items: 56 },
      { name: 'Ayat Closet',       logo: '/garments/product8.jpeg',  items: 17 },
      { name: 'Al-Zohaib',         logo: '/garments/product9.jpeg',  items: 88 },
      { name: 'Al-Bakhat',         logo: '/garments/product10.jpeg', items: 31 },
    ],
    B: [
      { name: 'Bahar Arts',       logo: '/garments/product11.jpeg', items: 29  },
      { name: 'Bonanza Satrangi', logo: '/garments/product12.jpeg', items: 145 },
    ],
    G: [
      { name: 'Gulman',    logo: '/garments/product13.jpeg', items: 14  },
      { name: 'Gul Ahmed', logo: '/garments/product14.jpeg', items: 310 },
    ],
    K: [
      { name: 'Khaadi',      logo: '/garments/product15.jpeg', items: 280 },
      { name: 'Khani Wears', logo: '/garments/product16.jpeg', items: 8   },
    ],
    M: [
      { name: 'Maria B', logo: '/garments/product1.jpeg', items: 195 },
      { name: 'Malhaar', logo: '/garments/product2.jpeg', items: 67  },
      { name: 'Mushq',   logo: '/garments/product3.jpeg', items: 53  },
      { name: 'Mnar',    logo: '/garments/product4.jpeg', items: 38  },
    ],
  },
  Men: {
    A: [
      { name: 'Amir Adnan', logo: '/garments/product5.jpeg', items: 72 },
      { name: 'Almirah',    logo: '/garments/product6.jpeg', items: 49 },
    ],
    B: [{ name: 'Basix',      logo: '/garments/product7.jpeg', items: 33  }],
    K: [{ name: 'Khaadi Men', logo: '/garments/product8.jpeg', items: 120 }],
    M: [{ name: 'Menfolk',    logo: '/garments/product9.jpeg', items: 88  }],
  },
  Beauty: {
    B: [{ name: 'Beautify',     logo: '/garments/product10.jpeg', items: 55 }],
    H: [{ name: 'Hunza Beauty', logo: '/garments/product11.jpeg', items: 22 }],
    S: [{ name: 'Skin Story',   logo: '/garments/product12.jpeg', items: 41 }],
  },
  Kids: {
    B: [{ name: 'Baby World',  logo: '/garments/product13.jpeg', items: 67 }],
    G: [{ name: 'Girls Tag',   logo: '/garments/product14.jpeg', items: 39 }],
    K: [{ name: 'Khaadi Kids', logo: '/garments/product15.jpeg', items: 95 }],
  },
};

// ── Skeletons ─────────────────────────────────────────────────────────────────

function BrandCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full aspect-square rounded-2xl bg-muted animate-pulse" />
      <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
    </div>
  );
}

function BrandRowSkeleton() {
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
          <div className="h-7 w-32 rounded-lg bg-muted animate-pulse" />
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3 mb-10 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[28vw] sm:w-[18vw] lg:w-32">
              <BrandCardSkeleton />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-48 sm:w-72 rounded-lg bg-muted animate-pulse" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => <BrandRowSkeleton key={i} />)}
      </div>
    </div>
  );
}

// ── New Brands Carousel ───────────────────────────────────────────────────────

function NewBrandsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

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
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">New Brands</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('prev')} disabled={atStart}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          ><ChevronLeft size={18} /></button>
          <button onClick={() => scroll('next')} disabled={atEnd}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          ><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Swipeable — bleeds to screen edge on mobile/tablet, contained on desktop */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0 pb-1"
      >
        {newBrands.map(brand => (
          <Link key={brand.id} href={brand.href}
            className="shrink-0 snap-start flex flex-col items-center gap-2.5 group w-[28vw] sm:w-[18vw] lg:w-32"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-muted border border-border group-hover:border-primary transition-colors">
              <Image src={brand.logo} alt={brand.name} fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-snug line-clamp-2 px-1">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Filter Sheet (mobile) ─────────────────────────────────────────────────────

function FilterSheet({
  activeSubcat,
  setActiveSubcat,
  onClose,
}: {
  activeSubcat: string | null;
  setActiveSubcat: (s: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="text-base font-semibold">Filter by Subcategory</span>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {SUBCATEGORIES.map(sub => (
            <button key={sub} type="button"
              onClick={() => { setActiveSubcat(activeSubcat === sub ? null : sub); onClose(); }}
              className={`px-3 py-2 rounded-full border text-sm font-medium transition-colors
                ${activeSubcat === sub
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-foreground hover:bg-secondary'}`}
            >{sub}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── All Brands ────────────────────────────────────────────────────────────────

function AllBrands() {
  const [activeCategory, setActiveCategory] = useState('Women');
  const [activeLetter,   setActiveLetter]   = useState<string | null>(null);
  const [activeSubcat,   setActiveSubcat]   = useState<string | null>(null);
  const [search,         setSearch]         = useState('');
  const [filterOpen,     setFilterOpen]     = useState(false);

  const brandsByLetter   = ALL_BRANDS_DATA[activeCategory] ?? {};
  const availableLetters = Object.keys(brandsByLetter);

  const filtered: Record<string, { name: string; logo: string; items: number }[]> = {};
  Object.entries(brandsByLetter).forEach(([letter, brands]) => {
    if (activeLetter && letter !== activeLetter) return;
    const f = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    if (f.length > 0) filtered[letter] = f;
  });
  const sortedLetters = Object.keys(filtered).sort();

  const activeFilterCount = [activeLetter, activeSubcat].filter(Boolean).length;

  return (
    <section className="mb-10 sm:mb-16">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground shrink-0">All Brands</h2>
        <div className="relative flex-1 sm:flex-none sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search brands" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Category tabs — bleeds to screen edge on mobile/tablet */}
      <div className="flex border-b border-border mb-5 sm:mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0">
        {CATEGORIES.map(cat => (
          <button key={cat} type="button"
            onClick={() => { setActiveCategory(cat); setActiveLetter(null); setSearch(''); }}
            className={`relative shrink-0 px-5 sm:px-8 py-3 text-sm font-medium transition-colors whitespace-nowrap
              ${activeCategory === cat
                ? 'text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-foreground'
                : 'text-muted-foreground hover:text-foreground'}`}
          >{cat}</button>
        ))}
      </div>

      {/* Subcategory row */}
      <div className="mb-5 sm:mb-6">
        {/* Mobile: filter button only */}
        <div className="flex sm:hidden items-center gap-2 mb-2">
          <button type="button"
            onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-colors
              ${activeFilterCount > 0 ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
          >
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {activeSubcat && (
            <button type="button" onClick={() => setActiveSubcat(null)}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-border text-xs text-muted-foreground hover:bg-secondary transition-colors"
            >
              {activeSubcat} <X size={12} />
            </button>
          )}
        </div>

        {/* sm+: scrollable pill row — same style as home TrendingProducts filter bar */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button type="button"
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-colors shrink-0
              ${activeFilterCount > 0 ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-secondary'}`}
          >
            <SlidersHorizontal size={15} />
          </button>
          {SUBCATEGORIES.map(sub => (
            <button key={sub} type="button"
              onClick={() => setActiveSubcat(s => s === sub ? null : sub)}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                ${activeSubcat === sub
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-secondary'}`}
            >{sub}</button>
          ))}
          {activeFilterCount > 0 && (
            <button type="button"
              onClick={() => { setActiveSubcat(null); setActiveLetter(null); }}
              className="px-3 sm:px-4 py-2 rounded-full border border-red-300 text-red-500 text-xs sm:text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Alphabet index */}
      <div className="flex items-center gap-0.5 mb-6 sm:mb-8 flex-wrap">
        {ALPHABET.map(letter => {
          const hasData = availableLetters.includes(letter);
          const isActive = activeLetter === letter;
          return (
            <button key={letter} type="button"
              onClick={() => hasData && setActiveLetter(l => l === letter ? null : letter)}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-foreground text-background'
                  : hasData
                    ? 'text-foreground hover:bg-secondary cursor-pointer'
                    : 'text-muted-foreground/30 cursor-default'}`}
            >{letter}</button>
          );
        })}
      </div>

      {/* Brand list */}
      {sortedLetters.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">No brands found</div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {sortedLetters.map(letter => (
            <div key={letter}>
              <h3 className="text-sm sm:text-base font-semibold text-muted-foreground mb-1 px-1">{letter}</h3>
              <div className="divide-y divide-border">
                {filtered[letter].map(brand => (
                  <Link key={brand.name}
                    href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 group hover:bg-secondary rounded-xl px-2 -mx-2 transition-colors"
                  >
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                      <Image src={brand.logo} alt={brand.name} fill className="object-cover object-center" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{brand.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{brand.items} items</p>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filterOpen && (
        <FilterSheet
          activeSubcat={activeSubcat}
          setActiveSubcat={setActiveSubcat}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">
        <NewBrandsCarousel />
        <AllBrands />
      </div>
    </div>
  );
}