// app/stores/apply/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Check, ArrowRight, Shield, Store, Palette, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreTypeOption = 'template' | 'custom' | 'unsure';

interface FormState {
  businessName: string;
  ownerName: string;
  phone: string;
  instagram: string;
  category: string;
  description: string;
  storeType: StoreTypeOption | null;
  monthlyOrders: string;
  heardFrom: string;
  referralCode: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Clothing & Fashion', 'Food & Beverage', 'Beauty & Skincare',
  'Handmade & Crafts', 'Electronics & Accessories', 'Home & Living',
  'Fragrance & Attars', 'Jewellery', 'Flowers & Gifting', 'Other',
];

const HEARD_FROM  = ['Instagram', 'Friend / referral', 'Google', 'WhatsApp', 'Other'];
const MONTHLY_ORDERS = ['Just starting out', '1 – 20 orders', '20 – 50 orders', '50+ orders'];

const STORE_TYPES: { id: StoreTypeOption; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'template',
    label: 'Template store',
    desc: 'A clean branded storefront — we configure it with your logo, colours and products.',
    icon: <Store size={16} />,
  },
  {
    id: 'custom',
    label: 'Custom build',
    desc: 'A fully bespoke experience — configurators, builders, and previews built for your product.',
    icon: <Palette size={16} />,
  },
  {
    id: 'unsure',
    label: "Not sure yet",
    desc: "Tell us about your product and we'll recommend the right option on the call.",
    icon: <Zap size={16} />,
  },
];

