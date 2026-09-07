/**
 * A login panel component that provides user authentication inputs and actions for accessing the application.
 *
 * @example
 * ```tsx
 * import LoginPanel from '@src/components/LoginPanel'
 *
 * export default function LoginPanel() {
 *   return <LoginPanel label="Hello" />;
 * }
 * ```
 */
'use client';

import AppImage from '@/src/components/AppImage';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { logger } from '@/src/lib/logger';
import Modal from '@/src/components/Modal';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/Button';
import { useAuthStore } from '@/src/store/auth';
import { isValidEmail } from '@/src/utils/helper';
import TextInput from '@/src/components/TextInput';
import { getApiErrorInfo } from '@/src/lib/api/helpers';
import { Heading2, Text1, Text2 } from '../Typography';
import { useNotification } from '@/src/providers/NotificationProvider';
import { changePasswordAction, loginAction } from '@/src/lib/actions/auth';
import { NOTIFICATION_TYPES, ROUTES, SESSION_END_QUERY, STRINGS } from '@/src/constants/strings';
import styles from './LoginPanel.module.scss';

import type { SessionEndReason } from '@/src/constants/strings';

type AuthStep = 'login' | 'reset-password';

/**
 * Define the props available for the LoginPanel component.
 */
interface LoginPanelProps {
  step: AuthStep;

  /**
   * Why the user was sent back here, if they were: `expired` for an idle
   * timeout, `ended` for a session that stopped working for another reason.
   * Renders a notice above the form — an inline banner rather than a toast,
   * because the user arrives mid-navigation and a notification that dismisses
   * itself is easy to miss entirely, leaving them wondering why they were
   * signed out.
   */
  sessionEndReason?: SessionEndReason;
}

