'use client';
// app/booking/[operatorId]/page.tsx  →  Step 2: Choose bus / schedule

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';
import { getOperator, Bus } from '@/lib/booking/mock/operators';
import { RESALE_TICKETS, ResaleTicket } from '@/lib/booking/mock/resale';
import { Tag } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function ChooseBusPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = use(params);
  const router = useRouter();
  const { operator, bus: selectedBus, setBus, setSeatCount } = useBooking();

  const op = operator ?? getOperator(operatorId);
  if (!op) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground text-sm">Operator not found.</p>
      </div>
    );
  }

  const handleSelect = (bus: Bus) => {
    setBus(bus);
    setSeatCount([]);
    router.push(`/booking/${op.id}/${bus.id}`);
  };

  // Group buses by date
  const byDate = op.buses.reduce<Record<string, Bus[]>>((acc, b) => {
    (acc[b.date] ??= []).push(b);
    return acc;
  }, {});

  // Group resale tickets by date for this operator
  const resaleByDate = RESALE_TICKETS
    .filter(r => r.operatorId === operatorId && r.status === 'available')
    .reduce<Record<string, ResaleTicket[]>>((acc, r) => {
      (acc[r.date] ??= []).push(r);
      return acc;
    }, {});

  const allDates = [...new Set([...Object.keys(byDate), ...Object.keys(resaleByDate)])].sort();

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0"
            style={{ background: op.accentColor }}
          >
            {op.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{op.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Available buses</h1>
        <p className="text-sm text-muted-foreground">Select a departure to view the seat map.</p>
      </div>

      {/* Buses grouped by date */}
      <div className="space-y-5">
        {allDates.map(date => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {formatDate(date)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              {/* Regular buses */}
              {(byDate[date] ?? []).map(bus => {
                const available = bus.totalSeats - Math.floor(bus.totalSeats * 0.3);
                const isSelected = selectedBus?.id === bus.id;
                return (
                  <button
                    key={bus.id}
                    type="button"
                    onClick={() => handleSelect(bus)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 active:scale-[0.99]
                      ${isSelected
                        ? 'border-foreground bg-foreground/[0.03] shadow-sm'
                        : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}
                  >
                    {/* Route */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-foreground">{bus.from}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm font-bold text-foreground">{bus.to}</span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">🕐</span>
                        <span className="text-xs font-semibold text-foreground">{bus.departureTime}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{bus.duration}</span>
                      <span className="text-[11px] text-muted-foreground">{bus.distance}</span>
                      <span className={`text-[11px] font-medium ml-auto ${available < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {available} seats left
                      </span>
                    </div>

                    {/* Fare */}
                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
                      <span className="text-[10px] text-muted-foreground">Fare per seat</span>
                      <span className="text-sm font-bold text-foreground">LKR {bus.fare.toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}

              {/* Resale tickets */}
              {(resaleByDate[date] ?? []).map(r => (
                <button
                  key={r.id}
                  type="button"
                  className="w-full text-left p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-50 transition-all duration-150 active:scale-[0.99] relative"
                >
                  {/* Resale badge */}
                  <span className="absolute top-3.5 right-3.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">
                    <Tag size={8} /> Resale
                  </span>

                  {/* Route */}
                  <div className="flex items-center gap-2 mb-2 pr-16">
                    <span className="text-sm font-bold text-foreground">{r.from}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-bold text-foreground">{r.to}</span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">🕐</span>
                      <span className="text-xs font-semibold text-foreground">{r.departure}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Seat {r.seat}</span>
                    <span className="text-[11px] text-amber-600 font-medium ml-auto">1 seat</span>
                  </div>

                  {/* Fare */}
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-amber-200">
                    <span className="text-[10px] text-amber-700">
                      LKR {r.originalFare} fare + LKR {r.mediationFee} mediation
                    </span>
                    <span className="text-sm font-bold text-foreground">LKR {r.totalPrice}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}