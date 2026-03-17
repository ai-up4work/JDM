'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Search, SlidersHorizontal, X,
  ShoppingBag, Heart, MapPin, Clock, Truck,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  tags: string[];
  express?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: '1',  name: 'Classic Red Rose Bouquet',    price: 3200,                       image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80', category: 'Bouquets',     badge: 'bestseller', tags: ['roses','classic'],       express: true  },
//   { id: '2',  name: 'Pastel Mixed Arrangement',    price: 4500,                       image: 'https://images.unsplash.com/photo-1477449472891-a9f05dc3e5af?w=600&q=80', category: 'Bouquets',     tags: ['mixed','pastel'],         express: true  },
  { id: '3',  name: 'White Lily Elegance',         price: 3800,                       image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&q=80', category: 'Bouquets',     badge: 'new',        tags: ['lilies','white']                     },
  { id: '4',  name: 'Sunflower Joy Bundle',        price: 2900,                       image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80', category: 'Bouquets',     tags: ['sunflowers','bright'],    express: true  },
//   { id: '5',  name: 'Pink Peony Dream',            price: 5500,                       image: 'https://images.unsplash.com/photo-1560717845-968823efbee1?w=600&q=80', category: 'Bouquets',     badge: 'limited',    tags: ['peonies','pink']                     },
  { id: '6',  name: 'Tropical Exotic Mix',         price: 4800,                       image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80', category: 'Bouquets',     tags: ['tropical','exotic']                   },
  { id: '7',  name: 'Birthday Celebration Box',    price: 5200,                       image: 'https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=600&q=80', category: 'Gift Boxes',   badge: 'bestseller', tags: ['birthday','gift'],        express: true  },
//   { id: '8',  name: 'Anniversary Rose Heart',      price: 6800,                       image: 'https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?w=600&q=80', category: 'Gift Boxes',   tags: ['anniversary','roses'],    express: true  },
//   { id: '9',  name: 'New Baby Soft Blooms',        price: 4200,                       image: 'https://images.unsplash.com/photo-1487530811015-780780169e54?w=600&q=80', category: 'Gift Boxes',   badge: 'new',        tags: ['baby','soft']                        },
//   { id: '10', name: 'Corporate Desk Arrangement',  price: 3500,                       image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc46?w=600&q=80', category: 'Arrangements', tags: ['corporate','desk']                    },
  { id: '11', name: 'Orchid Premium Pot',          price: 7200,                       image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&q=80', category: 'Potted',       badge: 'premium',    tags: ['orchid','potted']                    },
  { id: '12', name: 'Succulent Garden Set',        price: 2400,                       image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&q=80', category: 'Potted',       tags: ['succulent','set']                     },
//   { id: '13', name: 'Wedding Table Centrepiece',   price: 9500,                       image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', category: 'Arrangements', badge: 'new',        tags: ['wedding','centrepiece']              },
  { id: '14', name: 'Dried Pampas & Wheat Bundle', price: 3100,                       image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&q=80', category: 'Dried',        tags: ['dried','pampas'],         express: true  },
  { id: '15', name: 'Romantic Deep Red Roses',     price: 4400, originalPrice: 5200,  image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80', category: 'Bouquets',     badge: 'sale',       tags: ['roses','romantic'],      express: true  },
  { id: '16', name: 'Garden Fresh Wildflower Mix', price: 2800,                       image: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&q=80', category: 'Bouquets',     tags: ['wildflower','fresh']                  },
//   { id: '17', name: 'Lavender & White Bundle',     price: 3600,                       image: 'https://images.unsplash.com/photo-1499578124509-1611b77778c8?w=600&q=80', category: 'Bouquets',     badge: 'new',        tags: ['lavender','white']                   },
//   { id: '18', name: 'Bespoke Gift Hamper',         price: 8900,                       image: 'https://images.unsplash.com/photo-1563241527-3034197836ec?w=600&q=80', category: 'Gift Boxes',   tags: ['hamper','bespoke'],       express: true  },
];

const CATEGORIES = ['All', 'Bouquets', 'Gift Boxes', 'Arrangements', 'Potted', 'Dried'];

const SORT_OPTIONS = [
  { label: 'Most Popular',        value: 'popular'    },
  { label: 'Newest',              value: 'newest'     },
  { label: 'Price: Low to High',  value: 'price-low'  },
  { label: 'Price: High to Low',  value: 'price-high' },
];

const BADGE_COLORS: Record<string, string> = {
  bestseller: 'bg-amber-500',
  sale:       'bg-red-500',
  new:        'bg-violet-500',
  limited:    'bg-rose-600',
  premium:    'bg-foreground',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSheet({
  sortBy, setSortBy, onClose,
}: {
  sortBy: string; setSortBy: (v: string) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="w-full bg-background rounded-t-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="text-base font-semibold">Sort</span>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => { setSortBy(opt.value); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${sortBy === opt.value ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}
            >{opt.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BloomAndCoPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy,         setSortBy]         = useState('popular');
  const [search,         setSearch]         = useState('');
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [wished,         setWished]         = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      const matchCat    = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    switch (sortBy) {
      case 'price-low':  list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-high': list = [...list].sort((a, b) => b.price - a.price); break;
    }
    return list;
  }, [activeCategory, sortBy, search]);

  const toggleWish = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setWished(w => { const n = new Set(w); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky Nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Bloom & Co.</span>
          </div>

          {/* Category pills — desktop */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${activeCategory === cat
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
              >{cat}</button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground hidden sm:block shrink-0">
            <span className="text-foreground font-semibold">{filtered.length}</span> items
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 min-w-0">

          {/* ── Store header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300 uppercase tracking-wider">
                  New
                </span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] uppercase tracking-wider">
                  Template
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight mb-1">
                Bloom & Co.
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Fresh flower arrangements and bouquets for every occasion, delivered same-day in Colombo.
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={12} /> Colombo only
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={12} /> Same-day delivery
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck size={12} /> COD available
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input type="text" placeholder="Search arrangements…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm
                  placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
          </div>

          {/* ── Mobile: category scroll + filter button ── */}
          <div className="flex md:hidden items-center gap-2 mb-5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-10 sm:px-10 pb-1">
            <button type="button" onClick={() => setFilterOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-medium hover:bg-secondary transition-colors">
              <SlidersHorizontal size={13} /> Sort
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap
                  ${activeCategory === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:bg-secondary'}`}
              >{cat}</button>
            ))}
          </div>

          {/* ── sm+: sort bar ── */}
          <div className="hidden md:flex items-center gap-2 mb-6 sm:mb-8">
            <button type="button"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-secondary transition-colors shrink-0">
              <SlidersHorizontal size={15} />
            </button>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setSortBy(opt.value)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap
                  ${sortBy === opt.value && opt.value !== 'popular'
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:bg-secondary'}`}
              >{opt.label}</button>
            ))}
          </div>

          {/* ── Product grid ── */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm mb-4">No arrangements found.</p>
              <button type="button" onClick={() => { setActiveCategory('All'); setSearch(''); }}
                className="px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map(product => (
                <Link key={product.id} href={`/stores/bloom-and-co/${product.id}`}
                  className="group flex flex-col gap-2 min-w-0">

                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                        <span className={`text-white text-[10px] font-bold px-2 py-1 rounded-md capitalize ${BADGE_COLORS[product.badge]}`}>
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Wishlist */}
                    <button type="button" onClick={e => toggleWish(product.id, e)}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={14} className={wished.has(product.id) ? 'fill-red-500 text-red-500' : 'text-foreground'} />
                    </button>

                    {/* Express badge */}
                    {product.express && (
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="flex items-center gap-1 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          ⚡ Same-day
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-1 sm:gap-2 px-0.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-foreground">
                          LKR {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through hidden sm:inline">
                            LKR {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                        {product.category}
                      </p>
                    </div>

                    {/* Add to cart */}
                    <button type="button" onClick={e => e.preventDefault()}
                      className="shrink-0 p-1.5 sm:p-2 rounded-xl border border-border hover:bg-secondary transition-colors mt-0.5">
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Mobile filter sheet */}
      {filterOpen && (
        <FilterSheet sortBy={sortBy} setSortBy={setSortBy} onClose={() => setFilterOpen(false)} />
      )}

    </div>
  );
}