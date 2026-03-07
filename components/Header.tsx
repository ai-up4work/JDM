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
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="font-sans sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="flex items-center w-full h-20">

        {/* ══ SECTION 1: LOGO ══ */}
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

        {/* ══ SECTION 2: Search + Right content — independent, 40px mx ══ */}
        <div className="flex items-center flex-1 h-full px-40 gap-10">

          {/* Search bar */}
          <div className="flex-1">
            <div className="flex items-center w-full h-10 bg-muted rounded-md overflow-hidden">

              {/* "All ∨" */}
              <button
                type="button"
                className="flex items-center justify-center gap-[5px] h-full px-4 flex-shrink-0 border-r border-border bg-transparent text-[16px] font-normal text-foreground cursor-pointer outline-none hover:bg-secondary transition-colors whitespace-nowrap"
              >
                All
                <ChevronDown size={13} strokeWidth={2} className="text-muted-foreground mt-px" />
              </button>

              {/* Search input */}
              <form onSubmit={handleSearch} className="flex items-center flex-1 h-full px-[14px] gap-[10px]">
                <Search size={16} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder='Search for "sherwani for groom"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none min-w-0 leading-none text-[16px] font-normal text-foreground placeholder:text-muted-foreground"
                />
              </form>
            </div>
          </div>

          {/* Right content: Deliver To / Currency + Bag */}
          <div className="flex items-center gap-5 flex-shrink-0 pl-10 mr-4">

            {/* Stacked label + flag+currency */}
            <div className="flex flex-col items-start gap-[3px]">
              <span className="text-[16px] font-normal text-muted-foreground leading-none whitespace-nowrap">
                Deliver To / Currency
              </span>
              <button
                type="button"
                className="flex items-center gap-[5px] bg-transparent border-none p-0 cursor-pointer outline-none"
              >
                {/* <span className="text-[15px] leading-none inline-flex items-center">🇱🇰</span> */}
                <span className="text-[13.5px] font-semibold text-foreground leading-none whitespace-nowrap tracking-[0.01em]">
                  LK / USD
                </span>
                <ChevronDown size={12} strokeWidth={2.5} className="text-muted-foreground" />
              </button>
            </div>

            {/* Shopping bag */}
            <Link href="/cart" className="relative flex items-center justify-center no-underline flex-shrink-0 text-foreground">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="3" y1="6" x2="21" y2="6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M16 10a4 4 0 01-8 0"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -top-[5px] -right-[6px] bg-foreground text-background text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center leading-none px-[3px]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
        {/* ══ END SECTION 2 ══ */}

      </div>
    </header>
  );
}