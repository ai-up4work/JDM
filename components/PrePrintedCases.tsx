'use client';

import { useState } from 'react';
import { Check, ShoppingBag, ArrowRight, ChevronRight, Loader2, ImageOff } from 'lucide-react';
import { PRINTED_CASES, type PrintedCase } from '@/lib/printedCases';
import DeliveryForm from '@/components/DeliveryForm';
import {
  type DeliveryDetails, type PaymentMethod, type OrderItem,
  buildWhatsAppUrl, generateOrderId,
} from '@/lib/orderUtils';

// ─── Empty delivery state ─────────────────────────────────────────────────────

const EMPTY_DELIVERY: DeliveryDetails = {
  name: '', phone: '', address: '', city: '',
  district: '', postalCode: '', notes: '',
};

function isDeliveryValid(d: DeliveryDetails) {
  return d.name.trim() && d.phone.trim() && d.address.trim() &&
         d.city.trim() && d.district.trim();
}

// ─── Case card ────────────────────────────────────────────────────────────────

function PrintedCaseCard({
  pc, selected, onSelect,
}: { pc: PrintedCase; selected: boolean; onSelect: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group relative flex flex-col rounded-2xl border overflow-hidden text-left
        transition-all duration-200 active:scale-[0.98]
        ${selected
          ? 'border-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.10)]'
          : 'border-border hover:border-foreground/40 hover:shadow-md'}
      `}
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] bg-secondary/40 overflow-hidden">
        {!imgError ? (
          <img
            src={`/phoneCases/Printed/${pc.file}`}
            alt={pc.label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
            <ImageOff size={28} />
            <span className="text-[10px]">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {pc.isBestseller && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300 uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {pc.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/70 dark:text-violet-300 uppercase tracking-wider">
              New
            </span>
          )}
        </div>

        {/* Selected overlay */}
        {selected && (
          <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg">
              <Check size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-semibold text-foreground leading-tight">{pc.label}</p>
        {pc.subtitle && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{pc.subtitle}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-bold text-foreground">LKR {pc.price.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground truncate ml-2">{pc.compatible}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBadge({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <span className={`
      w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300
      ${done ? 'bg-emerald-500 text-white' : active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}
    `}>
      {done ? '✓' : n}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PrePrintedCases() {
  const [innerStep, setInnerStep] = useState<1 | 2 | 3>(1);
  const [selectedCase, setSelectedCase] = useState<PrintedCase | null>(null);
  const [delivery, setDelivery]         = useState<DeliveryDetails>(EMPTY_DELIVERY);
  const [payment, setPayment]           = useState<PaymentMethod>('cod');
  const [orderState, setOrderState]     = useState<'idle' | 'sending' | 'done'>('idle');

  const STEPS = [
    { n: 1 as const, label: 'Pick a case',  done: !!selectedCase },
    { n: 2 as const, label: 'Delivery',     done: innerStep > 2 && isDeliveryValid(delivery) },
    { n: 3 as const, label: 'Order',        done: orderState === 'done' },
  ];

  const handleOrder = () => {
    if (!selectedCase || !isDeliveryValid(delivery) || orderState !== 'idle') return;

    setOrderState('sending');

    const orderId = generateOrderId();
    const order: OrderItem = {
      type:       'preprinted',
      label:      selectedCase.label,
      modelLabel: selectedCase.compatible,
      price:      selectedCase.price,
      imageUrl:   `/phoneCases/Printed/${selectedCase.file}`,
    };

    const url = buildWhatsAppUrl({ order, delivery, payment, orderId });

    setOrderState('done');
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 600);
    setTimeout(() => setOrderState('idle'), 5000);
  };

  return (
    <div className="space-y-3">

      {/* ── Step 1: Pick a case ── */}
      <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
        ${innerStep === 1 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>

        <button
          type="button"
          onClick={() => setInnerStep(1)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <StepBadge n={1} done={!!selectedCase} active={innerStep === 1} />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Pick a design</p>
              {selectedCase && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedCase.label} · LKR {selectedCase.price.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${innerStep === 1 ? 'rotate-90' : ''}`} />
        </button>

        {innerStep === 1 && (
          <div className="border-t border-border p-4">
            {PRINTED_CASES.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageOff size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No designs available yet.</p>
                <p className="text-xs mt-1">Add images to <code className="bg-secondary px-1 rounded">/public/phoneCases/Printed/</code></p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto scrollbar-hide pb-1">
                  {PRINTED_CASES.map(pc => (
                    <PrintedCaseCard
                      key={pc.id}
                      pc={pc}
                      selected={selectedCase?.id === pc.id}
                      onSelect={() => setSelectedCase(pc)}
                    />
                  ))}
                </div>

                {selectedCase && (
                  <button
                    type="button"
                    onClick={() => setInnerStep(2)}
                    className="w-full mt-4 py-3 rounded-xl bg-foreground text-background text-sm font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
                  >
                    Continue with {selectedCase.label} <ArrowRight size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Step 2: Delivery + payment ── */}
      <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
        ${innerStep === 2 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>

        <button
          type="button"
          onClick={() => selectedCase && setInnerStep(2)}
          disabled={!selectedCase}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40"
        >
          <div className="flex items-center gap-3">
            <StepBadge n={2} done={innerStep > 2 && isDeliveryValid(delivery)} active={innerStep === 2} />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Delivery & payment</p>
              {innerStep > 2 && delivery.name && (
                <p className="text-xs text-muted-foreground mt-0.5">{delivery.name} · {delivery.city}</p>
              )}
            </div>
          </div>
          <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${innerStep === 2 ? 'rotate-90' : ''}`} />
        </button>

        {innerStep === 2 && (
          <div className="border-t border-border p-4 sm:p-5">
            <DeliveryForm
              delivery={delivery}
              payment={payment}
              onDeliveryChange={setDelivery}
              onPaymentChange={setPayment}
            />

            <button
              type="button"
              disabled={!isDeliveryValid(delivery)}
              onClick={() => setInnerStep(3)}
              className="w-full mt-5 py-3 rounded-xl bg-foreground text-background text-sm font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review order <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Step 3: Review + order ── */}
      {innerStep === 3 && selectedCase && (
        <div className="rounded-2xl border border-foreground/15 bg-background p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-1">
            <StepBadge n={3} done={orderState === 'done'} active={orderState === 'idle'} />
            <p className="text-sm font-semibold text-foreground">Review & order</p>
          </div>
          <p className="text-xs text-muted-foreground mb-5 ml-9">
            Confirm your order and we'll open WhatsApp to complete it.
          </p>

          {/* Order summary */}
          <div className="rounded-xl border border-border overflow-hidden mb-4">
            {/* Case preview + label */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/20">
              <div className="w-12 h-16 rounded-lg border border-border overflow-hidden bg-secondary/40 shrink-0">
                <img
                  src={`/phoneCases/Printed/${selectedCase.file}`}
                  alt={selectedCase.label}
                  className="w-full h-full object-cover"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedCase.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedCase.compatible}</p>
              </div>
            </div>

            {/* Delivery summary */}
            <div className="px-4 py-3 border-b border-border space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Delivery to</p>
              <p className="text-xs text-foreground font-medium">{delivery.name} · {delivery.phone}</p>
              <p className="text-xs text-muted-foreground">{delivery.address}, {delivery.city}</p>
              <p className="text-xs text-muted-foreground">{delivery.district}{delivery.postalCode ? ` · ${delivery.postalCode}` : ''}</p>
            </div>

            {/* Payment + total */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Payment</p>
                <p className="text-xs font-semibold text-foreground capitalize">{payment === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-base font-bold text-foreground">LKR {selectedCase.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleOrder}
            disabled={orderState !== 'idle'}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed
              ${orderState === 'done'
                ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                : orderState === 'sending'
                  ? 'bg-[#25D366]/70 text-white'
                  : 'bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-[0_4px_16px_rgba(37,211,102,0.30)]'}`}
          >
            {orderState === 'sending' && <><Loader2 size={16} className="animate-spin" /> Sending…</>}
            {orderState === 'done'    && <><Check size={16} /> Order sent · Opening WhatsApp</>}
            {orderState === 'idle'    && (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <ShoppingBag size={15} />
                Order via WhatsApp · LKR {selectedCase.price.toLocaleString()}
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-muted-foreground mt-3 tracking-wide">
            COD available · Island-wide delivery · 5–7 working days
          </p>
        </div>
      )}
    </div>
  );
}