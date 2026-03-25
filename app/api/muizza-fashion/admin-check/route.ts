import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/app/stores/muizza-fashion/admin/action';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}