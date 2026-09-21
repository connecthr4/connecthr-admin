/**
 * TextArea is a reusable multi-line input that standardizes the styles, label and validation
 * of long-form fields — a reason, a note, a comment — across the application.
 *
 * @example
 * ```tsx
 * import TextArea from '@src/components/TextArea'
 *
 * export default function Example() {
 *   return <TextArea label="Reason for Leaving" rows={4} />;
 * }
 * ```
 */
'use client';

import { useId } from 'react';
import clsx from 'clsx';
import { ErrorText, Label, Text3 } from '../Typography/Typography';
import styles from './TextArea.module.scss';

/**
 * Define the props available for the TextArea component.
 *
 * Mirrors {@link TextInput}'s API so the two fields are interchangeable in a form config,
 * minus what only a single-line input can do (`type`, the password toggle, the icons).
 *
 * `aria-label` comes in through `AriaAttributes` so a field with no visible `label` still
 * has an accessible name.
 */
interface TextAreaProps extends Pick<React.AriaAttributes, 'aria-label'> {
  /**
   * The unique identifier for the textarea element, which the label points at. One is
   * generated when it is left out, so the label names the field either way — a form config
   * that only declares a label still gets an accessible field.
   */
  id?: string;

  /**
   * The name of the field. Used for form submissions and identifying form data.
   */
  name?: string;

  /**
   * The text label displayed above the field.
   */
  label?: string | React.ReactNode;

  /**
   * The error message to display when validation fails, shown below the field.
   */
  error?: string;

  /**
   * The placeholder text displayed while the field is empty.
   */
  placeholder?: string;

  /**
   * The current value of the field. Used in controlled components.
   */
  value?: string;

  /**
   * The default value of the field (uncontrolled). Use `value` for controlled components.
   */
  defaultValue?: string;

  /**
   * How many lines of text the field shows before it starts to scroll. It stays resizable
   * vertically, so this is the starting height rather than a cap.
   *
   * @default 4
   */
  rows?: number;

  /**
   * Whether the field should be disabled.
   */
  disabled?: boolean;

  /**
   * Whether the field is required before form submission.
   */
  required?: boolean;

  /**
   * The maximum number of characters the user can enter.
   */
  maxLength?: number;

  /**
   * Whether the field is read-only.
   */
  readOnly?: boolean;

  /**
   * Additional CSS class names for the field wrapper.
   */
  className?: string;

  /**
   * Additional CSS class names for the textarea itself.
   */
  textAreaClassName?: string;

  /**
   * Event handler triggered when the value changes.
   */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;

  /**
   * Event handler triggered when the field loses focus — what react-hook-form's `register`
   * uses to mark the field as touched.
   */
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
}

export default function TextArea({
  id,
  name,
  label,
  error,
  placeholder,
  value,
  defaultValue,
  rows = 4,
  disabled = false,
  required = false,
  maxLength,
  readOnly = false,
  className,
  textAreaClassName,
  onChange,
  onBlur,
  ...rest
}: TextAreaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div data-testid="TextAreaTest" className={clsx(styles.container, className)}>
      {label && (
        <Label htmlFor={fieldId}>
          {label} {required && <Text3 className={styles.asterisk}>*</Text3>}
        </Label>
      )}

      <div className={styles.fieldWrapper}>
        <textarea
          id={fieldId}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          className={clsx(styles.field, textAreaClassName)}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          readOnly={readOnly}
          onChange={onChange}
          onBlur={onBlur}
          {...rest}
        />
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
