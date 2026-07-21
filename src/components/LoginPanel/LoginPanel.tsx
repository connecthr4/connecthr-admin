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
import Modal from '@/src/components/Modal';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/src/lib/api/auth';
import Button from '@/src/components/Button';
import { useAuthStore } from '@/src/store/auth';
import { ROUTES, STRINGS } from '@/src/constants/strings';
import { isValidEmail } from '@/src/utils/helper';
import TextInput from '@/src/components/TextInput';
import { getApiErrorInfo } from '@/src/lib/api/helpers';
import type { ChangePasswordResponse, LoginResponse } from '@/src/lib/types/auth';
import { Heading1, Heading2, Text1, Text2 } from '../Typography';
import { useNotification } from '@/src/providers/NotificationProvider';
import styles from './LoginPanel.module.scss';

type AuthStep = 'login' | 'reset-password';

/**
 * Define the props available for the LoginPanel component.
 */
interface LoginPanelProps {
  step: AuthStep;
}

export default function LoginPanel({ step = 'login' }: LoginPanelProps) {
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
      const response = (await AuthApi.login(formData)) as LoginResponse;
      const updatePassword = response.data?.user?.mustChangePassword;
      login(response.data);
      if (updatePassword) {
        setTempPassword(formData.password);
        router.push(ROUTES.RESET_PASSWORD);
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err) {
      const { message } = getApiErrorInfo(err);
      showNotification(STRINGS.LOGIN_FAILED, message, 'error', 5000, 'top-right', false);
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
      newErrors.newPassword = 'New password is required';
    } else if (resetPasswordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!resetPasswordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      const response = (await AuthApi.changePassword(payload)) as ChangePasswordResponse;
      console.log('response>>>', response);
      setShowSuccessModal(true);

      // Navigate to Dashboard after success
      // router.push('/dashboard');
    } catch (error) {
      console.error(error);
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
            <Heading2>Reset Password</Heading2>
            <Text2>Please create a new password.</Text2>
          </div>
          <div className={styles.inputSection}>
            <TextInput
              label="New Password"
              placeholder="Enter new password"
              type="password"
              value={resetPasswordData.newPassword}
              onChange={(e) => handleResetPasswordChange('newPassword', e.target.value)}
              error={resetPasswordErrors.newPassword}
            />
            <TextInput
              label="Confirm Password"
              placeholder="Confirm new password"
              type="password"
              value={resetPasswordData.confirmPassword}
              onChange={(e) => handleResetPasswordChange('confirmPassword', e.target.value)}
              error={resetPasswordErrors.confirmPassword}
            />
            <PasswordRequirements password={resetPasswordData.newPassword} />
          </div>
          <Button className={styles.button} onClick={handleResetPassword}>
            <Text1 color="var(--color-white)">Reset Password</Text1>
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
      label: 'At least 8 characters',
      valid: checks.minLength,
    },
    {
      label: 'One uppercase letter',
      valid: checks.uppercase,
    },
    {
      label: 'One lowercase letter',
      valid: checks.lowercase,
    },
    {
      label: 'One number',
      valid: checks.number,
    },
    {
      label: 'One special character',
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
          <span>{requirement.label}</span>
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
        <Heading2 align="center">Password Update Successfully</Heading2>
        <Button onClick={onBackToLogin}>Back to Login</Button>
      </div>
    </Modal>
  );
}
