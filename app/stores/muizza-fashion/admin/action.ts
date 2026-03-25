'use server';

import { cookies } from 'next/headers';

const SESSION_COOKIE = 'mf_admin_session';
const SESSION_VALUE  = 'authenticated';
// Cookie lives for 8 hours
const MAX_AGE        = 60 * 60 * 8;

export async function checkAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.MF_ADMIN_PASSWORD || 'MFadmin123';

  if (!adminPassword) {
    console.error('[MuizzaAdmin] MF_ADMIN_PASSWORD env var is not set.');
    return false;
  }

  const ok = password === adminPassword;

  if (ok) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/stores/muizza-fashion/admin',
    });
  }

  return ok;
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}