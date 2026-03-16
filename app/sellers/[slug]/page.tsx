'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Star, Users, Package,
  CheckCircle, Heart, Share2, ShoppingBag, MapPin,
} from 'lucide-react';
import { sellers } from '@/lib/mockData';

// ── Mock seller products ──────────────────────────────────────────────────────

const SELLER_PRODUCTS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: [
    'Oud Al Layl', 'Rose Musk Attar', 'Ceylon Oud', 'Jasmine Absolute',
    'Amber Noir', 'Sandalwood Pure', 'White Musk', 'Saffron Blend',
    'Royal Oud', 'Henna Floral', 'Frankincense', 'Black Musk',
  ][i % 12],
  price: parseFloat((800 + Math.random() * 4200).toFixed(0)),
  originalPrice: parseFloat((1200 + Math.random() * 5000).toFixed(0)),
  discount: [10, 15, 20, 25, 30, 35][i % 6],
  image: `/garments/product${(i % 16) + 1}.jpeg`,
  rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
  reviews: Math.floor(4 + Math.random() * 60),
  volume: ['3ml', '6ml', '12ml', '25ml'][i % 4],
  isNew: i % 7 === 0,
  isBestseller: i % 5 === 0,
  express: i % 3 !== 2,
  hasVideo: i % 6 === 0,
}));

