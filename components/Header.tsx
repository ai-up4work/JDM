'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactCountryFlag from 'react-country-flag';

// ── Currency / country data ──────────────────────────────────────────────────

const currencies = [
  { code: 'LKR', country: 'Sri Lanka',      countryCode: 'LK' },
  { code: 'USD', country: 'United States',  countryCode: 'US' },
  { code: 'GBP', country: 'United Kingdom', countryCode: 'GB' },
  { code: 'EUR', country: 'Europe',         countryCode: 'EU' },
  { code: 'PKR', country: 'Pakistan',       countryCode: 'PK' },
  { code: 'AED', country: 'UAE',            countryCode: 'AE' },
  { code: 'SAR', country: 'Saudi Arabia',   countryCode: 'SA' },
  { code: 'CAD', country: 'Canada',         countryCode: 'CA' },
  { code: 'AUD', country: 'Australia',      countryCode: 'AU' },
  { code: 'INR', country: 'India',          countryCode: 'IN' },
  { code: 'BDT', country: 'Bangladesh',     countryCode: 'BD' },
  { code: 'QAR', country: 'Qatar',          countryCode: 'QA' },
  { code: 'KWD', country: 'Kuwait',         countryCode: 'KW' },
  { code: 'OMR', country: 'Oman',           countryCode: 'OM' },
  { code: 'BHD', country: 'Bahrain',        countryCode: 'BH' },
  { code: 'MYR', country: 'Malaysia',       countryCode: 'MY' },
  { code: 'SGD', country: 'Singapore',      countryCode: 'SG' },
];

type Currency = typeof currencies[0];

// ── Currency picker modal ────────────────────────────────────────────────────

function CurrencyPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: Currency;
  onSelect: (c: Currency) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="text-base font-semibold text-foreground">Select Currency</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 h-9">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search country or currency…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-72">
          {filtered.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onSelect(c); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors ${
                selected.code === c.code ? 'bg-secondary' : ''
              }`}
            >
              <ReactCountryFlag
                countryCode={c.countryCode}
                svg
                style={{ width: '1.6em', height: '1.6em', borderRadius: '3px' }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{c.country}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground shrink-0">{c.code}</span>
              {selected.code === c.code && (
                <span className="w-2 h-2 rounded-full bg-foreground shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const router = useRouter();
  const { getItemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
  const cartCount = getItemCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const CurrencyButton = () => (
    <button
      type="button"
      onClick={() => setPickerOpen(true)}
      className="flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer outline-none"
    >
      <ReactCountryFlag
        countryCode={selectedCurrency.countryCode}
        svg
        style={{ width: '1.4em', height: '1.4em', borderRadius: '3px' }}
      />
      <span className="text-sm font-semibold text-foreground leading-none tracking-wide">
        {selectedCurrency.code}
      </span>
      <ChevronDown size={11} strokeWidth={2.5} className="text-muted-foreground" />
    </button>
  );

  const BagIcon = ({ size = 24, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      />
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <>
      <header className="font-sans sticky top-0 z-50 w-full bg-card border-b border-border">

        {/* ── MOBILE LAYOUT (< lg) ── */}
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

            {/* Right: currency + bag */}
            <div className="flex items-center gap-4">
              <CurrencyButton />
              <Link
                href="/cart"
                className="relative flex items-center justify-center no-underline text-foreground"
              >
                <BagIcon size={24} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-foreground text-background text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center leading-none px-[3px]">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Row 2 — search */}
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

        {/* ── DESKTOP LAYOUT (≥ lg) ── */}
        <div className="hidden lg:flex items-center w-full h-20">

          {/* Logo */}
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

          {/* Search + right */}
          <div className="flex items-center flex-1 h-full px-10 gap-8 mx-30">

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
                <CurrencyButton />
              </div>

              <Link
                href="/cart"
                className="relative flex items-center justify-center no-underline text-foreground"
              >
                <BagIcon size={26} strokeWidth={1.4} />
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

      {/* Currency picker — outside header to overlay everything */}
      {pickerOpen && (
        <CurrencyPicker
          selected={selectedCurrency}
          onSelect={setSelectedCurrency}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}