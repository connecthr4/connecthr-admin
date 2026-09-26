/**
 * The header button that opens the navigation drawer at tablet widths. Hidden by CSS
 * wherever the sidebar is docked, so it only ever appears when there is no other way
 * to reach the nav.
 *
 * A client island on its own so `AppHeader` can stay a server component.
 *
 * @example
 * ```tsx
 * import NavMenuButton from '@/src/components/NavMenuButton';
 *
 * <header>
 *   <NavMenuButton />
 * </header>
 * ```
 */

'use client';

import { Menu } from 'lucide-react';
import { STRINGS } from '@/src/constants/strings';
import { useLayoutStore } from '@/src/store/layout';
import styles from './NavMenuButton.module.scss';

export default function NavMenuButton() {
  const isNavOpen = useLayoutStore((state) => state.isNavOpen);
  const openNav = useLayoutStore((state) => state.openNav);

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={STRINGS.OPEN_NAVIGATION_MENU}
      aria-haspopup="dialog"
      aria-expanded={isNavOpen}
      onClick={openNav}
    >
      <Menu size={22} aria-hidden />
    </button>
  );
}
