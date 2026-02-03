// src/proxy.ts
// Centralized route protection for the application

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/',
]

// Static assets and API routes to skip
const SKIP_ROUTES = [
  '/_next',
  '/api',
  '/favicon.ico',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets and API routes
  if (SKIP_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // For public routes, just update session and continue
  if (isPublicRoute) {
    const { supabaseResponse } = await updateSession(request)
    return supabaseResponse
  }

  // For protected routes, check authentication
  const { user, supabaseResponse } = await updateSession(request)

  if (!user) {
    // Redirect to login if not authenticated
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
