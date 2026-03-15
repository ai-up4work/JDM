'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, Package, CheckCircle } from 'lucide-react';
import { sellers } from '@/lib/mockData';

export default function SellersPage() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden px-4 sm:px-10 lg:px-40">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 min-w-0">

        {/* ── Header ── */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-2">Our Sellers</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover premium fashion brands and sellers on JDM
          </p>
        </div>

        {/* ── Sellers Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-16">
          {sellers.map((seller) => (
            <Link key={seller.id} href={`/seller/${seller.id}`} className="group flex flex-col rounded-2xl border border-border bg-background overflow-hidden hover:shadow-lg transition-shadow">

              {/* Banner */}
              <div className="relative h-28 sm:h-32 bg-gradient-to-br from-primary/90 to-primary shrink-0">
                <div className="absolute -bottom-8 left-5">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-background bg-muted">
                    <Image
                      src={seller.logo}
                      alt={seller.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="pt-10 sm:pt-12 px-5 pb-5 flex flex-col flex-1">

                {/* Name + verified */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                    {seller.name}
                  </h3>
                  {seller.verified && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200 shrink-0 mt-0.5">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">
                  {seller.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 sm:gap-4 py-3.5 border-y border-border mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground">{seller.rating}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{seller.followers.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Package size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{seller.products} items</span>
                  </div>
                </div>

                {/* CTA */}
                <button type="button"
                  className="w-full py-2.5 rounded-xl bg-foreground text-background text-xs sm:text-sm font-semibold hover:bg-foreground/90 transition-colors mt-auto"
                >
                  Visit Store
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Why Shop section ── */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-5 sm:mb-8">Why Shop from Our Sellers?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { emoji: '🎯', title: 'Verified Sellers',  desc: 'All sellers are verified and reviewed by our team to ensure quality and authenticity.' },
              { emoji: '⭐', title: 'High Quality',      desc: 'Top-rated sellers with consistent positive reviews and premium product standards.'    },
              { emoji: '🛡️', title: 'Buyer Protection', desc: '7-day return policy and money-back guarantee on all purchases, no questions asked.'   },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
                <span className="text-3xl sm:text-4xl mb-3 block">{emoji}</span>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}