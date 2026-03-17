'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ShoppingBag, Check, ArrowRight,
  Sparkles, Info, Droplets, Wind, Leaf, FlaskConical,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

type NoteLayer = 'base' | 'heart' | 'top';
type SizeId    = '3ml' | '6ml' | '12ml' | '30ml';

interface Note {
  id: string;
  name: string;
  family: string;
  description: string;
  badge?: string;
}

interface Size {
  id: SizeId;
  label: string;
  ml: number;
  priceLKR: number;
  badge?: string;
}

const NOTES: Record<NoteLayer, Note[]> = {
  base: [
    { id: 'oud-cambodi',   name: 'Oud Cambodi',   family: 'Woody',     description: 'Deep, smoky Cambodian oud with leathery warmth.',          badge: 'bestseller' },
    { id: 'musk-white',    name: 'White Musk',     family: 'Musky',     description: 'Clean, soft musk — a timeless base for any blend.'                            },
    { id: 'amber-resin',   name: 'Amber Resin',    family: 'Resinous',  description: 'Warm, sweet amber with balsamic depth.',                   badge: 'new'        },
    { id: 'sandalwood',    name: 'Sandalwood',      family: 'Woody',     description: 'Creamy, milky sandalwood — smooth and long-lasting.'                          },
    { id: 'vetiver',       name: 'Vetiver',         family: 'Earthy',    description: 'Smoky, rooty vetiver with an earthy, grounding finish.'                       },
    { id: 'patchouli',     name: 'Patchouli',       family: 'Earthy',    description: 'Dark, rich patchouli — adds depth and longevity.'                             },
  ],
  heart: [
    { id: 'rose-taif',     name: 'Rose Taif',       family: 'Floral',    description: 'The queen of roses — rich, honeyed and deeply feminine.',  badge: 'bestseller' },
    { id: 'jasmine',       name: 'Jasmine',          family: 'Floral',    description: 'Heady white jasmine with a touch of indolic warmth.'                         },
    { id: 'oud-rose',      name: 'Oud Rose',         family: 'Woody Floral', description: 'A marriage of oud and rose — a classic Arabic heart.'                     },
    { id: 'neroli',        name: 'Neroli',           family: 'Floral',    description: 'Light orange blossom with a delicate, powdery drydown.'                      },
    { id: 'geranium',      name: 'Geranium',         family: 'Floral',    description: 'Rosy, minty geranium — bridges florals and greens.'                          },
    { id: 'frankincense',  name: 'Frankincense',     family: 'Resinous',  description: 'Sacred frankincense resin — spiritual and meditative.',    badge: 'new'        },
  ],
  top: [
    { id: 'bergamot',      name: 'Bergamot',         family: 'Citrus',    description: 'Bright, citrusy bergamot — a fresh, uplifting opener.',    badge: 'bestseller' },
    { id: 'black-pepper',  name: 'Black Pepper',     family: 'Spicy',     description: 'Sharp, aromatic pepper — adds intrigue from the first spray.'                },
    { id: 'cardamom',      name: 'Cardamom',         family: 'Spicy',     description: 'Warm, sweet cardamom with a hint of eucalyptus.'                             },
    { id: 'pink-pepper',   name: 'Pink Pepper',      family: 'Spicy',     description: 'Lighter and fruitier than black pepper — playful and modern.', badge: 'new'   },
    { id: 'lemon-verbena', name: 'Lemon Verbena',    family: 'Citrus',    description: 'Zesty, herbal lemon verbena — clean and invigorating.'                       },
    { id: 'saffron',       name: 'Saffron',          family: 'Spicy',     description: 'Precious saffron — adds a luxurious, honeyed spice.',       badge: 'limited'   },
  ],
};

const SIZES: Size[] = [
  { id: '3ml',  label: '3 ml',  ml: 3,  priceLKR: 1800,  badge: 'try me'   },
  { id: '6ml',  label: '6 ml',  ml: 6,  priceLKR: 3200                      },
  { id: '12ml', label: '12 ml', ml: 12, priceLKR: 5500,  badge: 'popular'  },
  { id: '30ml', label: '30 ml', ml: 30, priceLKR: 11000                     },
];

const BADGE_COLORS: Record<string, string> = {
  bestseller: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  new:        'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
  limited:    'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  'try me':   'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  popular:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
};

