/**
 * @module app/error
 */

'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/src/components/ErrorScreen';
import { logger } from '@/src/lib/logger';

/**
 * The application's error boundary.
 *
 * Sitting at the root of `app`, it catches anything thrown while rendering a page or a
 * nested layout — including the app shell — so a failure anywhere below shows this screen
 * rather than a blank page. A segment that wants to keep its own chrome up can still add an
 * `error.tsx` of its own, which takes the error before this one sees it.
 *
 * It does not cover the root layout itself; `global-error.tsx` does.
 *
 * @param error - The error thrown in the route. In production this carries no message, only
 * the `digest` that matches it to the server log.
 * @param unstable_retry - Re-fetches and re-renders the boundary's children.
 * @returns The fallback error UI.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    /*
    The digest is the only handle on a production error from here — it is what ties this
    screen to the stack trace the server logged when it threw.
    */
    logger.error('Route render failed', error, { digest: error.digest });
  }, [error]);

  return <ErrorScreen onRetry={unstable_retry} />;
}
