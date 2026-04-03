// app/library/layout.tsx
import { ReactNode } from 'react';
import { LibraryProvider } from '@/lib/library/context';

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <LibraryProvider>
      <div className="min-h-screen bg-background">
        {/* Optional Header for Library section */}
        

        {/* Page content */}
        <div className="w-full px-4 sm:px-10 lg:px-40">
          <div className="max-w-4xl mx-auto pt-4 pb-20">
            {children}
          </div>
        </div>
      </div>
    </LibraryProvider>
  );
}