'use client';
// app/booking/page.tsx  →  Step 1: Choose operator

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/lib/booking/context';
import { OPERATORS, Operator } from '@/lib/booking/mock/operators';
import { RESALE_TICKETS } from '@/lib/booking/mock/resale';
import { Tag } from 'lucide-react';

const AMENITY_ICONS: Record<string, string> = {
  AC: '❄',
  WiFi: '⌘',
  USB: '⚡',
  Recliner: '★',
};

export default function ChooseOperatorPage() {
  const router = useRouter();
  const { operator, setOperator, setBus, setSeatCount } = useBooking();

  const handleSelect = (op: Operator) => {
    setOperator(op);
    setBus(null);
    setSeatCount(1);
    router.push(`/booking/${op.id}`);
  };

  const availableResale = RESALE_TICKETS.filter(r => r.status === 'available');

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 py-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <span>🚌</span> Island-wide bus booking
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Choose your operator</h1>
        <p className="text-sm text-muted-foreground">Select a bus operator to see available schedules.</p>
      </div>

      {/* Resale banner */}
      <Link
        href="/booking/tickets"
        className="flex items-center justify-between gap-3 w-full mb-4 px-4 py-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Tag size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 leading-tight">Can't travel? Resell your ticket</p>
            <p className="text-[10px] text-amber-600 mt-0.5">No cancellation fees · get a full refund when sold</p>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Resale tickets available now */}
      {availableResale.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Resale tickets
              </p>
              <p className="text-xs text-foreground font-semibold">Last-minute seats from other travellers</p>
            </div>
            <Link href="/booking/tickets" className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 transition-colors shrink-0">
              Sell yours →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableResale.map(r => (
              <div
                key={r.id}
                className="relative flex flex-col justify-between gap-3 p-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/30 overflow-hidden"
              >
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-amber-100/60 pointer-events-none" />
                <div className="absolute -bottom-6 -left-4 w-16 h-16 rounded-full bg-orange-100/40 pointer-events-none" />

                {/* Top: operator + resale badge */}
                <div className="flex items-center justify-between gap-2 relative">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-[9px] font-black"
                      style={{ background: r.accentColor }}
                    >
                      {r.operatorName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{r.operatorName}</span>
                  </div>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider shrink-0">
                    <Tag size={8} /> Resale
                  </span>
                </div>

                {/* Route */}
                <div className="relative">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <span>{r.from}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span>{r.to}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>🕐 {r.departure}</span>
                    <span>·</span>
                    <span>{new Date(r.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                    <span>·</span>
                    <span>Seat {r.seat}</span>
                  </div>
                </div>

                {/* Bottom: price + buy */}
                <div className="flex items-end justify-between gap-2 relative">
                  <div>
                    <p className="text-base font-black text-foreground leading-tight">LKR {r.totalPrice}</p>
                    <p className="text-[9px] text-amber-600 mt-0.5">
                      LKR {r.originalFare} fare · LKR {r.mediationFee} mediation
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-bold transition-all duration-150 shrink-0"
                  >
                    Buy seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operator grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPERATORS.map(op => (
          <OperatorCard
            key={op.id}
            op={op}
            selected={operator?.id === op.id}
            onSelect={() => handleSelect(op)}
          />
        ))}
      </div>
    </div>
  );
}

function OperatorCard({
  op, selected, onSelect,
}: {
  op: Operator;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.99]
        ${selected
          ? 'border-foreground bg-foreground/[0.03] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.07)]'
          : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}
    >
      {/* Top row: logo + name + fare */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black"
            style={{ background: op.accentColor }}
          >
            {op.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">{op.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {op.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">
                  {op.badge}
                </span>
              )}
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider
                  ${op.type === 'government'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-secondary text-muted-foreground'}`}
              >
                {op.type}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-foreground">LKR {op.fare}</p>
          <p className="text-[10px] text-muted-foreground">per seat</p>
        </div>
      </div>

      {/* Amenities + rating */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {op.amenities.map(a => (
            <span key={a} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              <span className="text-[10px]">{AMENITY_ICONS[a]}</span> {a}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-amber-400 text-[10px]">★</span>
          <span className="text-xs font-semibold text-foreground">{op.rating}</span>
          <span className="text-[10px] text-muted-foreground">({op.reviews.toLocaleString()})</span>
        </div>
      </div>

      {/* Route count footer */}
      <div className="mt-2.5 pt-2.5 border-t border-border">
        <p className="text-[10px] text-muted-foreground">{op.buses.length} buses available</p>
      </div>
    </button>
  );
}
