'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Upload, ZoomIn, ZoomOut, RotateCw,
  ShoppingBag, Check, X, Move, Search,
  Sparkles, ArrowRight, Shield, Layers,
  CreditCard, Zap, Info,
} from 'lucide-react';

import {
  getBrandsForFolder, getBrand,
  TEMPLATES, getTemplate,
  SERIES_META,
  type BrandId, type CaseModel, type TemplateId, type CaseSeries,
} from '@/lib/PhoneCases';

import {
  CASE_TYPES, TIERS, BADGE_LABELS, getCaseTypesByTier,
  type CaseType, type Tier, type CaseTypeId,
} from '@/lib/caseTypes.meta';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLKR(usd: number) {
  return Math.round(usd * 320);
}

function protectionDots(level: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`inline-block w-1.5 h-1.5 rounded-full ${
        i < level ? 'bg-emerald-500' : 'bg-border'
      }`}
    />
  ));
}

const TIER_ICONS: Record<Tier, React.ReactNode> = {
  tough:     <Shield size={13} />,
  impact:    <Layers size={13} />,
  slim:      <Sparkles size={13} />,
  specialty: <CreditCard size={13} />,
  accessory: <Zap size={13} />,
};

const BADGE_COLORS: Record<string, string> = {
  bestseller:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  sale:           'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  'early-access': 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  'eco-friendly': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  new:            'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function SeriesBadge({ series }: { series: CaseSeries }) {
  return (
    <span className={`
      text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-widest
      ${series === 'toughcases'
        ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}
    `}>
      {SERIES_META[series].label}
    </span>
  );
}

function CaseTypeCard({
  ct, selected, onClick,
}: { ct: CaseType; selected: boolean; onClick: () => void }) {
  const locked = !ct.mockupFolder;
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`
        w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative
        ${locked
          ? 'border-border opacity-50 cursor-not-allowed'
          : selected
            ? 'border-foreground bg-foreground/[0.03] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.07)]'
            : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}
      `}
    >
      {ct.badge && (
        <span className={`absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${BADGE_COLORS[ct.badge]}`}>
          {BADGE_LABELS[ct.badge]}
        </span>
      )}

      <div className="flex items-start gap-3 mb-3 pr-16">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors
          ${selected ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>
          {TIER_ICONS[ct.tier]}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{ct.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{ct.tagline}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Protection</p>
          <div className="flex items-center gap-0.5">{protectionDots(ct.protection)}</div>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Sizes</p>
          <p className="text-xs font-semibold text-foreground">{ct.sizes === 1 ? 'Universal' : ct.sizes}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">From</p>
          <p className="text-xs font-semibold text-foreground">LKR {toLKR(ct.priceUSD).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {ct.magsafe && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">MagSafe</span>
        )}
        {ct.transparent && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">Transparent</span>
        )}
        {ct.isAccessory && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">Accessory</span>
        )}
        {ct.mockupFolder ? (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">✓ Available now</span>
        ) : (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground/60 font-medium">🔒 Coming soon</span>
        )}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomCasePage() {
  const [step, setStep]               = useState<1|2|3|4|5>(1);

  const [activeTier, setActiveTier]   = useState<Tier>('tough');
  const [caseTypeId, setCaseTypeId]   = useState<CaseTypeId | null>(null);
  const caseType                      = CASE_TYPES.find(c => c.id === caseTypeId) ?? null;

  const brands                        = getBrandsForFolder(caseType?.mockupFolder ?? null);
  const [brandId, setBrandId]         = useState<BrandId>('iphone');
  const [model, setModel]             = useState<CaseModel | null>(null);
  const [search, setSearch]           = useState('');

  const [template, setTemplate]       = useState<TemplateId>('full');

  const [photoUrl, setPhotoUrl]       = useState<string | null>(null);
  const [zoom, setZoom]               = useState(1);
  const [offset, setOffset]           = useState({ x: 0, y: 0 });
  const [dragging, setDragging]       = useState(false);
  const [dragStart, setDragStart]     = useState({ x: 0, y: 0 });

  const [addedToCart, setAddedToCart] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeBrand = getBrand(brands, brandId) ?? brands[0];

  const availableBrandTabs = useMemo(() => {
    if (caseType?.compatibleBrands) {
      return brands.filter(b => caseType.compatibleBrands!.includes(b.id));
    }
    return brands;
  }, [brands, caseType]);

  const filteredModels = useMemo(() => {
    if (!activeBrand) return [];
    return activeBrand.models.filter(m =>
      m.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeBrand, search]);

  const tierCaseTypes = getCaseTypesByTier(activeTier);
  const price = model?.priceLKR ?? (caseType ? toLKR(caseType.priceUSD) : 2400);

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  const onMouseDown  = (e: React.MouseEvent) => { if (!photoUrl) return; setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove  = (e: React.MouseEvent) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp    = () => setDragging(false);
  const onTouchStart = (e: React.TouchEvent) => { if (!photoUrl) return; const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); };
  const onTouchMove  = (e: React.TouchEvent) => { if (!dragging) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); };

  const selectCaseType = (ct: CaseType) => {
    setCaseTypeId(ct.id);
    setModel(null);
    setSearch('');
    const nextBrands = getBrandsForFolder(ct.mockupFolder);
    const nextBrandIds = nextBrands.map(b => b.id);
    if (!nextBrandIds.includes(brandId)) setBrandId(nextBrandIds[0] as BrandId);
    setTimeout(() => setStep(2), 150);
  };

  const selectModel = (m: CaseModel) => {
    setModel(m);
    setTimeout(() => setStep(3), 120);
  };

  const photoStyle: React.CSSProperties = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: dragging ? 'none' : 'transform 0.15s ease',
    ...(template === 'centered' ? { padding: '12%' } : {}),
    ...(template === 'top'      ? { clipPath: 'inset(0 0 50% 0)' } : {}),
  };

  const STEPS = [
    { n: 1 as const, label: 'Case type', done: !!caseType  },
    { n: 2 as const, label: 'Model',     done: !!model     },
    { n: 3 as const, label: 'Style',     done: step > 3    },
    { n: 4 as const, label: 'Photo',     done: !!photoUrl  },
    { n: 5 as const, label: 'Order',     done: addedToCart },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky Nav ── */}
      <div className="sticky top-0 z-30 bg-background/80 mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Custom Case</span>
          </div>
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1 shrink-0">
                <button type="button"
                  onClick={() => {
                    if (s.n === 1) setStep(1);
                    if (s.n === 2 && caseType) setStep(2);
                    if (s.n === 3 && model) setStep(3);
                    if (s.n === 4 && model) setStep(4);
                    if (s.n === 5 && model && photoUrl) setStep(5);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                    ${step === s.n ? 'bg-foreground text-background'
                    : s.done ? 'text-foreground hover:bg-secondary'
                    : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <StepDot n={s.n} done={s.done} active={step === s.n} />
                  {s.label}
                </button>
                {i < 4 && <ChevronRight size={10} className="text-border shrink-0" />}
              </div>
            ))}
          </div>
          {caseType && (
            <p className="text-xs text-muted-foreground hidden sm:block shrink-0">
              From LKR <span className="text-foreground font-semibold">{toLKR(caseType.priceUSD).toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-violet-500" />
              <span className="text-xs font-medium text-violet-500 uppercase tracking-widest">Custom printed · Island-wide delivery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">Design your case</h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">Choose your case type, pick your phone, upload your photo. We handle the rest.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 xl:gap-16 items-start">

            {/* ── Left: steps ── */}
            <div className="flex flex-col gap-3">

              {/* STEP 1: Case type */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${step === 1 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
                <button type="button" onClick={() => setStep(1)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <StepDot n={1} done={!!caseType} active={step === 1} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Choose case type</p>
                      {caseType && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          {caseType.label}
                          {caseType.badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${BADGE_COLORS[caseType.badge]}`}>
                              {BADGE_LABELS[caseType.badge]}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 1 ? 'rotate-90' : ''}`} />
                </button>

                {step === 1 && (
                  <div className="border-t border-border">
                    <div className="flex gap-1 p-3 overflow-x-auto scrollbar-hide border-b border-border bg-secondary/20">
                      {TIERS.map(t => (
                        <button key={t.id} type="button" onClick={() => setActiveTier(t.id)}
                          className={`shrink-0 flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200
                            ${activeTier === t.id ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                          {TIER_ICONS[t.id]}
                          {t.label}
                          <span className="opacity-50 text-[10px]">({getCaseTypesByTier(t.id).length})</span>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 bg-secondary/10 border-b border-border flex items-center gap-2">
                      <Info size={11} className="text-muted-foreground shrink-0" />
                      <p className="text-[11px] text-muted-foreground">{TIERS.find(t => t.id === activeTier)?.desc}</p>
                    </div>
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[520px] overflow-y-auto scrollbar-hide">
                      {tierCaseTypes.map(ct => (
                        <CaseTypeCard key={ct.id} ct={ct} selected={caseTypeId === ct.id} onClick={() => selectCaseType(ct)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Model */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${step === 2 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
                <button type="button" onClick={() => caseType && setStep(2)} disabled={!caseType}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
                  <div className="flex items-center gap-3">
                    <StepDot n={2} done={!!model} active={step === 2} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Select your phone</p>
                      {model && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          {model.label} <SeriesBadge series={model.series} />
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 2 ? 'rotate-90' : ''}`} />
                </button>

                {step === 2 && (
                  <div className="border-t border-border">
                    <div className="flex gap-1 px-3 py-2 border-b border-border">
                      {availableBrandTabs.map(b => (
                        <button key={b.id} type="button"
                          onClick={() => { setBrandId(b.id); setSearch(''); }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200
                            ${brandId === b.id
                              ? 'bg-background text-foreground shadow-sm border border-border'
                              : 'text-muted-foreground hover:text-foreground'}`}>
                          {b.vendor}
                          <span className="ml-1 text-[10px] opacity-60">({b.models.length})</span>
                        </button>
                      ))}
                    </div>
                    {caseType?.compatibleBrands && (
                      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 flex items-center gap-2">
                        <Info size={11} className="text-amber-600 shrink-0" />
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                          {caseType.label} is only available for {caseType.compatibleBrands.join(' & ')}.
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 p-3">
                      <div className="flex-1 relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input type="text"
                          placeholder={`Search ${activeBrand?.vendor ?? ''} models…`}
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background
                            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10
                            focus:border-foreground/30 transition-all" />
                      </div>
                    </div>
                    <div className="px-3 pb-3 max-h-64 overflow-y-auto scrollbar-hide">
                      {filteredModels.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No models match your search.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {filteredModels.map(m => (
                            <button key={m.file} type="button" onClick={() => selectModel(m)}
                              title={`${SERIES_META[m.series].label} · LKR ${m.priceLKR.toLocaleString()}`}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 flex items-center gap-1.5
                                ${model?.file === m.file
                                  ? 'bg-foreground text-background border-foreground shadow-sm'
                                  : 'bg-background text-foreground border-border hover:border-foreground/40 hover:shadow-sm'}`}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="px-3 pb-3 border-t border-border pt-2.5 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0
                        ${caseType?.mockupFolder === 'toughCases' ? 'bg-violet-400' : 'bg-amber-400'}`} />
                      <span className="text-[10px] text-muted-foreground">
                        {caseType?.mockupFolder === 'toughCases'
                          ? SERIES_META.toughcases.label
                          : SERIES_META['tough-phone-cases'].label}
                        {' · '}{activeBrand?.models.length} models available
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Style */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${step === 3 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
                <button type="button" onClick={() => model && setStep(3)} disabled={!model}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
                  <div className="flex items-center gap-3">
                    <StepDot n={3} done={step > 3} active={step === 3} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Choose a style</p>
                      {step > 3 && <p className="text-xs text-muted-foreground mt-0.5">{getTemplate(template).label}</p>}
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 3 ? 'rotate-90' : ''}`} />
                </button>
                {step === 3 && (
                  <div className="border-t border-border p-4 grid grid-cols-3 gap-3">
                    {TEMPLATES.map(t => (
                      <button key={t.id} type="button" onClick={() => { setTemplate(t.id); setStep(4); }}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200
                          ${template === t.id ? 'border-foreground bg-foreground/5 shadow-sm' : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}>
                        <div className="w-full aspect-[3/4] rounded-lg mb-3 border border-border overflow-hidden">
                          {t.id === 'full'     && <div className="w-full h-full bg-gradient-to-br from-violet-200/60 to-pink-200/60 dark:from-violet-800/40 dark:to-pink-800/40" />}
                          {t.id === 'centered' && <div className="w-full h-full flex items-center justify-center bg-secondary/40"><div className="w-3/4 h-3/4 rounded-md bg-gradient-to-br from-violet-200/80 to-pink-200/80 dark:from-violet-800/60 dark:to-pink-800/60" /></div>}
                          {t.id === 'top'      && <div className="w-full h-full flex flex-col"><div className="flex-1 bg-gradient-to-br from-violet-200/80 to-pink-200/80 dark:from-violet-800/60 dark:to-pink-800/60" /><div className="flex-1 bg-secondary/40" /></div>}
                        </div>
                        <p className="text-xs font-semibold text-foreground">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 4: Upload */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${step === 4 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
                <button type="button" onClick={() => model && setStep(4)} disabled={!model}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
                  <div className="flex items-center gap-3">
                    <StepDot n={4} done={!!photoUrl} active={step === 4} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Upload your photo</p>
                      {photoUrl && <p className="text-xs text-muted-foreground mt-0.5">Photo ready · drag to reposition</p>}
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 4 ? 'rotate-90' : ''}`} />
                </button>
                {step === 4 && (
                  <div className="border-t border-border p-4">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    {!photoUrl ? (
                      <div onClick={() => fileRef.current?.click()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                        onDragOver={e => e.preventDefault()}
                        className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-10 flex flex-col items-center gap-3 sm:gap-4 cursor-pointer
                          hover:border-foreground/30 hover:bg-secondary/20 transition-all duration-200 group">
                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-foreground/5 transition-colors">
                          <Upload size={22} className="text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-foreground">Tap to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">or drag and drop your photo</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">JPG · PNG · HEIC · up to 20 MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 overflow-hidden">
                        <div className="flex items-center gap-3 p-3">
                          <img src={photoUrl} alt="uploaded" className="w-40 rounded-lg object-cover shrink-0 ring-1 ring-border" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">Photo ready</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Use the preview to position it</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 border-t border-emerald-200 dark:border-emerald-900">
                          <button type="button" onClick={() => fileRef.current?.click()}
                            className="py-2.5 text-xs font-semibold text-foreground border-r border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                            Change photo
                          </button>
                          <button type="button" onClick={() => setStep(5)}
                            className="py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-1">
                            Order now <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 5: Order */}
              {step === 5 && photoUrl && model && caseType && (
                <div className="rounded-2xl border border-foreground/15 bg-background p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-2 mb-1">
                    <StepDot n={5} done={addedToCart} active={!addedToCart} />
                    <p className="text-sm font-semibold text-foreground">Review & order</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 ml-9">Print and deliver island-wide within 5–7 working days.</p>
                  <div className="rounded-xl border border-border overflow-hidden mb-4">
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary/30">
                      <span className="text-xs text-muted-foreground font-medium shrink-0">Case type</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {caseType.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${BADGE_COLORS[caseType.badge]}`}>
                            {BADGE_LABELS[caseType.badge]}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-foreground text-right">{caseType.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                      <span className="text-xs text-muted-foreground font-medium shrink-0">Model</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <SeriesBadge series={model.series} />
                        <span className="text-xs font-semibold text-foreground text-right">{model.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                      <span className="text-xs text-muted-foreground font-medium shrink-0">Style</span>
                      <span className="text-xs font-semibold text-foreground">{getTemplate(template).label}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-secondary/10">
                      <span className="text-sm font-semibold text-foreground shrink-0">Total</span>
                      <span className="text-base font-bold text-foreground">LKR {price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button type="button" onClick={handleAddToCart}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]
                      ${addedToCart
                        ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                        : 'bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'}`}>
                    {addedToCart
                      ? <><Check size={16} /> Added to cart</>
                      : <><ShoppingBag size={16} /> Add to cart · LKR {price.toLocaleString()}</>}
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground mt-3 tracking-wide">
                    COD available · Island-wide delivery · 7-day print guarantee
                  </p>
                </div>
              )}

            </div>

            {/* ── Right: preview ── */}
            <div className="lg:sticky lg:top-20 flex flex-col items-center gap-5">
              <div
                className="relative w-full max-w-[240px] mx-auto aspect-[9/16] rounded-3xl overflow-hidden bg-secondary/60 select-none ring-1 ring-border shadow-xl"
                style={{ cursor: photoUrl ? (dragging ? 'grabbing' : 'grab') : 'default' }}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                onDragOver={e => e.preventDefault()}
              >
                {photoUrl && (
                  <div className="absolute inset-0 overflow-hidden">
                    <img src={photoUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={photoStyle} draggable={false} />
                  </div>
                )}
                {model && (
                  <img src={`/phoneCases/${model.file}`} alt={model.label}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" draggable={false} />
                )}
                {!model && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer"
                    onClick={() => { if (caseType) setStep(2); }}>
                    <div className="w-12 h-12 rounded-2xl bg-border/60 flex items-center justify-center">
                      <Upload size={18} className="text-muted-foreground" />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center px-6 leading-relaxed">
                      {!caseType ? 'Select a case type first' : 'Select a phone model'}
                    </p>
                  </div>
                )}
                {photoUrl && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                    <Move size={8} /> drag to adjust
                  </div>
                )}
              </div>

              {photoUrl && (
                <div className="flex items-center gap-1.5 bg-secondary/60 rounded-2xl px-2 sm:px-3 py-2 border border-border flex-wrap justify-center">
                  <button type="button" onClick={() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))} className="p-1.5 rounded-xl hover:bg-border transition-colors"><ZoomOut size={14} /></button>
                  <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => setZoom(z => Math.min(3, parseFloat((z + 0.1).toFixed(1))))} className="p-1.5 rounded-xl hover:bg-border transition-colors"><ZoomIn size={14} /></button>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="p-1.5 rounded-xl hover:bg-border transition-colors" title="Reset"><RotateCw size={14} /></button>
                  <button type="button" onClick={() => { setPhotoUrl(null); setZoom(1); setOffset({ x: 0, y: 0 }); }} className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 transition-colors" title="Remove"><X size={14} /></button>
                </div>
              )}

              {/* Info card */}
              <div className="w-full max-w-[280px] rounded-2xl border border-border bg-secondary/30 px-4 py-3">
                {caseType ? (
                  <>
                    <p className="text-xs font-semibold text-foreground mb-2">{caseType.label}</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Protection</p>
                        <div className="flex items-center gap-0.5">{protectionDots(caseType.protection)}</div>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Bulk</p>
                        <p className="text-[10px] font-medium text-foreground capitalize">{caseType.bulk}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">From</p>
                        <p className="text-[10px] font-semibold text-foreground">LKR {toLKR(caseType.priceUSD).toLocaleString()}</p>
                      </div>
                    </div>
                    {model && (
                      <div className="flex items-start justify-between gap-2 pt-2 border-t border-border flex-wrap">
                        <p className="text-[10px] text-muted-foreground">{model.label}</p>
                        <SeriesBadge series={model.series} />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center py-1">Select a case type to see details</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Mobile CTA ── */}
      {photoUrl && step !== 5 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background/90 backdrop-blur-lg border-t border-border px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="min-w-0 flex-shrink">
            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{model?.label ?? 'Custom case'}</p>
            <p className="text-sm font-bold text-foreground whitespace-nowrap">LKR {price.toLocaleString()}</p>
          </div>
          <button type="button" onClick={() => setStep(5)}
            className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 min-w-0">
            <span className="truncate">Preview & order</span> <ArrowRight size={14} className="shrink-0" />
          </button>
        </div>
      )}
      {photoUrl && step !== 5 && <div className="h-20 sm:hidden" />}

    </div>
  );
}