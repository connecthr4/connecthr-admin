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
import { NAV_ITEMS } from '@/src/constants/navigation';
import { Heading2, NavLabel } from '../Typography/Typography';
import styles from './LeftNavBar.module.scss';

/**
 * Define the props available for the LeftNavBar component.
 */
// interface LeftNavBarProps {}

export default function LeftNavBar({}) {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <Heading2>connectHR</Heading2>
      </div>

      <nav className={styles.navigation}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
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