const REVIEWS = [
  { id: 1, name: 'Amara S.',   rating: 5, date: '10 Mar 2026', text: 'Amazing quality and fast delivery. Will definitely order again!',       verified: true  },
  { id: 2, name: 'Roshan P.',  rating: 5, date: '5 Mar 2026',  text: 'Best local seller for attar. The packaging is beautiful too.',          verified: true  },
  { id: 3, name: 'Fathima N.', rating: 4, date: '1 Mar 2026',  text: 'Lovely scents and very authentic. Communication was excellent.',         verified: true  },
  { id: 4, name: 'Kasun W.',   rating: 5, date: '20 Feb 2026', text: 'Ordered as a gift and everyone loved it. Highly recommend this seller.', verified: false },
  { id: 5, name: 'Dilnoza R.', rating: 4, date: '14 Feb 2026', text: 'Smooth, deep and very pleasant. Will be a repeat customer for sure.',    verified: true  },
];

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
          ${active
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-background text-foreground hover:bg-secondary'
          }`}
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

// ── Products tab ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Top Rated'];
const PAGE_SIZE = 8;

function SellerProducts() {
  const [sortBy, setSortBy]   = useState('Recommended');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef           = useRef<HTMLDivElement>(null);

  const sorted = [...SELLER_PRODUCTS].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Top Rated')          return b.rating - a.rating;
    if (sortBy === 'Newest')             return b.id - a.id;
    return 0;
  });

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  useEffect(() => { setPage(1); }, [sortBy]);

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

  return (
    <>
      <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide px-3 sm:mx-0 sm:px-0">
        <FilterDropdown label="Sort By" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {visible.map((product) => (
          <Link key={product.id} href={`/shop/${product.id}`} className="group flex flex-col gap-2 min-w-0">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                {product.isNew ? (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md">NEW</span>
                ) : product.isBestseller ? (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md">BEST</span>
                ) : (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{product.discount}%</span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              {product.hasVideo && (
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10 bg-black/50 rounded-full p-1.5">
                  <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3"><path d="M8 5v14l11-7z"/></svg>
                </div>
              )}
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10">
                <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">{product.volume}</span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-1 sm:gap-2 px-0.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-foreground">LKR {product.price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground line-through hidden sm:inline">LKR {product.originalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{product.name}</p>
                <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-1.5 flex-wrap">
                  {product.express ? (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200">
                      ⚡ Express
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-gray-200">
                      ➜ 7 Days
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground hidden sm:inline">★ {product.rating} ({product.reviews})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
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

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mt-3 sm:mt-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 min-w-0 animate-pulse">
              <div className="w-full aspect-[3/4] rounded-2xl bg-muted" />
              <div className="px-0.5 flex flex-col gap-1.5">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="mt-8 flex justify-center">
        {!hasMore && visible.length > 0 && (
          <p className="text-sm text-muted-foreground">You&apos;ve seen all {sorted.length} products</p>
        )}
      </div>
    </>
  );
}

// ── Reviews tab ───────────────────────────────────────────────────────────────

function SellerReviews({ rating }: { rating: number }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-6 p-5 rounded-2xl border border-border bg-secondary/40 mb-6">
        <div className="text-center shrink-0">
          <p className="text-5xl font-bold text-foreground">{rating}</p>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{REVIEWS.length} reviews</p>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = REVIEWS.filter((r) => r.rating === star).length;
            const pct   = Math.round((count / REVIEWS.length) * 100);
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{star}</span>
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {REVIEWS.map((review) => {
        const initials = review.name.split(' ').map((n) => n[0]).join('');
        return (
          <div key={review.id} className="flex gap-3 py-4 border-b border-border last:border-0">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-foreground">{review.name}</span>
                {review.verified && (
                  <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto shrink-0">{review.date}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SellerProfilePage({ params }: { params: { slug: string } }) {
  // ← match on slug field, not id
  const seller = sellers.find((s) => s.slug === params.slug) ?? sellers[0];

  const [followed,  setFollowed]  = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: seller.name, url: window.location.href }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden max-w-7xl sm:px-6 lg:px-40 px-4">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/sellers" className="hover:text-foreground transition-colors">Sellers</Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium truncate">{seller.name}</span>
        </div>

        {/* ── Seller header ── */}
        <section className="mb-10 sm:mb-16">
          <div className="rounded-2xl border border-border bg-background overflow-hidden">

            <div className="relative h-32 sm:h-44 bg-gradient-to-br from-primary/90 to-primary">
              <button
                type="button"
                onClick={handleShare}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors"
              >
                <Share2 size={16} />
              </button>
            </div>

            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="flex items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-background bg-muted shrink-0">
                  <Image src={seller.logo} alt={seller.name} fill className="object-cover object-top" />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <button
                    type="button"
                    onClick={() => setFollowed((f) => !f)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors
                      ${followed
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground hover:bg-secondary'
                      }`}
                  >
                    <Heart size={14} className={followed ? 'fill-current' : ''} />
                    {followed ? 'Following' : 'Follow'}
                  </button>
                  <Link
                    href={`/shop?seller=${seller.slug}`}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-foreground text-background text-xs sm:text-sm font-semibold hover:bg-foreground/90 transition-colors"
                  >
                    <ShoppingBag size={14} /> Shop
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{seller.name}</h1>
                {seller.verified && (
                  <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>

              {seller.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin size={11} /> {seller.location}
                </div>
              )}

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
                {seller.description}
              </p>

              <div className="flex items-center gap-3 sm:gap-4 py-3.5 border-t border-border flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground">{seller.rating}</span>
                  <span className="text-xs text-muted-foreground">rating</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground">{seller.followers.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">followers</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Package size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground">{seller.products}</span>
                  <span className="text-xs text-muted-foreground">products</span>
                </div>
                {seller.totalSales && (
                  <>
                    <div className="w-px h-4 bg-border hidden sm:block" />
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={13} className="text-muted-foreground shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-foreground">{seller.totalSales.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">sales</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-border mb-6 sm:mb-8">
          {(['products', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                ${activeTab === tab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab === 'products'
                ? `Products (${SELLER_PRODUCTS.length})`
                : `Reviews (${REVIEWS.length})`
              }
            </button>
          ))}
        </div>

        {activeTab === 'products' && <SellerProducts />}
        {activeTab === 'reviews'  && <SellerReviews rating={seller.rating} />}

      </div>
    </div>
  );
}