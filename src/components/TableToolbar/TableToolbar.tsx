/**
 * A reusable toolbar for data tables — pairs a search input with a filter
 * trigger, and accepts extra module-specific actions (e.g. an "Add New"
 * button) as children.
 *
 * @example
 * ```tsx
 * import TableToolbar from '@src/components/TableToolbar'
 *
 * <TableToolbar
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   filterOptions={filterOptions}
 *   onFilterChange={setFilters}
 * >
 *   <Button startIcon={CirclePlus}>Add New Employee</Button>
 * </TableToolbar>
 * ```
 */
'use client';

import SearchInput from '../SearchInput';
import FilterPopover, { type FilterSelection } from '../FilterPopover';
import styles from './TableToolbar.module.scss';
import type { FilterOptions } from '@/src/lib/types/filters';

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
   * Selectable filter values keyed by field, as returned by
   * `/filters/:module`. Each key becomes a section in the filter popover;
   * omitting it renders the popover with no filters.
   */
  filterOptions?: FilterOptions;

  /**
   * Called with the selection when the user applies filters in the popover.
   */
  onFilterChange?: (selection: FilterSelection) => void;

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
  filterOptions,
  onFilterChange,
  children,
}: TableToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <div className={styles.search}>
          <SearchInput placeholder={searchPlaceholder} value={searchValue} onChange={onSearchChange} />
        </div>

        <FilterPopover filterOptions={filterOptions} onFilterChange={onFilterChange} />
      </div>

      <div className={styles.right}>{children}</div>
    </div>
  );
}
