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
        <div className="w-full flex justify-center px-4 -mb-4 sm:px-10 lg:px-40 mt-4"> 
          <div className="w-full max-w-4xl h-14 flex items-center justify-center gap-4">
            <StepBar />
          </div>
        </div>

        {/* Page content */}
        <div className="w-full min-w-0 px-4 sm:px-10 lg:px-40">
          <div className="max-w-4xl mx-auto pt-4 pb-28 min-w-0">
            {children}
          </div>
        </div>

        {/* Fixed bottom summary bar */}
        {/* <BookingSummaryBar /> */}
      </div>
    </BookingProvider>
  );
}