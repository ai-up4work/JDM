'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';

/**
 * StoreBagButton
 * A shared cart icon button used across all store pages.
 * Reads item count from the global Zustand cart store and links to /cart.
 */
export function StoreBagButton() {
  const { getItemCount } = useCartStore();
  const cartQty = getItemCount();

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors shrink-0"
    >
      <ShoppingBag size={13} />
      <span className="text-xs font-semibold text-foreground">Bag</span>
      {cartQty > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center leading-none">
          {cartQty}
        </span>
      )}
    </Link>
  );
}