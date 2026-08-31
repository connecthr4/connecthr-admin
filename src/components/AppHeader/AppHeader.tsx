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

import type { ReactNode } from 'react';
import type { User } from '@/src/lib/types/auth';
import Breadcrumbs from '../Breadcrumbs';
import UserMenu from '../UserMenu';
import { Bell } from 'lucide-react';
import { Heading3, Text1 } from '../Typography';
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
   *
   * @remarks
   * A node rather than a string, so a screen whose title is not known yet — a loading
   * skeleton waiting on the record it is named after — can put a placeholder in its place
   * and keep the rest of the header on screen.
   */
  title: ReactNode;

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

        <UserMenu userDetails={userDetails} />
      </div>
    </header>
  );
}