const NOTE_LAYER_META: Record<NoteLayer, { label: string; sublabel: string; icon: React.ReactNode; color: string }> = {
  base:  { label: 'Base note',  sublabel: 'The soul — lasts 6–8 hrs',   icon: <Leaf      size={13} />, color: 'text-amber-600'   },
  heart: { label: 'Heart note', sublabel: 'The character — lasts 3–5 hrs', icon: <Droplets size={13} />, color: 'text-rose-500'    },
  top:   { label: 'Top note',   sublabel: 'First impression — lasts 1–2 hrs', icon: <Wind  size={13} />, color: 'text-emerald-600' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StepDot({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <span className={`
      w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
      transition-all duration-300
      ${done   ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
      : active ? 'bg-foreground text-background'
               : 'bg-muted text-muted-foreground'}
    `}>
      {done ? '✓' : n}
    </span>
  );
}

function NoteCard({ note, selected, onClick }: { note: Note; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 relative
        ${selected
          ? 'border-foreground bg-foreground/[0.03] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.07)]'
          : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}
    >
      {note.badge && (
        <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${BADGE_COLORS[note.badge]}`}>
          {note.badge}
        </span>
      )}
      <p className="text-sm font-semibold text-foreground pr-14 leading-tight">{note.name}</p>
      <p className={`text-[10px] font-medium mt-0.5 mb-1.5 ${selected ? 'text-foreground/60' : 'text-muted-foreground'}`}>
        {note.family}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">{note.description}</p>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScentLabPage() {
  const [step, setStep]           = useState<1|2|3|4|5>(1);

  // Step 1 — base
  const [baseId,  setBaseId]      = useState<string | null>(null);
  // Step 2 — heart
  const [heartId, setHeartId]     = useState<string | null>(null);
  // Step 3 — top
  const [topId,   setTopId]       = useState<string | null>(null);
  // Step 4 — name & size
  const [scentName, setScentName] = useState('');
  const [sizeId,    setSizeId]    = useState<SizeId | null>(null);
  // Step 5 — order
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────

  const base  = NOTES.base.find(n  => n.id === baseId)  ?? null;
  const heart = NOTES.heart.find(n => n.id === heartId) ?? null;
  const top   = NOTES.top.find(n   => n.id === topId)   ?? null;
  const size  = SIZES.find(s        => s.id === sizeId)  ?? null;

  const blendReady = !!base && !!heart && !!top;
  const orderReady = blendReady && !!size;

  const STEPS = [
    { n: 1 as const, label: 'Base',  done: !!base  },
    { n: 2 as const, label: 'Heart', done: !!heart },
    { n: 3 as const, label: 'Top',   done: !!top   },
    { n: 4 as const, label: 'Bottle', done: !!size  },
    { n: 5 as const, label: 'Order', done: addedToCart },
  ];

  // ── Blend preview label ───────────────────────────────────────────────────

  const blendLabel = useMemo(() => {
    if (!base && !heart && !top) return 'Your blend will appear here';
    const parts = [top?.name, heart?.name, base?.name].filter(Boolean);
    return parts.join(' · ');
  }, [base, heart, top]);

  // ── Pyramid visual ────────────────────────────────────────────────────────

  const PyramidRow = ({
    layer, note, active,
  }: { layer: NoteLayer; note: Note | null; active: boolean }) => {
    const meta = NOTE_LAYER_META[layer];
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
        ${active ? 'bg-secondary/60' : 'bg-transparent'}`}>
        <div className={`shrink-0 ${meta.color}`}>{meta.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground font-medium">{meta.label}</p>
          <p className="text-xs font-semibold text-foreground truncate">
            {note ? note.name : <span className="text-muted-foreground font-normal">Not chosen</span>}
          </p>
        </div>
        {note && (
          <span className="text-[10px] text-muted-foreground shrink-0">{note.family}</span>
        )}
      </div>
    );
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <div className="sticky top-0 z-30 bg-background/80 mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Scent Lab</span>
          </div>

          {/* Step pills */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1 shrink-0">
                <button type="button"
                  onClick={() => {
                    if (s.n === 1) setStep(1);
                    if (s.n === 2 && base)  setStep(2);
                    if (s.n === 3 && heart) setStep(3);
                    if (s.n === 4 && top)   setStep(4);
                    if (s.n === 5 && orderReady) setStep(5);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                    ${step === s.n ? 'bg-foreground text-background'
                    : s.done       ? 'text-foreground hover:bg-secondary'
                    :                'text-muted-foreground hover:text-foreground'}`}
                >
                  <StepDot n={s.n} done={s.done} active={step === s.n} />
                  {s.label}
                </button>
                {i < 4 && <ChevronRight size={10} className="text-border shrink-0" />}
              </div>
            ))}
          </div>

          {size && (
            <p className="text-xs text-muted-foreground hidden sm:block shrink-0">
              LKR <span className="text-foreground font-semibold">{size.priceLKR.toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical size={14} className="text-amber-500" />
              <span className="text-xs font-medium text-amber-500 uppercase tracking-widest">
                Custom attar · Bottled to order · Island-wide delivery
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
              Build your scent
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              Layer your base, heart and top notes. Name your blend. We bottle it and deliver island-wide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 xl:gap-16 items-start">

            {/* ── Left: steps ── */}
            <div className="flex flex-col gap-3">

              {/* STEP 1 — Base note */}
              {(['base', 'heart', 'top'] as NoteLayer[]).map((layer, idx) => {
                const stepN = (idx + 1) as 1|2|3;
                const selectedId = layer === 'base' ? baseId : layer === 'heart' ? heartId : topId;
                const selectedNote = NOTES[layer].find(n => n.id === selectedId) ?? null;
                const prevDone = idx === 0 ? true : (idx === 1 ? !!base : !!heart);
                const meta = NOTE_LAYER_META[layer];

                return (
                  <div key={layer} className={`rounded-2xl border transition-all duration-300 overflow-hidden
                    ${step === stepN ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>

                    <button type="button"
                      onClick={() => prevDone && setStep(stepN)}
                      disabled={!prevDone}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40"
                    >
                      <div className="flex items-center gap-3">
                        <StepDot n={stepN} done={!!selectedNote} active={step === stepN} />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <span className={meta.color}>{meta.icon}</span>
                            {meta.label}
                          </p>
                          {selectedNote
                            ? <p className="text-xs text-muted-foreground mt-0.5">{selectedNote.name} · {selectedNote.family}</p>
                            : <p className="text-xs text-muted-foreground mt-0.5">{meta.sublabel}</p>
                          }
                        </div>
                      </div>
                      <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === stepN ? 'rotate-90' : ''}`} />
                    </button>

                    {step === stepN && (
                      <div className="border-t border-border">
                        <div className="px-4 py-2.5 bg-secondary/10 border-b border-border flex items-center gap-2">
                          <Info size={11} className="text-muted-foreground shrink-0" />
                          <p className="text-[11px] text-muted-foreground">{meta.sublabel} — choose one note to define the {layer} of your blend.</p>
                        </div>
                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto scrollbar-hide">
                          {NOTES[layer].map(note => (
                            <NoteCard
                              key={note.id}
                              note={note}
                              selected={selectedId === note.id}
                              onClick={() => {
                                if (layer === 'base')  { setBaseId(note.id);  setTimeout(() => setStep(2), 150); }
                                if (layer === 'heart') { setHeartId(note.id); setTimeout(() => setStep(3), 150); }
                                if (layer === 'top')   { setTopId(note.id);   setTimeout(() => setStep(4), 150); }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* STEP 4 — Bottle size + name */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${step === 4 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
                <button type="button"
                  onClick={() => blendReady && setStep(4)}
                  disabled={!blendReady}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40"
                >
                  <div className="flex items-center gap-3">
                    <StepDot n={4} done={!!size} active={step === 4} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Choose bottle size</p>
                      {size
                        ? <p className="text-xs text-muted-foreground mt-0.5">{size.label} · LKR {size.priceLKR.toLocaleString()}</p>
                        : <p className="text-xs text-muted-foreground mt-0.5">Pick your quantity</p>
                      }
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 4 ? 'rotate-90' : ''}`} />
                </button>

                {step === 4 && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Size selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SIZES.map(s => (
                        <button key={s.id} type="button"
                          onClick={() => { setSizeId(s.id); }}
                          className={`relative p-4 rounded-2xl border text-left transition-all duration-200
                            ${sizeId === s.id
                              ? 'border-foreground bg-foreground/[0.03] shadow-sm'
                              : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}
                        >
                          {s.badge && (
                            <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${BADGE_COLORS[s.badge]}`}>
                              {s.badge}
                            </span>
                          )}
                          <p className="text-base font-bold text-foreground">{s.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">LKR {s.priceLKR.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>

                    {/* Name your scent */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Name your scent <span className="text-muted-foreground/50">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Midnight Garden, Desert Wind…"
                        value={scentName}
                        onChange={e => setScentName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background
                          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10
                          focus:border-foreground/30 transition-all"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        We'll print this name on your bottle label.
                      </p>
                    </div>

                    {size && (
                      <button type="button" onClick={() => setStep(5)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-colors">
                        Review order <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 5 — Order */}
              {step === 5 && orderReady && size && base && heart && top && (
                <div className="rounded-2xl border border-foreground/15 bg-background p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-2 mb-1">
                    <StepDot n={5} done={addedToCart} active={!addedToCart} />
                    <p className="text-sm font-semibold text-foreground">Review & order</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 ml-9">
                    Blended and bottled within 3–5 working days. Delivered island-wide.
                  </p>

                  <div className="rounded-xl border border-border overflow-hidden mb-4">
                    {[
                      { label: 'Base note',  value: `${base.name} · ${base.family}`   },
                      { label: 'Heart note', value: `${heart.name} · ${heart.family}` },
                      { label: 'Top note',   value: `${top.name} · ${top.family}`     },
                      { label: 'Bottle',     value: size.label                          },
                      ...(scentName.trim() ? [{ label: 'Scent name', value: scentName.trim() }] : []),
                    ].map((row, i, arr) => (
                      <div key={row.label}
                        className={`flex items-center justify-between gap-2 px-4 py-3
                          ${i < arr.length - 1 ? 'border-b border-border' : 'bg-secondary/10'}`}>
                        <span className="text-xs text-muted-foreground font-medium shrink-0">{row.label}</span>
                        <span className="text-xs font-semibold text-foreground text-right">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-secondary/10 border-t border-border">
                      <span className="text-sm font-semibold text-foreground shrink-0">Total</span>
                      <span className="text-base font-bold text-foreground">LKR {size.priceLKR.toLocaleString()}</span>
                    </div>
                  </div>

                  <button type="button" onClick={handleAddToCart}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]
                      ${addedToCart
                        ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                        : 'bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'}`}
                  >
                    {addedToCart
                      ? <><Check size={16} /> Added to cart</>
                      : <><ShoppingBag size={16} /> Add to cart · LKR {size.priceLKR.toLocaleString()}</>}
                  </button>

                  <p className="text-center text-[10px] text-muted-foreground mt-3 tracking-wide">
                    Bank transfer · Island-wide delivery · Handcrafted in Sri Lanka
                  </p>
                </div>
              )}

            </div>

            {/* ── Right: preview ── */}
            <div className="lg:sticky lg:top-20 flex flex-col gap-4">

              {/* Bottle visual */}
              <div className="relative w-full max-w-[260px] mx-auto rounded-2xl border border-border bg-secondary/40 overflow-hidden p-6">
                {/* Pyramid layers */}
                <div className="flex flex-col gap-1 mb-5">
                  <PyramidRow layer="top"   note={top}   active={step === 3} />
                  <PyramidRow layer="heart" note={heart} active={step === 2} />
                  <PyramidRow layer="base"  note={base}  active={step === 1} />
                </div>

                {/* Blend name */}
                <div className="border-t border-border pt-4 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Your blend</p>
                  <p className="text-sm font-semibold text-foreground leading-snug min-h-[40px] flex items-center justify-center px-2 text-center">
                    {scentName.trim() || blendLabel}
                  </p>
                </div>

                {/* Placeholder when nothing selected */}
                {!base && !heart && !top && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-[2px]">
                    <FlaskConical size={28} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center px-6 leading-relaxed">
                      Choose your base note to begin
                    </p>
                  </div>
                )}
              </div>

              {/* Info card */}
              <div className="w-full max-w-[260px] mx-auto rounded-2xl border border-border bg-secondary/30 px-4 py-4">
                <p className="text-xs font-semibold text-foreground mb-3">About Scent Lab</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Origin',    value: 'Sri Lanka' },
                    { label: 'Type',      value: 'Pure attar / oil-based' },
                    { label: 'Alcohol',   value: 'Alcohol-free' },
                    { label: 'Delivery',  value: '3–5 working days' },
                    { label: 'Payment',   value: 'Bank transfer' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">{row.label}</span>
                      <span className="text-[11px] font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      {blendReady && step !== 5 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background/90 backdrop-blur-lg border-t border-border px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="min-w-0 flex-shrink">
            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
              {scentName.trim() || blendLabel}
            </p>
            <p className="text-sm font-bold text-foreground whitespace-nowrap">
              {size ? `LKR ${size.priceLKR.toLocaleString()}` : 'Choose a size'}
            </p>
          </div>
          <button type="button" onClick={() => setStep(5)}
            className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 min-w-0">
            <span className="truncate">Preview & order</span> <ArrowRight size={14} className="shrink-0" />
          </button>
        </div>
      )}
      {blendReady && step !== 5 && <div className="h-20 sm:hidden" />}

    </div>
  );
}