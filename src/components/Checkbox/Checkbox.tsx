/**
 * A reusable checkbox component for capturing and managing boolean user selections.
 *
 * @example
 * ```tsx
 * import Checkbox from '@src/components/Checkbox'
 *
 * export default function Checkbox() {
 *   return <Checkbox label="Hello" />;
 * }
 * ```
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { ErrorText, Text4 } from '../Typography/Typography';
import styles from './Checkbox.module.scss';

/**
 * Define the props available for the Checkbox component.
 */
interface CheckboxProps {
  /**
   * The label displayed next to the checkbox.
   * Can be a string, React element, or any valid ReactNode.
   *
   * @example
   * label="Accept terms"
   * @example
   * label={<span>Custom label element</span>}
   */
  label: ReactNode;

  /**
   * Name attribute of the checkbox input element.
   * Also used to generate a unique `id` for the checkbox if not provided.
   */
  name?: string;

  /**
   * Value attribute of the checkbox input element.
   * Sent as part of form data when the checkbox is checked.
   */
  value?: string;

  /**
   * Whether the checkbox is required in a form.
   * When `true`, form submission will be blocked until this checkbox is checked.
   */
  required?: boolean;

  /**
   * Whether the checkbox is displayed in an indeterminate state.
   * This is a visual state often used to represent a partially selected group.
   */
  indeterminate?: boolean;
  /**
   * Controlled checked state for the checkbox.
   * Use this for fully controlled components where state is managed externally.
   * @default false
   */
  checked?: boolean;

  /**
   * Initial checked state for the checkbox.
   * Use this for uncontrolled components where the checkbox manages its own state.
   */
  defaultChecked?: boolean;

  /**
   * Whether the checkbox is disabled.
   * When `true`, the checkbox cannot be interacted with.
   */
  disabled?: boolean;

  /**
   * Callback fired when the checked state changes.
   * Will not be called if the checkbox is disabled.
   *
   * @param checked - The new checked state of the checkbox.
   * @returns
   */
  onChange?: (checked: boolean) => void;

  /**
   * Additional CSS class names to apply to the root label element.
   */
  className?: string;

  /**
   * Inline CSS styles to apply to the root label element.
   */
  style?: React.CSSProperties;

  /**
   * error message to display below the checkbox.
   */
  error?: string;
}

export default function Checkbox({
  label,
  name,
  value,
  required,
  indeterminate = false,
  checked,
  defaultChecked,
  disabled,
  className,
  onChange,
  style,
  error,
}: CheckboxProps) {
  const checkboxId = name;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    } else if (onChange) {
      onChange(e.target.checked);
    }
  };

  const getLabelContent = () => {
    if (typeof label === 'string' || React.isValidElement(label)) {
      return label;
    }
  };

  return (
    <>
      <label
        data-testid="CheckBoxTest"
        htmlFor={checkboxId}
        className={clsx(styles.checkBoxContainer, className)}
        style={style}
      >
        <input
          ref={inputRef}
          type="checkbox"
          id={checkboxId}
          name={name}
          value={value}
          required={required}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          className={styles.checkbox}
        />
        {label && <Text4>{getLabelContent()}</Text4>}
      </label>
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
}
