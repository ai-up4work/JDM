'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Users, Package, CheckCircle, Search } from 'lucide-react';
import { sellers } from '@/lib/mockData';

// ── FilterDropdown — identical to landing page ────────────────────────────────

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
  const active = value !== 'All' && value !== 'Recommended' && value !== '';
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
          ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:bg-secondary'}`}
      >
        {active ? value : label}
        <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[140px] sm:min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors
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

// ── Seller Card ───────────────────────────────────────────────────────────────
function SellerCard({ seller }: { seller: typeof sellers[0] }) {
  return (
    <Link
      href={`/sellers/${seller.slug}`}  // ← slug not id
      className="group flex flex-col rounded-2xl border border-border bg-background overflow-hidden hover:border-foreground/20 transition-all"
    >
      <div className="relative h-28 sm:h-32 bg-gradient-to-br from-primary/90 to-primary shrink-0">
        <div className="absolute -bottom-8 left-5">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-background bg-muted">
            <Image src={seller.logo} alt={seller.name} fill className="object-cover object-top" />
          </div>
        </div>
      </div>

      <div className="pt-10 sm:pt-12 px-5 pb-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
            {seller.name}
          </h3>
          {seller.verified && (
            <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200 shrink-0 mt-0.5">
              <CheckCircle size={10} /> Verified
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">
          {seller.description}
        </p>

        <div className="flex items-center gap-3 sm:gap-4 py-3.5 border-y border-border mb-4">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">{seller.rating}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">{seller.followers.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Package size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">{seller.products} items</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full py-2.5 rounded-xl bg-foreground text-background text-xs sm:text-sm font-semibold hover:bg-foreground/90 transition-colors mt-auto"
        >
          Visit Store
        </button>
      </div>
    </Link>
  );
}

// ── Featured Sellers — same arrow/swipe pattern as NewInCarousel ──────────────

function FeaturedSellersCarousel() {
  const [start, setStart] = useState(0);
  const [colCount, setColCount] = useState(3);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640)       setColCount(1);
      else if (window.innerWidth < 1024) setColCount(2);
      else                               setColCount(3);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const featured = sellers.filter((s) => s.verified).slice(0, 6);
  const canPrev = start > 0;
  const canNext = start + colCount < featured.length;

  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Featured Sellers</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStart((s) => Math.max(0, s - 1))}
            disabled={!canPrev}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setStart((s) => Math.min(featured.length - colCount, s + 1))}
            disabled={!canNext}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Mobile: native swipe */}
      <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-3 pb-1">
        {featured.map((seller) => (
          <div key={seller.id} className="shrink-0 w-[80vw] snap-start">
            <SellerCard seller={seller} />
          </div>
        ))}
      </div>

      {/* sm+: arrow-controlled grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {featured.slice(start, start + colCount).map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </section>
  );
}

// ── All Sellers — same infinite scroll pattern as TrendingProducts ────────────

const SORT_OPTIONS = ['All', 'Top Rated', 'Most Products', 'Most Followers'];
const PAGE_SIZE = 6;

function AllSellers() {
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState('All');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = sellers
    .filter((s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'Top Rated')      return b.rating - a.rating;
      if (sort === 'Most Products')  return b.products - a.products;
      if (sort === 'Most Followers') return b.followers - a.followers;
      return 0;
    });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => { setPage(1); }, [search, sort]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setLoading(true);
        setTimeout(() => { setPage((p) => p + 1); setLoading(false); }, 500);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  const activeFilterCount = (sort !== 'All' ? 1 : 0) + (search ? 1 : 0);

  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">All Sellers</h2>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide px-3 sm:mx-0 sm:px-0">
        <div className="relative shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-full border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors w-40 sm:w-52"
          />
        </div>

        <FilterDropdown label="Sort By" options={SORT_OPTIONS} value={sort} onChange={setSort} />

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => { setSort('All'); setSearch(''); }}
            className="px-3 sm:px-4 py-2 rounded-full border border-red-300 text-red-500 text-xs sm:text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No sellers match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visible.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-4 sm:mt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
              <div className="h-28 sm:h-32 bg-muted" />
              <div className="pt-10 px-5 pb-5 flex flex-col gap-3">
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
                <div className="h-10 w-full rounded-xl bg-muted mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="mt-8 flex justify-center">
        {!hasMore && visible.length > 0 && (
          <p className="text-sm text-muted-foreground">You&apos;ve seen all {filtered.length} sellers</p>
        )}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SellersPage() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden max-w-7xl sm:px-6 lg:px-40 px-4">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">

        <section className="mb-10 sm:mb-16">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium">Sellers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-1">Our Sellers</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Discover verified local sellers on JDM</p>
        </section>

        <FeaturedSellersCarousel />
        <AllSellers />

        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-5 sm:mb-8">Why shop from our sellers?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { emoji: '🎯', title: 'Verified sellers',    desc: 'Every seller is reviewed and approved by our team before going live. Quality is non-negotiable.'   },
              { emoji: '⭐', title: 'Professional photos', desc: 'We edit every product photo to professional standard — so you see exactly what you get.'           },
              { emoji: '🛡️', title: 'Buyer protection',   desc: '7-day return policy and full money-back guarantee on every purchase, no questions asked.'            },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
                <span className="text-3xl sm:text-4xl mb-3 block">{emoji}</span>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}