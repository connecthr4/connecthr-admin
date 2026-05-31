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

import { STRINGS } from '@/src/constants/strings';
import styles from './LoginPanel.module.scss';
import { Heading1, Heading2, Heading3, Text1, Text2 } from '../Typography';
import TextInput from '../TextInput';
import Button from '../Button';
import { useState } from 'react';
import { isValidEmail } from '@/src/utils/helper';

/**
 * Define the props available for the LoginPanel component.
 */
interface LoginPanelProps {
  label?: string;
}

export default function LoginPanel({ label = 'label' }: LoginPanelProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
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

  const handleLogin = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);

    if (hasErrors) {
      return;
    }

    // Call login API
    console.log('Login API');
  };

  return (
    <div className={styles.container}>
      <Heading1>{STRINGS.APP_NAME}</Heading1>

      <div className={styles.welcomeSection}>
        <Heading2>Welcome</Heading2>
        <Text2>Please login here</Text2>
      </div>

      <div className={styles.inputSection}>
        <TextInput
          label="Email Address"
          placeholder="Enter email address"
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
        />
        <TextInput
          label="Password"
          placeholder="Enter password"
          type="password"
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
        />
      </div>

      <Button className={styles.button} onClick={handleLogin}>
        <Text1 color="var(--color-white)">Login</Text1>
      </Button>
    </div>
  );
}
