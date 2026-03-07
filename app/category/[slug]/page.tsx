'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { categories, getProductsByCategory } from '@/lib/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const category = categories.find((c) => c.slug === slug);
  const allProducts = getProductsByCategory(slug);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by price
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

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
      case 'newest':
        break;
      default: // popular
        products.sort((a, b) => b.reviews - a.reviews);
    }

    return products;
  }, [allProducts, sortBy, priceRange]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">
          Showing {filteredProducts.length} products
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 pb-8 border-b border-border">
        {/* Price Range Filter */}
        <div className="flex-1">
          <label className="text-sm font-semibold mb-2 block">Price Range</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Math.max(0, parseInt(e.target.value) || 0), priceRange[1]])
                }
                className="w-full px-3 py-2 border border-border rounded text-sm"
              />
              <span className="px-2 py-2">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Math.max(priceRange[0], parseInt(e.target.value) || 10000)])
                }
                className="w-full px-3 py-2 border border-border rounded text-sm"
              />
            </div>
            <div className="flex gap-2">
              {[
                { label: 'Under Rs. 2000', min: 0, max: 2000 },
                { label: 'Rs. 2000 - 5000', min: 2000, max: 5000 },
                { label: 'Above Rs. 5000', min: 5000, max: 100000 },
              ].map((range) => (
                <Button
                  key={range.label}
                  variant={
                    priceRange[0] === range.min && priceRange[1] === range.max
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => setPriceRange([range.min, range.max])}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex-1">
          <label className="text-sm font-semibold mb-2 block">Sort By</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No products found in this price range.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSortBy('popular');
              setPriceRange([0, 10000]);
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
