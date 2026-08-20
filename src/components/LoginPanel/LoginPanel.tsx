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

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { logger } from '@/src/lib/logger';
import Modal from '@/src/components/Modal';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/Button';
import { useAuthStore } from '@/src/store/auth';
import { isValidEmail } from '@/src/utils/helper';
import TextInput from '@/src/components/TextInput';
import { getApiErrorInfo } from '@/src/lib/api/helpers';
import { Heading1, Heading2, Text1, Text2 } from '../Typography';
import { useNotification } from '@/src/providers/NotificationProvider';
import { changePasswordAction, loginAction } from '@/src/lib/actions/auth';
import { NOTIFICATION_TYPES, ROUTES, STRINGS } from '@/src/constants/strings';
import styles from './LoginPanel.module.scss';

type AuthStep = 'login' | 'reset-password';

/**
 * Define the props available for the LoginPanel component.
 */
interface LoginPanelProps {
  step: AuthStep;

  /**
   * Renders the inactivity notice above the form. An inline banner rather
   * than a toast: the user arrives here mid-navigation, and a notification
   * that dismisses itself is easy to miss entirely — leaving them wondering
   * why they were signed out.
   */
  sessionExpired?: boolean;
}

export default function LoginPanel({ step = 'login', sessionExpired = false }: LoginPanelProps) {
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
      <Heading1>{STRINGS.APP_NAME}</Heading1>

      {step === 'login' && (
        <>
          <div className={styles.welcomeSection}>
            <Heading2>{STRINGS.WELCOME}</Heading2>
            <Text2 className={styles.welcomeText}>{STRINGS.PLEASE_LOGIN_HERE}</Text2>
          </div>
          {sessionExpired && (
            <div className={styles.sessionExpiredBanner} role="status">
              <Text2>{STRINGS.SESSION_EXPIRED}</Text2>
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
