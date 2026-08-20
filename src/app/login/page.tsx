/**
 * @module app/login/page
 */

import LoginPanel from '@/src/components/LoginPanel';
import { SESSION_EXPIRED_QUERY } from '@/src/constants/strings';
import styles from './page.module.scss';

/**
 * Login route that allows users to securely authenticate and access the application.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `login` route.
 *
 * `session=expired` on the URL is how the three idle-timeout gates —
 * `proxy.ts`, `withSession`, and the Server Functions — say why the user is
 * back here, since each of them has already cleared the session by the time
 * this renders and has no other way to pass the reason along.
 *
 * @returns The page UI for the route.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sessionExpired = (await searchParams)[SESSION_EXPIRED_QUERY.KEY] === SESSION_EXPIRED_QUERY.VALUE;

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}></div>
      <div className={styles.rightSection}>
        <LoginPanel step="login" sessionExpired={sessionExpired} />
      </div>
    </div>
  );
}
