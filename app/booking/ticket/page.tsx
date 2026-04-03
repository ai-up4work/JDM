'use client';
// app/booking/ticket/page.tsx

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function TicketContent() {
  const params = useSearchParams();
  const router = useRouter();

  const ref      = params.get('ref')   ?? '—';
  const name     = params.get('name')  ?? '—';
  const phone    = params.get('phone') ?? '—';
  const from     = params.get('from')  ?? '—';
  const to       = params.get('to')    ?? '—';
  const date     = params.get('date')  ?? '';
  const time     = params.get('time')  ?? '—';
  const seats    = params.get('seats') ?? '1';
  const fare     = params.get('fare')  ?? '0';

  const rows = [
    { label: 'Passenger',  value: name },
    { label: 'Phone',      value: phone ? `+94 ${phone}` : '—' },
    { label: 'From',       value: from },
    { label: 'To',         value: to },
    { label: 'Date',       value: formatDate(date) },
    { label: 'Departure',  value: time },
    { label: 'Seat(s)',    value: Number(seats) > 1 ? `${seats} seats` : '1 seat' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          {/* Bus icon */}
          <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="22" height="13" rx="2" />
              <path d="M1 10h22" />
              <path d="M7 3v10" />
              <path d="M17 3v10" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
              <path d="M5 17H3v-1a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-2" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground tracking-tight">Bus Ticket</h1>
          <p className="text-sm text-muted-foreground mt-1">{from} → {to}</p>

          {/* Ref badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mt-3">
            <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Ref</span>
            <span className="text-xs font-bold text-emerald-700 font-mono">{ref}</span>
          </div>
        </div>

        {/* Ticket card */}
        <div className="rounded-2xl border border-border overflow-hidden shadow-sm mb-5">

          {/* Torn-ticket top notch */}
          <div className="relative bg-emerald-500 px-5 py-4">
            <p className="text-[10px] font-semibold text-emerald-100 uppercase tracking-widest mb-1">Valid Ticket</p>
            <p className="text-white font-bold text-lg leading-tight">{from} → {to}</p>
            <p className="text-emerald-100 text-xs mt-0.5">{formatDate(date)} · {time}</p>

            {/* Verified check */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          {/* Dashed separator — torn edge effect */}
          <div className="relative flex items-center">
            <div className="w-5 h-5 rounded-full bg-background border border-border -ml-2.5 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-border mx-1" />
            <div className="w-5 h-5 rounded-full bg-background border border-border -mr-2.5 shrink-0" />
          </div>

          {/* Detail rows */}
          <div className="bg-background">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`px-5 py-3 flex justify-between items-center ${i < rows.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="text-[11px] text-muted-foreground">{row.label}</span>
                <span className="text-xs font-semibold text-foreground text-right max-w-[55%] truncate">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Dashed separator */}
          <div className="relative flex items-center">
            <div className="w-5 h-5 rounded-full bg-background border border-border -ml-2.5 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-border mx-1" />
            <div className="w-5 h-5 rounded-full bg-background border border-border -mr-2.5 shrink-0" />
          </div>

          {/* Total */}
          <div className="px-5 py-4 bg-secondary/10 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total fare</p>
              <p className="text-[10px] text-muted-foreground">Pay on boarding</p>
            </div>
            <p className="text-xl font-bold text-foreground">LKR {Number(fare).toLocaleString()}</p>
          </div>
        </div>

        {/* Reminder */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-6">
          <span className="text-amber-600 shrink-0 mt-0.5">⚠</span>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Please arrive at the bus stand at least <strong>10 minutes</strong> before departure. Show this screen to the conductor.
          </p>
        </div>

        {/* Book another */}
        <button
          type="button"
          onClick={() => router.push('/booking')}
          className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98]"
        >
          Book another trip
        </button>

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          This is a digital ticket confirmation. Not transferable.
        </p>
      </div>
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading ticket…
      </div>
    }>
      <TicketContent />
    </Suspense>
  );
}