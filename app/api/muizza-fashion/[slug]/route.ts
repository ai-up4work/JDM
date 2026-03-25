// app/api/muizza-fashion/product/route.ts
//
// Returns a single MFProduct by slug.
// Fetched by the [slug] detail page at:
//   /api/muizza-fashion/product?slug=<slug>
//
// The product list is imported from the parent route so there is
// one single source of truth.  If you later switch to a DB, swap
// both the parent route AND this file together.

import { NextRequest, NextResponse } from 'next/server';

// Re-export the shared catalogue from the parent route file.
// Adjust this import path if you move the PRODUCTS array elsewhere.
// Using a direct relative import avoids bundling the full route handler.
import { PRODUCTS } from '../data';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing required query parameter: slug' },
      { status: 400 },
    );
  }

  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return NextResponse.json(
      { error: `No product found with slug "${slug}"` },
      { status: 404 },
    );
  }

  return NextResponse.json(product);
}