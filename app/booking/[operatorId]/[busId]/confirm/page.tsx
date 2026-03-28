'use client';
// app/booking/[operatorId]/[busId]/confirm/page.tsx  →  Step 4: Request submitted

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';
import { getBus, getOperator } from '@/lib/booking/mock/operators';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function RequestSubmittedPage({ params }: { params: Promise<{ operatorId: string; busId: string }> }) {
  const { operatorId, busId } = use(params);
  const router = useRouter();

  const {
    operator: ctxOp, bus: ctxBus,
    seatCount, passengerName, passengerPhone, passengerGender,
    requestId, clearBooking,
  } = useBooking();

  const op  = ctxOp  ?? getOperator(operatorId);
  const bus = ctxBus ?? getBus(operatorId, busId);

  if (!op || !bus || !requestId) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground text-sm">No request found.</p>
      </div>
    );
  }

  const estimatedFare = seatCount * bus.fare;

  return (
    <div className="max-w-[480px] mx-auto text-center py-8">
      {/* Pending icon */}
      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(59,130,246,0.25)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Request submitted!</h1>
      <p className="text-sm text-muted-foreground mb-1">
        {op.name} · {bus.from} → {bus.to}
      </p>
      <p className="text-sm text-muted-foreground mb-5">
        {formatDate(bus.date)} · {bus.departureTime}
      </p>

      {/* Request reference */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-6">
        <span className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Request ID</span>
        <span className="text-xs font-bold text-blue-700 font-mono">{requestId}</span>
      </div>

      {/* What happens next */}
      <div className="rounded-2xl border border-border text-left overflow-hidden mb-5">
        <div className="px-4 py-3 bg-secondary/30 border-b border-border">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Request summary</p>
        </div>
        {[
          { label: 'Passenger',        value: passengerName },
          { label: 'Phone',            value: `+94 ${passengerPhone}` },
          { label: 'Gender',           value: passengerGender === 'male' ? '♂ Male' : '♀ Female' },
          { label: 'Seats requested',  value: `${seatCount} seat${seatCount > 1 ? 's' : ''}` },
          { label: 'Route',            value: `${bus.from} → ${bus.to}` },
          { label: 'Departure',        value: `${formatDate(bus.date)} at ${bus.departureTime}` },
          { label: 'Estimated fare',   value: `LKR ${estimatedFare.toLocaleString()}` },
        ].map(row => (
          <div key={row.label} className="px-4 py-3 border-b border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs font-semibold text-foreground">{row.value}</span>
          </div>
        ))}
        <div className="px-4 py-3 bg-blue-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-blue-700">Pending seat assignment</span>
        </div>
      </div>

      {/* What happens next steps */}
      <div className="rounded-2xl border border-border p-4 text-left mb-5 space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">What happens next</p>
        {[
          { icon: '📋', step: 'Our back-office team reviews your request' },
          { icon: '💺', step: 'A seat is assigned based on your gender preference' },
          { icon: '✅', step: 'You\'ll receive confirmation before departure' },
          { icon: '🚌', step: 'Pay on boarding — arrive 10 minutes early' },
        ].map(({ icon, step }) => (
          <div key={step} className="flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5">{icon}</span>
            <p className="text-xs text-muted-foreground">{step}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => { clearBooking(); router.push('/booking'); }}
        className="px-8 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98]"
      >
        Book another trip
      </button>
    </div>
  );
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ConfirmPage({ params }: { params: Promise<{ operatorId: string; busId: string }> }) {
  const { operatorId, busId } = use(params);
  const router = useRouter();

  const {
    operator: ctxOp, bus: ctxBus,
    selectedSeats,
    passengerName, setPassengerName,
    passengerPhone, setPassengerPhone,
    passengerGender, setPassengerGender,
  } = useBooking();

  const op  = ctxOp  ?? getOperator(operatorId);
  const bus = ctxBus ?? getBus(operatorId, busId);

  const [submitting, setSubmitting] = useState(false);

  if (!op || !bus || selectedSeats.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground text-sm">No booking in progress.</p>
      </div>
    );
  }

  const totalFare = selectedSeats.length * bus.fare;

  const handleConfirm = () => {
    if (!passengerName.trim() || !passengerPhone.trim()) return;
    setSubmitting(true);
    // Confirm each seat in the store
    selectedSeats.forEach(id => confirmSeat(busId, id, passengerGender));
    setTimeout(() => router.push('/booking/confirmed'), 400);
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Confirm booking</h1>
        <p className="text-sm text-muted-foreground">Review your trip and enter passenger details.</p>
      </div>

      {/* Booking summary card */}
      <div className="rounded-2xl border border-border overflow-hidden mb-5">
        <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0"
            style={{ background: op.accentColor }}
          >
            {op.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-foreground">{op.name}</span>
          <span className="text-muted-foreground/30 ml-auto text-xs">{bus.departureTime}</span>
        </div>

        {[
          { label: 'Route',      value: `${bus.from} → ${bus.to}` },
          { label: 'Date',       value: formatDate(bus.date) },
          { label: 'Duration',   value: `${bus.duration} · ${bus.distance}` },
          { label: 'Seats',      value: selectedSeats.join(', ') },
          { label: 'Fare/seat',  value: `LKR ${bus.fare.toLocaleString()}` },
        ].map(row => (
          <div key={row.label} className="px-4 py-3 border-b border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs font-semibold text-foreground">{row.value}</span>
          </div>
        ))}

        <div className="px-4 py-3 bg-secondary/10 flex justify-between items-center">
          <span className="text-sm font-bold text-foreground">Total</span>
          <span className="text-base font-bold text-foreground">LKR {totalFare.toLocaleString()}</span>
        </div>
      </div>

      {/* Passenger details form */}
      <div className="rounded-2xl border border-border p-4 mb-5 space-y-4">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Passenger details</p>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Kamal Perera"
            value={passengerName}
            onChange={e => setPassengerName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Mobile number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border bg-secondary/30 text-xs text-muted-foreground font-medium shrink-0">
              🇱🇰 +94
            </span>
            <input
              type="tel"
              placeholder="7X XXX XXXX"
              value={passengerPhone}
              onChange={e => setPassengerPhone(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-border bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Gender</label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setPassengerGender(g)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all
                  ${passengerGender === g
                    ? g === 'male'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-pink-400 text-white border-pink-400'
                    : 'border-border text-muted-foreground hover:border-foreground/30'}`}
              >
                {g === 'male' ? '♂ Male' : '♀ Female'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5">
        <span className="text-amber-600 shrink-0 mt-0.5 text-sm">⚠</span>
        <p className="text-[11px] text-amber-700">
          Payment (COD) is collected on boarding. Please arrive at least 10 minutes before departure.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="button"
        disabled={!passengerName.trim() || !passengerPhone.trim() || submitting}
        onClick={handleConfirm}
        className="w-full py-3.5 rounded-xl bg-foreground text-background text-sm font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {submitting ? 'Confirming…' : `✓ Confirm booking · LKR ${totalFare.toLocaleString()}`}
      </button>
    </div>
  );
}