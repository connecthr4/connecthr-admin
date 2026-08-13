/**
 * Reusable application header component displaying title, subtitle, notification action, and user profile information.
 *
 * @example
 * ```tsx
 * import AppHeader from '@src/components/AppHeader'
 *
 * export default function AppHeader() {
 *   return <AppHeader label="Hello" />;
 * }
 * ```
 */

import type { User } from '@/src/lib/types/auth';
import Breadcrumbs from '../Breadcrumbs';
import { Bell, ChevronDown, CircleUserRound } from 'lucide-react';
import { Heading3, Text1, Text2 } from '../Typography';
import styles from './AppHeader.module.scss';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Defines the properties accepted by the {@link AppHeader} component.
 */
interface AppHeaderProps {
  /**
   * Primary heading displayed at the top of the page.
   */
  title: string;

  /**
   * Optional secondary text displayed below the title.
   * Typically used for greetings or page descriptions.
   */
  subtitle?: string;

  /**
   * Authenticated user's information displayed in the profile section.
   * If not provided, default placeholder values are rendered.
   */
  userDetails?: User | null;

  /**
   * Optional list of breadcrumb items used to display the current
   * navigation hierarchy.
   */
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppHeader({ title, subtitle, userDetails, breadcrumbs }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Heading3>{title}</Heading3>
        {breadcrumbs?.length && <Breadcrumbs items={breadcrumbs} />}
        {subtitle && <Text1 className={styles.subtitle}>{subtitle}</Text1>}
      </div>

      <div className={styles.rightSection}>
        {/* <button className={styles.notificationButton}>
          <Bell size={22} />
        </button> */}

        <div className={styles.profileContainer}>
          <CircleUserRound width={48} height={48} className={styles.profileAvatar} />

          <div className={styles.profileInfo}>
            <Text1 className={styles.profileName} truncation="ellipsis">
              {userDetails?.name || 'User'}
            </Text1>

            <Text2 className={styles.profileRole} truncation="ellipsis">
              {userDetails?.role || 'Admin'}
            </Text2>
          </div>

          <ChevronDown className={styles.profileDropdownIcon} />
        </div>
      </div>
    </header>
  );
}
