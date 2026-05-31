/**
 * @module app/login/page
 */

import LoginPanel from '@/src/components/LoginPanel';
import styles from './page.module.scss';
/**
 * Login route that allows users to securely authenticate and access the application.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `login` route.
 *
 * @returns The page UI for the route.
 */
export default function loginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}></div>
      <div className={styles.rightSection}>
        <LoginPanel />
      </div>
    </div>
  );
}
