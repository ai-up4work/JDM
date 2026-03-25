'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Heart, Star, Scissors, Clock, Truck,
  Ruler, MessageCircle, CheckCircle, ChevronLeft,
  ChevronDown, Palette, Package, AlertCircle, Sparkles,
  Plus, Minus, Share2, Gem,
} from 'lucide-react';
import type { MFProduct } from '@/lib/muizza.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const WA_NUMBER = (process.env.NEXT_PUBLIC_MF_WHATSAPP ?? '+94755354830').replace(/\D/g, '');

const COLOUR_PALETTE: { name: string; hex: string }[] = [
  { name: 'Midnight Black',   hex: '#1a1a1a' },
  { name: 'Ivory White',      hex: '#f8f4ee' },
  { name: 'Navy Blue',        hex: '#1b2a4a' },
  { name: 'Dusty Rose',       hex: '#d4a5a5' },
  { name: 'Forest Green',     hex: '#2d5a3d' },
  { name: 'Burgundy',         hex: '#6b1d1d' },
  { name: 'Soft Lavender',    hex: '#c4b0d8' },
  { name: 'Champagne Gold',   hex: '#c9a96e' },
  { name: 'Sky Blue',         hex: '#87b4cc' },
  { name: 'Camel Brown',      hex: '#b08050' },
  { name: 'Sage Green',       hex: '#8aa888' },
  { name: 'Coral Blush',      hex: '#e8a090' },
  { name: 'Steel Grey',       hex: '#7a8598' },
  { name: 'Teal',             hex: '#2d7d7d' },
  { name: 'Mustard Yellow',   hex: '#c8952a' },
  { name: 'Plum Purple',      hex: '#5c2d6b' },
];

const SIZE_GUIDE = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"' },
  { size: 'S',  bust: '34"', waist: '28"', hip: '37"' },
  { size: 'M',  bust: '36"', waist: '30"', hip: '39"' },
  { size: 'L',  bust: '38"', waist: '32"', hip: '41"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"' },
  { size: '2XL',bust: '42"', waist: '36"', hip: '45"' },
  { size: '3XL',bust: '44"', waist: '38"', hip: '47"' },
];

