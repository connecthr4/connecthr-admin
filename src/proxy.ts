import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_CARRIER_COOKIE, SESSION_COOKIE_OPTIONS } from './lib/auth/cookies';
import { isIdleExpired, LAST_ACTIVITY_COOKIE } from './lib/auth/idle';
import { revokeBackendSession } from './lib/auth/revoke';
import { ROUTES, SESSION_EXPIRED_QUERY } from './constants/strings';

const PUBLIC_ROUTES: string[] = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.RESET_PASSWORD];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Ends an idle session on the way past. Route Handlers and Server Functions
 * run the same check through `expireIfIdle`, but this matcher excludes `/api`
 * and a Server Component render cannot write cookies — so navigations need
 * their own copy, and this is the only one of the three that can both clear
 * the cookies and redirect the browser in a single response.
 *
 * The backend revoke has to happen here rather than being deferred: once the
 * cookies below are gone, nothing is left that could present this token to
 * log it out. It costs one round trip on the single request that trips the
 * timeout, not on every navigation.
 */
async function endIdleSession(request: NextRequest, accessToken: string): Promise<NextResponse> {
  await revokeBackendSession(accessToken);

  const loginUrl = new URL(ROUTES.LOGIN, request.url);

  loginUrl.searchParams.set(SESSION_EXPIRED_QUERY.KEY, SESSION_EXPIRED_QUERY.VALUE);

  const response = NextResponse.redirect(loginUrl);

  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_CARRIER_COOKIE);
  response.cookies.delete(LAST_ACTIVITY_COOKIE);

  return response;
}

/**
 * Optimistic, cookie-presence-only auth gate. This runs on every request
 * (including prefetches), so it must stay cheap — no token verification or
 * backend calls here. Real authorization still happens server-side via
 * ServerAuthAdapter/getSession() for each request; this only stops
 * unauthenticated users from reaching protected pages by URL.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAuthenticated = Boolean(accessToken);

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

  if (!accessToken) {
    return NextResponse.next();
  }

  /*
  Ahead of the bounce below, so an idle user who navigates to /login lands on
  the login screen rather than being sent to the dashboard only to be expired
  there. The marker check keeps a failed cookie deletion from looping.
  */
  if (!isExpiredSessionRedirect && isIdleExpired(request.cookies.get(LAST_ACTIVITY_COOKIE)?.value)) {
    return endIdleSession(request, accessToken);
  }

  if (!isExpiredSessionRedirect && (pathname === ROUTES.LOGIN || pathname === ROUTES.HOME)) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  /*
  Reaching a page means the user is still around, so the window slides
  forward. This also bumps on router prefetches, which cannot be told apart
  here — Next strips `next-router-prefetch` and the other Flight headers from
  `request.headers` inside proxy, and excluding them at the matcher instead
  would let anyone bypass the auth gate above by sending that header by hand.
  In practice prefetches are driven by hover and viewport intersection, so a
  genuinely idle tab stops issuing them and the window still closes.
  */
  const response = NextResponse.next();

  response.cookies.set(LAST_ACTIVITY_COOKIE, String(Date.now()), SESSION_COOKIE_OPTIONS);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
