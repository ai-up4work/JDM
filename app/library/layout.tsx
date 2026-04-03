'use client';
// app/library/layout.tsx  →  Root layout for the science library section

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LibraryProvider } from '@/lib/library/context';

const NAV = [
  { href: '/library',          label: 'Catalog'  },
  { href: '/library/borrow',   label: 'Borrow'   },
  { href: '/library/returns',  label: 'Returns'  },
  { href: '/library/admin',    label: 'Admin'    },
];

function LibraryNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-14">
        {/* Wordmark */}
        <Link href="/library" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-background">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">SciLib</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 ml-2">
          {NAV.map(({ href, label }) => {
            const active =
              href === '/library'
                ? pathname === '/library'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <LibraryProvider>
      <div className="min-h-screen bg-background">
        {/* <LibraryNav /> */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </LibraryProvider>
  );
}