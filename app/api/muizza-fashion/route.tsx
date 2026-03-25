// app/api/muizza-fashion/route.ts
//
// Product catalogue list endpoint.
// The PRODUCTS array lives in ./data.ts — shared with the /product slug endpoint.

import { NextRequest, NextResponse } from 'next/server';
import type { MFApiResponse } from '@/lib/muizza.types';
import { PRODUCTS } from './data';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.get('category') ?? '';
  const search   = (searchParams.get('search') ?? '').toLowerCase();
  const page     = Math.max(1, Number(searchParams.get('page') ?? 1));
  const perPage  = Math.min(48, Number(searchParams.get('per_page') ?? 24));

  let products = [...PRODUCTS];

  if (category) {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(search)          ||
      p.categoryLabel.toLowerCase().includes(search) ||
      p.fabric?.toLowerCase().includes(search)       ||
      p.occasion?.toLowerCase().includes(search)
    );
  }

  const total      = products.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const paginated  = products.slice((page - 1) * perPage, page * perPage);

  const response: MFApiResponse = { products: paginated, total, totalPages };
  return NextResponse.json(response);
}