'use client';
// components/booking/BookingSummaryBar.tsx

import { usePathname, useRouter } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';

export default function BookingSummaryBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { operator, bus, selectedSeats } = useBooking();

  // Hide on step 1 (operator select) and confirmed page
  const isStep1 = pathname === '/booking';
  const isConfirmed = pathname === '/booking/confirmed';
  if (isStep1 || isConfirmed || !operator) return null;

  const isConfirmPage = pathname.includes('/confirm');
  const totalFare = bus ? selectedSeats.length * bus.fare : 0;

  const handleCTA = () => {
    if (isConfirmPage) return; // handled by the form submit button
    if (selectedSeats.length > 0 && bus && operator) {
      router.push(`/booking/${operator.id}/${bus.id}/confirm`);
    }
  };

  const showCTA = selectedSeats.length > 0 && !isConfirmPage;

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
        {selectedSeats.length > 0 && (
          <div className="shrink-0 text-center">
            <p className="text-[10px] text-muted-foreground">Seats</p>
            <p className="text-xs font-bold text-foreground">{selectedSeats.length}</p>
          </div>
        )}

        {/* Right: fare + CTA */}
        <div className="shrink-0 flex items-center gap-3">
          {totalFare > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-sm font-bold text-foreground">LKR {totalFare.toLocaleString()}</p>
            </div>
          )}
          {showCTA && (
            <button
              onClick={handleCTA}
              className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-colors active:scale-[0.98] whitespace-nowrap"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}