'use client';
// components/booking/SeatMap.tsx

import { useEffect, useState } from 'react';
import { Seat } from '@/lib/booking/mock/seats';

interface SeatMapProps {
  busId: string;
  initialSeats: Seat[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelect?: number;
}

export default function SeatMap({ busId, initialSeats, selectedIds, onToggle, maxSelect = 4 }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [live, setLive] = useState(false);

  // Subscribe to BroadcastChannel for real-time cross-tab updates
  useEffect(() => {
    const ch = new BroadcastChannel('bus-seats');
    setLive(true);
    ch.onmessage = (e) => {
      if (e.data?.busId === busId && Array.isArray(e.data?.seats)) {
        setSeats(e.data.seats);
      }
    };
    return () => ch.close();
  }, [busId]);

  const selected = selectedIds.length;

  return (
    <div className="select-none">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-[10px] text-muted-foreground font-medium">{live ? 'Live' : 'Connecting...'}</span>
        </div>
        <span className="text-xs font-semibold text-foreground">{selected}/{maxSelect} selected</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {[
          { color: 'bg-emerald-50 border-emerald-300', label: 'Available' },
          { color: 'bg-blue-100 border-blue-300', label: 'Male' },
          { color: 'bg-pink-100 border-pink-300', label: 'Female' },
          { color: 'bg-foreground/10 border-foreground/20', label: 'Selected' },
          { color: 'bg-yellow-100 border-yellow-400', label: 'Held' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded border ${l.color} shrink-0`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bus shell */}
      <div className="rounded-2xl border border-border bg-secondary/20 p-4 overflow-x-auto">
        {/* Driver cabin */}
        <div className="flex justify-end mb-4 pr-1">
          <div className="w-10 h-7 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <span className="text-[9px] text-muted-foreground font-medium">DRV</span>
          </div>
        </div>

        {/* Column headers */}
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

        {/* Seat rows */}
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
                    return seat ? (
                      <SeatBtn
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.includes(seat.id)}
                        canSelect={selected < maxSelect || selectedIds.includes(seat.id)}
                        onToggle={onToggle}
                      />
                    ) : <div key={col} />;
                  })}
                </div>
                <div />
                <div className="grid grid-cols-2 gap-1">
                  {['C', 'D'].map(col => {
                    const seat = byCol(col);
                    return seat ? (
                      <SeatBtn
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.includes(seat.id)}
                        canSelect={selected < maxSelect || selectedIds.includes(seat.id)}
                        onToggle={onToggle}
                      />
                    ) : <div key={col} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SeatBtn({
  seat, isSelected, canSelect, onToggle,
}: {
  seat: Seat;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: (id: string) => void;
}) {
  const taken = seat.gender !== null;
  const held  = seat.held && !taken;
  const disabled = taken || held || (!canSelect && !isSelected);

  let cls = 'w-full aspect-square rounded-md border text-[8px] font-bold transition-all duration-150 flex items-center justify-center ';

  if (isSelected) {
    cls += 'bg-foreground text-background border-foreground scale-95 shadow-sm';
  } else if (seat.gender === 'male') {
    cls += 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed';
  } else if (seat.gender === 'female') {
    cls += 'bg-pink-100 border-pink-300 text-pink-600 cursor-not-allowed';
  } else if (held) {
    cls += 'bg-yellow-100 border-yellow-400 text-yellow-700 cursor-not-allowed';
  } else if (disabled) {
    cls += 'bg-secondary/50 border-border text-muted-foreground/30 cursor-not-allowed';
  } else {
    cls += 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:scale-105 cursor-pointer active:scale-95';
  }

  return (
    <button
      type="button"
      className={cls}
      disabled={disabled}
      onClick={() => !disabled && onToggle(seat.id)}
      aria-label={`Seat ${seat.id}`}
    >
      {isSelected ? '✓' : seat.gender === 'male' ? 'M' : seat.gender === 'female' ? 'F' : held ? '●' : seat.id}
    </button>
  );
}