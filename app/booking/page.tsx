'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Bus, Stethoscope, MapPin, Clock,
  Calendar, Users, ArrowRight, Check, ChevronLeft,
  Wifi, Wind, Zap, Star, AlertCircle, User,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingTab = 'bus' | 'doctor';
type SeatGender = 'male' | 'female' | null; // null = available

interface Seat {
  id: string;       // e.g. "1A"
  row: number;
  col: 'A' | 'B' | 'C' | 'D';
  gender: SeatGender;
  isSelected: boolean;
}

interface Route {
  id: string;
  from: string;
  to: string;
  duration: string;
  distance: string;
  departures: string[]; // times
}

interface BusOperator {
  id: string;
  name: string;
  type: 'government' | 'private';
  badge?: string;
  rating: number;
  reviews: number;
  amenities: string[];
  fare: number; // LKR per seat
  routes: Route[];
  accentColor: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const OPERATORS: BusOperator[] = [
  {
    id: 'sltb',
    name: 'SLTB',
    type: 'government',
    badge: 'Government',
    rating: 3.8,
    reviews: 1240,
    amenities: ['AC'],
    fare: 320,
    accentColor: '#1a4a8a',
    routes: [
      { id: 'sltb-r1', from: 'Colombo Fort', to: 'Kandy', duration: '2h 45m', distance: '115 km', departures: ['05:30', '07:00', '09:30', '12:00', '14:30', '17:00', '19:30'] },
      { id: 'sltb-r2', from: 'Colombo Fort', to: 'Galle', duration: '2h 10m', distance: '119 km', departures: ['06:00', '08:00', '10:30', '13:00', '15:30', '18:00'] },
      { id: 'sltb-r3', from: 'Colombo Fort', to: 'Jaffna', duration: '6h 30m', distance: '393 km', departures: ['05:00', '10:00', '22:00'] },
      { id: 'sltb-r4', from: 'Colombo Fort', to: 'Matara', duration: '3h 00m', distance: '160 km', departures: ['06:30', '09:00', '11:30', '14:00', '16:30'] },
    ],
  },
  {
    id: 'sharma',
    name: 'Sharma Travels',
    type: 'private',
    badge: 'Popular',
    rating: 4.5,
    reviews: 876,
    amenities: ['AC', 'WiFi', 'USB'],
    fare: 650,
    accentColor: '#8a2a1a',
    routes: [
      { id: 'sha-r1', from: 'Colombo Fort', to: 'Kandy', duration: '2h 15m', distance: '115 km', departures: ['06:00', '08:30', '11:00', '14:00', '17:30', '20:00'] },
      { id: 'sha-r2', from: 'Colombo Fort', to: 'Nuwara Eliya', duration: '3h 30m', distance: '160 km', departures: ['06:30', '10:00', '14:00'] },
      { id: 'sha-r3', from: 'Colombo Fort', to: 'Trincomalee', duration: '5h 00m', distance: '257 km', departures: ['06:00', '21:00'] },
    ],
  },
  {
    id: 'perera',
    name: 'Perera Transport',
    type: 'private',
    rating: 4.2,
    reviews: 534,
    amenities: ['AC', 'USB'],
    fare: 520,
    accentColor: '#1a6a3a',
    routes: [
      { id: 'per-r1', from: 'Colombo Fort', to: 'Galle', duration: '2h 00m', distance: '119 km', departures: ['07:00', '09:30', '12:00', '15:00', '18:30'] },
      { id: 'per-r2', from: 'Colombo Fort', to: 'Matara', duration: '2h 45m', distance: '160 km', departures: ['07:30', '10:00', '13:30', '17:00'] },
      { id: 'per-r3', from: 'Colombo Fort', to: 'Batticaloa', duration: '6h 00m', distance: '314 km', departures: ['05:30', '20:30'] },
    ],
  },
  {
    id: 'nilmini',
    name: 'Nilmini Express',
    type: 'private',
    badge: 'Top rated',
    rating: 4.7,
    reviews: 2103,
    amenities: ['AC', 'WiFi', 'USB', 'Recliner'],
    fare: 850,
    accentColor: '#5a1a8a',
    routes: [
      { id: 'nil-r1', from: 'Colombo Fort', to: 'Kandy', duration: '2h 00m', distance: '115 km', departures: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'] },
      { id: 'nil-r2', from: 'Colombo Fort', to: 'Jaffna', duration: '5h 45m', distance: '393 km', departures: ['06:00', '14:00', '22:00'] },
      { id: 'nil-r3', from: 'Colombo Fort', to: 'Nuwara Eliya', duration: '3h 15m', distance: '160 km', departures: ['07:00', '11:00', '15:00'] },
      { id: 'nil-r4', from: 'Colombo Fort', to: 'Trincomalee', duration: '4h 30m', distance: '257 km', departures: ['07:00', '21:30'] },
    ],
  },
];

// ─── Seat generation ──────────────────────────────────────────────────────────

function generateSeats(routeId: string, departure: string): Seat[] {
  // Deterministic pseudo-random based on route+time so it's consistent per session
  const seed = (routeId + departure).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (i: number) => ((seed * 9301 + i * 49297 + 233) % 233280) / 233280;

  const cols: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const seats: Seat[] = [];

  for (let row = 1; row <= 20; row++) {
    cols.forEach((col, ci) => {
      const r = rand(row * 10 + ci);
      let gender: SeatGender = null;
      if (r < 0.28) gender = 'male';
      else if (r < 0.48) gender = 'female';
      seats.push({ id: `${row}${col}`, row, col, gender, isSelected: false });
    });
  }
  return seats;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'AC':       <Wind size={11} />,
  'WiFi':     <Wifi size={11} />,
  'USB':      <Zap size={11} />,
  'Recliner': <Star size={11} />,
};

function today() {
  return new Date().toISOString().split('T')[0];
}

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDot({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300
      ${done ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]'
      : active ? 'bg-foreground text-background'
               : 'bg-muted text-muted-foreground'}`}>
      {done ? '✓' : n}
    </span>
  );
}

// ─── Seat Map ─────────────────────────────────────────────────────────────────

function SeatMap({
  seats, onToggle, maxSelect = 4,
}: {
  seats: Seat[];
  onToggle: (id: string) => void;
  maxSelect?: number;
}) {
  const selected = seats.filter(s => s.isSelected).length;

  return (
    <div className="select-none">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        {[
          { color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700', label: 'Available' },
          { color: 'bg-blue-500/20 border-blue-500/50 text-blue-700', label: 'Male' },
          { color: 'bg-pink-400/20 border-pink-400/50 text-pink-700', label: 'Female' },
          { color: 'bg-foreground/10 border-foreground/20 text-muted-foreground', label: 'Selected' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-md border ${l.color} shrink-0`} />
            <span className="text-[11px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs font-semibold text-foreground">{selected}/{maxSelect} selected</span>
      </div>

      {/* Bus shell */}
      <div className="rounded-2xl border border-border bg-secondary/20 p-4 overflow-x-auto">
        {/* Driver cabin */}
        <div className="flex justify-end mb-4 pr-1">
          <div className="w-10 h-7 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <span className="text-[9px] text-muted-foreground font-medium">DRV</span>
          </div>
        </div>

        {/* Aisle label row */}
        <div className="grid mb-2 gap-1" style={{ gridTemplateColumns: '28px 1fr 16px 1fr' }}>
          <div />
          <div className="grid grid-cols-2 gap-1">
            <p className="text-[9px] text-muted-foreground text-center uppercase tracking-wider">A</p>
            <p className="text-[9px] text-muted-foreground text-center uppercase tracking-wider">B</p>
          </div>
          <div />
          <div className="grid grid-cols-2 gap-1">
            <p className="text-[9px] text-muted-foreground text-center uppercase tracking-wider">C</p>
            <p className="text-[9px] text-muted-foreground text-center uppercase tracking-wider">D</p>
          </div>
        </div>

        {/* Seat rows */}
        <div className="space-y-1.5 min-w-[240px]">
          {Array.from({ length: 20 }, (_, i) => i + 1).map(row => {
            const rowSeats = seats.filter(s => s.row === row);
            const [A, B, C, D] = ['A', 'B', 'C', 'D'].map(col =>
              rowSeats.find(s => s.col === col)!
            );

            return (
              <div key={row} className="grid gap-1 items-center" style={{ gridTemplateColumns: '28px 1fr 16px 1fr' }}>
                {/* Row number */}
                <span className="text-[10px] text-muted-foreground/60 font-mono text-right pr-1">{row}</span>

                {/* Left pair: A B */}
                <div className="grid grid-cols-2 gap-1">
                  {[A, B].map(seat => seat && <SeatButton key={seat.id} seat={seat} onToggle={onToggle} canSelect={selected < maxSelect || seat.isSelected} />)}
                </div>

                {/* Aisle */}
                <div />

                {/* Right pair: C D */}
                <div className="grid grid-cols-2 gap-1">
                  {[C, D].map(seat => seat && <SeatButton key={seat.id} seat={seat} onToggle={onToggle} canSelect={selected < maxSelect || seat.isSelected} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SeatButton({ seat, onToggle, canSelect }: { seat: Seat; onToggle: (id: string) => void; canSelect: boolean }) {
  const taken = seat.gender !== null;
  const disabled = taken || (!canSelect && !seat.isSelected);

  let cls = 'w-full aspect-square rounded-md border text-[9px] font-bold transition-all duration-150 flex items-center justify-center ';

  if (seat.isSelected) {
    cls += 'bg-foreground text-background border-foreground shadow-sm scale-95';
  } else if (seat.gender === 'male') {
    cls += 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 cursor-not-allowed';
  } else if (seat.gender === 'female') {
    cls += 'bg-pink-100 dark:bg-pink-900/40 border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-300 cursor-not-allowed';
  } else if (disabled) {
    cls += 'bg-secondary/50 border-border text-muted-foreground/30 cursor-not-allowed';
  } else {
    cls += 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 hover:scale-105 cursor-pointer active:scale-95';
  }

  return (
    <button type="button" className={cls} disabled={disabled} onClick={() => !disabled && onToggle(seat.id)}>
      {seat.isSelected ? '✓' : seat.gender === 'male' ? 'M' : seat.gender === 'female' ? 'F' : seat.id}
    </button>
  );
}

// ─── Operator card ────────────────────────────────────────────────────────────

function OperatorCard({ op, selected, onSelect }: { op: BusOperator; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.99]
        ${selected
          ? 'border-foreground bg-foreground/[0.03] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.07)]'
          : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Coloured logo block */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black"
            style={{ background: op.accentColor }}>
            {op.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">{op.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {op.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 uppercase tracking-wider">
                  {op.badge}
                </span>
              )}
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider
                ${op.type === 'government'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-secondary text-muted-foreground'}`}>
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {op.amenities.map(a => (
            <span key={a} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {AMENITY_ICONS[a]} {a}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-foreground">{op.rating}</span>
          <span className="text-[10px] text-muted-foreground">({op.reviews.toLocaleString()})</span>
        </div>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-border">
        <p className="text-[10px] text-muted-foreground">{op.routes.length} routes available</p>
      </div>
    </button>
  );
}

// ─── Bus Booking Flow ─────────────────────────────────────────────────────────

function BusBooking() {
  const [step, setStep]           = useState<1|2|3|4|5>(1);
  const [operator, setOperator]   = useState<BusOperator | null>(null);
  const [route, setRoute]         = useState<Route | null>(null);
  const [date, setDate]           = useState(today());
  const [departure, setDeparture] = useState<string | null>(null);
  const [seats, setSeats]         = useState<Seat[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerGender, setPassengerGender] = useState<'male' | 'female'>('male');
  const [booked, setBooked]       = useState(false);

  const selectedSeats = seats.filter(s => s.isSelected);

  const handleOperatorSelect = (op: BusOperator) => {
    setOperator(op); setRoute(null); setDeparture(null); setSeats([]);
    setTimeout(() => setStep(2), 150);
  };

  const handleRouteSelect = (r: Route) => {
    setRoute(r); setDeparture(null); setSeats([]);
    setTimeout(() => setStep(3), 150);
  };

  const handleDepartureSelect = (dep: string) => {
    setDeparture(dep);
    if (operator && route) setSeats(generateSeats(route.id, dep));
    setTimeout(() => setStep(4), 150);
  };

  const toggleSeat = (id: string) => {
    setSeats(prev => prev.map(s => s.id === id ? { ...s, isSelected: !s.isSelected } : s));
  };

  const totalFare = operator ? selectedSeats.length * operator.fare : 0;

  const STEPS = [
    { n: 1 as const, label: 'Operator', done: !!operator },
    { n: 2 as const, label: 'Route',    done: !!route },
    { n: 3 as const, label: 'Date & time', done: !!departure },
    { n: 4 as const, label: 'Seats',    done: selectedSeats.length > 0 },
    { n: 5 as const, label: 'Confirm',  done: booked },
  ];

  if (booked) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(16,185,129,0.35)]">
          <Check size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Booking confirmed!</h2>
        <p className="text-muted-foreground text-sm mb-1">{operator?.name} · {route?.from} → {route?.to}</p>
        <p className="text-muted-foreground text-sm mb-6">{formatDate(date)} · {departure} · Seat(s): {selectedSeats.map(s => s.id).join(', ')}</p>
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Passenger</span><span className="font-semibold text-foreground">{passengerName}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Seats</span><span className="font-semibold text-foreground">{selectedSeats.length} × LKR {operator?.fare}</span></div>
          <div className="flex justify-between text-sm border-t border-border pt-2"><span className="font-semibold text-foreground">Total</span><span className="font-bold text-foreground">LKR {totalFare.toLocaleString()}</span></div>
        </div>
        <button type="button" onClick={() => { setBooked(false); setStep(1); setOperator(null); setRoute(null); setDeparture(null); setSeats([]); setPassengerName(''); setPassengerPhone(''); }}
          className="px-6 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors">
          Book another
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 xl:gap-12 items-start">

      {/* Left: steps */}
      <div className="flex flex-col gap-3">

        {/* Step nav */}
        <div className="hidden md:flex items-center gap-1 flex-wrap mb-2 overflow-x-auto scrollbar-hide">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-1 shrink-0">
              <button type="button"
                onClick={() => {
                  if (s.n === 1) setStep(1);
                  if (s.n === 2 && operator) setStep(2);
                  if (s.n === 3 && route) setStep(3);
                  if (s.n === 4 && departure) setStep(4);
                  if (s.n === 5 && selectedSeats.length > 0) setStep(5);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${step === s.n ? 'bg-foreground text-background' : s.done ? 'text-foreground hover:bg-secondary' : 'text-muted-foreground hover:text-foreground'}`}>
                <StepDot n={s.n} done={s.done} active={step === s.n} />
                {s.label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={10} className="text-border shrink-0" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Operator */}
        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${step === 1 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
          <button type="button" onClick={() => setStep(1)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-3">
              <StepDot n={1} done={!!operator} active={step === 1} />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Choose operator</p>
                {operator && <p className="text-xs text-muted-foreground mt-0.5">{operator.name} · LKR {operator.fare}/seat</p>}
              </div>
            </div>
            <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 1 ? 'rotate-90' : ''}`} />
          </button>
          {step === 1 && (
            <div className="border-t border-border p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OPERATORS.map(op => (
                <OperatorCard key={op.id} op={op} selected={operator?.id === op.id} onSelect={() => handleOperatorSelect(op)} />
              ))}
            </div>
          )}
        </div>

        {/* STEP 2: Route */}
        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${step === 2 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
          <button type="button" onClick={() => operator && setStep(2)} disabled={!operator}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
            <div className="flex items-center gap-3">
              <StepDot n={2} done={!!route} active={step === 2} />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Select route</p>
                {route && <p className="text-xs text-muted-foreground mt-0.5">{route.from} → {route.to} · {route.duration}</p>}
              </div>
            </div>
            <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 2 ? 'rotate-90' : ''}`} />
          </button>
          {step === 2 && operator && (
            <div className="border-t border-border p-3 space-y-2">
              {operator.routes.map(r => (
                <button key={r.id} type="button" onClick={() => handleRouteSelect(r)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150
                    ${route?.id === r.id ? 'border-foreground bg-foreground/[0.03]' : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin size={11} className="text-muted-foreground shrink-0" />
                      <p className="text-sm font-bold text-foreground">{r.from}</p>
                      <ArrowRight size={11} className="text-muted-foreground shrink-0" />
                      <p className="text-sm font-bold text-foreground">{r.to}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock size={10} />{r.duration}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{r.distance}</span>
                      <span className="text-[11px] text-muted-foreground">{r.departures.length} departures/day</span>
                    </div>
                  </div>
                  {route?.id === r.id && <Check size={14} className="text-foreground shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STEP 3: Date & Departure */}
        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${step === 3 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
          <button type="button" onClick={() => route && setStep(3)} disabled={!route}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
            <div className="flex items-center gap-3">
              <StepDot n={3} done={!!departure} active={step === 3} />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Date & departure time</p>
                {departure && <p className="text-xs text-muted-foreground mt-0.5">{formatDate(date)} · {departure}</p>}
              </div>
            </div>
            <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 3 ? 'rotate-90' : ''}`} />
          </button>
          {step === 3 && route && (
            <div className="border-t border-border p-4 space-y-4">
              {/* Date picker strip */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Calendar size={12} />Select date</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {nextDays(10).map(d => (
                    <button key={d} type="button" onClick={() => { setDate(d); setDeparture(null); }}
                      className={`shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border text-center transition-all min-w-[60px]
                        ${date === d ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground/30 hover:bg-secondary/30'}`}>
                      <span className={`text-[9px] font-semibold uppercase ${date === d ? 'text-background/70' : 'text-muted-foreground'}`}>
                        {new Date(d).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-bold mt-0.5">
                        {new Date(d).getDate()}
                      </span>
                      <span className={`text-[9px] ${date === d ? 'text-background/70' : 'text-muted-foreground'}`}>
                        {new Date(d).toLocaleDateString('en', { month: 'short' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Departure time */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Clock size={12} />Departure time</p>
                <div className="flex flex-wrap gap-2">
                  {route.departures.map(dep => (
                    <button key={dep} type="button" onClick={() => handleDepartureSelect(dep)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all
                        ${departure === dep ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground/30 hover:bg-secondary/30 text-foreground'}`}>
                      {dep}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 4: Seat map */}
        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${step === 4 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
          <button type="button" onClick={() => departure && setStep(4)} disabled={!departure}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
            <div className="flex items-center gap-3">
              <StepDot n={4} done={selectedSeats.length > 0} active={step === 4} />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Choose seats</p>
                {selectedSeats.length > 0
                  ? <p className="text-xs text-muted-foreground mt-0.5">Seat(s): {selectedSeats.map(s => s.id).join(', ')}</p>
                  : departure && <p className="text-xs text-muted-foreground mt-0.5">Select up to 4 seats</p>}
              </div>
            </div>
            <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 4 ? 'rotate-90' : ''}`} />
          </button>
          {step === 4 && seats.length > 0 && (
            <div className="border-t border-border p-4">
              <SeatMap seats={seats} onToggle={toggleSeat} />
              {selectedSeats.length > 0 && (
                <button type="button" onClick={() => setStep(5)}
                  className="w-full mt-4 py-3 rounded-xl bg-foreground text-background text-sm font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors">
                  Continue with {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* STEP 5: Passenger details + confirm */}
        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${step === 5 ? 'border-foreground/15 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-border'}`}>
          <button type="button" onClick={() => selectedSeats.length > 0 && setStep(5)} disabled={selectedSeats.length === 0}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors disabled:opacity-40">
            <div className="flex items-center gap-3">
              <StepDot n={5} done={booked} active={step === 5} />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Passenger details & confirm</p>
              </div>
            </div>
            <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${step === 5 ? 'rotate-90' : ''}`} />
          </button>
          {step === 5 && (
            <div className="border-t border-border p-4 sm:p-5 space-y-4">

              {/* Passenger form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Full name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Kamal Perera" value={passengerName} onChange={e => setPassengerName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="07X XXX XXXX" value={passengerPhone} onChange={e => setPassengerPhone(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Gender</label>
                  <div className="flex gap-2">
                    {(['male', 'female'] as const).map(g => (
                      <button key={g} type="button" onClick={() => setPassengerGender(g)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all
                          ${passengerGender === g
                            ? g === 'male' ? 'bg-blue-500 text-white border-blue-500' : 'bg-pink-400 text-white border-pink-400'
                            : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                        {g === 'male' ? '♂ Male' : '♀ Female'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between">
                  <span className="text-xs text-muted-foreground">Route</span>
                  <span className="text-xs font-semibold text-foreground">{route?.from} → {route?.to}</span>
                </div>
                <div className="px-4 py-3 border-b border-border flex justify-between">
                  <span className="text-xs text-muted-foreground">Date & time</span>
                  <span className="text-xs font-semibold text-foreground">{formatDate(date)} · {departure}</span>
                </div>
                <div className="px-4 py-3 border-b border-border flex justify-between">
                  <span className="text-xs text-muted-foreground">Seats</span>
                  <span className="text-xs font-semibold text-foreground">{selectedSeats.map(s => s.id).join(', ')}</span>
                </div>
                <div className="px-4 py-3 flex justify-between bg-secondary/10">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-base font-bold text-foreground">LKR {totalFare.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400">Payment (COD) collected on boarding. Arrive 10 minutes before departure.</p>
              </div>

              <button type="button"
                disabled={!passengerName.trim() || !passengerPhone.trim()}
                onClick={() => setBooked(true)}
                className="w-full py-3.5 rounded-xl bg-foreground text-background text-sm font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">
                <Check size={15} /> Confirm booking · LKR {totalFare.toLocaleString()}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Right: summary card — sticky */}
      <div className="lg:sticky lg:top-24 self-start flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-secondary/30 p-4">
          <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Booking summary</p>
          {!operator ? (
            <p className="text-[11px] text-muted-foreground">Select an operator to begin</p>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ background: operator.accentColor }}>
                  {operator.name.slice(0,2)}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{operator.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{operator.type}</p>
                </div>
              </div>
              {route && (
                <div className="pt-2.5 border-t border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Route</p>
                  <p className="text-xs font-semibold text-foreground">{route.from} → {route.to}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{route.duration} · {route.distance}</p>
                </div>
              )}
              {departure && (
                <div className="pt-2.5 border-t border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Departure</p>
                  <p className="text-xs font-semibold text-foreground">{formatDate(date)} at {departure}</p>
                </div>
              )}
              {selectedSeats.length > 0 && (
                <div className="pt-2.5 border-t border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Selected seats</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map(s => (
                      <span key={s.id} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-foreground text-background">{s.id}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedSeats.length > 0 && (
                <div className="pt-2.5 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Total</span>
                  <span className="text-sm font-bold text-foreground">LKR {totalFare.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Seat availability summary */}
        {seats.length > 0 && (
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Seat availability</p>
            <div className="space-y-2">
              {[
                { label: 'Available', count: seats.filter(s => s.gender === null && !s.isSelected).length, color: 'bg-emerald-500' },
                { label: 'Male taken', count: seats.filter(s => s.gender === 'male').length, color: 'bg-blue-500' },
                { label: 'Female taken', count: seats.filter(s => s.gender === 'female').length, color: 'bg-pink-400' },
                { label: 'Your selection', count: selectedSeats.length, color: 'bg-foreground' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${row.color}`} />
                    <span className="text-[11px] text-muted-foreground">{row.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{row.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Total seats</span>
                <span className="text-[11px] font-semibold text-foreground">80</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Doctor Booking (locked) ──────────────────────────────────────────────────

function DoctorBooking() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-2">
        <Stethoscope size={28} className="text-muted-foreground" />
      </div>
      <p className="text-lg font-bold text-foreground">Doctor appointments</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Book appointments with verified doctors and clinics island-wide. Coming soon.
      </p>
      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wider">
        Coming soon
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [tab, setTab] = useState<BookingTab>('bus');

  return (
    <div className="min-h-screen bg-background">

      {/* Sticky nav */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md mt-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">Bookings</span>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setTab('bus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${tab === 'bus' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
              <Bus size={12} /> Bus
            </button>
            <button type="button" onClick={() => setTab('doctor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${tab === 'doctor' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
              <Stethoscope size={12} /> Doctor
            </button>
          </div>
          <div className="hidden sm:block" />
        </div>
      </div>

      <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 min-w-0">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              {tab === 'bus'
                ? <Bus size={14} className="text-foreground" />
                : <Stethoscope size={14} className="text-foreground" />}
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {tab === 'bus' ? 'Island-wide bus booking' : 'Doctor appointments'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
              {tab === 'bus' ? 'Book your seat' : 'Book an appointment'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              {tab === 'bus'
                ? 'Choose your operator, route, date and seat. Pay on boarding.'
                : 'Find and book verified doctors across Sri Lanka.'}
            </p>
          </div>

          {tab === 'bus'    && <BusBooking />}
          {tab === 'doctor' && <DoctorBooking />}

        </div>
      </div>
    </div>
  );
}