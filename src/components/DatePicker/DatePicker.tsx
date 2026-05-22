/**
 * A customizable date picker that integrates easily with forms and supports themes, disabled dates, and validation.
 *
 * @example
 * ```tsx
 * import DatePicker from '@src/components/DatePicker'
 *
 * export default function DatePicker() {
 *   return <DatePicker label="Hello" />;
 * }
 * ```
 */

import styles from './DatePicker.module.scss';

/**
 * Define the props available for the DatePicker component.
 */
interface DatePickerProps {
  label?: string;
}

export default function DatePicker({ label = 'label' }: DatePickerProps) {
  return (
    <div className={styles.container}>
      DatePicker component - {label}
    </div>
  );
}
