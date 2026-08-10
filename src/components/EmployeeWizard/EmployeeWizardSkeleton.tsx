/**
 * A skeleton placeholder for the employee wizard, shown while the record being edited is
 * fetched on the server.
 *
 * @example
 * ```tsx
 * import EmployeeWizardSkeleton from '@src/components/EmployeeWizard/EmployeeWizardSkeleton'
 *
 * export default function Loading() {
 *   return <EmployeeWizardSkeleton />;
 * }
 * ```
 */

import clsx from 'clsx';
import AppHeader from '../AppHeader';
import Stepper from '../Stepper';
import styles from './EmployeeWizard.module.scss';
import { ROUTES, STEPS, STRINGS } from '@/src/constants/strings';

/**
 * Roughly a screenful of the personal step, which is the one the wizard opens on.
 */
const SKELETON_FIELD_COUNT = 8;

export default function EmployeeWizardSkeleton() {
  return (
    <div className={styles.container}>
      {/*
        The chrome is identical to the loaded screen — only the fields are unknown at this
        point, so only the fields are drawn as bones. That keeps the layout from shifting
        when the record arrives.
      */}
      <AppHeader
        title={STRINGS.EDIT_EMPLOYEE}
        breadcrumbs={[{ label: STRINGS.ALL_EMPLOYEES, href: ROUTES.EMPLOYEES }, { label: STRINGS.EDIT_EMPLOYEE }]}
      />

      <div className={styles.content}>
        <Stepper currentStep={0} steps={STEPS} />

        <div className={styles.formContainer}>
          <div className={styles.skeletonForm}>
            <div className={clsx(styles.bone, styles.skeletonSectionTitle)} />

            {Array.from({ length: SKELETON_FIELD_COUNT }).map((_, index) => (
              <div className={styles.skeletonField} key={index}>
                <div className={clsx(styles.bone, styles.skeletonLabel)} />
                <div className={clsx(styles.bone, styles.skeletonInput)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
