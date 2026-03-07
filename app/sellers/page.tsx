'use client';

import Link from 'next/link';
import { Star, Users, Package, CheckCircle } from 'lucide-react';
import { sellers } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

export default function SellersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Sellers</h1>
        <p className="text-lg text-muted-foreground">
          Discover premium fashion brands and sellers on LAAM
        </p>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <Link key={seller.id} href={`/seller/${seller.id}`}>
            <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
              {/* Header background */}
              <div className="h-32 bg-gradient-to-r from-primary to-secondary" />

              {/* Content */}
              <div className="px-6 pb-6 -mt-12 relative">
                {/* Logo */}
                <div className="mb-4">
                  <img
                    src={seller.logo}
                    alt={seller.name}
                    className="w-24 h-24 rounded-lg border-4 border-white object-cover"
                  />
                </div>

                {/* Seller Info */}
                <h3 className="text-xl font-bold mb-2">{seller.name}</h3>

                {/* Verified badge */}
                {seller.verified && (
                  <div className="flex items-center gap-1 mb-3 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    Verified Seller
                  </div>
                )}

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {seller.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-accent" />
                      <span className="text-sm">{seller.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      <span className="text-sm">{seller.followers.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-secondary" />
                      <span className="text-sm">{seller.products} products</span>
                    </div>
                  </div>
                </div>

                {/* Visit Button */}
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Visit Store
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Why Choose section */}
      <section className="mt-16 bg-secondary rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Why Shop from Our Sellers?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
            <p className="text-muted-foreground">
              All sellers are verified and reviewed by our team to ensure quality
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">High Quality</h3>
            <p className="text-muted-foreground">
              Top-rated sellers with consistent positive reviews
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Buyer Protection</h3>
            <p className="text-muted-foreground">
              7-day return policy and money-back guarantee on all purchases
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
