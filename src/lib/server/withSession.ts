import 'server-only';
import { NextResponse } from 'next/server';
import { expireIfIdle } from '../auth/idleGate';
import { SESSION_EXPIRED_CODE, STRINGS } from '../../constants/strings';

/**
 * The idle-timeout answer for a Route Handler. Unlike a page or a Server
 * Function, a handler cannot redirect the browser — it is answering a `fetch`,
 * not a navigation — so it reports the reason and the client-side callers turn
 * that into a trip to the login screen.
 *
 * A 401 rather than a 440 or 419: those are non-standard, and every existing
 * caller already treats a non-`ok` response as a failure. The `code` is what
 * distinguishes a timeout from an ordinary auth failure.
 */
export function sessionExpiredResponse(): NextResponse {
  return NextResponse.json(
    { success: false, message: STRINGS.SESSION_EXPIRED, code: SESSION_EXPIRED_CODE },
    { status: 401 }
  );
}

/**
 * Wraps a Route Handler so the idle window is checked before it runs — and
 * slid forward when it passes, since reaching a handler means the user did
 * something.
 *
 * Every handler is wrapped rather than each one calling the gate itself: a
 * handler that forgets the call is a silent hole, and `proxy.ts` cannot cover
 * for it because its matcher excludes `/api`.
 *
 * @example
 * ```ts
 * export const GET = withSession(async () => {
 *   // ...
 * });
 * ```
 */
export function withSession<Args extends unknown[], Result extends Response>(
  handler: (...args: Args) => Promise<Result>
): (...args: Args) => Promise<Result | NextResponse> {
  return async (...args: Args) => {
    if (await expireIfIdle()) {
      return sessionExpiredResponse();
    }

    return handler(...args);
  };
}
