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

import { CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { ErrorText, Label, Text3 } from '../Typography/Typography';
import { ChevronDown, Loader2, Search } from 'lucide-react';
import styles from './Dropdown.module.scss';

export interface DropdownOption {
  label: string;
  value: string;
}

/** The gap between the trigger and its menu, matching `.menu`'s own offset. */
const MENU_GAP = 6;

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

  /** Extra class names for the field, for sizing it to where it sits. */
  className?: string;

  /**
   * Renders the menu into `document.body`, positioned against the trigger and
   * kept there while the page scrolls. For a dropdown inside a scrolling
   * container — a table cell — whose `overflow` would otherwise clip it.
   */
  portalMenu?: boolean;

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
  className,
  portalMenu = false,
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [openUpward, setOpenUpward] = useState(false);

  /** Only used by a portalled menu, which has no positioned parent to sit in. */
  const [menuStyle, setMenuStyle] = useState<CSSProperties>();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search, searchable]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const trigger = wrapperRef.current;
    const menu = menuRef.current;

    if (!trigger || !menu) {
      return;
    }

    const position = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const upward = spaceBelow < menu.offsetHeight && spaceAbove > spaceBelow;

      setOpenUpward(upward);

      /*
      A portalled menu sits in the body rather than beside its trigger, so the
      `.menu` / `.menuUp` offsets cannot place it — every edge is set here, and
      both of top and bottom are always written so neither is left to the class.
      */
      if (portalMenu) {
        setMenuStyle({
          position: 'fixed',
          width: triggerRect.width,
          left: triggerRect.left,
          top: upward ? 'auto' : triggerRect.bottom + MENU_GAP,
          bottom: upward ? window.innerHeight - triggerRect.top + MENU_GAP : 'auto',
        });
      }
    };

    position();

    if (!portalMenu) {
      return;
    }

    /*
    Captured, so the menu follows a scroll of any container it hangs over — the
    table it was opened in included, not just the window.
    */
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);

    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [isOpen, filteredOptions.length, portalMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      /* A portalled menu is outside the wrapper, so it has to be excused too. */
      if (menuRef.current?.contains(target)) {
        return;
      }

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
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

  const menu = isOpen && !isLoading && (
    <div
      ref={menuRef}
      className={clsx(styles.menu, openUpward && !portalMenu && styles.menuUp)}
      style={portalMenu ? menuStyle : undefined}
    >
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
  );

  return (
    <div className={clsx(styles.container, className)}>
      {label && (
        <Label>
          {label} {required && <Text3 className={styles.asterisk}>*</Text3>}
        </Label>
      )}

      <div ref={wrapperRef} className={styles.dropdown}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="dropdown-menu"
          disabled={disabled || isLoading}
          className={clsx(styles.trigger)}
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

        {portalMenu ? menu && createPortal(menu, document.body) : menu}
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
