'use client';

import { useState, useRef, useMemo } from 'react';
import {
  ChevronRight, Upload, ZoomIn, ZoomOut, RotateCw,
  Check, X, Move, Search, Sparkles, ArrowRight,
  Shield, Layers, CreditCard, Zap, Info, Loader2,
} from 'lucide-react';

import {
  getBrandsForFolder, getBrand, TEMPLATES, getTemplate,
  SERIES_META,
  type BrandId, type CaseModel, type TemplateId, type CaseSeries,
} from '@/lib/PhoneCases';

import {
  CASE_TYPES, TIERS, BADGE_LABELS, getCaseTypesByTier,
  type CaseType, type Tier, type CaseTypeId,
} from '@/lib/caseTypes.meta';

import DeliveryForm from '@/components/DeliveryForm';
import {
  type DeliveryDetails, type PaymentMethod, type OrderItem,
  buildWhatsAppUrl, buildAndDownloadZip, generateOrderId,
} from '@/lib/orderUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLKR(usd: number) { return Math.round(usd * 320); }

const EMPTY_DELIVERY: DeliveryDetails = {
  name: '', phone: '', address: '', city: '',
  district: '', postalCode: '', notes: '',
};

function isDeliveryValid(d: DeliveryDetails) {
  return !!(d.name.trim() && d.phone.trim() && d.address.trim() &&
            d.city.trim() && d.district.trim());
}