const PROCESS_STEPS = [
  { n: 1, title: 'You apply',       desc: 'Fill in this form — takes about 3 minutes.'                               },
  { n: 2, title: 'We review',       desc: 'We check your product quality and legitimacy within 48 hours.'             },
  { n: 3, title: 'Onboarding call', desc: 'A 20-minute WhatsApp or Zoom call to walk you through the platform.'       },
  { n: 4, title: 'Store goes live', desc: 'We build your store and publish it. You start selling.'                    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoresApplyPage() {
  const [form, setForm] = useState<FormState>({
    businessName: '', ownerName: '', phone: '', instagram: '',
    category: '', description: '', storeType: null,
    monthlyOrders: '', heardFrom: '', referralCode: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (key: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  // Clearing referral code when user switches away from Friend / referral
  const setHeardFrom = (value: string) => {
    setForm(f => ({
      ...f,
      heardFrom: value,
      referralCode: value !== 'Friend / referral' ? '' : f.referralCode,
    }));
    setErrors(e => ({ ...e, heardFrom: undefined, referralCode: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.businessName.trim()) e.businessName = 'Required';
    if (!form.ownerName.trim())    e.ownerName    = 'Required';
    if (!form.phone.trim())        e.phone        = 'Required';
    if (!form.category)            e.category     = 'Please select a category';
    if (!form.description.trim())  e.description  = 'Required';
    if (!form.storeType)           e.storeType    = 'Please choose a store type';
    if (form.heardFrom === 'Friend / referral' && !form.referralCode.trim())
      e.referralCode = 'Please enter the referral code you were given';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitted(true);
  };

  // ── Nav ──────────────────────────────────────────────────────────────────

  const Nav = () => (
    <div className="sticky top-0 z-30 bg-background/80 mt-4">
      <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
          <ChevronRight size={11} />
          <Link href="/stores" className="hover:text-foreground transition-colors font-medium">Stores</Link>
          <ChevronRight size={11} />
          <span className="text-foreground font-medium">Apply</span>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block shrink-0">
          Verified sellers only — we review every application
        </p>
      </div>
    </div>
  );

  // ── Success ──────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <>
        <Nav />
        <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
          <div className="max-w-lg mx-auto py-20 sm:py-28 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-6">
              <Check size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
              Application received
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Thanks, <span className="text-foreground font-medium">{form.ownerName}</span>. We'll review your application and reach you on{' '}
              <span className="text-foreground font-medium">{form.phone}</span> within 48 hours.
            </p>
            {form.referralCode && (
              <p className="text-xs text-muted-foreground mb-8">
                Referral code <span className="text-foreground font-semibold">{form.referralCode.toUpperCase()}</span> applied — your referrer will be rewarded once you go live.
              </p>
            )}
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Back to stores <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Nav />

      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-4 sm:py-8 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 xl:gap-16 items-start">

            {/* ── Left: form ── */}
            <div>
              <div className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight mb-2">
                  Open your store
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tell us about your business. We review every application before approving.
                </p>
              </div>

              <div className="space-y-8">

                {/* Business info */}
                <section>
                  <h2 className="text-sm font-semibold text-foreground mb-4">Business info</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Business name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" placeholder="e.g. Kade Crafts" value={form.businessName}
                        onChange={e => set('businessName', e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all
                          ${errors.businessName ? 'border-red-400' : 'border-border'}`}
                      />
                      {errors.businessName && <p className="text-xs text-red-400 mt-1">{errors.businessName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Your name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" placeholder="e.g. Amal Perera" value={form.ownerName}
                        onChange={e => set('ownerName', e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all
                          ${errors.ownerName ? 'border-red-400' : 'border-border'}`}
                      />
                      {errors.ownerName && <p className="text-xs text-red-400 mt-1">{errors.ownerName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        WhatsApp number <span className="text-red-400">*</span>
                      </label>
                      <input type="tel" placeholder="+94 77 000 0000" value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all
                          ${errors.phone ? 'border-red-400' : 'border-border'}`}
                      />
                      {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Instagram handle
                      </label>
                      <input type="text" placeholder="@yourbusiness" value={form.instagram}
                        onChange={e => set('instagram', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-background placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                          <button key={cat} type="button" onClick={() => set('category', cat)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
                              ${form.category === cat
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border text-foreground hover:bg-secondary'}`}
                          >{cat}</button>
                        ))}
                      </div>
                      {errors.category && <p className="text-xs text-red-400 mt-2">{errors.category}</p>}
                    </div>

                  </div>
                </section>

                <div className="border-t border-border" />

                {/* About your products */}
                <section>
                  <h2 className="text-sm font-semibold text-foreground mb-4">About your products</h2>
                  <div className="space-y-4">

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Describe what you sell <span className="text-red-400">*</span>
                      </label>
                      <textarea rows={3} value={form.description}
                        placeholder="Tell us about your products, how you make or source them, and what makes them special."
                        onChange={e => set('description', e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background placeholder:text-muted-foreground resize-none
                          focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all
                          ${errors.description ? 'border-red-400' : 'border-border'}`}
                      />
                      {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Current monthly orders
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MONTHLY_ORDERS.map(opt => (
                          <button key={opt} type="button" onClick={() => set('monthlyOrders', opt)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
                              ${form.monthlyOrders === opt
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border text-foreground hover:bg-secondary'}`}
                          >{opt}</button>
                        ))}
                      </div>
                    </div>

                  </div>
                </section>

                <div className="border-t border-border" />

                {/* Store type */}
                <section>
                  <h2 className="text-sm font-semibold text-foreground mb-1">What kind of store do you need?</h2>
                  <p className="text-xs text-muted-foreground mb-4">Not sure? Pick "Not sure yet" and we'll help you decide on the call.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STORE_TYPES.map(opt => (
                      <button key={opt.id} type="button"
                        onClick={() => setForm(f => ({ ...f, storeType: opt.id }))}
                        className={`text-left p-4 rounded-xl border transition-all duration-200
                          ${form.storeType === opt.id
                            ? 'border-foreground bg-foreground/[0.03] shadow-sm'
                            : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors
                          ${form.storeType === opt.id ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>
                          {opt.icon}
                        </div>
                        <p className="text-xs font-semibold text-foreground mb-1">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.storeType && <p className="text-xs text-red-400 mt-2">{errors.storeType}</p>}
                </section>

                <div className="border-t border-border" />

                {/* How did you hear */}
                <section>
                  <h2 className="text-sm font-semibold text-foreground mb-4">How did you hear about us?</h2>
                  <div className="flex flex-wrap gap-2">
                    {HEARD_FROM.map(opt => (
                      <button key={opt} type="button" onClick={() => setHeardFrom(opt)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
                          ${form.heardFrom === opt
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border text-foreground hover:bg-secondary'}`}
                      >{opt}</button>
                    ))}
                  </div>

                  {/* Referral code — only visible when Friend / referral is selected */}
                  {form.heardFrom === 'Friend / referral' && (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Referral code <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center gap-2 max-w-xs">
                        <input
                          type="text"
                          placeholder="e.g. AMAL10"
                          value={form.referralCode}
                          onChange={e => set('referralCode', e.target.value.toUpperCase())}
                          maxLength={12}
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background placeholder:text-muted-foreground
                            font-mono tracking-widest uppercase
                            focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all
                            ${errors.referralCode ? 'border-red-400' : 'border-border'}`}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Your referrer earns a reward for one month once your store goes live.
                      </p>
                      {errors.referralCode && (
                        <p className="text-xs text-red-400 mt-1">{errors.referralCode}</p>
                      )}
                    </div>
                  )}
                </section>

                {/* Submit */}
                <div className="pt-2 pb-10">
                  <button type="button" onClick={handleSubmit}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 active:scale-[0.98] transition-all"
                  >
                    Submit application <ArrowRight size={14} />
                  </button>
                  <p className="text-xs text-muted-foreground mt-3">
                    We'll review your application and contact you within 48 hours.
                  </p>
                </div>

              </div>
            </div>

            {/* ── Right: sidebar ── */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-4">

              {/* How it works */}
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-semibold text-foreground mb-4">How it works</p>
                <div className="space-y-4">
                  {PROCESS_STEPS.map((s, i) => (
                    <div key={s.n} className="flex gap-3">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">
                          {s.n}
                        </div>
                        {i < PROCESS_STEPS.length - 1 && (
                          <div className="w-px flex-1 bg-border min-h-[16px]" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-xs font-semibold text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust */}
              <div className="rounded-xl border border-border bg-secondary/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-foreground shrink-0" />
                  <p className="text-xs font-semibold text-foreground">Verified sellers only</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every store on the mall is reviewed and approved by us. Buyers trust our platform because we curate every seller personally.
                </p>
              </div>

              {/* Open slots */}
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-xs font-semibold text-foreground mb-1">Currently accepting</p>
                <p className="text-2xl font-bold text-foreground">
                  4 <span className="text-sm font-normal text-muted-foreground">open slots</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">We onboard in small batches to maintain quality.</p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}