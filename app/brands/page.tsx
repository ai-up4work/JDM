// app/brands/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import Image from 'next/image';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLogo(domain: string) {
  return `https://img.logo.dev/${domain}?token=pk_frb6265b8cfbab9d8c9ef0`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Brand {
  name: string;
  logo: string;
  domain?: string;
  items: number;
  tag?: string;
  bg?: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const NEW_BRANDS: { id: number; name: string; logo: string; domain?: string; bg?: string; href: string }[] = [
  { id: 1, name: 'Nike',         logo: getLogo('nike.com'),         domain: 'nike.com',         href: '/brands/nike'         },
  { id: 2, name: 'Burberry',     logo: getLogo('burberry.com'),     domain: 'burberry.com',     href: '/brands/burberry'         },
  { id: 3, name: 'Lacoste',      logo: getLogo('lacoste.com'),      domain: 'lacoste.com',      href: '/brands/lacoste'      },
  { id: 4, name: 'Adidas',       logo: getLogo('adidas.com'),       domain: 'adidas.com',       href: '/brands/adidas'       },
  { id: 5, name: 'Uniqlo',       logo: getLogo('uniqlo.com'),       domain: 'uniqlo.com',       href: '/brands/uniqlo',       bg: '#FF0000'  },
  { id: 6, name: 'Mango',        logo: getLogo('mango.com'),        domain: 'mango.com',        href: '/brands/mango'        },
  { id: 7, name: 'ASOS',     logo: getLogo('asos.com'), domain: 'asos.com', href: '/brands/asos'     },
  { id: 8, name: 'Starbucks',      logo: getLogo('starbucks.com'),       domain: 'starbucks.com',       bg: '#00A862', href: '/brands/starbucks'      },
  { id: 9, name: 'Calvin Klein', logo: getLogo('calvinklein.com'),  domain: 'calvinklein.com', href: '/brands/calvinklein' },
];

const CATEGORIES = ['Women', 'Men', 'Beauty', 'Kids'];

const SUBCATEGORIES = [
  'Eastern Ready To Wear', 'Eastern Unstitched', 'Modest Wear',
  'Fusion', 'Western', 'Activewear', 'Accessories', 'Footwear', 'Jewellery',
];

const ALPHABET = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const ALL_BRANDS_DATA: Record<string, Record<string, Brand[]>> = {
  Women: {
    A: [
      { name: 'Adidas', logo: getLogo('adidas.com'), domain: 'adidas.com', items: 134, tag: 'International' },
      { name: 'ASOS',   logo: getLogo('asos.com'),   domain: 'asos.com',   items: 280, tag: 'International' },
      { name: 'Amma',   logo: '',                                           items: 48,  tag: 'Sri Lankan', bg: '#f0ebe3' },
      { name: 'Anuk',   logo: '',                                           items: 32,  tag: 'Sri Lankan', bg: '#e8f0eb' },
    ],
    B: [
      { name: 'Barefoot',      logo: '',                                              items: 67,  tag: 'Sri Lankan',    bg: '#f5e6d0' },
      { name: 'Buddhi Batiks', logo: '',                                              items: 55,  tag: 'Sri Lankan',    bg: '#e8d5f0' },
      { name: 'Burberry',      logo: getLogo('burberry.com'), domain: 'burberry.com', items: 92,  tag: 'International'               },
      { name: 'Bershka',       logo: getLogo('bershka.com'),  domain: 'bershka.com',  items: 118, tag: 'International'               },
    ],
    C: [
      { name: 'Calvin Klein', logo: getLogo('calvinklein.com'), domain: 'calvinklein.com', items: 76, tag: 'International'             },
      { name: 'Chanel',       logo: getLogo('chanel.com'),      domain: 'chanel.com',      items: 44, tag: 'International'             },
      { name: 'Cool Planet',  logo: '',                                                     items: 88, tag: 'Sri Lankan', bg: '#dff0f5' },
    ],
    D: [
      { name: 'Dior',                    logo: getLogo('dior.com'), domain: 'dior.com', items: 39,  tag: 'International'               },
      { name: 'Design Collective, The',  logo: '',                                       items: 110, tag: 'Sri Lankan', bg: '#f0e8d5'   },
    ],
    F: [
      { name: 'Forever 21', logo: getLogo('forever21.com'), domain: 'forever21.com', items: 196, tag: 'International', bg: '#FFE814 '          },
      { name: 'FMLK',       logo: '',                                                 items: 43,  tag: 'Sri Lankan', bg: '#d5f0e8' },
    ],
    G: [
      { name: 'Gucci',  logo: getLogo('gucci.com'), domain: 'gucci.com', items: 58,  tag: 'International'             },
      { name: 'Gap',    logo: getLogo('gap.com'),   domain: 'gap.com',   items: 142, tag: 'International'             },
      { name: 'GFLOCK', logo: '',                                         items: 76,  tag: 'Sri Lankan', bg: '#e0e8f5' },
    ],
    H: [
      { name: 'H&M',             logo: getLogo('hm.com'), domain: 'hm.com', items: 320, tag: 'International'             },
      { name: 'House of Lonali', logo: '',                                   items: 29,  tag: 'Sri Lankan', bg: '#f5dde8' },
    ],
    K: [
      { name: 'Kelly Felder', logo: '', items: 94, tag: 'Sri Lankan', bg: '#2d2d2d' },
      { name: 'Kheila',       logo: '', items: 38, tag: 'Sri Lankan', bg: '#f0d5e8' },
    ],
    L: [
      { name: 'Lacoste',           logo: getLogo('lacoste.com'),      domain: 'lacoste.com',      items: 88, tag: 'International'             },
      { name: 'Louis Vuitton',     logo: getLogo('louisvuitton.com'), domain: 'louisvuitton.com', items: 33, tag: 'International'             },
      { name: 'Lois London',       logo: '',                                                       items: 41, tag: 'Sri Lankan', bg: '#e8f5f0' },
      { name: "L'Atelier Touché",  logo: '',                                                       items: 27, tag: 'Sri Lankan', bg: '#1a1a1a' },
    ],
    M: [
      { name: 'Mango',         logo: getLogo('mango.com'),         domain: 'mango.com',         items: 165, tag: 'International'             },
      { name: 'Massimo Dutti', logo: getLogo('massimodutti.com'), domain: 'massimodutti.com',  items: 77,  tag: 'International'             },
      { name: 'Mezzo',         logo: '',                                                         items: 52,  tag: 'Sri Lankan', bg: '#f5e8d5' },
      { name: 'Mimosa',        logo: '',                                                         items: 44,  tag: 'Sri Lankan', bg: '#f5d5e0' },
      { name: 'Maus',          logo: '',                                                         items: 36,  tag: 'Sri Lankan', bg: '#d5e8f5' },
    ],
    N: [
      { name: 'Nike',    logo: getLogo('nike.com'), domain: 'nike.com', items: 210, tag: 'International'             },
      { name: 'Nolimit', logo: '',                                       items: 188, tag: 'Sri Lankan', bg: '#1c3d5a' },
      { name: 'Nåd',    logo: '',                                       items: 22,  tag: 'Sri Lankan', bg: '#e8ede8' },
    ],
    O: [
      { name: 'Odel', logo: '', items: 240, tag: 'Sri Lankan', bg: '#c8102e' },
    ],
    P: [
      { name: 'Pull&Bear', logo: getLogo('pullandbear.com'), domain: 'pullandbear.com', items: 143, tag: 'International' },
      { name: 'Puma',      logo: getLogo('puma.com'),        domain: 'puma.com', bg: '#000000',  items: 98,  tag: 'International' },
    ],
    R: [
      { name: 'Ralph Lauren', logo: getLogo('ralphlauren.com'), domain: 'ralphlauren.com', items: 87, tag: 'International'             },
      { name: 'Rachel Raj',   logo: '',                                                     items: 31, tag: 'Sri Lankan', bg: '#f0e0d5' },
      { name: 'Rithihi',      logo: '',                                                     items: 45, tag: 'Sri Lankan', bg: '#2c1a0e' },
    ],
    S: [
      { name: 'Stradivarius',         logo: getLogo('stradivarius.com'), domain: 'stradivarius.com', items: 134, tag: 'International'             },
      { name: 'Selyn',                logo: '',                                                        items: 58,  tag: 'Sri Lankan', bg: '#3a6b35' },
      { name: 'Spring & Summer',      logo: '',                                                        items: 76,  tag: 'Sri Lankan', bg: '#f0f0e0' },
      { name: 'Sonali Dharmawardena', logo: '',                                                        items: 19,  tag: 'Sri Lankan', bg: '#1a1a2e' },
    ],
    U: [
      { name: 'Uniqlo',       logo: getLogo('uniqlo.com'), domain: 'uniqlo.com', bg: '#FF0000',  items: 177, tag: 'International'             },
      { name: 'Urban Island', logo: '',                                           items: 63,  tag: 'Sri Lankan', bg: '#0a2540' },
    ],
    V: [
      { name: "Victoria's Secret", logo: getLogo('victoriassecret.com'), domain: 'victoriassecret.com', items: 112, tag: 'International' },
    ],
    Z: [
      { name: 'Zara', logo: getLogo('zara.com'), domain: 'zara.com', items: 248, tag: 'International'             },
      { name: 'Zie',  logo: '',                                       items: 33,  tag: 'Sri Lankan', bg: '#2a2a3e' },
    ],
  },
  Men: {
    A: [
      { name: 'Adidas', logo: getLogo('adidas.com'), domain: 'adidas.com', items: 178, tag: 'International' },
      { name: 'Armani', logo: getLogo('armani.com'), domain: 'armani.com', items: 54,  tag: 'International' },
    ],
    B: [
      { name: 'Benetton', logo: getLogo('benetton.com'), domain: 'benetton.com', items: 88, tag: 'International' },
    ],
    C: [
      { name: 'Calvin Klein', logo: getLogo('calvinklein.com'), domain: 'calvinklein.com', items: 63, tag: 'International'             },
      { name: 'Crocodile',    logo: '',                                                     items: 72, tag: 'Sri Lankan', bg: '#1a3a1a' },
    ],
    G: [
      { name: 'Gap',    logo: getLogo('gap.com'), domain: 'gap.com', items: 95, tag: 'International'             },
      { name: 'GFLOCK', logo: '',                                     items: 54, tag: 'Sri Lankan', bg: '#e0e8f5' },
    ],
    H: [
      { name: 'H&M',       logo: getLogo('hm.com'),       domain: 'hm.com',       items: 144, tag: 'International' },
      { name: 'Hugo Boss', logo: getLogo('hugoboss.com'), domain: 'hugoboss.com', items: 67,  tag: 'International' },
    ],
    L: [
      { name: 'Lacoste', logo: getLogo('lacoste.com'), domain: 'lacoste.com', items: 71,  tag: 'International' },
      { name: "Levi's",  logo: getLogo('levi.com'),    domain: 'levi.com',    items: 110, tag: 'International' },
    ],
    N: [
      { name: 'Nike',    logo: getLogo('nike.com'), domain: 'nike.com', items: 198, tag: 'International'             },
      { name: 'Nolimit', logo: '',                                       items: 122, tag: 'Sri Lankan', bg: '#1c3d5a' },
    ],
    O: [
      { name: 'Odel', logo: '', items: 135, tag: 'Sri Lankan', bg: '#c8102e' },
    ],
    P: [
      { name: 'Puma', logo: getLogo('puma.com'), domain: 'puma.com', items: 86, tag: 'International' },
    ],
    R: [
      { name: 'Ralph Lauren', logo: getLogo('ralphlauren.com'), domain: 'ralphlauren.com', items: 59, tag: 'International' },
    ],
    T: [
      { name: 'Tommy Hilfiger',  logo: getLogo('tommy.com'), domain: 'tommy.com', items: 92, tag: 'International'             },
      { name: 'T-Shirt Republic', logo: '',                                         items: 68, tag: 'Sri Lankan', bg: '#1a1a1a' },
    ],
    U: [
      { name: 'Uniqlo', logo: getLogo('uniqlo.com'), domain: 'uniqlo.com', items: 140, tag: 'International' },
    ],
    Z: [
      { name: 'Zara', logo: getLogo('zara.com'), domain: 'zara.com', items: 112, tag: 'International' },
    ],
  },
  Beauty: {
    B: [
      { name: 'Bare Minerals', logo: getLogo('bareminerals.com'), domain: 'bareminerals.com', items: 44, tag: 'International' },
    ],
    C: [
      { name: 'Clinique', logo: getLogo('clinique.com'), domain: 'clinique.com', items: 88, tag: 'International' },
    ],
    E: [
      { name: 'Estée Lauder', logo: getLogo('esteelauder.com'), domain: 'esteelauder.com', items: 72, tag: 'International' },
    ],
    I: [
      { name: 'Iris Garden', logo: '', items: 34, tag: 'Sri Lankan', bg: '#4a7c59' },
    ],
    L: [
      { name: "L'Oréal", logo: getLogo('loreal.com'), domain: 'loreal.com', items: 120, tag: 'International' },
    ],
    M: [
      { name: 'MAC', logo: getLogo('maccosmetics.com'), domain: 'maccosmetics.com', items: 95, tag: 'International' },
    ],
    N: [
      { name: 'NYX',  logo: getLogo('nyxcosmetics.com'), domain: 'nyxcosmetics.com', items: 66, tag: 'International'             },
      { name: 'Nion', logo: '',                                                        items: 28, tag: 'Sri Lankan', bg: '#f5e8ee' },
    ],
    S: [
      { name: 'Sephora', logo: getLogo('sephora.com'), domain: 'sephora.com', items: 154, tag: 'International' },
    ],
  },
  Kids: {
    B: [
      { name: 'Bonds', logo: getLogo('bonds.com.au'), domain: 'bonds.com.au', items: 88, tag: 'International' },
    ],
    C: [
      { name: "Carter's",         logo: getLogo('carters.com'), domain: 'carters.com', items: 134, tag: 'International'             },
      { name: 'Cool Planet Kids', logo: '',                                              items: 54,  tag: 'Sri Lankan', bg: '#dff0f5' },
    ],
    G: [
      { name: 'Gap Kids', logo: getLogo('gap.com'), domain: 'gap.com', items: 97, tag: 'International' },
    ],
    H: [
      { name: 'H&M Kids', logo: getLogo('hm.com'), domain: 'hm.com', items: 142, tag: 'International' },
    ],
    L: [
      { name: 'Lishe', logo: '', items: 44, tag: 'Sri Lankan', bg: '#f5e0d5' },
    ],
    N: [
      { name: 'Next',          logo: getLogo('next.co.uk'), domain: 'next.co.uk', items: 110, tag: 'International'             },
      { name: 'Nolimit Kids',  logo: '',                                           items: 78,  tag: 'Sri Lankan', bg: '#1c3d5a' },
    ],
    Z: [
      { name: 'Zara Kids', logo: getLogo('zara.com'), domain: 'zara.com', items: 88, tag: 'International' },
    ],
  },
};

// ── Brand Image ───────────────────────────────────────────────────────────────
function BrandImage({
  brand,
  size = 'row',
}: {
  brand: { name: string; logo: string; domain?: string; bg?: string };
  size?: 'row' | 'card';
}) {
  const [src,     setSrc]     = useState(brand.logo || '');
  const [errored, setErrored] = useState(!brand.logo);

  const initials = brand.name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const bg = brand.bg ?? '#ffffff'; // default white, overridable via brand.bg

  const isDark = (() => {
    const hex = bg.replace('#', '');
    if (hex.length < 6) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  })();

  const handleError = () => {
    if (brand.domain && !src.includes('google.com')) {
      setSrc(`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`);
    } else {
      setErrored(true);
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: bg }}
    >
      {errored ? (
        <span
          style={{
            fontSize: size === 'card' ? '1.4rem' : '0.68rem',
            fontWeight: 700,
            color: isDark ? '#ffffff' : '#1a1a1a',
            letterSpacing: '0.05em',
          }}
        >
          {initials}
        </span>
      ) : (
        <Image
          src={src}
          alt={brand.name}
          fill
          onError={handleError}
          style={{
            objectFit: 'contain',
            padding: size === 'card' ? '12px' : '6px',
          }}
        />
      )}
    </div>
  );
}

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
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">New Brands</h2>
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
        {NEW_BRANDS.map(brand => (
          <Link
            key={brand.id}
            href={brand.href}
            className="shrink-0 snap-start flex flex-col items-center gap-2.5 group w-[28vw] sm:w-[18vw] lg:w-32"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-muted border border-border group-hover:border-primary transition-colors">
              <BrandImage brand={brand} size="card" />
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
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="text-base font-semibold">Filter by Subcategory</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {SUBCATEGORIES.map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => { setActiveSubcat(activeSubcat === sub ? null : sub); onClose(); }}
              className={`px-3 py-2 rounded-full border text-sm font-medium transition-colors
                ${activeSubcat === sub
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-foreground hover:bg-secondary'}`}
            >
              {sub}
            </button>
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

  useEffect(() => { setActiveLetter(null); }, [activeCategory]);

  const brandsByLetter   = ALL_BRANDS_DATA[activeCategory] ?? {};
  const availableLetters = Object.keys(brandsByLetter);

  const filtered: Record<string, Brand[]> = {};
  Object.entries(brandsByLetter).forEach(([letter, brands]) => {
    if (activeLetter && letter !== activeLetter) return;
    const f = brands
      .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (f.length > 0) filtered[letter] = f;
  });

  const sortedLetters = Object.keys(filtered).sort((a, b) => {
    if (a === '#') return -1;
    if (b === '#') return 1;
    return a.localeCompare(b);
  });

  const activeFilterCount = [activeLetter, activeSubcat].filter(Boolean).length;

  return (
    <section className="mb-10 sm:mb-16">

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground shrink-0">All Brands</h2>
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

      {/* Category tabs */}
      <div className="flex border-b border-border mb-5 sm:mb-8 overflow-x-auto scrollbar-hide px-4 sm:px-10 lg:mx-0 lg:px-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => { setActiveCategory(cat); setSearch(''); }}
            className={`relative shrink-0 px-5 sm:px-8 py-3 text-sm font-medium transition-colors whitespace-nowrap
              ${activeCategory === cat
                ? 'text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-foreground'
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Subcategory filter row */}
      <div className="mb-5 sm:mb-6">
        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-colors
              ${activeFilterCount > 0
                ? 'bg-foreground text-background border-foreground'
                : 'border-border hover:bg-secondary'}`}
          >
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {activeSubcat && (
            <button
              type="button"
              onClick={() => setActiveSubcat(null)}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-border text-xs text-muted-foreground hover:bg-secondary transition-colors"
            >
              {activeSubcat} <X size={12} />
            </button>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-colors shrink-0
              ${activeFilterCount > 0
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background hover:bg-secondary'}`}
          >
            <SlidersHorizontal size={15} />
          </button>
          {SUBCATEGORIES.map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => setActiveSubcat(s => s === sub ? null : sub)}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                ${activeSubcat === sub
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-secondary'}`}
            >
              {sub}
            </button>
          ))}
          {activeFilterCount > 0 && (
            <button
              type="button"
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
            <button
              key={letter}
              type="button"
              onClick={() => hasData && setActiveLetter(l => l === letter ? null : letter)}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-foreground text-background'
                  : hasData
                    ? 'text-foreground hover:bg-secondary cursor-pointer'
                    : 'text-muted-foreground/30 cursor-default'}`}
            >
              {letter}
            </button>
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
              <h3 className="text-sm sm:text-base font-semibold text-muted-foreground mb-1 px-1">
                {letter}
              </h3>
              <div className="divide-y divide-border">
                {filtered[letter].map(brand => (
                  <Link
                    key={brand.name}
                    href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 group hover:bg-secondary rounded-xl px-2 transition-colors"
                  >
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                      <BrandImage brand={brand} size="row" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {brand.name}
                        </p>
                        {brand.tag && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0
                            ${brand.tag === 'Sri Lankan'
                              ? 'bg-[#E1F5EE] text-[#085041]'
                              : 'bg-[#EEEDFE] text-[#3C3489]'}`}
                          >
                            {brand.tag}
                          </span>
                        )}
                      </div>
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
    <div className="w-full min-w-0 overflow-x-hidden px-4 lg:px-40">
      <div className="max-w-7xl lg:-mx-10 py-2 sm:py-4 min-w-0">
        <NewBrandsCarousel />
        <AllBrands />
      </div>
    </div>
  );
}