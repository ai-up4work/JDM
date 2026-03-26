// app/booking/tickets/page.tsx
'use client';

import { useState } from 'react';
import { MY_TICKETS, MyTicket } from '@/lib/booking/mock/resale';
import { ArrowRight, Tag, Clock, CheckCircle2, Ticket } from 'lucide-react';

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' },
  listed:   { label: 'Listed for resale', className: 'bg-amber-100 text-amber-700' },
  transferred: { label: 'Transferred', className: 'bg-green-100 text-green-700' },
  travelled:   { label: 'Travelled', className: 'bg-secondary text-muted-foreground' },
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<MyTicket[]>(MY_TICKETS);
  const [listingId, setListingId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const handleList = (id: string) => {
    setTickets(prev =>
      prev.map(t => t.id === id ? { ...t, status: 'listed' } : t)
    );
    setListingId(null);
    setConfirmedId(id);
    setTimeout(() => setConfirmedId(null), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 py-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Ticket size={11} /> My tickets
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Your bookings</h1>
        <p className="text-sm text-muted-foreground">List a ticket for resale if your plans change — no cancellation fees.</p>
      </div>

      {/* Ticket list */}
      <div className="flex flex-col gap-3">
        {tickets.map(ticket => {
          const status = STATUS_CONFIG[ticket.status];
          const isListing = listingId === ticket.id;
          const isConfirmed = confirmedId === ticket.id;

          return (
            <div
              key={ticket.id}
              className="border border-border rounded-2xl p-4 transition-all duration-200"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black"
                    style={{ background: ticket.accentColor }}
                  >
                    {ticket.operatorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      {ticket.from}
                      <ArrowRight size={12} className="text-muted-foreground" />
                      {ticket.to}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock size={9} /> {ticket.departure} · {new Date(ticket.date).toDateString().slice(4)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">· Seat {ticket.seat}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${status.className}`}>
                  {status.label}
                </span>
              </div>

              {/* Fare */}
              <div className="flex items-center justify-between border-t border-border pt-2.5 mt-2.5">
                <p className="text-[10px] text-muted-foreground">Fare paid · {ticket.id}</p>
                <p className="text-sm font-bold text-foreground">LKR {ticket.fare}</p>
              </div>

              {/* Resale CTA — only for upcoming tickets */}
              {ticket.status === 'upcoming' && (
                <div className="mt-3">
                  {!isListing ? (
                    <button
                      type="button"
                      onClick={() => setListingId(ticket.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-200"
                    >
                      <Tag size={11} /> List for resale
                    </button>
                  ) : (
                    /* Confirm panel */
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-800 mb-0.5">List this ticket for resale?</p>
                      <p className="text-[10px] text-amber-700 mb-3 leading-relaxed">
                        Your ticket will be listed anonymously. If sold, you'll get a full refund of <strong>LKR {ticket.fare}</strong>. A mediation fee of <strong>LKR 75</strong> is charged to the buyer.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleList(ticket.id)}
                          className="flex-1 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
                        >
                          Yes, list it
                        </button>
                        <button
                          type="button"
                          onClick={() => setListingId(null)}
                          className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Listed state — delist option */}
              {ticket.status === 'listed' && (
                <div className="mt-3 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-amber-700 font-medium">Visible to buyers · refund on sale</p>
                  <button
                    type="button"
                    onClick={() => setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'upcoming' } : t))}
                    className="text-[10px] font-bold text-amber-800 underline underline-offset-2 hover:no-underline"
                  >
                    Delist
                  </button>
                </div>
              )}

              {/* Success flash */}
              {isConfirmed && (
                <div className="mt-3 flex items-center gap-1.5 text-green-700 text-[10px] font-semibold">
                  <CheckCircle2 size={12} /> Listed successfully — we'll notify you when it's sold.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}