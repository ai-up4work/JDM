'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/lib/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState('popular');

  const results = useMemo(() => {
    let products = searchProducts(query);

    // Sort
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        products.sort((a, b) => b.reviews - a.reviews);
    }

    return products;
  }, [query, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? (
            <>
              Showing {results.length} results for{' '}
              <span className="font-semibold text-foreground">"{query}"</span>
            </>
          ) : (
            'Enter a search query to find products'
          )}
        </p>
      </div>

      {/* Sort */}
      {results.length > 0 && (
        <div className="mb-6">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            No products found matching "{query}"
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Try searching with different keywords or browse our categories
          </p>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No search query provided. Use the search bar to find products.
          </p>
        </div>
      )}
    </div>
  );
}
