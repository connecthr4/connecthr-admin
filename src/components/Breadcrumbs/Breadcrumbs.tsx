/**
 * Reusable breadcrumb navigation component that displays the user&#x27;s current location within the application hierarchy and provides quick navigation to parent pages.
 *
 * @example
 * ```tsx
 * import Breadcrumbs from '@src/components/Breadcrumbs'
 *
 * <Breadcrumbs
 *   items={[
 *     { label: 'All Employees', href: '/employees' },
 *     { label: 'Add New Employee' },
 *   ]}
 * ```
 */

import { Text2 } from '../Typography';
import { ChevronRight } from 'lucide-react';
import styles from './Breadcrumbs.module.scss';
import AppLink from '../AppLink';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Define the props available for the Breadcrumbs component.
 */
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.container} aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.label} className={styles.item}>
            {item.href && !isLast ? (
              <AppLink href={item.href}>
                <Text2 className={styles.link}>{item.label}</Text2>
              </AppLink>
            ) : (
              <Text2 className={styles.current}>{item.label}</Text2>
            )}

            {!isLast && <ChevronRight size={20} className={styles.separator} />}
          </div>
        );
      })}
    </nav>
  );
}
