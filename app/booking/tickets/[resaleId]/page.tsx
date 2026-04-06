'use client';
// app/booking/tickets/[resaleId]/page.tsx  →  Buy a resale ticket

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RESALE_TICKETS } from '@/lib/booking/mock/resale';
import { useBooking } from '@/lib/booking/context';
import { Tag, ArrowRight, Clock, Calendar } from 'lucide-react';

const BOARDING_POINTS = ['Colombo Fort', 'Pettah', 'Kadawatha', 'Ambepussa'];

export default function BuyResalePage({
  params,
}: {
  params: Promise<{ resaleId: string }>;
}) {
  const { resaleId } = use(params);
  const router = useRouter();
  const { setPassengerName, setPassengerPhone, setPassengerGender } = useBooking();

  const ticket = RESALE_TICKETS.find(r => r.id === resaleId);

  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [gender, setGender]     = useState<'male' | 'female' | ''>('');
  const [boarding, setBoarding] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!ticket || ticket.status !== 'available') {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">This resale ticket is no longer available.</p>
      </div>
    );
  }

  const canProceed = name.trim() && phone.trim() && gender && boarding;

  const handleConfirm = () => {
    if (!canProceed) return;
    setPassengerName(name.trim());
    setPassengerPhone(phone.trim());
    setPassengerGender(gender as 'male' | 'female');
    setConfirmed(true);
    setTimeout(() => router.push('/booking/confirmed'), 1200);
  };

  const date = new Date(ticket.date).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  if (confirmed) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-foreground">Purchase confirmed! Redirecting…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 py-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Tag size={11} /> Resale ticket
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Buy this seat</h1>
        <p className="text-sm text-muted-foreground">
          Transferred directly from the original passenger.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Ticket card ── */}
        <div className="w-full lg:max-w-sm">

          {/* Ticket visual */}
          <div className="relative rounded-2xl border border-amber-200 bg-amber-50/40 overflow-hidden p-5 mb-4">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-100/50 pointer-events-none" />
            <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-orange-100/40 pointer-events-none" />

            {/* Operator row */}
            <div className="flex items-center justify-between mb-4 relative">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0"
                  style={{ background: ticket.accentColor }}
                >
                  {ticket.operatorName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{ticket.operatorName}</span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">
                <Tag size={8} /> Resale
              </span>
            </div>

            {/* Route */}
            <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-3 relative">
              <span>{ticket.from}</span>
              <ArrowRight size={16} className="text-amber-400 shrink-0" />
              <span>{ticket.to}</span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mb-4 relative">
              <span className="flex items-center gap-1"><Clock size={10} /> {ticket.departure}</span>
              <span className="flex items-center gap-1"><Calendar size={10} /> {date}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                Seat {ticket.seat}
              </span>
            </div>

            {/* Dashed divider — ticket tear line */}
            <div className="relative flex items-center gap-2 my-4">
              <div className="absolute -left-5 w-5 h-5 rounded-full bg-background border-r border-amber-200" />
              <div className="flex-1 border-t border-dashed border-amber-300" />
              <div className="absolute -right-5 w-5 h-5 rounded-full bg-background border-l border-amber-200" />
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 relative">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Original fare</span>
                <span>LKR {ticket.originalFare}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mediation fee</span>
                <span>LKR {ticket.mediationFee}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-amber-200 mt-1.5">
                <span>Total</span>
                <span>LKR {ticket.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Trust note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 border border-border text-left">
            <span className="text-sm shrink-0 mt-0.5">🔒</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Payment is held in escrow. The original passenger receives their refund only after your ticket is confirmed.
            </p>
          </div>
        </div>

        {/* ── Passenger form ── */}
        <div className="flex-1 w-full min-w-0">
          <p className="text-sm font-bold text-foreground mb-4">Your details</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Passenger name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Mobile number
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background focus-within:border-foreground/40">
                <span className="text-xs text-muted-foreground shrink-0">+94</span>
                <input
                  type="tel"
                  placeholder="071 234 5678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Boarding place
              </label>
              <select
                value={boarding}
                onChange={e => setBoarding(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40"
              >
                <option value="">Select boarding point</option>
                {BOARDING_POINTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Destination
              </label>
              <input
                type="text"
                value={ticket.to}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/40 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* Price summary */}
          <div className="mt-5 p-4 rounded-xl border border-border bg-secondary/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Seat {ticket.seat}</span>
              <span className="text-xs text-muted-foreground">LKR {ticket.originalFare}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-muted-foreground">Mediation fee</span>
              <span className="text-xs text-muted-foreground">LKR {ticket.mediationFee}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-sm font-bold text-foreground">Total (pay on boarding)</span>
              <span className="text-sm font-bold text-foreground">LKR {ticket.totalPrice}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!canProceed}
            onClick={handleConfirm}
            className={`w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
              ${canProceed
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}
          >
            Confirm purchase · LKR {ticket.totalPrice}
          </button>

          <p className="text-[10px] text-muted-foreground text-center mt-2">
            No cancellation fees · instant seat transfer
          </p>
        </div>
      </div>
    </div>
  );
}