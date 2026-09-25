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
import AppImage from '../AppImage';
import Button from '../Button';
import { Heading5, Text2, Text4 } from '../Typography/Typography';
import { ROUTES, STRINGS } from '@/src/constants/strings';
import styles from './NotFoundScreen.module.scss';

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
    <div data-testid="NotFoundScreenTest" className={styles.container}>
      {/*
      Purely atmospheric — they carry no meaning the copy doesn't already state, and they are
      dropped below the tablet breakpoint where there is no room to place them.
      */}
      <div className={styles.ornaments} aria-hidden="true">
        <span className={styles.squareStart} />
        <span className={styles.dotEnd} />
        <span className={styles.dotStart} />
        <span className={styles.squareEnd} />
      </div>

      <div className={styles.content}>
        {/* Decorative: the code and the heading below say the same thing in words. */}
        {/* Above the fold and the first thing on the screen, so it is fetched eagerly. */}
        <AppImage
          src="/not-found-illustration.svg"
          alt=""
          width={348}
          height={266}
          className={styles.illustration}
          preload
        />

        <p className={styles.code}>{STRINGS.NOT_FOUND_CODE}</p>

        <Heading5 as="h1" className={styles.title}>
          {STRINGS.NOT_FOUND_TITLE}
        </Heading5>

        <div className={styles.description}>
          <Text4 as="p" align="center">
            {STRINGS.NOT_FOUND_DESCRIPTION}
          </Text4>

          <Text4 as="p" align="center">
            {STRINGS.NOT_FOUND_DESCRIPTION_HINT}
          </Text4>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            startIcon={ChevronLeft}
            iconSize={16}
            className={styles.goBack}
            onClick={handleGoBack}
          >
            {STRINGS.NOT_FOUND_GO_BACK}
          </Button>

          <Button
            startIcon={LayoutGrid}
            iconSize={16}
            className={styles.action}
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            {STRINGS.NOT_FOUND_BACK_TO_DASHBOARD}
          </Button>
        </div>

        <Text2 as="p" align="center" className={styles.supportNote}>
          {STRINGS.NOT_FOUND_SUPPORT_NOTE}
        </Text2>
      </div>
    </div>
  );
}
