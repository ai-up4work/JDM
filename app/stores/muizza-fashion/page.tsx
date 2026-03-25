// app/stores/muizza-fashion/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, ChevronLeft, Heart, Star,
  X, ArrowUpDown, Truck, AlertCircle, Search,
  Scissors, Ruler, MessageCircle, CheckCircle,
  Palette, Clock,
} from 'lucide-react';
import type { MFProduct, MFApiResponse } from '@/lib/muizza.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_FILTERS = [
  { key: '',        label: 'All Styles'  },
  { key: 'abaya',   label: 'Abayas'      },
  { key: 'gown',    label: 'Gowns'       },
  { key: 'kurti',   label: 'Kurtis'      },
  { key: 'blouse',  label: 'Blouses'     },
  { key: 'skirt',   label: 'Skirts'      },
  { key: 'suit',    label: 'Suits'       },
  { key: 'casual',  label: 'Casual Wear' },
  { key: 'bridal',  label: 'Bridal'      },
];

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest';

const WA_NUMBER = (process.env.NEXT_PUBLIC_MF_WHATSAPP ?? '+94755354830').replace(/\D/g, '');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(lkr: number) {
  return `රු${lkr.toLocaleString('en-LK')}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-muted mb-3" />
      <div className="h-2.5 w-20 rounded bg-muted mb-1.5" />
      <div className="h-3.5 w-3/4 rounded bg-muted mb-2" />
      <div className="h-3 w-1/3 rounded bg-muted" />
    </div>
  );
}

// ─── Enquiry Drawer ───────────────────────────────────────────────────────────

interface EnquiryDrawerProps {
  product: MFProduct;
  onClose: () => void;
}

function EnquiryDrawer({ product, onClose }: EnquiryDrawerProps) {
  const [name,         setName]         = useState('');
  const [phone,        setPhone]        = useState('');
  const [fabric,       setFabric]       = useState('');
  const [colour,       setColour]       = useState('');
  const [notes,        setNotes]        = useState('');
  const [measurements, setMeasurements] = useState('');

  const waText = encodeURIComponent(
    `Assalamu Alaikum! 🌙 I'd like to enquire about a custom tailoring order from Muizza Fashion.\n\n` +
    `*Style:* ${product.name}\n` +
    `*Category:* ${product.categoryLabel}\n` +
    `*Starting from:* ${fmtPrice(product.basePrice)}\n\n` +
    `*My Details:*\n` +
    `• Name: ${name || '—'}\n` +
    `• Phone: ${phone || '—'}\n` +
    `• Preferred Fabric: ${fabric || '—'}\n` +
    `• Colour Preference: ${colour || '—'}\n` +
    `• Measurements / Notes: ${measurements || '—'}\n` +
    `• Additional Notes: ${notes || '—'}\n\n` +
    `Please let me know the final price, fabric availability and estimated delivery date. Thank you! ✂️`
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-md h-full flex flex-col shadow-2xl overflow-y-auto">

        <div className="sticky top-0 bg-background/95 backdrop-blur-md z-10 flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">Custom Order</p>
            <h3 className="text-sm font-bold text-foreground line-clamp-1">{product.name}</h3>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-4 flex gap-4 border-b border-border">
          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-secondary/40 shrink-0">
            {product.image
              ? <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Scissors size={20} className="text-muted-foreground/30" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground mb-1">{product.name}</p>
            <p className="text-[11px] text-muted-foreground mb-2">{product.categoryLabel}</p>
            <p className="text-xs text-foreground font-bold">From {fmtPrice(product.basePrice)}</p>
            {product.estimatedDays > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Clock size={10} className="text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">~{product.estimatedDays} days to complete</p>
              </div>
            )}
            {product.fabric && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Available in: {product.fabric}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 flex-1">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Fill in as much as you can — we'll confirm everything with you over WhatsApp.
          </p>
          {[
            { label: 'Your name',         value: name,   setter: setName,   placeholder: 'e.g. Fathima' },
            { label: 'WhatsApp number',   value: phone,  setter: setPhone,  placeholder: 'e.g. 077 123 4567' },
            { label: 'Fabric preference', value: fabric, setter: setFabric, placeholder: 'e.g. Cotton, Georgette, Silk' },
            { label: 'Colour preference', value: colour, setter: setColour, placeholder: 'e.g. Navy blue, Dusty rose' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[11px] font-medium text-foreground mb-1.5">{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                  placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                  focus:border-foreground/30 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1.5">
              Measurements <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={measurements}
              onChange={e => setMeasurements(e.target.value)}
              placeholder="Bust, waist, hip, length, sleeve… or just mention your size"
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                focus:border-foreground/30 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1.5">
              Any other details <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Special requests, embroidery, occasion details, reference photos link…"
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                focus:border-foreground/30 transition-all resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border px-6 py-4 space-y-2">
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-bold
              flex items-center justify-center gap-2 hover:bg-[#1ebe5d] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send Enquiry via WhatsApp
          </a>
          <p className="text-[10px] text-center text-muted-foreground">
            We'll confirm fabric, pricing & delivery time with you directly.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onEnquire }: { product: MFProduct; onEnquire: (p: MFProduct) => void }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-[3/4] mb-3">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Scissors size={32} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.featured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-foreground text-background">
              Featured
            </span>
          )}
          {product.occasion && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground/70 whitespace-nowrap">
              {product.occasion.split(',')[0].trim()}
            </span>
          )}
        </div>
        {product.estimatedDays > 0 && (
          <div className="absolute top-3 right-10">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground/70 whitespace-nowrap flex items-center gap-0.5">
              <Clock size={8} />{product.estimatedDays}d
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={e => { e.preventDefault(); setWishlisted(v => !v); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
            hover:bg-white dark:hover:bg-background z-10"
        >
          <Heart size={14} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-foreground'} />
        </button>

        {/* ✅ FIXED: was `/${product.slug}` — now includes full store path */}
        <Link
          href={`/stores/muizza-fashion/${product.slug}`}
          className="absolute bottom-3 left-3 right-3 py-2.5 bg-foreground
            text-background text-xs font-bold rounded-xl text-center cursor-pointer
            translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <Ruler size={11} /> Customise this style →
        </Link>
      </div>

      <div className="flex flex-col flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
          {product.categoryLabel}
        </p>
        <Link href={`/stores/muizza-fashion/${product.slug}`}>
          <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2 hover:underline">
            {product.name}
          </p>
        </Link>
        {product.fabric && (
          <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-1">
            <span className="font-medium">Fabrics:</span> {product.fabric}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Starting from</p>
            <span className="text-sm font-bold text-foreground">{fmtPrice(product.basePrice)}</span>
          </div>
          <div className="flex items-center gap-2">
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star size={10} className="fill-foreground text-foreground" />
                <span className="text-[10px] text-muted-foreground">{product.rating.toFixed(1)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onEnquire(product)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-semibold
                hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200"
            >
              <MessageCircle size={10} /> Enquire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MuizzaFashionPage() {
  const [category,    setCategory]    = useState('');
  const [sortBy,      setSortBy]      = useState<SortKey>('popular');
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [products,   setProducts]   = useState<MFProduct[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [enquiryProduct, setEnquiryProduct] = useState<MFProduct | null>(null);
  const [showSort,       setShowSort]       = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (cat: string, pg: number, q: string, sort: SortKey) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);

    try {
      const params = new URLSearchParams({ page: String(pg), per_page: '24' });
      if (cat) params.set('category', cat);
      if (q)   params.set('search', q);

      const res = await fetch(`/api/muizza-fashion?${params}`, { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: MFApiResponse = await res.json();

      let sorted = [...data.products];
      if (sort === 'price-asc')  sorted.sort((a, b) => a.basePrice - b.basePrice);
      if (sort === 'price-desc') sorted.sort((a, b) => b.basePrice - a.basePrice);
      if (sort === 'popular')    sorted.sort((a, b) => b.rating - a.rating);

      setProducts(sorted);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(category, page, search, sortBy); }, [category, page, search, sortBy, fetchProducts]);

  const handleCategory = (c: string) => { setCategory(c); setPage(1); };
  const handleSearch   = ()          => { setSearch(searchInput); setPage(1); };

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'popular',    label: 'Most popular'    },
    { key: 'newest',     label: 'Newest'          },
    { key: 'price-asc',  label: 'Price: low–high' },
    { key: 'price-desc', label: 'Price: high–low' },
  ];

  const generalWaText = encodeURIComponent(
    `Assalamu Alaikum! 🌙 I'd like to enquire about custom tailoring at Muizza Fashion. Could you help me get started?`
  );

  return (
    <div className="min-h-screen bg-background">

      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Muizza Fashion</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {CATEGORY_FILTERS.map(f => (
              <button key={f.key} type="button" onClick={() => handleCategory(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${category === f.key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/stores/muizza-fashion/cart"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors text-xs font-semibold text-foreground"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span className="hidden sm:inline">Bag</span>
            </Link>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${generalWaText}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors text-xs font-semibold text-foreground"
            >
              <MessageCircle size={13} />
              <span className="hidden sm:inline">Enquire</span>
            </a>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          <div className="mb-10 sm:mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10 rounded-xl bg-foreground shrink-0 overflow-hidden">
                <Image src="/store-icon/muizza-fashion.png" alt="Muizza Fashion Logo" fill sizes="40px" className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-foreground tracking-tight">MUIZZA FASHION</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground uppercase tracking-wider">
                    Custom Tailoring
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Handcrafted to your exact measurements</p>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3 max-w-lg">
              Dressed perfectly.<br />Made just for you.
            </p>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Browse our sample styles — every piece is custom-tailored to your measurements, fabric choice and colour preference. No off-the-rack. No compromise.
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { icon: <Scissors size={13} />, label: 'Custom to your measurements' },
                { icon: <Palette size={13} />,  label: 'Choose your fabric & colour'  },
                { icon: <Clock size={13} />,    label: 'Ready in 5–14 days'           },
                { icon: <Truck size={13} />,    label: 'Island-wide delivery'         },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-foreground">{b.icon}</span>{b.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { step: '01', icon: <Search size={14} />,        label: 'Browse styles',      desc: 'Pick a sample you love' },
              { step: '02', icon: <MessageCircle size={14} />, label: 'Send enquiry',        desc: 'Tell us your details via WA' },
              { step: '03', icon: <Ruler size={14} />,         label: 'Share measurements',  desc: 'We guide you through it' },
              { step: '04', icon: <CheckCircle size={14} />,   label: 'Receive your order',  desc: 'Delivered island-wide' },
            ].map(s => (
              <div key={s.step} className="flex flex-col gap-2 p-4 rounded-2xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground">{s.icon}</div>
                  <span className="text-[10px] font-bold text-muted-foreground/40">{s.step}</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 sm:-mx-10 sm:px-10 pb-1">
            {CATEGORY_FILTERS.map(f => (
              <button key={f.key} type="button" onClick={() => handleCategory(f.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all
                  ${category === f.key ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search styles…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background
                    placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10
                    focus:border-foreground/30 transition-all"
                />
              </div>
              <button type="button" onClick={handleSearch}
                className="px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors shrink-0">
                Search
              </button>
              {search && (
                <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-sm text-muted-foreground hidden sm:block">
                <span className="text-foreground font-semibold">{total}</span> styles
              </p>
              <div className="relative">
                <button type="button" onClick={() => setShowSort(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors">
                  <ArrowUpDown size={12} />{SORT_OPTIONS.find(s => s.key === sortBy)?.label}
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1.5 bg-background border border-border rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                    {SORT_OPTIONS.map(s => (
                      <button key={s.key} type="button"
                        onClick={() => { setSortBy(s.key); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-secondary
                          ${sortBy === s.key ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Couldn't load styles</p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <button type="button" onClick={() => fetchProducts(category, page, search, sortBy)}
                  className="mt-2 text-xs font-semibold text-foreground underline hover:no-underline">Try again</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 && !error ? (
            <div className="py-20 text-center text-muted-foreground">
              <Scissors size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">No styles found.</p>
              {(category || search) && (
                <button type="button" onClick={() => { handleCategory(''); setSearch(''); setSearchInput(''); }}
                  className="mt-3 text-xs font-semibold text-foreground underline hover:no-underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {products.map(p => (
                <ProductCard key={p.id} product={p} onEnquire={setEnquiryProduct} />
              ))}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button key={pg} type="button" onClick={() => setPage(pg)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                        ${page === pg ? 'bg-foreground text-background' : 'hover:bg-secondary text-muted-foreground'}`}>
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 7 && <span className="text-muted-foreground px-1">…</span>}
              </div>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'About Muizza Fashion',    body: "A boutique custom tailoring studio specialising in ladies' wear — abayas, gowns, kurtis, bridal outfits and everyday elegance. Every piece is hand-stitched to your exact measurements and preferences." },
              { title: 'How custom orders work',  body: 'Browse a sample style, click "Enquire", fill in your preferences and send via WhatsApp. We confirm fabric availability, finalise pricing and begin stitching. Ready in 5–14 days depending on style.' },
              { title: 'Delivery & pickup',       body: 'Island-wide delivery available. Local pickup also welcome. Cash on delivery accepted. Alterations and adjustments offered within 7 days of receiving your order.' },
            ].map(s => (
              <div key={s.title}>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {enquiryProduct && (
        <EnquiryDrawer product={enquiryProduct} onClose={() => setEnquiryProduct(null)} />
      )}
    </div>
  );
}