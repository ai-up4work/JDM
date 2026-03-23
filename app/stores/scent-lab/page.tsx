// app/stores/scent-lab/page.tsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, ChevronLeft, ShoppingBag, Star,
  Sparkles, X, ArrowRight, Check, RefreshCw,
} from 'lucide-react';

// ─── Types & Data ─────────────────────────────────────────────────────────────

type Family   = 'woody' | 'floral' | 'fresh' | 'oriental' | 'citrus' | 'aquatic';
type Mood     = 'confident' | 'calm' | 'romantic' | 'energised' | 'mysterious';
type Occasion = 'daily' | 'office' | 'evening' | 'outdoor' | 'gifting';
type Strength = 'light' | 'moderate' | 'intense';

interface Fragrance {
  id: string;
  name: string;
  tagline: string;
  family: Family;
  moods: Mood[];
  occasions: Occasion[];
  strength: Strength;
  notes: { top: string[]; heart: string[]; base: string[] };
  price: number;        // LKR
  ml: number;
  image: string;        // placeholder — swap for real product images
  accent: string;       // CSS colour for card accent
  bestseller?: boolean;
  isNew?: boolean;
  stock: number;
}

const FRAGRANCES: Fragrance[] = [
  {
    id: 'oud-noir',
    name: 'Oud Noir',
    tagline: 'Dark resinous depth, built for the night.',
    family: 'woody',
    moods: ['confident', 'mysterious'],
    occasions: ['evening', 'gifting'],
    strength: 'intense',
    notes: { top: ['Black pepper', 'Saffron'], heart: ['Oud', 'Rose'], base: ['Amber', 'Musk', 'Sandalwood'] },
    price: 3800,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#7c5c3a',
    bestseller: true,
    stock: 14,
  },
  {
    id: 'ceylon-mist',
    name: 'Ceylon Mist',
    tagline: 'Rain on dry earth. Familiarly Sri Lankan.',
    family: 'fresh',
    moods: ['calm', 'energised'],
    occasions: ['daily', 'outdoor'],
    strength: 'light',
    notes: { top: ['Petrichor', 'Cardamom'], heart: ['Vetiver', 'Green tea'], base: ['Cedar', 'White musk'] },
    price: 2800,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#3a6b5c',
    isNew: true,
    stock: 22,
  },
  {
    id: 'jasmine-dusk',
    name: 'Jasmine Dusk',
    tagline: 'Temple flowers at twilight. Soft yet arresting.',
    family: 'floral',
    moods: ['romantic', 'calm'],
    occasions: ['evening', 'daily', 'gifting'],
    strength: 'moderate',
    notes: { top: ['Bergamot', 'Neroli'], heart: ['Jasmine', 'Ylang-ylang'], base: ['Vanilla', 'Musk'] },
    price: 3200,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#8a6a7a',
    bestseller: true,
    stock: 9,
  },
  {
    id: 'amber-route',
    name: 'Amber Route',
    tagline: 'Spice roads and warm skin. Unisex.',
    family: 'oriental',
    moods: ['confident', 'romantic', 'mysterious'],
    occasions: ['office', 'evening'],
    strength: 'intense',
    notes: { top: ['Cinnamon', 'Clove'], heart: ['Labdanum', 'Rose'], base: ['Amber', 'Patchouli', 'Benzoin'] },
    price: 4200,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#9c6a2a',
    stock: 7,
  },
  {
    id: 'lime-grove',
    name: 'Lime Grove',
    tagline: 'Crisp citrus burst. Your morning companion.',
    family: 'citrus',
    moods: ['energised', 'confident'],
    occasions: ['daily', 'office', 'outdoor'],
    strength: 'light',
    notes: { top: ['Lime', 'Grapefruit', 'Lemon'], heart: ['Basil', 'Mint'], base: ['White cedar', 'Musk'] },
    price: 2600,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#5a7c3a',
    isNew: true,
    stock: 31,
  },
  {
    id: 'sea-glass',
    name: 'Sea Glass',
    tagline: 'Salt air and sun-warmed skin. Pure freedom.',
    family: 'aquatic',
    moods: ['calm', 'energised'],
    occasions: ['outdoor', 'daily'],
    strength: 'light',
    notes: { top: ['Sea salt', 'Ozonic'], heart: ['Driftwood', 'Aquatic florals'], base: ['Sandalwood', 'White musk'] },
    price: 2900,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#3a6a8a',
    stock: 18,
  },
  {
    id: 'rose-taif',
    name: 'Rose Taif',
    tagline: 'The queen of roses, undiluted.',
    family: 'floral',
    moods: ['romantic', 'confident'],
    occasions: ['evening', 'gifting'],
    strength: 'intense',
    notes: { top: ['Pink pepper', 'Aldehydes'], heart: ['Taif rose', 'Geranium'], base: ['Oud', 'Amber', 'Musk'] },
    price: 4800,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#8a3a5a',
    stock: 5,
  },
  {
    id: 'vetiver-rain',
    name: 'Vetiver Rain',
    tagline: 'Earthy, grounding, quietly powerful.',
    family: 'woody',
    moods: ['calm', 'mysterious'],
    occasions: ['office', 'daily'],
    strength: 'moderate',
    notes: { top: ['Ginger', 'Black pepper'], heart: ['Vetiver', 'Iris'], base: ['Oak moss', 'Amber'] },
    price: 3400,
    ml: 12,
    image: '/garments/product4.jpeg',
    accent: '#4a5c3a',
    stock: 12,
  },
];

