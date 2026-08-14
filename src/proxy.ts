import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from './lib/auth/cookies';
import { ROUTES, SESSION_EXPIRED_QUERY } from './constants/strings';

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

  /*
  A server render that found the session unusable says so explicitly, because
  it often cannot clear the cookie this gate reads — cookies are only writable
  from a Server Action or Route Handler. Bouncing that request back to the
  dashboard would send it straight to the render that just rejected it.
  */
  const isExpiredSessionRedirect =
    request.nextUrl.searchParams.get(SESSION_EXPIRED_QUERY.KEY) === SESSION_EXPIRED_QUERY.VALUE;

  if (isAuthenticated && !isExpiredSessionRedirect && (pathname === ROUTES.LOGIN || pathname === ROUTES.HOME)) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
