/**
 * Reusable and customizable button component with support for variants, styles, and user interactions.
 *
 * @example
 * ```tsx
 * import Button from '@src/components/Button'
 *
 * export default function Button() {
 *   return <Button label="Hello" />;
 * }
 * ```
 */

import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';
import { Text3 } from '../Typography/Typography';
import styles from './Button.module.scss';

/**
 * Define the props available for the Button component.
 */
interface ButtonProps {
  /**
   * The content inside the button.
   * Typically a string or JSX (e.g., <span>Save</span>).
   */
  children: React.ReactNode;

  /**
   * Defines the behavior of the button when clicked.
   * - `button`: Standard clickable button (default).
   * - `submit`: Submits the form it belongs to.
   * - `reset`: Resets all form fields.
   *
   * @default "button"
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * If `true`, disables the button and prevents user interaction.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Callback function triggered when the button is clicked.
   *
   * @param e The mouse click event.
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Icon component (from `lucide-react`) rendered at the **start** of the button.
   */
  startIcon?: LucideIcon;

  /**
   * Icon component (from `lucide-react`) rendered at the **end** of the button.
   */
  endIcon?: LucideIcon;

  /**
   * Size of the start/end icons (in pixels).
   * Passed directly to the Lucide icon component.
   */
  iconSize?: number;

  /**
   * Color of the icons (CSS color value).
   * Accepts named colors, hex, rgb, or CSS variables.
   */
  iconColor?: string;

  /**
   * Additional CSS class names for customizing the button styles.
   * Useful for applying variant-specific styles.
   */
  className?: string;

  /**
   * If `true`, shows a loading spinner inside the button
   * and disables interaction.
   */
  loading?: boolean;

  /**
   * Defines the visual style of the button.
   *
   * @default "primary"
   */
  variant?: 'primary' | 'secondary';
}

export default function Button({
  children,
  type = 'button',
  disabled = false,
  onClick,
  startIcon: StartIcon,
  endIcon: EndIcon,
  iconSize,
  iconColor,
  className,
  loading = false,
  variant = 'primary',
  ...rest
}: ButtonProps) {
  return (
    <button
      data-testid="ButtonTest"
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(styles.button, styles[variant], className)}
      {...rest}
    >
      {loading ? (
        <>
          <span className={styles.loader} />
          <Text3 as="span" className={className} align="center">
            {children}
          </Text3>
        </>
      ) : (
        <>
          {StartIcon && (
            <span className={styles.icon}>
              <StartIcon size={iconSize} color={iconColor} />
            </span>
          )}
          <Text3 as="span" className={className} align="center">
            {children}
          </Text3>
          {EndIcon && (
            <span className={styles.icon}>
              <EndIcon size={iconSize} color={iconColor} />
            </span>
          )}
        </>
      )}
    </button>
  );
}