// ─── Quiz config ──────────────────────────────────────────────────────────────

interface QuizStep {
  id: string;
  question: string;
  emoji: string;
  options: { value: string; label: string; sub?: string; emoji: string }[];
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'mood',
    question: 'How do you want to feel?',
    emoji: '✨',
    options: [
      { value: 'confident',   label: 'Confident',   sub: 'Bold, assured, unforgettable', emoji: '🔥' },
      { value: 'calm',        label: 'Calm',        sub: 'Grounded, serene, soft',       emoji: '🌿' },
      { value: 'romantic',    label: 'Romantic',    sub: 'Warm, intimate, tender',       emoji: '🌹' },
      { value: 'energised',   label: 'Energised',   sub: 'Fresh, alive, vibrant',        emoji: '⚡' },
      { value: 'mysterious',  label: 'Mysterious',  sub: 'Dark, complex, alluring',      emoji: '🌙' },
    ],
  },
  {
    id: 'occasion',
    question: 'When will you wear it?',
    emoji: '🕐',
    options: [
      { value: 'daily',    label: 'Everyday',    sub: 'Morning to afternoon',    emoji: '☀️' },
      { value: 'office',   label: 'Work',        sub: 'Professional settings',   emoji: '💼' },
      { value: 'evening',  label: 'Nights out',  sub: 'Dinners, events, dates',  emoji: '🌃' },
      { value: 'outdoor',  label: 'Outdoors',    sub: 'Active, nature, travel',  emoji: '🏕️' },
      { value: 'gifting',  label: 'A gift',      sub: 'For someone special',     emoji: '🎁' },
    ],
  },
  {
    id: 'strength',
    question: 'How strong?',
    emoji: '💨',
    options: [
      { value: 'light',    label: 'Subtle',    sub: 'A hint, close to skin',     emoji: '🌸' },
      { value: 'moderate', label: 'Balanced',  sub: 'Present but not overpowering', emoji: '✳️' },
      { value: 'intense',  label: 'Powerful',  sub: 'Fills the room, stays all day', emoji: '💥' },
    ],
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreFragrance(
  f: Fragrance,
  answers: { mood: Mood; occasion: Occasion; strength: Strength }
): number {
  let score = 0;
  if (f.moods.includes(answers.mood))         score += 3;
  if (f.occasions.includes(answers.occasion)) score += 3;
  if (f.strength === answers.strength)         score += 2;
  return score;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FAMILY_LABELS: Record<Family, string> = {
  woody: 'Woody', floral: 'Floral', fresh: 'Fresh',
  oriental: 'Oriental', citrus: 'Citrus', aquatic: 'Aquatic',
};

const FAMILY_COLORS: Record<Family, string> = {
  woody:    'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  floral:   'bg-pink-100   text-pink-800   dark:bg-pink-900/40   dark:text-pink-300',
  fresh:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  oriental: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  citrus:   'bg-lime-100   text-lime-800   dark:bg-lime-900/40   dark:text-lime-300',
  aquatic:  'bg-sky-100    text-sky-800    dark:bg-sky-900/40    dark:text-sky-300',
};

// ─── Components ───────────────────────────────────────────────────────────────

function FragranceCard({
  f, highlight = false, rank,
}: { f: Fragrance; highlight?: boolean; rank?: number }) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300
      ${highlight
        ? 'border-amber-400/60 dark:border-amber-500/40 shadow-[0_0_0_1px_rgba(217,160,50,0.2),0_8px_32px_rgba(0,0,0,0.12)]'
        : 'border-border hover:border-foreground/20 hover:shadow-md'}`}
    >
      {/* Rank badge for quiz results */}
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

      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
        {f.bestseller && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 uppercase tracking-wider">
            Bestseller
          </span>
        )}
        {f.isNew && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-300 uppercase tracking-wider">
            New
          </span>
        )}
        {f.stock <= 8 && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-400 uppercase tracking-wider">
            {f.stock} left
          </span>
        )}
      </div>

      {/* Image */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${f.accent}22, ${f.accent}44)` }}
      >
        <Image
          src={f.image}
          alt={f.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {/* Accent glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 70% 80%, ${f.accent}, transparent 60%)` }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-foreground leading-tight">{f.name}</p>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${FAMILY_COLORS[f.family]}`}>
            {FAMILY_LABELS[f.family]}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 flex-1">{f.tagline}</p>

        {/* Notes preview */}
        <div className="mb-3">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Key notes</p>
          <div className="flex flex-wrap gap-1">
            {[...f.notes.top.slice(0, 1), ...f.notes.heart.slice(0, 1), ...f.notes.base.slice(0, 1)].map(n => (
              <span key={n} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-bold text-foreground">LKR {f.price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{f.ml} ml attar</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300
              ${added
                ? 'bg-emerald-500 text-white'
                : 'bg-foreground text-background hover:bg-foreground/90 active:scale-95'}`}
          >
            {added ? <><Check size={13} /> Added</> : <><ShoppingBag size={13} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Scent Quiz ───────────────────────────────────────────────────────────────

interface QuizAnswers {
  mood?: Mood;
  occasion?: Occasion;
  strength?: Strength;
}

function ScentQuiz({ onResults }: { onResults: (ids: string[]) => void }) {
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers]   = useState<QuizAnswers>({});
  const [done, setDone]         = useState(false);

  const step = QUIZ_STEPS[quizStep];

  const handleSelect = (value: string) => {
    const next = { ...answers, [step.id]: value as Mood & Occasion & Strength };

    if (quizStep < QUIZ_STEPS.length - 1) {
      setAnswers(next);
      setQuizStep(q => q + 1);
    } else {
      // Final answer — score all fragrances
      const complete = next as Required<QuizAnswers>;
      const scored = FRAGRANCES
        .map(f => ({ id: f.id, score: scoreFragrance(f, complete) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.id);
      setAnswers(next);
      setDone(true);
      onResults(scored);
    }
  };

  const reset = () => { setAnswers({}); setQuizStep(0); setDone(false); onResults([]); };

  const progress = ((quizStep) / QUIZ_STEPS.length) * 100;

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
      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5 sm:p-6">
        {/* Step counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Step {quizStep + 1} of {QUIZ_STEPS.length}
          </span>
          {quizStep > 0 && (
            <button type="button" onClick={() => setQuizStep(q => q - 1)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={12} /> Back
            </button>
          )}
        </div>

        {/* Question */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-2xl">{step.emoji}</span>
          <h3 className="text-lg sm:text-xl font-bold text-foreground">{step.question}</h3>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {step.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border text-left
                hover:border-foreground/40 hover:bg-secondary/50 hover:shadow-sm
                active:scale-[0.98] transition-all duration-150 group"
            >
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScentLabPage() {
  const [activeFamily, setActiveFamily] = useState<Family | 'all'>('all');
  const [quizResults, setQuizResults]   = useState<string[]>([]);
  const [showQuiz, setShowQuiz]         = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleQuizResults = (ids: string[]) => {
    setQuizResults(ids);
    if (ids.length > 0) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  // Sorted: quiz matches first (by rank), then rest
  const displayFragrances = (() => {
    const filtered = activeFamily === 'all'
      ? FRAGRANCES
      : FRAGRANCES.filter(f => f.family === activeFamily);

    if (quizResults.length === 0) return filtered;

    const ranked   = quizResults.map(id => filtered.find(f => f.id === id)).filter(Boolean) as Fragrance[];
    const unranked = filtered.filter(f => !quizResults.includes(f.id));
    return [...ranked, ...unranked];
  })();

  const FAMILIES: { key: Family | 'all'; label: string }[] = [
    { key: 'all',      label: 'All'      },
    { key: 'woody',    label: 'Woody'    },
    { key: 'floral',   label: 'Floral'   },
    { key: 'fresh',    label: 'Fresh'    },
    { key: 'oriental', label: 'Oriental' },
    { key: 'citrus',   label: 'Citrus'   },
    { key: 'aquatic',  label: 'Aquatic'  },
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

          {/* Family filter pills — desktop */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {FAMILIES.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setActiveFamily(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${activeFamily === key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground hidden sm:block shrink-0">
            <span className="text-foreground font-semibold">{FRAGRANCES.length}</span> fragrances
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* ── Hero ── */}
          <div className="mb-10 sm:mb-14">
            {/* Store badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-border relative shrink-0">
                <Image src="/store-icon/scent-lab.png" alt="Scent Lab" fill className="object-cover" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Scent Lab</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1b3a2f] text-emerald-300 uppercase tracking-wider">Verified</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight mb-3 leading-tight">
              Find your<br className="hidden sm:block" /> perfect scent.
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mb-6">
              Artisan attar oils, crafted in small batches. 12 ml roll-ons, alcohol-free, long-lasting. Island-wide delivery.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 mb-6">
              {[
                { label: 'Fragrances', value: `${FRAGRANCES.length}` },
                { label: 'Alcohol-free', value: '100%' },
                { label: 'Delivery', value: 'Island-wide' },
                { label: 'Payment', value: 'COD' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-base font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Quiz CTA */}
            <button
              type="button"
              onClick={() => setShowQuiz(v => !v)}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200
                ${showQuiz
                  ? 'bg-secondary text-foreground border border-border'
                  : 'bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'}`}
            >
              <Sparkles size={15} />
              {showQuiz ? 'Hide quiz' : 'Find my scent — take the quiz'}
              {!showQuiz && <ArrowRight size={14} />}
            </button>
          </div>

          {/* ── Scent quiz ── */}
          {showQuiz && (
            <div className="mb-10">
              <ScentQuiz onResults={(ids) => { handleQuizResults(ids); if (ids.length > 0) setShowQuiz(false); }} />
            </div>
          )}

          {/* Quiz done banner */}
          {quizResults.length > 0 && !showQuiz && (
            <div className="mb-8">
              <div className="flex items-center justify-between gap-3 py-4 px-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
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
            </div>
          )}

          {/* ── Mobile family filter ── */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 sm:-mx-10 sm:px-10 pb-1">
            {FAMILIES.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setActiveFamily(key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border
                  ${activeFamily === key
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Product grid ── */}
          <div ref={resultsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayFragrances.map((f, i) => {
              const rank = quizResults.indexOf(f.id);
              return (
                <FragranceCard
                  key={f.id}
                  f={f}
                  highlight={rank === 0}
                  rank={rank >= 0 ? rank + 1 : undefined}
                />
              );
            })}
          </div>

          {displayFragrances.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-sm">No fragrances in this family yet.</p>
            </div>
          )}

          {/* ── Bottom note ── */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">About Scent Lab</p>
              <p className="text-xs text-muted-foreground max-w-md">
                All our attars are alcohol-free, skin-safe and hand-filled in 12 ml roll-on bottles.
                Orders ship island-wide via courier within 2–4 working days. COD available.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-muted-foreground">4.9 · 86 reviews</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}