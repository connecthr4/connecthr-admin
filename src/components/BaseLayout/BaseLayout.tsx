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
import LeftNavBar from '../LeftNavBar';
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

export default function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className={styles.container}>
      <LeftNavBar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
