/**
 * A form that captures a new admin account's details and creates it.
 *
 * On success the backend returns a generated password exactly once — the form
 * swaps itself for a panel that displays it, since re-fetching it later is not
 * possible.
 *
 * @example
 * ```tsx
 * import CreateUserDashboard from '@src/components/CreateUserDashboard'
 *
 * export default function Example() {
 *   return <CreateUserDashboard assignableRoles={roles} currentUser={user} />;
 * }
 * ```
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import AppHeader from '../AppHeader';
import Button from '../Button';
import TextInput from '../TextInput';
import Dropdown from '../Dropdown';
import { Heading3, Text1, Text2 } from '../Typography';
import { logger } from '@/src/lib/logger';
import { isValidEmail } from '@/src/utils/helper';
import { UsersClient } from '@/src/lib/api/usersClient';
import { formatRole, ROLES } from '@/src/lib/auth/roles';
import { logoutAction } from '@/src/lib/actions/auth';
import { useAuthStore } from '@/src/store/auth';
import { getApiErrorInfo } from '@/src/lib/api/helpers';
import { useNotification } from '@/src/providers/NotificationProvider';
import { NOTIFICATION_TYPES, ROUTES, STRINGS } from '@/src/constants/strings';
import styles from './CreateUserDashboard.module.scss';

import type { UsersClientError } from '@/src/lib/api/usersClient';
import type { Role } from '@/src/lib/auth/roles';
import type { User } from '@/src/lib/types/auth';
import type { CreatedUser } from '@/src/lib/types/users';

/**
 * Error codes the form has to tell apart. Anything else falls through to a
 * generic banner.
 */
const ERROR_CODES = {
  EMAIL_EXISTS: 'USER_EMAIL_ALREADY_EXISTS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_NOT_ACTIVE: 'ACCOUNT_NOT_ACTIVE',
} as const;

const EMPTY_FORM = { name: '', email: '', role: '' };
const EMPTY_ERRORS = { name: '', email: '', role: '' };

/**
 * Define the props available for the CreateUserDashboard component.
 */
interface CreateUserDashboardProps {
  /**
   * Roles this account may assign, from `/users/assignable-roles`. Fetched
   * rather than hardcoded so the backend decides who creates whom — and so
   * `IT` never appears, since the API rejects it for every caller.
   */
  assignableRoles: Role[];

  /**
   * The signed-in user, for the header chip. Passed from the server render so
   * a page reload doesn't blank it out.
   */
  currentUser: User | null;
}

