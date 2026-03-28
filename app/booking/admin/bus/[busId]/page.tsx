'use client';
// app/admin/bus/[busId]/page.tsx
// Admin: view seat map for a specific bus, assign seats to pending requests, confirm.

import { use, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getSeats, getRequestsByBus,
  assignSeats, confirmRequest, cancelRequest,
  BookingRequest,
} from '@/lib/booking/mock/bookingStore';
import { Seat } from '@/lib/booking/mock/seats';
import { getBus, getOperator } from '@/lib/booking/mock/operators';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  assigned:  'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-secondary text-muted-foreground border-border',
};

export default function AdminBusPage({ params }: { params: Promise<{ busId: string }> }) {
  const { busId }      = use(params);
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const operatorId     = searchParams.get('operatorId') ?? '';

  const bus = getBus(operatorId, busId);
  const op  = getOperator(operatorId);

  const [seats, setSeats]             = useState<Seat[]>([]);
  const [requests, setRequests]       = useState<BookingRequest[]>([]);
  const [activeRequest, setActive]    = useState<BookingRequest | null>(null);
  const [picking, setPicking]         = useState<string[]>([]);   // seat ids being picked for active request
  const [toast, setToast]             = useState<string | null>(null);

  const load = useCallback(() => {
    setSeats(getSeats(busId));
    setRequests(getRequestsByBus(busId));
  }, [busId]);

  useEffect(() => {
    load();
    const ch = new BroadcastChannel('bus-seats');
    ch.onmessage = (e) => {
      if (e.data?.type === 'seats'    && e.data.busId === busId) setSeats(e.data.seats);
      if (e.data?.type === 'requests') setRequests(e.data.requests.filter((r: BookingRequest) => r.busId === busId));
    };
    return () => ch.close();
  }, [busId, load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Start assigning seats to a request
  const startAssign = (req: BookingRequest) => {
    setActive(req);
    setPicking(req.assignedSeats.length > 0 ? [...req.assignedSeats] : []);
  };

  // Toggle a seat during picking
  const togglePick = (seatId: string) => {
    if (!activeRequest) return;
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.gender !== null) return; // already booked

    const isAlreadyPicked = picking.includes(seatId);
    if (isAlreadyPicked) {
      setPicking(p => p.filter(id => id !== seatId));
    } else {
      if (picking.length >= activeRequest.seatCount) return; // max reached
      setPicking(p => [...p, seatId]);
    }
  };

  const saveAssignment = () => {
    if (!activeRequest) return;
    if (picking.length !== activeRequest.seatCount) {
      showToast(`Please select exactly ${activeRequest.seatCount} seat${activeRequest.seatCount > 1 ? 's' : ''}`);
      return;
    }
    assignSeats(activeRequest.id, picking);
    load();
    setActive(null);
    setPicking([]);
    showToast(`Seats ${picking.join(', ')} assigned to ${activeRequest.passengerName}`);
  };

  const handleConfirm = (req: BookingRequest) => {
    confirmRequest(req.id);
    load();
    showToast(`Booking confirmed for ${req.passengerName} · seats ${req.assignedSeats.join(', ')}`);
  };

  const handleCancel = (req: BookingRequest) => {
    cancelRequest(req.id);
    load();
    if (activeRequest?.id === req.id) { setActive(null); setPicking([]); }
    showToast(`Request ${req.id} cancelled`);
  };

  const cancelPicking = () => { setActive(null); setPicking([]); };

  if (!bus || !op) {
    return (
      <div className="py-20 text-center">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Back to dashboard</Link>
        <p className="text-sm text-foreground mt-4">Bus not found.</p>
      </div>
    );
  }

  const available = seats.filter(s => s.gender === null && !s.held).length;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-foreground text-background text-xs font-medium shadow-lg whitespace-nowrap transition-all">
          {toast}
        </div>
      )}

      {/* Back nav */}
      <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All requests
      </Link>

      {/* Bus header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0"
              style={{ background: op.accentColor }}
            >
              {op.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground font-medium">{op.name}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {bus.from} → {bus.to}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(bus.date)} · {bus.departureTime} · {bus.duration}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-foreground">{available}</p>
          <p className="text-[10px] text-muted-foreground">seats free</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">

        {/* LEFT: Request list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Requests ({requests.length})
            </p>
            {activeRequest && (
              <button
                type="button"
                onClick={cancelPicking}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel selection
              </button>
            )}
          </div>

          {requests.length === 0 && (
            <div className="py-10 text-center rounded-2xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No requests for this bus yet.</p>
            </div>
          )}

          {requests.map(req => {
            const isActive = activeRequest?.id === req.id;
            return (
              <div
                key={req.id}
                className={`rounded-2xl border p-4 transition-all duration-150 ${
                  isActive
                    ? 'border-foreground bg-foreground/[0.03] shadow-sm'
                    : 'border-border hover:border-foreground/20'
                }`}
              >
                {/* Request header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{req.passengerName}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${STATUS_BADGE[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{req.passengerPhone}</p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0
                    ${req.passengerGender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-600'}`}>
                    {req.passengerGender === 'male' ? '♂' : '♀'} {req.passengerGender}
                  </span>
                </div>

                {/* Details */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-mono">{req.id}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {req.seatCount} seat{req.seatCount > 1 ? 's' : ''} requested
                  </span>
                  {req.assignedSeats.length > 0 && (
                    <span className="text-[10px] font-semibold text-foreground">
                      → {req.assignedSeats.join(', ')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {req.status === 'cancelled' || req.status === 'confirmed' ? (
                  <p className="text-[10px] text-muted-foreground italic">
                    {req.status === 'confirmed' ? `✓ Confirmed · seats ${req.assignedSeats.join(', ')}` : '✕ Cancelled'}
                  </p>
                ) : (
                  <div className="flex gap-2">
                    {/* Assign / Save */}
                    {req.status === 'pending' || req.status === 'assigned' ? (
                      isActive ? (
                        <button
                          type="button"
                          onClick={saveAssignment}
                          disabled={picking.length !== req.seatCount}
                          className="flex-1 py-2 rounded-xl bg-foreground text-background text-[10px] font-bold hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {picking.length === req.seatCount
                            ? `Save: ${picking.join(', ')}`
                            : `Pick ${req.seatCount - picking.length} more seat${req.seatCount - picking.length > 1 ? 's' : ''}`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startAssign(req)}
                          className="flex-1 py-2 rounded-xl border border-foreground/30 text-foreground text-[10px] font-bold hover:bg-secondary/50 transition-colors"
                        >
                          {req.status === 'assigned' ? 'Reassign seats' : 'Assign seats'}
                        </button>
                      )
                    ) : null}

                    {/* Confirm */}
                    {req.status === 'assigned' && !isActive && (
                      <button
                        type="button"
                        onClick={() => handleConfirm(req)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                      >
                        ✓ Confirm
                      </button>
                    )}

                    {/* Cancel */}
                    <button
                      type="button"
                      onClick={() => handleCancel(req)}
                      className="py-2 px-3 rounded-xl border border-border text-[10px] text-muted-foreground hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT: Seat map */}
        <div className="lg:sticky lg:top-20 self-start">
          {/* Assignment mode banner */}
          {activeRequest && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                Assigning {activeRequest.seatCount} seat{activeRequest.seatCount > 1 ? 's' : ''} for{' '}
                <strong>{activeRequest.passengerName}</strong>
                {' '}· {picking.length}/{activeRequest.seatCount} selected
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {[
              { cls: 'bg-emerald-50 border-emerald-300',    label: 'Available' },
              { cls: 'bg-blue-100 border-blue-300',         label: 'Male booked' },
              { cls: 'bg-pink-100 border-pink-300',         label: 'Female booked' },
              { cls: 'bg-foreground border-foreground',     label: 'Admin selected', textCls: 'text-background' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded border ${l.cls} shrink-0`} />
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Bus shell */}
          <div className="rounded-2xl border border-border bg-secondary/20 p-4 overflow-x-auto">
            {/* Driver */}
            <div className="flex justify-end mb-4 pr-1">
              <div className="w-10 h-7 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground font-medium">DRV</span>
              </div>
            </div>

            {/* Col headers */}
            <div className="grid mb-2 gap-1" style={{ gridTemplateColumns: '24px 1fr 14px 1fr' }}>
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

            {/* Rows */}
            <div className="space-y-1.5 min-w-[220px]">
              {Array.from({ length: 13 }, (_, i) => i + 1).map(row => {
                const rowSeats = seats.filter(s => s.row === row);
                const byCol = (col: string) => rowSeats.find(s => s.col === col);
                return (
                  <div key={row} className="grid gap-1 items-center" style={{ gridTemplateColumns: '24px 1fr 14px 1fr' }}>
                    <span className="text-[9px] text-muted-foreground/50 font-mono text-right pr-1">{row}</span>
                    <div className="grid grid-cols-2 gap-1">
                      {['A', 'B'].map(col => {
                        const seat = byCol(col);
                        return seat
                          ? <AdminSeatBtn key={seat.id} seat={seat} picking={picking} activeRequest={activeRequest} onToggle={togglePick} />
                          : <div key={col} />;
                      })}
                    </div>
                    <div />
                    <div className="grid grid-cols-2 gap-1">
                      {['C', 'D'].map(col => {
                        const seat = byCol(col);
                        return seat
                          ? <AdminSeatBtn key={seat.id} seat={seat} picking={picking} activeRequest={activeRequest} onToggle={togglePick} />
                          : <div key={col} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seat availability summary */}
          <div className="mt-4 rounded-xl border border-border p-3 grid grid-cols-2 gap-2">
            {[
              { label: 'Available',  count: seats.filter(s => s.gender === null && !s.held).length, color: 'text-emerald-600' },
              { label: 'Male',       count: seats.filter(s => s.gender === 'male').length,            color: 'text-blue-600' },
              { label: 'Female',     count: seats.filter(s => s.gender === 'female').length,          color: 'text-pink-500' },
              { label: 'Total',      count: seats.length,                                              color: 'text-foreground' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground">{row.label}</span>
                <span className={`text-xs font-bold ${row.color}`}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin seat button ────────────────────────────────────────────────────────

function AdminSeatBtn({
  seat, picking, activeRequest, onToggle,
}: {
  seat: Seat;
  picking: string[];
  activeRequest: BookingRequest | null;
  onToggle: (id: string) => void;
}) {
  const isPicked   = picking.includes(seat.id);
  const taken      = seat.gender !== null;
  const isPickable = activeRequest && !taken && !seat.held;
  const canPick    = isPickable && (isPicked || picking.length < (activeRequest?.seatCount ?? 0));

  let cls = 'w-full aspect-square rounded-md border text-[8px] font-bold transition-all duration-150 flex items-center justify-center ';

  if (isPicked && activeRequest) {
    cls += 'bg-foreground text-background border-foreground scale-95 shadow-sm';
  } else if (seat.gender === 'male') {
    cls += 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed';
  } else if (seat.gender === 'female') {
    cls += 'bg-pink-100 border-pink-300 text-pink-600 cursor-not-allowed';
  } else if (seat.held) {
    cls += 'bg-yellow-100 border-yellow-400 text-yellow-700 cursor-not-allowed';
  } else if (!activeRequest) {
    // No active request — seats are view-only
    cls += 'bg-emerald-50 border-emerald-300 text-emerald-600 cursor-default';
  } else if (!canPick) {
    cls += 'bg-secondary/50 border-border text-muted-foreground/40 cursor-not-allowed';
  } else {
    cls += 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:scale-105 cursor-pointer active:scale-95';
  }

  return (
    <button
      type="button"
      className={cls}
      disabled={!canPick && !isPicked}
      onClick={() => onToggle(seat.id)}
      aria-label={`Seat ${seat.id}`}
      title={seat.id}
    >
      {isPicked && activeRequest
        ? '✓'
        : seat.gender === 'male'
        ? 'M'
        : seat.gender === 'female'
        ? 'F'
        : seat.held
        ? '●'
        : seat.id}
    </button>
  );
}