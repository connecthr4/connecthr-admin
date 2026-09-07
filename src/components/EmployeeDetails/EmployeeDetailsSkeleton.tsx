/**
 * A skeleton placeholder for the employee details screen, shown while the record is fetched
 * on the server.
 *
 * @example
 * ```tsx
 * import EmployeeDetailsSkeleton from '@src/components/EmployeeDetails/EmployeeDetailsSkeleton'
 *
 * export default function Loading() {
 *   return <EmployeeDetailsSkeleton />;
 * }
 * ```
 */

import clsx from 'clsx';
import AppHeader from '../AppHeader';
import Stepper from '../Stepper';
import styles from './EmployeeDetails.module.scss';
import { PROFILE_ITEMS, ROUTES, STEPS, STRINGS } from '@/src/constants/strings';

/**
 * Roughly a screenful of the personal step, which is the one the details screen opens on.
 */
const SKELETON_FIELD_COUNT = 8;

export default function EmployeeDetailsSkeleton() {
  return (
    <div className={styles.container}>
      {/*
        The chrome is identical to the loaded screen — the steps, the sidebar and the
        breadcrumb trail are the same whichever employee is being opened, so only what the
        record decides is drawn as bones. That keeps the layout from shifting when it lands.

        The heading is one of those bones: this screen is titled after the employee, and that
        name is exactly what has not arrived yet.
      */}
      <AppHeader
        title={<span className={clsx(styles.bone, styles.skeletonHeading)} />}
        breadcrumbs={[{ label: STRINGS.ALL_EMPLOYEES, href: ROUTES.EMPLOYEES }]}
      />

      <div className={styles.content}>
        <div className={styles.profileHeader}>
          <div className={styles.employeeInfo}>
            <div className={clsx(styles.bone, styles.skeletonAvatar)} />

            <div className={styles.details}>
              <div className={clsx(styles.bone, styles.skeletonName)} />

              <div className={styles.columnContainer}>
                <div className={clsx(styles.bone, styles.skeletonMeta)} />
                <div className={clsx(styles.bone, styles.skeletonMeta)} />
              </div>
            </div>
          </div>

          <div className={clsx(styles.bone, styles.skeletonButton)} />
        </div>

        <div className={styles.subContent}>
          <div className={styles.sidebar}>
            <div className={styles.itemContainer}>
              {/* The menu is the same for every employee, so it is drawn in full. */}
              {PROFILE_ITEMS.map(({ label, icon: Icon }) => (
                <div key={label} className={styles.skeletonMenuItem}>
                  <Icon size={24} />

                  <div className={clsx(styles.bone, styles.skeletonMenuLabel)} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.detailsContent}>
            <Stepper currentStep={0} steps={STEPS} />

            <div className={styles.sectionContainer}>
              <div className={styles.section}>
                <div className={clsx(styles.bone, styles.skeletonSectionTitle)} />

                <div className={styles.infoGrid}>
                  {Array.from({ length: SKELETON_FIELD_COUNT }).map((_, index) => (
                    <div className={clsx(styles.infoItem, styles.skeletonInfoItem)} key={index}>
                      <div className={clsx(styles.bone, styles.skeletonLabel)} />
                      <div className={clsx(styles.bone, styles.skeletonValue)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
