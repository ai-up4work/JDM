'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, ChevronLeft, ShoppingBag, Heart,
  X, ArrowUpDown, Sparkles, AlertCircle, Search,
  Check, RefreshCw, ArrowRight, Truck, Package,
} from 'lucide-react';
import type { SLPerfume, SLListResponse } from '@/lib/scent-lab.types';

// ─── Quiz ─────────────────────────────────────────────────────────────────────

type Mood     = 'confident' | 'calm' | 'romantic' | 'energised' | 'mysterious';
type Occasion = 'daily' | 'office' | 'evening' | 'outdoor' | 'gifting';
type Strength = 'light' | 'moderate' | 'intense';
interface QuizAnswers { mood?: Mood; occasion?: Occasion; strength?: Strength; }

const QUIZ_STEPS = [
  {
    id: 'mood', question: 'How do you want to feel?', emoji: '✨',
    options: [
      { value: 'confident',  label: 'Confident',  sub: 'Bold, assured, unforgettable', emoji: '🔥' },
      { value: 'calm',       label: 'Calm',        sub: 'Grounded, serene, soft',       emoji: '🌿' },
      { value: 'romantic',   label: 'Romantic',    sub: 'Warm, intimate, tender',       emoji: '🌹' },
      { value: 'energised',  label: 'Energised',   sub: 'Fresh, alive, vibrant',        emoji: '⚡' },
      { value: 'mysterious', label: 'Mysterious',  sub: 'Dark, complex, alluring',      emoji: '🌙' },
    ],
  },
  {
    id: 'occasion', question: 'When will you wear it?', emoji: '🕐',
    options: [
      { value: 'daily',   label: 'Everyday',  sub: 'Morning to afternoon',   emoji: '☀️' },
      { value: 'office',  label: 'Work',       sub: 'Professional settings',  emoji: '💼' },
      { value: 'evening', label: 'Nights out', sub: 'Dinners, events, dates', emoji: '🌃' },
      { value: 'outdoor', label: 'Outdoors',   sub: 'Active, nature, travel', emoji: '🏕️' },
      { value: 'gifting', label: 'A gift',     sub: 'For someone special',    emoji: '🎁' },
    ],
  },
  {
    id: 'strength', question: 'How strong?', emoji: '💨',
    options: [
      { value: 'light',    label: 'Subtle',   sub: 'A hint, close to skin',         emoji: '🌸' },
      { value: 'moderate', label: 'Balanced', sub: 'Present but not overpowering',  emoji: '✳️' },
      { value: 'intense',  label: 'Powerful', sub: 'Fills the room, stays all day', emoji: '💥' },
    ],
  },
];

