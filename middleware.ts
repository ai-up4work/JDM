import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
 
export function middleware(request: NextRequest) {
  // TODO: add auth checks here once auth is set up
  // Protected routes will be: /seller/* and /admin/*
  // For now, allow everything through
  return NextResponse.next()
}
 
export const config = {
  matcher: [
    "/seller/:path*",
    "/admin/:path*",
  ],
}
