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
}

export default function SearchInput({ placeholder = 'Search' }: SearchInputProps) {
  return (
    <div className={styles.container}>
      <TextInput
        placeholder={placeholder}
        leftIcon={<Search height={24} width={24} />}
        rightIcon={<X height={24} width={24} onClick={() => {}} />}
      />
    </div>
  );
}
