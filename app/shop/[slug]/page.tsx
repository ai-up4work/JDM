'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Share2, Heart, ShoppingBag, Star, ChevronDown, Check, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const PRODUCT = {
  id: 1,
  slug: 'oud-al-layl',
  name: 'Oud Al Layl',
  subtitle: 'Pure Ceylon Oud Attar',
  seller: { name: 'Colombo Oud', slug: 'colombo-oud', rating: 4.9, totalSales: 312, verified: true, avatar: '/garments/product3.jpeg' },
  price: 2800,
  originalPrice: 4200,
  discount: 33,
  rating: 4.8,
  reviewCount: 47,
  description: `Oud Al Layl is a rare, hand-distilled attar crafted from aged Ceylon oud chips sourced from the hill country. The opening is rich and resinous with a warm woody heart, settling into a silky, long-lasting base of white musk and amber.\n\nThis is a non-alcoholic, skin-safe attar — suitable for daily wear and gifting. Each bottle is hand-filled and sealed.`,
  ingredients: 'Pure Oud Oil, White Musk Base, Ambergris, Sandalwood',
  volumes: [
    { label: '3ml',  price: 2800,  originalPrice: 4200  },
    { label: '6ml',  price: 4800,  originalPrice: 7000  },
    { label: '12ml', price: 8500,  originalPrice: 12000 },
    { label: '25ml', price: 15000, originalPrice: 20000 },
  ],
  images: [
    '/garments/product1.jpeg',
    '/garments/product2.jpeg',
    '/garments/product3.jpeg',
    '/garments/product4.jpeg',
    '/garments/product5.jpeg',
  ],
  category: 'Oud',
  scent: 'Woody',
  gender: 'Unisex',
  tags: ['Oud', 'Attar', 'Ceylon', 'Non-alcoholic', 'Gifting'],
  inStock: true,
};

const REVIEWS = [
  { id: 1, name: 'Amara S.',     avatar: null, rating: 5, date: '12 Mar 2026', text: 'Absolutely stunning scent. Long-lasting and very authentic. Will definitely order again.', verified: true  },
  { id: 2, name: 'Roshan P.',    avatar: null, rating: 5, date: '8 Mar 2026',  text: 'Best oud I have tried from a local seller. The packaging was also beautiful.', verified: true  },
  { id: 3, name: 'Fathima N.',   avatar: null, rating: 4, date: '2 Mar 2026',  text: 'Really lovely. I bought the 6ml and it lasts me weeks. Great value for the price.', verified: true  },
  { id: 4, name: 'Kasun W.',     avatar: null, rating: 5, date: '22 Feb 2026', text: 'Gifted this to my father and he absolutely loved it. Top quality.', verified: false },
  { id: 5, name: 'Dilnoza R.',   avatar: null, rating: 4, date: '14 Feb 2026', text: 'Smooth, deep and very pleasant. The wooden cap is a nice touch.', verified: true  },
];

const RELATED = Array.from({ length: 6 }, (_, i) => ({
  id: i + 10,
  name: ['Rose Musk Attar', 'Amber Noir', 'Sandalwood Pure', 'White Musk', 'Jasmine Absolute', 'Saffron Blend'][i],
  seller: 'Colombo Oud',
  price: [1800, 3200, 2400, 1600, 2200, 3800][i],
  originalPrice: [2500, 4500, 3200, 2200, 3000, 5000][i],
  discount: [28, 29, 25, 27, 27, 24][i],
  image: `/garments/product${i + 6}.jpeg`,
  rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
  volume: ['3ml', '6ml', '12ml', '3ml', '6ml', '25ml'][i],
}));

// ── Star Rating ───────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
}

// ── Image Gallery ─────────────────────────────────────────────────────────────

function Gallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative w-full aspect-square sm:aspect-[4/5] overflow-hidden rounded-2xl bg-muted cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={images[active]}
          alt="Product"
          fill
          className="object-cover object-top transition-all duration-300"
          priority
        />
        {/* Nav arrows */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setActive((a) => Math.max(0, a - 1)); }}
          disabled={active === 0}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 disabled:opacity-30 hover:bg-white transition-colors z-10"
        >
          <ChevronLeft size={16} className="text-black" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setActive((a) => Math.min(images.length - 1, a + 1)); }}
          disabled={active === images.length - 1}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 disabled:opacity-30 hover:bg-white transition-colors z-10"
        >
          <ChevronRight size={16} className="text-black" />
        </button>
        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full z-10">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
              i === active ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-90'
            }`}
          >
            <Image src={img} alt="" fill className="object-cover object-top" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
          <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden">
            <Image src={images[active]} alt="Product zoomed" fill className="object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Volume Selector ───────────────────────────────────────────────────────────

function VolumeSelector({
  volumes, selected, onSelect,
}: {
  volumes: typeof PRODUCT.volumes;
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">Select Volume</p>
      <div className="flex gap-2 flex-wrap">
        {volumes.map((v, i) => (
          <button
            key={v.label}
            type="button"
            onClick={() => onSelect(i)}
            className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${i === selected
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-foreground hover:border-foreground/40'
              }`}
          >
            <span>{v.label}</span>
            <span className={`text-xs ${i === selected ? 'text-background/70' : 'text-muted-foreground'}`}>
              LKR {v.price.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
  const initials = review.name.split(' ').map((n) => n[0]).join('');
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{review.name}</span>
          {review.verified && (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
              <Check size={10} /> Verified
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto shrink-0">{review.date}</span>
        </div>
        <Stars rating={review.rating} size={12} />
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{review.text}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const product = PRODUCT; // swap with: await getProductBySlug(params.slug)

  const [selectedVolume, setSelectedVolume] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const currentVolume = product.volumes[selectedVolume];

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url: window.location.href }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden max-w-7xl sm:px-6 lg:px-40 px-4">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 min-w-0">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

          {/* Left — Gallery */}
          <Gallery images={product.images} />

          {/* Right — Info */}
          <div className="flex flex-col gap-5">

            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{product.category}</span>
                    {product.inStock
                      ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">IN STOCK</span>
                      : <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">OUT OF STOCK</span>
                    }
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight">{product.name}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{product.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setWished((w) => !w)}
                    className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
                  >
                    <Heart size={18} className={wished ? 'fill-red-500 text-red-500' : 'text-foreground'} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
                  >
                    <Share2 size={18} className="text-foreground" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <Stars rating={product.rating} />
                <span className="text-sm font-semibold text-foreground">{product.rating}</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ({product.reviewCount} reviews)
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">LKR {currentVolume.price.toLocaleString()}</span>
              <span className="text-base text-muted-foreground line-through">LKR {currentVolume.originalPrice.toLocaleString()}</span>
              <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{product.discount}%</span>
            </div>

            {/* Volume */}
            <VolumeSelector
              volumes={product.volumes}
              selected={selectedVolume}
              onSelect={setSelectedVolume}
            />

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-foreground hover:bg-secondary transition-colors text-lg font-medium"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold text-foreground">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-foreground hover:bg-secondary transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
                  ${addedToCart
                    ? 'bg-emerald-500 text-white'
                    : 'bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
              >
                {addedToCart ? (
                  <><Check size={16} /> Added to cart</>
                ) : (
                  <><ShoppingBag size={16} /> Add to cart</>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-border">
              {[
                { icon: <Truck size={16} />,       label: 'Island-wide delivery' },
                { icon: <RotateCcw size={16} />,   label: '7-day returns'        },
                { icon: <ShieldCheck size={16} />, label: '100% authentic'       },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="text-muted-foreground">{b.icon}</div>
                  <span className="text-[11px] text-muted-foreground leading-tight">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Seller card */}
            <Link
              href={`/sellers/${product.seller.slug}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-border hover:border-foreground/20 hover:bg-secondary/30 transition-all group"
            >
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-muted shrink-0">
                <Image src={product.seller.avatar} alt={product.seller.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{product.seller.name}</p>
                  {product.seller.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] text-blue-600 font-medium">
                      <Check size={10} className="text-blue-600" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">★ {product.seller.rating} · {product.seller.totalSales} sales</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/shop?tag=${tag.toLowerCase()}`}
                  className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full hover:bg-secondary/80 hover:text-foreground transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* ── Tabs: Details & Reviews ── */}
        <div className="mb-12">
          <div className="flex gap-1 border-b border-border mb-6">
            {(['details', 'reviews'] as const).map((tab) => (
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
                {tab === 'reviews' ? `Reviews (${product.reviewCount})` : 'Details'}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="max-w-2xl">
              {/* Description */}
              <div className="mb-6">
                <div className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${!expandDesc ? 'line-clamp-4' : ''}`}>
                  {product.description}
                </div>
                <button
                  type="button"
                  onClick={() => setExpandDesc((e) => !e)}
                  className="flex items-center gap-1 text-xs font-medium text-foreground mt-2 hover:text-foreground/70 transition-colors"
                >
                  {expandDesc ? 'Show less' : 'Read more'}
                  <ChevronDown size={12} className={`transition-transform ${expandDesc ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Specs */}
              <div className="rounded-2xl border border-border overflow-hidden">
                {[
                  { label: 'Category',    value: product.category    },
                  { label: 'Scent',       value: product.scent       },
                  { label: 'Gender',      value: product.gender      },
                  { label: 'Ingredients', value: product.ingredients },
                  { label: 'Type',        value: 'Non-alcoholic Attar' },
                  { label: 'Origin',      value: 'Sri Lanka'          },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-start gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-secondary/40' : ''}`}
                  >
                    <span className="text-muted-foreground w-28 shrink-0">{row.label}</span>
                    <span className="text-foreground font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-2xl">
              {/* Rating summary */}
              <div className="flex items-center gap-6 p-5 rounded-2xl bg-secondary/40 mb-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-foreground">{product.rating}</p>
                  <Stars rating={product.rating} size={16} />
                  <p className="text-xs text-muted-foreground mt-1">{product.reviewCount} reviews</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = REVIEWS.filter((r) => r.rating === star).length;
                    const pct = Math.round((count / REVIEWS.length) * 100);
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{star}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div>
                {REVIEWS.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-foreground">More from this seller</h2>
            <Link
              href={`/sellers/${product.seller.slug}`}
              className="flex items-center text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            >
              View all <ChevronRight size={16} className="ml-0.5" />
            </Link>
          </div>

          {/* Mobile: swipe */}
          <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
            {RELATED.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="group shrink-0 w-[52vw] snap-start flex flex-col gap-2">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                  <Image src={p.image} alt={p.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{p.discount}%</span>
                  <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">{p.volume}</span>
                </div>
                <div className="px-0.5">
                  <p className="text-xs text-muted-foreground">{p.seller}</p>
                  <p className="text-sm font-medium text-foreground line-clamp-1">{p.name}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-bold">LKR {p.price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground line-through">LKR {p.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* sm+: grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {RELATED.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="group flex flex-col gap-2">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                  <Image src={p.image} alt={p.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{p.discount}%</span>
                  <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">{p.volume}</span>
                </div>
                <div className="px-0.5">
                  <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{p.name}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-bold">LKR {p.price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground line-through">LKR {p.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* ── Sticky bottom bar (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background border-t border-border px-4 py-3 flex items-center gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{product.volumes[selectedVolume].label}</p>
          <p className="text-base font-bold text-foreground">LKR {currentVolume.price.toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
            ${addedToCart
              ? 'bg-emerald-500 text-white'
              : 'bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40'
            }`}
        >
          {addedToCart ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> Add to cart</>}
        </button>
      </div>

      {/* Bottom padding for sticky bar on mobile */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}