import { useSyncExternalStore } from 'react';
import { getGreeting } from '@/src/utils/date';

const noopSubscribe = () => () => {};

/**
 * Returns the time-of-day greeting, read only on the client. `getGreeting()`
 * depends on the current hour, which can differ between the server render
 * and the client hydration pass (different clock/timezone) and cause a
 * hydration mismatch — `useSyncExternalStore`'s `getServerSnapshot` keeps the
 * SSR and initial client markup identical (both render `undefined`), then
 * fills in the real greeting on the client.
 */
export function useGreeting(): string | undefined {
  return useSyncExternalStore(noopSubscribe, getGreeting, () => undefined);
}
