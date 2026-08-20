import { describe, expect, it } from 'vitest';
import { IDLE_TIMEOUT_MS, isIdleExpired } from './idle';

const NOW = 1_700_000_000_000;

const stampAgo = (ms: number) => String(NOW - ms);

describe('isIdleExpired', () => {
  it('should keep a session that was active a moment ago', () => {
    expect(isIdleExpired(stampAgo(1_000), NOW)).toBe(false);
  });

  it('should keep a session sitting just inside the window', () => {
    expect(isIdleExpired(stampAgo(IDLE_TIMEOUT_MS - 1), NOW)).toBe(false);
  });

  it('should keep a session at exactly the window, which has not yet exceeded it', () => {
    expect(isIdleExpired(stampAgo(IDLE_TIMEOUT_MS), NOW)).toBe(false);
  });

  it('should expire a session one millisecond past the window', () => {
    expect(isIdleExpired(stampAgo(IDLE_TIMEOUT_MS + 1), NOW)).toBe(true);
  });

  /*
  The cookie is httpOnly, so a browser can drop it but never forge a later
  timestamp. Failing closed means deleting it ends the session instead of
  extending it forever.
  */
  it('should expire when the stamp is missing', () => {
    expect(isIdleExpired(undefined, NOW)).toBe(true);
    expect(isIdleExpired('', NOW)).toBe(true);
  });

  it('should expire when the stamp is not a number', () => {
    expect(isIdleExpired('never', NOW)).toBe(true);
    expect(isIdleExpired('NaN', NOW)).toBe(true);
  });

  it('should keep a stamp from the future rather than expiring on clock skew', () => {
    expect(isIdleExpired(String(NOW + 60_000), NOW)).toBe(false);
  });
});
