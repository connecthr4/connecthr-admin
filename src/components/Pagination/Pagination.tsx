/**
 * A reusable pagination component for navigating through paginated data sets.
 *
 * @example
 * ```tsx
 * import Pagination from '@src/components/Pagination'
 *
 * export default function Pagination() {
 *   return <Pagination currentPage={1} totalPages={6} onPageChange={setPage} />;
 * }
 * ```
 */

import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.scss';

const MAX_VISIBLE_PAGES = 5;

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(MAX_VISIBLE_PAGES / 2);
  const end = Math.min(totalPages, Math.max(currentPage + half, MAX_VISIBLE_PAGES));
  const start = end - MAX_VISIBLE_PAGES + 1;

  return Array.from({ length: MAX_VISIBLE_PAGES }, (_, index) => start + index);
}

/**
 * Define the props available for the Pagination component.
 */
interface PaginationProps {
  /**
   * The currently active page (1-indexed).
   */
  currentPage: number;

  /**
   * Total number of pages available.
   */
  totalPages: number;

  /**
   * Called with the 1-indexed page number the user navigated to.
   */
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 0) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className={styles.container}>
      <button
        type="button"
        aria-label="Previous page"
        className={styles.navButton}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} />
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === currentPage ? 'page' : undefined}
          className={clsx(styles.pageButton, page === currentPage && styles.pageButtonActive)}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label="Next page"
        className={styles.navButton}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
