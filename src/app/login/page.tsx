/**
 * @module app/login/page
 */

import LoginPanel from '@/src/components/LoginPanel';
import { SESSION_END_QUERY } from '@/src/constants/strings';
import styles from './page.module.scss';

/**
 * Login route that allows users to securely authenticate and access the application.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `login` route.
 *
 * `session=` on the URL is how the gates that end a session — `proxy.ts`,
 * `withSession`, the Server Functions, and `requireUser` — say why the user is
 * back here, since each of them has already cleared the session by the time
 * this renders and has no other way to pass the reason along. `expired` is an
 * idle timeout; `ended` is a session that stopped working for some other
 * reason. Anything else is ignored: the value reaches this page from the URL
 * bar, so it is not to be trusted into the banner.
 *
 * @returns The page UI for the route.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const marker = (await searchParams)[SESSION_END_QUERY.KEY];

  const sessionEndReason = marker === SESSION_END_QUERY.IDLE || marker === SESSION_END_QUERY.ENDED ? marker : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}></div>
      <div className={styles.rightSection}>
        <LoginPanel step="login" sessionEndReason={sessionEndReason} />
      </div>
    </div>
  );
}
