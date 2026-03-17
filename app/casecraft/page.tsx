'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Upload, ZoomIn, ZoomOut, RotateCw,
  ShoppingBag, Check, X, Move, Search, SlidersHorizontal,
  Sparkles, ArrowRight,
} from 'lucide-react';

import {
  BRANDS, TEMPLATES,
  getBrand, getTemplate,
  SERIES_META,
  type BrandId, type CaseModel, type TemplateId, type CaseSeries,
} from '@/lib/PhoneCases';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepDot({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <span className={`
      w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
      transition-all duration-300
      ${done    ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
      : active  ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground'}
    `}>
      {done ? '✓' : n}
    </span>
  );
}

function SeriesBadge({ series }: { series: CaseSeries }) {
  const meta = SERIES_META[series];
  return (
    <span className={`
      text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-widest
      ${series === 'toughcases'
        ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}
    `}>
      {meta.label}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CustomCasePage() {
  // ── Step state
  const [step, setStep]               = useState<1|2|3|4>(1);

  // ── Model selection
  const [brandId, setBrandId]         = useState<BrandId>('iphone');
  const [model, setModel]             = useState<CaseModel | null>(null);
  const [search, setSearch]           = useState('');
  const [seriesFilter, setSeriesFilter] = useState<CaseSeries | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // ── Template
  const [template, setTemplate]       = useState<TemplateId>('full');

  // ── Photo
  const [photoUrl, setPhotoUrl]       = useState<string | null>(null);
  const [zoom, setZoom]               = useState(1);
  const [offset, setOffset]           = useState({ x: 0, y: 0 });
  const [dragging, setDragging]       = useState(false);
  const [dragStart, setDragStart]     = useState({ x: 0, y: 0 });

  // ── Cart
  const [addedToCart, setAddedToCart] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const selectedBrand = getBrand(brandId)!;
  const price = model?.priceLKR ?? 2400;

  // ── Filtered model list
  const filteredModels = useMemo(() => {
    return selectedBrand.models.filter(m => {
      const matchSearch = m.label.toLowerCase().includes(search.toLowerCase());
      const matchSeries = seriesFilter === 'all' || m.series === seriesFilter;
      return matchSearch && matchSeries;
    });
  }, [selectedBrand, search, seriesFilter]);

  // ── Handlers
  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPhotoUrl(URL.createObjectURL(file));
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const onMouseDown  = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove  = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp    = () => setDragging(false);
  const onTouchStart = (e: React.TouchEvent) => {
    if (!photoUrl) return;
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const photoStyle: React.CSSProperties = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: dragging ? 'none' : 'transform 0.15s ease',
    ...(template === 'centered' ? { padding: '12%' } : {}),
    ...(template === 'top'      ? { clipPath: 'inset(0 0 50% 0)' } : {}),
  };

  const STEPS = [
    { n: 1 as const, label: 'Model', done: !!model    },
    { n: 2 as const, label: 'Style', done: step > 2   },
    { n: 3 as const, label: 'Photo', done: !!photoUrl },
    { n: 4 as const, label: 'Order', done: addedToCart },
  ];

  const selectModel = (m: CaseModel) => {
    setModel(m);
    setTimeout(() => setStep(2), 120);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ── Top nav strip ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <span className="text-foreground">Custom Case</span>
          </div>

          {/* Step progress — desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (s.n === 1) setStep(1);
                    if (s.n === 2 && model) setStep(2);
                    if (s.n === 3 && model) setStep(3);
                    if (s.n === 4 && model && photoUrl) setStep(4);
                  }}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200
                    ${step === s.n
                      ? 'bg-foreground text-background'
                      : s.done
                        ? 'text-foreground hover:bg-secondary'
                        : 'text-muted-foreground hover:text-foreground'}
                  `}
                >
                  <StepDot n={s.n} done={s.done} active={step === s.n} />
                  {s.label}
                </button>
                {i < 3 && <ChevronRight size={10} className="text-border" />}
              </div>
            ))}
          </div>

          {model && (
            <p className="text-xs text-muted-foreground hidden sm:block">
              LKR <span className="text-foreground font-semibold">{price.toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-violet-500" />
            <span className="text-xs font-medium text-violet-500 uppercase tracking-widest">
              Custom printed · Island-wide delivery
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
            Design your case
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md">
            Pick your phone, choose a style, upload your photo. We handle the rest.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 xl:gap-16 items-start">

          {/* ── Left: steps ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">

            {/* ── STEP 1: Model selection ──────────────────────────────────── */}
            <div className={`
              rounded-2xl border transition-all duration-300 overflow-hidden
              ${step === 1
                ? 'border-foreground/15 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.06)]'
                : 'border-border'}
            `}>
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <StepDot n={1} done={!!model} active={step === 1} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground leading-tight">Select your phone</p>
                    {model && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        {model.label}
                        <SeriesBadge series={model.series} />
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-muted-foreground transition-transform duration-200 ${step === 1 ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Accordion body */}
              {step === 1 && (
                <div className="border-t border-border">

                  {/* Brand tabs */}
                  <div className="flex gap-1 p-3 pb-0 border-b border-border bg-secondary/20">
                    {BRANDS.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => { setBrandId(b.id); setSearch(''); }}
                        className={`
                          flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200
                          ${brandId === b.id
                            ? 'bg-background text-foreground shadow-sm border border-border'
                            : 'text-muted-foreground hover:text-foreground'}
                        `}
                      >
                        {b.vendor}
                        <span className="ml-1 text-[10px] opacity-60">({b.models.length})</span>
                      </button>
                    ))}
                  </div>

                  {/* Search + filter bar */}
                  <div className="flex gap-2 p-3">
                    <div className="flex-1 relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder={`Search ${selectedBrand.vendor} models…`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background
                          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10
                          focus:border-foreground/30 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFilters(f => !f)}
                      className={`
                        px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all
                        ${showFilters
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'}
                      `}
                    >
                      <SlidersHorizontal size={12} />
                      Filter
                    </button>
                  </div>

                  {/* Series filter (expandable) */}
                  {showFilters && (
                    <div className="px-3 pb-3 flex gap-2 flex-wrap">
                      {(['all', 'toughcases', 'tough-phone-cases'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSeriesFilter(s)}
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                            ${seriesFilter === s
                              ? 'bg-foreground text-background border-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'}
                          `}
                        >
                          {s === 'all'               ? `All series (${selectedBrand.models.length})`
                          : s === 'toughcases'       ? `${SERIES_META.toughcases.label}`
                                                     : `${SERIES_META['tough-phone-cases'].label}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Model grid */}
                  <div className="px-3 pb-3 max-h-64 overflow-y-auto scrollbar-hide">
                    {filteredModels.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        No models match your search.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {filteredModels.map(m => (
                          <button
                            key={m.file}
                            type="button"
                            onClick={() => selectModel(m)}
                            title={`${SERIES_META[m.series].label} · LKR ${m.priceLKR.toLocaleString()}`}
                            className={`
                              px-3 py-1.5 rounded-xl border text-xs font-medium
                              transition-all duration-150 flex items-center gap-1.5
                              ${model?.file === m.file
                                ? 'bg-foreground text-background border-foreground shadow-sm'
                                : 'bg-background text-foreground border-border hover:border-foreground/40 hover:shadow-sm'}
                            `}
                          >
                            {m.label}
                            {model?.file !== m.file && (
                              <span className={`
                                w-1.5 h-1.5 rounded-full shrink-0
                                ${m.series === 'toughcases' ? 'bg-violet-400' : 'bg-amber-400'}
                              `} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Series legend */}
                  <div className="px-3 pb-3 flex items-center gap-4 border-t border-border pt-2.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      Modern series
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Classic series
                    </span>
                  </div>

                </div>
              )}
            </div>

            {/* ── STEP 2: Style ────────────────────────────────────────────── */}
            <div className={`
              rounded-2xl border transition-all duration-300 overflow-hidden
              ${step === 2
                ? 'border-foreground/15 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.06)]'
                : 'border-border'}
            `}>
              <button
                type="button"
                onClick={() => model && setStep(2)}
                disabled={!model}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40"
              >
                <div className="flex items-center gap-3">
                  <StepDot n={2} done={step > 2} active={step === 2} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Choose a style</p>
                    {step > 2 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{getTemplate(template).label}</p>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-muted-foreground transition-transform duration-200 ${step === 2 ? 'rotate-90' : ''}`}
                />
              </button>

              {step === 2 && (
                <div className="border-t border-border p-4 grid grid-cols-3 gap-3">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setTemplate(t.id); setStep(3); }}
                      className={`
                        p-4 rounded-2xl border text-left transition-all duration-200 group
                        ${template === t.id
                          ? 'border-foreground bg-foreground/5 shadow-sm'
                          : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}
                      `}
                    >
                      {/* Mini visual */}
                      <div className={`
                        w-full aspect-[3/4] rounded-lg mb-3 border border-border overflow-hidden
                        bg-gradient-to-b from-secondary to-background
                      `}>
                        <div className={`
                          h-full w-full flex items-center justify-center
                          ${t.id === 'full'     ? 'bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/40 dark:to-pink-900/40'
                          : t.id === 'centered' ? ''
                                                : ''}
                        `}>
                          {t.id === 'full' && (
                            <div className="w-full h-full bg-gradient-to-br from-violet-200/60 to-pink-200/60 dark:from-violet-800/40 dark:to-pink-800/40" />
                          )}
                          {t.id === 'centered' && (
                            <div className="w-3/4 h-3/4 rounded-md bg-gradient-to-br from-violet-200/80 to-pink-200/80 dark:from-violet-800/60 dark:to-pink-800/60 border border-border" />
                          )}
                          {t.id === 'top' && (
                            <div className="w-full h-1/2 self-start bg-gradient-to-br from-violet-200/80 to-pink-200/80 dark:from-violet-800/60 dark:to-pink-800/60" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-foreground">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── STEP 3: Upload ───────────────────────────────────────────── */}
            <div className={`
              rounded-2xl border transition-all duration-300 overflow-hidden
              ${step === 3
                ? 'border-foreground/15 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.06)]'
                : 'border-border'}
            `}>
              <button
                type="button"
                onClick={() => model && setStep(3)}
                disabled={!model}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40"
              >
                <div className="flex items-center gap-3">
                  <StepDot n={3} done={!!photoUrl} active={step === 3} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Upload your photo</p>
                    {photoUrl && (
                      <p className="text-xs text-muted-foreground mt-0.5">Photo ready · drag to reposition</p>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-muted-foreground transition-transform duration-200 ${step === 3 ? 'rotate-90' : ''}`}
                />
              </button>

              {step === 3 && (
                <div className="border-t border-border p-4">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />

                  {!photoUrl ? (
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                      onDragOver={e => e.preventDefault()}
                      className="
                        border-2 border-dashed border-border rounded-2xl p-10
                        flex flex-col items-center gap-4 cursor-pointer
                        hover:border-foreground/30 hover:bg-secondary/20
                        transition-all duration-200 group
                      "
                    >
                      <div className="
                        w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center
                        group-hover:bg-foreground/5 transition-colors
                      ">
                        <Upload size={22} className="text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Tap to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">or drag and drop your photo</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">JPG · PNG · HEIC · up to 20 MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                      <img
                        src={photoUrl}
                        alt="uploaded"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 ring-1 ring-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Photo ready</p>
                        <p className="text-xs text-muted-foreground">Use the preview to position it</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors font-medium"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-semibold flex items-center gap-1"
                        >
                          Order <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── STEP 4: Order ────────────────────────────────────────────── */}
            {step === 4 && photoUrl && model && (
              <div className="rounded-2xl border border-foreground/15 bg-background p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-1">
                  <StepDot n={4} done={addedToCart} active={!addedToCart} />
                  <p className="text-sm font-semibold text-foreground">Review & order</p>
                </div>
                <p className="text-xs text-muted-foreground mb-5 ml-9">
                  Print and deliver island-wide within 5–7 working days.
                </p>

                {/* Order summary */}
                <div className="rounded-xl border border-border overflow-hidden mb-4">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                    <span className="text-xs text-muted-foreground font-medium">Model</span>
                    <div className="flex items-center gap-2">
                      <SeriesBadge series={model.series} />
                      <span className="text-xs font-semibold text-foreground">{model.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-xs text-muted-foreground font-medium">Style</span>
                    <span className="text-xs font-semibold text-foreground">{getTemplate(template).label}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-secondary/10">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-base font-bold text-foreground">LKR {price.toLocaleString()}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`
                    w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold
                    transition-all duration-300 active:scale-[0.98]
                    ${addedToCart
                      ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                      : 'bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'}
                  `}
                >
                  {addedToCart
                    ? <><Check size={16} /> Added to cart</>
                    : <><ShoppingBag size={16} /> Add to cart · LKR {price.toLocaleString()}</>
                  }
                </button>

                <p className="text-center text-[10px] text-muted-foreground mt-3 tracking-wide">
                  COD available · Island-wide delivery · 7-day print guarantee
                </p>
              </div>
            )}
          </div>

          {/* ── Right: live preview ──────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-20 flex flex-col items-center gap-5">

            {/* Phone preview */}
            <div
              className="relative w-full max-w-[240px] mx-auto aspect-[9/16] rounded-3xl overflow-hidden
                bg-secondary/60 select-none ring-1 ring-border shadow-xl"
              style={{ cursor: photoUrl ? (dragging ? 'grabbing' : 'grab') : 'default' }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}    onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              onDragOver={e => e.preventDefault()}
            >
              {/* Background photo */}
              {photoUrl ? (
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={photoStyle}
                    draggable={false}
                  />
                </div>
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer"
                  onClick={() => { if (model) { setStep(3); fileRef.current?.click(); } }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-border/60 flex items-center justify-center">
                    <Upload size={18} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center px-6 leading-relaxed">
                    {model ? 'Tap to add your photo' : 'Select a phone model first'}
                  </p>
                </div>
              )}

              {/* Case overlay */}
              {model && (
                <img
                  src={`/phoneCases/${model.file}`}
                  alt={model.label}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                  draggable={false}
                />
              )}

              {/* Drag hint */}
              {photoUrl && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20
                  bg-black/50 backdrop-blur-sm text-white text-[9px] px-2.5 py-1
                  rounded-full flex items-center gap-1 pointer-events-none">
                  <Move size={8} /> drag · pinch to adjust
                </div>
              )}
            </div>

            {/* Zoom controls */}
            {photoUrl && (
              <div className="flex items-center gap-2 bg-secondary/60 rounded-2xl px-3 py-2 border border-border">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
                  className="p-1.5 rounded-xl hover:bg-border transition-colors"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(3, parseFloat((z + 0.1).toFixed(1))))}
                  className="p-1.5 rounded-xl hover:bg-border transition-colors"
                >
                  <ZoomIn size={14} />
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button
                  type="button"
                  onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                  className="p-1.5 rounded-xl hover:bg-border transition-colors"
                  title="Reset position"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => { setPhotoUrl(null); setZoom(1); setOffset({ x: 0, y: 0 }); }}
                  className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 transition-colors"
                  title="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Model info card */}
            {model && (
              <div className="w-full max-w-[280px] rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-foreground">{model.label}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <SeriesBadge series={model.series} />
                  <span className="text-xs text-muted-foreground">
                    LKR <span className="font-semibold text-foreground">{price.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Sticky mobile CTA ──────────────────────────────────────────────── */}
      {photoUrl && step !== 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden
          bg-background/90 backdrop-blur-lg border-t border-border px-4 py-3
          flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground truncate">{model?.label}</p>
            <p className="text-base font-bold text-foreground">LKR {price.toLocaleString()}</p>
          </div>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-bold
              hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
          >
            Preview & order <ArrowRight size={14} />
          </button>
        </div>
      )}
      {photoUrl && step !== 4 && <div className="h-20 sm:hidden" />}
    </div>
  );
}