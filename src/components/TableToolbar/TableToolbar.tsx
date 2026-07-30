/**
 * A reusable toolbar for data tables — pairs a search input with a filter
 * trigger, and accepts extra module-specific actions (e.g. an "Add New"
 * button) as children.
 *
 * @example
 * ```tsx
 * import TableToolbar from '@src/components/TableToolbar'
 *
 * <TableToolbar searchValue={search} onSearchChange={setSearch} onFilterClick={openFilters}>
 *   <Button startIcon={CirclePlus}>Add New Employee</Button>
 * </TableToolbar>
 * ```
 */
'use client';

import { SlidersHorizontal } from 'lucide-react';
import Button from '../Button';
import SearchInput from '../SearchInput';
import styles from './TableToolbar.module.scss';

/**
 * Define the props available for the TableToolbar component.
 */
interface TableToolbarProps {
  /**
   * The current search query (controlled).
   */
  searchValue?: string;

  /**
   * Called with the raw input value on every keystroke.
   */
  onSearchChange?: (value: string) => void;

  /**
   * Placeholder text for the search input.
   */
  searchPlaceholder?: string;

  /**
   * Called when the filter button is clicked.
   */
  onFilterClick?: () => void;

  /**
   * Module-specific actions (e.g. an "Add New" button), rendered between
   * the search input and the filter button.
   */
  children?: React.ReactNode;
}

export default function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onFilterClick,
  children,
}: TableToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <div className={styles.search}>
          <SearchInput placeholder={searchPlaceholder} value={searchValue} onChange={onSearchChange} />
        </div>

        <Button
          startIcon={SlidersHorizontal}
          variant="secondary"
          onClick={onFilterClick}
          className={styles.filterButton}
          startIconColor="var(--color-black)"
        >
          Filter
        </Button>
      </div>

      <div className={styles.right}>{children}</div>
    </div>
  );
}