export default function CreateUserDashboard({ assignableRoles, currentUser }: CreateUserDashboardProps) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  /*
  Belt and braces: the API is documented never to offer IT, and rejects it
  from every caller, so an IT option could only ever produce a 403.
  */
  const roleOptions = assignableRoles
    .filter((role) => role !== ROLES.IT)
    .map((role) => ({ label: formatRole(role), value: role }));

  const handleChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = { ...EMPTY_ERRORS };

    if (!formData.name.trim()) {
      nextErrors.name = STRINGS.NAME_REQUIRED;
    }

    if (!formData.email.trim()) {
      nextErrors.email = STRINGS.EMAIL_REQUIRED;
    } else if (!isValidEmail(formData.email)) {
      nextErrors.email = STRINGS.EMAIL_INVALID;
    }

    if (!formData.role) {
      nextErrors.role = STRINGS.ROLE_REQUIRED;
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  /**
   * The acting account was disabled mid-session, so nothing it does from here
   * will succeed. `logoutAction` clears the session cookies and redirects.
   */
  const forceLogout = async () => {
    clearAuth();

    await logoutAction();
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await UsersClient.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role as Role,
      });

      setCreatedUser(response.data);
      setFormData(EMPTY_FORM);
      showNotification(STRINGS.USER_CREATED_SUCCESSFULLY, '', NOTIFICATION_TYPES.SUCCESS, 5000, 'top-right', false);
    } catch (error) {
      logger.error('Error occurred while creating user:', error);

      const { code } = error as UsersClientError;
      const { message } = getApiErrorInfo(error);

      if (code === ERROR_CODES.ACCOUNT_NOT_ACTIVE) {
        await forceLogout();

        return;
      }

      if (code === ERROR_CODES.EMAIL_EXISTS) {
        setErrors((prev) => ({ ...prev, email: STRINGS.EMAIL_ALREADY_EXISTS }));

        return;
      }

      /*
      Should be unreachable — the route guard and the role-driven dropdown
      both run ahead of this, so reaching it means one of them is wrong.
      Logged above as the bug it is, and shown as a plain denial.
      */
      const detail = code === ERROR_CODES.INSUFFICIENT_PERMISSIONS ? '' : message;

      showNotification(STRINGS.USER_CREATION_FAILED, detail, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <AppHeader title={STRINGS.CREATE_USER} subtitle={STRINGS.ADD_NEW_USER} userDetails={currentUser} />

      <div className={styles.content}>
        {createdUser ? (
          <CreatedUserPanel
            user={createdUser}
            onCreateAnother={() => setCreatedUser(null)}
            onDone={() => router.push(ROUTES.USERS)}
          />
        ) : (
          <div className={styles.form}>
            {roleOptions.length === 0 ? (
              <Text2 className={styles.emptyRoles}>{STRINGS.NO_ASSIGNABLE_ROLES}</Text2>
            ) : (
              <>
                <div className={styles.fields}>
                  <TextInput
                    label={STRINGS.FULL_NAME}
                    placeholder={STRINGS.FULL_NAME_PLACEHOLDER}
                    required
                    value={formData.name}
                    error={errors.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />

                  <TextInput
                    label={STRINGS.EMAIL_ADDRESS}
                    placeholder={STRINGS.EMAIL_ADDRESS_PLACEHOLDER}
                    required
                    value={formData.email}
                    error={errors.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />

                  <Dropdown
                    label={STRINGS.USER_ROLE}
                    placeholder={STRINGS.SELECT_ROLE}
                    required
                    options={roleOptions}
                    value={formData.role}
                    error={errors.role}
                    onChange={(value) => handleChange('role', value)}
                  />
                </div>

                <div className={styles.actions}>
                  <Button onClick={handleSubmit} loading={isSubmitting}>
                    {STRINGS.CREATE}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface CreatedUserPanelProps {
  user: CreatedUser;
  onCreateAnother: () => void;
  onDone: () => void;
}

/**
 * The one and only sighting of the generated password. It is not stored
 * anywhere on this side and the API will not return it again, so the panel
 * says so plainly rather than leaving the reader to find out later.
 */
function CreatedUserPanel({ user, onCreateAnother, onDone }: CreatedUserPanelProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.temporaryPassword);

      setCopyError('');
      setIsCopied(true);

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      /*
      The clipboard API needs a secure context and a permission the browser
      can refuse. The password is on screen either way, so the fallback is to
      tell the reader to copy it by hand rather than to fail silently.
      */
      logger.error('Error occurred while copying the temporary password:', error);

      setCopyError(STRINGS.COPY_FAILED);
    }
  };

  return (
    <div className={styles.successPanel}>
      <Heading3>{STRINGS.USER_CREATED_SUCCESSFULLY}</Heading3>

      <div className={styles.summary}>
        <Text2 className={styles.summaryRow}>
          {STRINGS.USER_NAME}: <strong>{user.name}</strong>
        </Text2>

        <Text2 className={styles.summaryRow}>
          {STRINGS.USER_EMAIL}: <strong>{user.email}</strong>
        </Text2>

        <Text2 className={styles.summaryRow}>
          {STRINGS.USER_ROLE}: <strong>{formatRole(user.role)}</strong>
        </Text2>
      </div>

      <div className={styles.passwordBlock}>
        <Text1 className={styles.passwordLabel}>{STRINGS.TEMPORARY_PASSWORD}</Text1>

        <div className={styles.passwordRow}>
          <code className={styles.password}>{user.temporaryPassword}</code>

          <Button
            variant="secondary"
            startIcon={isCopied ? Check : Copy}
            iconSize={18}
            className={styles.copyButton}
            onClick={handleCopy}
          >
            {isCopied ? STRINGS.COPIED : STRINGS.COPY}
          </Button>
        </div>

        <div className={styles.warning}>
          <TriangleAlert size={18} aria-hidden />

          <Text2 as="span">{STRINGS.TEMPORARY_PASSWORD_WARNING}</Text2>
        </div>

        {copyError && <Text2 className={styles.copyError}>{copyError}</Text2>}
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCreateAnother}>
          {STRINGS.CREATE_ANOTHER_USER}
        </Button>

        <Button onClick={onDone}>{STRINGS.BACK_TO_USERS}</Button>
      </div>
    </div>
  );
}
