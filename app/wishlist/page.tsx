'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">
          Add items to your wishlist to save them for later
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          You have {items.length} item{items.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
