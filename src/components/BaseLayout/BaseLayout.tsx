/**
 * BaseLayout is a reusable layout component that structures the page with a main content area and an optional responsive right-side navbar.
 *
 * @example
 * ```tsx
 * import BaseLayout from '@src/components/BaseLayout'
 *
 * export default function BaseLayout() {
 *   return <BaseLayout label="Hello" />;
 * }
 * ```
 */

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import LeftNavBar from '../LeftNavBar';
import AuthHydrator from '../AuthHydrator';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { canManageUsers } from '@/src/lib/auth/roles';
import { ROUTES } from '@/src/constants/strings';
import styles from './BaseLayout.module.scss';

/**
 * Define the props available for the BaseLayout component.
 */
interface BaseLayoutProps {
  /**
   * The main content to be rendered inside the layout.
   *
   * * This represents the page-specific content that appears
   * beside the sidebar and within the main viewport area.
   *
   * Typically passed as:
   *
   * @example
   * ```tsx
   * <BaseLayout>
   *   <DashboardPage />
   * </BaseLayout>
   * ```
   */
  children: ReactNode;
}

export default async function BaseLayout({ children }: BaseLayoutProps) {
  const user = await getCurrentUser();

  /*
  Sent to the change-password screen before anything else — users created
  through the admin UI always arrive holding a temporary password. `redirect`
  throws, so it stays outside any try block. The reset-password route renders
  outside this layout, so this cannot bounce against itself.

  Only when a user was actually resolved: redirecting on a null user would
  fight `proxy.ts`, which sends anyone still holding a session cookie back to
  the dashboard.
  */
  if (user?.mustChangePassword) {
    redirect(ROUTES.RESET_PASSWORD);
  }

  return (
    <div className={styles.container}>
      <AuthHydrator user={user} />

      <LeftNavBar showUserManagement={canManageUsers(user?.role)} />

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