export default function LoginPanel({ step = 'login', sessionEndReason }: LoginPanelProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const setTempPassword = useAuthStore((state) => state.setTempPassword);
  const tempPassword = useAuthStore((state) => state.tempPassword);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  /*
  The banner is a one-off announcement, but the URL it is read from outlives the moment: a
  reload, the Back button, or a browser restoring the tab would all replay it, long after the
  session it referred to. So the marker is dropped as soon as it has been rendered once.

  `replaceState` rather than `router.replace`: Next.js integrates it with the Router, and it
  neither re-renders this page (the banner has to stay put for the visit it belongs to) nor
  leaves the marked URL behind in the history stack.
  */
  useEffect(() => {
    if (!sessionEndReason) return;

    const url = new URL(window.location.href);

    if (!url.searchParams.has(SESSION_END_QUERY.KEY)) return;

    url.searchParams.delete(SESSION_END_QUERY.KEY);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [sessionEndReason]);

  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleResetPasswordChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    setResetPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setResetPasswordErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleLogin = async () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = STRINGS.EMAIL_REQUIRED;
    } else if (!isValidEmail(formData?.email)) {
      newErrors.email = STRINGS.EMAIL_INVALID;
    }

    if (!formData.password.trim()) {
      newErrors.password = STRINGS.PASSWORD_REQUIRED;
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);
      const result = await loginAction(formData);

      if (!result.success) {
        showNotification(STRINGS.LOGIN_FAILED, result.message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
        return;
      }

      login({ user: result.user });

      if (result.user.mustChangePassword) {
        setTempPassword(formData.password);
        router.push(ROUTES.RESET_PASSWORD);
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err) {
      const { message } = getApiErrorInfo(err);
      showNotification(STRINGS.LOGIN_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newErrors = {
      newPassword: '',
      confirmPassword: '',
    };

    if (!resetPasswordData.newPassword.trim()) {
      newErrors.newPassword = STRINGS.NEW_PASSWORD_REQUIRED;
    } else if (resetPasswordData.newPassword.length < 8) {
      newErrors.newPassword = STRINGS.NEW_PASSWORD_MIN_LENGTH;
    }

    if (!resetPasswordData.confirmPassword.trim()) {
      newErrors.confirmPassword = STRINGS.CONFIRM_PASSWORD_REQUIRED;
    } else if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = STRINGS.PASSWORDS_DO_NOT_MATCH;
    }

    setResetPasswordErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(Boolean);

    if (hasErrors) {
      return;
    }

    try {
      const payload = {
        ...resetPasswordData,
        currentPassword: tempPassword ?? '',
      };
      const result = await changePasswordAction(payload);

      if (!result.success) {
        showNotification(
          STRINGS.PASSWORD_RESET_FAILED,
          result.message,
          NOTIFICATION_TYPES.ERROR,
          5000,
          'top-right',
          false
        );
        return;
      }

      setShowSuccessModal(true);
    } catch (error) {
      logger.error('Error occurred while resetting password:', error);
      const { message } = getApiErrorInfo(error);
      showNotification(STRINGS.PASSWORD_RESET_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    }
  };

  return (
    <div className={styles.container}>
      <AppImage
        src="/zentrohr-logo.svg"
        alt={STRINGS.APP_NAME}
        width={931}
        height={202}
        className={styles.brandLogo}
        preload
      />

      {step === 'login' && (
        <>
          <div className={styles.welcomeSection}>
            <Heading2>{STRINGS.WELCOME}</Heading2>
            <Text2 className={styles.welcomeText}>{STRINGS.PLEASE_LOGIN_HERE}</Text2>
          </div>
          {sessionEndReason && (
            <div className={styles.sessionExpiredBanner} role="status">
              <Text2>
                {sessionEndReason === SESSION_END_QUERY.IDLE ? STRINGS.SESSION_EXPIRED : STRINGS.SESSION_ENDED}
              </Text2>
            </div>
          )}
          <div className={styles.inputSection}>
            <TextInput
              label={STRINGS.EMAIL_ADDRESS}
              placeholder={STRINGS.EMAIL_ADDRESS_PLACEHOLDER}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
            />
            <TextInput
              label={STRINGS.PASSWORD}
              placeholder={STRINGS.PASSWORD_PLACEHOLDER}
              type="password"
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
            />
          </div>
          <Button className={styles.button} onClick={handleLogin} disabled={loading} loading={loading}>
            <Text1 color="var(--color-white)">{STRINGS.LOGIN}</Text1>
          </Button>
        </>
      )}

      {step === 'reset-password' && (
        <>
          <div className={styles.welcomeSection}>
            <Heading2>{STRINGS.RESET_PASSWORD}</Heading2>
            <Text2>{STRINGS.PLEASE_CREATE_NEW_PASSWORD}</Text2>
          </div>
          <div className={styles.inputSection}>
            <TextInput
              label={STRINGS.NEW_PASSWORD}
              placeholder={STRINGS.ENTER_NEW_PASSWORD}
              type="password"
              value={resetPasswordData.newPassword}
              onChange={(e) => handleResetPasswordChange('newPassword', e.target.value)}
              error={resetPasswordErrors.newPassword}
            />
            <TextInput
              label={STRINGS.CONFIRM_PASSWORD}
              placeholder={STRINGS.CONFIRM_NEW_PASSWORD}
              type="password"
              value={resetPasswordData.confirmPassword}
              onChange={(e) => handleResetPasswordChange('confirmPassword', e.target.value)}
              error={resetPasswordErrors.confirmPassword}
            />
            <PasswordRequirements password={resetPasswordData.newPassword} />
          </div>
          <Button className={styles.button} onClick={handleResetPassword}>
            <Text1 color="var(--color-white)">{STRINGS.RESET_PASSWORD}</Text1>
          </Button>
        </>
      )}

      {showSuccessModal && (
        <PasswordResetSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onBackToLogin={() => {
            setShowSuccessModal(false);
            router.push('/login');
          }}
        />
      )}
    </div>
  );
}

interface PasswordRequirementsProps {
  password: string;
}

function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialCharacter: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const requirements = [
    {
      label: STRINGS.PASSWORD_REQUIREMENT_MIN_LENGTH,
      valid: checks.minLength,
    },
    {
      label: STRINGS.PASSWORD_REQUIREMENT_UPPERCASE,
      valid: checks.uppercase,
    },
    {
      label: STRINGS.PASSWORD_REQUIREMENT_LOWERCASE,
      valid: checks.lowercase,
    },
    {
      label: STRINGS.PASSWORD_REQUIREMENT_NUMBER,
      valid: checks.number,
    },
    {
      label: STRINGS.PASSWORD_REQUIREMENT_SPECIAL_CHARACTER,
      valid: checks.specialCharacter,
    },
  ];

  return (
    <div className={styles.passwordRequirementSection}>
      {requirements.map((requirement) => (
        <div key={requirement.label} className={styles.requirement}>
          {requirement.valid ? (
            <Check size={24} className={styles.valid} />
          ) : (
            <X size={24} className={styles.invalid} />
          )}
          <Text2 as="span">{requirement.label}</Text2>
        </div>
      ))}
    </div>
  );
}

interface PasswordResetSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

function PasswordResetSuccessModal({ isOpen, onClose, onBackToLogin }: PasswordResetSuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} maxWidth="400px">
      <div className={styles.modalContent}>
        <Heading2 align="center">{STRINGS.PASSWORD_UPDATED_SUCCESSFULLY}</Heading2>
        <Button onClick={onBackToLogin}>{STRINGS.BACK_TO_LOGIN}</Button>
      </div>
    </Modal>
  );
}
