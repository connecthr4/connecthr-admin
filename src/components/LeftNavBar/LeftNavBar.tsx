/**
 * LeftNavBar is a reusable sidebar navigation component used to provide quick access to dashboard modules and application routes.
 *
 * @example
 * ```tsx
 * import LeftNavBar from '@src/components/LeftNavBar'
 *
 * export default function LeftNavBar() {
 *   return <LeftNavBar label="Hello" />;
 * }
 * ```
 */

'use client';

import clsx from 'clsx';
import AppLink from '../AppLink';
import { usePathname } from 'next/navigation';
import { STRINGS } from '@/src/constants/strings';
import { NAV_ITEMS } from '@/src/constants/navigation';
import { Heading2, NavLabel } from '../Typography/Typography';
import styles from './LeftNavBar.module.scss';

/**
 * Define the props available for the LeftNavBar component.
 */
interface LeftNavBarProps {
  /**
   * Whether to render the items gated behind user management. Resolved on the
   * server from the signed-in user's role and passed in, rather than read from
   * the client store — the store is empty on a fresh page load, which would
   * blink the items out of existence for anyone entitled to see them.
   *
   * Defaults to `false` so an unresolved role hides the items rather than
   * offering an action that would fail.
   */
  showUserManagement?: boolean;
}

export default function LeftNavBar({ showUserManagement = false }: LeftNavBarProps) {
  const pathname = usePathname();

  const navItems = NAV_ITEMS.filter((item) => !item.requiresUserManagement || showUserManagement);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <Heading2>{STRINGS.APP_NAME}</Heading2>
      </div>

      <nav className={styles.navigation}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <AppLink
              key={item.href}
              href={item.href}
              className={clsx(styles.navItem, {
                [styles.active]: isActive,
              })}
            >
              <span className={styles.icon}>
                <Icon size={22} />
              </span>

              <NavLabel>{item.label}</NavLabel>
            </AppLink>
          );
        })}
      </nav>
    </aside>
  );
}
