'use client';
// app/booking/confirmed/page.tsx  →  Booking confirmed screen

import { useRouter } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';
import { useMemo } from 'react';

function randomRef(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ConfirmedPage() {
  const router = useRouter();
  const {
    operator, bus, selectedSeats,
    passengerName, passengerPhone, passengerGender,
    clearBooking,
  } = useBooking();

  // Generate a stable reference number for this session
  const ref = useMemo(() => randomRef(), []);

  const totalFare = bus && selectedSeats.length ? selectedSeats.length * bus.fare : 0;

  const handleBookAnother = () => {
    clearBooking();
    router.push('/booking');
  };

  return (
    <div className="max-w-[480px] mx-auto text-center py-10">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(16,185,129,0.25)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Booking confirmed!</h1>
      <p className="text-sm text-muted-foreground mb-1">
        {operator?.name} · {bus?.from} → {bus?.to}
      </p>
      {bus && (
        <p className="text-sm text-muted-foreground mb-6">
          {formatDate(bus.date)} · {bus.departureTime}
        </p>
      )}

      {/* Reference number */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
        <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Ref</span>
        <span className="text-xs font-bold text-emerald-700 font-mono">{ref}</span>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-border text-left overflow-hidden mb-6">
        <div className="px-4 py-3 bg-secondary/30 border-b border-border">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Booking summary</p>
        </div>

        {[
          { label: 'Passenger',  value: passengerName || '—' },
          { label: 'Phone',      value: `+94 ${passengerPhone}` || '—' },
          { label: 'Gender',     value: passengerGender === 'male' ? '♂ Male' : '♀ Female' },
          { label: 'Seat(s)',    value: selectedSeats.join(', ') || '—' },
          { label: 'Route',      value: bus ? `${bus.from} → ${bus.to}` : '—' },
          { label: 'Departure',  value: bus ? `${formatDate(bus.date)} at ${bus.departureTime}` : '—' },
        ].map(row => (
          <div key={row.label} className="px-4 py-3 border-b border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs font-semibold text-foreground">{row.value}</span>
          </div>
        ))}

        <div className="px-4 py-3 bg-secondary/10 flex justify-between items-center">
          <span className="text-sm font-bold text-foreground">Total paid on boarding</span>
          <span className="text-base font-bold text-foreground">LKR {totalFare.toLocaleString()}</span>
        </div>
      </div>

      {/* Reminder */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-left mb-6">
        <span className="text-amber-600 shrink-0 mt-0.5 text-sm">⚠</span>
        <p className="text-[11px] text-amber-700">
          Please arrive at the bus stand at least 10 minutes before departure. Show this confirmation to the conductor.
        </p>
      </div>

      {/* Book another */}
      <button
        type="button"
        onClick={handleBookAnother}
        className="px-8 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98]"
      >
        Book another trip
      </button>
    </div>
  );
}