const MEASUREMENTS_GUIDE = [
  { label: 'Bust',        desc: 'Measure around the fullest part of your chest, keeping tape parallel to the floor.' },
  { label: 'Waist',       desc: 'Measure around your natural waistline, the narrowest part of your torso.' },
  { label: 'Hip',         desc: 'Measure around the fullest part of your hips and buttocks.' },
  { label: 'Length',      desc: 'From shoulder (or neckline) down to desired hem length.' },
  { label: 'Sleeve',      desc: 'From shoulder tip to wrist. State preferred sleeve length: full, 3/4, or short.' },
  { label: 'Shoulder',    desc: 'Across the back from shoulder seam to shoulder seam.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(lkr: number) {
  return `රු${lkr.toLocaleString('en-LK')}`;
}

// Cart helpers (same sessionStorage pattern as Buckley)
const CART_KEY = 'mf_cart';
type CartItem = MFProduct & {
  selectedColour: string;
  selectedFabric: string;
  selectedSize: string;
  customMeasurements: string;
  qty: number;
};

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('mf_cart_updated'));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={13}
            className={i <= Math.round(rating) ? 'fill-foreground text-foreground' : 'text-muted-foreground/30'}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)} ({count} reviews)</span>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-sm font-semibold text-foreground hover:opacity-75 transition-opacity"
      >
        {title}
        <ChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'muted' | 'highlight' }) {
  const cls = {
    default:   'bg-foreground/10 text-foreground',
    muted:     'bg-secondary text-muted-foreground',
    highlight: 'bg-foreground text-background',
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ image, name }: { image: string | null; name: string }) {
  // In production, product.images would be an array — for now we simulate
  // multiple gallery slots from the single image with different crop params
  const images = image
    ? [
        image,
        image.replace('w=600', 'w=600&crop=top'),
        image.replace('w=600', 'w=600&crop=bottom'),
      ]
    : [null, null, null];

  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all
              ${active === i ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            {img
              ? <Image src={img} alt={`${name} view ${i + 1}`} fill sizes="80px" className="object-cover" />
              : <div className="w-full h-full bg-secondary/40 flex items-center justify-center">
                  <Scissors size={14} className="text-muted-foreground/30" />
                </div>
            }
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/40">
        {images[active]
          ? <Image
              src={images[active]!}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          : <div className="w-full h-full flex items-center justify-center">
              <Scissors size={48} className="text-muted-foreground/20" />
            </div>
        }
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive(v => (v - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setActive(v => (v + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${active === i ? 'bg-foreground w-3' : 'bg-foreground/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Related Products Strip ────────────────────────────────────────────────────

function RelatedProducts({ currentId, category }: { currentId: string; category: string }) {
  const [products, setProducts] = useState<MFProduct[]>([]);

  useEffect(() => {
    fetch(`/api/muizza-fashion?category=${category}&per_page=8`)
      .then(r => r.json())
      .then(d => setProducts((d.products as MFProduct[]).filter(p => p.id !== currentId).slice(0, 4)))
      .catch(() => {});
  }, [currentId, category]);

  if (!products.length) return null;

  return (
    <section className="mt-16 pt-10 border-t border-border">
      <h2 className="text-lg font-bold text-foreground mb-6">More in this category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6">
        {products.map(p => (
          <Link key={p.id} href={`/stores/muizza-fashion/${p.slug}`} className="group flex flex-col">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/40 mb-3">
              {p.image
                ? <Image src={p.image} alt={p.name} fill sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105" />
                : <div className="w-full h-full flex items-center justify-center">
                    <Scissors size={24} className="text-muted-foreground/20" />
                  </div>
              }
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{p.categoryLabel}</p>
            <p className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{p.name}</p>
            <p className="text-xs text-muted-foreground">From {fmtPrice(p.basePrice)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Main Slug Page ───────────────────────────────────────────────────────────

export default function MuizzaFashionSlugPage() {
  const params  = useParams<{ slug: string }>();
  const slug    = params.slug;

  const [product,   setProduct]   = useState<MFProduct | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Order state
  const [selectedColour,       setSelectedColour]       = useState('');
  const [selectedFabric,       setSelectedFabric]       = useState('');
  const [selectedSize,         setSelectedSize]         = useState('');
  const [useCustomMeasurements, setUseCustomMeasurements] = useState(false);
  const [measurements,         setMeasurements]         = useState({ bust: '', waist: '', hip: '', length: '', sleeve: '', shoulder: '' });
  const [name,                 setName]                 = useState('');
  const [phone,                setPhone]                = useState('');
  const [notes,                setNotes]                = useState('');
  const [qty,                  setQty]                  = useState(1);

  const orderRef = useRef<HTMLDivElement>(null);

  // Fetch product by slug
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/muizza-fashion/product?slug=${slug}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((p: MFProduct) => {
        setProduct(p);
        // Pre-select first fabric
        if (p.fabric) setSelectedFabric(p.fabric.split(',')[0].trim());
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <SlugSkeleton />;
  if (error || !product) return <SlugError error={error} />;

  const fabrics = product.fabric?.split(',').map(f => f.trim()) ?? [];
  const occasions = product.occasion?.split(',').map(o => o.trim()) ?? [];
  const measurementsString = useCustomMeasurements
    ? Object.entries(measurements).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')
    : selectedSize
      ? `Standard size ${selectedSize}`
      : '';

  const waText = encodeURIComponent(
    `Assalamu Alaikum! 🌙 I'd like to place a custom tailoring order with Muizza Fashion.\n\n` +
    `*Style:* ${product.name}\n` +
    `*Category:* ${product.categoryLabel}\n` +
    `*Starting from:* ${fmtPrice(product.basePrice)}\n\n` +
    `*Order Details:*\n` +
    `• Colour: ${selectedColour || '—'}\n` +
    `• Fabric: ${selectedFabric || '—'}\n` +
    `• Size / Measurements: ${measurementsString || '—'}\n` +
    `• Quantity: ${qty}\n\n` +
    `*My Details:*\n` +
    `• Name: ${name || '—'}\n` +
    `• Phone: ${phone || '—'}\n` +
    (notes ? `• Notes: ${notes}\n` : '') +
    `\nPlease confirm fabric availability, final price and delivery date. Thank you! ✂️`
  );

  const handleAddToCart = () => {
    const item: CartItem = {
      ...product,
      selectedColour,
      selectedFabric,
      selectedSize: useCustomMeasurements ? 'Custom' : selectedSize,
      customMeasurements: measurementsString,
      qty,
    };
    const existing = readCart();
    const idx = existing.findIndex(i =>
      i.id === item.id &&
      i.selectedColour === item.selectedColour &&
      i.selectedFabric === item.selectedFabric &&
      i.selectedSize === item.selectedSize
    );
    if (idx > -1) existing[idx].qty += qty;
    else existing.push(item);
    writeCart(existing);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium shrink-0">Home</Link>
            <ChevronRight size={11} className="shrink-0" />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium shrink-0">Stores</Link>
            <ChevronRight size={11} className="shrink-0" />
            <Link href="/stores/muizza-fashion" className="hover:text-foreground transition-colors font-medium shrink-0">Muizza Fashion</Link>
            <ChevronRight size={11} className="shrink-0" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Share2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => setWishlisted(v => !v)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Heart size={13} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12">

          {/* ── Main layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* LEFT — Gallery */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <ImageGallery image={product.image} name={product.name} />
            </div>

            {/* RIGHT — Details + Order form */}
            <div className="flex flex-col gap-0">

              {/* Identity */}
              <div className="mb-5">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="muted">{product.categoryLabel}</Badge>
                  {product.featured && <Badge variant="highlight"><Sparkles size={9} /> Featured</Badge>}
                  {product.tags?.map(t => <Badge key={t} variant="default">{t}</Badge>)}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight mb-3">
                  {product.name}
                </h1>
                <StarRating rating={product.rating} count={product.reviewCount} />
              </div>

              {/* Price + turnaround */}
              <div className="flex items-end gap-6 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Starting from</p>
                  <p className="text-3xl font-bold text-foreground">{fmtPrice(product.basePrice)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Final price confirmed after fabric & size selection</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock size={14} className="text-foreground" />
                  <span>Ready in ~<strong className="text-foreground">{product.estimatedDays} days</strong></span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>
              )}

              {/* Meta pills */}
              {occasions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <span className="text-xs text-muted-foreground font-medium">Occasions:</span>
                  {occasions.map(o => (
                    <span key={o} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">{o}</span>
                  ))}
                </div>
              )}

              {/* ── ORDER FORM ── */}
              <div ref={orderRef} className="flex flex-col gap-6">

                {/* 1. Colour picker */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Palette size={14} /> Colour
                    </label>
                    {selectedColour && (
                      <span className="text-xs text-muted-foreground">{selectedColour}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COLOUR_PALETTE.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.name}
                        onClick={() => setSelectedColour(c.name)}
                        className={`relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110
                          ${selectedColour === c.name
                            ? 'border-foreground scale-110 shadow-md'
                            : 'border-transparent'}`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {selectedColour === c.name && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle
                              size={12}
                              className={c.hex === '#f8f4ee' || c.hex === '#c4b0d8' || c.hex === '#87b4cc' || c.hex === '#c9a96e' || c.hex === '#8aa888' || c.hex === '#e8a090' || c.hex === '#c8952a'
                                ? 'text-foreground'
                                : 'text-white'}
                            />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Don't see your colour? Mention it in the notes below — we source most shades.
                  </p>
                </div>

                {/* 2. Fabric selector */}
                {fabrics.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                      <Scissors size={14} /> Fabric
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {fabrics.map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setSelectedFabric(f)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all
                            ${selectedFabric === f
                              ? 'bg-foreground text-background border-foreground'
                              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Size OR custom measurements */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Ruler size={14} /> Size & Fit
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCustomMeasurements(v => !v)}
                      className="text-[11px] text-foreground underline font-medium hover:no-underline"
                    >
                      {useCustomMeasurements ? 'Use standard sizes' : 'Enter custom measurements'}
                    </button>
                  </div>

                  {!useCustomMeasurements ? (
                    <div className="flex flex-wrap gap-2">
                      {SIZE_GUIDE.map(s => (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() => setSelectedSize(s.size)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all
                            ${selectedSize === s.size
                              ? 'bg-foreground text-background border-foreground'
                              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'}`}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {MEASUREMENTS_GUIDE.map(m => (
                        <div key={m.label}>
                          <label className="block text-[11px] font-medium text-foreground mb-1">{m.label}</label>
                          <input
                            type="text"
                            placeholder={`e.g. 36"`}
                            value={measurements[m.label.toLowerCase() as keyof typeof measurements] ?? ''}
                            onChange={e => setMeasurements(prev => ({ ...prev, [m.label.toLowerCase()]: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background
                              placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                              focus:border-foreground/30 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Quantity</label>
                  <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden w-fit">
                    <button
                      type="button"
                      onClick={() => setQty(v => Math.max(1, v - 1))}
                      className="px-4 py-2.5 hover:bg-secondary transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-5 py-2.5 text-sm font-bold text-foreground border-x border-border min-w-[48px] text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(v => v + 1)}
                      className="px-4 py-2.5 hover:bg-secondary transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* 5. Customer details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Your name',         value: name,  setter: setName,  placeholder: 'e.g. Fathima' },
                    { label: 'WhatsApp number',   value: phone, setter: setPhone, placeholder: 'e.g. 077 123 4567' },
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
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1.5">
                    Additional notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special embroidery, lining preference, rush order, reference photo link, delivery address…"
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background
                      placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10
                      focus:border-foreground/30 transition-all resize-none"
                  />
                </div>

                {/* 6. CTAs */}
                <div className="flex flex-col gap-2.5 pt-1">
                  {/* Add to enquiry bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200
                      ${addedToCart
                        ? 'bg-green-600 text-white'
                        : 'bg-foreground text-background hover:opacity-90 active:scale-[0.99]'}`}
                  >
                    {addedToCart
                      ? <><CheckCircle size={15} /> Added to enquiry bag</>
                      : <><Package size={15} /> Add to enquiry bag</>
                    }
                  </button>

                  {/* Direct WhatsApp order */}
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-bold
                      flex items-center justify-center gap-2 hover:bg-[#1ebe5d] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Order directly via WhatsApp
                  </a>

                  <p className="text-[10px] text-center text-muted-foreground">
                    We confirm fabric, final price & delivery time with you before stitching begins.
                  </p>
                </div>

              </div>{/* end order form */}

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-border">
                {[
                  { icon: <Scissors size={14} />, label: 'Custom stitched',   desc: 'To your measurements' },
                  { icon: <Truck size={14} />,    label: 'Island-wide',       desc: 'Delivery available' },
                  { icon: <CheckCircle size={14} />, label: 'Satisfaction',   desc: '7-day alterations' },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-secondary/20">
                    <span className="text-foreground">{b.icon}</span>
                    <p className="text-[11px] font-semibold text-foreground">{b.label}</p>
                    <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div className="mt-8">

                <Accordion title="Size guide" defaultOpen>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          {['Size', 'Bust', 'Waist', 'Hip'].map(h => (
                            <th key={h} className="text-left py-2 pr-4 font-semibold text-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SIZE_GUIDE.map((s, i) => (
                          <tr key={s.size}
                            onClick={() => { setSelectedSize(s.size); setUseCustomMeasurements(false); }}
                            className={`border-b border-border/50 cursor-pointer transition-colors
                              ${selectedSize === s.size ? 'bg-foreground/5' : 'hover:bg-secondary/50'}`}
                          >
                            <td className={`py-2.5 pr-4 font-bold ${selectedSize === s.size ? 'text-foreground' : 'text-muted-foreground'}`}>{s.size}</td>
                            <td className="py-2.5 pr-4 text-muted-foreground">{s.bust}</td>
                            <td className="py-2.5 pr-4 text-muted-foreground">{s.waist}</td>
                            <td className="py-2.5 text-muted-foreground">{s.hip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                    All measurements are in inches. Click a row to select that size. For the best fit, we recommend providing your own measurements.
                  </p>
                </Accordion>

                <Accordion title="How to measure yourself">
                  <div className="flex flex-col gap-3">
                    {MEASUREMENTS_GUIDE.map(m => (
                      <div key={m.label} className="flex gap-3">
                        <span className="text-[11px] font-bold text-foreground w-16 shrink-0 pt-0.5">{m.label}</span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                    Always measure over well-fitting undergarments. Add 1–2" of ease for comfort. If unsure, share your measurements in the WhatsApp message and we'll advise.
                  </p>
                </Accordion>

                <Accordion title="Available fabrics & finishes">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {fabrics.map(f => (
                      <button key={f} type="button" onClick={() => setSelectedFabric(f)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                          ${selectedFabric === f ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    All fabrics are sourced fresh per order. Availability may vary by colour and season. We'll confirm fabric in stock when you contact us. Premium fabrics (Silk, Velvet, Organza) may carry a surcharge.
                  </p>
                </Accordion>

                <Accordion title="Order process & delivery">
                  <div className="flex flex-col gap-3">
                    {[
                      ['Place enquiry',         'Send your order via WhatsApp with your details, measurements and preferences.'],
                      ['Confirmation',          'We confirm fabric availability and final price within a few hours.'],
                      ['Stitching begins',      'Once confirmed, we begin tailoring. Progress updates shared on WhatsApp.'],
                      ['Quality check',         'Every piece is inspected before dispatch.'],
                      [`Ready in ~${product.estimatedDays} days`, 'Delivered island-wide. Cash on delivery accepted. Pickup also available.'],
                      ['Alterations',           'We offer free alterations within 7 days of delivery for fit issues.'],
                    ].map(([step, desc]) => (
                      <div key={step} className="flex gap-3 items-start">
                        <CheckCircle size={13} className="text-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-semibold text-foreground">{step}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion>

                <Accordion title="Care instructions">
                  <div className="flex flex-col gap-2 text-[11px] text-muted-foreground leading-relaxed">
                    <p>Care varies by fabric. General guidelines:</p>
                    <ul className="list-disc pl-4 space-y-1.5">
                      <li><strong className="text-foreground">Cotton & Linen:</strong> Machine wash cold, gentle cycle. Iron while damp.</li>
                      <li><strong className="text-foreground">Georgette & Chiffon:</strong> Hand wash or dry clean. Do not wring.</li>
                      <li><strong className="text-foreground">Silk & Satin:</strong> Dry clean only. Store away from sunlight.</li>
                      <li><strong className="text-foreground">Velvet & Organza:</strong> Dry clean only. Steam, do not iron directly.</li>
                      <li><strong className="text-foreground">Embroidery:</strong> Always dry clean. Hand wash only if specified.</li>
                    </ul>
                    <p className="mt-1">Specific care instructions are included in every order package.</p>
                  </div>
                </Accordion>

              </div>{/* end accordions */}

            </div>{/* end right column */}
          </div>{/* end grid */}

          {/* Related products */}
          <RelatedProducts currentId={product.id} category={product.category} />

        </div>
      </div>
    </div>
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────────

function SlugSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-10 lg:px-40 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-[3/4] rounded-2xl bg-muted" />
          <div className="flex flex-col gap-4">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-10 w-1/3 rounded bg-muted mt-2" />
            <div className="h-3 w-full rounded bg-muted mt-4" />
            <div className="h-3 w-5/6 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SlugError({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Gem size={40} className="mx-auto mb-4 text-muted-foreground/20" />
        <p className="text-sm font-semibold text-foreground mb-1">Style not found</p>
        <p className="text-xs text-muted-foreground mb-4">{error ?? 'This style may have been removed or the link is incorrect.'}</p>
        <Link href="/stores/muizza-fashion"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground underline hover:no-underline">
          <ChevronLeft size={12} /> Back to all styles
        </Link>
      </div>
    </div>
  );
}