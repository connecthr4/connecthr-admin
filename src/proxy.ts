import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from './lib/auth/cookies';
import { ROUTES } from './constants/strings';

const PUBLIC_ROUTES: string[] = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.RESET_PASSWORD];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Optimistic, cookie-presence-only auth gate. This runs on every request
 * (including prefetches), so it must stay cheap — no token verification or
 * backend calls here. Real authorization still happens server-side via
 * ServerAuthAdapter/getSession() for each request; this only stops
 * unauthenticated users from reaching protected pages by URL.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has(ACCESS_TOKEN_COOKIE);

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && (pathname === ROUTES.LOGIN || pathname === ROUTES.HOME)) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
