import { LOGIN_SESSION_EXPIRED_URL, SESSION_EXPIRED_CODE } from '@/src/constants/strings';

/**
 * Browser-side half of the idle timeout: a Route Handler answering a `fetch`
 * cannot redirect the tab, so it reports the timeout as a 401 carrying
 * `SESSION_EXPIRED` and this sends the user to the login screen.
 *
 * A full document load rather than `router.push`, for two reasons: the Zustand
 * auth store is client state that a soft navigation would leave holding the
 * signed-out user, and the request must be re-evaluated by `proxy.ts` against
 * the cookies the handler just cleared. `replace` keeps the page the user was
 * bounced off out of the history stack, so Back does not return to it.
 *
 * Callers still throw afterwards — navigation is not instantaneous, and
 * whatever they were doing should not carry on with a failed response.
 *
 * @param response - The failed response from a Route Handler.
 * @param payload - Its parsed JSON body, if it had one.
 * @returns `true` when the failure was an idle timeout and a redirect is under way.
 */
export function handleSessionExpiry(response: Response, payload: unknown): boolean {
  const isExpired =
    response.status === 401 && (payload as { code?: string } | undefined)?.code === SESSION_EXPIRED_CODE;

  if (!isExpired) {
    return false;
  }

  if (typeof window !== 'undefined') {
    window.location.replace(LOGIN_SESSION_EXPIRED_URL);
  }

  return true;
}
