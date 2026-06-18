/**
 * A reusable form component that allows users to select a single option from a list of predefined choices.
 *
 * @example
 * ```tsx
 * import Dropdown from '@src/components/Dropdown'
 *
 * export default function Dropdown() {
 *   return <Dropdown label="Hello" />;
 * }
 * ```
 */

import clsx from 'clsx';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Label, Text3 } from '../Typography/Typography';
import styles from './Dropdown.module.scss';

export interface DropdownOption {
  label: string;
  value: string;
}

/**
 * Define the props available for the Dropdown component.
 */
interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  searchable?: boolean;
  onChange?: (value: string) => void;
}

export default function Dropdown({
  label,
  placeholder = 'Select an option',
  options,
  value,
  error,
  disabled,
  required,
  isLoading,
  searchable = false,
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onChange?.(value);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={styles.container}>
      {label && (
        <Label>
          {label}
          {required && <Text3 className={styles.asterisk}>*</Text3>}
        </Label>
      )}

      <div ref={wrapperRef} className={styles.dropdown}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="dropdown-menu"
          disabled={disabled || isLoading}
          className={clsx(styles.trigger, error && styles.triggerError)}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className={clsx(styles.triggerLabel, !selectedOption && styles.placeholder)}>
            {selectedOption?.label ?? placeholder}
          </span>

          {isLoading ? (
            <Loader2 size={18} className={styles.spinner} />
          ) : (
            <ChevronDown size={18} className={clsx(styles.chevron, isOpen && styles.chevronRotate)} />
          )}
        </button>

        {isOpen && !isLoading && (
          <div className={styles.menu}>
            {searchable && (
              <div className={styles.searchBox}>
                <Search size={16} />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className={styles.searchInput}
                />
              </div>
            )}

            <div className={styles.options}>
              {filteredOptions.length === 0 ? (
                <div className={styles.emptyState}>No results found</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={clsx(styles.option, isSelected && styles.selectedOption)}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span>{option.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <Text3 className={styles.errorText}>{error}</Text3>}
    </div>
  );
}
