'use client';

import { useParams } from 'next/navigation';
import { Star, Users, Package, CheckCircle, Share2, ChevronRight } from 'lucide-react';
import { getSellerById, getProductsBySeller } from '@/lib/mockData';
import Link from 'next/link';
import Image from 'next/image';

export default function SellerStorePage() {
  const params  = useParams();
  const sellerId = params.id as string;

  const seller   = getSellerById(sellerId);
  const products = getProductsBySeller(sellerId);

  if (!seller) {
    return (
      <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
        <div className="max-w-7xl mx-auto py-20 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">Seller not found</h1>
          <p className="text-muted-foreground text-sm">The store you're looking for doesn't exist.</p>
          <Link href="/" className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Back to home <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 min-w-0">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-6 sm:mb-10 bg-gradient-to-br from-primary/90 to-primary p-5 sm:p-8">
          {/* Decorative circle */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">

            {/* Logo */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-2 border-white/30 shrink-0 bg-white/10">
              <img
                src={seller.logo}
                alt={seller.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name + verified */}
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">{seller.name}</h1>
                {seller.verified && (
                  <span className="flex items-center gap-1 bg-green-400/20 text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-400/30">
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
              </div>

              <p className="text-white/80 text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-none max-w-xl">
                {seller.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 sm:gap-8 mb-4 sm:mb-5">
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-white text-white" />
                    <span className="text-base sm:text-xl font-bold text-white">{seller.rating}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Followers</p>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-white/80" />
                    <span className="text-base sm:text-xl font-bold text-white">{seller.followers.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Products</p>
                  <div className="flex items-center gap-1">
                    <Package size={14} className="text-white/80" />
                    <span className="text-base sm:text-xl font-bold text-white">{seller.products}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button type="button"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-primary text-xs sm:text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  Follow Store
                </button>
                <button type="button"
                  className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/40 text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Products section ── */}
        <section className="mb-10 sm:mb-16">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Products</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{products.length} available</p>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col gap-2 min-w-0">
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={(product as any).image || `/garments/product${(Number(product.id) % 16) + 1}.jpeg`}
                      alt={product.name} fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    {(product as any).discount && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          -{(product as any).discount}%
                        </span>
                      </div>
                    )}
                    <button type="button" onClick={e => e.preventDefault()}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-1 sm:gap-2 px-0.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-foreground">$ {product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through hidden sm:inline">$ {product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{product.brand} • {product.name}</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-1.5 flex-wrap">
                        {(product as any).express ? (
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200">⚡ Express</span>
                        ) : (
                          <span className="flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-gray-200">➜ 7 Days</span>
                        )}
                        <span className="text-xs text-muted-foreground hidden sm:inline">★ {product.rating} ({product.reviews})</span>
                      </div>
                    </div>
                    <button type="button" onClick={e => e.preventDefault()}
                      className="shrink-0 p-1.5 sm:p-2 rounded-xl border border-border hover:bg-secondary transition-colors mt-0.5 hidden xs:flex"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm">No products available from this store yet.</p>
            </div>
          )}
        </section>

        {/* ── About section ── */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-5 sm:mb-8">About This Store</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            <div className="rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Store Quality</h3>
              <ul className="space-y-2.5">
                {[
                  'Verified by JDM',
                  `${seller.followers.toLocaleString()}+ Happy Customers`,
                  `Average Rating: ${seller.rating}/5`,
                  `${seller.products}+ Products Available`,
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Shopping Guarantee</h3>
              <ul className="space-y-2.5">
                {[
                  '100% Authentic Products',
                  '7 Days Easy Return Policy',
                  'Secure Payment',
                  'Fast & Reliable Shipping',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}