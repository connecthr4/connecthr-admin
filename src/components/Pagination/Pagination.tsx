/**
 * A reusable pagination component for navigating through paginated data sets.
 *
 * @example
 * ```tsx
 * import Pagination from '@src/components/Pagination'
 *
 * export default function Pagination() {
 *   return <Pagination label="Hello" />;
 * }
 * ```
 */

import Button from '../Button';
import styles from './Pagination.module.scss';

/**
 * Define the props available for the Pagination component.
 */
interface PaginationProps {
  /**
   *
   */
  currentPage?: number;

  /**
   *
   * @returns
   */
  onPrevious?: () => void;

  /**
   *
   * @returns
   */
  onNext?: () => void;
}

export default function Pagination({ currentPage, onPrevious, onNext }: PaginationProps) {
  return (
    <div className={styles.container}>
      <Button variant="secondary" onChange={onPrevious} className={styles.button}>
        Previous
      </Button>

      <Button variant="secondary" onChange={onNext} className={styles.button}>
        Next
      </Button>
    </div>
  );
}
