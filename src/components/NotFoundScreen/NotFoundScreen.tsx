/**
 * The screen behind every URL the app has no route for. It states what went wrong, then
 * offers the two ways out of a dead end: step back to the last screen, or return to the
 * dashboard.
 *
 * @example
 * ```tsx
 * import NotFoundScreen from '@src/components/NotFoundScreen'
 *
 * export default function NotFound() {
 *   return <NotFoundScreen />;
 * }
 * ```
 */
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, LayoutGrid } from 'lucide-react';
import StatusScreen from '../StatusScreen';
import { ROUTES, STRINGS } from '@/src/constants/strings';

export default function NotFoundScreen() {
  const router = useRouter();

  /**
   * A 404 opened from a pasted or bookmarked URL has nothing behind it, and `back()` on an
   * empty history does nothing at all — leaving a button that looks broken. The dashboard is
   * the stand-in for "wherever you came from" in that case.
   */
  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(ROUTES.DASHBOARD);
  };

  return (
    <StatusScreen
      illustration={{ src: '/not-found-illustration.svg', width: 348, height: 266 }}
      code={STRINGS.NOT_FOUND_CODE}
      title={STRINGS.NOT_FOUND_TITLE}
      description={[STRINGS.NOT_FOUND_DESCRIPTION, STRINGS.NOT_FOUND_DESCRIPTION_HINT]}
      actions={[
        {
          label: STRINGS.NOT_FOUND_GO_BACK,
          icon: ChevronLeft,
          onClick: handleGoBack,
        },
        {
          label: STRINGS.NOT_FOUND_BACK_TO_DASHBOARD,
          icon: LayoutGrid,
          onClick: () => router.push(ROUTES.DASHBOARD),
          variant: 'primary',
        },
      ]}
      note={STRINGS.NOT_FOUND_SUPPORT_NOTE}
    />
  );
}
