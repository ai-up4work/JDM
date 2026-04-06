'use client';
// app/booking/[operatorId]/[busId]/page.tsx

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';
import { getBus, getOperator } from '@/lib/booking/mock/operators';

// ─── Seat map types ───────────────────────────────────────────────
type SeatRow = {
  left: [number, number];
  mid: number | null;
  right: [number | null, number | null];
};

// Row 1  → left pair only, right slots empty        = 2 seats
// Row 2–12 → left pair + right pair                 = 4 seats each
// Row 13 → left pair + middle + right pair          = 5 seats
// Total: 2 + (11 × 4) + 5 = 51
function buildSeatMap(): SeatRow[] {
  let n = 1;
  return Array.from({ length: 13 }, (_, r) => {
    if (r === 0)  return { left: [n++, n++], mid: null, right: [null, null] };
    if (r === 12) return { left: [n++, n++], mid: n++,  right: [n++, n++]  };
    return               { left: [n++, n++], mid: null, right: [n++, n++]  };
  });
}

// ─── Mock booked seats (deterministic from busId) ─────────────────
function getBookedSeats(busId: string): Set<number> {
  const booked = new Set<number>();
  let h = [...busId].reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 1; i <= 51; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    if (h % 3 === 0) booked.add(i);
  }
  return booked;
}

// ─── Ladies-only seats ────────────────────────────────────────────
const LADIES_SEATS = new Set([1, 2, 3, 4, 19, 20, 21, 22]);

