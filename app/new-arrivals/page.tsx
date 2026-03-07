'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const TIME_FILTERS = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months'];

const newCollections = [
  { id: 1, brand: 'Girls Tag',    collection: 'Kids Festive / Party Wear', image: '/garments/product1.jpeg', href: '/drops/girls-tag-kids-festive' },
  { id: 2, brand: 'Annus Abrar',  collection: 'Neroli Luxury Lawn 26',     image: '/garments/product2.jpeg', href: '/drops/annus-abrar-neroli'     },
  { id: 3, brand: 'Qalamkar',     collection: "Chikankari Eid Edit '26",   image: '/garments/product3.jpeg', href: '/drops/qalamkar-eid'           },
  { id: 4, brand: 'Mushq',        collection: "Astoria Festive Lawn '26",  image: '/garments/product4.jpeg', href: '/drops/mushq-astoria'          },
  { id: 5, brand: 'Maria B',      collection: "Luxury Lawn '26",           image: '/garments/product5.jpeg', href: '/drops/maria-b-luxury'         },
  { id: 6, brand: 'Sana Safinaz', collection: "Muzlin Summer '26",         image: '/garments/product6.jpeg', href: '/drops/sana-muzlin'            },
  { id: 7, brand: 'Gul Ahmed',    collection: "Summer Lawn '26",           image: '/garments/product7.jpeg', href: '/drops/gul-ahmed-lawn'         },
  { id: 8, brand: 'Khaadi',       collection: "Eid Pret '26",              image: '/garments/product8.jpeg', href: '/drops/khaadi-eid'             },
];

const newBrands = [
  { id: 1, name: 'Ayat Closet', tagline: 'Premium Festive Wear', items: 17, image: '/garments/product1.jpeg', href: '/brands/ayat-closet' },
  { id: 2, name: 'Afroz by...', tagline: 'Modest Fashion',       items: 56, image: '/garments/product2.jpeg', href: '/brands/afroz'       },
  { id: 3, name: 'Surmeen',     tagline: 'Casual Pret',          items: 42, image: '/garments/product3.jpeg', href: '/brands/surmeen'     },
  { id: 4, name: 'Gulman',      tagline: 'Luxury Couture',       items: 14, image: '/garments/product4.jpeg', href: '/brands/gulman'      },
  { id: 5, name: 'Lulusar',     tagline: 'Embroided Pret',       items: 99, image: '/garments/product5.jpeg', href: '/brands/lulusar'     },
  { id: 6, name: 'Khani...',    tagline: 'Festive Collection',   items: 8,  image: '/garments/product6.jpeg', href: '/brands/khani'       },
  { id: 7, name: 'Rang-e-Haya', tagline: 'Ready to Wear',        items: 33, image: '/garments/product7.jpeg', href: '/brands/rang-e-haya' },
  { id: 8, name: 'Silk Leaf',   tagline: 'Accessories & More',   items: 21, image: '/garments/product8.jpeg', href: '/brands/silk-leaf'   },
];

const BRANDS_LIST = ['Khussa Darbar', 'Malhaar', 'Haseens Official', 'Fozia Khalid', 'Sana Safinaz', 'Maria B'];

const newProducts = Array.from({ length: 96 }, (_, i) => ({
  id: i + 1,
  name: ['Snow-White Khussa', 'ML-AZL-24-DGP-235', 'Zulaikha', 'Embroided Cutwork', 'Festive Lawn Set', 'Luxury Pret'][i % 6],
  brand: BRANDS_LIST[i % 6],
  price: parseFloat((15 + ((i * 7.3) % 130)).toFixed(2)),
  originalPrice: parseFloat((20 + ((i * 9.1) % 160)).toFixed(2)),
  discount: [5, 16, 20, 30, 38, 47][i % 6],
  image: `/garments/product${(i % 16) + 1}.jpeg`,
  rating: parseFloat((3.8 + ((i * 0.13) % 1.2)).toFixed(1)),
  reviews: 5 + (i * 3 % 50),
  express: i % 3 !== 2,
  isNew: true,
}));

// ── Time Filter ───────────────────────────────────────────────────────────────

function TimeFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
      >
        <Calendar size={14} className="text-muted-foreground" />
        {value}
        <ChevronRight size={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 z-30 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
          {TIME_FILTERS.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${value === opt ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Carousel Section ──────────────────────────────────────────────────────────

function CarouselSection({ title, items, timeFilter, onTimeFilterChange, renderCard, visibleRatio = 3.5 }: {
  title: string; items: any[]; timeFilter: string; onTimeFilterChange: (v: string) => void;
  renderCard: (item: any, i: number) => React.ReactNode; visibleRatio?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const GAP = 16;

  const scroll = (dir: 'prev' | 'next') => {
    const t = trackRef.current; if (!t) return;
    t.scrollBy({ left: dir === 'next' ? t.clientWidth / visibleRatio + GAP : -(t.clientWidth / visibleRatio + GAP), behavior: 'smooth' });
  };
  const onScroll = () => {
    const t = trackRef.current; if (!t) return;
    setAtStart(t.scrollLeft <= 4);
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
  };

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-3">
          <TimeFilter value={timeFilter} onChange={onTimeFilterChange} />
          <button type="button" onClick={() => scroll('prev')} disabled={atStart}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          ><ChevronLeft size={16} /></button>
          <button type="button" onClick={() => scroll('next')} disabled={atEnd}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          ><ChevronRight size={16} /></button>
        </div>
      </div>
      <div ref={trackRef} onScroll={onScroll} className="flex gap-4 overflow-x-auto mx-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((item, i) => (
          <div key={i} className="shrink-0" style={{ width: `calc(100% / ${visibleRatio})` }}>
            {renderCard(item, i)}
          </div>
        ))}
        <div className="shrink-0" style={{ width: `calc(100% / ${visibleRatio})` }}>
          <Link href="#" className="group flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border border-border bg-muted/40 hover:bg-muted transition-colors w-full">
            <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">View More</span>
            <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary mt-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Collection Card ───────────────────────────────────────────────────────────

function CollectionCard({ item }: { item: typeof newCollections[0] }) {
  return (
    <Link href={item.href} className="group relative flex flex-col overflow-hidden rounded-2xl aspect-[3/4] bg-muted">
      <Image src={item.image} alt={item.brand} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <p className="text-white font-semibold text-base leading-tight">{item.brand}</p>
        <p className="text-white/80 text-sm mt-0.5">{item.collection}</p>
      </div>
    </Link>
  );
}

// ── Brand Card ────────────────────────────────────────────────────────────────

function BrandCard({ item }: { item: typeof newBrands[0] }) {
  return (
    <Link href={item.href} className="group flex flex-col gap-2">
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        <Image src={item.image} alt={item.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex items-center gap-2 px-0.5">
        <div className="relative w-7 h-7 rounded-md overflow-hidden bg-muted border border-border shrink-0">
          <Image src={item.image} alt={item.name} fill className="object-cover object-top" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
          <p className="text-[11px] text-muted-foreground">{item.items} items</p>
        </div>
      </div>
    </Link>
  );
}

// ── Newly Launched — filters ──────────────────────────────────────────────────

const NL_FILTER_OPTIONS = {
  category: ['All', 'Women', 'Men', 'Kids', 'Beauty'],
  sortBy:   ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated'],
  fabric:   ['All', 'Cotton', 'Silk', 'Lawn', 'Chiffon', 'Linen'],
  price:    ['All', 'Under $25', '$25–$75', '$75–$125', 'Over $125'],
  size:     ['All', 'XS', 'S', 'M', 'L', 'XL'],
  color:    ['All', 'White', 'Black', 'Green', 'Blue', 'Pink'],
  brand:    ['All', ...BRANDS_LIST],
};

type NLFilters = {
  category: string; sortBy: string; inStock: boolean;
  fabric: string; price: string; size: string; color: string; brand: string;
};

const NL_DEFAULT: NLFilters = {
  category: 'All', sortBy: 'Recommended', inStock: false,
  fabric: 'All', price: 'All', size: 'All', color: 'All', brand: 'All',
};

function NLFilterDropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const active = value !== 'All' && value !== 'Recommended';
  return (
    <div ref={ref} className="relative shrink-0">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap
          ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:bg-muted'}`}
      >
        {active ? value : label}
        <ChevronRight size={13} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[170px]">
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${value === opt ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Newly Launched Product Card ───────────────────────────────────────────────

function NewlyLaunchedCard({ item }: { item: typeof newProducts[0] }) {
  return (
    <Link href={`/product/${item.id}`} className="group flex flex-col gap-1.5">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <Image src={item.image} alt={item.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{item.discount}%</span>
        </div>
        <button type="button" onClick={e => e.preventDefault()} className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-md">New</span>
        </div>
        <button type="button" onClick={e => e.preventDefault()} className="absolute bottom-3 right-3 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2">
          <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      <div className="flex items-start justify-between gap-2 px-0.5">
        <div className="flex-1 min-w-0">
          <span className="text-base font-bold text-primary">$ {item.price.toFixed(2)}</span>
          <div><span className="text-xs text-muted-foreground line-through">$ {item.originalPrice.toFixed(2)}</span></div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{item.brand} • {item.name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {item.express && (
              <span className="flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">⚡ Express</span>
            )}
            {item.rating >= 4 && (
              <span className="text-xs text-amber-500 font-medium">★ {item.rating} ({item.reviews})</span>
            )}
          </div>
        </div>
        <button type="button" onClick={e => e.preventDefault()}
          className="shrink-0 w-9 h-9 rounded-full border border-border hover:bg-muted transition-colors flex items-center justify-center mt-0.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </button>
      </div>
    </Link>
  );
}

// ── Newly Launched Section (infinite scroll) ──────────────────────────────────

function NewlyLaunched() {
  const PAGE_SIZE = 8;
  const [filters, setFilters] = useState<NLFilters>(NL_DEFAULT);
  const [productsTime, setProductsTime] = useState('Last 7 days');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const setFilter = (key: keyof NLFilters) => (val: string | boolean) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'sortBy' && v !== 'All' && v !== false
  ).length;

  const filtered = newProducts.filter(p => {
    if (filters.brand !== 'All' && p.brand !== filters.brand) return false;
    if (filters.price !== 'All') {
      if (filters.price === 'Under $25'  && p.price >= 25)                   return false;
      if (filters.price === '$25–$75'    && (p.price < 25 || p.price > 75))  return false;
      if (filters.price === '$75–$125'   && (p.price < 75 || p.price > 125)) return false;
      if (filters.price === 'Over $125'  && p.price <= 125)                  return false;
    }
    return true;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setLoading(true);
        setTimeout(() => { setPage(p => p + 1); setLoading(false); }, 500);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Newly Launched</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length.toLocaleString()} Items</p>
        </div>
        <TimeFilter value={productsTime} onChange={setProductsTime} />
      </div>

      <div className="flex items-center gap-2 my-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <NLFilterDropdown label="Category" options={NL_FILTER_OPTIONS.category} value={filters.category} onChange={setFilter('category')} />
        <button type="button"
          className={`flex items-center justify-center w-9 h-9 rounded-full border shrink-0 transition-colors
            ${activeCount > 0 ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-muted'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
          </svg>
        </button>
        <NLFilterDropdown label="Sort By" options={NL_FILTER_OPTIONS.sortBy} value={filters.sortBy} onChange={setFilter('sortBy')} />
        <button type="button" onClick={() => setFilter('inStock')(!filters.inStock)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-colors shrink-0"
        >
          In-stock
          <div className={`relative w-9 h-5 rounded-full transition-colors ${filters.inStock ? 'bg-green-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
        <NLFilterDropdown label="Fabric" options={NL_FILTER_OPTIONS.fabric} value={filters.fabric} onChange={setFilter('fabric')} />
        <NLFilterDropdown label="Price"  options={NL_FILTER_OPTIONS.price}  value={filters.price}  onChange={setFilter('price')}  />
        <NLFilterDropdown label="Size"   options={NL_FILTER_OPTIONS.size}   value={filters.size}   onChange={setFilter('size')}   />
        <NLFilterDropdown label="Color"  options={NL_FILTER_OPTIONS.color}  value={filters.color}  onChange={setFilter('color')}  />
        <NLFilterDropdown label="Brands" options={NL_FILTER_OPTIONS.brand}  value={filters.brand}  onChange={setFilter('brand')}  />
        {activeCount > 0 && (
          <button type="button" onClick={() => { setFilters(NL_DEFAULT); setPage(1); }}
            className="px-4 py-2 rounded-full border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
          >Clear ({activeCount})</button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-5">
        {visible.map(item => <NewlyLaunchedCard key={item.id} item={item} />)}
      </div>

      <div ref={sentinelRef} className="mt-10 flex justify-center items-center min-h-[48px]">
        {loading && (
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <div className="w-5 h-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
            Loading more products…
          </div>
        )}
        {!hasMore && visible.length > 0 && (
          <p className="text-sm text-muted-foreground">You've seen all {filtered.length} products</p>
        )}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewArrivalsPage() {
  const [collectionsTime, setCollectionsTime] = useState('Last 7 days');
  const [brandsTime, setBrandsTime] = useState('Last 30 days');

  return (
    <div className="w-full px-40 py-8">
      <div className="flex justify-center mb-12">
        <div className="border-2 border-dashed rounded-2xl px-24 py-6" style={{ borderColor: '#C8912A' }}>
          <h1 className="text-4xl font-bold tracking-widest uppercase" style={{ color: '#C8912A' }}>New On JDM</h1>
        </div>
      </div>
      <CarouselSection
        title="New Collections" items={newCollections}
        timeFilter={collectionsTime} onTimeFilterChange={setCollectionsTime}
        renderCard={(item) => <CollectionCard key={item.id} item={item} />}
      />
      <CarouselSection
        title="New Brands" items={newBrands}
        timeFilter={brandsTime} onTimeFilterChange={setBrandsTime}
        visibleRatio={6.5}
        renderCard={(item) => <BrandCard key={item.id} item={item} />}
      />
      <NewlyLaunched />
    </div>
  );
}