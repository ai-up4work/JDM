'use client';

import { useParams } from 'next/navigation';
import { Star, Users, Package, CheckCircle, Share2 } from 'lucide-react';
import { getSellerById, getProductsBySeller } from '@/lib/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

export default function SellerStorePage() {
  const params = useParams();
  const sellerId = params.id as string;

  const seller = getSellerById(sellerId);
  const products = getProductsBySeller(sellerId);

  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Seller not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Seller Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Logo */}
          <img
            src={seller.logo}
            alt={seller.name}
            className="w-32 h-32 rounded-lg border-4 border-white object-cover"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{seller.name}</h1>
              {seller.verified && <CheckCircle size={32} className="text-green-400" />}
            </div>

            <p className="text-white/90 mb-4 max-w-2xl">{seller.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-white/80 text-sm mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  <Star size={20} className="fill-white" />
                  <span className="text-2xl font-bold">{seller.rating}</span>
                </div>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Followers</p>
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span className="text-2xl font-bold">
                    {seller.followers.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Products</p>
                <div className="flex items-center gap-2">
                  <Package size={20} />
                  <span className="text-2xl font-bold">{seller.products}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="bg-white text-primary hover:bg-white/90">
                Follow Store
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Products from this Store</h2>
          <p className="text-muted-foreground">
            {products.length} products available
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products available</p>
          </div>
        )}
      </section>

      {/* Store Info */}
      <section className="mt-16 bg-secondary rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-6">About This Store</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2">Store Quality</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Verified by JDM</li>
              <li>✓ {seller.followers.toLocaleString()}+ Happy Customers</li>
              <li>✓ Average Rating: {seller.rating}/5</li>
              <li>✓ {seller.products}+ Products Available</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Shopping Guarantee</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ 100% Authentic Products</li>
              <li>✓ 7 Days Easy Return Policy</li>
              <li>✓ Secure Payment</li>
              <li>✓ Fast & Reliable Shipping</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
