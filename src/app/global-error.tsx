/**
 * @module app/global-error
 */

'use client';

import { useEffect } from 'react';
import { Lexend } from 'next/font/google';
import ErrorScreen from '@/src/components/ErrorScreen';
import { logger } from '@/src/lib/logger';
import { STRINGS } from '@/src/constants/strings';
import './globals.css';
import './styleguide.css';

/**
 * This file replaces the root layout when it runs, so everything that layout sets up has to
 * be set up again here — the font, the reset, the design tokens. Same face as the rest of
 * the app: a fallback in a different typeface reads as a different site.
 */
const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
});

/**
 * The last-resort error boundary, for a failure in the root layout itself — the one place
 * `error.tsx` cannot reach, because it renders inside that layout.
 *
 * Being a Client Component it cannot export `metadata`, so the tab title is set with React's
 * own `<title>`, which is hoisted into the head.
 *
 * @param error - The error thrown while rendering the root layout.
 * @param unstable_retry - Re-fetches and re-renders the application.
 * @returns The fallback error UI, as a complete document.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    logger.error('Root layout render failed', error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en" className={lexend.variable}>
      <body>
        <title>{`${STRINGS.ERROR_TITLE} · ${STRINGS.APP_NAME}`}</title>

        <ErrorScreen onRetry={unstable_retry} />
      </body>
    </html>
  );
}
