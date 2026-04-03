'use client';
// app/booking/confirmed/page.tsx

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

function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  const encoded = encodeURIComponent(value);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10`}
      width={size}
      height={size}
      alt="Booking QR code"
      className="rounded-xl"
    />
  );
}

export default function ConfirmedPage() {
  const router = useRouter();
  const {
    operator, bus, seatCount,
    passengerName, passengerPhone, passengerGender,
    clearBooking,
  } = useBooking();

  const ref = useMemo(() => randomRef(), []);
  const totalFare = bus && seatCount ? seatCount * bus.fare : 0;

  const qrPayload = useMemo(() => {
    const params = new URLSearchParams({
      ref,
      name: passengerName ?? '',
      phone: passengerPhone ?? '',
      from: bus?.from ?? '',
      to: bus?.to ?? '',
      date: bus?.date ?? '',
      time: bus?.departureTime ?? '',
      seats: String(seatCount),
      fare: String(totalFare),
    });
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/booking/ticket?${params.toString()}`;
  }, [ref, passengerName, passengerPhone, bus, seatCount, totalFare]);

  const handleBookAnother = () => {
    clearBooking();
    router.push('/booking');
  };

  const rows = [
    { label: 'Passenger',          value: passengerName || '—' },
    { label: 'Phone',              value: passengerPhone ? `+94 ${passengerPhone}` : '—' },
    { label: 'Gender',             value: passengerGender === 'male' ? '♂ Male' : '♀ Female' },
    { label: 'Seat(s)',            value: seatCount > 1 ? `${seatCount} seats` : '1 seat' },
    { label: 'Route',              value: bus ? `${bus.from} → ${bus.to}` : '—' },
    { label: 'Departure',          value: bus ? `${formatDate(bus.date)} at ${bus.departureTime}` : '—' },
    { label: 'Total (on boarding)', value: `LKR ${totalFare.toLocaleString()}` },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-2">

      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_28px_rgba(16,185,129,0.3)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Booking confirmed!</h1>
        <p className="text-sm text-muted-foreground">
          {operator?.name} · {bus?.from} → {bus?.to}
          {bus && <> · {formatDate(bus.date)} at {bus.departureTime}</>}
        </p>

        {/* Ref badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mt-3">
          <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Ref</span>
          <span className="text-xs font-bold text-emerald-700 font-mono">{ref}</span>
        </div>
      </div>

      {/* Main card — side by side on md+, stacked on mobile */}
      <div className="rounded-2xl border border-border overflow-hidden mb-5 flex flex-col md:flex-row">

        {/* Left: booking details */}
        <div className="flex-1 min-w-0">
          <div className="px-4 py-3 bg-secondary/30 border-b border-border">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Booking details</p>
          </div>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`px-4 py-3 flex justify-between items-center gap-4 ${
                i === rows.length - 1
                  ? 'bg-secondary/10'
                  : 'border-b border-border'
              }`}
            >
              <span className={`text-xs shrink-0 ${i === rows.length - 1 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                {row.label}
              </span>
              <span className={`font-semibold text-foreground text-right ${i === rows.length - 1 ? 'text-sm' : 'text-xs'}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-border" />
        <div className="block md:hidden h-px bg-border" />

        {/* Right: QR code */}
        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-secondary/5 md:w-56 shrink-0">
          <QRCode value={qrPayload} size={160} />
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Scan to view your ticket details. Show this to the conductor.
          </p>
        </div>
      </div>

      {/* Reminder */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-left mb-6">
        <span className="text-amber-600 shrink-0 mt-0.5 text-sm">⚠</span>
        <p className="text-[11px] text-amber-700">
          Please arrive at the bus stand at least 10 minutes before departure.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleBookAnother}
          className="px-8 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98]"
        >
          Book another trip
        </button>
      </div>
    </div>
  );
}