function protectionDots(level: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < level ? 'bg-emerald-500' : 'bg-border'}`} />
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
      w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300
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

function CaseTypeCard({ ct, selected, onClick }: { ct: CaseType; selected: boolean; onClick: () => void }) {
  const locked = !ct.mockupFolder;
  return (
    <button
      type="button" onClick={locked ? undefined : onClick} disabled={locked}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative
        ${locked   ? 'border-border opacity-50 cursor-not-allowed'
        : selected ? 'border-foreground bg-foreground/[0.03] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.07)]'
                   : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}
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
        {ct.magsafe    && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">MagSafe</span>}
        {ct.transparent && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">Transparent</span>}
        {ct.mockupFolder
          ? <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">✓ Available now</span>
          : <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground/60 font-medium">🔒 Coming soon</span>}
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CustomCaseBuilder() {
  const [step, setStep]             = useState<1|2|3|4|5|6>(1);

  const [activeTier, setActiveTier] = useState<Tier>('tough');
  const [caseTypeId, setCaseTypeId] = useState<CaseTypeId | null>(null);
  const caseType                    = CASE_TYPES.find(c => c.id === caseTypeId) ?? null;

  const brands                      = getBrandsForFolder(caseType?.mockupFolder ?? null);
  const [brandId, setBrandId]       = useState<BrandId>('iphone');
  const [model, setModel]           = useState<CaseModel | null>(null);
  const [search, setSearch]         = useState('');

  const [template, setTemplate]     = useState<TemplateId>('full');

  const [photoUrl, setPhotoUrl]     = useState<string | null>(null);
  const [zoom, setZoom]             = useState(1);
  const [offset, setOffset]         = useState({ x: 0, y: 0 });
  const [dragging, setDragging]     = useState(false);
  const [dragStart, setDragStart]   = useState({ x: 0, y: 0 });

  const [delivery, setDelivery]     = useState<DeliveryDetails>(EMPTY_DELIVERY);
  const [payment, setPayment]       = useState<PaymentMethod>('cod');
  const [orderState, setOrderState] = useState<'idle' | 'zipping' | 'done'>('idle');

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeBrand = getBrand(brands, brandId) ?? brands[0];

  const availableBrandTabs = useMemo(() => {
    if (caseType?.compatibleBrands)
      return brands.filter(b => caseType.compatibleBrands!.includes(b.id));
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

  const handleOrder = async () => {
    if (!caseType || !model || !photoUrl || !isDeliveryValid(delivery) || orderState !== 'idle') return;
    setOrderState('zipping');
    const orderId = generateOrderId();
    const order: OrderItem = {
      type: 'custom', label: caseType.label,
      modelLabel: model.label, templateLabel: getTemplate(template).label, price,
    };
    try {
      await buildAndDownloadZip({
        photoUrl, mockupSrc: `/phoneCases/${model.file}`,
        zoom, offset, template, order, delivery, payment, orderId,
      });
      setOrderState('done');
      setTimeout(() => {
        window.open(buildWhatsAppUrl({ order, delivery, payment, orderId, hasZip: true }), '_blank', 'noopener,noreferrer');
      }, 800);
      setTimeout(() => setOrderState('idle'), 5000);
    } catch (err) {
      console.error('ZIP build failed:', err);
      setOrderState('idle');
      alert('Something went wrong building the print file. Please try again.');
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPhotoUrl(URL.createObjectURL(file));
    setZoom(1); setOffset({ x: 0, y: 0 });
  };

  const onMouseDown  = (e: React.MouseEvent) => { if (!photoUrl) return; setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove  = (e: React.MouseEvent) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp    = () => setDragging(false);
  const onTouchStart = (e: React.TouchEvent) => { if (!photoUrl) return; const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); };
  const onTouchMove  = (e: React.TouchEvent) => { if (!dragging) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); };

  const selectCaseType = (ct: CaseType) => {
    setCaseTypeId(ct.id); setModel(null); setSearch('');
    const nb = getBrandsForFolder(ct.mockupFolder);
    if (!nb.map(b => b.id).includes(brandId)) setBrandId(nb[0]?.id as BrandId);
    setTimeout(() => setStep(2), 150);
  };

  const selectModel = (m: CaseModel) => { setModel(m); setTimeout(() => setStep(3), 120); };

  const photoStyle: React.CSSProperties = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: dragging ? 'none' : 'transform 0.15s ease',
    ...(template === 'centered' ? { padding: '12%' }          : {}),
    ...(template === 'top'      ? { clipPath: 'inset(0 0 50% 0)' } : {}),
  };

  // Step nav config — 6 steps now (delivery replaces the old step 5)
  const STEPS = [
    { n: 1 as const, label: 'Case type', done: !!caseType },
    { n: 2 as const, label: 'Model',     done: !!model },
    { n: 3 as const, label: 'Style',     done: step > 3 },
    { n: 4 as const, label: 'Photo',     done: !!photoUrl },
    { n: 5 as const, label: 'Delivery',  done: step > 5 && isDeliveryValid(delivery) },
    { n: 6 as const, label: 'Order',     done: orderState === 'done' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Step nav pills — same position as original breadcrumb pills */}
      <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide mb-6">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-1 shrink-0">
            <button type="button"
              onClick={() => {
                if (s.n === 1) setStep(1);
                if (s.n === 2 && caseType) setStep(2);
                if (s.n === 3 && model) setStep(3);
                if (s.n === 4 && model) setStep(4);
                if (s.n === 5 && photoUrl) setStep(5);
                if (s.n === 6 && isDeliveryValid(delivery)) setStep(6);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                ${step === s.n ? 'bg-foreground text-background'
                : s.done       ? 'text-foreground hover:bg-secondary'
                               : 'text-muted-foreground hover:text-foreground'}`}
            >
              <StepDot n={s.n} done={s.done} active={step === s.n} />
              {s.label}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={10} className="text-border shrink-0" />}
          </div>
        ))}

        {/* Price pill — same as original */}
        {caseType && (
          <p className="ml-auto text-xs text-muted-foreground shrink-0">
            From LKR <span className="text-foreground font-semibold">{toLKR(caseType.priceUSD).toLocaleString()}</span>
          </p>
        )}
      </div>

      {/* Two-column grid — left scrolls, right sticks */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 xl:gap-16 items-start align-start">

        {/* ── Left: step accordion ── */}
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
                      {TIER_ICONS[t.id]}{t.label}
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
                    <button key={b.id} type="button" onClick={() => { setBrandId(b.id); setSearch(''); }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200
                        ${brandId === b.id ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                      {b.vendor}<span className="ml-1 text-[10px] opacity-60">({b.models.length})</span>
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
                      value={search} onChange={e => setSearch(e.target.value)}
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
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${caseType?.mockupFolder === 'toughCases' ? 'bg-violet-400' : 'bg-amber-400'}`} />
                  <span className="text-[10px] text-muted-foreground">
                    {caseType?.mockupFolder === 'toughCases' ? SERIES_META.toughcases.label : SERIES_META['tough-phone-cases'].label}
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

          {/* STEP 4: Upload photo */}
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
                  <div
                    onClick={() => fileRef.current?.click()}
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
                        Next step <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 5: Delivery & payment */}
          <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
            ${step === 5 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
            <button type="button" onClick={() => photoUrl && setStep(5)} disabled={!photoUrl}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
              <div className="flex items-center gap-3">
                <StepDot n={5} done={step > 5 && isDeliveryValid(delivery)} active={step === 5} />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Delivery & payment</p>
                  {step > 5 && delivery.name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{delivery.name} · {delivery.city}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 5 ? 'rotate-90' : ''}`} />
            </button>
            {step === 5 && (
              <div className="border-t border-border p-4 sm:p-5">
                <DeliveryForm
                  delivery={delivery} payment={payment}
                  onDeliveryChange={setDelivery} onPaymentChange={setPayment}
                />
                <button type="button" disabled={!isDeliveryValid(delivery)} onClick={() => setStep(6)}
                  className="w-full mt-5 py-3 rounded-xl bg-foreground text-background text-sm font-bold
                    flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed">
                  Review order <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* STEP 6: Review & order */}
          {step === 6 && photoUrl && model && caseType && (
            <div className="rounded-2xl border border-foreground/15 bg-background p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 mb-1">
                <StepDot n={6} done={orderState === 'done'} active={orderState === 'idle'} />
                <p className="text-sm font-semibold text-foreground">Review & order</p>
              </div>
              <p className="text-xs text-muted-foreground mb-5 ml-9">
                We'll download your print file then open WhatsApp to complete the order.
              </p>

              {/* Summary table */}
              <div className="rounded-xl border border-border overflow-hidden mb-4">
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary/30">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Case type</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {caseType.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${BADGE_COLORS[caseType.badge]}`}>
                        {BADGE_LABELS[caseType.badge]}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-foreground">{caseType.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Model</span>
                  <div className="flex items-center gap-1.5">
                    <SeriesBadge series={model.series} />
                    <span className="text-xs font-semibold text-foreground">{model.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Style</span>
                  <span className="text-xs font-semibold text-foreground">{getTemplate(template).label}</span>
                </div>
                <div className="px-4 py-3 border-b border-border space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Delivery to</p>
                  <p className="text-xs font-medium text-foreground">{delivery.name} · {delivery.phone}</p>
                  <p className="text-xs text-muted-foreground">{delivery.address}, {delivery.city}, {delivery.district}</p>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Payment</span>
                  <span className="text-xs font-semibold text-foreground">
                    {payment === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-secondary/10">
                  <span className="text-sm font-semibold text-foreground shrink-0">Total</span>
                  <span className="text-base font-bold text-foreground">LKR {price.toLocaleString()}</span>
                </div>
              </div>

              {/* ZIP notice */}
              <div className="rounded-xl border border-border bg-secondary/20 px-4 py-3 mb-4 flex gap-3 items-start">
                <span className="text-base mt-0.5 shrink-0">📎</span>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">What gets downloaded</p>
                  <ul className="text-[11px] text-muted-foreground space-y-0.5">
                    <li><strong className="text-foreground">original-photo</strong> — your raw upload</li>
                    <li><strong className="text-foreground">print-composite.png</strong> — photo + case overlay at 1080×1920</li>
                    <li><strong className="text-foreground">order-info.txt</strong> — full order + delivery details</li>
                  </ul>
                  <p className="text-[11px] text-muted-foreground mt-1.5">Send the ZIP to us on WhatsApp and we'll get it printed.</p>
                </div>
              </div>

              <button type="button" onClick={handleOrder} disabled={orderState !== 'idle'}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold
                  transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed
                  ${orderState === 'done'    ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                  : orderState === 'zipping' ? 'bg-[#25D366]/70 text-white'
                                             : 'bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-[0_4px_16px_rgba(37,211,102,0.30)]'}`}>
                {orderState === 'zipping' && <><Loader2 size={16} className="animate-spin" /> Building print ZIP…</>}
                {orderState === 'done'    && <><Check size={16} /> ZIP downloaded · Opening WhatsApp</>}
                {orderState === 'idle'    && (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Download ZIP & Order via WhatsApp · LKR {price.toLocaleString()}
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-muted-foreground mt-3 tracking-wide">
                COD available · Island-wide delivery · 7-day print guarantee
              </p>
            </div>
          )}

        </div>

        {/* ── Right: live preview — sticky while left scrolls ── */}
        <div className="lg:sticky lg:top-24 self-start flex flex-col items-center gap-5">
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

      {/* Mobile CTA — identical to original */}
      {photoUrl && step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background/90 backdrop-blur-lg border-t border-border px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="min-w-0 flex-shrink">
            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{model?.label ?? 'Custom case'}</p>
            <p className="text-sm font-bold text-foreground whitespace-nowrap">LKR {price.toLocaleString()}</p>
          </div>
          <button type="button" onClick={() => setStep(5)}
            className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 min-w-0">
            <span className="truncate">Delivery details</span> <ArrowRight size={14} className="shrink-0" />
          </button>
        </div>
      )}
      {photoUrl && step < 5 && <div className="h-20 sm:hidden" />}
    </>
  );
}