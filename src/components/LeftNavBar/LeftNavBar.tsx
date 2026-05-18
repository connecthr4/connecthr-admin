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

import clsx from 'clsx';
import AppLink from '../AppLink';
import { Heading1 } from '../Typography';
import styles from './LeftNavBar.module.scss';
import { NAV_ITEMS } from '@/src/constants/navigation';
import { NavLabel } from '../Typography/Typography';

/**
 * Define the props available for the LeftNavBar component.
 */
interface LeftNavBarProps {
  label?: string;
}

export default function LeftNavBar({ label = 'label' }: LeftNavBarProps) {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>∞</div>

        <Heading1>HRMS</Heading1>
      </div>

      {/* Navigation */}
      <nav className={styles.navigation}>
        {NAV_ITEMS.map((item) => {
          const isActive = '/ dashboard' === item.href;

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
