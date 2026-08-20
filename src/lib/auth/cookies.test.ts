import { describe, expect, it } from 'vitest';
import { SESSION_COOKIE_OPTIONS } from './cookies';

describe('SESSION_COOKIE_OPTIONS', () => {
  /*
  Persistent on purpose, for now: closing and reopening the browser resumes
  the session, and the idle timeout in `idle.ts` is what bounds an unattended
  one. "Closing the browser signs you out" was tried here — dropping `maxAge`
  makes these session cookies — and is parked until we come back to it.
  */
  it('should give the session cookies a lifetime that outlives the browser', () => {
    expect(SESSION_COOKIE_OPTIONS.maxAge).toBe(60 * 60 * 24 * 30);
  });

  it('should keep the cookies unreadable to scripts and scoped to the whole app', () => {
    expect(SESSION_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(SESSION_COOKIE_OPTIONS.path).toBe('/');
  });

  /*
  `strict` would drop the cookie on any cross-site entry into the app — an
  emailed link to an employee record among them — logging the user out for
  what looks to them like no reason.
  */
  it('should send cookies on top-level navigations into the app', () => {
    expect(SESSION_COOKIE_OPTIONS.sameSite).toBe('lax');
  });
});
