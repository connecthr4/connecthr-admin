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

import { Heading3, Text1, Text2 } from '@/src/components/Typography';
import { Bell, ChevronDown, CircleUserRound } from 'lucide-react';
import styles from './AppHeader.module.scss';
import Breadcrumbs from '../Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Define the props available for the AppHeader component.
 */
interface AppHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppHeader({ title, subtitle, breadcrumbs }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Heading3>{title}</Heading3>
        {breadcrumbs?.length && <Breadcrumbs items={breadcrumbs} />}
        {subtitle && <Text1 className={styles.subtitle}>{subtitle}</Text1>}
      </div>

      <div className={styles.rightSection}>
        <button className={styles.notificationButton}>
          <Bell size={22} />
        </button>

        <div className={styles.profileContainer}>
          <CircleUserRound width={48} height={48} className={styles.profileAvatar} />

          <div className={styles.profileInfo}>
            <Text1 className={styles.profileName} truncation="ellipsis">
              Robert Romeria
            </Text1>

            <Text2 className={styles.profileRole} truncation="ellipsis">
              Admin
            </Text2>
          </div>

          <ChevronDown className={styles.profileDropdownIcon} />
        </div>
      </div>
    </header>
  );
}
