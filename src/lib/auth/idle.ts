/**
 * Idle-session policy. Kept dependency-free (no `server-only`, no
 * `next/headers`) for the same reason as `cookies.ts`: `proxy.ts` needs the
 * cookie name and the expiry rule but cannot import the server-only session
 * helpers.
 */
export const LAST_ACTIVITY_COOKIE = 'chr_last_activity';

/**
 * Tuned per environment via `IDLE_TIMEOUT_MINUTES` (see `.env.example`); a
 * short value such as `1` makes the sign-out path testable by hand.
 *
 * The literal below is a fallback, not the source of truth. It has to stay in
 * code because no `.env` file is committed — a fresh clone, CI run, or a deploy
 * whose variable was never set would otherwise have no policy at all, and a
 * session that never expires is the worst of the available failure modes. Same
 * reasoning covers a garbled value (`""`, `abc`, `0`, `-5`): fall back rather
 * than throw, since `proxy.ts` runs this on every request and a throw there
 * takes down the whole app instead of one page.
 *
 * Read at module load, so changing it needs a dev-server restart — `proxy.ts`
 * has the value inlined at build time.
 */
const FALLBACK_IDLE_TIMEOUT_MINUTES = 30;

const configuredMinutes = Number(process.env.IDLE_TIMEOUT_MINUTES);

export const IDLE_TIMEOUT_MS =
  (Number.isFinite(configuredMinutes) && configuredMinutes > 0 ? configuredMinutes : FALLBACK_IDLE_TIMEOUT_MINUTES) *
  60_000;

/**
 * Fails closed: a missing or unparseable stamp counts as expired.
 *
 * The cookie is httpOnly, so a browser can only ever drop it, never forge a
 * later timestamp — treating "absent" as "still fresh" would turn deleting one
 * cookie into an unlimited session. The cost is that sessions already open
 * when this ships have no stamp yet and are signed out once.
 *
 * @param rawLastActivity - Raw cookie value: epoch milliseconds as a string.
 * @param now - Injectable for tests.
 */
export function isIdleExpired(rawLastActivity: string | undefined, now: number = Date.now()): boolean {
  if (!rawLastActivity) {
    return true;
  }

  const lastActivity = Number(rawLastActivity);

  if (!Number.isFinite(lastActivity)) {
    return true;
  }

  return now - lastActivity > IDLE_TIMEOUT_MS;
}
