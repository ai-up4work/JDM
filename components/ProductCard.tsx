'use client';

import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/mockData';
import { useWishlistStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link href={`/shop/${product.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-secondary h-64">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-3 right-3 bg-accent px-2 py-1 rounded text-sm font-semibold text-accent-foreground">
              -{product.discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 left-3 bg-white rounded-full p-2 shadow hover:shadow-md transition-all"
          >
            <Heart
              size={18}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}
            />
          </button>

          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingCart size={16} className="mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1 truncate">{product.seller}</p>
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 text-sm">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-primary">Rs. {product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                Rs. {product.originalPrice}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(product.rating)
                      ? 'fill-accent text-accent'
                      : 'text-muted'
                  }
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
