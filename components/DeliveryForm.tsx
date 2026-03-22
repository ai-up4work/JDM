'use client';

import { CreditCard, Banknote, Truck, Info } from 'lucide-react';
import { type DeliveryDetails, type PaymentMethod, SRI_LANKA_DISTRICTS } from '@/lib/orderUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryFormProps {
  delivery: DeliveryDetails;
  payment: PaymentMethod;
  onDeliveryChange: (d: DeliveryDetails) => void;
  onPaymentChange: (p: PaymentMethod) => void;
}

// ─── Payment options ──────────────────────────────────────────────────────────

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
}[] = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sublabel: 'Pay when your case arrives',
    icon: <Truck size={16} />,
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    sublabel: 'Pay via bank slip before dispatch',
    icon: <Banknote size={16} />,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sublabel: 'Visa, Mastercard',
    icon: <CreditCard size={16} />,
    disabled: true,
    comingSoon: true,
  },
  {
    id: 'koko',
    label: 'KOKO',
    sublabel: 'Buy now, pay in 3 instalments',
    icon: (
      <span className="text-[11px] font-black tracking-tighter">KOKO</span>
    ),
    disabled: true,
    comingSoon: true,
  },
  {
    id: 'mint',
    label: 'Mint',
    sublabel: 'Digital wallet',
    icon: (
      <span className="text-[11px] font-black tracking-tighter">mint</span>
    ),
    disabled: true,
    comingSoon: true,
  },
];

// ─── Field helper ──────────────────────────────────────────────────────────────

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = `w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background
  placeholder:text-muted-foreground/50
  focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30
  transition-all duration-150`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeliveryForm({
  delivery, payment, onDeliveryChange, onPaymentChange,
}: DeliveryFormProps) {

  const set = (key: keyof DeliveryDetails) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => onDeliveryChange({ ...delivery, [key]: e.target.value });

  return (
    <div className="space-y-6">

      {/* ── Delivery details ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0">
            A
          </div>
          <p className="text-sm font-semibold text-foreground">Delivery details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <Field label="Full name" required>
            <input
              type="text"
              placeholder="Kamal Perera"
              value={delivery.name}
              onChange={set('name')}
              className={inputCls}
            />
          </Field>

          <Field label="Phone number" required>
            <input
              type="tel"
              placeholder="07X XXX XXXX"
              value={delivery.phone}
              onChange={set('phone')}
              className={inputCls}
            />
          </Field>

          <Field label="Address" required>
            <input
              type="text"
              placeholder="No. 12, Main Street"
              value={delivery.address}
              onChange={set('address')}
              className={inputCls}
            />
          </Field>

          <Field label="City" required>
            <input
              type="text"
              placeholder="Colombo"
              value={delivery.city}
              onChange={set('city')}
              className={inputCls}
            />
          </Field>

          <Field label="District" required>
            <select
              value={delivery.district}
              onChange={set('district')}
              className={`${inputCls} appearance-none`}
            >
              <option value="">Select district…</option>
              {SRI_LANKA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>

          <Field label="Postal code">
            <input
              type="text"
              placeholder="00100"
              value={delivery.postalCode}
              onChange={set('postalCode')}
              className={inputCls}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Order notes">
              <textarea
                rows={2}
                placeholder="Anything we should know? (optional)"
                value={delivery.notes}
                onChange={set('notes')}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>

        </div>
      </div>

      {/* ── Payment method ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0">
            B
          </div>
          <p className="text-sm font-semibold text-foreground">Payment method</p>
        </div>

        <div className="space-y-2">
          {PAYMENT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && onPaymentChange(opt.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left
                transition-all duration-150
                ${opt.disabled
                  ? 'border-border opacity-40 cursor-not-allowed'
                  : payment === opt.id
                    ? 'border-foreground bg-foreground/[0.03] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]'
                    : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}
              `}
            >
              {/* Radio dot */}
              <span className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                ${opt.disabled
                  ? 'border-border'
                  : payment === opt.id
                    ? 'border-foreground'
                    : 'border-border'}
              `}>
                {payment === opt.id && !opt.disabled && (
                  <span className="w-2 h-2 rounded-full bg-foreground" />
                )}
              </span>

              {/* Icon */}
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm
                ${opt.disabled ? 'bg-secondary text-muted-foreground' : 'bg-secondary text-foreground'}`}>
                {opt.icon}
              </span>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{opt.sublabel}</p>
              </div>

              {/* Coming soon badge */}
              {opt.comingSoon && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wider shrink-0">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bank transfer info */}
        {payment === 'bank' && (
          <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex gap-2.5 items-start">
            <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Bank transfer details</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Bank account details will be sent to you on WhatsApp after order confirmation. Please transfer and send the slip before dispatch.
              </p>
            </div>
          </div>
        )}

        {payment === 'cod' && (
          <div className="mt-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 flex gap-2.5 items-start">
            <Info size={13} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Pay cash when your case arrives. Island-wide delivery within 5–7 working days.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}