import { useSyncExternalStore } from 'react';
import { formatDisplayDate } from '@/src/utils/date';

const noopSubscribe = () => () => {};

const getToday = () => formatDisplayDate(new Date());

/**
 * Today's calendar date in the API's "YYYY-MM-DD" form, read from the
 * browser's clock.
 *
 * Deliberately empty during the server render and the hydration pass that
 * matches it: the server's date is its own timezone's, which is a different
 * day from the viewer's for part of every day and would hydrate as a mismatch.
 * The real date arrives in the commit right after, the same way
 * {@link useGreeting} fills in the time of day.
 */
export function useToday(): string {
  return useSyncExternalStore(noopSubscribe, getToday, () => '');
}
