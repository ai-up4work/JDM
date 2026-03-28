'use client';
// app/admin/page.tsx  →  Admin dashboard: all seat requests

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllRequests, BookingRequest, RequestStatus } from '@/lib/booking/mock/bookingStore';
import { getOperator, getBus } from '@/lib/booking/mock/operators';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  assigned:  'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-secondary text-muted-foreground border-border',
};

const STATUS_DOT: Record<RequestStatus, string> = {
  pending:   'bg-amber-400',
  assigned:  'bg-blue-400',
  confirmed: 'bg-emerald-500',
  cancelled: 'bg-muted-foreground/30',
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');

  const load = () => setRequests(getAllRequests());

  useEffect(() => {
    load();
    // Listen for real-time request updates from other tabs
    const ch = new BroadcastChannel('bus-seats');
    ch.onmessage = (e) => {
      if (e.data?.type === 'requests') setRequests(e.data.requests);
    };
    return () => ch.close();
  }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  // Group by busId
  const grouped = filtered.reduce<Record<string, BookingRequest[]>>((acc, r) => {
    (acc[r.busId] ??= []).push(r);
    return acc;
  }, {});

  const counts = {
    all:       requests.length,
    pending:   requests.filter(r => r.status === 'pending').length,
    assigned:  requests.filter(r => r.status === 'assigned').length,
    confirmed: requests.filter(r => r.status === 'confirmed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Seat requests</h1>
        <p className="text-sm text-muted-foreground">Review and assign seats to passenger requests.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {([
          { key: 'pending',   label: 'Pending',   color: 'text-amber-600' },
          { key: 'assigned',  label: 'Assigned',  color: 'text-blue-600' },
          { key: 'confirmed', label: 'Confirmed', color: 'text-emerald-600' },
          { key: 'cancelled', label: 'Cancelled', color: 'text-muted-foreground' },
        ] as const).map(({ key, label, color }) => (
          <div key={key} className="rounded-xl border border-border bg-secondary/20 p-3">
            <p className={`text-2xl font-bold ${color}`}>{counts[key]}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {(['all', 'pending', 'assigned', 'confirmed', 'cancelled'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize
              ${filter === f
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
          >
            {f === 'all' ? `All (${counts.all})` : `${f} (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-20 text-center rounded-2xl border border-border border-dashed">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm font-semibold text-foreground mb-1">No requests yet</p>
          <p className="text-xs text-muted-foreground">
            {filter === 'all'
              ? 'Passenger requests will appear here once submitted.'
              : `No ${filter} requests right now.`}
          </p>
        </div>
      )}

      {/* Grouped by bus */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([busId, reqs]) => {
          const bus = getBus(reqs[0].operatorId, busId);
          const op  = getOperator(reqs[0].operatorId);
          return (
            <div key={busId} className="rounded-2xl border border-border overflow-hidden">
              {/* Bus header */}
              <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {op && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0"
                      style={{ background: op.accentColor }}
                    >
                      {op.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {bus ? `${bus.from} → ${bus.to}` : busId}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {bus ? `${bus.departureTime} · ${op?.name}` : ''}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/bus/${busId}?operatorId=${reqs[0].operatorId}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-foreground text-background text-[10px] font-bold hover:bg-foreground/90 transition-colors shrink-0"
                >
                  Open seat map
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>

              {/* Request rows */}
              <div className="divide-y divide-border">
                {reqs.map(req => (
                  <div key={req.id} className="px-4 py-3 flex items-center gap-3">
                    {/* Status dot */}
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[req.status]}`} />

                    {/* Passenger info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-foreground">{req.passengerName}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[req.status]}`}>
                          {req.status}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium
                          ${req.passengerGender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-600'}`}>
                          {req.passengerGender === 'male' ? '♂' : '♀'} {req.passengerGender}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{req.passengerPhone}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{req.seatCount} seat{req.seatCount > 1 ? 's' : ''}</span>
                        {req.assignedSeats.length > 0 && (
                          <>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] font-medium text-foreground">
                              Assigned: {req.assignedSeats.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ref + time */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-mono font-bold text-foreground">{req.id}</p>
                      <p className="text-[10px] text-muted-foreground">{formatTime(req.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}