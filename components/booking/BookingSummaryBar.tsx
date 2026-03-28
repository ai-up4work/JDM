'use client';
// components/booking/BookingSummaryBar.tsx

import { usePathname, useRouter } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';

export default function BookingSummaryBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { operator, bus, seatCount } = useBooking();

  // Hide on step 1 (operator select), confirmed, and request-submitted pages
  const isStep1    = pathname === '/booking';
  const isConfirm  = pathname.includes('/confirm');
  const isConfirmed = pathname === '/booking/confirmed';
  if (isStep1 || isConfirmed || !operator) return null;

  const totalFare = bus ? seatCount * bus.fare : 0;

  const handleCTA = () => {
    if (isConfirm) return;
    if (bus && operator) {
      router.push(`/booking/${operator.id}/${bus.id}/confirm`);
    }
  };

  // On the request page (/booking/op/bus), show "X seat(s)" info — no CTA needed (form has its own submit)
  const isRequestPage = !isConfirm && pathname.split('/').filter(Boolean).length === 3;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
      <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center gap-3">
        {/* Left: operator + route */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{operator.name}</p>
          {bus && (
            <p className="text-[10px] text-muted-foreground truncate">
              {bus.from} → {bus.to} · {bus.departureTime}
            </p>
          )}
        </div>

        {/* Center: seat count */}
        {seatCount > 0 && bus && (
          <div className="shrink-0 text-center">
            <p className="text-[10px] text-muted-foreground">Seats</p>
            <p className="text-xs font-bold text-foreground">{seatCount}</p>
          </div>
        )}

        {/* Right: estimated fare */}
        {totalFare > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-muted-foreground">Est. total</p>
            <p className="text-sm font-bold text-foreground">LKR {totalFare.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}