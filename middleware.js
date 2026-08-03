// ============================================================
// middleware.js — Next.js Edge Middleware for auth routing
// ============================================================

import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/pricing'];

// Routes that need authentication
const protectedPrefixes = ['/dashboard', '/admin'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies or localStorage-based storage
  // Zustand persist stores in localStorage, so we check the cookie fallback
  const authCookie = request.cookies.get('pathlims-auth');

  let isAuthenticated = false;

  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie.value);
      isAuthenticated = !!parsed?.state?.accessToken;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is on a public route and is authenticated, redirect to dashboard
  if (publicRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow all other routes (client-side auth check handles protected routes)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
