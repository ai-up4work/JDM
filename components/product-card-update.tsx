// ─── Drop-in replacement for the ProductCard component in
//     app/stores/be-dapper/page.tsx
//
// Changes:
//  • Card is now a <Link> that navigates to /stores/be-dapper/[slug]
//  • "Quick view" button replaced by "View details →"
//  • onQuickView prop removed — just pass the slug

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import type { BDProduct } from '@/lib/bedapper.types';

export function ProductCard({ product }: { product: BDProduct }) {
  const [wishlisted, setWishlisted] = useState(false);

  const discount = product.originalPrice && product.onSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col">
      {/* Image — wraps in Link */}
      <Link href={`/stores/be-dapper/${product.slug}`}
        className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-[3/4] mb-3 block">

        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <ShoppingBag size={32} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-foreground text-background">
              −{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist — stop propagation so it doesn't trigger the link */}
        <button
          type="button"
          onClick={e => { e.preventDefault(); setWishlisted(v => !v); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white dark:hover:bg-background z-10"
        >
          <Heart size={14} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'} />
        </button>

        {/* Hover CTA */}
        <div className="absolute bottom-3 left-3 right-3 py-2.5 bg-white/90 dark:bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold rounded-xl
          translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 text-center pointer-events-none">
          View details →
        </div>
      </Link>

      {/* Details — also wrapped in Link */}
      <Link href={`/stores/be-dapper/${product.slug}`} className="flex flex-col flex-1 hover:opacity-80 transition-opacity">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
          {product.categoryLabel}
        </p>
        <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">Rs {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">
                Rs {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star size={10} className="fill-foreground text-foreground" />
              <span className="text-[10px] text-muted-foreground">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}