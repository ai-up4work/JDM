import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['laam.pk', 'cdn.shopify.com', 'shopify.com'];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  const allowed = ALLOWED_HOSTS.some(
    h => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
  );
  if (!allowed) return new NextResponse('Forbidden', { status: 403 });

  try {
    const res = await fetch(url, {
      headers: {
        Referer: 'https://laam.pk/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!res.ok) return new NextResponse('Upstream error', { status: 502 });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    return new NextResponse('Fetch failed', { status: 502 });
  }
}