const MAX_SEATS = 5;
const BOARDING_POINTS = ['Colombo Fort', 'Pettah', 'Kadawatha', 'Ambepussa'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

// ─── Page ─────────────────────────────────────────────────────────
export default function SeatSelectPage({
  params,
}: {
  params: Promise<{ operatorId: string; busId: string }>;
}) {
  const { operatorId, busId } = use(params);
  const router = useRouter();
  const {
    operator, bus: ctxBus,
    setSeatCount, setBus, setOperator,
    setPassengerName, setPassengerPhone, setPassengerGender,
  } = useBooking();

  const op  = operator ?? getOperator(operatorId);
  const bus = ctxBus   ?? getBus(operatorId, busId);

  const [selected, setSelected] = useState<number[]>([]);
  const [gender, setGender]     = useState<'male' | 'female' | ''>('');
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [error, setError]       = useState('');

  if (!op || !bus) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Bus not found.</p>
      </div>
    );
  }

  if (!operator) setOperator(op);
  if (!ctxBus)   setBus(bus);

  const seatMap = buildSeatMap();
  const booked  = getBookedSeats(busId);

  // ── Seat color helper ──────────────────────────────────────────
  const seatCls = (n: number | null): string => {
    if (n === null) return 'invisible';
    if (booked.has(n))   return 'bg-[#f0f0f0] border-[#ddd] text-[#bbb] cursor-not-allowed';
    if (selected.includes(n))
      return LADIES_SEATS.has(n)
        ? 'bg-blue-700 border-blue-800 text-white scale-105'
        : 'bg-emerald-700 border-emerald-800 text-white scale-105';
    if (LADIES_SEATS.has(n)) return 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200 active:scale-95 cursor-pointer';
    return 'bg-[#eef5d6] border-[#d4e89a] text-[#5a7a00] hover:bg-[#dff0a0] active:scale-95 cursor-pointer';
  };

  // ── Toggle seat ────────────────────────────────────────────────
  const toggle = (n: number) => {
    setError('');
    if (booked.has(n)) return;
    if (selected.includes(n)) {
      setSelected(prev => prev.filter(s => s !== n));
      return;
    }
    if (LADIES_SEATS.has(n) && gender !== 'female') {
      setError(`Seat ${n} is reserved for ladies only. Please select female gender first.`);
      return;
    }
    if (selected.length >= MAX_SEATS) {
      setError(`Maximum ${MAX_SEATS} seats per booking.`);
      return;
    }
    setSelected(prev => [...prev, n]);
  };

  // ── Seat button ────────────────────────────────────────────────
  const SeatBtn = ({ n }: { n: number | null }) => {
    if (n === null) {
      // Empty slot — same size as seat so row width stays fixed
      return <div className="w-[34px] h-[34px] shrink-0" />;
    }
    return (
      <button
        type="button"
        disabled={booked.has(n)}
        onClick={() => toggle(n)}
        className={`w-[34px] h-[34px] rounded-lg border text-[10px] font-semibold shrink-0 transition-all duration-100 ${seatCls(n)}`}
      >
        {n}
      </button>
    );
  };

  const totalFare  = selected.length * bus.fare;
  const canProceed = selected.length > 0 && name.trim() && phone.trim() && gender;

  const handleContinue = () => {
    if (!canProceed) return;
    setSeatCount(selected.length);
    setPassengerName(name.trim());
    setPassengerPhone(phone.trim());
    setPassengerGender(gender as 'male' | 'female');
    router.push('/booking/confirmed');
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0"
            style={{ background: op.accentColor }}
          >
            {op.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{op.name}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Select seats &amp; fill form</h1>
        <p className="text-sm text-muted-foreground">
          {bus.from} → {bus.to} · {formatDate(bus.date)} at {bus.departureTime}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Seat map column ─────────────────────────────────── */}
        <div className="w-full lg:w-auto flex flex-col items-center">

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 justify-center">
            {[
              { bg: 'bg-blue-100 border-blue-300',          label: 'Ladies only' },
              { bg: 'bg-[#eef5d6] border-[#d4e89a]',        label: 'Available'   },
              { bg: 'bg-[#f0f0f0] border-[#ddd]',           label: 'Already booked' },
              { bg: 'bg-[#2a2a2a] border-[#111]',           label: 'In progress' },
            ].map(({ bg, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded border ${bg} shrink-0`} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Bus shell */}
          <div className="rounded-2xl border border-border overflow-hidden bg-background">
            {/* Front cab */}
            <div className="text-center py-2 px-8 bg-secondary/40 border-b border-border">
              <span className="text-[10px] font-semibold text-muted-foreground tracking-widest">Front</span>
            </div>

            {/* Seat grid */}
            <div className="p-3 space-y-1">
              {seatMap.map((row, ri) => (
                <div key={ri} className="flex items-center gap-0">
                  {/* Row number — fixed width */}
                  <span className="w-[26px] text-[10px] text-muted-foreground/40 text-right shrink-0 pr-1.5">
                    {ri + 1}
                  </span>

                  {/* Left seat A */}
                  <SeatBtn n={row.left[0]} />
                  <div className="w-1 shrink-0" />
                  {/* Left seat B */}
                  <SeatBtn n={row.left[1]} />

                  {/* Aisle / middle seat — always exactly one seat-width (34px) + 2×4px gaps */}
                  <div className="w-1 shrink-0" />
                  {row.mid !== null
                    ? <SeatBtn n={row.mid} />          /* last row: middle seat */
                    : <div className="w-[34px] h-[34px] shrink-0" /> /* other rows: blank */
                  }
                  <div className="w-1 shrink-0" />

                  {/* Right seat C */}
                  <SeatBtn n={row.right[0]} />
                  <div className="w-1 shrink-0" />
                  {/* Right seat D */}
                  <SeatBtn n={row.right[1]} />
                </div>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-[11px] text-red-500 mt-2 text-center max-w-[220px]">{error}</p>
          )}
        </div>

        {/* ── Passenger form column ───────────────────────────── */}
        <div className="flex-1 w-full min-w-0">

          {/* Seat summary */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4 mb-4">
            <p className="text-xs font-semibold text-foreground mb-2">Seat details</p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Seats</span>
              <span className={`text-xs font-semibold ${selected.length ? 'text-foreground' : 'text-red-500'}`}>
                {selected.length
                  ? [...selected].sort((a, b) => a - b).join(', ')
                  : 'Please select your seats'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className={`text-xs font-semibold ${selected.length ? 'text-foreground' : 'text-red-500'}`}>
                {selected.length ? `LKR ${totalFare.toLocaleString()}` : '0 LKR'}
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Passenger name</label>
              <input
                type="text"
                placeholder="Enter passenger name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile number</label>
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
                onChange={e => { setGender(e.target.value as 'male' | 'female'); setError(''); }}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Boarding place</label>
              <select className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40">
                <option value="">Select boarding point</option>
                {BOARDING_POINTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination place</label>
              <select className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40">
                <option value="">Select destination</option>
                <option>{bus.to}</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={!canProceed}
            onClick={handleContinue}
            className={`w-full mt-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
              ${canProceed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}
          >
            Continue to pay
          </button>
        </div>
      </div>
    </div>
  );
}