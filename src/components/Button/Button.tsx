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

import styles from './Button.module.scss';

/**
 * Define the props available for the Button component.
 */
interface ButtonProps {
  label?: string;
}

export default function Button({ label = 'label' }: ButtonProps) {
  return <div className={styles.container}>Button component - {label}</div>;
}
