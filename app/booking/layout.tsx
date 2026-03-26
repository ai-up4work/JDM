// app/booking/layout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookingProvider } from '@/lib/booking/context';
import { useBooking } from '@/lib/booking/context';
import StepBar from '@/components/booking/StepBar';
import BookingSummaryBar from '@/components/booking/BookingSummaryBar';

function BookingNav() {
  const pathname = usePathname();
  const { operator, bus } = useBooking();

  // Build breadcrumb segments dynamically
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Bus Booking', href: '/booking' },
  ];

  if (operator && pathname.includes(`/booking/${operator.id}`)) {
    crumbs.push({ label: operator.name, href: `/booking/${operator.id}` });
  }

  if (bus && pathname.includes(`/booking/${operator?.id}/${bus.id}`)) {
    crumbs.push({ label: `${bus.from} → ${bus.to}` });
  }

  if (pathname === '/booking/tickets') {
    crumbs.splice(2, 0, { label: 'My Tickets' });
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            {!isLast && crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground transition-colors font-medium">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-background">

        {/* Sticky top nav */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
            <div className="max-w-4xl mx-auto h-14 flex items-center justify-between gap-4 -mx-0 sm:-mx-4 lg:-mx-10">
              <BookingNav />
              <StepBar />
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
          <div className="max-w-4xl mx-auto pt-4 pb-28 min-w-0 -mx-0 sm:-mx-4 lg:-mx-10">
            {children}
          </div>
        </div>

        {/* Fixed bottom summary bar */}
        <BookingSummaryBar />
      </div>
    </BookingProvider>
  );
}