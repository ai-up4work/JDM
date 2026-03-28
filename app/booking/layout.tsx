// app/booking/layout.tsx

import { ReactNode } from 'react';
import { BookingProvider } from '@/lib/booking/context';
import StepBar from '@/components/booking/StepBar';
import BookingSummaryBar from '@/components/booking/BookingSummaryBar';
import BookingNav from '@/components/booking/BookingNav';

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-background">

        {/* Sticky top nav */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
            <div className="max-w-4xl mx-auto h-14 flex items-center justify-between gap-4">
              <BookingNav />
              <StepBar />
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
          <div className="max-w-4xl mx-auto pt-4 pb-28 min-w-0">
            {children}
          </div>
        </div>

        {/* Fixed bottom summary bar */}
        <BookingSummaryBar />
      </div>
    </BookingProvider>
  );
}