function scoreFragrance(p: SLPerfume, answers: Required<QuizAnswers>): number {
  let score = 0;
  const intensity = p.intensity.toLowerCase();
  if (answers.strength === 'light'    && (intensity.includes('light') || intensity.includes('subtle')))                    score += 2;
  if (answers.strength === 'moderate' && (intensity.includes('moderate') || intensity.includes('medium')))                 score += 2;
  if (answers.strength === 'intense'  && (intensity.includes('strong') || intensity.includes('intense') || intensity.includes('very'))) score += 2;

  const occ = (p.occasion ?? []).map(o => o.toLowerCase());
  const occMap: Record<Occasion, string[]> = {
    daily:   ['daily', 'everyday', 'casual', 'daytime'],
    office:  ['office', 'work', 'professional', 'formal'],
    evening: ['evening', 'night', 'date', 'dinner'],
    outdoor: ['outdoor', 'sport', 'active', 'fresh'],
    gifting: ['gifting', 'gift', 'special'],
  };
  if (occ.some(o => occMap[answers.occasion].some(k => o.includes(k)))) score += 3;

  const allNotes = [
    ...(p.notes?.top   ?? []),
    ...(p.notes?.heart ?? []),
    ...(p.notes?.base  ?? []),
  ].map(n => n.toLowerCase());

  const moodNotes: Record<Mood, string[]> = {
    confident:  ['oud', 'pepper', 'vetiver', 'cedar', 'leather', 'spice', 'sandalwood'],
    calm:       ['lavender', 'vetiver', 'chamomile', 'green tea', 'iris', 'white musk'],
    romantic:   ['rose', 'jasmine', 'vanilla', 'ylang', 'praline', 'tuberose', 'amber'],
    energised:  ['citrus', 'bergamot', 'lime', 'grapefruit', 'mint', 'lemon', 'pineapple'],
    mysterious: ['oud', 'myrrh', 'incense', 'benzoin', 'patchouli', 'saffron', 'tonka'],
  };
  if (allNotes.some(n => moodNotes[answers.mood].some(k => n.includes(k)))) score += 3;
  if (p.category === 'Unisex') score += 1;
  return score;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(lkr: number) { return `LKR ${lkr.toLocaleString()}`; }

function categoryColor(cat: string) {
  if (cat === 'Men')   return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
  if (cat === 'Women') return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300';
  return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300';
}

const CART_KEY = 'scent_lab_cart';
type CartItem = SLPerfume & { selectedMl: number; selectedPrice: number; qty: number };

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]'); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('scent_lab_cart_updated'));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border overflow-hidden">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-2.5 w-16 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-8 w-24 rounded-xl bg-muted mt-2" />
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, rank }: { product: SLPerfume; rank?: number }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added,      setAdded]      = useState(false);
  const highlight = rank === 1;
  const minPrice  = product.sizes?.length ? Math.min(...product.sizes.map(s => s.price)) : null;
  const image     = product.images?.[0] ?? '';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const size = product.sizes?.[0];
    if (!size) return;
    const cart = readCart();
    writeCart([...cart, { ...product, selectedMl: size.ml, selectedPrice: size.price, qty: 1 }]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300
      ${highlight
        ? 'border-amber-400/60 dark:border-amber-500/40 shadow-[0_0_0_1px_rgba(217,160,50,0.2),0_8px_32px_rgba(0,0,0,0.12)]'
        : 'border-border hover:border-foreground/20 hover:shadow-md'}`}>

      {/* Rank badges */}
      {rank === 1 && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider shadow-md">
          <Sparkles size={9} /> Best match
        </div>
      )}
      {rank === 2 && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-secondary text-foreground text-[10px] font-bold uppercase tracking-wider">
          2nd match
        </div>
      )}
      {rank === 3 && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-secondary text-foreground text-[10px] font-bold uppercase tracking-wider">
          3rd match
        </div>
      )}

      {/* Badges top-right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
        {product.featured && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 uppercase">
            Featured
          </span>
        )}
        {!product.inStock && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/80 text-background uppercase">
            Sold out
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button type="button" onClick={e => { e.preventDefault(); setWishlisted(v => !v); }}
        className="absolute top-10 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm
          flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
          hover:bg-white dark:hover:bg-background">
        <Heart size={14} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-foreground'} />
      </button>

      {/* Image */}
      <Link href={`/stores/scent-lab/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-secondary/30 block">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Sparkles size={32} />
          </div>
        )}
        {/* Hover CTA */}
        <div className="absolute bottom-3 left-3 right-3 py-2.5 bg-white/90 dark:bg-background/90
          backdrop-blur-sm text-foreground text-xs font-bold rounded-xl text-center pointer-events-none
          translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 z-10">
          View fragrance →
        </div>
      </Link>

      {/* Content */}
      <Link href={`/stores/scent-lab/${product.slug}`} className="flex flex-col flex-1 p-4 hover:opacity-90 transition-opacity">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${categoryColor(product.category)}`}>
            {product.category}
          </span>
          <span className="text-[9px] text-muted-foreground shrink-0">{product.longevity}</span>
        </div>

        <p className="text-sm font-bold text-foreground leading-tight mb-1">{product.name}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">{product.tagline}</p>

        {/* Key notes */}
        {product.notes && (
          <div className="flex flex-wrap gap-1 mb-3">
            {[...(product.notes.top?.slice(0,1) ?? []), ...(product.notes.heart?.slice(0,1) ?? []), ...(product.notes.base?.slice(0,1) ?? [])].map(n => (
              <span key={n} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {n}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            {minPrice && <p className="text-sm font-bold text-foreground">From {fmtPrice(minPrice)}</p>}
            <p className="text-[10px] text-muted-foreground">{product.sizes?.length ?? 0} sizes</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95
              ${added
                ? 'bg-emerald-500 text-white'
                : product.inStock
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}>
            {added ? <><Check size={12} /> Added</> : <><ShoppingBag size={12} /> Add</>}
          </button>
        </div>
      </Link>
    </div>
  );
}

// ─── Scent Quiz ───────────────────────────────────────────────────────────────

function ScentQuiz({ perfumes, onResults }: { perfumes: SLPerfume[]; onResults: (slugs: string[]) => void }) {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [done,    setDone]    = useState(false);

  const current = QUIZ_STEPS[step];
  const progress = (step / QUIZ_STEPS.length) * 100;

  const handleSelect = (value: string) => {
    const next = { ...answers, [current.id]: value as Mood & Occasion & Strength };
    if (step < QUIZ_STEPS.length - 1) {
      setAnswers(next); setStep(s => s + 1);
    } else {
      const complete = next as Required<QuizAnswers>;
      const results = perfumes
        .map(p => ({ slug: p.slug, score: scoreFragrance(p, complete) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.slug);
      setAnswers(next); setDone(true); onResults(results);
    }
  };

  const reset = () => { setAnswers({}); setStep(0); setDone(false); onResults([]); };

  if (done) {
    return (
      <div className="flex items-center justify-between gap-3 py-4 px-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Your top 3 matches are highlighted below</p>
            <p className="text-xs text-muted-foreground mt-0.5">Scroll down to see your recommendations</p>
          </div>
        </div>
        <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <RefreshCw size={12} /> Retake
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="h-1 bg-secondary">
        <div className="h-full bg-foreground transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Step {step + 1} of {QUIZ_STEPS.length}
          </span>
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={12} /> Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-2xl">{current.emoji}</span>
          <h3 className="text-lg sm:text-xl font-bold text-foreground">{current.question}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {current.options.map(opt => (
            <button key={opt.value} type="button" onClick={() => handleSelect(opt.value)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border text-left
                hover:border-foreground/40 hover:bg-secondary/50 hover:shadow-sm
                active:scale-[0.98] transition-all duration-150 group">
              <span className="text-xl shrink-0">{opt.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{opt.label}</p>
                {opt.sub && <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{opt.sub}</p>}
              </div>
              <ArrowRight size={13} className="ml-auto text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mini Cart ────────────────────────────────────────────────────────────────

function MiniCart({ items, onClose, onClear }: { items: CartItem[]; onClose: () => void; onClear: () => void }) {
  const total = items.reduce((s, i) => s + i.selectedPrice * i.qty, 0);
  const WA    = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+94722788166').replace(/\D/g, '');

  const whatsappText = encodeURIComponent(
    `Hi! 🌸 I'd like to order the following fragrances:\n\n` +
    items.map(i => `• ${i.name} ${i.selectedMl}ml × ${i.qty} — ${fmtPrice(i.selectedPrice * i.qty)}`).join('\n') +
    `\n\nTotal: ${fmtPrice(total)}\n\nPlease confirm availability and delivery. Thank you!`
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Your bag ({items.reduce((s, i) => s + i.qty, 0)})</h3>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles size={32} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Your bag is empty</p>
            </div>
          ) : items.map((item, idx) => (
            <div key={`${item.slug}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              {item.images?.[0] && (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-secondary/40">
                  <Image src={item.images[0]} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">{item.category}</p>
                <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.selectedMl}ml</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{fmtPrice(item.selectedPrice)} × {item.qty}</p>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-bold text-foreground">{fmtPrice(total)}</span>
            </div>
            <a href={`https://wa.me/${WA}?text=${whatsappText}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1ebe5d] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order via WhatsApp
            </a>
            <button type="button" onClick={onClear}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear bag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type CategoryFilter = 'all' | 'Men' | 'Women' | 'Unisex';
type SortKey        = 'default' | 'price-asc' | 'price-desc';

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'Men',    label: 'Men'    },
  { key: 'Women',  label: 'Women'  },
  { key: 'Unisex', label: 'Unisex' },
];

export default function ScentLabPage() {
  const [category,    setCategory]    = useState<CategoryFilter>('all');
  const [sortBy,      setSortBy]      = useState<SortKey>('default');
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [perfumes,    setPerfumes]    = useState<SLPerfume[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const [quizResults, setQuizResults] = useState<string[]>([]);
  const [showQuiz,    setShowQuiz]    = useState(false);

  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [showSort,    setShowSort]    = useState(false);

  const abortRef   = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCart(readCart());
    const sync = () => setCart(readCart());
    window.addEventListener('scent_lab_cart_updated', sync);
    return () => window.removeEventListener('scent_lab_cart_updated', sync);
  }, []);

  const clearCart = () => { writeCart([]); setCart([]); };

  const fetchPerfumes = useCallback(async (cat: CategoryFilter) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);

    try {
      const params = new URLSearchParams();
      if (cat !== 'all') params.set('category', cat);

      const res = await fetch(`/api/scent-lab?${params}`, { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: SLListResponse = await res.json();
      setPerfumes(data.data ?? []);
      setTotal(data.count ?? 0);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPerfumes(category); }, [category, fetchPerfumes]);

  const handleCategory = (cat: CategoryFilter) => { setCategory(cat); setQuizResults([]); };
  const handleSearch   = () => setSearch(searchInput);
  const cartQty        = cart.reduce((s, i) => s + i.qty, 0);

  const handleQuizResults = (slugs: string[]) => {
    setQuizResults(slugs);
    if (slugs.length > 0) {
      setShowQuiz(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  };

  // Filter + sort + quiz ordering
  const displayed = (() => {
    let list = [...perfumes];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        (p.notes?.top ?? []).some(n => n.toLowerCase().includes(q)) ||
        (p.notes?.heart ?? []).some(n => n.toLowerCase().includes(q)) ||
        (p.notes?.base ?? []).some(n => n.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc')  list.sort((a, b) => Math.min(...(a.sizes ?? [{ price: 0 }]).map(s => s.price)) - Math.min(...(b.sizes ?? [{ price: 0 }]).map(s => s.price)));
    if (sortBy === 'price-desc') list.sort((a, b) => Math.min(...(b.sizes ?? [{ price: 0 }]).map(s => s.price)) - Math.min(...(a.sizes ?? [{ price: 0 }]).map(s => s.price)));

    if (quizResults.length > 0) {
      const ranked   = quizResults.map(slug => list.find(p => p.slug === slug)).filter(Boolean) as SLPerfume[];
      const unranked = list.filter(p => !quizResults.includes(p.slug));
      return [...ranked, ...unranked];
    }

    return list;
  })();

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'default',    label: 'Default'         },
    { key: 'price-asc',  label: 'Price: low–high' },
    { key: 'price-desc', label: 'Price: high–low' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Scent Lab</span>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button" onClick={() => handleCategory(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${category === c.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                {c.label}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors shrink-0">
            <ShoppingBag size={13} />
            <span className="text-xs font-semibold text-foreground">Bag</span>
            {cartQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                {cartQty}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* ── Hero ── */}
          <div className="mb-10 sm:mb-14">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0">
                <Image src="/store-icon/scent-lab.png" alt="Scent Lab" fill sizes="40px" className="object-cover" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Scent Lab</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground uppercase tracking-wider">
                Live inventory
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3 max-w-lg">
              Find your<br className="hidden sm:block" /> perfect scent.
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Luxury fragrances in 5ml, 10ml decants and full bottles. Island-wide delivery. Cash on delivery accepted.
            </p>

            <div className="flex items-center gap-6 flex-wrap mb-6">
              {[
                { icon: <Truck size={13} />,   label: 'Island-wide delivery' },
                { icon: <Package size={13} />, label: '5ml · 10ml · Full bottles' },
                { icon: <Sparkles size={13} />, label: `${total} fragrances` },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-foreground">{b.icon}</span>{b.label}
                </div>
              ))}
            </div>

            {/* Quiz CTA */}
            <button type="button" onClick={() => setShowQuiz(v => !v)}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200
                ${showQuiz
                  ? 'bg-secondary text-foreground border border-border'
                  : 'bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'}`}>
              <Sparkles size={15} />
              {showQuiz ? 'Hide quiz' : 'Find my scent — take the quiz'}
              {!showQuiz && <ArrowRight size={14} />}
            </button>
          </div>

          {/* ── Quiz ── */}
          {showQuiz && (
            <div className="mb-10">
              <ScentQuiz perfumes={perfumes} onResults={handleQuizResults} />
            </div>
          )}

          {/* ── Quiz results banner ── */}
          {quizResults.length > 0 && !showQuiz && (
            <div className="mb-8 flex items-center justify-between gap-3 py-4 px-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Your top 3 matches are shown first</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Based on your mood, occasion and strength preference</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => { setShowQuiz(true); setQuizResults([]); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw size={12} /> Retake
                </button>
                <button type="button" onClick={() => setQuizResults([])}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* ── Mobile category ── */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 sm:-mx-10 sm:px-10 pb-1">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button" onClick={() => handleCategory(c.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all
                  ${category === c.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input type="text" placeholder="Search fragrances, notes…" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background
                    placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all" />
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
                <span className="text-foreground font-semibold">{displayed.length}</span> fragrances
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
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-secondary ${sortBy === s.key ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Couldn't load fragrances</p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <button type="button" onClick={() => fetchPerfumes(category)}
                  className="mt-2 text-xs font-semibold text-foreground underline hover:no-underline">Try again</button>
              </div>
            </div>
          )}

          {/* ── Grid ── */}
          <div ref={resultsRef}>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : displayed.length === 0 && !error ? (
              <div className="py-20 text-center text-muted-foreground">
                <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">No fragrances found.</p>
                {(category !== 'all' || search) && (
                  <button type="button" onClick={() => { handleCategory('all'); setSearch(''); setSearchInput(''); }}
                    className="mt-3 text-xs font-semibold text-foreground underline hover:no-underline">Clear filters</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {displayed.map((p) => {
                  const rank = quizResults.indexOf(p.slug);
                  return <ProductCard key={p.slug} product={p} rank={rank >= 0 ? rank + 1 : undefined} />;
                })}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'About Scent Lab',  body: 'Premium fragrance decants and full bottles. World-class luxury scents delivered to your doorstep across Sri Lanka.' },
              { title: 'Sizes available',  body: '5ml and 10ml decants for sampling, plus full bottles. Perfect for trying before committing to a full size.' },
              { title: 'How to order',     body: 'Browse the collection, take the quiz to find your match, add to bag, and order via WhatsApp. COD & bank transfer accepted.' },
            ].map(s => (
              <div key={s.title}>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {cartOpen && <MiniCart items={cart} onClose={() => setCartOpen(false)} onClear={clearCart} />}
    </div>
  );
}