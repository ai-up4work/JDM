'use client';
// components/booking/BookingNav.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';

export default function BookingNav() {
  const pathname = usePathname();
  const { operator, bus } = useBooking();

  const crumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Bus Booking', href: '/booking' },
  ];

  if (operator && pathname.includes(`/booking/${operator.id}`)) {
    crumbs.push({ label: operator.name, href: `/booking/${operator.id}` });
  }

  if (bus && operator && pathname.includes(`/booking/${operator.id}/${bus.id}`)) {
    crumbs.push({ label: `${bus.from} → ${bus.to}` });
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 flex-wrap min-w-0">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <svg
                width="10" height="10" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0 text-border"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            {!isLast && crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-foreground transition-colors font-medium truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}