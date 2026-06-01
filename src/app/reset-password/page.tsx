/**
 * @module app/reset-password/page
 */
import LoginPanel from '@/src/components/LoginPanel';
import styles from './page.module.scss';

/**
 * Create a new password to replace your temporary password and secure your account.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `reset-password` route.
 *
 * @returns The page UI for the route.
 */
export default function ResetPasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}></div>
      <div className={styles.rightSection}>
        <LoginPanel step="reset-password" />
      </div>
    </div>
  );
}
