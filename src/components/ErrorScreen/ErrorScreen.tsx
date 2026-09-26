/**
 * The screen a route falls back to when its render throws. It says what happened in the
 * user's terms — not the app's — and offers the two ways forward: re-render the part that
 * failed, or reload the page outright when the tab itself is suspect.
 *
 * @example
 * ```tsx
 * import ErrorScreen from '@src/components/ErrorScreen'
 *
 * export default function Error({ unstable_retry }: { unstable_retry: () => void }) {
 *   return <ErrorScreen onRetry={unstable_retry} />;
 * }
 * ```
 */
'use client';

import { RefreshCw, RotateCw } from 'lucide-react';
import StatusScreen from '../StatusScreen';
import { STRINGS } from '@/src/constants/strings';

/**
 * Define the props available for the ErrorScreen component.
 */
interface ErrorScreenProps {
  /**
   * Re-renders whatever failed, without reloading the page. Wired to the error boundary's
   * `unstable_retry`, which re-fetches the segment: often all a transient failure needs.
   */
  onRetry: () => void;
}

export default function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <StatusScreen
      illustration={{ src: '/error-illustration.svg', width: 209, height: 198 }}
      title={STRINGS.ERROR_TITLE}
      description={STRINGS.ERROR_DESCRIPTION}
      actions={[
        {
          label: STRINGS.ERROR_RELOAD_PAGE,
          icon: RefreshCw,

          /*
          The heavier of the two: throws away the whole client — every store, cache and
          boundary — for the case where retrying the segment alone cannot help.
          */
          onClick: () => window.location.reload(),
        },
        {
          label: STRINGS.ERROR_TRY_AGAIN,
          icon: RotateCw,
          onClick: onRetry,
          variant: 'primary',
        },
      ]}
    />
  );
}
