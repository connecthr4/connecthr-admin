/**
 * A controlled input component for capturing and submitting user search queries.
 *
 * @example
 * ```tsx
 * import SearchInput from '@src/components/SearchInput'
 *
 * export default function SearchInput() {
 *   return <SearchInput label="Hello" />;
 * }
 * ```
 */
'use client';

import TextInput from '../TextInput';
import { Search, X } from 'lucide-react';
import styles from './SearchInput.module.scss';

/**
 * Define the props available for the SearchInput component.
 */
interface SearchInputProps {
  /**
   *
   */
  placeholder?: string;

  /**
   * The current search query (controlled).
   */
  value?: string;

  /**
   * Called with the raw input value on every keystroke.
   */
  onChange?: (value: string) => void;

  /**
   * Called when the clear (X) icon is clicked. Defaults to clearing via `onChange('')`.
   */
  onClear?: () => void;
}

export default function SearchInput({ placeholder = 'Search', value, onChange, onClear }: SearchInputProps) {
  return (
    <div className={styles.container}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        leftIcon={<Search height={24} width={24} />}
        rightIcon={
          value ? <X height={24} width={24} onClick={() => (onClear ? onClear() : onChange?.(''))} /> : undefined
        }
      />
    </div>
  );
}
