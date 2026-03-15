'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Header() {
  const router = useRouter();
  const { getItemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const cartCount = getItemCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="font-sans sticky top-0 z-50 w-full bg-card border-b border-border">

      {/* ── MOBILE LAYOUT (< lg) ─────────────────────────────────────────
          Row 1: Logo  |  Flag + Currency + Bag
          Row 2: Full-width search bar
      ──────────────────────────────────────────────────────────────── */}
      <div className="lg:hidden">

        {/* Row 1 */}
        <div className="flex items-center justify-between h-14 px-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Image
              src="/brand/logo.png"
              alt="JDM Co"
              width={32}
              height={32}
              className="flex-shrink-0 object-contain"
            />
            <span className="text-foreground text-2xl font-light tracking-widest leading-none select-none">
              JDM Co
            </span>
          </Link>

          {/* Right: flag + currency + bag */}
          <div className="flex items-center gap-4">

            {/* Flag + USD */}
            <button
              type="button"
              className="flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer outline-none"
            >
              {/* Sri Lanka flag emoji — swap for <Image> if you have an asset */}
              <span className="text-lg leading-none">🇱🇰</span>
              <span className="text-sm font-semibold text-foreground leading-none tracking-wide">
                USD
              </span>
              <ChevronDown size={11} strokeWidth={2.5} className="text-muted-foreground" />
            </button>

            {/* Bag */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center no-underline text-foreground"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                />
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-foreground text-background text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center leading-none px-[3px]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Row 2 — search bar */}
        <div className="px-4 pb-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center w-full h-10 bg-muted rounded-lg px-3 gap-2"
          >
            <Search size={15} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for products, brands and categories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none min-w-0 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </form>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (≥ lg) ────────────────────────────────────────
          Single row: Logo | Search | Deliver To / Currency + Bag
      ──────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex items-center w-full h-20">

        {/* Logo — same width as the sidebar (w-60) so they align perfectly */}
        <div className="flex items-center w-60 px-4 flex-shrink-0 h-full">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image
              src="/brand/logo.png"
              alt="JDM Co"
              width={40}
              height={40}
              className="flex-shrink-0 object-contain"
            />
            <span className="text-foreground text-[32px] font-light tracking-[0.08em] leading-none select-none">
              JDM Co
            </span>
          </Link>
        </div>

        {/* Search + right content */}
        <div className="flex items-center flex-1 h-full px-10 gap-8">

          {/* Search bar */}
          <div className="flex-1">
            <div className="flex items-center w-full h-10 bg-muted rounded-md overflow-hidden">
              <button
                type="button"
                className="flex items-center justify-center gap-[5px] h-full px-4 flex-shrink-0 border-r border-border bg-transparent text-base font-normal text-foreground cursor-pointer outline-none hover:bg-secondary transition-colors whitespace-nowrap"
              >
                All
                <ChevronDown size={13} strokeWidth={2} className="text-muted-foreground mt-px" />
              </button>

              <form onSubmit={handleSearch} className="flex items-center flex-1 h-full px-3.5 gap-2.5">
                <Search size={16} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder='Search for "sherwani for groom"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none min-w-0 text-base text-foreground placeholder:text-muted-foreground"
                />
              </form>
            </div>
          </div>

          {/* Deliver To / Currency + Bag */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <div className="flex flex-col items-start gap-[3px]">
              <span className="text-sm font-normal text-muted-foreground leading-none whitespace-nowrap">
                Deliver To / Currency
              </span>
              <button
                type="button"
                className="flex items-center gap-[5px] bg-transparent border-none p-0 cursor-pointer outline-none"
              >
                <span className="text-[13.5px] font-semibold text-foreground leading-none whitespace-nowrap tracking-[0.01em]">
                  LK / USD
                </span>
                <ChevronDown size={12} strokeWidth={2.5} className="text-muted-foreground" />
              </button>
            </div>

            <Link
              href="/cart"
              className="relative flex items-center justify-center no-underline text-foreground"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                />
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-[5px] -right-[6px] bg-foreground text-background text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center leading-none px-[3px]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

    </header>
  );
}